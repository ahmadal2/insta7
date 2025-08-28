# Ahmad Insta - Development Guide

This guide will help you set up and run the Ahmad Insta application locally.

## Prerequisites

1. Node.js 20 or higher
2. npm (comes with Node.js)
3. A Supabase account

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy the example environment file:
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
   - Select your project (or create a new one if you don't have one)
   - Go to **Settings** → **API**
   - Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy the **anon/public key** (starts with: `eyJhbGciOiJIUzI1NiIs...`)
   - Paste these values into your `.env.local` file

## Running the Development Server

### Windows Users - PowerShell Execution Policy

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

### Start the Development Server

```bash
npm run dev
```

The application will be available at:
- Local: http://localhost:3000
- Network: http://[your-ip]:3000

## Common Issues and Solutions

### 1. TypeScript Errors

If you see TypeScript errors when running the development server:

```bash
npm run dev
```

Check for TypeScript errors:
```bash
npx tsc --noEmit
```

### 2. Environment Variables Not Loading

If the app starts but doesn't connect to Supabase:

1. Ensure you've properly configured `.env.local` with your actual Supabase credentials
2. Restart the development server after any environment variable changes
3. Check that there are no extra spaces or characters in your environment values

### 3. Database Setup Required

After setting up your Supabase credentials, you'll need to set up the database tables and storage:

1. In Supabase Dashboard, go to SQL Editor
2. Run the SQL commands from the README.md file
3. Set up the storage bucket as described in the README.md

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── profile/        # User profile pages
│   └── ...
├── components/         # React components
├── lib/                # Utility functions and Supabase client
└── styles/             # Global styles
```

## Development Workflow

1. Make changes to the code
2. The development server will automatically reload with your changes
3. Check the terminal for any errors
4. View your changes in the browser at http://localhost:3000

## Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Troubleshooting Checklist

- [ ] Node.js 20+ is installed
- [ ] All dependencies are installed (`npm install`)
- [ ] Environment variables are properly configured
- [ ] Supabase project is set up with required tables
- [ ] Storage bucket is created and configured
- [ ] PowerShell execution policy is set correctly (Windows)
- [ ] No TypeScript errors (`npx tsc --noEmit`)

If you continue to have issues, please check the README.md file for detailed setup instructions.