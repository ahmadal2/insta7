@echo off
echo Setting up Git repository for ahmad-insta with SSH...
echo.

echo Step 1: Adding content to README.md...
echo # insta >> README.md

echo Step 2: Initializing Git repository...
git init

echo Step 3: Adding README.md to staging...
git add README.md

echo Step 4: Making first commit...
git commit -m "first commit"

echo Step 5: Renaming branch to main...
git branch -M main

echo Step 6: Adding remote origin...
git remote rm origin 2>nul
git remote add origin git@github.com:ahmadal2/insta.git

echo Step 7: Pushing to GitHub...
git push -u origin main

echo. 
echo Git repository setup complete!
echo Note: If using SSH, make sure you have SSH keys set up with GitHub
pause

echo.
echo Git repository setup complete!
echo Note: If using SSH, make sure you have SSH keys set up with GitHub
pause