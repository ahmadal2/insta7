-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add a column to distinguish between image and video posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Create reposts table
CREATE TABLE IF NOT EXISTS reposts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, original_post_id)
);

-- Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  read BOOLEAN DEFAULT false
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own likes" ON likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON follows FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Reposts are viewable by everyone" ON reposts FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reposts" ON reposts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can insert their own messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update read status of messages sent to them" ON messages FOR UPDATE USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
CREATE POLICY "Users can delete their own messages" ON messages FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = recipient_id);