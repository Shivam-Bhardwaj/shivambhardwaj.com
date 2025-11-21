#!/bin/bash
# Start Cloudflare Tunnel with token authentication

TUNNEL_TOKEN="eyJhIjoiNWZiY2ZiNmI1NGRlZWUyY2ZkMjE1OTljZGIyNmIwMGYiLCJzIjoieEcxQ01IVTlpdTZuSitMUTNrUnhMdTYxdldIeGYvUHdsZW56WjhFb09tYz0iLCJ0IjoiYmYxOTkwOWQtZmExOC00Yzk0LTg1MjQtODdjMmIzYzBmNTM4In0="

cd /root/antimony-labs
pkill cloudflared 2>/dev/null || true
sleep 2

# Use --url for simpler setup (works better with token)
nohup cloudflared tunnel --url http://localhost:3000 run --token "$TUNNEL_TOKEN" > /tmp/cloudflared.log 2>&1 &

echo "Cloudflare tunnel started!"
echo "Logs: tail -f /tmp/cloudflared.log"
echo "Stop: pkill cloudflared"

