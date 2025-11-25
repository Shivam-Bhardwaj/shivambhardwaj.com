#!/bin/bash
# Build locally and push to GitHub Container Registry
# Run this on your dev machine before pushing to trigger deploy

set -e

REGISTRY="ghcr.io"
IMAGE_NAME="shivam-bhardwaj/shivambhardwaj.com"

echo "🔐 Logging into GitHub Container Registry..."
echo "   (You need a GitHub Personal Access Token with 'write:packages' scope)"
echo "   Create one at: https://github.com/settings/tokens/new"
echo ""

# Check if already logged in
if ! docker pull ${REGISTRY}/${IMAGE_NAME}:latest 2>/dev/null; then
    echo "Please login to ghcr.io:"
    docker login ghcr.io
fi

echo ""
echo "🔨 Building Docker image locally..."
docker buildx build --platform linux/amd64 -t ${REGISTRY}/${IMAGE_NAME}:latest --load .

echo ""
echo "📤 Pushing to GitHub Container Registry..."
docker push ${REGISTRY}/${IMAGE_NAME}:latest

echo ""
echo "✅ Build and push complete!"
echo ""
echo "🚀 To deploy, either:"
echo "   1. Push to main branch: git push origin main"
echo "   2. Trigger manually: Go to GitHub Actions → Deploy to Production → Run workflow"

