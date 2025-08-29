'use client'

export default function TestEnvVarsPage() {
  // This will run on the client side
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey)

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Environment Variables Test</h1>
      <p>Check the browser console to see if environment variables are loaded.</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Results:</h2>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {supabaseUrl ? 'Loaded' : 'Not found'}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {supabaseAnonKey ? 'Loaded' : 'Not found'}</p>
        
        {supabaseUrl && (
          <p><strong>URL Preview:</strong> {supabaseUrl.substring(0, 30)}...</p>
        )}
      </div>
    </div>
  )
}