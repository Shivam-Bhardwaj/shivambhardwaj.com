#!/bin/bash
# Direct deployment script for antimony-labs
# Usage: ./deploy-direct.sh

set -e

SERVER_HOST="144.126.145.3"
SERVER_USER="root"
SERVER_PASS="iouiouiou"
DEPLOY_PATH="/root/antimony-labs"

echo "🔨 Building production release..."
LEPTOS_ENV=PROD cargo leptos build --release

echo "📦 Creating deployment package..."
mkdir -p deploy-package/target/release deploy-package/target/site
cp target/release/server deploy-package/target/release/
cp -r target/site/* deploy-package/target/site/

echo "📤 Compressing deployment package..."
tar -czf deploy.tar.gz deploy-package/

echo "🚀 Uploading to server..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/

echo "📥 Deploying on server..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} 'bash -s' << DEPLOYSCRIPT
set -e
DEPLOY_PATH="$DEPLOY_PATH"

echo "🛑 Stopping antimony-labs service..."
systemctl stop antimony-labs || true

echo "📦 Extracting deployment package..."
cd "$DEPLOY_PATH"
tar -xzf /tmp/deploy.tar.gz -C /tmp/

echo "🔄 Backing up current deployment..."
if [ -d "$DEPLOY_PATH/target" ]; then
    mv "$DEPLOY_PATH/target" "$DEPLOY_PATH/target.backup.\$(date +%Y%m%d_%H%M%S)" || true
fi

echo "📁 Installing new files..."
mkdir -p "$DEPLOY_PATH/target/release" "$DEPLOY_PATH/target/site"
cp /tmp/deploy-package/target/release/server "$DEPLOY_PATH/target/release/"
cp -r /tmp/deploy-package/target/site/* "$DEPLOY_PATH/target/site/"

echo "🔒 Setting permissions..."
chmod +x "$DEPLOY_PATH/target/release/server"
chmod -R 755 "$DEPLOY_PATH/target"

echo "🚀 Starting antimony-labs service..."
systemctl start antimony-labs

echo "⏳ Waiting for service to start..."
sleep 3

echo "✅ Checking service status..."
systemctl status antimony-labs --no-pager | head -10

echo "🧹 Cleaning up..."
rm -rf /tmp/deploy-package /tmp/deploy.tar.gz

echo "✅ Deployment complete!"
DEPLOYSCRIPT

echo "🧹 Local cleanup..."
rm -rf deploy-package deploy.tar.gz

echo "✅ Deployment successful!"
echo "🌐 Site should be available at: http://${SERVER_HOST}:3000"
echo "   (or through nginx proxy if configured)"

