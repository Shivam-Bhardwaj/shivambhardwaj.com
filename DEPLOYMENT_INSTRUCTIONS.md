# Deployment Instructions

## Changes Committed ✅

All changes have been committed to the local repository:
- Commit: `8814c31` - "feat: Transform into fullstack website with Blog, Experiments, Learning Hub, and Work Arena"

## Files Changed

### New Sections Added:
- `/src/app/blog/page.tsx` - Blog listing page
- `/src/app/experiments/page.tsx` - Experiments listing page  
- `/src/app/learning/page.tsx` - Learning Hub page
- `/src/app/work/page.tsx` - Work Arena dashboard

### Updated:
- `/src/components/Navbar.tsx` - Added new navigation items

### New Libraries:
- `/src/lib/github.ts` - GitHub API integration
- `/src/lib/docker.ts` - Docker metrics integration
- `/src/lib/metrics.ts` - Aggregated metrics

## To Deploy

You need to push the changes to GitHub. Since authentication isn't configured, you can:

### Option 1: Use GitHub CLI (if authenticated)
```bash
cd /root/repos/shivambhardwaj.com
gh repo sync
git push origin main
```

### Option 2: Configure SSH
```bash
# Generate SSH key if needed
ssh-keygen -t ed25519 -C "contact@shivambhardwaj.com"

# Add to GitHub and test
ssh -T git@github.com

# Push
cd /root/repos/shivambhardwaj.com
git push origin main
```

### Option 3: Use Personal Access Token
```bash
cd /root/repos/shivambhardwaj.com
git push https://YOUR_TOKEN@github.com/Shivam-Bhardwaj/shivambhardwaj.com.git main
```

### Option 4: Push from Your Local Machine
```bash
# On your local machine
cd /path/to/shivambhardwaj.com
git pull origin main  # Get the changes
git push origin main  # Push to deploy
```

## After Push

Once pushed, Vercel will automatically:
1. Detect the push to main branch
2. Build the Next.js application
3. Deploy the new version
4. Make it live at https://shivambhardwaj.com

The new sections will be available:
- https://shivambhardwaj.com/blog
- https://shivambhardwaj.com/experiments
- https://shivambhardwaj.com/learning
- https://shivambhardwaj.com/work

