#!/bin/bash

# GCP App Engine Rollback Script
# Quickly rollback to a previous version in case of deployment issues

set -euo pipefail

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-shivambhardwaj-portfolio}"
SERVICE_NAME="${GCP_SERVICE:-default}"

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

# Show available versions
show_versions() {
    log "Available versions for service '$SERVICE_NAME':"
    echo
    
    gcloud app versions list \
        --service="$SERVICE_NAME" \
        --format="table(id,createTime.date(),traffic_split)" \
        --sort-by="~createTime"
    
    echo
}

# Get current active version
get_current_version() {
    gcloud app versions list \
        --service="$SERVICE_NAME" \
        --format="value(id)" \
        --filter="traffic_split>0" | head -n1
}

# Rollback to specific version
rollback_to_version() {
    local target_version="$1"
    
    if [ -z "$target_version" ]; then
        error "No target version specified"
        return 1
    fi
    
    # Check if version exists
    local version_exists=$(gcloud app versions list \
        --service="$SERVICE_NAME" \
        --format="value(id)" \
        --filter="id:$target_version" | wc -l)
    
    if [ "$version_exists" -eq 0 ]; then
        error "Version '$target_version' does not exist"
        return 1
    fi
    
    local current_version=$(get_current_version)
    
    if [ "$current_version" == "$target_version" ]; then
        warning "Version '$target_version' is already active"
        return 0
    fi
    
    log "Rolling back from '$current_version' to '$target_version'..."
    
    # Perform the rollback
    gcloud app services set-traffic "$SERVICE_NAME" \
        --splits="$target_version=100" \
        --quiet
    
    if [ $? -eq 0 ]; then
        success "Rollback completed successfully!"
        log "Active version is now: $target_version"
        
        # Health check after rollback
        health_check_after_rollback
        
        # Log the rollback event
        log_rollback_event "$current_version" "$target_version"
    else
        error "Rollback failed"
        return 1
    fi
}

# Quick rollback to previous version
quick_rollback() {
    log "Performing quick rollback to previous version..."
    
    local current_version=$(get_current_version)
    
    # Get the second most recent version (previous)
    local previous_version=$(gcloud app versions list \
        --service="$SERVICE_NAME" \
        --format="value(id)" \
        --sort-by="~createTime" | sed -n '2p')
    
    if [ -z "$previous_version" ]; then
        error "No previous version found to rollback to"
        return 1
    fi
    
    log "Current version: $current_version"
    log "Previous version: $previous_version"
    
    rollback_to_version "$previous_version"
}

# Health check after rollback
health_check_after_rollback() {
    log "Performing health check after rollback..."
    
    local app_url=$(gcloud app describe --format="value(defaultHostname)")
    local health_url="https://$app_url/api/health"
    
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts"
        
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            success "Health check passed! Application is responding correctly."
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            warning "Health check failed after $max_attempts attempts"
            warning "The rollback completed but the application may need additional time to start"
            return 1
        fi
        
        sleep 5
        ((attempt++))
    done
}

# Log rollback event
log_rollback_event() {
    local from_version="$1"
    local to_version="$2"
    
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Create rollback log entry
    echo "{
        \"event\": \"rollback\",
        \"timestamp\": \"$timestamp\",
        \"from_version\": \"$from_version\",
        \"to_version\": \"$to_version\",
        \"project_id\": \"$PROJECT_ID\",
        \"service\": \"$SERVICE_NAME\"
    }" >> rollback.log
    
    log "Rollback event logged to rollback.log"
}

# Traffic splitting for gradual rollback
gradual_rollback() {
    local target_version="$1"
    local percentage="${2:-50}"
    
    if [ -z "$target_version" ]; then
        error "No target version specified for gradual rollback"
        return 1
    fi
    
    log "Starting gradual rollback to version '$target_version' with $percentage% traffic..."
    
    local current_version=$(get_current_version)
    local remaining_percentage=$((100 - percentage))
    
    gcloud app services set-traffic "$SERVICE_NAME" \
        --splits="$target_version=$percentage,$current_version=$remaining_percentage" \
        --quiet
    
    if [ $? -eq 0 ]; then
        success "Gradual rollback started!"
        log "Traffic split: $target_version ($percentage%) | $current_version ($remaining_percentage%)"
        log "Monitor the application and use 'complete-rollback' if stable"
    else
        error "Gradual rollback failed"
        return 1
    fi
}

# Complete gradual rollback
complete_rollback() {
    local target_version="$1"
    
    if [ -z "$target_version" ]; then
        error "No target version specified to complete rollback"
        return 1
    fi
    
    log "Completing rollback - directing 100% traffic to '$target_version'..."
    
    gcloud app services set-traffic "$SERVICE_NAME" \
        --splits="$target_version=100" \
        --quiet
    
    if [ $? -eq 0 ]; then
        success "Rollback completed! All traffic now goes to version '$target_version'"
        health_check_after_rollback
    else
        error "Failed to complete rollback"
        return 1
    fi
}

# Show help
show_help() {
    echo "GCP App Engine Rollback Script"
    echo
    echo "Usage: $0 [command] [options]"
    echo
    echo "Commands:"
    echo "  list                          Show all available versions"
    echo "  quick                         Rollback to the previous version"
    echo "  rollback <version>            Rollback to specific version"
    echo "  gradual <version> [percent]   Start gradual rollback (default 50%)"
    echo "  complete <version>            Complete gradual rollback to 100%"
    echo "  current                       Show current active version"
    echo "  help                          Show this help message"
    echo
    echo "Examples:"
    echo "  $0 list                       # Show available versions"
    echo "  $0 quick                      # Quick rollback to previous version"
    echo "  $0 rollback v20231215-143022  # Rollback to specific version"
    echo "  $0 gradual v20231215-143022 25 # Route 25% traffic to target version"
    echo "  $0 complete v20231215-143022  # Complete rollback to target version"
    echo
}

# Main script logic
case "${1:-help}" in
    "list")
        show_versions
        ;;
    "quick")
        quick_rollback
        ;;
    "rollback")
        if [ -z "${2:-}" ]; then
            error "Usage: $0 rollback <version>"
            exit 1
        fi
        rollback_to_version "$2"
        ;;
    "gradual")
        if [ -z "${2:-}" ]; then
            error "Usage: $0 gradual <version> [percentage]"
            exit 1
        fi
        gradual_rollback "$2" "${3:-50}"
        ;;
    "complete")
        if [ -z "${2:-}" ]; then
            error "Usage: $0 complete <version>"
            exit 1
        fi
        complete_rollback "$2"
        ;;
    "current")
        current=$(get_current_version)
        echo "Current active version: $current"
        ;;
    "help"|*)
        show_help
        ;;
esac