#!/bin/bash
# Script to fetch Cloudflare Tunnel credentials using API token

set -e

TUNNEL_ID="bf19909d-fa18-4c94-8524-87c2b3c0f538"
ACCOUNT_ID="" # Will be fetched automatically
CREDENTIALS_FILE="/root/.cloudflared/${TUNNEL_ID}.json"

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "Error: CLOUDFLARE_API_TOKEN environment variable not set"
    exit 1
fi

# Get account ID
ACCOUNT_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" | \
    grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ACCOUNT_ID" ]; then
    echo "Error: Could not fetch account ID. Check your API token permissions."
    exit 1
fi

# Fetch tunnel credentials
echo "Fetching tunnel credentials..."
curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/cfd_tunnel/${TUNNEL_ID}" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" | \
    grep -o '"tunnel_secret":"[^"]*' | cut -d'"' -f4 | \
    python3 -c "import sys, json; secret=sys.stdin.read().strip(); print(json.dumps({'AccountTag': '${ACCOUNT_ID}', 'TunnelID': '${TUNNEL_ID}', 'TunnelSecret': secret}))" > "$CREDENTIALS_FILE"

if [ -f "$CREDENTIALS_FILE" ]; then
    echo "Credentials saved to $CREDENTIALS_FILE"
    chmod 600 "$CREDENTIALS_FILE"
else
    echo "Error: Failed to fetch credentials"
    exit 1
fi

