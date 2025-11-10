#!/bin/bash

# Visual E2E Test Runner Script
# This script runs visual tests on the server and can test against Vercel preview URLs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VERCEL_PREVIEW_URL="${VERCEL_PREVIEW_URL:-}"
BASE_URL="${TEST_BASE_URL:-http://localhost:3000}"
CLEAN_RESULTS="${CLEAN_RESULTS:-false}"

echo -e "${GREEN}🎨 Visual E2E Test Runner${NC}"
echo "================================"

# Clean old results if requested
if [ "$CLEAN_RESULTS" = "true" ]; then
  echo -e "${YELLOW}Cleaning old test results...${NC}"
  rm -rf public/test-results/*
  rm -rf test-results/*
fi

# Check if testing against Vercel preview
if [ -n "$VERCEL_PREVIEW_URL" ]; then
  echo -e "${GREEN}Testing against Vercel preview: $VERCEL_PREVIEW_URL${NC}"
  export TEST_BASE_URL="$VERCEL_PREVIEW_URL"
  
  # Wait for Vercel deployment to be ready
  echo "Waiting for Vercel deployment to be ready..."
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -s -f -o /dev/null "$VERCEL_PREVIEW_URL"; then
      echo -e "${GREEN}✓ Vercel preview is ready!${NC}"
      break
    fi
    
    attempt=$((attempt + 1))
    echo "Attempt $attempt/$max_attempts: Waiting for preview..."
    sleep 5
  done
  
  if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}✗ Vercel preview not ready after $max_attempts attempts${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}Testing against local server: $BASE_URL${NC}"
  export TEST_BASE_URL="$BASE_URL"
fi

# Run visual tests
echo ""
echo -e "${GREEN}Running visual tests...${NC}"
echo "================================"

if npm run test:e2e:visual; then
  echo ""
  echo -e "${GREEN}✓ Visual tests completed successfully!${NC}"
  echo ""
  echo "View results at: http://localhost:3000/test-viewer.html"
  echo "Or start dev server: npm run test:results:serve"
else
  echo ""
  echo -e "${RED}✗ Visual tests failed${NC}"
  exit 1
fi

