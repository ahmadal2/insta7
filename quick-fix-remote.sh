#!/bin/bash

echo "========================================="
echo "Quick Git Remote Fix for ahmad-insta"
echo "========================================="
echo

echo "Step 1: Current remote configuration:"
git remote -v
echo

echo "Step 2: Updating remote URL to correct repository..."
git remote set-url origin https://github.com/Ahmad7-7/ahmad-insta.git
echo "✅ Remote URL updated successfully!"
echo

echo "Step 3: Verifying new remote configuration:"
git remote -v
echo

echo "Step 4: Fetching from correct repository..."
if git fetch origin; then
    echo "✅ Successfully connected to repository!"
    echo
    
    echo "Step 5: Attempting to push..."
    if git push -u origin main; then
        echo "🎉 SUCCESS: Code pushed successfully!"
        echo "Repository: https://github.com/Ahmad7-7/ahmad-insta.git"
    else
        echo "⚠️  Push failed. Trying to merge remote changes..."
        echo
        echo "Step 6: Pulling and merging remote changes..."
        if git pull origin main --allow-unrelated-histories; then
            echo "✅ Merge successful. Pushing again..."
            if git push -u origin main; then
                echo "🎉 SUCCESS: Code pushed after merge!"
            else
                echo "❌ Push still failed. Manual intervention required."
            fi
        else
            echo "❌ Merge failed. You may need to resolve conflicts manually."
            echo "Run 'git status' to see what needs to be resolved."
        fi
    fi
else
    echo "❌ Cannot connect to repository."
    echo
    echo "Possible issues:"
    echo "1. Repository https://github.com/Ahmad7-7/ahmad-insta.git doesn't exist"
    echo "2. Authentication failed (use Personal Access Token, not password)"
    echo "3. Network connectivity issues"
    echo
    echo "To create the repository:"
    echo "- Go to https://github.com/new"
    echo "- Repository name: ahmad-insta"
    echo "- Owner: Ahmad7-7"
    echo "- Click 'Create repository'"
fi

echo
echo "Final remote configuration:"
git remote -v