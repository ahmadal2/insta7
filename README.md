# Ahmad Instagram Clone

A modern Instagram-like social media application built with Next.js, TypeScript, and Supabase.

## ✨ Features

- 📱 **Modern Instagram-like UI** with dark mode support
- 🔐 **User authentication** (login, register, password reset)
- 📸 **Post creation and sharing** with image uploads
- ❤️ **Like and comment** on posts
- 👥 **Follow/unfollow users** 
- 🗑️ **Delete posts and comments** (your own content only)
- 📱 **Responsive design** for mobile and desktop
- 🎨 **Glass-morphism effects** and smooth animations

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 20 or higher
- A Supabase account and project

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ahmad-insta.git
cd ahmad-insta
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
```

To get these values:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 4. Database Setup

Run the following SQL commands in your Supabase SQL Editor:

```sql
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

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

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
```

### 5. Storage Setup

1. In Supabase Dashboard, go to Storage
2. Create a new bucket called `posts`
3. Make it public by updating the bucket policy:

```sql
CREATE POLICY "Anyone can view posts" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Authenticated users can upload posts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own posts" ON storage.objects FOR UPDATE USING (bucket_id = 'posts' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own posts" ON storage.objects FOR DELETE USING (bucket_id = 'posts' AND auth.uid() = owner);
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Usage

1. **Register/Login**: Create an account or sign in
2. **Create Posts**: Upload images with captions
3. **Social Features**: Like, comment, and follow other users
4. **Manage Content**: Delete your own posts and comments
5. **Dark Mode**: Toggle between light and dark themes

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── auth/              # Authentication pages
│   ├── profile/           # User profile pages
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── NavBar.tsx        # Navigation
│   ├── PostCard.tsx      # Post display component
│   └── ThemeToggle.tsx   # Dark mode toggle
├── contexts/              # React contexts
│   └── ThemeContext.tsx  # Theme management
└── lib/                   # Utilities and actions
    ├── supabaseClient.ts # Supabase configuration
    └── postActions.ts    # Post-related actions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🔧 Troubleshooting

### Environment Variables Error
If you see "Missing Supabase environment variables", make sure:
- `.env.local` file exists in the root directory
- Variables are properly set with your Supabase credentials
- Restart the development server after adding variables

### Database Connection Issues
- Verify your Supabase URL and anon key
- Check that your Supabase project is active
- Ensure RLS policies are properly configured

### Upload Issues
- Confirm the `posts` storage bucket exists
- Check storage policies are correctly set
- Verify file sizes are within limits

## 📞 Support

If you encounter any issues, please check the troubleshooting section or create an issue in the repository.