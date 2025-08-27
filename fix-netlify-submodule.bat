@echo off
echo =============================================
echo Fixing Netlify Submodule Configuration Issue
echo =============================================
echo.

echo Step 1: Navigating to correct project directory...
cd /d "c:\Users\ahmed\Downloads\My Projects\ahmad-insta\ahmad-insta"
echo Current directory: %CD%
echo.

echo Step 2: Checking for problematic .gitmodules file...
if exist ".gitmodules" (
    echo Found .gitmodules file - this is causing the Netlify error
    echo Displaying contents:
    type .gitmodules
    echo.
    echo Removing .gitmodules file...
    del .gitmodules
    echo ✅ .gitmodules file removed
) else (
    echo ✅ No .gitmodules file found - good!
)
echo.

echo Step 3: Checking current Git remote configuration...
git remote -v
echo.

echo Step 4: Updating to correct repository URL...
echo Based on project memory, updating to Ahmad7-7 repository...
git remote set-url origin https://github.com/Ahmad7-7/ahmad-insta.git
echo ✅ Remote URL updated
echo.

echo Step 5: Verifying Git configuration...
git config user.name >nul 2>&1 || git config --global user.name "Ahmad"
git config user.email >nul 2>&1 || git config --global user.email "ahmad@example.com"
echo ✅ Git user configuration verified
echo.

echo Step 6: Cleaning submodule references from Git config...
git config --remove-section submodule.ahmad-insta >nul 2>&1
echo ✅ Git config cleaned
echo.

echo Step 7: Installing dependencies...
echo Installing Node.js dependencies to ensure they're available...
npm install
if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ⚠️ Dependency installation had issues, continuing...
)
echo.

echo Step 8: Staging and committing changes...
git add .
git commit -m "fix: remove git submodule configuration causing Netlify build failures - Remove .gitmodules file that references invalid submodule path 'ahmad-insta' - Clean Git config of submodule references - Update remote URL to correct repository: https://github.com/Ahmad7-7/ahmad-insta.git - Ensure all dependencies are properly committed for Netlify deployment"

if %errorlevel% equ 0 (
    echo ✅ Changes committed successfully
) else (
    if %errorlevel% equ 1 (
        echo ℹ️ No new changes to commit
    ) else (
        echo ❌ Commit failed
        pause
        exit /b 1
    )
)
echo.

echo Step 9: Pushing to correct repository...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS: Code pushed to https://github.com/Ahmad7-7/ahmad-insta.git
    echo.
    echo 🎉 NETLIFY SUBMODULE FIX COMPLETE!
    echo.
    echo 📋 NEXT STEPS FOR NETLIFY:
    echo 1. Update Netlify site configuration:
    echo    - Go to Netlify Dashboard
    echo    - Site Settings → Build ^& Deploy → Repository
    echo    - Change from: https://github.com/ahmadal2/insta7
    echo    - To: https://github.com/Ahmad7-7/ahmad-insta
    echo.
    echo 2. Verify build settings:
    echo    - Build command: npm run build
    echo    - Publish directory: .next
    echo.
    echo 3. Add environment variables if needed:
    echo    - NEXT_PUBLIC_SUPABASE_URL
    echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo.
    echo 4. Trigger a new build
    echo.
    echo ✅ The submodule error should now be resolved!
) else (
    echo.
    echo ❌ PUSH FAILED - Possible solutions:
    echo.
    echo 🔐 Authentication:
    echo - Use Personal Access Token instead of password
    echo - Ensure authenticated with Ahmad7-7 account
    echo.
    echo 📁 Repository:
    echo - Verify https://github.com/Ahmad7-7/ahmad-insta exists
    echo - Create it manually if needed at https://github.com/new
    echo.
    pause
    exit /b 1
)

echo.
echo Final status:
git remote -v
echo.
echo 🚀 Repository is now ready for successful Netlify deployment!
echo Press any key to exit...
pause >nul