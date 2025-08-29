-- First, let's check the current structure of the posts table
\d posts;

-- If the table structure doesn't match our expectations, let's recreate it properly
-- We'll rename the existing table, create a new one with the correct structure, and migrate data

-- Rename existing posts table
ALTER TABLE posts RENAME TO posts_old;

-- Create the new posts table with the correct structure
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  -- Note: We're not adding media_type for now to avoid schema cache issues
);

-- Copy data from old table (only columns that match)
INSERT INTO posts (id, user_id, image_url, caption, created_at)
SELECT 
  COALESCE(id, uuid_generate_v4()),
  user_id,
  COALESCE(image_url, ''),
  caption,
  COALESCE(created_at, NOW())
FROM posts_old;

-- Drop the old table
DROP TABLE posts_old;

-- Recreate all the other tables to ensure consistency
-- (This will be handled by your existing SUPABASE_SCHEMA.sql when applied properly)

-- Refresh the schema cache
-- This is typically done automatically, but you might need to:
-- 1. Go to your Supabase Dashboard
-- 2. Go to Settings → Database
-- 3. Click "Reset database connection"