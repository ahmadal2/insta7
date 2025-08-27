'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { Camera, Home, Plus, User as UserIcon, LogOut, LogIn } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Force page refresh to ensure clean state
    window.location.href = '/'
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

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border/50 px-4 py-3 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="p-1 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            AhmadInsta
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-2">
          <Link 
            href="/" 
            className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200 group"
            title="Home"
          >
            <Home className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          
          {user ? (
            <>
              <Link 
                href="/upload" 
                className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200 group"
                title="Create Post"
              >
                <Plus className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
              <Link 
                href={`/profile/${user.id}`} 
                className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200 group"
                title="Profile"
              >
                <UserIcon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200 group"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
              </button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link 
                href="/auth/login" 
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}