#!/bin/bash

# Google Cloud Platform Deployment Script
# Automated deployment to App Engine with comprehensive error handling and monitoring

set -euo pipefail

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-shivambhardwaj-portfolio}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${GCP_SERVICE:-shivambhardwaj-portfolio}"
VERSION="${VERSION:-$(date +%Y%m%d-%H%M%S)}"
ENVIRONMENT="${ENVIRONMENT:-production}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        error "Not authenticated with gcloud. Run 'gcloud auth login' first."
        exit 1
    fi
    
    # Check if project is set
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
    if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
        log "Setting project to $PROJECT_ID"
        gcloud config set project "$PROJECT_ID"
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install it first."
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Enable required GCP APIs
enable_apis() {
    log "Enabling required Google Cloud APIs..."
    
    local apis=(
        "appengine.googleapis.com"
        "cloudbuild.googleapis.com"
        "logging.googleapis.com"
        "monitoring.googleapis.com"
        "cloudtrace.googleapis.com"
        "clouddebugger.googleapis.com"
        "secretmanager.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        log "Enabling $api..."
        gcloud services enable "$api" --quiet
    done
    
    success "APIs enabled successfully"
}

# Build the application
build_application() {
    log "Building application..."
    
    # Clean previous builds
    rm -rf .next/
    rm -rf dist/
    
    # Install dependencies
    log "Installing dependencies..."
    npm ci --production=false
    
    # Run type checking
    log "Running type check..."
    npm run type-check
    
    # Run linting
    log "Running linter..."
    npm run lint
    
    # Run tests
    log "Running tests..."
    npm test -- --coverage --watchAll=false
    
    # Build for production
    log "Building for production..."
    npm run build
    
    success "Application built successfully"
}

# Deploy to App Engine
deploy_to_appengine() {
    log "Deploying to App Engine..."
    
    # Create deployment version
    local deployment_version="v${VERSION}"
    
    # Deploy with version
    gcloud app deploy app.yaml \
        --version="$deployment_version" \
        --promote \
        --stop-previous-version \
        --quiet
    
    # Get the deployed URL
    local app_url=$(gcloud app describe --format="value(defaultHostname)")
    
    success "Deployment completed successfully!"
    log "Application URL: https://$app_url"
    
    # Store deployment info
    echo "{
        \"version\": \"$deployment_version\",
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"url\": \"https://$app_url\",
        \"environment\": \"$ENVIRONMENT\",
        \"project_id\": \"$PROJECT_ID\"
    }" > .deployment-info.json
    
    return 0
}

# Health check
health_check() {
    log "Performing health check..."
    
    local app_url=$(gcloud app describe --format="value(defaultHostname)")
    local health_url="https://$app_url/api/health"
    
    # Wait for deployment to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts"
        
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            success "Health check passed!"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Health check failed after $max_attempts attempts"
            return 1
        fi
        
        sleep 10
        ((attempt++))
    done
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring and alerting..."
    
    # Create log-based metrics
    gcloud logging metrics create deployment_errors \
        --description="Count of deployment errors" \
        --log-filter='resource.type="gae_app" AND severity>=ERROR' \
        --quiet || true
    
    gcloud logging metrics create response_time \
        --description="Application response time" \
        --log-filter='resource.type="gae_app" AND httpRequest.requestMethod!=""' \
        --quiet || true
    
    # Create alerting policies (requires monitoring workspace)
    log "Monitoring setup completed (manual alerting configuration required)"
}

# Cleanup old versions
cleanup_old_versions() {
    log "Cleaning up old versions..."
    
    # Keep only the last 5 versions
    local versions_to_delete=$(gcloud app versions list --format="value(id)" --sort-by="~createTime" | tail -n +6)
    
    if [ -n "$versions_to_delete" ]; then
        for version in $versions_to_delete; do
            log "Deleting old version: $version"
            gcloud app versions delete "$version" --quiet || true
        done
        success "Old versions cleaned up"
    else
        log "No old versions to clean up"
    fi
}

# Rollback function
rollback() {
    local previous_version="$1"
    
    if [ -z "$previous_version" ]; then
        error "No previous version specified for rollback"
        return 1
    fi
    
    warning "Rolling back to version: $previous_version"
    
    gcloud app services set-traffic default \
        --splits="$previous_version=100" \
        --quiet
    
    success "Rollback completed to version: $previous_version"
}

# Main deployment function
main() {
    log "Starting deployment process..."
    log "Project: $PROJECT_ID"
    log "Environment: $ENVIRONMENT"
    log "Version: $VERSION"
    
    # Store current version for potential rollback
    local current_version=""
    current_version=$(gcloud app versions list --service=default --format="value(id)" --filter="traffic_split>0" | head -n1) || true
    
    # Trap errors for rollback
    trap 'error "Deployment failed!"; if [ -n "$current_version" ] && [ "$current_version" != "v$VERSION" ]; then rollback "$current_version"; fi; exit 1' ERR
    
    check_prerequisites
    enable_apis
    build_application
    deploy_to_appengine
    health_check
    setup_monitoring
    cleanup_old_versions
    
    success "Deployment completed successfully!"
    log "Version: v$VERSION"
    log "Environment: $ENVIRONMENT"
    
    # Send success notification
    log "Deployment summary:"
    log "- Project: $PROJECT_ID"
    log "- Version: v$VERSION"
    log "- URL: https://$(gcloud app describe --format="value(defaultHostname)")"
    log "- Status: SUCCESS"
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        if [ -z "${2:-}" ]; then
            error "Usage: $0 rollback <version>"
            exit 1
        fi
        rollback "$2"
        ;;
    "health-check")
        health_check
        ;;
    "cleanup")
        cleanup_old_versions
        ;;
    *)
        echo "Usage: $0 [deploy|rollback <version>|health-check|cleanup]"
        exit 1
        ;;
esac