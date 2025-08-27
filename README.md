# AhmadInsta - Instagram Clone

A modern Instagram-like social media application built with Next.js and Supabase.

## Features

- 🔐 User authentication (login/register)
- 📸 Photo uploads and sharing
- 👤 User profiles
- 💖 Like and comment on posts
- 🔄 Follow/unfollow users
- 📱 Responsive design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (Auth, Database, Storage)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahmadal2/insta7.git
   cd insta7
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment on Netlify

### Prerequisites
- Supabase project set up with authentication and storage enabled
- GitHub repository with your code

### Steps

1. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

3. **Set Environment Variables**
   In Netlify dashboard > Site settings > Environment variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically deploy using the `netlify.toml` configuration

### Troubleshooting

- **404 errors**: Make sure the `@netlify/plugin-nextjs` is properly configured
- **Build failures**: Check that all environment variables are set
- **Authentication issues**: Verify Supabase URL configuration in site settings

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Set up authentication providers
3. Create the required database tables (see SQL files in the project)
4. Configure Row Level Security policies
5. Set up storage buckets for image uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
