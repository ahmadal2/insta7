'use client'

import { useEffect, useState } from 'react'

// Define the type for environment variables
interface EnvVars {
  NEXT_PUBLIC_SUPABASE_URL?: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
}

export default function TestEnvPage() {
  const [envVars, setEnvVars] = useState<EnvVars>({})

  useEffect(() => {
    // This will run on the client side
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    })
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Environment Variables Test</h1>
      <p>This page tests if the Supabase environment variables are loaded correctly.</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Results:</h2>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envVars.NEXT_PUBLIC_SUPABASE_URL ? 'Loaded' : 'Not found'}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Loaded' : 'Not found'}</p>
        <p><strong>SUPABASE_URL:</strong> {envVars.SUPABASE_URL ? 'Loaded' : 'Not found'}</p>
        <p><strong>SUPABASE_ANON_KEY:</strong> {envVars.SUPABASE_ANON_KEY ? 'Loaded' : 'Not found'}</p>
        
        {envVars.NEXT_PUBLIC_SUPABASE_URL && (
          <div>
            <p><strong>URL Preview:</strong> {envVars.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...</p>
          </div>
        )}
      </div>
    </div>
  )
}