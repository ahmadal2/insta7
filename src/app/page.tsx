'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Post } from '@/lib/supabaseClient'
import { getPublicFeed, getFollowingFeed } from '@/lib/postActions'
import PostCard from '@/components/PostCard'
import { PostSkeleton, PageLoader } from '@/components/Loading'
import { Camera, Plus, Globe, Users } from 'lucide-react'
import Link from 'next/link'

// Disable static generation and force dynamic rendering
export const dynamic = 'force-dynamic'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [feedType, setFeedType] = useState<'public' | 'following'>('public')

  const fetchPosts = useCallback(async (type: 'public' | 'following' = 'public') => {
    setPostsLoading(true)
    try {
      console.log(`Fetching ${type} feed...`)
      
      let postsData
      if (type === 'following' && user) {
        // Try to get following feed first
        try {
          postsData = await getFollowingFeed(20, 0)
        } catch (followingError) {
          console.warn('Following feed failed, falling back to public:', followingError)
          postsData = await getPublicFeed(20, 0)
        }
      } else {
        // Fallback to manual enrichment if advanced functions fail
        try {
          postsData = await getPublicFeed(20, 0)
        } catch (publicError) {
          console.warn('Public feed function failed, using manual method:', publicError)
          
          // Manual fallback - same as before
          const { data: basicPosts, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching posts:', error)
            return
          }

          if (basicPosts && basicPosts.length > 0) {
            const enrichedPosts = await Promise.all(
              basicPosts.map(async (post) => {
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
                  .select('*, profiles(username, avatar_url)')
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
            
            postsData = enrichedPosts
          } else {
            postsData = basicPosts || []
          }
        }
      }

      console.log('Posts fetched successfully:', postsData)
      setPosts(postsData as Post[])
    } catch (err) {
      console.error('Unexpected error in fetchPosts:', err)
      setPosts([])
    } finally {
      setPostsLoading(false)
    }
  }, [user])

  useEffect(() => {
    const getSessionAndPosts = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        // Fetch posts based on current feed type
        await fetchPosts(feedType)
      } catch (err) {
        console.error('Unexpected error in getSessionAndPosts:', err)
      }

      setLoading(false)
    }

    getSessionAndPosts()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [feedType, fetchPosts])

  // Effect to refetch posts when feed type changes
  useEffect(() => {
    if (!loading) {
      fetchPosts(feedType)
    }
  }, [feedType, loading, fetchPosts])

  const handleFeedSwitch = (type: 'public' | 'following') => {
    setFeedType(type)
  }

  const handlePostDelete = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-2xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
        {/* Welcome Section */}
        {!user && (
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl opacity-50"></div>
              <Camera className="relative h-16 w-16 text-primary mx-auto mb-4 drop-shadow-sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Welcome to AhmadInsta
            </h1>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Share your moments with the world
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium backdrop-blur-sm"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-6 py-3 border border-border bg-card/50 text-foreground rounded-xl hover:bg-secondary/50 hover:shadow-md hover:scale-105 transition-all duration-200 font-medium backdrop-blur-sm"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* Feed Type Switcher for logged in users */}
        {user && (
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-2 mb-6 shadow-lg">
            <div className="flex space-x-1">
              <button
                onClick={() => handleFeedSwitch('public')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 flex-1 justify-center font-medium ${
                  feedType === 'public'
                    ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg scale-105'
                    : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Public Feed</span>
                <span className="sm:hidden">Public</span>
              </button>
              <button
                onClick={() => handleFeedSwitch('following')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 flex-1 justify-center font-medium ${
                  feedType === 'following'
                    ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg scale-105'
                    : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                }`}
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Following</span>
                <span className="sm:hidden">Follow</span>
              </button>
            </div>
          </div>
        )}

        {/* Create Post Button for logged in users */}
        {user && (
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <Link
              href="/upload"
              className="flex items-center justify-center space-x-2 w-full py-4 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold group"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>Create New Post</span>
            </Link>
          </div>
        )}

        {/* Posts Feed */}
        {postsLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <PostSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 sm:p-8 text-center shadow-lg">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-secondary/30 rounded-full blur-xl opacity-50"></div>
              <Camera className="relative h-12 w-12 text-muted-foreground mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No posts yet
            </h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              {feedType === 'following' ? 'No posts from people you follow yet.' : 'Be the first to share a moment!'}
            </p>
            {user && (
              <Link
                href="/upload"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium group"
              >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
                <span>Create Post</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post: Post) => (
              <PostCard key={post.id} post={post} currentUser={user} onPostDelete={handlePostDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
