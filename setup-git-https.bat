@echo off
echo Setting up Git repository for ahmad-insta with HTTPS...
echo.

echo Step 1: Removing existing Git repository if present...
rmdir /s /q .git 2>nul

echo Step 2: Cleaning up README.md...
del README.md 2>nul

echo Step 3: Creating fresh README.md...
echo # insta > README.md

echo Step 4: Initializing Git repository...
git init

echo Step 5: Adding README.md to staging...
git add README.md

echo Step 6: Making first commit...
git commit -m "first commit"

echo Step 7: Renaming branch to main...
git branch -M main

echo Step 8: Adding remote origin with HTTPS...
git remote add origin https://github.com/ahmadal2/insta.git

echo Step 9: Pushing to GitHub...
git push -u origin main

echo.
echo Git repository setup complete!
echo Repository URL: https://github.com/ahmadal2/insta.git
pause