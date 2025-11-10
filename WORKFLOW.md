# Development Workflow

This document describes the standard workflow for contributing to the shivambhardwaj.com portfolio project.

## Overview

The workflow follows this pattern:
1. **Issue Creation** → You create issue on GitHub and paste link here
2. **Issue Resolution** → Code changes implemented
3. **Pull Request** → Code review & Vercel preview deployment
4. **Review & Approval** → Changes requested or production deployment

## Step-by-Step Process

### 1. Issue Creation → Paste Link Here

When you have a problem, feature request, or bug to address:

1. **Create Issue on GitHub**
   - Go to https://github.com/Shivam-Bhardwaj/shivambhardwaj.com/issues
   - Click "New Issue"
   - Select the appropriate template (Bug Report, Feature Request, etc.)
   - Fill in the details and submit

2. **Paste Issue Link Here**
   - Copy the GitHub issue URL
   - Paste it in the chat
   - I'll read the issue and start working on it

### 2. Issue Resolution

Once you paste the issue link:
- I'll analyze the problem
- Implement the solution
- Create a feature branch: `feature/issue-{number}-{description}` or `fix/issue-{number}-{description}`
- Commit changes with descriptive messages
- Push the branch to GitHub

### 3. Pull Request Creation

After implementing the solution:
- I'll create a PR targeting the `main` branch
- Fill in the PR template with:
  - Description of changes
  - Link to related issue
  - Screenshots/videos (if applicable)
  - Testing checklist
- **Vercel automatically deploys a preview** for every PR
- Preview URL will be available in the PR comments

### 4. Review & Approval

**Review Process:**
- You'll receive a notification about the PR
- Review the Vercel preview deployment
- Check the code changes in the "Files changed" tab
- Review passes CI checks (linting, type-check, tests, build)

**Options:**
- ✅ **Approve & Merge**: If everything looks good, approve and merge
- 🔄 **Request Changes**: Comment on specific changes needed
- 🚀 **Deploy to Production**: After merging, Vercel automatically deploys to production

## Branch Naming Convention

- `feature/issue-{number}-{description}` - New features
- `fix/issue-{number}-{description}` - Bug fixes
- `docs/issue-{number}-{description}` - Documentation updates
- `refactor/issue-{number}-{description}` - Code refactoring

## Commit Message Format

```
[type] Issue #123: Brief description

More detailed explanation if needed.
- Change 1
- Change 2
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Vercel Integration

### Automatic Deployments
- **Preview Deployments**: Every PR gets a preview URL
- **Production Deployments**: Automatic on merge to `main`

### Preview URLs
- Format: `https://shivambhardwaj.com-git-{branch-name}-{vercel-account}.vercel.app`
- Available in PR comments and Vercel dashboard

### Manual Deployment
If needed, you can deploy manually:
```bash
cd ~/repos/shivambhardwaj.com
source ~/.config/secrets/tokens.env
vercel --token="$VERCEL_TOKEN" --prod
```

## CI/CD Pipeline

Every PR automatically runs:
1. **Linting** - ESLint checks
2. **Type Checking** - TypeScript validation
3. **Unit Tests** - Jest test suite
4. **Build Check** - Ensures the project builds successfully

All checks must pass before merging.

## Example Workflow

```
1. You: Create Issue #45 on GitHub - "Contact form isn't working on mobile"
   ↓
2. You: Paste issue link here → https://github.com/Shivam-Bhardwaj/shivambhardwaj.com/issues/45
   ↓
3. I: Read the issue and implement fix for form validation on mobile
   ↓
4. I: Create PR #46 - Fix contact form mobile issue
   ↓
5. Vercel: Deploys preview → https://shivambhardwaj.com-git-fix-45-contact-form-...
   ↓
6. You: Review preview and PR
   ↓
7. You: "Looks good, merge it"
   ↓
8. I: Merge PR → Vercel auto-deploys to production
```

## Quick Commands

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Run type check
npm run type-check

# Run tests
npm run test

# Build for production
npm run build

# Create a new branch
git checkout -b feature/issue-123-description
```

## Labels

Issues are automatically labeled:
- `bug` - Bug reports
- `enhancement` - Feature requests
- `documentation` - Documentation updates
- `help wanted` - Community help needed
- `good first issue` - Good for new contributors

## Questions?

- Check existing issues: https://github.com/Shivam-Bhardwaj/shivambhardwaj.com/issues
- Read CONTRIBUTING.md for detailed guidelines
- Email: contact@shivambhardwaj.com

---

**Ready to start?** Create an issue on GitHub and paste the link here! 🚀

