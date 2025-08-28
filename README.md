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

**CRITICAL:** You must configure your Supabase credentials before the app will work.

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values with your actual Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-from-supabase
   ```

3. **How to get your Supabase credentials:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project (or create a new one if you don&apos;t have one)
   - Go to **Settings** → **API**
   - Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy the **anon/public key** (starts with: `eyJhbGciOiJIUzI1NiIs...`)
   - Paste these values into your `.env.local` file

4. **Restart the development server** after updating the environment file:
   ```bash
   npm run dev
   ```

### 4. Database Setup

You can set up the database in two ways:

**Option 1: Use the provided SQL files**
1. Find the `SUPABASE_SCHEMA.sql` file in your project root
2. Copy its contents
3. In your Supabase Dashboard, go to SQL Editor
4. Paste the SQL commands and run them

**Option 2: Manual setup**
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

You can set up storage in two ways:

**Option 1: Use the provided SQL file**
1. Find the `SUPABASE_STORAGE.sql` file in your project root
2. Copy its contents
3. In your Supabase Dashboard, go to SQL Editor
4. Paste the SQL commands and run them

**Option 2: Manual setup**
1. In Supabase Dashboard, go to Storage
2. Create a new bucket called `posts`
3. Make it public by updating the bucket policy:

```sql
CREATE POLICY "Anyone can view posts" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Authenticated users can upload posts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own posts" ON storage.objects FOR UPDATE USING (bucket_id = 'posts' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own posts" ON storage.objects FOR DELETE USING (bucket_id = 'posts' AND auth.uid() = owner);
```

**Option 3: Simple public bucket (recommended for development)**
1. In Supabase Dashboard, go to Storage
2. Create a new bucket called `posts`
3. Go to the bucket settings
4. Enable "Public bucket" option

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠️ Troubleshooting

### PowerShell Execution Policy Issues (Windows)

If you encounter issues running `npm run dev` on Windows with an error like:
```
File npm.ps1 cannot be loaded because running scripts is disabled on this system
```

This is due to Windows PowerShell's execution policy. To fix this:

1. Open PowerShell as Administrator
2. Run the following command:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Confirm with `Y` when prompted

This allows locally created scripts to run, which is necessary for npm to work properly.

### React Compiler Issues

If you see an error like:
```
[Error: Failed to load the `babel-plugin-react-compiler`. 
It is required to use the React Compiler. Please install it.]
```

This happens because the project uses Next.js 15's experimental React Compiler feature. The required plugin should already be installed, but if you encounter this error:

1. Install the missing plugin:
   ```bash
   npm install --save-dev babel-plugin-react-compiler
   ```

2. Or disable the React Compiler in `next.config.ts`:
   ```typescript
   const nextConfig: NextConfig = {
     experimental: {
       reactCompiler: false, // Set to false to disable
     },
     // ... rest of config
   };
   ```

### Environment Variables Not Loading

If the app starts but doesn't connect to Supabase:

1. Ensure you've properly configured `.env.local` with your actual Supabase credentials
2. Restart the development server after any environment variable changes
3. Check that there are no extra spaces or characters in your environment values

## 🎯 Usage

1. **Register/Login**: Create an account or sign in
2. **Create Posts**: Upload images with captions
3. **Social Features**: Like, comment, and follow other users
4. **Manage Content**: Delete your own posts and comments
5. **Dark Mode**: Toggle between light and dark themes

## 📱 Mobile Performance Optimizations

This application includes several optimizations for mobile devices to ensure fast loading and smooth performance:

### Key Optimizations:

1. **Lazy Loading**
   - Images load only when they come into view
   - Components load on demand
   - Reduced initial bundle size

2. **Infinite Scroll**
   - Posts load progressively as you scroll
   - Initial load shows fewer posts for faster rendering
   - Pagination with "Load More" option

3. **Image Optimization**
   - WebP format support for modern browsers
   - Responsive images for different screen sizes
   - Aspect ratio preservation to prevent layout shifts

4. **Caching & Offline Support**
   - Service worker for offline functionality
   - Asset caching for faster subsequent loads
   - PWA support for app-like experience

5. **Bundle Optimization**
   - Code splitting for smaller chunks
   - Tree-shaking to remove unused code
   - Compression enabled in Next.js config

6. **UI Performance**
   - Skeleton loading states
   - Efficient re-rendering with React.memo
   - Optimized CSS with Tailwind
   - Reduced animations on low-end devices

### Mobile-Specific Features:

- **Touch-friendly interface** with appropriate tap targets
- **Responsive design** that adapts to all screen sizes
- **Dark mode** that respects system preferences
- **Progressive Web App** support for home screen installation
- **Fast loading** even on slower mobile networks

### Performance Testing:

To test mobile performance:

1. Use Chrome DevTools Device Mode
2. Enable mobile network throttling
3. Check Lighthouse performance scores
4. Monitor bundle sizes with `npm run build`

Common performance metrics to monitor:
- First Contentful Paint (FCP) < 2.5 seconds
- Largest Contentful Paint (LCP) < 4 seconds
- Cumulative Layout Shift (CLS) < 0.1
- Time to Interactive (TTI) < 5 seconds

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

### "Failed to construct 'URL': Invalid URL" Error
This error occurs when Supabase environment variables are not properly configured:

**Solution:**
1. Check that `.env.local` exists in your project root
2. Ensure you&apos;ve replaced placeholder values with actual Supabase credentials
3. Verify your Supabase URL format: `https://your-project-id.supabase.co`
4. Restart your development server: `npm run dev`

### "Missing Supabase environment variables" Error
If you see this error, your environment file is missing or not properly loaded:

**Solution:**
1. Create `.env.local` file in project root
2. Copy content from `.env.example`
3. Replace placeholder values with your actual Supabase credentials
4. Restart the development server

### "Please replace the placeholder values" Error
This means you&apos;re still using the template values instead of real credentials:

**Solution:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → Settings → API
3. Copy the Project URL and anon key
4. Update your `.env.local` file with these real values

### Environment Variables Not Loading
- Make sure the file is named exactly `.env.local` (not `.env.local.txt`)
- Ensure the file is in the project root directory
- Check that there are no spaces around the `=` sign
- Restart the development server after making changes

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