'use client'

import { useEffect, useState, useCallback, useRef, memo } from 'react'
import { useParams } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase, Post, Profile } from '@/lib/supabaseClient'
import { followUser, unfollowUser, checkIfFollowing } from '@/lib/postActions'
import PostCard from '@/components/PostCard'
import { User as UserIcon, Loader2, Grid, UserPlus, UserMinus, Settings, LayoutGrid, List, Heart, MessageCircle, Play } from 'lucide-react'
import Link from 'next/link'

function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followError, setFollowError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const subscriptionRef = useRef<{
    posts: ReturnType<typeof supabase.channel>,
    follows: ReturnType<typeof supabase.channel>
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setCurrentUser(session?.user ?? null)

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
        } else {
          setProfile(profileData)
        }

        // Fetch posts with simplified query to avoid foreign key issues
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (postsError) {
          console.error('Posts fetch error:', postsError)
          setPosts([]) // Ensure posts is always an array
        } else {
          // If posts exist, fetch additional data for each post
          if (postsData && postsData.length > 0) {
            const enrichedPosts = await Promise.all(
              postsData.map(async (post) => {
                // Get profile for this post's user
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('username, avatar_url')
                  .eq('id', post.user_id)
                  .single()

                // Get likes for this post
                const { data: likes } = await supabase
                  .from('likes')
                  .select('*')
                  .eq('post_id', post.id)

                // Get comments for this post
                const { data: comments } = await supabase
                  .from('comments')
                  .select('*')
                  .eq('post_id', post.id)
                  .order('created_at', { ascending: true })

                // Get reposts for this post
                const { data: reposts } = await supabase
                  .from('reposts')
                  .select('*')
                  .eq('original_post_id', post.id)

                return {
                  ...post,
                  profiles: profile || { username: 'Unknown', avatar_url: null },
                  likes: likes || [],
                  comments: comments || [],
                  reposts: reposts || []
                }
              })
            )
            
            setPosts(enrichedPosts as Post[])
          } else {
            setPosts(postsData || []) // Ensure posts is always an array
          }
        }

        // Fetch user statistics
        const { data: followersData } = await supabase
          .from('follows')
          .select('*')
          .eq('following_id', userId)

        const { data: followingData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', userId)

        setStats({
          postsCount: postsData?.length || 0,
          followersCount: followersData?.length || 0,
          followingCount: followingData?.length || 0
        })

        // Check if current user is following this profile
        if (session?.user && session.user.id !== userId) {
          const following = await checkIfFollowing(userId)
          setIsFollowing(following)
        }
      } catch (error) {
        console.error('Error:', error)
        setPosts([]) // Ensure posts is always an array even on error
      } finally {
        setLoading(false)
      }
    }

    if (userId) fetchData()
  }, [userId])

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to posts changes for this user
    const postsSubscription = supabase
      .channel(`posts-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          // Fetch the new post with all related data
          const { data: newPost } = await supabase
            .from('posts')
            .select(`
              *,
              profiles:user_id(username, avatar_url),
              likes(*),
              comments(*),
              reposts(*)
            `)
            .eq('id', payload.new.id)
            .single()
          
          if (newPost) {
            setPosts(prev => [newPost, ...prev])
            setStats(prev => ({ ...prev, postsCount: prev.postsCount + 1 }))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setPosts(prev => prev.filter(post => post.id !== payload.old.id))
          setStats(prev => ({ ...prev, postsCount: prev.postsCount - 1 }))
        }
      )
      .subscribe()

    // Subscribe to follows changes
    const followsSubscription = supabase
      .channel(`follows-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${userId}`
        },
        () => {
          // Update followers count
          setStats(prev => ({ ...prev, followersCount: prev.followersCount + 1 }))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${userId}`
        },
        () => {
          // Update followers count
          setStats(prev => ({ ...prev, followersCount: prev.followersCount - 1 }))
        }
      )
      .subscribe()

    // Store subscriptions for cleanup
    subscriptionRef.current = {
      posts: postsSubscription,
      follows: followsSubscription
    }

    return () => {
      // Clean up subscriptions
      if (subscriptionRef.current) {
        subscriptionRef.current.posts.unsubscribe()
        subscriptionRef.current.follows.unsubscribe()
      }
    }
  }, [userId])

  const handleFollowToggle = async () => {
    if (!currentUser) {
      return
    }

    setFollowLoading(true)
    setFollowError(null)
    
    try {
      console.log('Follow toggle:', { isFollowing, userId, currentUserId: currentUser.id })
      
      if (isFollowing) {
        console.log('Attempting to unfollow user:', userId)
        await unfollowUser(userId)
        setIsFollowing(false)
        setStats((prev) => ({ ...prev, followersCount: prev.followersCount - 1 }))
        console.log('Successfully unfollowed user')
      } else {
        console.log('Attempting to follow user:', userId)
        await followUser(userId)
        setIsFollowing(true)
        setStats((prev) => ({ ...prev, followersCount: prev.followersCount + 1 }))
        console.log('Successfully followed user')
      }
    } catch (error: unknown) {
      console.error('Error toggling follow:', error)
      
      // Handle specific errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (errorMessage.includes('relation "follows" does not exist')) {
        setFollowError('Follow feature is not set up. Please run the database setup script.')
      } else if (errorMessage.includes('RLS') || errorMessage.includes('policy')) {
        setFollowError('Permission denied. Please ensure you are logged in and the database is properly configured.')
      } else if (errorMessage.includes('foreign key')) {
        setFollowError('Invalid user reference. Please refresh the page and try again.')
      } else {
        setFollowError(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user: ${errorMessage}`)
      }
    } finally {
      setFollowLoading(false)
    }
  }

  const handlePostDelete = useCallback((postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
    setStats(prevStats => ({
      ...prevStats,
      postsCount: prevStats.postsCount - 1
    }))
  }, [])

  // Check if a post is a video based on media_type or file extension
  const isVideoPost = (post: Post) => {
    return post.media_type === 'video' || post.image_url?.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-border/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Profile not found</h1>
          <Link href="/" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
            Go back to feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
        {/* Profile Header */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg hover:shadow-xl transition-all duration-300 lift">
          <div className="flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-8">
            <div 
              className="relative mx-auto sm:mx-0 cursor-pointer transform transition-transform duration-300 hover:scale-105"
              onClick={() => window.location.reload()}
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center ring-4 ring-border/50 overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-card animate-pulse"></div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent animate-fade-in">
                  {profile.username || 'Anonymous'}
                </h1>
                
                {/* Follow/Edit Button */}
                {currentUser && currentUser.id === userId ? (
                  <Link
                    href={`/profile/${userId}/edit`}
                    className="inline-flex items-center space-x-2 px-4 py-2 border border-border bg-secondary/50 text-foreground rounded-xl hover:bg-secondary transition-all duration-200 font-medium lift"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Link>
                ) : currentUser ? (
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 font-semibold lift ${
                        isFollowing
                          ? 'bg-secondary text-foreground hover:bg-destructive/10 hover:text-destructive border border-border'
                          : 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-lg hover:scale-[1.02]'
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isFollowing ? (
                        <UserMinus className="h-4 w-4" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      <span>{followLoading ? 'Processing...' : (isFollowing ? 'Unfollow' : 'Follow')}</span>
                    </button>
                    
                    {/* Chat button */}
                    <Link
                      href={`/messages?user=${userId}`}
                      className="flex items-center space-x-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-primary-foreground rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-semibold lift"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Message</span>
                    </Link>
                    
                    {/* Follow Error Display */}
                    {followError && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive backdrop-blur-sm animate-fade-in">
                        <p className="font-medium">Follow Error:</p>
                        <p>{followError}</p>
                        {followError.includes('database setup') && (
                          <p className="mt-1 text-primary">
                            Please check the FIX_COMMENTS_AND_FOLLOWS.md file for setup instructions.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
              
              {/* User Statistics */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-6">
                <div className="text-center p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors duration-200 lift">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.postsCount}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Posts</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors duration-200 lift">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.followersCount}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Followers</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors duration-200 lift">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.followingCount}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Following</div>
                </div>
              </div>
              
              {/* Bio */}
              {profile.bio && (
                <div className="p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors duration-200 lift">
                  <p className="text-foreground leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-4 sm:p-6 lift">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center space-x-2">
              <Grid className="h-5 w-5 text-primary animate-pulse" />
              <span>Posts</span>
            </h2>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-muted/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground shadow lift' 
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground shadow lift' 
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {(!posts || posts.length === 0) ? (
            <div className="text-center py-12 sm:py-16 animate-fade-in">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-secondary/30 rounded-full blur-xl opacity-50"></div>
                <Grid className="relative h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground text-sm sm:text-base">When {profile.username || 'this user'} shares photos, they&apos;ll appear here.</p>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative lift"
                  onClick={() => window.location.href = `/post/${post.id}`}
                >
                  {isVideoPost(post) ? (
                    <div className="relative w-full h-full">
                      <video 
                        src={post.image_url} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <img 
                        src={post.image_url} 
                        alt={post.caption || 'Post image'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex space-x-4 text-white">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-6 w-6" />
                            <span className="font-semibold">{post.likes?.length || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-6 w-6" />
                            <span className="font-semibold">{post.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="animate-fade-in">
                  <PostCard post={post} currentUser={currentUser} onPostDelete={handlePostDelete} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ProfilePage)