'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { Home, Search, Compass, Film, MessageCircle, Heart, PlusSquare, User as UserIcon, Menu, LogOut } from 'lucide-react'

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authSubscription, setAuthSubscription] = useState<{ unsubscribe: () => void } | null>(null)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Error getting session:', error)
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes with improved error handling
    try {
      const { data } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
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
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      // Force page refresh to ensure clean state
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <nav className="bg-card/80 backdrop-blur-md border-b border-border/50 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="animate-pulse h-8 w-32 bg-muted rounded"></div>
          <div className="flex items-center space-x-4">
            <div className="animate-pulse h-8 w-8 bg-muted rounded-full"></div>
            <div className="animate-pulse h-8 w-8 bg-muted rounded-full"></div>
          </div>
        </div>
      </nav>
    )
  }

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Search', icon: Search, path: '/search' },
    { name: 'Explore', icon: Compass, path: '/explore' },
    { name: 'Reels', icon: Film, path: '/reels' },
    { name: 'Messages', icon: MessageCircle, path: '/messages' },
    { name: 'Notifications', icon: Heart, path: '/notifications' },
    { name: 'Create', icon: PlusSquare, path: '/upload' },
    { name: 'Profile', icon: UserIcon, path: user ? `/profile/${user.id}` : '/auth/login' },
  ]

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border/50 px-4 py-3 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-cursive font-bold">Instagram</h1>
        </Link>

        {/* Navigation Links - For mobile */}
        <div className="flex items-center space-x-2 lg:hidden">
          <Link href="/" className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200">
            <Home className="h-5 w-5 text-muted-foreground" />
          </Link>
          
          {user ? (
            <>
              <Link href="/upload" className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200">
                <PlusSquare className="h-5 w-5 text-muted-foreground" />
              </Link>
              <Link href={`/profile/${user.id}`} className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
              </Link>
            </>
          ) : (
            <Link href="/auth/login" className="p-2 bg-primary text-primary-foreground rounded-lg">
              Login
            </Link>
          )}
        </div>

        {/* Navigation Links - For desktop */}
        <div className="hidden lg:flex items-center space-x-4">
          {user ? (
            <>
              {navItems.slice(0, 4).map(item => (
                <Link 
                  key={item.name}
                  href={item.path}
                  className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200"
                  title={item.name}
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
              
              <button
                onClick={handleSignOut}
                className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5 text-muted-foreground hover:text-red-500" />
              </button>
            </>
          ) : (
            <Link 
              href="/auth/login" 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}