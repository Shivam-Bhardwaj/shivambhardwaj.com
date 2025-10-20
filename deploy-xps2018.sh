#!/bin/bash

# Deploy robotics-portfolio on xps2018 server
# Run this script directly on xps2018 (curious@10.0.0.109)
# Domain: shivambhardwaj.com (Cloudflare)

set -e  # Exit on error

echo "========================================="
echo "Deploying robotics-portfolio on xps2018"
echo "========================================="
echo ""

# Check if running on correct machine
HOSTNAME=$(hostname)
echo "🖥️  Running on: $HOSTNAME"
echo ""

# Pull latest changes from git
echo "📥 Pulling latest changes from GitHub..."
git fetch origin
git pull origin master

echo "✅ Repository updated"
echo ""

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Dependencies installed"
echo ""

# Build the project
echo "🔨 Building production bundle..."
npm run build

if [ ! -d "out" ]; then
    echo "❌ Error: Build output directory 'out' not found"
    exit 1
fi

echo "✅ Build completed successfully"
echo ""

# Deploy to web server directory
DEPLOY_PATH="/var/www/shivambhardwaj.com"

echo "🚀 Deploying to $DEPLOY_PATH..."

# Create deployment directory if it doesn't exist
mkdir -p $DEPLOY_PATH

# Sync build output to deployment directory
echo "📤 Copying files..."
rsync -av --delete \
    --exclude='*.sh' \
    --exclude='nginx-xps2018.conf' \
    ./out/ $DEPLOY_PATH/

# Set correct permissions
chmod -R 755 $DEPLOY_PATH

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your site is now available at:"
echo "   - Local: http://10.0.0.109"
echo "   - Local: http://localhost"
echo "   - Domain: https://shivambhardwaj.com (once Cloudflare DNS is configured)"
echo ""
echo "📊 Deployment statistics:"
echo "   - Build directory: $(pwd)/out"
echo "   - Deploy directory: $DEPLOY_PATH"
echo "   - Files deployed: $(find $DEPLOY_PATH -type f | wc -l)"
echo "   - Total size: $(du -sh $DEPLOY_PATH | cut -f1)"
echo ""
