#!/bin/bash

echo "========================================="
echo "Committing zodResolver Import Fixes"
echo "========================================="
echo

echo "Step 1: Checking current Git status..."
git status
echo

echo "Step 2: Adding modified files..."
git add src/app/auth/login/page.tsx
git add src/app/auth/register/page.tsx
git add src/app/auth/reset-password/page.tsx
git add src/app/profile/[id]/edit/page.tsx
git add src/components/PostCard.tsx
git add src/components/UploadForm.tsx
echo "✅ Files added to staging area"
echo

echo "Step 3: Committing the fixes..."
git commit -m "fix: correct zodResolver import paths

- Fixed incorrect import from '@hookform/resolvers/zod' to '@hookform/resolvers'
- Updated imports in login, register, reset-password, profile edit pages
- Updated imports in PostCard and UploadForm components
- Resolves Netlify build error: Module not found '@hookform/resolvers/zod'"

if [ $? -eq 0 ]; then
    echo "✅ Import fixes committed successfully!"
    echo
    
    echo "Step 4: Showing commit log..."
    git log --oneline -5
    echo
    
    echo "🎉 All zodResolver import issues have been fixed and committed!"
    echo "The build should now work correctly on Netlify."
    echo
    echo "Next steps:"
    echo "1. Push to GitHub: git push origin main"
    echo "2. Check Netlify deployment status"
else
    echo "❌ Commit failed. Please check for any issues."
fi

echo
echo "Final Git status:"
git status