'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'

export default function AuthHandler() {
  // Track the subscription to ensure we only unsubscribe when it's available
  const [subscription, setSubscription] = useState<{ unsubscribe: () => void } | null>(null)

  useEffect(() => {
    // Create a safe wrapper for subscription setup
    const setupAuthListener = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              try {
                // Check if user has a profile
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('id', session.user.id)
                  .single()

                // Create profile if it doesn't exist (for email confirmed users)
                if (!profile && session.user.email_confirmed_at) {
                  const username = session.user.user_metadata?.username || 
                                 session.user.email?.split('@')[0] || 
                                 'user'
                  
                  await supabase
                    .from('profiles')
                    .insert([
                      {
                        id: session.user.id,
                        username: username,
                        avatar_url: null,
                        updated_at: new Date().toISOString(),
                      },
                    ])
                }
              } catch (error) {
                console.error('Error in auth state change handler:', error)
              }
            }
          }
        )

        // Store the subscription safely
        if (data && data.subscription) {
          setSubscription(data.subscription)
        }
      } catch (error) {
        console.error('Error setting up auth listener:', error)
      }
    }

    // Call the setup function
    setupAuthListener()

    // Cleanup function
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.warn('Error unsubscribing from auth state change:', error)
        }
      }
    }
  }, []) // Empty dependency array means this runs once on mount

  return null
}