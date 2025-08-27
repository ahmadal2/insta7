'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Post } from '@/lib/supabaseClient'
import { getPublicFeed, getFollowingFeed } from '@/lib/postActions'
import PostCard from '@/components/PostCard'
import { PostSkeleton, PageLoader } from '@/components/Loading'
import { Camera, Plus, Globe, Users } from 'lucide-react'
import Link from 'next/link'

// Disable static generation and force dynamic rendering
export const dynamic = 'force-dynamic'

// Performance constants optimized for mobile
const INITIAL_LOAD_COUNT = 3  // Further reduced for faster mobile load
const PAGINATION_SIZE = 5     // Smaller pagination for mobile
const MAX_RETRIES = 2
const SCROLL_THRESHOLD = 500  // Reduced scroll threshold for mobile

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [feedType, setFeedType] = useState<'public' | 'following'>('public')
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Optimized fetch with retry logic and better error handling
  const fetchPostsOptimized = useCallback(async (
    type: 'public' | 'following' = 'public', 
    pageNum: number = 0,
    append: boolean = false
  ) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setPostsLoading(true)
    }

    const isInitialLoad = pageNum === 0
    const limit = isInitialLoad ? INITIAL_LOAD_COUNT : PAGINATION_SIZE
    const offset = isInitialLoad ? 0 : INITIAL_LOAD_COUNT + (pageNum - 1) * PAGINATION_SIZE
    
    let retryCount = 0
    
    while (retryCount < MAX_RETRIES) {
      try {
        console.log(`Fetching ${type} feed (page ${pageNum}, limit ${limit}, offset ${offset})...`)
        
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

        console.log(`Successfully fetched ${postsData.length} posts`)
        
        if (append) {
          setPosts(prev => [...prev, ...postsData])
        } else {
          setPosts(postsData)
        }
        
        // Check if we have more posts to load
        setHasMore(postsData.length === limit)
        
        break // Success, exit retry loop
        
      } catch (err) {
        retryCount++
        console.error(`Error fetching posts (attempt ${retryCount}/${MAX_RETRIES}):`, err)
        
        if (retryCount >= MAX_RETRIES) {
          console.error('Max retries reached, falling back to empty state')
          if (!append) {
            setPosts([])
          }
          setHasMore(false)
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        }
      }
    }
    
    if (append) {
      setLoadingMore(false)
    } else {
      setPostsLoading(false)
    }
  }, [user])

  // Initial load effect
  useEffect(() => {
    const getSessionAndPosts = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        // Reset pagination and fetch initial posts
        setPage(0)
        await fetchPostsOptimized(feedType, 0, false)
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
  }, []) // Remove feedType and fetchPostsOptimized to prevent infinite loops

  // Effect for feed type changes
  useEffect(() => {
    if (!loading) {
      setPage(0)
      setHasMore(true)
      fetchPostsOptimized(feedType, 0, false)
    }
  }, [feedType, loading]) // Only depend on feedType and loading

  // Infinite scroll functionality
  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPostsOptimized(feedType, nextPage, true)
    }
  }, [loadingMore, hasMore, loading, page, feedType, fetchPostsOptimized])

  // Scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      // Use smaller threshold for mobile devices
      const threshold = isMobile ? SCROLL_THRESHOLD : 1000
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - threshold) {
        loadMorePosts()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMorePosts, isMobile])

  const handleFeedSwitch = useCallback((type: 'public' | 'following') => {
    if (type !== feedType) {
      setFeedType(type)
    }
  }, [feedType])

  const handlePostDelete = useCallback((postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
  }, [])

  // Memoize posts rendering for performance
  const renderedPosts = useMemo(() => {
    return posts.map((post) => (
      <PostCard 
        key={post.id} 
        post={post} 
        currentUser={user} 
        onPostDelete={handlePostDelete}
        lazy={true} // Enable lazy loading for images
      />
    ))
  }, [posts, user, handlePostDelete])

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
        {postsLoading && posts.length === 0 ? (
          // Show skeletons during initial load
          <div className="space-y-6">
            {Array.from({ length: INITIAL_LOAD_COUNT }).map((_, i) => (
              <PostSkeleton key={`skeleton-${i}`} />
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
          <>
            <div className="space-y-6">
              {renderedPosts}
            </div>
            
            {/* Load more indicator */}
            {hasMore && (
              <div className="py-8 flex justify-center">
                {loadingMore ? (
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading more posts...</span>
                  </div>
                ) : (
                  <button
                    onClick={loadMorePosts}
                    className="px-6 py-3 bg-secondary/50 hover:bg-secondary text-foreground rounded-xl transition-colors font-medium"
                  >
                    Load More Posts
                  </button>
                )}
              </div>
            )}
            
            {!hasMore && posts.length > INITIAL_LOAD_COUNT && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                You&apos;ve reached the end of the feed
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}