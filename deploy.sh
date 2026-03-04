#!/bin/bash

# Configuration
DIST_DIR="dist"
ZIP_FILE="deployment.zip"

echo "🚀 Starting Hostinger Deployment Preparation..."

# 1. Clean previous build
if [ -d "$DIST_DIR" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf "$DIST_DIR"
fi

if [ -f "$ZIP_FILE" ]; then
    echo "🧹 Removing old zip file..."
    rm "$ZIP_FILE"
fi

# 2. Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check errors above."
    exit 1
fi

# 3. Create zip for upload
echo "🗜️ Creating $ZIP_FILE for manual upload..."
if command -v zip >/dev/null 2>&1; then
    cd "$DIST_DIR" && zip -r "../$ZIP_FILE" . && cd ..
    echo "✅ Success! Upload '$ZIP_FILE' to your Hostinger File Manager/public_html."
else
    echo "⚠️ 'zip' command not found. Please manually upload the contents of the '$DIST_DIR' folder."
    echo "✅ Build completed in '$DIST_DIR/'."
fi

echo "✨ Done!"
