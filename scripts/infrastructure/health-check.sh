#!/bin/bash

# Infrastructure Health Check Script
# Monitors and validates the health of all GCP resources

set -euo pipefail

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-shivambhardwaj-portfolio}"
REGION="${GCP_REGION:-us-central1}"
ENVIRONMENT="${ENVIRONMENT:-production}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}" >&2; }
success() { echo -e "${GREEN}[SUCCESS] $1${NC}"; }
warning() { echo -e "${YELLOW}[WARNING] $1${NC}"; }

# Health check results
HEALTH_RESULTS=()
FAILED_CHECKS=0
WARNING_CHECKS=0
PASSED_CHECKS=0

# Add result to tracking
add_result() {
    local status="$1"
    local component="$2"
    local message="$3"
    local details="${4:-}"
    
    HEALTH_RESULTS+=("$status|$component|$message|$details")
    
    case "$status" in
        "PASS") ((PASSED_CHECKS++));;
        "FAIL") ((FAILED_CHECKS++));;
        "WARN") ((WARNING_CHECKS++));;
    esac
}

# Check if gcloud is authenticated and project is set
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        add_result "FAIL" "Prerequisites" "gcloud CLI not installed"
        return 1
    fi
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        add_result "FAIL" "Prerequisites" "Not authenticated with gcloud"
        return 1
    fi
    
    local current_project
    current_project=$(gcloud config get-value project 2>/dev/null || echo "")
    
    if [ "$current_project" != "$PROJECT_ID" ]; then
        gcloud config set project "$PROJECT_ID" &>/dev/null
        add_result "WARN" "Prerequisites" "Project was not set, corrected to $PROJECT_ID"
    else
        add_result "PASS" "Prerequisites" "All prerequisites met"
    fi
}

# Check App Engine application status
check_app_engine() {
    log "Checking App Engine application..."
    
    local app_info
    app_info=$(gcloud app describe --format="value(defaultHostname,servingStatus)" 2>/dev/null || echo "ERROR")
    
    if [ "$app_info" = "ERROR" ]; then
        add_result "FAIL" "App Engine" "Application not found or not accessible"
        return 1
    fi
    
    local hostname
    local status
    hostname=$(echo "$app_info" | cut -f1)
    status=$(echo "$app_info" | cut -f2)
    
    if [ "$status" = "SERVING" ]; then
        add_result "PASS" "App Engine" "Application is serving at https://$hostname"
        
        # Test application endpoint
        if curl -f -s "https://$hostname" > /dev/null 2>&1; then
            add_result "PASS" "App Engine Endpoint" "Homepage is accessible"
        else
            add_result "FAIL" "App Engine Endpoint" "Homepage is not accessible"
        fi
        
        # Test API endpoints
        if curl -f -s "https://$hostname/api/health" > /dev/null 2>&1; then
            add_result "PASS" "API Health" "Health endpoint is responding"
        else
            add_result "WARN" "API Health" "Health endpoint not found or not responding"
        fi
        
    else
        add_result "FAIL" "App Engine" "Application status: $status"
    fi
}

# Check service versions and traffic allocation
check_app_versions() {
    log "Checking App Engine versions..."
    
    local versions
    versions=$(gcloud app versions list --format="value(id,traffic_split,createTime)" 2>/dev/null || echo "")
    
    if [ -z "$versions" ]; then
        add_result "FAIL" "App Versions" "No versions found"
        return 1
    fi
    
    local active_versions=0
    local total_versions=0
    local latest_version=""
    
    while IFS=$'\t' read -r version traffic create_time; do
        ((total_versions++))
        
        if [ "$traffic" != "0" ]; then
            ((active_versions++))
            latest_version="$version"
        fi
    done <<< "$versions"
    
    if [ $active_versions -eq 1 ]; then
        add_result "PASS" "App Versions" "$active_versions active version ($latest_version), $total_versions total versions"
    elif [ $active_versions -gt 1 ]; then
        add_result "WARN" "App Versions" "$active_versions active versions (traffic splitting), $total_versions total versions"
    else
        add_result "FAIL" "App Versions" "No active versions receiving traffic"
    fi
}

# Check Cloud Storage buckets
check_storage() {
    log "Checking Cloud Storage buckets..."
    
    local buckets=("${PROJECT_ID}-artifacts" "${PROJECT_ID}-static" "${PROJECT_ID}-terraform-state")
    
    for bucket in "${buckets[@]}"; do
        if gsutil ls "gs://$bucket" &>/dev/null; then
            local size
            size=$(gsutil du -s "gs://$bucket" 2>/dev/null | awk '{print $1}' || echo "0")
            add_result "PASS" "Storage Bucket" "gs://$bucket exists (${size} bytes)"
        else
            add_result "WARN" "Storage Bucket" "gs://$bucket not found"
        fi
    done
}

# Check service accounts and IAM
check_iam() {
    log "Checking IAM and service accounts..."
    
    local service_accounts=("deployment-sa" "monitoring-sa")
    
    for sa in "${service_accounts[@]}"; do
        local sa_email="${sa}@${PROJECT_ID}.iam.gserviceaccount.com"
        
        if gcloud iam service-accounts describe "$sa_email" &>/dev/null; then
            add_result "PASS" "Service Account" "$sa_email exists"
        else
            add_result "WARN" "Service Account" "$sa_email not found"
        fi
    done
    
    # Check Cloud Build service account permissions
    local build_sa_email
    build_sa_email=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")@cloudbuild.gserviceaccount.com
    
    local required_roles=("roles/appengine.deployer" "roles/cloudbuild.builds.builder")
    local missing_roles=0
    
    for role in "${required_roles[@]}"; do
        if ! gcloud projects get-iam-policy "$PROJECT_ID" --flatten="bindings[].members" --filter="bindings.role:$role AND bindings.members:serviceAccount:$build_sa_email" --format="value(bindings.role)" | grep -q "$role"; then
            ((missing_roles++))
        fi
    done
    
    if [ $missing_roles -eq 0 ]; then
        add_result "PASS" "IAM Permissions" "Cloud Build service account has required roles"
    else
        add_result "WARN" "IAM Permissions" "Cloud Build service account missing $missing_roles roles"
    fi
}

# Check enabled APIs
check_apis() {
    log "Checking enabled APIs..."
    
    local required_apis=(
        "appengine.googleapis.com"
        "cloudbuild.googleapis.com"
        "logging.googleapis.com"
        "monitoring.googleapis.com"
        "storage.googleapis.com"
    )
    
    local disabled_apis=0
    
    for api in "${required_apis[@]}"; do
        if gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
            continue
        else
            ((disabled_apis++))
        fi
    done
    
    if [ $disabled_apis -eq 0 ]; then
        add_result "PASS" "APIs" "All required APIs are enabled"
    else
        add_result "WARN" "APIs" "$disabled_apis required APIs are disabled"
    fi
}

# Check monitoring and alerting
check_monitoring() {
    log "Checking monitoring setup..."
    
    # Check if monitoring metrics are being received
    local metrics_query="resource.type=\"gae_app\" AND metric.type=\"appengine.googleapis.com/http/server/request_count\""
    local recent_metrics
    recent_metrics=$(gcloud logging read "$metrics_query" --limit=1 --format="value(timestamp)" --freshness=1d 2>/dev/null || echo "")
    
    if [ -n "$recent_metrics" ]; then
        add_result "PASS" "Monitoring Metrics" "Recent metrics found (last: ${recent_metrics})"
    else
        add_result "WARN" "Monitoring Metrics" "No recent metrics found or monitoring not configured"
    fi
    
    # Check alert policies
    local alert_policies
    alert_policies=$(gcloud alpha monitoring policies list --format="value(displayName)" 2>/dev/null | wc -l || echo "0")
    
    if [ "$alert_policies" -gt 0 ]; then
        add_result "PASS" "Alert Policies" "$alert_policies alert policies configured"
    else
        add_result "WARN" "Alert Policies" "No alert policies found"
    fi
    
    # Check uptime checks
    local uptime_checks
    uptime_checks=$(gcloud monitoring uptime list --format="value(displayName)" 2>/dev/null | wc -l || echo "0")
    
    if [ "$uptime_checks" -gt 0 ]; then
        add_result "PASS" "Uptime Checks" "$uptime_checks uptime checks configured"
    else
        add_result "WARN" "Uptime Checks" "No uptime checks configured"
    fi
}

# Check recent builds and deployments
check_builds() {
    log "Checking Cloud Build history..."
    
    local recent_builds
    recent_builds=$(gcloud builds list --limit=5 --format="value(id,status,createTime)" 2>/dev/null || echo "")
    
    if [ -z "$recent_builds" ]; then
        add_result "WARN" "Cloud Build" "No builds found"
        return 0
    fi
    
    local successful_builds=0
    local failed_builds=0
    local latest_status=""
    
    while IFS=$'\t' read -r build_id status create_time; do
        if [ -z "$latest_status" ]; then
            latest_status="$status"
        fi
        
        case "$status" in
            "SUCCESS") ((successful_builds++));;
            "FAILURE"|"CANCELLED"|"TIMEOUT") ((failed_builds++));;
        esac
    done <<< "$recent_builds"
    
    if [ "$latest_status" = "SUCCESS" ]; then
        add_result "PASS" "Cloud Build" "Latest build successful ($successful_builds successful, $failed_builds failed in recent builds)"
    elif [ "$latest_status" = "WORKING" ] || [ "$latest_status" = "QUEUED" ]; then
        add_result "WARN" "Cloud Build" "Build in progress (status: $latest_status)"
    else
        add_result "FAIL" "Cloud Build" "Latest build failed (status: $latest_status)"
    fi
}

# Check application performance metrics
check_performance() {
    log "Checking application performance..."
    
    local app_url
    app_url="https://$(gcloud app describe --format="value(defaultHostname)" 2>/dev/null || echo "unknown")"
    
    if [ "$app_url" = "https://unknown" ]; then
        add_result "FAIL" "Performance Check" "Cannot determine application URL"
        return 1
    fi
    
    # Test response time
    local start_time
    local end_time
    local response_time
    
    start_time=$(date +%s%N)
    
    if curl -f -s -o /dev/null -w "%{http_code}" "$app_url" | grep -q "200"; then
        end_time=$(date +%s%N)
        response_time=$(((end_time - start_time) / 1000000))  # Convert to milliseconds
        
        if [ $response_time -lt 2000 ]; then
            add_result "PASS" "Response Time" "${response_time}ms (under 2s threshold)"
        elif [ $response_time -lt 5000 ]; then
            add_result "WARN" "Response Time" "${response_time}ms (slow but acceptable)"
        else
            add_result "FAIL" "Response Time" "${response_time}ms (exceeds 5s threshold)"
        fi
    else
        add_result "FAIL" "Response Time" "Application not responding or returning errors"
    fi
}

# Check security configuration
check_security() {
    log "Checking security configuration..."
    
    local app_url
    app_url="https://$(gcloud app describe --format="value(defaultHostname)" 2>/dev/null || echo "unknown")"
    
    if [ "$app_url" = "https://unknown" ]; then
        add_result "FAIL" "Security Check" "Cannot determine application URL"
        return 1
    fi
    
    # Check HTTPS redirect
    local http_response
    http_response=$(curl -s -o /dev/null -w "%{http_code}" "${app_url/https/http}" || echo "000")
    
    if [ "$http_response" = "301" ] || [ "$http_response" = "302" ] || [ "$http_response" = "308" ]; then
        add_result "PASS" "HTTPS Redirect" "HTTP requests properly redirect to HTTPS"
    else
        add_result "WARN" "HTTPS Redirect" "HTTP redirect not configured or not working"
    fi
    
    # Check security headers
    local security_headers
    security_headers=$(curl -s -I "$app_url" | grep -i "x-frame-options\|x-content-type-options\|strict-transport-security" | wc -l)
    
    if [ "$security_headers" -ge 2 ]; then
        add_result "PASS" "Security Headers" "$security_headers security headers found"
    else
        add_result "WARN" "Security Headers" "Missing security headers (found: $security_headers)"
    fi
}

# Generate comprehensive report
generate_report() {
    log "Generating health check report..."
    
    local timestamp
    timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    cat > "health-check-report-$(date +%Y%m%d-%H%M%S).md" << EOF
# Infrastructure Health Check Report

**Project**: $PROJECT_ID  
**Environment**: $ENVIRONMENT  
**Timestamp**: $timestamp  
**Region**: $REGION

## Summary

- ✅ **Passed**: $PASSED_CHECKS
- ⚠️  **Warnings**: $WARNING_CHECKS
- ❌ **Failed**: $FAILED_CHECKS
- 📊 **Total Checks**: $((PASSED_CHECKS + WARNING_CHECKS + FAILED_CHECKS))

## Detailed Results

EOF
    
    for result in "${HEALTH_RESULTS[@]}"; do
        IFS='|' read -r status component message details <<< "$result"
        
        local icon
        case "$status" in
            "PASS") icon="✅";;
            "WARN") icon="⚠️";;
            "FAIL") icon="❌";;
        esac
        
        echo "### $icon $component" >> "health-check-report-$(date +%Y%m%d-%H%M%S).md"
        echo "**Status**: $status  " >> "health-check-report-$(date +%Y%m%d-%H%M%S).md"
        echo "**Message**: $message  " >> "health-check-report-$(date +%Y%m%d-%H%M%S).md"
        
        if [ -n "$details" ]; then
            echo "**Details**: $details  " >> "health-check-report-$(date +%Y%m%d-%H%M%S).md"
        fi
        
        echo "" >> "health-check-report-$(date +%Y%m%d-%H%M%S).md"
    done
    
    cat >> "health-check-report-$(date +%Y%m%d-%H%M%S).md" << EOF

## Recommendations

EOF
    
    if [ $FAILED_CHECKS -gt 0 ]; then
        echo "⚠️ **Critical Issues Found**: $FAILED_CHECKS failed checks require immediate attention." >> "health-check-report-$(date +%Y%m%d-%H%M%S).md"
        echo "" >> "health-check-report-$(date +%Y%m%d-%H%M%S).md"
    fi
    
    if [ $WARNING_CHECKS -gt 0 ]; then
        echo "📋 **Warnings**: $WARNING_CHECKS warnings should be addressed to improve system reliability." >> "health-check-report-$(date +%Y%m%d-%H%M%S).md"
        echo "" >> "health-check-report-$(date +%Y%m%d-%H%M%S).md"
    fi
    
    if [ $FAILED_CHECKS -eq 0 ] && [ $WARNING_CHECKS -eq 0 ]; then
        echo "🎉 **All Checks Passed**: Your infrastructure is healthy and operating optimally." >> "health-check-report-$(date +%Y%m%d-%H%M%S).md"
        echo "" >> "health-check-report-$(date +%Y%m%d-%H%M%S).md"
    fi
    
    cat >> "health-check-report-$(date +%Y%m%d-%H%M%S).md" << EOF

## Quick Actions

- **View Application**: [https://$(gcloud app describe --format="value(defaultHostname)" 2>/dev/null || echo "unknown")](https://$(gcloud app describe --format="value(defaultHostname)" 2>/dev/null || echo "unknown"))
- **GCP Console**: [https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID](https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID)
- **App Engine**: [https://console.cloud.google.com/appengine?project=$PROJECT_ID](https://console.cloud.google.com/appengine?project=$PROJECT_ID)
- **Monitoring**: [https://console.cloud.google.com/monitoring?project=$PROJECT_ID](https://console.cloud.google.com/monitoring?project=$PROJECT_ID)
- **Cloud Build**: [https://console.cloud.google.com/cloud-build?project=$PROJECT_ID](https://console.cloud.google.com/cloud-build?project=$PROJECT_ID)

---
*Generated by infrastructure health check script*
EOF
    
    success "Health check report generated: health-check-report-$(date +%Y%m%d-%H%M%S).md"
}

# Main execution
main() {
    log "Starting infrastructure health check for project: $PROJECT_ID"
    
    check_prerequisites
    check_app_engine
    check_app_versions
    check_storage
    check_iam
    check_apis
    check_monitoring
    check_builds
    check_performance
    check_security
    
    generate_report
    
    # Print summary to console
    echo
    echo "======================================"
    echo "  HEALTH CHECK SUMMARY"
    echo "======================================"
    echo "Project: $PROJECT_ID"
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo
    echo "Results:"
    echo "  ✅ Passed: $PASSED_CHECKS"
    echo "  ⚠️  Warnings: $WARNING_CHECKS"
    echo "  ❌ Failed: $FAILED_CHECKS"
    echo
    
    if [ $FAILED_CHECKS -gt 0 ]; then
        echo "❌ CRITICAL ISSUES DETECTED"
        echo "Review the detailed report for remediation steps."
        exit 1
    elif [ $WARNING_CHECKS -gt 0 ]; then
        echo "⚠️  WARNINGS FOUND"
        echo "System is functional but improvements recommended."
        exit 2
    else
        echo "✅ ALL CHECKS PASSED"
        echo "Infrastructure is healthy and operating optimally."
        exit 0
    fi
}

# Handle command line arguments
case "${1:-check}" in
    "check")
        main
        ;;
    "quick")
        log "Quick health check (essential services only)..."
        check_prerequisites
        check_app_engine
        check_performance
        success "Quick health check completed"
        ;;
    *)
        echo "Usage: $0 [check|quick]"
        exit 1
        ;;
esac