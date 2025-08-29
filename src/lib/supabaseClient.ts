import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Create a function to initialize the Supabase client
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // Check if environment variables are missing or contain placeholder values
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!')
    console.error('Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.')
    console.error('Check the README.md file for setup instructions.')
    throw new Error('Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. Check the README.md file for setup instructions.')
  }

  if (supabaseUrl.includes('your_supabase_project_url_here') || supabaseAnonKey.includes('your_supabase_anon_key_here')) {
    console.error('❌ Placeholder values detected in .env.local!')
    console.error('Please replace the placeholder values in your .env.local file with actual Supabase credentials.')
    console.error('Check the README.md file for setup instructions.')
    throw new Error('Please replace the placeholder values in your .env.local file with actual Supabase credentials from your Supabase dashboard. Check the README.md file for setup instructions.')
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch {
    console.error('❌ Invalid Supabase URL format!')
    console.error(`Invalid Supabase URL format: ${supabaseUrl}`)
    console.error('Please check your NEXT_PUBLIC_SUPABASE_URL in .env.local')
    throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Please check your NEXT_PUBLIC_SUPABASE_URL in .env.local`)
  }

  // Create the Supabase client with proper error handling
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'X-Client-Info': 'ahmad-insta'
        }
      }
    })
    return supabase
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error)
    throw new Error('Failed to initialize Supabase client. Please check your configuration.')
  }
}

// Export a function that returns the Supabase client
let supabaseInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }
  return supabaseInstance
}

// Also export the client directly for backward compatibility
// Initialize it lazily to avoid issues with environment variables
export const supabase = new Proxy({}, {
  get: function(target, prop) {
    const client = getSupabaseClient();
    return client[prop];
  }
}) as SupabaseClient;

// Types for our database tables
export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  updated_at: string
}

export interface Post {
  id: string
  user_id: string | null
  image_url: string | null
  caption: string | null
  content: string | null
  created_at: string
  updated_at: string
  // Removed media_type field to avoid schema cache issues
  profiles: Profile
  likes: Like[]
  comments: Comment[]
  reposts: Repost[]
  likes_count?: number
  comments_count?: number
  reposts_count?: number
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  text: string
  created_at: string
  profiles: Profile
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface Repost {
  id: string
  original_post_id: string
  user_id: string
  created_at: string
  profiles?: Profile
  posts?: Post
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  read: boolean
  sender?: Profile
  recipient?: Profile
}

export interface UserStats {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  posts_count: number
  followers_count: number
  following_count: number
}