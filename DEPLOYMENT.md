# Deployment Guide - xps2018 Server

This guide explains how to deploy the robotics portfolio on the xps2018 server (10.0.0.109) for hosting at shivambhardwaj.com.

## Server Details

- **Server**: xps2018 (curious@10.0.0.109)
- **Domain**: shivambhardwaj.com (managed via Cloudflare)
- **Deployment Path**: /var/www/shivambhardwaj.com
- **Repository Location**: ~/robotics-portfolio (or wherever cloned on xps2018)

## Prerequisites

### On xps2018 Server

1. Node.js and npm installed:
   ```bash
   node --version  # Should be >=18.0.0
   npm --version   # Should be >=8.0.0
   ```

2. Git configured with GitHub access (passwordless):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your@email.com"

   # Set up SSH key for GitHub (if not already done)
   ssh-keygen -t ed25519 -C "your@email.com"
   cat ~/.ssh/id_ed25519.pub  # Add this to GitHub
   ```

1. **Install Nginx**:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Create deployment directory**:
   ```bash
   sudo mkdir -p /var/www/shivambhardwaj.com
   sudo chown -R curious:curious /var/www/shivambhardwaj.com
   ```

3. **Configure Nginx**:
   ```bash
   # Copy the nginx configuration
   sudo cp nginx-xps2018.conf /etc/nginx/sites-available/shivambhardwaj.com

   # Create symlink to enable the site
   sudo ln -s /etc/nginx/sites-available/shivambhardwaj.com /etc/nginx/sites-enabled/

   # Test configuration
   sudo nginx -t

   # Reload Nginx
   sudo systemctl reload nginx
   ```

## Deployment Process

### Quick Deploy (Recommended)

**On xps2018 server**, navigate to the repository directory and run:

```bash
cd ~/robotics-portfolio  # Or wherever you cloned the repo
./deploy-xps2018.sh
```

This script will automatically:
1. Pull latest changes from GitHub
2. Install/update npm dependencies
3. Build the production bundle
4. Copy files to `/var/www/shivambhardwaj.com`
5. Set correct file permissions

### Manual Deployment

If you prefer to deploy manually on xps2018:

```bash
# 1. Pull latest changes
cd ~/robotics-portfolio
git pull origin master

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Deploy
mkdir -p /var/www/shivambhardwaj.com
rsync -av --delete ./out/ /var/www/shivambhardwaj.com/
chmod -R 755 /var/www/shivambhardwaj.com
```

## Cloudflare Configuration

### DNS Setup

1. Log in to Cloudflare dashboard
2. Select your domain: shivambhardwaj.com
3. Go to **DNS** settings
4. Add an A record:
   - **Type**: A
   - **Name**: @ (root domain)
   - **IPv4 address**: 10.0.0.109
   - **Proxy status**: Proxied (orange cloud)
   - **TTL**: Auto

5. Add a CNAME record for www:
   - **Type**: CNAME
   - **Name**: www
   - **Target**: shivambhardwaj.com
   - **Proxy status**: Proxied
   - **TTL**: Auto

### SSL/TLS Configuration

1. In Cloudflare dashboard, go to **SSL/TLS**
2. Set encryption mode to **Full** or **Full (strict)**
3. (Optional) Generate Cloudflare Origin Certificate:
   - Go to **SSL/TLS** → **Origin Server**
   - Click **Create Certificate**
   - Download certificate and key
   - Install on xps2018 server in `/etc/ssl/cloudflare/`
   - Update nginx configuration to enable HTTPS

### Security Settings

Recommended Cloudflare settings:

1. **SSL/TLS** → **Edge Certificates**:
   - Enable **Always Use HTTPS**
   - Enable **Automatic HTTPS Rewrites**
   - Set Minimum TLS Version to **1.2**

2. **Security** → **WAF**:
   - Enable managed rules for protection

3. **Speed** → **Optimization**:
   - Enable Auto Minify (CSS, JS, HTML)
   - Enable Brotli compression

## Verification

After deployment, verify the site is working:

1. **Local access** (from local network):
   ```bash
   curl http://10.0.0.109
   ```

2. **Domain access** (once DNS propagates):
   ```bash
   curl https://shivambhardwaj.com
   ```

3. **Browser testing**:
   - http://10.0.0.109
   - https://shivambhardwaj.com
   - https://www.shivambhardwaj.com

## Troubleshooting

### Site Not Loading

1. Check Nginx status:
   ```bash
   sudo systemctl status nginx
   ```

2. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. Verify file permissions:
   ```bash
   ls -la /var/www/shivambhardwaj.com
   ```

### DNS Issues

- DNS propagation can take up to 48 hours
- Check DNS status: https://dnschecker.org/
- Verify Cloudflare nameservers are active

### SSL Certificate Errors

- Ensure Cloudflare SSL mode is set to **Full** or **Full (strict)**
- If using origin certificates, verify they're correctly installed on xps2018
- Check certificate expiration dates

## Continuous Deployment

For automated deployments, you can:

1. **Set up SSH key authentication**:
   ```bash
   ssh-copy-id curious@10.0.0.109
   ```

2. **Create a GitHub Action** (optional):
   - Trigger on push to main branch
   - Build and deploy to xps2018
   - See `.github/workflows/` for examples

## Monitoring

### Server Health

Check server resources:
```bash
ssh curious@10.0.0.109
htop                    # CPU/Memory usage
df -h                   # Disk space
sudo systemctl status nginx  # Nginx status
```

### Site Performance

- Use Cloudflare Analytics dashboard
- Run Lighthouse audits: `npm run test:performance`
- Monitor Core Web Vitals in Cloudflare

## Rollback

If you need to rollback to a previous version:

1. **Keep backups**:
   ```bash
   # On xps2018, backup before each deployment
   sudo cp -r /var/www/shivambhardwaj.com /var/www/backups/shivambhardwaj.com.$(date +%Y%m%d-%H%M%S)
   ```

2. **Restore from backup**:
   ```bash
   sudo cp -r /var/www/backups/shivambhardwaj.com.20251020-120000/* /var/www/shivambhardwaj.com/
   ```

## Support

For issues or questions:
- Check Nginx logs: `/var/log/nginx/`
- Review Cloudflare dashboard for errors
- Contact: contact@shivambhardwaj.com
