'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { Home, Search, Compass, Film, MessageCircle, Heart, PlusSquare, User as UserIcon, Menu, Instagram } from 'lucide-react'

export default function InstagramSidebar() {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    async function getUser() {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    
    getUser()
    
    const supabase = getSupabaseClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )
    
    return () => {
      try {
        subscription.unsubscribe()
      } catch (error) {
        console.warn('Error unsubscribing from auth state change:', error)
      }
    }
  }, [])

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
    <nav className="instagram-sidebar">
      <Link href="/" className="block">
        {/* Replace image with text for large screens */}
        <h1 className="text-2xl font-cursive font-bold p-6 hidden lg:block">Instagram</h1>
        
        {/* Icon for small screens */}
        <div className="lg:hidden flex justify-center py-4">
          <Instagram size={28} />
        </div>
      </Link>
      
      <div className="mt-6 flex-1">
        {navItems.map((item) => (
          <Link 
            key={item.name}
            href={item.path}
            className={`nav-item ${pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={24} strokeWidth={pathname === item.path ? 2 : 1.5} />
            <span className="nav-text">{item.name}</span>
          </Link>
        ))}
      </div>
      
      <div className="mt-auto">
        <Link href="/more" className="nav-item">
          <Menu size={24} strokeWidth={1.5} />
          <span className="nav-text">More</span>
        </Link>
      </div>
    </nav>
  )
}