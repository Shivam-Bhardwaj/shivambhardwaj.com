#!/bin/bash

# Custom Domain Setup Script for shivambhardwaj.com
# Configures App Engine custom domain mapping and SSL certificates

set -euo pipefail

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-shivambhardwaj-portfolio}"
DOMAIN="${CUSTOM_DOMAIN:-shivambhardwaj.com}"
SUBDOMAIN="${SUBDOMAIN:-www.shivambhardwaj.com}"

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
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        error "Not authenticated with gcloud. Run 'gcloud auth login'"
        exit 1
    fi
    
    # Set project
    gcloud config set project "$PROJECT_ID" &>/dev/null
    
    # Check if App Engine app exists
    if ! gcloud app describe &>/dev/null; then
        error "App Engine application not found. Deploy your application first."
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Verify domain ownership
verify_domain_ownership() {
    log "Verifying domain ownership for $DOMAIN..."
    
    # Check if domain is already verified
    local verified_domains
    verified_domains=$(gcloud domains list-user-verified --format="value(id)" 2>/dev/null || echo "")
    
    if echo "$verified_domains" | grep -q "$DOMAIN"; then
        success "Domain $DOMAIN is already verified"
        return 0
    fi
    
    log "Domain verification required. Starting verification process..."
    
    # Start domain verification
    gcloud domains verify "$DOMAIN" --quiet || {
        warning "Automatic domain verification failed"
        echo
        echo "Manual Domain Verification Required:"
        echo "1. Go to: https://www.google.com/webmasters/verification/"
        echo "2. Add and verify your domain: $DOMAIN"
        echo "3. Use one of these methods:"
        echo "   - Upload HTML file to your current website"
        echo "   - Add DNS TXT record"
        echo "   - Add HTML meta tag to your homepage"
        echo "4. Run this script again after verification"
        echo
        exit 1
    }
    
    success "Domain verification completed"
}

# Create SSL certificate
create_ssl_certificate() {
    log "Creating managed SSL certificate..."
    
    local cert_name="${DOMAIN//./-}-ssl"
    
    # Check if certificate already exists
    if gcloud app ssl-certificates list --format="value(name)" | grep -q "$cert_name"; then
        log "SSL certificate $cert_name already exists"
        return 0
    fi
    
    # Create managed SSL certificate
    gcloud app ssl-certificates create "$cert_name" \
        --domains="$DOMAIN,$SUBDOMAIN" \
        --global \
        --quiet
    
    success "SSL certificate $cert_name created"
}

# Create domain mapping
create_domain_mapping() {
    log "Creating domain mapping for $DOMAIN..."
    
    # Check if domain mapping already exists
    if gcloud app domain-mappings list --format="value(id)" | grep -q "$DOMAIN"; then
        log "Domain mapping for $DOMAIN already exists"
        
        # Show current mapping details
        gcloud app domain-mappings describe "$DOMAIN" --format="yaml"
        return 0
    fi
    
    # Create domain mapping
    log "Creating domain mapping..."
    gcloud app domain-mappings create "$DOMAIN" \
        --certificate-management=AUTOMATIC \
        --quiet
    
    success "Domain mapping created for $DOMAIN"
}

# Create subdomain mapping
create_subdomain_mapping() {
    log "Creating subdomain mapping for $SUBDOMAIN..."
    
    # Check if subdomain mapping already exists
    if gcloud app domain-mappings list --format="value(id)" | grep -q "$SUBDOMAIN"; then
        log "Domain mapping for $SUBDOMAIN already exists"
        return 0
    fi
    
    # Create subdomain mapping
    log "Creating subdomain mapping..."
    gcloud app domain-mappings create "$SUBDOMAIN" \
        --certificate-management=AUTOMATIC \
        --quiet
    
    success "Subdomain mapping created for $SUBDOMAIN"
}

# Get DNS configuration
get_dns_configuration() {
    log "Getting DNS configuration requirements..."
    
    echo
    echo "======================================"
    echo "  DNS CONFIGURATION REQUIRED"
    echo "======================================"
    echo
    
    # Get the required DNS records
    local domain_mapping_info
    domain_mapping_info=$(gcloud app domain-mappings describe "$DOMAIN" --format="yaml" 2>/dev/null || echo "")
    
    if [ -n "$domain_mapping_info" ]; then
        echo "Required DNS Records for $DOMAIN:"
        echo
        
        # Extract A and AAAA records
        local a_records
        local aaaa_records
        
        a_records=$(echo "$domain_mapping_info" | grep -A 20 "resourceRecords:" | grep "rrdata:" | grep -E "^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$" || echo "")
        aaaa_records=$(echo "$domain_mapping_info" | grep -A 20 "resourceRecords:" | grep "rrdata:" | grep -E "^[0-9a-fA-F:]+$" || echo "")
        
        echo "A Records (IPv4):"
        if [ -n "$a_records" ]; then
            echo "$a_records" | sed 's/^/  /'
        else
            echo "  216.239.32.21"
            echo "  216.239.34.21"
            echo "  216.239.36.21"
            echo "  216.239.38.21"
        fi
        
        echo
        echo "AAAA Records (IPv6):"
        if [ -n "$aaaa_records" ]; then
            echo "$aaaa_records" | sed 's/^/  /'
        else
            echo "  2001:4860:4802:32::15"
            echo "  2001:4860:4802:34::15"
            echo "  2001:4860:4802:36::15"
            echo "  2001:4860:4802:38::15"
        fi
    fi
    
    echo
    echo "======================================"
    echo "  CLOUDFLARE DNS SETUP INSTRUCTIONS"
    echo "======================================"
    echo
    echo "1. Log in to your Cloudflare dashboard"
    echo "2. Select your domain: $DOMAIN"
    echo "3. Go to DNS settings"
    echo "4. Update/Add the following DNS records:"
    echo
    echo "   Root Domain ($DOMAIN):"
    echo "   - Type: A, Name: @, Value: 216.239.32.21"
    echo "   - Type: A, Name: @, Value: 216.239.34.21"
    echo "   - Type: A, Name: @, Value: 216.239.36.21" 
    echo "   - Type: A, Name: @, Value: 216.239.38.21"
    echo
    echo "   Subdomain ($SUBDOMAIN):"
    echo "   - Type: CNAME, Name: www, Value: ghs.googlehosted.com"
    echo
    echo "5. Set Proxy status to 'DNS only' (gray cloud) for these records"
    echo "6. Wait for DNS propagation (5-15 minutes)"
    echo "7. Run the verification command below"
    echo
}

# Verify DNS propagation
verify_dns_propagation() {
    log "Verifying DNS propagation..."
    
    local max_attempts=30
    local attempt=1
    
    echo "Checking DNS resolution for $DOMAIN..."
    
    while [ $attempt -le $max_attempts ]; do
        log "DNS check attempt $attempt/$max_attempts"
        
        # Check if domain resolves to App Engine
        local resolved_ip
        resolved_ip=$(dig +short "$DOMAIN" @8.8.8.8 | head -n1 || echo "")
        
        if [ -n "$resolved_ip" ]; then
            # Check if it's one of the App Engine IPs
            case "$resolved_ip" in
                216.239.32.*|216.239.34.*|216.239.36.*|216.239.38.*)
                    success "DNS propagation completed! $DOMAIN resolves to $resolved_ip"
                    return 0
                    ;;
            esac
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            warning "DNS propagation not complete after $max_attempts attempts"
            echo "Current resolution: $resolved_ip"
            echo "Expected: App Engine IP (216.239.x.x)"
            return 1
        fi
        
        sleep 30
        ((attempt++))
    done
}

# Test SSL certificate
test_ssl_certificate() {
    log "Testing SSL certificate..."
    
    local max_attempts=20
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "SSL check attempt $attempt/$max_attempts"
        
        if curl -I "https://$DOMAIN" --connect-timeout 10 &>/dev/null; then
            success "SSL certificate is working for https://$DOMAIN"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            warning "SSL certificate not ready after $max_attempts attempts"
            warning "This can take up to 24 hours for managed certificates"
            return 1
        fi
        
        sleep 30
        ((attempt++))
    done
}

# Test application access
test_application() {
    log "Testing application access..."
    
    local test_urls=("https://$DOMAIN" "https://$SUBDOMAIN" "https://$DOMAIN/api/health")
    
    for url in "${test_urls[@]}"; do
        log "Testing: $url"
        
        local response_code
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --connect-timeout 10 || echo "000")
        
        case "$response_code" in
            200)
                success "$url - OK (200)"
                ;;
            301|302|308)
                success "$url - Redirect ($response_code)"
                ;;
            *)
                warning "$url - Response code: $response_code"
                ;;
        esac
    done
}

# Generate post-setup report
generate_report() {
    log "Generating custom domain setup report..."
    
    local timestamp
    timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    local app_url
    app_url="https://$(gcloud app describe --format="value(defaultHostname)" 2>/dev/null)"
    
    cat > "custom-domain-setup-report.md" << EOF
# Custom Domain Setup Report

**Project**: $PROJECT_ID  
**Domain**: $DOMAIN  
**Subdomain**: $SUBDOMAIN  
**Setup Date**: $timestamp

## Configuration Summary

### App Engine Application
- **Default URL**: $app_url
- **Custom Domain**: https://$DOMAIN
- **Subdomain**: https://$SUBDOMAIN

### SSL Certificates
- **Management**: Automatic (Google-managed)
- **Domains**: $DOMAIN, $SUBDOMAIN
- **Status**: Provisioning (may take up to 24 hours)

### DNS Configuration
The following DNS records were configured in Cloudflare:

#### Root Domain ($DOMAIN)
- A @ 216.239.32.21
- A @ 216.239.34.21  
- A @ 216.239.36.21
- A @ 216.239.38.21

#### Subdomain ($SUBDOMAIN)
- CNAME www ghs.googlehosted.com

## Verification Commands

Test your domain setup:

\`\`\`bash
# Check DNS resolution
dig $DOMAIN @8.8.8.8
dig $SUBDOMAIN @8.8.8.8

# Test HTTPS access
curl -I https://$DOMAIN
curl -I https://$SUBDOMAIN

# Check SSL certificate
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN
\`\`\`

## Monitoring and Management

### GCP Console Links
- **App Engine**: [https://console.cloud.google.com/appengine/settings/domains?project=$PROJECT_ID](https://console.cloud.google.com/appengine/settings/domains?project=$PROJECT_ID)
- **SSL Certificates**: [https://console.cloud.google.com/appengine/settings/certificates?project=$PROJECT_ID](https://console.cloud.google.com/appengine/settings/certificates?project=$PROJECT_ID)
- **Domain Mappings**: [https://console.cloud.google.com/appengine/settings/domains?project=$PROJECT_ID](https://console.cloud.google.com/appengine/settings/domains?project=$PROJECT_ID)

### Cloudflare Dashboard
- **DNS Settings**: [https://dash.cloudflare.com/$DOMAIN/dns](https://dash.cloudflare.com/$DOMAIN/dns)
- **SSL/TLS**: [https://dash.cloudflare.com/$DOMAIN/ssl-tls](https://dash.cloudflare.com/$DOMAIN/ssl-tls)

## Troubleshooting

### Common Issues

1. **DNS Not Propagating**
   - Wait 5-15 minutes for propagation
   - Check DNS with: \`dig $DOMAIN @8.8.8.8\`
   - Ensure Cloudflare proxy is disabled (gray cloud)

2. **SSL Certificate Issues**
   - Managed certificates take up to 24 hours
   - Check certificate status in GCP console
   - Verify domain ownership is complete

3. **502/503 Errors**
   - Ensure App Engine application is deployed and serving
   - Check application logs: \`gcloud app logs tail -s default\`

### Support Commands

\`\`\`bash
# Check domain mapping status
gcloud app domain-mappings list

# Describe specific domain
gcloud app domain-mappings describe $DOMAIN

# Check SSL certificates
gcloud app ssl-certificates list

# View application status
gcloud app describe
\`\`\`

## Next Steps

1. ✅ Custom domain configured
2. ⏳ Wait for SSL certificate provisioning (up to 24 hours)
3. ⏳ Verify DNS propagation globally
4. 🔍 Test all endpoints and redirects
5. 📊 Update monitoring to include custom domain
6. 🚀 Announce the new domain!

---
*Generated by custom domain setup script*  
*Project: $PROJECT_ID*
EOF
    
    success "Custom domain setup report generated: custom-domain-setup-report.md"
}

# Main execution
main() {
    log "Starting custom domain setup for $DOMAIN"
    
    check_prerequisites
    verify_domain_ownership
    create_domain_mapping
    create_subdomain_mapping
    get_dns_configuration
    generate_report
    
    success "Custom domain configuration completed!"
    
    echo
    echo "======================================"
    echo "  CUSTOM DOMAIN SETUP COMPLETE"
    echo "======================================"
    echo "Domain: $DOMAIN"
    echo "Subdomain: $SUBDOMAIN"
    echo "Project: $PROJECT_ID"
    echo
    echo "⚠️  IMPORTANT NEXT STEPS:"
    echo "1. Update DNS records in Cloudflare (see above)"
    echo "2. Wait for DNS propagation (5-15 minutes)"
    echo "3. Wait for SSL certificate (up to 24 hours)"
    echo "4. Test your domain: https://$DOMAIN"
    echo
    echo "📋 Verification commands:"
    echo "  ./scripts/infrastructure/setup-custom-domain.sh verify"
    echo "  curl -I https://$DOMAIN"
    echo
}

# Handle command line arguments
case "${1:-setup}" in
    "setup")
        main
        ;;
    "verify")
        log "Verifying custom domain setup..."
        verify_dns_propagation
        test_ssl_certificate
        test_application
        ;;
    "status")
        log "Checking domain mapping status..."
        gcloud app domain-mappings list
        echo
        gcloud app ssl-certificates list
        ;;
    "dns")
        get_dns_configuration
        ;;
    *)
        echo "Usage: $0 [setup|verify|status|dns]"
        echo
        echo "Commands:"
        echo "  setup   - Configure custom domain mapping"
        echo "  verify  - Verify DNS and SSL setup"
        echo "  status  - Show current domain status"
        echo "  dns     - Show DNS configuration requirements"
        exit 1
        ;;
esac