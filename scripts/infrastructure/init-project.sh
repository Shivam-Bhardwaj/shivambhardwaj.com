#!/bin/bash

# GCP Project Initialization Script
# Sets up complete infrastructure for Shivam Bhardwaj Portfolio

set -euo pipefail

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-shivambhardwaj-portfolio}"
REGION="${GCP_REGION:-us-central1}"
ZONE="${GCP_ZONE:-us-central1-a}"
BILLING_ACCOUNT_ID="${BILLING_ACCOUNT_ID:-}"
ORG_ID="${ORG_ID:-}"

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        error "gcloud CLI is not installed"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        error "Terraform is not installed"
        exit 1
    fi
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        error "Not authenticated with gcloud. Run 'gcloud auth login'"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Create or select project
setup_project() {
    log "Setting up GCP project: $PROJECT_ID"
    
    # Check if project exists
    if gcloud projects describe "$PROJECT_ID" &>/dev/null; then
        log "Project $PROJECT_ID already exists"
    else
        log "Creating new project: $PROJECT_ID"
        
        if [ -n "$ORG_ID" ]; then
            gcloud projects create "$PROJECT_ID" --organization="$ORG_ID"
        else
            gcloud projects create "$PROJECT_ID"
        fi
    fi
    
    # Set current project
    gcloud config set project "$PROJECT_ID"
    
    # Link billing account if provided
    if [ -n "$BILLING_ACCOUNT_ID" ]; then
        log "Linking billing account: $BILLING_ACCOUNT_ID"
        gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT_ID"
    fi
    
    success "Project setup completed"
}

# Enable required APIs
enable_apis() {
    log "Enabling required APIs..."
    
    local apis=(
        "appengine.googleapis.com"
        "cloudbuild.googleapis.com"
        "cloudresourcemanager.googleapis.com"
        "iam.googleapis.com"
        "logging.googleapis.com"
        "monitoring.googleapis.com"
        "cloudtrace.googleapis.com"
        "clouddebugger.googleapis.com"
        "cloudprofiler.googleapis.com"
        "clouderrorreporting.googleapis.com"
        "secretmanager.googleapis.com"
        "storage.googleapis.com"
        "compute.googleapis.com"
        "servicenetworking.googleapis.com"
        "dns.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        log "Enabling $api..."
        gcloud services enable "$api" --quiet
    done
    
    success "APIs enabled successfully"
}

# Initialize App Engine
setup_app_engine() {
    log "Setting up App Engine..."
    
    if ! gcloud app describe &>/dev/null; then
        log "Creating App Engine application in region: $REGION"
        gcloud app create --region="$REGION" --quiet
    else
        log "App Engine application already exists"
    fi
    
    success "App Engine setup completed"
}

# Create service accounts
create_service_accounts() {
    log "Creating service accounts..."
    
    # Deployment service account
    local deploy_sa="deployment-sa"
    if ! gcloud iam service-accounts describe "${deploy_sa}@${PROJECT_ID}.iam.gserviceaccount.com" &>/dev/null; then
        gcloud iam service-accounts create "$deploy_sa" \
            --display-name="Deployment Service Account" \
            --description="Service account for automated deployments"
        
        # Grant necessary roles
        local roles=(
            "roles/appengine.appAdmin"
            "roles/cloudbuild.builds.builder"
            "roles/storage.objectAdmin"
            "roles/logging.logWriter"
            "roles/monitoring.metricWriter"
        )
        
        for role in "${roles[@]}"; do
            gcloud projects add-iam-policy-binding "$PROJECT_ID" \
                --member="serviceAccount:${deploy_sa}@${PROJECT_ID}.iam.gserviceaccount.com" \
                --role="$role" \
                --quiet
        done
    fi
    
    # Monitoring service account
    local monitor_sa="monitoring-sa"
    if ! gcloud iam service-accounts describe "${monitor_sa}@${PROJECT_ID}.iam.gserviceaccount.com" &>/dev/null; then
        gcloud iam service-accounts create "$monitor_sa" \
            --display-name="Monitoring Service Account" \
            --description="Service account for monitoring and alerting"
        
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
            --member="serviceAccount:${monitor_sa}@${PROJECT_ID}.iam.gserviceaccount.com" \
            --role="roles/monitoring.editor" \
            --quiet
    fi
    
    success "Service accounts created"
}

# Set up Cloud Storage buckets
setup_storage() {
    log "Setting up Cloud Storage buckets..."
    
    # Deployment artifacts bucket
    local artifacts_bucket="${PROJECT_ID}-artifacts"
    if ! gsutil ls "gs://$artifacts_bucket" &>/dev/null; then
        gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" "gs://$artifacts_bucket"
        gsutil versioning set on "gs://$artifacts_bucket"
        
        # Set lifecycle policy
        cat > /tmp/lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      },
      {
        "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
        "condition": {"age": 30}
      }
    ]
  }
}
EOF
        gsutil lifecycle set /tmp/lifecycle.json "gs://$artifacts_bucket"
        rm /tmp/lifecycle.json
    fi
    
    # Static assets bucket (if needed)
    local static_bucket="${PROJECT_ID}-static"
    if ! gsutil ls "gs://$static_bucket" &>/dev/null; then
        gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" "gs://$static_bucket"
        gsutil web set -m index.html -e 404.html "gs://$static_bucket"
    fi
    
    success "Storage buckets created"
}

# Configure Cloud Build
setup_cloud_build() {
    log "Setting up Cloud Build..."
    
    # Grant Cloud Build service account permissions
    local build_sa_email=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")@cloudbuild.gserviceaccount.com
    
    local roles=(
        "roles/appengine.deployer"
        "roles/appengine.serviceAdmin"
        "roles/cloudbuild.builds.builder"
        "roles/storage.objectViewer"
    )
    
    for role in "${roles[@]}"; do
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
            --member="serviceAccount:$build_sa_email" \
            --role="$role" \
            --quiet || warning "Failed to grant role $role to Cloud Build SA"
    done
    
    success "Cloud Build setup completed"
}

# Initialize Terraform state
setup_terraform() {
    log "Setting up Terraform backend..."
    
    local tf_bucket="${PROJECT_ID}-terraform-state"
    if ! gsutil ls "gs://$tf_bucket" &>/dev/null; then
        gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" "gs://$tf_bucket"
        gsutil versioning set on "gs://$tf_bucket"
        
        # Enable uniform bucket-level access
        gsutil uniformbucketlevelaccess set on "gs://$tf_bucket"
    fi
    
    # Create Terraform backend configuration
    cat > backend.tf << EOF
terraform {
  backend "gcs" {
    bucket = "$tf_bucket"
    prefix = "terraform/state"
  }
}
EOF
    
    success "Terraform backend configured"
}

# Set up monitoring workspace
setup_monitoring() {
    log "Setting up monitoring workspace..."
    
    # Monitoring workspace is automatically created when first metric is written
    # We'll create some basic alerting policies
    
    # Create notification channels configuration file
    cat > /tmp/notification-channels.yaml << EOF
channels:
  - type: email
    displayName: "Primary Alert Email"
    labels:
      email_address: "alerts@shivambhardwaj.com"
    enabled: true

  - type: webhook
    displayName: "Webhook Notifications"
    labels:
      url: "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
    enabled: false
EOF
    
    log "Monitoring configuration created at /tmp/notification-channels.yaml"
    log "Update the email and webhook URLs, then run the monitoring setup script"
    
    success "Monitoring workspace setup initiated"
}

# Create environment configuration
create_env_config() {
    log "Creating environment configuration..."
    
    cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
GCP_PROJECT_ID=$PROJECT_ID
GCP_REGION=$REGION
GOOGLE_CLOUD_PROJECT=$PROJECT_ID

# URLs (update after deployment)
NEXT_PUBLIC_API_URL=https://$PROJECT_ID.appspot.com
NEXT_PUBLIC_SITE_URL=https://$PROJECT_ID.appspot.com

# Monitoring
ENABLE_MONITORING=true
LOG_LEVEL=info

# Security
CORS_ORIGINS=https://$PROJECT_ID.appspot.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Generated on: $(date -u +%Y-%m-%dT%H:%M:%SZ)
# Project: $PROJECT_ID
# Region: $REGION
EOF
    
    cat > .env.staging << EOF
# Staging Environment Configuration
NODE_ENV=staging
GCP_PROJECT_ID=${PROJECT_ID}-staging
GCP_REGION=$REGION
GOOGLE_CLOUD_PROJECT=${PROJECT_ID}-staging

# URLs
NEXT_PUBLIC_API_URL=https://${PROJECT_ID}-staging.appspot.com
NEXT_PUBLIC_SITE_URL=https://${PROJECT_ID}-staging.appspot.com

# Monitoring
ENABLE_MONITORING=true
LOG_LEVEL=debug

# Security
CORS_ORIGINS=https://${PROJECT_ID}-staging.appspot.com
RATE_LIMIT_WINDOW=300000
RATE_LIMIT_MAX=50

# Generated on: $(date -u +%Y-%m-%dT%H:%M:%SZ)
# Project: ${PROJECT_ID}-staging
# Region: $REGION
EOF
    
    success "Environment configuration files created"
}

# Generate project summary
generate_summary() {
    log "Generating project summary..."
    
    cat > PROJECT_SETUP_SUMMARY.md << EOF
# GCP Project Setup Summary

## Project Information
- **Project ID**: $PROJECT_ID
- **Region**: $REGION
- **Zone**: $ZONE
- **Setup Date**: $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Resources Created

### App Engine
- Application region: $REGION
- Service: default (to be deployed)

### Service Accounts
- \`deployment-sa@$PROJECT_ID.iam.gserviceaccount.com\` - Deployment automation
- \`monitoring-sa@$PROJECT_ID.iam.gserviceaccount.com\` - Monitoring and alerting

### Storage Buckets
- \`$PROJECT_ID-artifacts\` - Build artifacts and deployment files
- \`$PROJECT_ID-static\` - Static assets (if needed)
- \`$PROJECT_ID-terraform-state\` - Terraform state files

### APIs Enabled
- App Engine Admin API
- Cloud Build API
- Cloud Resource Manager API
- Cloud IAM API
- Cloud Logging API
- Cloud Monitoring API
- Cloud Trace API
- Cloud Debugger API
- Cloud Profiler API
- Error Reporting API
- Secret Manager API
- Cloud Storage API

## Next Steps

1. **Configure Domain** (if using custom domain):
   \`\`\`bash
   gcloud app domain-mappings create your-domain.com
   \`\`\`

2. **Deploy Application**:
   \`\`\`bash
   ./scripts/deployment/deploy-gcp.sh
   \`\`\`

3. **Set up Monitoring**:
   \`\`\`bash
   ./monitoring/setup-monitoring.sh
   \`\`\`

4. **Configure CI/CD**:
   - Connect repository to Cloud Build
   - Set up build triggers
   - Configure deployment automation

5. **Security Configuration**:
   - Set up IAM roles and permissions
   - Configure firewall rules (if needed)
   - Set up SSL certificates for custom domains

## Environment Files
- \`.env.production\` - Production environment variables
- \`.env.staging\` - Staging environment variables

## Terraform Backend
- State bucket: \`$PROJECT_ID-terraform-state\`
- Configuration: \`backend.tf\`

## Monitoring and Alerting
- Workspace: Automatically created
- Configuration: \`/tmp/notification-channels.yaml\`
- Dashboards: Available in \`monitoring/dashboards/\`

## Support and Documentation
- GCP Console: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID
- App Engine: https://console.cloud.google.com/appengine?project=$PROJECT_ID
- Cloud Build: https://console.cloud.google.com/cloud-build?project=$PROJECT_ID
- Monitoring: https://console.cloud.google.com/monitoring?project=$PROJECT_ID

---
Generated by infrastructure initialization script
Run \`./scripts/infrastructure/init-project.sh\` to recreate this setup
EOF
    
    success "Project summary created: PROJECT_SETUP_SUMMARY.md"
}

# Main execution
main() {
    log "Starting GCP project initialization for: $PROJECT_ID"
    
    check_prerequisites
    setup_project
    enable_apis
    setup_app_engine
    create_service_accounts
    setup_storage
    setup_cloud_build
    setup_terraform
    setup_monitoring
    create_env_config
    generate_summary
    
    success "GCP project initialization completed successfully!"
    
    echo
    echo "======================================"
    echo "  PROJECT SETUP COMPLETE"
    echo "======================================"
    echo "Project ID: $PROJECT_ID"
    echo "Region: $REGION"
    echo "Console: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID"
    echo "Summary: PROJECT_SETUP_SUMMARY.md"
    echo
    echo "Next steps:"
    echo "1. Review environment configuration files"
    echo "2. Deploy the application: ./scripts/deployment/deploy-gcp.sh"
    echo "3. Set up monitoring: ./monitoring/setup-monitoring.sh"
    echo "4. Configure custom domain (optional)"
    echo
}

# Handle command line arguments
case "${1:-init}" in
    "init")
        main
        ;;
    "clean")
        log "This would delete project resources. Not implemented for safety."
        log "To delete the project: gcloud projects delete $PROJECT_ID"
        ;;
    "status")
        log "Checking project status..."
        gcloud projects describe "$PROJECT_ID" 2>/dev/null || error "Project not found"
        gcloud app describe --project="$PROJECT_ID" 2>/dev/null || warning "App Engine not initialized"
        ;;
    *)
        echo "Usage: $0 [init|clean|status]"
        exit 1
        ;;
esac