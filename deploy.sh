#!/bin/bash
set -e

echo ">>> Building Antimony Labs for Deployment..."

# Ensure cargo-leptos is installed
if ! command -v cargo-leptos &> /dev/null; then
    echo "cargo-leptos could not be found. Installing..."
    cargo install cargo-leptos
fi

# Build the project in release mode (CSS is already in app/style.css)
echo ">>> Compiling Rust (SSR + WASM)..."
cd antimony-labs
cargo leptos build --release

echo ">>> Building Docker Image..."
docker build -t antimony-labs:latest .

echo ">>> Deployment Build Complete!"
echo "To run locally: docker-compose up"
echo "To push to registry: docker tag antimony-labs:latest <your-registry>/antimony-labs && docker push ..."

