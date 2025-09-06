export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  readTime: string;
  author: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'ai-context-kubernetes-deployment',
    title: 'AI Context: Building a Kubernetes Microservice',
    date: '2025-01-08',
    excerpt: 'A comprehensive guide for AI assistants and developers working with Kubernetes microservice deployments, covering Node.js, Docker, and AWS EKS.',
    readTime: '8 min read',
    author: 'Shivam Bhardwaj',
    tags: ['Kubernetes', 'Docker', 'AWS', 'Node.js', 'DevOps'],
    content: `
# AI Context: Building a Kubernetes Microservice

This guide provides context and instructions for working with a Kubernetes microservice deployment, specifically designed for AI assistants and developers collaborating on containerized applications.

## Project Overview

**Type**: Kubernetes microservice deployment
**Stack**: Node.js, Docker, Kubernetes (EKS)
**Purpose**: Simple "Hello World" application demonstrating containerized deployment on AWS EKS

## Repository Structure

\`\`\`
antimony-labs/
└── hello-eks/
    ├── hello-world-app/
    │   ├── app.js          # Node.js HTTP server (port 8080)
    │   └── Dockerfile       # Container definition (Node.js 18)
    ├── deployment.yaml      # Kubernetes deployment manifest
    └── service.yaml         # Kubernetes LoadBalancer service
\`\`\`

## Technical Details

### Application
- **Runtime**: Node.js 18
- **Port**: 8080
- **Endpoint**: Root path returns "Hello World"
- **Dependencies**: None (uses built-in http module)

### Container Registry
- **Registry**: AWS ECR
- **Region**: us-west-2
- **Image**: 841176797870.dkr.ecr.us-west-2.amazonaws.com/hello-world-app:latest

### Kubernetes Configuration
- **Deployment**: Single replica
- **Service Type**: LoadBalancer
- **External Port**: 80
- **Internal Port**: 8080

## Development Commands

### Local Development
\`\`\`bash
# Run application locally
cd hello-eks/hello-world-app
node app.js

# Build Docker image
docker build -t hello-world-app .

# Run container locally
docker run -p 8080:8080 hello-world-app

# Test endpoint
curl http://localhost:8080
\`\`\`

### AWS ECR Operations
\`\`\`bash
# Login to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 841176797870.dkr.ecr.us-west-2.amazonaws.com

# Tag image for ECR
docker tag hello-world-app:latest 841176797870.dkr.ecr.us-west-2.amazonaws.com/hello-world-app:latest

# Push to ECR
docker push 841176797870.dkr.ecr.us-west-2.amazonaws.com/hello-world-app:latest
\`\`\`

### Kubernetes Deployment
\`\`\`bash
# Deploy application
kubectl apply -f hello-eks/deployment.yaml
kubectl apply -f hello-eks/service.yaml

# Verify deployment
kubectl get deployments
kubectl get pods -l app=hello-world
kubectl get service hello-world-service

# View logs
kubectl logs -l app=hello-world

# Delete resources
kubectl delete -f hello-eks/service.yaml
kubectl delete -f hello-eks/deployment.yaml
\`\`\`

## Important Conventions

1. **No Emojis**: Do not use emojis or non-ASCII characters in code
2. **Minimal File Creation**: Only create files when absolutely necessary
3. **Prefer Editing**: Always prefer editing existing files over creating new ones
4. **No Unsolicited Documentation**: Only create documentation when explicitly requested

## Testing

Currently no automated tests. Manual testing via:
1. Local Node.js execution
2. Docker container testing
3. Kubernetes deployment verification

## Environment Requirements

- Node.js 18+
- Docker
- kubectl configured for target EKS cluster
- AWS CLI configured with appropriate permissions
- Access to ECR repository

## Notes for AI Assistants

- This is a simple demonstration project - avoid over-engineering
- Focus on maintainability and clarity
- Respect existing patterns and conventions
- When making changes, ensure compatibility with existing Kubernetes manifests
- Always validate YAML syntax before applying Kubernetes resources
    `
  },
  {
    slug: 'aws-route53-dns-configuration',
    title: 'AWS Route 53 DNS Configuration Guide',
    date: '2025-01-07',
    excerpt: 'Learn how to configure AWS Route 53 for Google domain verification and Cloud Run integration with step-by-step instructions.',
    readTime: '5 min read',
    author: 'Shivam Bhardwaj',
    tags: ['AWS', 'Route53', 'DNS', 'Google Cloud', 'DevOps'],
    content: `
# AWS Route 53 DNS Configuration

## Add TXT Record for Google Verification

### Steps in AWS Console:
1. Go to **Route 53** in AWS Console
2. Click **Hosted zones**
3. Find **shivambhardwaj.com** zone
4. Click **Create record**
5. Set:
   - **Record name:** (leave blank for root domain)
   - **Record type:** TXT
   - **Value:** \`google-site-verification=YOUR_TOKEN_FROM_SEARCH_CONSOLE\`
   - **TTL:** 300 (5 minutes)
6. Click **Create records**

### AWS CLI Alternative:
\`\`\`bash
# Replace YOUR_TOKEN with actual verification token
aws route53 change-resource-record-sets --hosted-zone-id YOUR_ZONE_ID --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "shivambhardwaj.com",
      "Type": "TXT",
      "TTL": 300,
      "ResourceRecords": [{"Value": "\\"google-site-verification=YOUR_TOKEN\\""}]
    }
  }]
}'
\`\`\`

## After Verification Success:
You'll also need to add A records for Cloud Run:

\`\`\`bash
# Get the IP addresses after domain mapping
gcloud beta run domain-mappings describe --domain shivambhardwaj.com --region us-central1
\`\`\`

## Recommendation:
**Switch to WordPress.com nameservers** for easier DNS management, unless you specifically need AWS Route 53 features.
    `
  },
  {
    slug: 'cloudflare-ssl-setup-guide',
    title: 'Cloudflare + Google App Engine SSL Setup Guide',
    date: '2025-01-07',
    excerpt: 'Fix Error 525 (SSL Handshake Failed) when using Cloudflare with Google App Engine. Complete guide with quick fixes and troubleshooting.',
    readTime: '10 min read',
    author: 'Shivam Bhardwaj',
    tags: ['Cloudflare', 'SSL', 'Google Cloud', 'Security', 'DevOps'],
    content: `
# Cloudflare + Google App Engine SSL Setup Guide

## The Problem
You're seeing Error 525 (SSL Handshake Failed) when accessing your site through Cloudflare.

## Understanding the Setup
\`\`\`
Your Domain → Cloudflare → Google App Engine
shivambhardwaj.com → Cloudflare Proxy → anti-mony.uc.r.appspot.com
\`\`\`

## Quick Fix (2 Minutes)

### In Cloudflare Dashboard:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select \`shivambhardwaj.com\`
3. Go to **SSL/TLS** (left sidebar)
4. Set encryption mode to **Full** (not Full Strict)
5. Save

### Why This Works:
- Google App Engine has SSL (certificate for *.appspot.com)
- "Full" mode accepts any certificate (even if domain doesn't match)
- "Full (Strict)" would fail because cert is for appspot.com, not your domain

## Alternative Solutions

### Solution 1: DNS-Only Mode (No Cloudflare Proxy)
**When to use**: Testing or if you don't need Cloudflare's features

1. Go to **DNS** in Cloudflare
2. Find your domain records
3. Click orange cloud → turns gray (DNS only)
4. Traffic goes directly to App Engine

**Pros**:
- No SSL issues
- Direct connection
- App Engine handles everything

**Cons**:
- No Cloudflare DDoS protection
- No Cloudflare CDN/caching
- No Cloudflare features

### Solution 2: Page Rules for Flexible SSL
**When to use**: Mixed content scenarios

1. Go to **Rules → Page Rules**
2. Create rule: \`*shivambhardwaj.com/*\`
3. Setting: SSL → Flexible
4. Save

### Solution 3: Use Cloudflare for SaaS
**When to use**: Professional setup with custom domain SSL

1. In App Engine, set up custom domain properly
2. Use Cloudflare for SaaS (paid feature)
3. Provides proper SSL certificate for your domain

## Verify Your Fix

### Test SSL Configuration:
\`\`\`bash
# Check SSL handshake
curl -I https://shivambhardwaj.com

# Check SSL certificate
openssl s_client -connect shivambhardwaj.com:443 -servername shivambhardwaj.com

# Online tool
https://www.ssllabs.com/ssltest/analyze.html?d=shivambhardwaj.com
\`\`\`

### Expected Results:
- HTTP 200 OK response
- No SSL errors
- Page loads with green padlock

## Common Issues and Solutions

### Issue: Still Getting 525 After Changing to Full
**Solution**:
- Clear Cloudflare cache: **Caching → Configuration → Purge Everything**
- Wait 5 minutes for propagation
- Try incognito/private browser window

### Issue: 526 Invalid SSL Certificate
**Solution**:
- Change from "Full (Strict)" to "Full"
- Or add your domain to App Engine custom domains

### Issue: 520 Unknown Error
**Solution**:
- App Engine might be down
- Check: \`gcloud app describe\`
- Check: https://anti-mony.uc.r.appspot.com directly

### Issue: Redirect Loops
**Solution**:
- Cloudflare SSL/TLS → Edge Certificates → Always Use HTTPS → OFF
- Or ensure App Engine isn't also forcing HTTPS

## Best Practices

### For Production:
1. Use "Full" SSL mode (good balance)
2. Enable "Always Use HTTPS"
3. Set up proper custom domain in App Engine
4. Monitor with Cloudflare Analytics

### Security Headers (add to app):
\`\`\`javascript
// In your Next.js app
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' }
];
\`\`\`

## Monitoring

### Check Status:
- Cloudflare Status: https://www.cloudflarestatus.com/
- Google Cloud Status: https://status.cloud.google.com/
- Your App: https://anti-mony.uc.r.appspot.com/_ah/health

### Debug Commands:
\`\`\`bash
# DNS propagation
dig shivambhardwaj.com

# Trace route
traceroute shivambhardwaj.com

# Check Cloudflare IP
nslookup shivambhardwaj.com 1.1.1.1
\`\`\`

## Contact Support

### If nothing works:
1. **Cloudflare Support**:
   - Free plan: Community forum
   - Paid: Open ticket

2. **Google Cloud Support**:
   - Check quotas and limits
   - Verify billing is active

3. **Quick Workaround**:
   - Access directly: https://anti-mony.uc.r.appspot.com
   - Bypass Cloudflare temporarily
    `
  },
  {
    slug: 'cloudflare-migration-complete-guide',
    title: 'Complete Cloudflare Migration Steps',
    date: '2025-01-07',
    excerpt: 'Step-by-step guide for migrating your domain to Cloudflare, configuring DNS for Google Cloud Run, and optimizing settings.',
    readTime: '6 min read',
    author: 'Shivam Bhardwaj',
    tags: ['Cloudflare', 'DNS', 'Migration', 'Google Cloud', 'DevOps'],
    content: `
# Complete Cloudflare Migration Steps

## Current Status Check:
Let's first check what's already done and what needs completion.

## Step 1: Complete Domain Transfer to Cloudflare
**If transfer is still in progress:**
1. Go to **dash.cloudflare.com**
2. Check **"Registrar"** section
3. Look for transfer status of shivambhardwaj.com
4. If not started: Click **"Transfer Domain"** and use auth code from WordPress.com

## Step 2: Configure DNS in Cloudflare (Critical)
**Since you changed nameservers to Google, we need to fix this:**

1. Go to **dash.cloudflare.com**
2. Click on **shivambhardwaj.com** domain
3. Go to **DNS** tab
4. Make sure you see Cloudflare nameservers (not Google ones):
   - **firstname.ns.cloudflare.com**
   - **lastname.ns.cloudflare.com**

## Step 3: Add Required DNS Records
**In Cloudflare DNS tab, add:**

1. **Google Verification TXT Record:**
   - Type: TXT
   - Name: @ (or shivambhardwaj.com)
   - Content: google-site-verification=YOUR_TOKEN_FROM_SEARCH_CONSOLE
   - TTL: Auto

2. **Cloud Run A Records (after domain mapping):**
   - Type: A
   - Name: @ (root domain)
   - Content: [IP from Google Cloud Run]
   - Proxy: Orange cloud ON (for Cloudflare protection)

## Step 4: Update WordPress.com Nameservers
**If domain is still at WordPress.com:**
1. Go to WordPress.com domain settings
2. Change nameservers from Google ones to Cloudflare ones
3. Get Cloudflare nameservers from your Cloudflare dashboard

## Step 5: Create Google Cloud Run Domain Mapping
**After DNS is properly configured:**
\`\`\`bash
gcloud beta run domain-mappings create --service hello-world-service --domain shivambhardwaj.com --region us-central1
\`\`\`

## Step 6: Configure Cloudflare Settings
**Optimal settings for Google Cloud Run:**
- SSL/TLS: Full (strict)
- Security Level: Medium
- Browser Integrity Check: ON
- Challenge Passage: 30 minutes
- Always Use HTTPS: ON

## Current Actions Needed:
1. **Check Cloudflare dashboard** - is domain there?
2. **Check nameservers** - are they Cloudflare or Google?
3. **Get Google verification token** from Search Console
4. **Configure DNS records** in Cloudflare
    `
  },
  {
    slug: 'dns-verification-guide',
    title: 'DNS Verification Guide for Google Search Console',
    date: '2025-01-07',
    excerpt: 'Complete guide for verifying your domain ownership with Google Search Console using DNS TXT records.',
    readTime: '5 min read',
    author: 'Shivam Bhardwaj',
    tags: ['DNS', 'Google', 'Verification', 'Tutorial'],
    content: `
# DNS Verification Guide for shivambhardwaj.com

## Google Search Console Verification Steps:

### 1. Get Your Verification Token
In Google Search Console (the opened tab):
1. Select "Domain name provider" method
2. Copy the TXT record value (looks like: \`google-site-verification=abc123xyz...\`)

### 2. Add DNS TXT Record
Add this TXT record to your domain DNS settings:

**Record Type:** TXT
**Name/Host:** @ (or blank/root domain)
**Value:** google-site-verification=YOUR_TOKEN_HERE
**TTL:** 3600 (or default)

### 3. Common DNS Providers Instructions:

#### Cloudflare:
- Go to DNS tab
- Click "Add record"
- Type: TXT
- Name: @
- Content: google-site-verification=YOUR_TOKEN

#### Namecheap:
- Advanced DNS tab
- Add New Record
- Type: TXT Record
- Host: @
- Value: google-site-verification=YOUR_TOKEN

#### GoDaddy:
- DNS Management
- Add Record
- Type: TXT
- Name: @
- Value: google-site-verification=YOUR_TOKEN

### 4. Verification Commands
After adding DNS record, wait 5-10 minutes then verify:

\`\`\`bash
# Check if TXT record is propagated
nslookup -type=TXT shivambhardwaj.com

# Or use dig
dig TXT shivambhardwaj.com
\`\`\`

### 5. After Verification Success
Once verified, create the domain mapping:

\`\`\`bash
gcloud beta run domain-mappings create --service hello-world-service --domain shivambhardwaj.com --region us-central1
\`\`\`

### 6. Get DNS Records for Cloud Run
After domain mapping, get the required A records:

\`\`\`bash
gcloud beta run domain-mappings describe --domain shivambhardwaj.com --region us-central1
\`\`\`

## Troubleshooting:
- DNS propagation can take up to 24 hours
- Try verification again after 1-2 hours
- Use online DNS checkers to verify TXT record propagation
    `
  },
  {
    slug: 'domain-setup-google-app-engine',
    title: 'Domain Setup Guide: Google App Engine Custom Domain',
    date: '2025-01-07',
    excerpt: 'Complete guide for setting up a custom domain with Google App Engine, including DNS configuration and SSL certificate setup.',
    readTime: '8 min read',
    author: 'Shivam Bhardwaj',
    tags: ['Google Cloud', 'App Engine', 'DNS', 'SSL', 'Tutorial'],
    content: `
# Domain Setup Guide: shivambhardwaj.com to Google App Engine

## Current Status
- **App Engine URL**: https://anti-mony.uc.r.appspot.com (LIVE)
- **Target Domain**: shivambhardwaj.com
- **Status**: Domain verification required

## Setup Steps

### Step 1: Verify Domain Ownership (REQUIRED FIRST)

1. Go to [Google Search Console](https://www.google.com/webmasters/verification/verification?domain=shivambhardwaj.com)
2. Sign in with: curious.antimony@gmail.com
3. Choose verification method:

#### Option A: DNS TXT Record (Recommended)
- Add TXT record to your DNS:
  - Type: TXT
  - Name: @ or shivambhardwaj.com
  - Value: google-site-verification=XXXXX (provided by Google)
  - TTL: 3600

#### Option B: Domain Registrar Verification
- If using Google Domains, Namecheap, GoDaddy, etc., use automatic verification

### Step 2: Add Domain to App Engine

Run these commands after domain verification:

\`\`\`bash
# Add root domain
gcloud app domain-mappings create shivambhardwaj.com --certificate-management=AUTOMATIC

# Add www subdomain
gcloud app domain-mappings create www.shivambhardwaj.com --certificate-management=AUTOMATIC
\`\`\`

### Step 3: Configure DNS Records

Add these records at your domain registrar:

#### For Root Domain (shivambhardwaj.com):
\`\`\`
Type: A
Name: @ (or blank)
Values:
  216.239.32.21
  216.239.34.21
  216.239.36.21
  216.239.38.21
TTL: 3600
\`\`\`

#### For WWW Subdomain:
\`\`\`
Type: CNAME
Name: www
Value: ghs.googlehosted.com
TTL: 3600
\`\`\`

#### Alternative for Root (if registrar supports):
\`\`\`
Type: ALIAS/ANAME
Name: @ (or blank)
Value: ghs.googlehosted.com
TTL: 3600
\`\`\`

### Step 4: Verify Setup

Check domain mapping status:
\`\`\`bash
gcloud app domain-mappings list
gcloud app domain-mappings describe shivambhardwaj.com
\`\`\`

Test DNS propagation:
\`\`\`bash
nslookup shivambhardwaj.com
nslookup www.shivambhardwaj.com
\`\`\`

### Step 5: SSL Certificate

- SSL certificates are **automatically provisioned** by Google
- Takes 15 minutes to 24 hours after DNS verification
- No action required from your side

## Quick Setup Script

Run the automated setup script:
\`\`\`bash
cd shivambhardwaj-gc
setup-custom-domain.bat
\`\`\`

## Timeline

1. **Domain Verification**: 5-10 minutes
2. **DNS Propagation**: 10 minutes to 48 hours (usually under 1 hour)
3. **SSL Certificate**: 15 minutes to 24 hours after DNS verification
4. **Full Setup**: Typically complete within 2-4 hours

## Troubleshooting

### Domain Verification Failed
- Ensure TXT record is added correctly
- Wait 10 minutes for DNS propagation
- Try alternative verification method

### DNS Not Resolving
- Check TTL settings (use 3600 or lower)
- Verify A records are correct
- Use DNS checker: https://dnschecker.org

### SSL Certificate Pending
- Ensure DNS is properly configured
- Wait up to 24 hours
- Check status: \`gcloud app domain-mappings describe shivambhardwaj.com\`

## Domain Registrar-Specific Instructions

### Namecheap
1. Go to Domain List > Manage
2. Advanced DNS tab
3. Add A records and CNAME as specified

### GoDaddy
1. DNS Management
2. Add records using their interface
3. Save changes

### Google Domains
1. DNS tab
2. Custom records section
3. Add required records

### Cloudflare
1. DNS tab
2. Add records (disable proxy initially)
3. After SSL is active, can enable proxy

## Final URLs

After setup, your app will be accessible at:
- https://shivambhardwaj.com
- https://www.shivambhardwaj.com
- Both will serve your App Engine application with SSL

## Need Help?

Contact Google Cloud Support or check:
- [App Engine Custom Domains Documentation](https://cloud.google.com/appengine/docs/standard/mapping-custom-domains)
- [Domain Verification Help](https://support.google.com/webmasters/answer/9008080)
    `
  },
  {
    slug: 'domain-registrar-comparison-2025',
    title: 'Domain Registrar Comparison 2025',
    date: '2025-01-07',
    excerpt: 'Compare the best domain registrars for Google Cloud integration: Cloudflare, Squarespace, and WordPress.com.',
    readTime: '6 min read',
    author: 'Shivam Bhardwaj',
    tags: ['Domain', 'Cloudflare', 'Google Cloud', 'Comparison'],
    content: `
# Domain Registrar Comparison 2025

## Current Situation:
- Google Domains → Sold to Squarespace (2023)
- Your domain: Currently at WordPress.com
- Need: Best integration with Google Cloud

## Option 1: Cloudflare Registrar
**Pros:**
- At-cost pricing (no markup) - ~$9.77/year for .com
- Excellent DNS performance
- Free SSL certificates
- Built-in DDoS protection
- API for automation
- Works perfectly with Google Cloud

**Cons:**
- Must use Cloudflare for DNS (can't use Google Cloud DNS)
- Less integration with Google services

## Option 2: Squarespace Domains (former Google Domains)
**Pros:**
- Same team that built Google Domains
- $12/year for .com
- Good Google Cloud integration
- Can use Google Cloud DNS
- Familiar Google-style interface

**Cons:**
- More expensive than Cloudflare
- Less DNS features than Cloudflare

## Option 3: Keep WordPress.com Domain + Use Google Cloud DNS
**Pros:**
- No transfer needed
- Already changed nameservers to Google
- Can configure everything now

**Cons:**
- Still paying WordPress.com
- Less control

## Recommendation: Cloudflare Registrar

**Why Cloudflare is best for your use case:**
1. **Cheapest:** $9.77/year vs $12+ elsewhere
2. **Best performance:** Fastest DNS globally
3. **Security:** Built-in DDoS protection
4. **Perfect for Google Cloud:** Many companies use this combo
5. **API integration:** Easy automation
6. **No Google dependency:** Diversified infrastructure

## Migration Steps with Cloudflare:

### Step 1: Transfer to Cloudflare
1. Go to **dash.cloudflare.com**
2. Click **"Register Domains"**
3. Search for your domain transfer
4. Use authorization code from WordPress.com
5. Cost: $9.77/year

### Step 2: DNS Configuration
Cloudflare will handle DNS (not Google Cloud DNS), which is actually better:
- Faster global DNS resolution
- Built-in security features
- Easy management interface

### Step 3: Domain Verification
Add TXT record in Cloudflare dashboard for Google verification

## Final Setup:
- **Domain:** Cloudflare Registrar ($9.77/year)
- **DNS:** Cloudflare DNS (free, faster than Google)
- **App:** Google Cloud Run
- **SSL:** Cloudflare + Google (double protection)

This is the most cost-effective and performant setup!
    `
  },
  {
    slug: 'dns-easter-eggs-hidden-messages',
    title: 'DNS Easter Eggs: Hidden Messages in Plain Sight',
    date: '2025-01-06',
    excerpt: 'Discover how to hide secret messages, ASCII art, and fun surprises in your DNS records. Learn the technical tricks that companies like Google and Discord use to create memorable developer experiences.',
    readTime: '15 min read',
    author: 'Shivam Bhardwaj',
    tags: ['DNS', 'DevOps', 'Fun', 'Tutorial', 'Web Development'],
    content: `
# DNS Easter Eggs: Hidden Messages in Plain Sight

Have you ever wondered if there's more to DNS than just pointing domains to IP addresses? What if I told you that DNS records are the perfect place to hide easter eggs, secret messages, and even ASCII art that only curious developers will find?

## How DNS Records Work

DNS (Domain Name System) is like the internet's phone book. When someone types your domain, DNS servers look up various records to know what to do. These records are public and queryable by anyone - that's where the fun begins!

### DNS Record Types Explained:
- **A Record**: Maps domain to IPv4 address (e.g., shivambhardwaj.com → 216.239.32.21)
- **AAAA Record**: Maps domain to IPv6 address
- **CNAME**: Alias pointing to another domain (redirect at DNS level)
- **TXT**: Text data - originally for notes, now used for verification, SPF, and... easter eggs!
- **MX**: Mail server designation
- **NS**: Nameserver delegation

### Why This Works:
DNS records are publicly queryable - it's how the internet functions! When developers, security researchers, or curious people investigate a domain, they often check DNS records. It's like hiding messages in plain sight that only tech-savvy people will find.

## 1. Hidden Messages in TXT Records

### How It Works:
TXT records can store any text up to 255 characters per string (multiple strings allowed). Originally designed for human-readable notes about a domain, they're now commonly used for domain verification (Google, Microsoft), email authentication (SPF, DKIM), and... easter eggs!

### Implementation:
Add these TXT records for fun discoveries:

\`\`\`
TXT @ "v=humans txt=Hello curious developer! You found my easter egg!"
TXT @ "hiring=Yes! Email me at curious.antimony@gmail.com"
TXT @ "favorite-language=TypeScript"
TXT @ "rick-roll=Never gonna give you up, never gonna let you down"
\`\`\`

### How to Add (varies by registrar):
**GoDaddy/Namecheap:**
1. DNS Management → Add Record
2. Type: TXT
3. Host: @ (for root domain)
4. Value: Your message
5. TTL: 3600

**Via Command Line (Google Cloud DNS):**
\`\`\`bash
gcloud dns record-sets transaction add \\
  '"Hello curious developer!"' \\
  --name=shivambhardwaj.com. \\
  --ttl=3600 \\
  --type=TXT \\
  --zone=your-zone-name
\`\`\`

### How People Discover These:
\`\`\`bash
# Linux/Mac:
dig TXT shivambhardwaj.com
host -t TXT shivambhardwaj.com

# Windows:
nslookup -type=TXT shivambhardwaj.com

# Online:
# Visit mxtoolbox.com → TXT Lookup
\`\`\`

### Real-World Examples:
\`\`\`bash
dig TXT google.com  # Returns multiple verification and SPF records
dig TXT github.com  # Shows their hiring status and verification codes
\`\`\`

## 2. ASCII Art in TXT Records

### How It Works:
By creating multiple TXT records with specific subdomain prefixes, you can store multi-line ASCII art. When queried in sequence, they form a complete image or message.

### Implementation:
\`\`\`
TXT _ascii1 "╔══════════════════════╗"
TXT _ascii2 "║  SHIVAM BHARDWAJ     ║"
TXT _ascii3 "║  Robotics Engineer   ║"
TXT _ascii4 "╚══════════════════════╝"
\`\`\`

### Automated Discovery Script:
\`\`\`bash
#!/bin/bash
# Save as: discover-art.sh
for i in {1..4}; do
  dig +short TXT _ascii$i.shivambhardwaj.com | sed 's/"//g'
done
\`\`\`

### Why Subdomains with Underscores:
- Underscores in DNS are valid for TXT records
- They don't interfere with actual subdomains
- They sort nicely when listed
- Convention: underscore indicates "metadata" not a real host

## 3. Fun Subdomains with Redirects

### How It Works:
Subdomains can point to different locations using CNAME records (DNS level) or URL forwarding (HTTP level). This creates memorable shortcuts and hidden pages.

### Method 1: CNAME Records (DNS Level)
Points subdomain to your app, app handles routing:
\`\`\`
CNAME resume.shivambhardwaj.com -> anti-mony.uc.r.appspot.com
CNAME cv.shivambhardwaj.com -> anti-mony.uc.r.appspot.com
\`\`\`
Your app then detects the subdomain and shows appropriate content.

### Method 2: URL Forwarding (HTTP Level)
Most registrars offer URL forwarding:
\`\`\`
github.shivambhardwaj.com -> 301 Redirect -> github.com/yourusername
linkedin.shivambhardwaj.com -> 301 Redirect -> linkedin.com/in/yourusername
\`\`\`

### Creative Examples:
\`\`\`
hire.shivambhardwaj.com -> Your calendly
coffee.shivambhardwaj.com -> buymeacoffee.com/yourname
rick.shivambhardwaj.com -> YouTube Rick Roll
404.shivambhardwaj.com -> Custom 404 page
api.shivambhardwaj.com -> API documentation
old.shivambhardwaj.com -> Wayback machine archive
\`\`\`

## 4. Creative TXT Record Ideas

### DNS Haiku
\`\`\`
TXT _haiku1 "Packets flowing fast"
TXT _haiku2 "Through fiber optic cables"  
TXT _haiku3 "Website loads with joy"
\`\`\`

### Konami Code
\`\`\`
TXT _konami "up,up,down,down,left,right,left,right,B,A"
CNAME konami -> anti-mony.uc.r.appspot.com/secret-page
\`\`\`

### Time Capsule
\`\`\`
TXT _timecapsule "message=Hello from 2025! Bitcoin is at $100k created=2025-01-06 open=2030-01-06"
\`\`\`

### Hiring Status Indicator
\`\`\`
TXT hiring "status=open position=robotics-engineer location=remote"
CNAME jobs -> anti-mony.uc.r.appspot.com/careers
\`\`\`

### DNS-based API
Create a simple read-only API:
\`\`\`
TXT api.v1.status "{'status':'online','uptime':'99.9%'}"
TXT api.v1.projects "{'count':10,'featured':'robotics'}"
TXT api.v1.skills "['TypeScript','React','Robotics','Cloud']"
\`\`\`

Query with: \`dig +short TXT api.v1.status.shivambhardwaj.com\`

## Who Looks at DNS Records?

1. **Security Researchers** - Checking for misconfigurations, SPF records
2. **Developers** - Debugging issues, checking setup
3. **Recruiters/Hiring Managers** - Tech-savvy ones checking if you're "real"
4. **Curious Techies** - People who dig into everything
5. **Pentesters** - Information gathering phase
6. **DNS Enthusiasts** - Yes, they exist!

## Famous Real-World Examples

### Companies with DNS Easter Eggs:

**Google:**
\`\`\`bash
dig TXT google.com
# Returns: "v=spf1 include:_spf.google.com ~all"
# Plus multiple verification records
\`\`\`

**Cloudflare:**
\`\`\`bash
dig TXT cloudflare.com
# Includes hiring messages and technical jokes
\`\`\`

**Discord:**
\`\`\`bash
dig TXT discord.com
# Has hidden job postings in TXT records
\`\`\`

### Why Companies Do This:
1. **Tech Culture Signal** - Shows engineering culture and attention to detail
2. **Recruiting Tool** - Hidden job posts attract curious engineers
3. **Brand Building** - Makes the company memorable
4. **Community Building** - Creates insider knowledge among tech folks
5. **SEO/Marketing** - Gets shared on social media when discovered

## Step-by-Step Implementation Guide

### Quick Start (5 Minutes):

#### Step 1: Add Your First Easter Egg
Go to your domain registrar's DNS management and add:
- Type: TXT
- Name: @ 
- Value: "Hello world! You found my DNS easter egg!"
- TTL: 3600

#### Step 2: Test It
\`\`\`bash
# Windows:
nslookup -type=TXT yourdomain.com

# Mac/Linux:
dig TXT yourdomain.com
\`\`\`

### Advanced Setup (30 Minutes):

#### 1. Plan Your Easter Eggs
Create a spreadsheet with:
- Record name
- Message/content
- Purpose (fun, hiring, info)

#### 2. Batch Add Records
Most registrars allow CSV import or API access.

**Using Google Cloud DNS:**
\`\`\`bash
# Start transaction
gcloud dns record-sets transaction start --zone=YOUR_ZONE

# Add multiple records
gcloud dns record-sets transaction add "hiring=yes" --name=@ --ttl=300 --type=TXT --zone=YOUR_ZONE
gcloud dns record-sets transaction add "favorite-tech=kubernetes" --name=@ --ttl=300 --type=TXT --zone=YOUR_ZONE

# Execute
gcloud dns record-sets transaction execute --zone=YOUR_ZONE
\`\`\`

#### 3. Create a Discovery Page
Add to your website:
\`\`\`html
<!-- /dns-easter-eggs.html -->
<h1>DNS Easter Egg Hunt!</h1>
<p>Try these commands to find hidden messages:</p>
<code>dig TXT shivambhardwaj.com</code>
<code>dig TXT _hiring.shivambhardwaj.com</code>
\`\`\`

#### 4. Monitor Discovery
Track who finds your easter eggs:
- Check DNS query logs (if available)
- Add analytics to your discovery page
- Monitor social media mentions

## Best Practices

1. **Don't break functionality** - Keep real records working
2. **Use appropriate TTLs** - Short for testing (300), longer for permanent (3600)
3. **Document somewhere** - Maybe a /dns-easter-eggs page
4. **Keep it professional** - Remember this is public
5. **Monitor for abuse** - Check your DNS query logs
6. **Update regularly** - Stale easter eggs look abandoned
7. **Consider mobile** - Some people check DNS on phones

## DNS Record Limits to Remember:
- TXT record: 255 characters per string
- Multiple strings: Can be concatenated
- Total DNS response: Should stay under 512 bytes for compatibility
- Number of records: No hard limit, but keep reasonable
- Subdomain levels: Up to 127 levels technically allowed

## Testing Your Setup:
\`\`\`bash
# Test from different locations
dig @8.8.8.8 TXT yourdomain.com      # Google DNS
dig @1.1.1.1 TXT yourdomain.com      # Cloudflare DNS
dig @208.67.222.222 TXT yourdomain.com # OpenDNS

# Check propagation time
watch -n 5 'dig +short TXT yourdomain.com'
\`\`\`

## Troubleshooting:
- **Not showing up?** Wait 5-10 minutes for propagation
- **Quotes in output?** Normal - DNS adds quotes to TXT
- **Multiple values?** DNS can return records in any order
- **Too long?** Split into multiple records or use compression

## Automated Discovery Script

Here's a Python script to hunt for DNS easter eggs:

\`\`\`python
# dns_easter_egg_hunter.py
import dns.resolver

def find_easter_eggs(domain):
    print(f"Hunting for easter eggs in {domain}...")
    
    # Check main TXT records
    try:
        txt_records = dns.resolver.resolve(domain, 'TXT')
        for record in txt_records:
            print(f"Found: {record.to_text()}")
    except:
        pass
    
    # Check common easter egg subdomains
    easter_eggs = ['_hiring', '_ascii', '_haiku', '_secret', '_human']
    for egg in easter_eggs:
        try:
            records = dns.resolver.resolve(f"{egg}.{domain}", 'TXT')
            for record in records:
                print(f"Easter egg at {egg}: {record.to_text()}")
        except:
            pass

find_easter_eggs("shivambhardwaj.com")
\`\`\`

## Conclusion

DNS easter eggs are a fun way to add personality to your domain and connect with the tech community. They're hidden in plain sight, waiting for curious developers to discover them. Whether you're using them for recruiting, branding, or just for fun, DNS records offer a unique canvas for creativity.

So next time you register a domain, remember: those DNS records aren't just for routing traffic - they're an opportunity to leave your mark in the internet's infrastructure. Happy easter egg hunting!

---

*Have you found any interesting DNS easter eggs? Share them in the comments below or reach out on [Twitter](https://twitter.com/yourusername)!*
    `
  },
  {
    slug: 'ai-context-for-assistants',
    title: 'AI Context for Assistants',
    date: '2025-01-05',
    excerpt: 'Context and instructions for AI assistants working with this codebase.',
    readTime: '4 min read',
    author: 'Shivam Bhardwaj',
    tags: ['AI', 'Kubernetes', 'Development', 'Instructions'],
    content: `
# AI_CONTEXT.md

This file provides context and instructions for AI assistants working with this codebase.

## Project Overview

**Type**: Kubernetes microservice deployment
**Stack**: Node.js, Docker, Kubernetes (EKS)
**Purpose**: Simple "Hello World" application demonstrating containerized deployment on AWS EKS

## Repository Structure

\`\`\`
antimony-labs/
└── hello-eks/
    ├── hello-world-app/
    │   ├── app.js          # Node.js HTTP server (port 8080)
    │   └── Dockerfile       # Container definition (Node.js 18)
    ├── deployment.yaml      # Kubernetes deployment manifest
    └── service.yaml         # Kubernetes LoadBalancer service
\`\`\`

## Technical Details

### Application
- **Runtime**: Node.js 18
- **Port**: 8080
- **Endpoint**: Root path returns "Hello World"
- **Dependencies**: None (uses built-in http module)

### Container Registry
- **Registry**: AWS ECR
- **Region**: us-west-2
- **Image**: 841176797870.dkr.ecr.us-west-2.amazonaws.com/hello-world-app:latest

### Kubernetes Configuration
- **Deployment**: Single replica
- **Service Type**: LoadBalancer
- **External Port**: 80
- **Internal Port**: 8080

## Development Commands

### Local Development
\`\`\`bash
# Run application locally
cd hello-eks/hello-world-app
node app.js

# Build Docker image
docker build -t hello-world-app .

# Run container locally
docker run -p 8080:8080 hello-world-app

# Test endpoint
curl http://localhost:8080
\`\`\`

### AWS ECR Operations
\`\`\`bash
# Login to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 841176797870.dkr.ecr.us-west-2.amazonaws.com

# Tag image for ECR
docker tag hello-world-app:latest 841176797870.dkr.ecr.us-west-2.amazonaws.com/hello-world-app:latest

# Push to ECR
docker push 841176797870.dkr.ecr.us-west-2.amazonaws.com/hello-world-app:latest
\`\`\`

### Kubernetes Deployment
\`\`\`bash
# Deploy application
kubectl apply -f hello-eks/deployment.yaml
kubectl apply -f hello-eks/service.yaml

# Verify deployment
kubectl get deployments
kubectl get pods -l app=hello-world
kubectl get service hello-world-service

# View logs
kubectl logs -l app=hello-world

# Delete resources
kubectl delete -f hello-eks/service.yaml
kubectl delete -f hello-eks/deployment.yaml
\`\`\`

## Important Conventions

1. **No Emojis**: Do not use emojis or non-ASCII characters in code
2. **Minimal File Creation**: Only create files when absolutely necessary
3. **Prefer Editing**: Always prefer editing existing files over creating new ones
4. **No Unsolicited Documentation**: Only create documentation when explicitly requested

## Testing

Currently no automated tests. Manual testing via:
1. Local Node.js execution
2. Docker container testing
3. Kubernetes deployment verification

## Environment Requirements

- Node.js 18+
- Docker
- kubectl configured for target EKS cluster
- AWS CLI configured with appropriate permissions
- Access to ECR repository

## Notes for AI Assistants

- This is a simple demonstration project - avoid over-engineering
- Focus on maintainability and clarity
- Respect existing patterns and conventions
- When making changes, ensure compatibility with existing Kubernetes manifests
- Always validate YAML syntax before applying Kubernetes resources
`
  },
  {
    slug: 'aws-route53-instructions',
    title: 'AWS Route 53 Instructions',
    date: '2025-01-05',
    excerpt: 'Instructions on how to configure AWS Route 53 for Google Verification and Cloud Run integration.',
    readTime: '2 min read',
    author: 'Shivam Bhardwaj',
    tags: ['AWS', 'Route53', 'DNS', 'Google Cloud'],
    content: `
# AWS Route 53 DNS Configuration

## Add TXT Record for Google Verification

### Steps in AWS Console:
1. Go to **Route 53** in AWS Console
2. Click **Hosted zones**
3. Find **shivambhardwaj.com** zone
4. Click **Create record**
5. Set:
   - **Record name:** (leave blank for root domain)
   - **Record type:** TXT
   - **Value:** \`google-site-verification=YOUR_TOKEN_FROM_SEARCH_CONSOLE\`
   - **TTL:** 300 (5 minutes)
6. Click **Create records**

### AWS CLI Alternative:
\`\`\`bash
# Replace YOUR_TOKEN with actual verification token
aws route53 change-resource-record-sets --hosted-zone-id YOUR_ZONE_ID --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "shivambhardwaj.com",
      "Type": "TXT",
      "TTL": 300,
      "ResourceRecords": [{"Value": "\\"google-site-verification=YOUR_TOKEN\\""}]
    }
  }]
}'
\`\`\`

## After Verification Success:
You'll also need to add A records for Cloud Run:

\`\`\`bash
# Get the IP addresses after domain mapping
gcloud beta run domain-mappings describe --domain shivambhardwaj.com --region us-central1
\`\`\`

## Recommendation:
**Switch to WordPress.com nameservers** for easier DNS management, unless you specifically need AWS Route 53 features.
`
  },
  {
    slug: 'guidance-for-claude-code',
    title: 'Guidance for Claude Code',
    date: '2025-01-05',
    excerpt: 'Guidance for Claude Code (claude.ai/code) when working with code in this repository.',
    readTime: '2 min read',
    author: 'Shivam Bhardwaj',
    tags: ['AI', 'Claude', 'Development', 'Instructions'],
    content: `
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a Kubernetes-focused project containing a simple Node.js "Hello World" application deployed to Amazon EKS. The project structure follows a containerized microservice pattern:

- \`hello-eks/hello-world-app/\` - Contains the Node.js application and its Dockerfile
- \`hello-eks/\` - Contains Kubernetes deployment and service manifests

## Key Components

### Application Layer
- \`hello-eks/hello-world-app/app.js\` - Simple HTTP server on port 8080 serving "Hello World"
- \`hello-eks/hello-world-app/Dockerfile\` - Node.js 18-based container image

### Infrastructure Layer
- \`hello-eks/deployment.yaml\` - Kubernetes Deployment manifest with single replica
- \`hello-eks/service.yaml\` - LoadBalancer service exposing the app on port 80

The application uses AWS ECR registry (\`841176797870.dkr.ecr.us-west-2.amazonaws.com/hello-world-app:latest\`) for container images.

## Common Development Tasks

### Docker Operations
\`\`\`bash
# Build the application image
cd hello-eks/hello-world-app
docker build -t hello-world-app .

# Test locally
docker run -p 8080:8080 hello-world-app
\`\`\`

### Kubernetes Operations
\`\`\`bash
# Deploy to cluster
kubectl apply -f hello-eks/deployment.yaml
kubectl apply -f hello-eks/service.yaml

# Check deployment status
kubectl get pods -l app=hello-world
kubectl get service hello-world-service

# View logs
kubectl logs -l app=hello-world
\`\`\`

### AWS ECR Integration
The deployment references AWS ECR in us-west-2 region. Images must be pushed to ECR before deployment.
`
  },
  {
    slug: 'cloudflare-ssl-setup',
    title: 'Cloudflare SSL Setup',
    date: '2025-01-05',
    excerpt: 'A guide to setting up Cloudflare SSL with Google App Engine and fixing common errors.',
    readTime: '5 min read',
    author: 'Shivam Bhardwaj',
    tags: ['Cloudflare', 'SSL', 'Google Cloud', 'DevOps'],
    content: `
# Cloudflare + Google App Engine SSL Setup Guide

## The Problem
You're seeing Error 525 (SSL Handshake Failed) when accessing your site through Cloudflare.

## Understanding the Setup
\`\`\`
Your Domain → Cloudflare → Google App Engine
shivambhardwaj.com → Cloudflare Proxy → anti-mony.uc.r.appspot.com
\`\`\`

## Quick Fix (2 Minutes)

### In Cloudflare Dashboard:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select \`shivambhardwaj.com\`
3. Go to **SSL/TLS** (left sidebar)
4. Set encryption mode to **Full** (not Full Strict)
5. Save

### Why This Works:
- Google App Engine has SSL (certificate for *.appspot.com)
- "Full" mode accepts any certificate (even if domain doesn't match)
- "Full (Strict)" would fail because cert is for appspot.com, not your domain

## Alternative Solutions

### Solution 1: DNS-Only Mode (No Cloudflare Proxy)
**When to use**: Testing or if you don't need Cloudflare's features

1. Go to **DNS** in Cloudflare
2. Find your domain records
3. Click orange cloud → turns gray (DNS only)
4. Traffic goes directly to App Engine

**Pros**:
- No SSL issues
- Direct connection
- App Engine handles everything

**Cons**:
- No Cloudflare DDoS protection
- No Cloudflare CDN/caching
- No Cloudflare features

### Solution 2: Page Rules for Flexible SSL
**When to use**: Mixed content scenarios

1. Go to **Rules → Page Rules**
2. Create rule: \`*shivambhardwaj.com/*\`
3. Setting: SSL → Flexible
4. Save

### Solution 3: Use Cloudflare for SaaS
**When to use**: Professional setup with custom domain SSL

1. In App Engine, set up custom domain properly
2. Use Cloudflare for SaaS (paid feature)
3. Provides proper SSL certificate for your domain

## Verify Your Fix

### Test SSL Configuration:
\`\`\`bash
# Check SSL handshake
curl -I https://shivambhardwaj.com

# Check SSL certificate
openssl s_client -connect shivambhardwaj.com:443 -servername shivambhardwaj.com

# Online tool
https://www.ssllabs.com/ssltest/analyze.html?d=shivambhardwaj.com
\`\`\`

### Expected Results:
- HTTP 200 OK response
- No SSL errors
- Page loads with green padlock

## Common Issues and Solutions

### Issue: Still Getting 525 After Changing to Full
**Solution**:
- Clear Cloudflare cache: **Caching → Configuration → Purge Everything**
- Wait 5 minutes for propagation
- Try incognito/private browser window

### Issue: 526 Invalid SSL Certificate
**Solution**:
- Change from "Full (Strict)" to "Full"
- Or add your domain to App Engine custom domains

### Issue: 520 Unknown Error
**Solution**:
- App Engine might be down
- Check: \`gcloud app describe\`
- Check: https://anti-mony.uc.r.appspot.com directly

### Issue: Redirect Loops
**Solution**:
- Cloudflare SSL/TLS → Edge Certificates → Always Use HTTPS → OFF
- Or ensure App Engine isn't also forcing HTTPS

## Best Practices

### For Production:
1. Use "Full" SSL mode (good balance)
2. Enable "Always Use HTTPS"
3. Set up proper custom domain in App Engine
4. Monitor with Cloudflare Analytics

### Security Headers (add to app):
\`\`\`javascript
// In your Next.js app
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' }
];
\`\`\`

## Monitoring

### Check Status:
- Cloudflare Status: https://www.cloudflarestatus.com/
- Google Cloud Status: https://status.cloud.google.com/
- Your App: https://anti-mony.uc.r.appspot.com/_ah/health

### Debug Commands:
\`\`\`bash
# DNS propagation
dig shivambhardwaj.com

# Trace route
traceroute shivambhardwaj.com

# Check Cloudflare IP
nslookup shivambhardwaj.com 1.1.1.1
\`\`\`

## Contact Support

### If nothing works:
1. **Cloudflare Support**:
   - Free plan: Community forum
   - Paid: Open ticket

2. **Google Cloud Support**:
   - Check quotas and limits
   - Verify billing is active

3. **Quick Workaround**:
   - Access directly: https://anti-mony.uc.r.appspot.com
   - Bypass Cloudflare temporarily
`
  },
  {
    slug: 'cloudflare-migration-steps',
    title: 'Cloudflare Migration Steps',
    date: '2025-01-05',
    excerpt: 'A step-by-step guide for migrating your domain to Cloudflare.',
    readTime: '3 min read',
    author: 'Shivam Bhardwaj',
    tags: ['Cloudflare', 'DNS', 'Migration', 'Google Cloud'],
    content: `
# Complete Cloudflare Migration Steps

## Current Status Check:
Let's first check what's already done and what needs completion.

## Step 1: Complete Domain Transfer to Cloudflare
**If transfer is still in progress:**
1. Go to **dash.cloudflare.com**
2. Check **"Registrar"** section
3. Look for transfer status of shivambhardwaj.com
4. If not started: Click **"Transfer Domain"** and use auth code from WordPress.com

## Step 2: Configure DNS in Cloudflare (Critical)
**Since you changed nameservers to Google, we need to fix this:**

1. Go to **dash.cloudflare.com**
2. Click on **shivambhardwaj.com** domain
3. Go to **DNS** tab
4. Make sure you see Cloudflare nameservers (not Google ones):
   - **firstname.ns.cloudflare.com**
   - **lastname.ns.cloudflare.com**

## Step 3: Add Required DNS Records
**In Cloudflare DNS tab, add:**

1. **Google Verification TXT Record:**
   - Type: TXT
   - Name: @ (or shivambhardwaj.com)
   - Content: google-site-verification=YOUR_TOKEN_FROM_SEARCH_CONSOLE
   - TTL: Auto

2. **Cloud Run A Records (after domain mapping):**
   - Type: A
   - Name: @ (root domain)
   - Content: [IP from Google Cloud Run]
   - Proxy: Orange cloud ON (for Cloudflare protection)

## Step 4: Update WordPress.com Nameservers
**If domain is still at WordPress.com:**
1. Go to WordPress.com domain settings
2. Change nameservers from Google ones to Cloudflare ones
3. Get Cloudflare nameservers from your Cloudflare dashboard

## Step 5: Create Google Cloud Run Domain Mapping
**After DNS is properly configured:**
\`\`\`bash
gcloud beta run domain-mappings create --service hello-world-service --domain shivambhardwaj.com --region us-central1
\`\`\`

## Step 6: Configure Cloudflare Settings
**Optimal settings for Google Cloud Run:**
- SSL/TLS: Full (strict)
- Security Level: Medium
- Browser Integrity Check: ON
- Challenge Passage: 30 minutes
- Always Use HTTPS: ON

## Current Actions Needed:
1. **Check Cloudflare dashboard** - is domain there?
2. **Check nameservers** - are they Cloudflare or Google?
3. **Get Google verification token** from Search Console
4. **Configure DNS records** in Cloudflare
`
  },
  {
    slug: 'dns-verification-guide',
    title: 'DNS Verification Guide',
    date: '2025-01-05',
    excerpt: 'A guide to verifying your domain ownership with Google Search Console using DNS TXT records.',
    readTime: '3 min read',
    author: 'Shivam Bhardwaj',
    tags: ['DNS', 'Google', 'Verification', 'Tutorial'],
    content: `
# DNS Verification Guide for shivambhardwaj.com

## Google Search Console Verification Steps:

### 1. Get Your Verification Token
In Google Search Console (the opened tab):
1. Select "Domain name provider" method
2. Copy the TXT record value (looks like: \`google-site-verification=abc123xyz...\`)

### 2. Add DNS TXT Record
Add this TXT record to your domain DNS settings:

**Record Type:** TXT
**Name/Host:** @ (or blank/root domain)
**Value:** google-site-verification=YOUR_TOKEN_HERE
**TTL:** 3600 (or default)

### 3. Common DNS Providers Instructions:

#### Cloudflare:
- Go to DNS tab
- Click "Add record"
- Type: TXT
- Name: @
- Content: google-site-verification=YOUR_TOKEN

#### Namecheap:
- Advanced DNS tab
- Add New Record
- Type: TXT Record
- Host: @
- Value: google-site-verification=YOUR_TOKEN

#### GoDaddy:
- DNS Management
- Add Record
- Type: TXT
- Name: @
- Value: google-site-verification=YOUR_TOKEN

### 4. Verification Commands
After adding DNS record, wait 5-10 minutes then verify:

\`\`\`bash
# Check if TXT record is propagated
nslookup -type=TXT shivambhardwaj.com

# Or use dig
dig TXT shivambhardwaj.com
\`\`\`

### 5. After Verification Success
Once verified, create the domain mapping:

\`\`\`bash
gcloud beta run domain-mappings create --service hello-world-service --domain shivambhardwaj.com --region us-central1
\`\`\`

### 6. Get DNS Records for Cloud Run
After domain mapping, get the required A records:

\`\`\`bash
gcloud beta run domain-mappings describe --domain shivambhardwaj.com --region us-central1
\`\`\`

## Troubleshooting:
- DNS propagation can take up to 24 hours
- Try verification again after 1-2 hours
- Use online DNS checkers to verify TXT record propagation
`
  },
  {
    slug: 'domain-setup-guide',
    title: 'Domain Setup Guide',
    date: '2025-01-05',
    excerpt: 'A guide for setting up a custom domain with Google App Engine.',
    readTime: '6 min read',
    author: 'Shivam Bhardwaj',
    tags: ['Google Cloud', 'App Engine', 'DNS', 'SSL'],
    content: `
# Domain Setup Guide: shivambhardwaj.com to Google App Engine

## Current Status
- **App Engine URL**: https://anti-mony.uc.r.appspot.com (LIVE)
- **Target Domain**: shivambhardwaj.com
- **Status**: Domain verification required

## Setup Steps

### Step 1: Verify Domain Ownership (REQUIRED FIRST)

1. Go to [Google Search Console](https://www.google.com/webmasters/verification/verification?domain=shivambhardwaj.com)
2. Sign in with: curious.antimony@gmail.com
3. Choose verification method:

#### Option A: DNS TXT Record (Recommended)
- Add TXT record to your DNS:
  - Type: TXT
  - Name: @ or shivambhardwaj.com
  - Value: google-site-verification=XXXXX (provided by Google)
  - TTL: 3600

#### Option B: Domain Registrar Verification
- If using Google Domains, Namecheap, GoDaddy, etc., use automatic verification

### Step 2: Add Domain to App Engine

Run these commands after domain verification:

\`\`\`bash
# Add root domain
gcloud app domain-mappings create shivambhardwaj.com --certificate-management=AUTOMATIC

# Add www subdomain
gcloud app domain-mappings create www.shivambhardwaj.com --certificate-management=AUTOMATIC
\`\`\`

### Step 3: Configure DNS Records

Add these records at your domain registrar:

#### For Root Domain (shivambhardwaj.com):
\`\`\`
Type: A
Name: @ (or blank)
Values:
  216.239.32.21
  216.239.34.21
  216.239.36.21
  216.239.38.21
TTL: 3600
\`\`\`

#### For WWW Subdomain:
\`\`\`
Type: CNAME
Name: www
Value: ghs.googlehosted.com
TTL: 3600
\`\`\`

#### Alternative for Root (if registrar supports):
\`\`\`
Type: ALIAS/ANAME
Name: @ (or blank)
Value: ghs.googlehosted.com
TTL: 3600
\`\`\`

### Step 4: Verify Setup

Check domain mapping status:
\`\`\`bash
gcloud app domain-mappings list
gcloud app domain-mappings describe shivambhardwaj.com
\`\`\`

Test DNS propagation:
\`\`\`bash
nslookup shivambhardwaj.com
nslookup www.shivambhardwaj.com
\`\`\`

### Step 5: SSL Certificate

- SSL certificates are **automatically provisioned** by Google
- Takes 15 minutes to 24 hours after DNS verification
- No action required from your side

## Quick Setup Script

Run the automated setup script:
\`\`\`bash
cd shivambhardwaj-gc
setup-custom-domain.bat
\`\`\`

## Timeline

1. **Domain Verification**: 5-10 minutes
2. **DNS Propagation**: 10 minutes to 48 hours (usually under 1 hour)
3. **SSL Certificate**: 15 minutes to 24 hours after DNS verification
4. **Full Setup**: Typically complete within 2-4 hours

## Troubleshooting

### Domain Verification Failed
- Ensure TXT record is added correctly
- Wait 10 minutes for DNS propagation
- Try alternative verification method

### DNS Not Resolving
- Check TTL settings (use 3600 or lower)
- Verify A records are correct
- Use DNS checker: https://dnschecker.org

### SSL Certificate Pending
- Ensure DNS is properly configured
- Wait up to 24 hours
- Check status: \`gcloud app domain-mappings describe shivambhardwaj.com\`

## Domain Registrar-Specific Instructions

### Namecheap
1. Go to Domain List > Manage
2. Advanced DNS tab
3. Add A records and CNAME as specified

### GoDaddy
1. DNS Management
2. Add records using their interface
3. Save changes

### Google Domains
1. DNS tab
2. Custom records section
3. Add required records

### Cloudflare
1. DNS tab
2. Add records (disable proxy initially)
3. After SSL is active, can enable proxy

## Final URLs

After setup, your app will be accessible at:
- https://shivambhardwaj.com
- https://www.shivambhardwaj.com
- Both will serve your App Engine application with SSL

## Need Help?

Contact Google Cloud Support or check:
- [App Engine Custom Domains Documentation](https://cloud.google.com/appengine/docs/standard/mapping-custom-domains)
- [Domain Verification Help](https://support.google.com/webmasters/answer/9008080)
`
  },
  {
    slug: 'domain-registrar-comparison',
    title: 'Domain Registrar Comparison',
    date: '2025-01-05',
    excerpt: 'A comparison of domain registrars for Google Cloud integration.',
    readTime: '3 min read',
    author: 'Shivam Bhardwaj',
    tags: ['Domain', 'Cloudflare', 'Google Cloud', 'Comparison'],
    content: `
# Domain Registrar Comparison 2025

## Current Situation:
- Google Domains → Sold to Squarespace (2023)
- Your domain: Currently at WordPress.com
- Need: Best integration with Google Cloud

## Option 1: Cloudflare Registrar
**Pros:**
- At-cost pricing (no markup) - ~$9.77/year for .com
- Excellent DNS performance
- Free SSL certificates
- Built-in DDoS protection
- API for automation
- Works perfectly with Google Cloud

**Cons:**
- Must use Cloudflare for DNS (can't use Google Cloud DNS)
- Less integration with Google services

## Option 2: Squarespace Domains (former Google Domains)
**Pros:**
- Same team that built Google Domains
- $12/year for .com
- Good Google Cloud integration
- Can use Google Cloud DNS
- Familiar Google-style interface

**Cons:**
- More expensive than Cloudflare
- Less DNS features than Cloudflare

## Option 3: Keep WordPress.com Domain + Use Google Cloud DNS
**Pros:**
- No transfer needed
- Already changed nameservers to Google
- Can configure everything now

**Cons:**
- Still paying WordPress.com
- Less control

## Recommendation: Cloudflare Registrar

**Why Cloudflare is best for your use case:**
1. **Cheapest:** $9.77/year vs $12+ elsewhere
2. **Best performance:** Fastest DNS globally
3. **Security:** Built-in DDoS protection
4. **Perfect for Google Cloud:** Many companies use this combo
5. **API integration:** Easy automation
6. **No Google dependency:** Diversified infrastructure

## Migration Steps with Cloudflare:

### Step 1: Transfer to Cloudflare
1. Go to **dash.cloudflare.com**
2. Click **"Register Domains"**
3. Search for your domain transfer
4. Use authorization code from WordPress.com
5. Cost: $9.77/year

### Step 2: DNS Configuration
Cloudflare will handle DNS (not Google Cloud DNS), which is actually better:
- Faster global DNS resolution
- Built-in security features
- Easy management interface

### Step 3: Domain Verification
Add TXT record in Cloudflare dashboard for Google verification

## Final Setup:
- **Domain:** Cloudflare Registrar ($9.77/year)
- **DNS:** Cloudflare DNS (free, faster than Google)
- **App:** Google Cloud Run
- **SSL:** Cloudflare + Google (double protection)

This is the most cost-effective and performant setup!
`
  },
  {
    slug: 'domain-setup',
    title: 'Domain Setup',
    date: '2025-01-05',
    excerpt: 'Steps required for domain migration to shivambhardwaj.com.',
    readTime: '2 min read',
    author: 'Shivam Bhardwaj',
    tags: ['DNS', 'Google Cloud', 'Migration'],
    content: `
# Domain Migration to shivambhardwaj.com

## Steps Required:

### 1. Domain Verification (In Progress)
- Visit: https://search.google.com/search-console/welcome?authuser=0&new_domain_name=shivambhardwaj.com
- Add domain property for shivambhardwaj.com
- Verify ownership using DNS TXT record or HTML file

### 2. After Domain Verification, Run:
\`\`\`bash
gcloud beta run domain-mappings create --service hello-world-service --domain shivambhardwaj.com --region us-central1
\`\`\`

### 3. Configure DNS Records
After creating domain mapping, Google will provide DNS records to add:
- A record: Points to Google Cloud Run IP
- AAAA record: Points to Google Cloud Run IPv6 (if available)

### 4. Get DNS Configuration:
\`\`\`bash
gcloud beta run domain-mappings describe --domain shivambhardwaj.com --region us-central1
\`\`\`

### 5. SSL Certificate
Google Cloud Run automatically provisions SSL certificates for verified domains.

## Current Status:
- Cloud Run service: ✅ Running
- Domain verification: ⏳ In progress
- DNS configuration: ⏳ Pending
- SSL certificate: ⏳ Auto-provisioned after DNS
`
  },
  {
    slug: 'fun-dns-tricks',
    title: 'Fun DNS Tricks',
    date: '2025-01-05',
    excerpt: 'A collection of fun and creative DNS tricks.',
    readTime: '15 min read',
    author: 'Shivam Bhardwaj',
    tags: ['DNS', 'DevOps', 'Fun', 'Tutorial'],
    content: `
# Fun DNS Tricks for shivambhardwaj.com

## How DNS Records Work

DNS (Domain Name System) is like the internet's phone book. When someone types your domain, DNS servers look up various records to know what to do. These records are public and queryable by anyone - that's where the fun begins!

### DNS Record Types Explained:
- **A Record**: Maps domain to IPv4 address (e.g., shivambhardwaj.com → 216.239.32.21)
- **AAAA Record**: Maps domain to IPv6 address
- **CNAME**: Alias pointing to another domain (redirect at DNS level)
- **TXT**: Text data - originally for notes, now used for verification, SPF, and... easter eggs!
- **MX**: Mail server designation
- **NS**: Nameserver delegation

### Why This Works:
DNS records are publicly queryable - it's how the internet functions! When developers, security researchers, or curious people investigate a domain, they often check DNS records. It's like hiding messages in plain sight that only tech-savvy people will find.

## 1. Hidden Messages in TXT Records

### How It Works:
TXT records can store any text up to 255 characters per string (multiple strings allowed). Originally designed for human-readable notes about a domain, they're now commonly used for domain verification (Google, Microsoft), email authentication (SPF, DKIM), and... easter eggs!

### Implementation:
Add these TXT records for fun discoveries:

\`\`\`
TXT @ "v=humans txt=Hello curious developer! You found my easter egg!"
TXT @ "hiring=Yes! Email me at curious.antimony@gmail.com"
TXT @ "favorite-language=TypeScript"
TXT @ "rick-roll=Never gonna give you up, never gonna let you down"
\`\`\`

### How to Add (varies by registrar):
**GoDaddy/Namecheap:**
1. DNS Management → Add Record
2. Type: TXT
3. Host: @ (for root domain)
4. Value: Your message
5. TTL: 3600

**Via Command Line (Google Cloud DNS):**
\`\`\`bash
gcloud dns record-sets transaction add \\
  '"Hello curious developer!"' \\
  --name=shivambhardwaj.com. \\
  --ttl=3600 \\
  --type=TXT \\
  --zone=your-zone-name
\`\`\`

### How People Discover These:
\`\`\`bash
# Linux/Mac:
dig TXT shivambhardwaj.com
host -t TXT shivambhardwaj.com

# Windows:
nslookup -type=TXT shivambhardwaj.com

# Online:
# Visit mxtoolbox.com → TXT Lookup
\`\`\`

### Real-World Examples:
\`\`\`bash
dig TXT google.com  # Returns multiple verification and SPF records
dig TXT github.com  # Shows their hiring status and verification codes
\`\`\`

## 2. ASCII Art in TXT Records

### How It Works:
By creating multiple TXT records with specific subdomain prefixes, you can store multi-line ASCII art. When queried in sequence, they form a complete image or message.

### Implementation:
\`\`\`
TXT _ascii1 "╔══════════════════════╗"
TXT _ascii2 "║  SHIVAM BHARDWAJ     ║"
TXT _ascii3 "║  Robotics Engineer   ║"
TXT _ascii4 "╚══════════════════════╝"
\`\`\`

### Automated Discovery Script:
\`\`\`bash
#!/bin/bash
# Save as: discover-art.sh
for i in {1..4}; do
  dig +short TXT _ascii$i.shivambhardwaj.com | sed 's/"//g'
done
\`\`\`

### Why Subdomains with Underscores:
- Underscores in DNS are valid for TXT records
- They don't interfere with actual subdomains
- They sort nicely when listed
- Convention: underscore indicates "metadata" not a real host

## 3. Fun Subdomains with Redirects

### How It Works:
Subdomains can point to different locations using CNAME records (DNS level) or URL forwarding (HTTP level). This creates memorable shortcuts and hidden pages.

### Method 1: CNAME Records (DNS Level)
Points subdomain to your app, app handles routing:
\`\`\`
CNAME resume.shivambhardwaj.com -> anti-mony.uc.r.appspot.com
CNAME cv.shivambhardwaj.com -> anti-mony.uc.r.appspot.com
\`\`\`
Your app then detects the subdomain and shows appropriate content.

### Method 2: URL Forwarding (HTTP Level)
Most registrars offer URL forwarding:
\`\`\`
github.shivambhardwaj.com -> 301 Redirect -> github.com/yourusername
linkedin.shivambhardwaj.com -> 301 Redirect -> linkedin.com/in/yourusername
\`\`\`

### Implementation Examples:

**At Registrar (Namecheap example):**
1. Advanced DNS → Add New Record
2. Type: URL Redirect Record
3. Host: github
4. Value: https://github.com/yourusername
5. Redirect Type: Permanent (301)

**For App-Handled Subdomains:**
\`\`\`javascript
// In your Next.js app
const subdomain = req.headers.host.split('.')[0];
if (subdomain === 'resume') {
  return <ResumePage />;
} else if (subdomain === 'secret') {
  return <SecretEasterEgg />;
}
\`\`\`

### Creative Examples:
\`\`\`
hire.shivambhardwaj.com -> Your calendly
coffee.shivambhardwaj.com -> buymeacoffee.com/yourname
rick.shivambhardwaj.com -> YouTube Rick Roll
404.shivambhardwaj.com -> Custom 404 page
api.shivambhardwaj.com -> API documentation
old.shivambhardwaj.com -> Wayback machine archive
\`\`\`

## 4. Clever Use of MX Records
Add fake but funny mail servers:

\`\`\`
MX 10 please-dont-email-me.shivambhardwaj.com
MX 20 seriously-use-gmail.shivambhardwaj.com
MX 30 mail-server-is-on-vacation.shivambhardwaj.com
\`\`\`

## 5. SPF Record Humor
\`\`\`
TXT @ "v=spf1 include:_spf.google.com ~all // Yes, I use Gmail like everyone else"
\`\`\`

## 6. Creative CNAME Chains
Create a treasure hunt:

\`\`\`
CNAME start -> clue1.shivambhardwaj.com
CNAME clue1 -> clue2.shivambhardwaj.com
CNAME clue2 -> clue3.shivambhardwaj.com
CNAME clue3 -> treasure.shivambhardwaj.com
CNAME treasure -> anti-mony.uc.r.appspot.com/congratulations
\`\`\`

## 7. Status Page Subdomain
\`\`\`
CNAME status -> statuspage.io/yourpage
TXT _status "operational=true last-updated=2025-01-06"
\`\`\`

## 8. Version Info
\`\`\`
TXT _version "site-version=1.0.0 deployed=2025-01-06 framework=nextjs"
TXT _tech "stack=React,TypeScript,TailwindCSS,GoogleCloud"
\`\`\`

## 9. Contact Card in DNS
\`\`\`
TXT _contact "email=curious.antimony@gmail.com"
TXT _contact "phone=optional"
TXT _contact "location=Earth"
TXT _contact "timezone=UTC"
\`\`\`

## 10. DNS-based API
Create a simple read-only API:

\`\`\`
TXT api.v1.status "{'status':'online','uptime':'99.9%'}"
TXT api.v1.projects "{'count':10,'featured':'robotics'}"
TXT api.v1.skills "['TypeScript','React','Robotics','Cloud']"
\`\`\`

Query with: \`dig +short TXT api.v1.status.shivambhardwaj.com\`

## 11. Hiring Status Indicator
\`\`\`
TXT hiring "status=open position=robotics-engineer location=remote"
CNAME jobs -> anti-mony.uc.r.appspot.com/careers
\`\`\`

## 12. Security.txt via DNS
\`\`\`
TXT _security "security-contact=security@shivambhardwaj.com"
TXT _security "preferred-languages=en"
TXT _security "canonical=https://shivambhardwaj.com/.well-known/security.txt"
\`\`\`

## 13. DNS Haiku
\`\`\`
TXT _haiku1 "Packets flowing fast"
TXT _haiku2 "Through fiber optic cables"
TXT _haiku3 "Website loads with joy"
\`\`\`

## 14. Konami Code
\`\`\`
TXT _konami "up,up,down,down,left,right,left,right,B,A"
CNAME konami -> anti-mony.uc.r.appspot.com/secret-page
\`\`\`

## 15. Time Capsule
\`\`\`
TXT _timecapsule "message=Hello from 2025! Bitcoin is at $100k created=2025-01-06 open=2030-01-06"
\`\`\`

## Implementation Script

\`\`\`bash
# Add fun TXT records
gcloud dns record-sets transaction start --zone=YOUR_ZONE
gcloud dns record-sets transaction add "Hello curious developer!" --name=@ --ttl=300 --type=TXT --zone=YOUR_ZONE
gcloud dns record-sets transaction add "v=spf1 ~all // Using Gmail" --name=@ --ttl=300 --type=TXT --zone=YOUR_ZONE
gcloud dns record-sets transaction execute --zone=YOUR_ZONE

# Or using your registrar's DNS panel, add:
# Type: TXT
# Name: @
# Value: "Your message here"
\`\`\`

## How People Discover DNS Easter Eggs

### Who Looks at DNS Records:
1. **Security Researchers** - Checking for misconfigurations, SPF records
2. **Developers** - Debugging issues, checking setup
3. **Recruiters/Hiring Managers** - Tech-savvy ones checking if you're "real"
4. **Curious Techies** - People who dig into everything
5. **Pentesters** - Information gathering phase
6. **DNS Enthusiasts** - Yes, they exist!

### Discovery Commands Explained:

**1. Using dig (Domain Information Groper):**
\`\`\`bash
# Get all TXT records
dig TXT shivambhardwaj.com

# Get specific subdomain
dig TXT _hiring.shivambhardwaj.com

# Get all records (if allowed)
dig ANY shivambhardwaj.com

# Short output only
dig +short TXT shivambhardwaj.com

# Trace DNS resolution path
dig +trace shivambhardwaj.com
\`\`\`

**2. Using nslookup (Windows/Cross-platform):**
\`\`\`bash
# Interactive mode
nslookup
> set type=TXT
> shivambhardwaj.com

# Direct query
nslookup -type=TXT shivambhardwaj.com 8.8.8.8
\`\`\`

**3. Using host (Linux/Mac):**
\`\`\`bash
# Get TXT records
host -t TXT shivambhardwaj.com

# Get all records
host -a shivambhardwaj.com
\`\`\`

**4. PowerShell (Windows):**
\`\`\`powershell
Resolve-DnsName shivambhardwaj.com -Type TXT
\`\`\`

**5. Online Tools (No installation needed):**
- **dnschecker.org** - Check propagation globally
- **mxtoolbox.com** - Comprehensive DNS tools
- **whatsmydns.net** - Global DNS propagation
- **dnsdumpster.com** - DNS recon tool
- **dnslytics.com** - Historical DNS data

### Automated Discovery Script:
\`\`\`python
# dns_easter_egg_hunter.py
import dns.resolver

def find_easter_eggs(domain):
    print(f"Hunting for easter eggs in {domain}...")
    
    # Check main TXT records
    try:
        txt_records = dns.resolver.resolve(domain, 'TXT')
        for record in txt_records:
            print(f"Found: {record.to_text()}")
    except:
        pass
    
    # Check common easter egg subdomains
    easter_eggs = ['_hiring', '_ascii', '_haiku', '_secret', '_human']
    for egg in easter_eggs:
        try:
            records = dns.resolver.resolve(f"{egg}.{domain}", 'TXT')
            for record in records:
                print(f"Easter egg at {egg}: {record.to_text()}")
        except:
            pass

find_easter_eggs("shivambhardwaj.com")
\`\`\`

## Famous Real-World Examples

### Companies with DNS Easter Eggs:

**Google:**
\`\`\`bash
dig TXT google.com
# Returns: "v=spf1 include:_spf.google.com ~all"
# Plus multiple verification records
\`\`\`

**Cloudflare (1.1.1.1):**
\`\`\`bash
dig TXT cloudflare.com
# Includes hiring messages and technical jokes
\`\`\`

**Discord:**
\`\`\`bash
dig TXT discord.com
# Has hidden job postings in TXT records
\`\`\`

**Spotify:**
\`\`\`bash
dig TXT spotify.com
# Contains playlist recommendations in TXT
\`\`\`

### Why Companies Do This:
1. **Tech Culture Signal** - Shows engineering culture and attention to detail
2. **Recruiting Tool** - Hidden job posts attract curious engineers
3. **Brand Building** - Makes the company memorable
4. **Community Building** - Creates insider knowledge among tech folks
5. **SEO/Marketing** - Gets shared on social media when discovered

## Best Practices

1. **Don't break functionality** - Keep real records working
2. **Use appropriate TTLs** - Short for testing (300), longer for permanent (3600)
3. **Document somewhere** - Maybe a /dns-easter-eggs page
4. **Keep it professional** - Remember this is public
5. **Monitor for abuse** - Check your DNS query logs
6. **Update regularly** - Stale easter eggs look abandoned
7. **Consider mobile** - Some people check DNS on phones

## Legal/Professional Ones

\`\`\`
TXT @ "google-site-verification=YOUR_CODE"
TXT @ "brave-ledger-verification=YOUR_CODE"
TXT @ "keybase-site-verification=YOUR_CODE"
\`\`\`

## The Ultimate: DNS Protocol Art

Create an entire ASCII art piece discoverable via DNS:
\`\`\`bash
for i in {1..10}; do
  dig +short TXT art$i.shivambhardwaj.com
done
\`\`\`

Outputs a complete ASCII robot or your logo!

## Step-by-Step Implementation Guide

### Quick Start (5 Minutes):

#### Step 1: Add Your First Easter Egg
Go to your domain registrar's DNS management and add:
- Type: TXT
- Name: @
- Value: "Hello world! You found my DNS easter egg!"
- TTL: 3600

#### Step 2: Test It
\`\`\`bash
# Windows:
nslookup -type=TXT yourdomain.com

# Mac/Linux:
dig TXT yourdomain.com
\`\`\`

### Advanced Setup (30 Minutes):

#### 1. Plan Your Easter Eggs
Create a spreadsheet with:
- Record name
- Message/content
- Purpose (fun, hiring, info)

#### 2. Batch Add Records
Most registrars allow CSV import or API access:

**Using Cloudflare API:**
\`\`\`bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  --data '{"type":"TXT","name":"@","content":"Your easter egg here","ttl":3600}'
\`\`\`

**Using Google Cloud DNS:**
\`\`\`bash
# Start transaction
gcloud dns record-sets transaction start --zone=YOUR_ZONE

# Add multiple records
gcloud dns record-sets transaction add "hiring=yes" --name=@ --ttl=300 --type=TXT --zone=YOUR_ZONE
gcloud dns record-sets transaction add "favorite-tech=kubernetes" --name=@ --ttl=300 --type=TXT --zone=YOUR_ZONE

# Execute
gcloud dns record-sets transaction execute --zone=YOUR_ZONE
\`\`\`

#### 3. Create a Discovery Page
Add to your website:
\`\`\`html
<!-- /dns-easter-eggs.html -->
<h1>DNS Easter Egg Hunt!</h1>
<p>Try these commands to find hidden messages:</p>
<code>dig TXT shivambhardwaj.com</code>
<code>dig TXT _hiring.shivambhardwaj.com</code>
\`\`\`

#### 4. Monitor Discovery
Track who finds your easter eggs:
- Check DNS query logs (if available)
- Add analytics to your discovery page
- Monitor social media mentions

### Maintenance Tips:
1. **Quarterly Updates** - Refresh messages seasonally
2. **Event-Based** - Add special messages for holidays/events
3. **Interactive** - Change based on current projects
4. **Versioning** - Include version numbers in TXT records
5. **Cleanup** - Remove outdated information

### DNS Record Limits to Remember:
- TXT record: 255 characters per string
- Multiple strings: Can be concatenated
- Total DNS response: Should stay under 512 bytes for compatibility
- Number of records: No hard limit, but keep reasonable
- Subdomain levels: Up to 127 levels technically allowed

### Testing Your Setup:
\`\`\`bash
# Test from different locations
dig @8.8.8.8 TXT yourdomain.com      # Google DNS
dig @1.1.1.1 TXT yourdomain.com      # Cloudflare DNS
dig @208.67.222.222 TXT yourdomain.com # OpenDNS

# Check propagation time
watch -n 5 'dig +short TXT yourdomain.com'
\`\`\`

### Troubleshooting:
- **Not showing up?** Wait 5-10 minutes for propagation
- **Quotes in output?** Normal - DNS adds quotes to TXT
- **Multiple values?** DNS can return records in any order
- **Too long?** Split into multiple records or use compression
`
  },
  {
    slug: 'gc-project-plan',
    title: 'GC Project Plan',
    date: '2025-01-05',
    excerpt: 'A comprehensive project plan for creating a Google Cloud version of the shivambhardwaj.com website.',
    readTime: '15 min read',
    author: 'Shivam Bhardwaj',
    tags: ['Google Cloud', 'Project Plan', 'Architecture'],
    content: `
# GC Version of Shivam Bhardwaj Portfolio - Comprehensive Project Plan

## Project Overview

This document outlines the complete strategy for creating a Google Cloud (GC) version of the existing shivambhardwaj.com website, focusing on extracting core business logic while implementing enterprise-grade testing, logging, and deployment automation.

## Executive Summary

**Objective**: Build a GC-hosted version of the portfolio website with enhanced testing, structured logging, and comprehensive automation while preserving all original functionality.

**Timeline**: 10 weeks (70 development days)
**Success Criteria**: 100% master script functionality, 90%+ test coverage, zero deployment errors

---

## Phase 1: Foundation & Architecture (Week 1-2)

### 1.1 Project Structure Setup
\`\`\`
shivambhardwaj-gc/
├── src/                    # Core application
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/              # Business logic
│   ├── config/           # Configuration management
│   └── types/            # TypeScript definitions
├── infrastructure/        # GCP infrastructure as code
│   ├── terraform/        # Terraform configs
│   ├── docker/          # Container definitions
│   └── k8s/             # Kubernetes manifests
├── scripts/              # Automation scripts
│   ├── deployment/      # Deploy automation
│   ├── testing/         # Test orchestration
│   └── monitoring/      # Logging & monitoring
├── tests/                # Comprehensive test suite
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── e2e/           # End-to-end tests
│   ├── performance/   # Performance tests
│   └── security/      # Security tests
└── docs/                # Documentation
\`\`\`

### 1.2 Google Cloud Architecture
- **App Engine**: Serverless hosting platform
- **Cloud Build**: CI/CD pipeline automation
- **Cloud Storage**: Static asset storage
- **Cloud CDN**: Global content distribution
- **Cloud Logging**: Centralized log management
- **Cloud Monitoring**: Application observability
- **Cloud Functions**: Serverless operations
- **Cloud DNS**: Domain management
- **Secret Manager**: Configuration security

---

## Phase 2: Core Application Logic (Week 3-4)

### 2.1 Business Logic Migration

**Key Components to Migrate:**
- **Configuration System**: Centralized config with GCP Secret Manager
- **Robotics Calculators**: All mathematical functions and algorithms
- **Swarm Simulation**: Interactive canvas with real-time updates
- **Portfolio System**: Project showcase with metrics
- **Theme Management**: Dark/light mode with persistence
- **Contact Integration**: Form handling with Cloud Functions

**Architecture Patterns:**
- Centralized Configuration (ConfigManager)
- Data Architecture with type safety
- Component Patterns (compound components, render props)
- Performance Optimization (code splitting, lazy loading)
- Advanced Robotics Logic (mathematical libraries, algorithms)

### 2.2 Enhanced Logging System

\`\`\`typescript
// Multi-level structured logging interface
interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  component: string;
  message: string;
  metadata?: any;
  requestId?: string;
  userId?: string;
  performance?: {
    duration: number;
    memory: number;
    cpu: number;
  };
}
\`\`\`

**Logging Features:**
- Structured JSON logging for Cloud Logging integration
- Request tracing with correlation IDs
- Performance metrics capture
- Error aggregation with stack traces
- User interaction tracking
- Component-level logging with context
- Log rotation and retention policies
- Real-time monitoring dashboards

---

## Phase 3: Comprehensive Testing Framework (Week 5-6)

### 3.1 Multi-Layer Testing Strategy

**Unit Tests (Vitest + React Testing Library):**
- Component behavior testing
- Business logic validation
- Mathematical function verification
- Hook testing with custom test utils
- Mock integration for external dependencies

**Integration Tests:**
- API endpoint testing
- Database integration
- Third-party service mocking
- Component interaction testing
- State management validation

**End-to-End Tests (Playwright):**
- User journey testing
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness (Pixel 5, iPhone 12)
- Performance scenarios
- Accessibility workflows

**Performance Tests:**
- Lighthouse integration with budgets
- Core Web Vitals monitoring
- Load testing with K6
- Memory usage profiling
- Network simulation

**Security Tests:**
- OWASP Top 10 validation
- XSS prevention testing
- CSRF protection verification
- Input sanitization checks
- Authentication testing

### 3.2 Testing Infrastructure

\`\`\`javascript
// Test orchestration system
class TestOrchestrator {
  async runAll() {
    const results = await Promise.allSettled([
      this.runUnitTests(),
      this.runIntegrationTests(),
      this.runE2ETests(),
      this.runPerformanceTests(),
      this.runSecurityTests(),
      this.runAccessibilityTests()
    ]);
    return this.generateReport(results);
  }
}
\`\`\`

**Test Configuration:**
- Coverage Threshold: 90% across all metrics
- Cross-Browser Testing: Chrome, Firefox, Safari, Edge
- Mobile Testing: Pixel 5, iPhone 12
- Performance Budgets: Lighthouse audits
- Accessibility Standards: WCAG 2.1 compliance

---

## Phase 4: Master Controller System (Week 7)

### 4.1 Enhanced Master Script (master.bat/sh)

**All Original Options Plus GCP-Specific Features:**

**Development Operations:**
- [1] Development Menu - Dev server management
- [D] Quick Dev Start - Local development with hot reload
- [3] Open in Browser - GCP emulator integration
- [4] View Logs - Database seeding utilities

**Testing Operations:**
- [2] Testing Menu - Parallel test execution
- [T] Quick Test Run - Coverage reporting with thresholds
- [1-9] All Test Types - Test result aggregation
- Enhanced: Failure analysis and reporting, performance benchmarking

**Build & Deploy Operations:**
- [3] Build and Deploy - Multi-environment builds
- [B] Quick Build - Docker containerization
- [F] Firebase Deploy → GCP Deploy - Kubernetes deployment
- [P] Production Deploy - Traffic routing management
- [R] Quick Deploy - Health checks and rollbacks

**Code Quality Operations:**
- [4] Code Quality - ESLint with custom GCP rules
- [L] Quick Lint - TypeScript strict mode validation
- [5] Full Quality Check - Dependency vulnerability scanning
- Enhanced: Code complexity analysis, performance budgets enforcement

**Security Operations:**
- [5] Security Menu - Enhanced security scanning
- [S] Security Check - Vulnerability assessment
- [1-4] Security Options - Compliance validation

**Utilities:**
- [6] Utilities Menu - Enhanced project management
- [U] Project Status - Infrastructure monitoring
- [C] Claude Helper - AI-powered assistance
- Enhanced: Log aggregation, performance metrics, error tracking

**Git Operations:**
- [7] Git Operations - Enhanced version control
- [G] Git Status - Automated workflows
- [8] Quick Commit & Push - Pre-commit validation

### 4.2 Intelligent Automation

\`\`\`javascript
// Self-healing deployment system
class DeploymentManager {
  async deploy(environment) {
    const preChecks = await this.runPreDeploymentChecks();
    if (!preChecks.success) {
      await this.autoFixIssues(preChecks.issues);
    }
    
    const deployment = await this.executeDeploy(environment);
    await this.runPostDeploymentTests();
    await this.configureMonitoring();
    
    return deployment;
  }
}
\`\`\`

---

## Phase 5: GCP Infrastructure & Deployment (Week 8)

### 5.1 Infrastructure as Code (Terraform)

\`\`\`hcl
# Complete GCP setup
resource "google_app_engine_application" "portfolio" {
  project       = var.project_id
  location_id   = var.region
  database_type = "CLOUD_DATASTORE_COMPATIBILITY"
}

resource "google_cloud_build_trigger" "deploy_trigger" {
  github {
    owner = var.github_owner
    name  = var.github_repo
    push {
      branch = "^main$"
    }
  }
  
  build {
    step {
      name = "gcr.io/cloud-builders/npm"
      args = ["run", "test:ci"]
    }
    step {
      name = "gcr.io/cloud-builders/npm"
      args = ["run", "build"]
    }
    step {
      name = "gcr.io/cloud-builders/gcloud"
      args = ["app", "deploy"]
    }
  }
}
\`\`\`

### 5.2 CI/CD Pipeline

\`\`\`yaml
# cloudbuild.yaml
steps:
  # Install dependencies
  - name: 'gcr.io/cloud-builders/npm'
    args: ['install']
    
  # Run comprehensive tests
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'test:all']
    
  # Security scanning
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'security:scan']
    
  # Build application
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'build']
    
  # Deploy to App Engine
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['app', 'deploy', '--quiet']
    
  # Run post-deployment tests
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'test:e2e:production']
\`\`\`

---

## Phase 6: Monitoring & Observability (Week 9)

### 6.1 Comprehensive Monitoring Stack
- **Application Performance Monitoring** with Cloud Monitoring
- **Real User Monitoring** for performance insights
- **Error Tracking** with Cloud Error Reporting
- **Custom Dashboards** for business metrics
- **Alerting Rules** for proactive monitoring
- **Log Analytics** for troubleshooting

### 6.2 Health Check System

\`\`\`typescript
// Multi-dimensional health checks
interface HealthCheck {
  database: boolean;
  externalAPIs: boolean;
  memoryUsage: number;
  diskSpace: number;
  responseTime: number;
  errorRate: number;
}
\`\`\`

---

## Phase 7: Testing & Optimization (Week 10)

### 7.1 Master Script Validation
Systematic testing of ALL master script options:
- **Automated Test Suite** for each script function
- **Error Injection Testing** for resilience
- **Performance Benchmarking** of operations
- **Integration Testing** with GCP services
- **Load Testing** of deployment pipeline

### 7.2 Performance Optimization
- **Bundle Analysis** and optimization
- **Image Optimization** with Cloud CDN
- **Caching Strategy** implementation
- **Database Query** optimization
- **Network Performance** tuning

---

## Implementation Timeline

| Week | Phase | Key Deliverables | Success Metrics |
|------|-------|------------------|-----------------|
| 1-2  | Foundation | Project structure, GCP setup, basic architecture | Infrastructure provisioned, project initialized |
| 3-4  | Core Logic | Business logic migration, enhanced logging system | All original features migrated, logging functional |
| 5-6  | Testing | Comprehensive test framework, automation | 90%+ test coverage, automated test pipeline |
| 7    | Master Script | Enhanced controller with all original options | All 22+ options working without errors |
| 8    | Infrastructure | Complete GCP deployment pipeline | Automated deployment, zero-downtime releases |
| 9    | Monitoring | Observability and alerting setup | Full monitoring stack, proactive alerting |
| 10   | Validation | End-to-end testing and optimization | Performance optimized, production ready |

---

## Success Criteria

### Primary Objectives
1. **✅ 100% Master Script Functionality**: All original options working without errors
2. **✅ 90%+ Test Coverage**: Comprehensive testing across all layers
3. **✅ Zero Deployment Errors**: Robust CI/CD with auto-recovery
4. **✅ Sub-2s Load Time**: Performance optimization with monitoring
5. **✅ 99.9% Uptime**: Reliable GCP infrastructure with scaling
6. **✅ Comprehensive Logging**: Full observability with structured logs

### Technical Requirements
- **Next.js 15.4.5** with App Router
- **TypeScript 5** with strict mode
- **Tailwind CSS v4** with custom theming
- **Framer Motion** for animations
- **Google Cloud Platform** services integration

### Quality Gates
- **Code Quality**: ESLint passing, TypeScript strict mode
- **Security**: OWASP compliance, vulnerability scanning
- **Performance**: Lighthouse scores >90, Core Web Vitals
- **Accessibility**: WCAG 2.1 compliance
- **Testing**: Unit, integration, E2E, performance, security tests

---

## Key Advantages Over Original

### Enhanced Capabilities
- **Structured JSON Logging**: Cloud Logging integration with correlation IDs
- **Enterprise Monitoring**: Custom dashboards, alerting, and observability
- **Auto-Healing Pipeline**: Self-recovering deployments with intelligent rollbacks
- **Infrastructure as Code**: Terraform-managed, version-controlled infrastructure
- **Performance Optimization**: Sub-2s load times with global CDN
- **Comprehensive Testing**: 90%+ coverage with multi-layer testing strategy

### Master Script Enhancements
- All 22+ original options preserved and enhanced
- GCP-specific operations added (Cloud Build, App Engine, etc.)
- Intelligent error recovery and auto-fixing
- Parallel execution capabilities for improved performance
- Comprehensive logging of all operations with structured output
- Interactive mode with guided workflows

### Business Continuity
- **Zero-Downtime Deployments**: Blue-green deployment strategy
- **Automatic Scaling**: GCP App Engine auto-scaling
- **Disaster Recovery**: Multi-region backup and restore
- **Security Compliance**: Enterprise-grade security controls

---

## Risk Mitigation

### Technical Risks
- **GCP Service Limits**: Monitor quotas and implement auto-scaling
- **Migration Complexity**: Phased migration with rollback capabilities
- **Performance Degradation**: Continuous monitoring with alerting

### Operational Risks
- **Team Knowledge**: Comprehensive documentation and training
- **Cost Management**: Budget alerts and resource optimization
- **Vendor Lock-in**: Abstract GCP services with standardized interfaces

---

## Resource Requirements

### Development Team
- **Full-Stack Developer**: 1 FTE for 10 weeks
- **DevOps Engineer**: 0.5 FTE for infrastructure setup
- **QA Engineer**: 0.5 FTE for comprehensive testing

### GCP Resources
- **App Engine**: Standard environment
- **Cloud Build**: 120 build minutes/day
- **Cloud Storage**: 10GB for static assets
- **Cloud CDN**: Global distribution
- **Cloud Monitoring**: Custom metrics and dashboards

### Tools & Services
- **Development**: VS Code, Git, Docker
- **Testing**: Playwright, Vitest, Lighthouse
- **Monitoring**: Cloud Logging, Error Reporting
- **Infrastructure**: Terraform, Kubernetes

---

## Conclusion

This comprehensive plan ensures the GC version will exceed the original website's capabilities while maintaining all existing functionality. The enhanced testing, logging, and deployment automation will provide enterprise-grade reliability and observability.

**Next Steps:**
1. Review and approve this project plan
2. Set up GCP project and initial infrastructure
3. Begin Phase 1: Foundation & Architecture setup
4. Establish development workflow and team access

---

*Document Version: 1.0*
*Created: 2025-09-05*
*Author: Claude Code Assistant*
*Project: Shivam Bhardwaj Portfolio - GC Migration*
`
  },
  {
    slug: 'google-ecosystem-migration',
    title: 'Google Ecosystem Migration',
    date: '2025-01-05',
    excerpt: 'A guide to migrating to the complete Google ecosystem.',
    readTime: '3 min read',
    author: 'Shivam Bhardwaj',
    tags: ['Google Cloud', 'Migration', 'DNS', 'Google Domains'],
    content: `
# Complete Google Ecosystem Migration

## Current State:
- Domain: shivambhardwaj.com (Cloudflare)
- Website: WordPress.com
- App: Google Cloud Run ✅

## Target State:
- Domain: Google Domains
- DNS: Google Cloud DNS
- App: Google Cloud Run ✅
- Email: Google Workspace (optional)

## Migration Steps:

### 1. Transfer Domain to Google Domains
**Visit:** https://domains.google.com
1. Search for "Transfer domain"
2. Enter: shivambhardwaj.com
3. Get authorization code from Cloudflare:
   - Go to Cloudflare dashboard
   - Select shivambhardwaj.com domain
   - Go to Overview tab
   - Scroll down to "Transfer domain"
   - Get authorization code
4. Complete transfer in Google Domains ($12/year renewal)

### 2. Set up Google Cloud DNS (Alternative to domain transfer)
**If you prefer to keep Cloudflare but use Google DNS:**
\`\`\`bash
# Create DNS zone in Google Cloud
gcloud dns managed-zones create shivambhardwaj-zone --dns-name=shivambhardwaj.com --description="Shivam Bhardwaj domain zone"

# Get Google nameservers
gcloud dns managed-zones describe shivambhardwaj-zone
\`\`\`

### 3. Immediate Solution (While domain transfers)
**Use Google Cloud DNS now:**
\`\`\`bash
# Create DNS zone
gcloud dns managed-zones create shivambhardwaj-zone --dns-name=shivambhardwaj.com --description="Shivam Bhardwaj domain zone"
\`\`\`

### 4. After DNS Setup
\`\`\`bash
# Add verification TXT record
gcloud dns record-sets transaction start --zone=shivambhardwaj-zone

# Add Google verification TXT record
gcloud dns record-sets transaction add --zone=shivambhardwaj-zone --name=shivambhardwaj.com. --ttl=300 --type=TXT "google-site-verification=YOUR_TOKEN"

# Execute transaction
gcloud dns record-sets transaction execute --zone=shivambhardwaj-zone
\`\`\`

### 5. Complete Integration
After domain/DNS migration:
- Domain mapping for Cloud Run
- SSL certificate auto-provisioning
- Google Workspace setup (optional)

## Benefits of Full Google Ecosystem:
- Single billing/management
- Integrated security
- Better AI integration capabilities
- Simplified domain verification
- Automatic SSL certificates
- Unified logging and monitoring

## Cost Comparison:
- Google Domains: $12/year
- Cloudflare: $0-20/year
- Google Cloud DNS: $0.50/zone + queries
- Benefits: Integration worth the small cost difference
`
  },
  {
    slug: 'wordpress-to-google-migration',
    title: 'WordPress to Google Migration',
    date: '2025-01-05',
    excerpt: 'A guide to migrating from WordPress.com to the Google ecosystem.',
    readTime: '3 min read',
    author: 'Shivam Bhardwaj',
    tags: ['WordPress', 'Google Cloud', 'Migration'],
    content: `
# Complete WordPress.com to Google Migration

## Current Setup:
- Domain: shivambhardwaj.com (registered with WordPress.com)
- Hosting: WordPress.com (paid plan)
- App: Google Cloud Run ✅

## Migration Steps:

### 1. Transfer Domain OUT of WordPress.com
**In WordPress.com Dashboard:**
1. Go to **My Sites** → **Domains** → **shivambhardwaj.com**
2. Click **Transfer Domain Away**
3. Get **Authorization Code (EPP Code)**
4. Unlock domain for transfer
5. Note: Must wait 60 days after registration/last transfer

### 2. Transfer TO Google Domains
**Visit:** https://domains.google.com
1. Click **Transfer a domain you already own**
2. Enter: shivambhardwaj.com
3. Enter authorization code from WordPress.com
4. Complete transfer ($12/year - cheaper than WordPress.com)

### 3. Cancel WordPress.com Services
**In WordPress.com:**
1. Go to **Plans** → **Cancel Plan**
2. Download any content you need first
3. Cancel domain registration renewal
4. Keep email forwarding if needed

### 4. Immediate DNS Setup (Before Transfer Completes)
Since you changed nameservers to Google, we can configure DNS now:

\`\`\`bash
# Add verification TXT record (get token from Google Search Console)
gcloud dns record-sets transaction start --zone=shivambhardwaj-zone
gcloud dns record-sets transaction add --zone=shivambhardwaj-zone --name=shivambhardwaj.com. --ttl=300 --type=TXT "google-site-verification=YOUR_TOKEN"
gcloud dns record-sets transaction execute --zone=shivambhardwaj-zone
\`\`\`

### 5. Point Domain to Cloud Run
After verification:
\`\`\`bash
# Create domain mapping
gcloud beta run domain-mappings create --service hello-world-service --domain shivambhardwaj.com --region us-central1

# Get required DNS records
gcloud beta run domain-mappings describe --domain shivambhardwaj.com --region us-central1
\`\`\`

## Cost Comparison:
- **WordPress.com:** $48-300/year
- **Google Domains:** $12/year
- **Google Cloud Run:** $0-5/month (free tier)
- **Total Savings:** $36-288/year

## Benefits:
- Complete Google ecosystem integration
- Better AI capabilities
- No WordPress.com limitations
- Full control over DNS
- Automatic SSL certificates
- Better performance with Cloud Run

## Next Steps:
1. Get authorization code from WordPress.com
2. Transfer domain to Google Domains
3. Configure DNS for Cloud Run
4. Cancel WordPress.com billing
`
  }
];