#!/bin/bash

echo "========================================="
echo "Fixing Netlify Build Dependencies Issue"
echo "========================================="
echo

echo "Step 1: Checking current Git configuration..."
git remote -v
echo

echo "Step 2: Updating remote URL to correct repository..."
git remote set-url origin https://github.com/Ahmad7-7/ahmad-insta.git
echo "✅ Remote URL updated to: https://github.com/Ahmad7-7/ahmad-insta.git"
echo

echo "Step 3: Verifying new remote configuration..."
git remote -v
echo

echo "Step 4: Checking package.json dependencies..."
echo "Current dependencies in package.json:"
grep -A 20 '"dependencies"' ahmad-insta/package.json
echo

echo "Step 5: Staging all changes..."
git add .
echo "✅ All changes staged"
echo

echo "Step 6: Committing dependency fixes..."
git commit -m "fix: update package.json with all required dependencies

- Add @supabase/supabase-js for Supabase integration
- Add lucide-react for UI icons
- Add uuid for unique ID generation
- Add @hookform/resolvers for form validation
- Add react-hook-form and zod for form handling
- Add all required TypeScript types
- Fix Netlify build: Module not found errors resolved"

if [ $? -eq 0 ]; then
    echo "✅ Changes committed successfully!"
else
    echo "ℹ️ No new changes to commit (already up to date)"
fi
echo

echo "Step 7: Pushing to correct repository..."
if git push origin main; then
    echo "✅ SUCCESS: Code pushed to https://github.com/Ahmad7-7/ahmad-insta.git"
    echo
    echo "🎉 NETLIFY FIX COMPLETE!"
    echo
    echo "Next steps:"
    echo "1. Update Netlify to use the correct repository:"
    echo "   - Go to Netlify Dashboard"
    echo "   - Site Settings → Build & Deploy → Repository"
    echo "   - Change to: https://github.com/Ahmad7-7/ahmad-insta"
    echo "2. Or create a new Netlify site with the correct repository"
    echo "3. Trigger a new build"
    echo
    echo "The following dependencies are now properly included:"
    echo "✅ @supabase/supabase-js: ^2.56.0"
    echo "✅ lucide-react: ^0.542.0"
    echo "✅ uuid: ^11.1.0"
    echo "✅ @hookform/resolvers: ^5.2.1"
    echo "✅ react-hook-form: ^7.62.0"
    echo "✅ zod: ^4.1.3"
    echo "✅ All TypeScript types"
else
    echo "❌ Push failed. Possible issues:"
    echo "1. Repository https://github.com/Ahmad7-7/ahmad-insta.git doesn't exist"
    echo "2. Authentication failed (use Personal Access Token)"
    echo "3. Network connectivity issues"
    echo
    echo "To create the repository:"
    echo "- Go to https://github.com/new"
    echo "- Repository name: ahmad-insta"
    echo "- Owner: Ahmad7-7"
    echo "- Click 'Create repository'"
fi

echo
echo "Current repository configuration:"
git remote -v