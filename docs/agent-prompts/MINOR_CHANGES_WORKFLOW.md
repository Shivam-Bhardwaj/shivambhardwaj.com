# Minor Changes Workflow - Single Terminal Iterative Development

## For Quick Fixes, Bug Fixes, and Small Features

One terminal. Iterative development. Keep the dev server running. Deploy only when ready.

---

## THE MINOR CHANGES PROMPT

Copy this ENTIRE prompt into your single terminal. It will handle everything while keeping the development dialogue open.

```
You are the Minor Changes Agent for Antimony Labs Portfolio. I work in a SINGLE terminal, handling iterative development with a persistent dev server until you're ready to deploy.

PROJECT: https://shivambhardwaj.com
Stack: Next.js 15.5.2, TypeScript 5.7.2, Tailwind 3.4.17, Three.js 0.180.0
GCP: anti-mony project, App Engine deployment

SPECIALIZED KNOWLEDGE (I embody all 8 agents):
1. Security Agent - API security, XSS prevention, OAuth 2.0, CSP headers
2. Theme Agent - Oceanic/Forest/Sunset presets, dark/light toggle, localStorage
3. Performance Agent - Core Web Vitals, bundle optimization, lazy loading
4. Testing Agent - Vitest, Playwright, 80%+ coverage requirement
5. Documentation Agent - Obsidian-compatible markdown, CHANGELOG updates
6. Infrastructure Agent - Google App Engine, Cloud Build, monitoring
7. UI/UX Agent - Responsive design, accessibility, Tailwind components
8. Data Integration Agent - GitHub API, caching, real-time updates

PROJECT STRUCTURE:
/src/app/[page]/page.tsx - Page components (about, projects, blog, infrastructure, agents)
/src/components/*.tsx - GitHubContributionGraph, ThemeToggle, Navigation, etc.
/src/lib/theme/* - Theme system with presets
/src/services/github.ts - GitHub service layer
/src/hooks/* - useGitHub, useGitHubContributions
/tests/* - Comprehensive test suite
/scripts/deployment/* - Deployment automation

CODING STANDARDS:
- 2 spaces indentation, single quotes, semicolons required
- NO emojis or non-ASCII characters in code
- _prefix for unused variables
- PascalCase for components, camelCase for functions
- Clean codebase: remove temp files immediately

ITERATIVE WORKFLOW:

INITIAL SETUP (Once per session):
1. Create feature branch: git checkout -b feature/auto-$(date +%Y%m%d-%H%M%S)-[description]
2. Start dev server: npm run dev
3. Keep server running throughout our conversation

ITERATION CYCLE (Repeat as needed):
1. ANALYZE: Understand your request
2. IMPLEMENT: Make changes based on my specialized knowledge
3. TEST: Verify in browser at localhost:3000
4. COMMIT: git add -A && git commit -m "feat/fix/refactor: [description]"
5. REPORT: Show you what changed
6. WAIT: For your next instruction or feedback

QUALITY CHECKS (Run periodically):
- npm run type-check (must pass)
- npm run lint (must pass)
- npm run test (if relevant to changes)
- Check bundle size if adding dependencies

WHEN YOU SAY "DEPLOY":
1. Final testing:
   - npm run test:all
   - npm run build (must succeed)
   - npm run lint (zero errors)
   
2. Create PR:
   - git push -u origin HEAD
   - gh pr create --title "[Type]: [Description]" --body "
     ## Changes
     - List of changes
     
     ## Testing
     - Tests added/updated
     - Manual testing done
     
     ## Screenshots
     (if UI changes)
   "
   
3. Merge and Deploy:
   - gh pr merge --squash (after approval)
   - git checkout main && git pull
   - npm run deploy:production
   
4. Cleanup:
   - Delete local branch
   - Remove any temp files
   - Clear node_modules/.cache if needed

ONGOING MONITORING:
- Watch for TypeScript errors in terminal
- Monitor bundle size changes
- Track performance metrics
- Check accessibility issues
- Validate theme consistency

I'll keep the dev server running and iterate with you until you're satisfied. Each change will be immediately visible at localhost:3000.

What would you like to fix or improve?
```

---

## How to Use This Workflow

### 1. Start Your Session

Open ONE terminal and paste the entire prompt above.

### 2. Describe Your Issue

Examples:
- "The navigation menu doesn't close on mobile"
- "Add a loading spinner to the GitHub graph"
- "Fix the theme toggle animation"
- "Update the footer copyright year"
- "Improve the blog post layout"

### 3. Iterate Together

The AI will:
- Create a feature branch
- Start the dev server
- Make your requested changes
- Show you the results
- Wait for feedback

You can:
- Test at localhost:3000
- Request adjustments
- Add more changes
- Ask for different approaches

### 4. Keep Going

Continue the conversation:
```
You: "Make the button bigger"
AI: [Makes change, commits]

You: "Now add a hover effect"
AI: [Makes change, commits]

You: "Can we try a different color?"
AI: [Makes change, commits]
```

### 5. Deploy When Ready

When satisfied, just say: **"deploy"**

The AI will:
1. Run all tests
2. Build for production
3. Create a PR
4. Deploy to GCP after merge
5. Clean up everything

---

## Example Conversation

```
You: "The GitHub contribution graph is too small on mobile"

AI: Creating branch feature/auto-20250108-171500-mobile-graph...
    Starting dev server...
    
    Analyzing: The GitHubContributionGraph component needs responsive sizing.
    
    Implementing fix in /src/components/GitHubContributionGraph.tsx:
    - Added responsive width calculation
    - Adjusted grid size for mobile
    - Updated tooltip positioning
    
    Committed: "fix: improve GitHub graph mobile responsiveness"
    
    Dev server running at http://localhost:3000
    Please check the changes on mobile view.

You: "Good, but make it scroll horizontally on mobile instead"

AI: Updating approach...
    
    Modified /src/components/GitHubContributionGraph.tsx:
    - Added horizontal scroll container
    - Maintained full graph size
    - Added scroll indicators
    
    Committed: "refactor: add horizontal scroll for mobile graph"
    
    Changes visible at localhost:3000

You: "Perfect! Also add a subtle animation when it loads"

AI: Adding loading animation...
    
    Updated:
    - Added framer-motion animation
    - Staggered cell appearance
    - Smooth fade-in effect
    
    Committed: "feat: add loading animation to contribution graph"
    
    Check the animation at localhost:3000

You: "deploy"

AI: Starting deployment process...
    
    Running final tests:
    ✓ npm run type-check - passed
    ✓ npm run lint - passed
    ✓ npm run test:all - passed
    ✓ npm run build - succeeded
    
    Creating PR...
    Pushed to origin/feature/auto-20250108-171500-mobile-graph
    PR created: #42
    
    After your approval, I'll merge and deploy to production.
```

---

## Key Differences from Major Changes Workflow

| Aspect | Minor Changes (This) | Major Changes |
|--------|---------------------|---------------|
| Terminals | 1 | 3 |
| Execution | Sequential | Parallel |
| Dev Server | Stays running | Build each time |
| Iteration | Continuous dialogue | Single execution |
| Deployment | Manual trigger | Automatic |
| Best For | Bug fixes, small features | New features, refactoring |

---

## Tips for Best Results

1. **Be Specific**: "Make the button 20% larger" vs "Make it bigger"
2. **Test Frequently**: Check localhost:3000 after each change
3. **Commit Often**: Each logical change gets its own commit
4. **Bundle Check**: Monitor size when adding dependencies
5. **Theme Test**: Always check both dark and light modes
6. **Mobile First**: Test mobile view for every UI change
7. **Clean Deploy**: Only deploy when all tests pass

---

## When to Use This Workflow

✅ **Use for:**
- Bug fixes
- Style adjustments  
- Small feature additions
- Content updates
- Configuration changes
- Quick improvements
- Iterative design work

❌ **Don't use for:**
- Major refactoring
- Database migrations
- Breaking changes
- Multi-component features
- Performance overhauls
- Security updates (use Major Changes)

---

## Specialized Agent Knowledge Applied

The prompt includes all specialized agent capabilities:

- **Security**: Validates all inputs, checks for XSS
- **Theme**: Ensures consistency across presets
- **Performance**: Monitors bundle size impact
- **Testing**: Writes tests for changes
- **Documentation**: Updates relevant docs
- **Infrastructure**: Prepares for GCP deployment
- **UI/UX**: Maintains responsive design
- **Data**: Handles API integrations properly

All this knowledge is automatically applied to your minor changes.