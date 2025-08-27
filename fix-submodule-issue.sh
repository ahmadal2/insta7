#!/bin/bash

echo "========================================="
echo "Fixing Git Submodule Issue for Netlify"
echo "========================================="
echo

echo "Step 1: Checking current Git status..."
git status
echo

echo "Step 2: Checking for .gitmodules file..."
if [ -f ".gitmodules" ]; then
    echo "Found .gitmodules file:"
    cat .gitmodules
    echo
    echo "Removing problematic .gitmodules file..."
    rm .gitmodules
    echo "✅ .gitmodules file removed"
else
    echo "✅ No .gitmodules file found - good!"
fi
echo

echo "Step 3: Checking Git remote configuration..."
git remote -v
echo

echo "Step 4: Removing any submodule configurations..."
if [ -f ".git/config" ]; then
    # Remove submodule entries from .git/config
    git config --remove-section submodule.ahmad-insta 2>/dev/null || echo "No submodule.ahmad-insta config found"
    echo "✅ Cleaned Git config of submodule references"
fi
echo

echo "Step 5: Checking if we're in the correct directory structure..."
if [ -d "ahmad-insta" ]; then
    echo "Found nested ahmad-insta directory"
    echo "Current structure suggests we need to work from the inner directory"
    
    echo "Contents of current directory:"
    ls -la
    echo
    
    echo "Contents of ahmad-insta subdirectory:"
    ls -la ahmad-insta/
    echo
    
    echo "This nested structure is likely causing the submodule confusion."
    echo "We should work from the inner ahmad-insta directory instead."
    
    cd ahmad-insta
    echo "Changed to inner ahmad-insta directory"
    echo "New working directory: $(pwd)"
    echo
    
    echo "Checking Git status in inner directory..."
    git status
    echo
    
    echo "Checking Git remote in inner directory..."
    git remote -v
    echo
fi

echo "Step 6: Ensuring all files are committed..."
git add .
git status
echo

echo "Step 7: Committing any uncommitted changes..."
git commit -m "fix: remove submodule configuration and clean repository structure

- Remove .gitmodules file causing Netlify build failures
- Clean up Git submodule references in config
- Ensure all dependencies are properly committed
- Fix repository structure for proper Netlify deployment"

if [ $? -eq 0 ]; then
    echo "✅ Changes committed successfully!"
elif [ $? -eq 1 ]; then
    echo "ℹ️ No new changes to commit (already up to date)"
else
    echo "❌ Commit failed"
    exit 1
fi
echo

echo "Step 8: Verifying final repository state..."
echo "Git status:"
git status
echo

echo "Git remote configuration:"
git remote -v
echo

echo "✅ Repository cleanup complete!"
echo
echo "🔧 NEXT STEPS FOR NETLIFY:"
echo "1. The submodule issue should now be resolved"
echo "2. Update Netlify to use the correct repository URL if needed"
echo "3. Trigger a new build"
echo
echo "If you're still using the wrong repository in Netlify:"
echo "- Update site repository to: https://github.com/Ahmad7-7/ahmad-insta"
echo "- Make sure to use the main branch"
echo
echo "The original dependency errors should be resolved once Netlify"
echo "uses the correct repository with all committed dependencies."