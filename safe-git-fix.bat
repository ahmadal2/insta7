@echo off
echo ========================================
echo Safe Git Remote Configuration & Merge
echo ========================================
echo.

echo Step 1: Checking current Git status...
git status --porcelain
if %errorlevel% neq 0 (
    echo ERROR: Not in a Git repository!
    pause
    exit /b 1
)
echo.

echo Step 2: Showing current remote configuration...
git remote -v
echo.

echo Step 3: Updating remote URL to correct repository...
git remote set-url origin https://github.com/Ahmad7-7/ahmad-insta.git
echo Remote URL updated to: https://github.com/Ahmad7-7/ahmad-insta.git
echo.

echo Step 4: Verifying new remote configuration...
git remote -v
echo.

echo Step 5: Fetching from remote to check accessibility...
git fetch origin
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Cannot fetch from https://github.com/Ahmad7-7/ahmad-insta.git
    echo.
    echo Possible issues:
    echo 1. Repository doesn't exist - create it at https://github.com/new
    echo 2. Authentication failed - check your GitHub credentials
    echo 3. Network connectivity issues
    echo.
    echo To create repository:
    echo - Go to https://github.com/new
    echo - Repository name: ahmad-insta
    echo - Owner: Ahmad7-7
    echo - Click "Create repository"
    echo.
    pause
    exit /b 1
)

echo Step 6: Checking for conflicts between local and remote...
git log --oneline --graph --decorate --all -10
echo.

echo Step 7: Attempting safe push with upstream tracking...
git push -u origin main
if %errorlevel% eq 0 (
    echo.
    echo ✅ SUCCESS: Code pushed successfully!
    echo Repository URL: https://github.com/Ahmad7-7/ahmad-insta.git
) else (
    echo.
    echo Push failed. Attempting to merge remote changes first...
    echo.
    echo Step 8: Pulling and merging remote changes...
    git pull origin main --allow-unrelated-histories
    if %errorlevel% eq 0 (
        echo Merge successful. Now pushing...
        git push -u origin main
        if %errorlevel% eq 0 (
            echo ✅ SUCCESS: Code pushed after merge!
        ) else (
            echo ❌ Push still failed after merge.
            echo Manual resolution may be required.
        )
    ) else (
        echo ❌ Merge failed. There may be conflicts to resolve.
        echo Please check git status and resolve any conflicts manually.
    )
)

echo.
echo Final status:
git remote -v
echo.
git log --oneline -5
echo.
echo Script completed. Press any key to exit...
pause >nul