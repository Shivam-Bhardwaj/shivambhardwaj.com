# Antimony Labs Portfolio - Quick Start Guide

## Project Status: ✅ READY FOR DEPLOYMENT

### Health Check Results
- **TypeScript**: ✅ Zero errors
- **ESLint**: ⚠️ Warnings only (unused variables with _ prefix)
- **Build**: ✅ Successfully builds for production
- **Bundle Size**: ✅ 271 KB First Load JS (optimized)

---

## 🚀 Quick Start Commands

### 1. Local Development
Start the development server:
```bash
npm run dev
```
Visit: http://localhost:3000

### 2. Deploy to Production
Deploy to Google Cloud Platform:
```bash
npm run deploy:production
```
Or use the deployment script directly:
```bash
node scripts/deployment/deploy-production.js
```

---

## 📋 Using the AI Agent Workflow

### For Bug Fixes (4-Terminal Setup)

**Terminal 1 - Command Center:**
1. Open bug fix prompt generator:
   - View: `docs/agent-prompts/bug-fix-prompt-generator.md`
2. Create feature branch:
   ```bash
   git checkout -b fix/issue-$(date +%Y%m%d-%H%M%S)
   ```
3. Generate prompts for other terminals

**Terminal 2 - Implementation:**
- Use generated implementation prompt
- Focus on code changes
- Commands: `npm run dev`, `npm run type-check`

**Terminal 3 - Testing:**
- Use testing agent prompt
- Write/run tests
- Commands: `npm run test`, `npm run lint`

**Terminal 4 - Monitoring:**
- Watch builds and logs
- Update documentation
- Commands: `npm run build`, `npm run logs:tail`

### Workflow Steps

1. **Identify Issue**
   - Screenshot or description
   - Generate prompts using templates

2. **Create Branch**
   ```bash
   git checkout -b fix/issue-name-20250108-150000
   ```

3. **Implement Fix** (Parallel in 3 terminals)
   - Terminal 2: Code implementation
   - Terminal 3: Write tests
   - Terminal 4: Update docs

4. **Quality Checks**
   ```bash
   npm run type-check
   npm run lint
   npm run test:all
   npm run build
   ```

5. **Create PR**
   ```bash
   git push -u origin HEAD
   gh pr create --title "Fix: [Issue]" --body "[Description]"
   ```

6. **Wait for Approval**
   - User reviews PR
   - Responds with "APPROVED"

7. **Merge and Deploy**
   ```bash
   gh pr merge --squash
   npm run deploy:production
   ```

8. **Clean Up** (IMPORTANT)
   ```bash
   # Remove temporary files
   find . -name "*tmp*" -type f -delete
   find . -name "*test*" -type f | grep -v tests/ | xargs rm -f
   git clean -fd
   ```

---

## 📚 Documentation Structure

### Core Documentation
- **README.md** - Project overview
- **CLAUDE.md** - AI assistant instructions
- **CHANGELOG.md** - Version history
- **QUICK_START.md** - This file

### Development Guides
- **docs/development/STYLEGUIDE.md** - Design system
- **docs/project-management/TODO.md** - Task tracking
- **docs/audits/AUDIT_REPORT.md** - Audit framework

### AI Agent Templates
- **docs/agent-prompts/specialized-agents.md** - 8 specialized agents
- **docs/agent-prompts/bug-fix-prompt-generator.md** - Bug fix workflow
- **docs/agent-prompts/4-terminal-workflow.md** - Multi-terminal setup

---

## 🔧 Common Tasks

### Run Tests
```bash
npm run test:all          # All tests
npm run test:coverage      # With coverage
npm run test:e2e          # End-to-end
```

### Code Quality
```bash
npm run type-check        # TypeScript checking
npm run lint              # ESLint
npm run lint:fix          # Auto-fix issues
```

### Deployment
```bash
npm run deploy:staging    # Deploy to staging
npm run deploy:production # Deploy to production
npm run rollback          # Rollback if needed
```

### Monitoring
```bash
npm run logs:tail         # View live logs
gcloud app browse         # Open deployed site
```

---

## 🎨 Theme System

The project includes 3 theme presets:
- **Oceanic** - Deep navy with teal
- **Forest** - Earthy greens
- **Sunset** - Warm orange to purple

Each supports dark/light mode with persistent preferences.

---

## 🌐 Live URLs

- **Production**: https://shivambhardwaj.com
- **GCP Direct**: https://anti-mony.uc.r.appspot.com

---

## ⚠️ Important Notes

1. **Obsidian Compatibility**: All markdown docs are formatted for Obsidian
2. **No Emojis in Code**: Keep codebase ASCII-only
3. **Clean After Deploy**: Always remove temporary files
4. **Use Feature Branches**: Never commit directly to main
5. **Wait for Approval**: Always get user approval before merging PRs

---

## 🆘 Troubleshooting

### Build Errors
```bash
npm run clean
npm install
npm run build
```

### Git Issues
```bash
git status
git stash
git checkout main
git pull origin main
```

### Deployment Issues
```bash
npm run rollback
npm run logs:tail
```

---

## 📞 Support

For issues or questions:
- Check: `docs/agent-prompts/` for workflow guides
- Review: `CLAUDE.md` for project context
- GitHub Issues: Report bugs or request features

---

**Last Updated**: 2025-01-08  
**Version**: 1.0.0  
**Status**: Production Ready