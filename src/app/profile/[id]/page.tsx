'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { PageLoader } from '@/components/Loading'
import { Grid, Bookmark, PlayCircle, Settings, Plus, Camera } from 'lucide-react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [stats, setStats] = useState({
    postsCount: 0,
    followersCount: 5,
    followingCount: 38
  })
  const [activeTab, setActiveTab] = useState('posts')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        setCurrentUser(session?.user ?? null)
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()
        
        if (profileError) throw profileError
        setProfile(profileData)
        
        // Get user posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false })
        
        if (postsError) throw postsError
        setPosts(postsData || [])
        setStats(prev => ({ ...prev, postsCount: postsData?.length || 0 }))
        
        // Check if following
        if (session?.user) {
          const { data: followData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', session.user.id)
            .eq('following_id', id)
            .single()
          
          setIsFollowing(!!followData)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [id])
  
  const handleFollow = async () => {
    if (!currentUser) return
    
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', id)
        
        setStats(prev => ({ ...prev, followersCount: prev.followersCount - 1 }))
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: currentUser.id, following_id: id })
        
        setStats(prev => ({ ...prev, followersCount: prev.followersCount + 1 }))
      }
      
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error following/unfollowing:', error)
    }
  }
  
  if (loading) return <PageLoader />
  
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <p className="text-muted-foreground">The user you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    )
  }
  
  const isOwnProfile = currentUser?.id === id
  
  return (
    <div className="profile-page">
      {/* Profile header */}
      <header className="profile-header">
        <img
          src={profile.avatar_url || "https://via.placeholder.com/150"}
          alt={profile.username || "user"}
          className="profile-avatar"
        />
        
        <div className="profile-info">
          <div className="profile-username">
            <h1 className="profile-name">7.ahmad77</h1>
            
            {isOwnProfile ? (
              <div className="flex gap-2">
                <button className="profile-edit-button">Edit profile</button>
                <button className="profile-edit-button">
                  <Settings size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  className={`px-6 py-2 rounded font-semibold ${
                    isFollowing 
                      ? 'bg-secondary text-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="profile-edit-button">Message</button>
              </div>
            )}
          </div>
          
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-count">{stats.postsCount}</span> posts
            </div>
            <div className="profile-stat">
              <span className="profile-stat-count">{stats.followersCount}</span> followers
            </div>
            <div className="profile-stat">
              <span className="profile-stat-count">{stats.followingCount}</span> following
            </div>
          </div>
          
          <div className="profile-bio">
            {profile.bio || 'No bio yet.'}
          </div>
        </div>
      </header>
      
      {/* New highlight section */}
      <div className="stories-container justify-start pl-8 pr-4 pb-8 border-b border-border">
        <div className="story-item">
          <div className="w-20 h-20 rounded-full flex items-center justify-center border border-border">
            <Plus size={32} className="text-muted-foreground" />
          </div>
          <span className="story-username">New</span>
        </div>
      </div>
      
      {/* Profile tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <Grid size={12} className="mr-1" />
          Posts
        </button>
        <button
          className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark size={12} className="mr-1" />
          Saved
        </button>
        <button
          className={`profile-tab ${activeTab === 'tagged' ? 'active' : ''}`}
          onClick={() => setActiveTab('tagged')}
        >
          <PlayCircle size={12} className="mr-1" />
          Reels
        </button>
      </div>
      
      {/* Posts grid */}
      {activeTab === 'posts' && (
        <div className="profile-grid">
          {posts.length === 0 ? (
            <div className="col-span-3 py-20 text-center">
              <div className="border border-border rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Camera size={32} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Share Photos</h2>
              <p className="text-muted-foreground">
                When you share photos, they will appear on your profile.
              </p>
              <button className="mt-4 text-primary font-semibold">
                Share your first photo
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="profile-post">
                <img src={post.image_url} alt={post.caption || 'Post'} />
              </div>
            ))
          )}
        </div>
      )}
      
      {activeTab === 'saved' && (
        <div className="col-span-3 py-20 text-center">
          <p className="text-muted-foreground">Only you can see what you've saved</p>
        </div>
      )}
      
      {activeTab === 'tagged' && (
        <div className="col-span-3 py-20 text-center">
          <p className="text-muted-foreground">No reels yet</p>
        </div>
      )}
    </div>
  )
}
