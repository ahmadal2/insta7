'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Post } from '@/lib/supabaseClient'
import { getPublicFeed, getFollowingFeed } from '@/lib/postActions'
import StoriesCarousel from '@/components/StoriesCarousel'
import PostCard from '@/components/PostCard'
import SuggestedUsers from '@/components/SuggestedUsers'
import { PageLoader, PostSkeleton } from '@/components/Loading'

// Disable static generation and force dynamic rendering
export const dynamic = 'force-dynamic'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you')
  
  // Track the subscription to ensure we only unsubscribe when it's available
  const [authSubscription, setAuthSubscription] = useState<{ unsubscribe: () => void } | null>(null)

  // Fetch posts
  const fetchPosts = useCallback(async (
    type: 'public' | 'following' = 'public',
  ) => {
    setPostsLoading(true)

    const limit = 5
    const offset = 0
    
    try {
      let postsData: Post[] = []
      
      if (type === 'following' && user) {
        try {
          postsData = await getFollowingFeed(limit, offset)
        } catch (followingError) {
          console.warn('Following feed failed, falling back to public:', followingError)
          postsData = await getPublicFeed(limit, offset)
        }
      } else {
        postsData = await getPublicFeed(limit, offset)
      }

      setPosts(postsData)
      
    } catch (err) {
      console.error('Error fetching posts:', err)
      setPosts([])
    }
    
    setPostsLoading(false)
  }, [user])

  // Initial load effect
  useEffect(() => {
    const getSessionAndPosts = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        // Fetch initial posts
        await fetchPosts(activeTab === 'for-you' ? 'public' : 'following')
      } catch (err) {
        console.error('Unexpected error in getSessionAndPosts:', err)
      }

      setLoading(false)
    }

    getSessionAndPosts()

    // Listen for auth changes with improved error handling
    try {
      const { data } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null)
        }
      )
      
      // Store the subscription safely
      if (data && data.subscription) {
        setAuthSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Error setting up auth listener:', error)
    }

    // Cleanup function with better error handling
    return () => {
      if (authSubscription && typeof authSubscription.unsubscribe === 'function') {
        try {
          authSubscription.unsubscribe()
        } catch (error) {
          console.warn('Error unsubscribing from auth state change:', error)
        }
      }
    }
  }, [fetchPosts, activeTab])

  // Effect for tab changes
  useEffect(() => {
    if (!loading) {
      fetchPosts(activeTab === 'for-you' ? 'public' : 'following')
    }
  }, [activeTab, loading, fetchPosts])

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="flex">
      {/* Main feed */}
      <div className="flex-1 max-w-[630px] mx-auto px-0 sm:px-2">
        {/* Feed tabs */}
        <div className="px-3 pt-5 pb-3 flex justify-center space-x-10 border-b border-border">
          <button 
            className={`font-semibold text-base ${activeTab === 'for-you' ? 'text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('for-you')}
          >
            For you
          </button>
          <button 
            className={`font-semibold text-base ${activeTab === 'following' ? 'text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
        </div>

        {/* Stories */}
        <StoriesCarousel />

        {/* Posts feed */}
        <div className="px-0 sm:px-4 space-y-6">
          {postsLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <PostSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No posts to show</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} post={post} currentUser={user} />
            ))
          )}
        </div>
      </div>

      {/* Right sidebar - only shown on larger screens */}
      <div className="hidden lg:block w-[350px] pl-8 pt-8 pr-4">
        {user && (
          <div className="flex items-center mb-5">
            <img 
              src={user.user_metadata?.avatar_url || "https://via.placeholder.com/150"} 
              alt={user.user_metadata?.username || "user"} 
              className="w-12 h-12 rounded-full mr-4" 
            />
            <div>
              <p className="font-semibold text-sm">{user.user_metadata?.username || user.email?.split('@')[0] || '7.ahmad77'}</p>
              <p className="text-muted-foreground text-sm">{user.user_metadata?.full_name || ''}</p>
            </div>
            <button className="ml-auto text-primary text-xs font-semibold">Switch</button>
          </div>
        )}
        
        <SuggestedUsers />
        
        <div className="instagram-footer">
          <div className="footer-links">
            <span className="footer-link">About</span>
            <span className="footer-link">Help</span>
            <span className="footer-link">Press</span>
            <span className="footer-link">API</span>
            <span className="footer-link">Jobs</span>
            <span className="footer-link">Privacy</span>
            <span className="footer-link">Terms</span>
            <span className="footer-link">Locations</span>
            <span className="footer-link">Language</span>
            <span className="footer-link">Meta Verified</span>
          </div>
          <div className="footer-copyright">© 2025 INSTAGRAM FROM META</div>
        </div>
      </div>
    </div>
  )
}