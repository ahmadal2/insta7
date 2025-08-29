'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export default function TestUploadPage() {
  const [user, setUser] = useState<User | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check user authentication status
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        setMessage(`Auth error: ${error.message}`)
        return
      }
      
      if (session?.user) {
        setUser(session.user)
        setMessage(`Authenticated as: ${session.user.email}`)
      } else {
        setMessage('Not authenticated. Redirecting to login...')
        // Redirect to login page
        router.push('/auth/login')
      }
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user)
          setMessage(`Authenticated as: ${session.user.email}`)
        } else {
          router.push('/auth/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const testDatabaseConnection = async () => {
    if (!user) {
      setMessage('Not authenticated')
      return
    }
    
    setUploading(true)
    setMessage('Testing database connection...')
    
    try {
      // Test querying posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .limit(1)

      if (postsError) {
        setMessage(`Posts query error: ${JSON.stringify(postsError)}`)
        console.error('Posts query error:', postsError)
        setUploading(false)
        return
      }

      setMessage(`Database connection successful. Found ${posts.length} posts.`)
      console.log('Posts query successful:', posts)
      
      // Test inserting a post
      const testPost = {
        user_id: user.id,
        image_url: 'https://example.com/test.jpg',
        caption: 'Test post from test page',
        content: 'Test post from test page'
      }

      setMessage('Attempting to insert test post...')
      
      const { data: insertData, error: insertError } = await supabase
        .from('posts')
        .insert(testPost)
        .select()

      if (insertError) {
        setMessage(`Insert error: ${JSON.stringify(insertError)}`)
        console.error('Insert error:', insertError)
        setUploading(false)
        return
      }

      setMessage(`Insert successful: ${JSON.stringify(insertData)}`)
      console.log('Insert successful:', insertData)

      // Clean up test post
      if (insertData && insertData[0]) {
        setMessage('Cleaning up test post...')
        await supabase
          .from('posts')
          .delete()
          .eq('id', insertData[0].id)
        setMessage('Test post created and cleaned up successfully')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setMessage(`Exception: ${errorMessage}`)
      console.error('Exception:', err)
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Upload Test Page</h1>
        <p>{message}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Upload Test Page</h1>
      <p>This page tests the upload functionality with the actual database structure.</p>
      <p><strong>User:</strong> {user.email}</p>
      
      <button 
        onClick={testDatabaseConnection} 
        disabled={uploading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          marginRight: '10px'
        }}
      >
        {uploading ? 'Testing...' : 'Test Database Connection'}
      </button>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Result:</h2>
        <p>{message}</p>
      </div>
    </div>
  )
}