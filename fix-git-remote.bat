@echo off
echo ======================================
echo Git Remote Configuration Fix Script
echo ======================================
echo.

echo Step 1: Checking current Git remote configuration...
git remote -v
echo.

echo Step 2: Removing existing origin remote...
git remote remove origin
echo Origin remote removed.
echo.

echo Step 3: Adding new origin remote to in2.git...
git remote add origin https://github.com/ahmadal2/in2.git
echo New origin remote added: https://github.com/ahmadal2/in2.git
echo.

echo Step 4: Verifying new remote configuration...
git remote -v
echo.

echo Step 5: Checking if target repository exists...
echo Attempting to fetch from new remote...
git ls-remote origin 2>nul
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Repository https://github.com/ahmadal2/in2.git might not exist!
    echo Please ensure you have:
    echo 1. Created the repository 'in2' on GitHub under account 'ahmadal2'
    echo 2. The repository is accessible with your current GitHub credentials
    echo.
    echo You can create it manually at: https://github.com/new
    echo Repository name: in2
    echo Owner: ahmadal2
    echo.
    pause
    exit /b 1
)

echo Repository exists and is accessible!
echo.

echo Step 6: Attempting to push with force (this will overwrite remote)...
echo WARNING: This will overwrite any existing content in the remote repository!
echo Press Ctrl+C to cancel, or any key to continue...
pause >nul

git push --force-with-lease origin main
if %errorlevel% eq 0 (
    echo.
    echo ✅ SUCCESS: Code pushed successfully to https://github.com/ahmadal2/in2.git
    echo.
) else (
    echo.
    echo ❌ PUSH FAILED. Trying alternative approach...
    echo Setting upstream and pushing...
    git push -u origin main --force-with-lease
    if %errorlevel% eq 0 (
        echo ✅ SUCCESS: Code pushed with upstream set!
    ) else (
        echo ❌ PUSH STILL FAILED. Manual intervention required.
        echo.
        echo Possible solutions:
        echo 1. Verify repository exists at https://github.com/ahmadal2/in2.git
        echo 2. Check your GitHub authentication ^(Personal Access Token^)
        echo 3. Ensure you have push access to this repository
    )
)

echo.
echo Final remote configuration:
git remote -v
echo.
echo Script completed. Press any key to exit...
pause >nul