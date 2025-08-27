#!/bin/bash

echo "========================================="
echo "Package.json Dependencies Verification"
echo "========================================="
echo

cd ahmad-insta

echo "Checking for missing dependencies based on Netlify build errors..."
echo

# Check each required dependency
dependencies=(
    "@supabase/supabase-js"
    "lucide-react"
    "uuid"
    "@hookform/resolvers"
    "react-hook-form"
    "zod"
)

devDependencies=(
    "@types/uuid"
)

echo "✅ Verifying main dependencies:"
for dep in "${dependencies[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        version=$(grep "\"$dep\"" package.json | cut -d'"' -f4)
        echo "✅ $dep: $version"
    else
        echo "❌ MISSING: $dep"
    fi
done

echo
echo "✅ Verifying dev dependencies:"
for dep in "${devDependencies[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        version=$(grep "\"$dep\"" package.json | cut -d'"' -f4)
        echo "✅ $dep: $version"
    else
        echo "❌ MISSING: $dep"
    fi
done

echo
echo "📋 Complete package.json content:"
echo "=================================="
cat package.json

echo
echo
echo "🔍 Import analysis based on build errors:"
echo "========================================"
echo "Files using @supabase/supabase-js:"
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@supabase/supabase-js" | head -5

echo
echo "Files using lucide-react:"
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "lucide-react" | head -5

echo
echo "Files using uuid:"
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "uuid" | head -5

echo
echo "✅ Package.json verification complete!"
echo
echo "If all dependencies show as present, the issue is likely:"
echo "1. Netlify is pulling from wrong repository (ahmadal2/insta instead of Ahmad7-7/ahmad-insta)"
echo "2. The repository Netlify is using has an outdated package.json"
echo "3. Run the fix-netlify-build.sh script to push to correct repository"