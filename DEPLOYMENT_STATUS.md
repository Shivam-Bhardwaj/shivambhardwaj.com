# Deployment Status

## ✅ Deployment Successful

Your site has been successfully deployed to Vercel!

**Production URL:** https://shivambhardwaj-ls9wtp4t9-shivams-projects-1d3fe872.vercel.app

**Project:** shivambhardwaj.com
**Project ID:** prj_4wVe8lE4vAKZKWPxAR4uH9SvS7C2

## 🌐 Custom Domain Configuration

The domains `shivambhardwaj.com` and `www.shivambhardwaj.com` have been added to the project.

### Next Steps:

1. **Configure DNS Records** in your domain registrar:
   - Go to your domain registrar (where you purchased shivambhardwaj.com)
   - Add the following DNS records as instructed by Vercel:
     - For apex domain (shivambhardwaj.com): Add A record pointing to Vercel's IP
     - For www subdomain: Add CNAME record pointing to cname.vercel-dns.com

2. **Verify Domain in Vercel Dashboard:**
   - Visit: https://vercel.com/shivams-projects-1d3fe872/shivambhardwaj.com/settings/domains
   - Follow the DNS configuration instructions provided there

3. **DNS Propagation:**
   - DNS changes can take 24-48 hours to propagate globally
   - You can check propagation status using tools like: https://dnschecker.org

## 🔄 Redeploy Commands

To redeploy after making changes:
```bash
cd ~/repos/shivambhardwaj.com
source ~/.config/secrets/tokens.env
vercel --token="$VERCEL_TOKEN" --prod
```

## 📊 Monitoring

- **Deployment Dashboard:** https://vercel.com/shivams-projects-1d3fe872/shivambhardwaj.com
- **Project Settings:** https://vercel.com/shivams-projects-1d3fe872/shivambhardwaj.com/settings

## 🔗 Useful Links

- Current deployment: https://shivambhardwaj-ls9wtp4t9-shivams-projects-1d3fe872.vercel.app
- Inspect deployments: `vercel ls`
- View logs: `vercel inspect <deployment-url> --logs`
