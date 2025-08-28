import { createClient } from '@supabase/supabase-js'

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  user_id: string
  image_url: string
  caption: string | null
  created_at: string
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

export interface UserStats {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  posts_count: number
  followers_count: number
  following_count: number
}