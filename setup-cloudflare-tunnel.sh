#!/bin/bash
# Setup Cloudflare Tunnel with API Token
# Usage: ./setup-cloudflare-tunnel.sh YOUR_API_TOKEN

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <CLOUDFLARE_API_TOKEN>"
    exit 1
fi

export CLOUDFLARE_API_TOKEN="$1"
TUNNEL_NAME="shivambhardwaj-tunnel"
TUNNEL_ID="bf19909d-fa18-4c94-8524-87c2b3c0f538"
CREDENTIALS_FILE="/root/.cloudflared/${TUNNEL_ID}.json"

echo "Setting up Cloudflare Tunnel with API token..."

# Try to get tunnel token using cloudflared (if supported)
if cloudflared tunnel token "$TUNNEL_NAME" > /dev/null 2>&1; then
    echo "Using cloudflared tunnel token command..."
    cloudflared tunnel token "$TUNNEL_NAME" > "$CREDENTIALS_FILE" || {
        echo "Failed to get token via cloudflared. Trying API method..."
        # Fallback: Use API to get account info and construct credentials
        # Note: This requires the tunnel secret which is only shown once
        echo "Please download the credentials file manually from Cloudflare Dashboard:"
        echo "1. Go to: https://dash.cloudflare.com → Zero Trust → Networks → Tunnels"
        echo "2. Click on '$TUNNEL_NAME'"
        echo "3. Click 'Configure' → Download credentials"
        echo "4. Save as: $CREDENTIALS_FILE"
        exit 1
    }
else
    echo "cloudflared tunnel token not available. Please download credentials manually:"
    echo "1. Go to: https://dash.cloudflare.com → Zero Trust → Networks → Tunnels"
    echo "2. Click on '$TUNNEL_NAME' → Configure → Download credentials"
    echo "3. Upload to server: scp <file>.json root@66.94.123.205:$CREDENTIALS_FILE"
    exit 1
fi

chmod 600 "$CREDENTIALS_FILE"
echo "Credentials saved. Starting tunnel service..."
systemctl restart cloudflared-antimony
systemctl status cloudflared-antimony --no-pager | head -10

