#!/bin/bash

# As I Need It - Netlify Deployment Script

echo "🚀 Starting deployment process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running type checking..."
npm run typecheck

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build for production
echo "🏗️ Building for production..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Check bundle size
    echo "📊 Bundle size analysis:"
    du -sh out/
    
    # Deploy to Netlify (if netlify-cli is installed)
    if command -v netlify &> /dev/null; then
        echo "🌐 Deploying to Netlify..."
        netlify deploy --prod --dir=out
    else
        echo "📁 Build ready for deployment!"
        echo "📂 Output directory: out/"
        echo "🌐 Deploy manually by uploading the 'out' directory to Netlify"
    fi
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment process completed!"