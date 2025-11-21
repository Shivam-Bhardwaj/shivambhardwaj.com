#!/bin/bash
# Start the Antimony Labs server
# This script ensures the server runs in the background and restarts if it crashes

cd /root/antimony-labs
source $HOME/.cargo/env

# Kill any existing server
pkill -f "target/release/server" 2>/dev/null || true
sleep 1

# Start the server
nohup ./target/release/server > server.log 2>&1 &

echo "Server started! PID: $(pgrep -f 'target/release/server')"
echo "Logs: tail -f /root/antimony-labs/server.log"
echo "Stop: pkill -f 'target/release/server'"

