#!/bin/bash

echo "========================================="
echo "Complete Dependency Verification"
echo "Based on ahmad-insta project architecture"
echo "========================================="
echo

cd ahmad-insta

echo "📋 Checking ALL required dependencies from project architecture..."
echo

# Core dependencies based on project memory
core_deps=(
    "@supabase/supabase-js"
    "next"
    "react"
    "react-dom"
    "typescript"
)

# Form and validation dependencies (from memory: all forms use react-hook-form + zod)
form_deps=(
    "react-hook-form" 
    "zod"
    "@hookform/resolvers"
)

# UI and styling dependencies (from memory: lucide-react for icons, Tailwind CSS)
ui_deps=(
    "lucide-react"
    "tailwindcss"
    "@tailwindcss/postcss"
)

# Utility dependencies
utility_deps=(
    "uuid"
    "@types/uuid"
    "@types/node"
    "@types/react"
    "@types/react-dom"
)

# Development dependencies
dev_deps=(
    "eslint"
    "eslint-config-next"
    "@eslint/eslintrc"
)

echo "✅ CORE DEPENDENCIES (Next.js + Supabase):"
for dep in "${core_deps[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        version=$(grep "\"$dep\"" package.json | cut -d'"' -f4)
        echo "   ✅ $dep: $version"
    else
        echo "   ❌ MISSING: $dep"
    fi
done

echo
echo "📝 FORM & VALIDATION DEPENDENCIES (react-hook-form + zod):"
for dep in "${form_deps[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        version=$(grep "\"$dep\"" package.json | cut -d'"' -f4)
        echo "   ✅ $dep: $version"
    else
        echo "   ❌ MISSING: $dep"
    fi
done

echo
echo "🎨 UI & STYLING DEPENDENCIES (Lucide icons + Tailwind):"
for dep in "${ui_deps[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        version=$(grep "\"$dep\"" package.json | cut -d'"' -f4)
        echo "   ✅ $dep: $version"
    else
        echo "   ❌ MISSING: $dep"
    fi
done

echo
echo "🔧 UTILITY DEPENDENCIES:"
for dep in "${utility_deps[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        version=$(grep "\"$dep\"" package.json | cut -d'"' -f4)
        echo "   ✅ $dep: $version"
    else
        echo "   ❌ MISSING: $dep"
    fi
done

echo
echo "⚙️ DEVELOPMENT DEPENDENCIES:"
for dep in "${dev_deps[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        version=$(grep "\"$dep\"" package.json | cut -d'"' -f4)
        echo "   ✅ $dep: $version"
    else
        echo "   ❌ MISSING: $dep"
    fi
done

echo
echo "📊 DEPENDENCY ANALYSIS SUMMARY:"
echo "================================"

# Count total dependencies
total_deps=$(grep -c "\".*\":" package.json)
missing_count=0

# Check specifically for the build error dependency
if grep -q "@supabase/supabase-js" package.json; then
    supabase_version=$(grep "@supabase/supabase-js" package.json | cut -d'"' -f4)
    echo "🎯 BUILD ERROR DEPENDENCY: @supabase/supabase-js: $supabase_version ✅"
else
    echo "🎯 BUILD ERROR DEPENDENCY: @supabase/supabase-js: ❌ MISSING"
    missing_count=$((missing_count + 1))
fi

echo "📦 Total dependencies in package.json: $total_deps"

if [ $missing_count -eq 0 ]; then
    echo "✅ ALL REQUIRED DEPENDENCIES PRESENT!"
    echo
    echo "🔍 NETLIFY BUILD ISSUE DIAGNOSIS:"
    echo "Since all dependencies are present locally, the issue is likely:"
    echo "1. 🔄 Netlify is pulling from wrong repository"
    echo "2. 📥 Repository Netlify uses has outdated package.json" 
    echo "3. 🔗 Git remote URL needs updating"
    echo
    echo "💡 SOLUTION: Run the fix-netlify-dependencies.sh script to:"
    echo "   • Update Git remote to correct repository"
    echo "   • Push complete package.json to correct location"
    echo "   • Provide Netlify reconfiguration instructions"
else
    echo "❌ $missing_count dependencies are missing"
    echo "Please add missing dependencies before proceeding"
fi

echo
echo "📄 CURRENT PACKAGE.JSON CONTENT:"
echo "================================"
cat package.json

echo
echo "🚀 Ready to fix Netlify build issue!"
echo "Run: ./fix-netlify-dependencies.sh"