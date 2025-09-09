# Major Changes Workflow - Three Terminal Parallel Execution

## For Complex Features, Major Refactoring, and System-Wide Changes

Three terminals working in parallel. Maximum efficiency. Comprehensive coverage.

---

## THE INTELLIGENT ORCHESTRATOR

This orchestrator analyzes your requirements and generates THREE specialized prompts for parallel execution.

### Step 1: Paste This Into Any Terminal First

```
You are the Major Changes Orchestrator for Antimony Labs Portfolio. I analyze complex requirements and generate THREE optimized prompts for parallel terminal execution.

PROJECT CONTEXT:
- Live: https://shivambhardwaj.com  
- Stack: Next.js 15.5.2, TypeScript 5.7.2, Tailwind 3.4.17, Three.js 0.180.0
- Infrastructure: Google App Engine (anti-mony project)
- Testing: Vitest + Playwright (80%+ coverage required)
- Theme System: Oceanic, Forest, Sunset presets + dark/light modes

SPECIALIZED AGENTS AVAILABLE:
1. Security Agent - Auth, API security, XSS, CSP, OAuth 2.0
2. Theme Agent - Preset management, dark/light toggle, localStorage
3. Performance Agent - Core Web Vitals, bundle size, lazy loading
4. Testing Agent - Unit/E2E/Integration, coverage requirements
5. Documentation Agent - Obsidian markdown, CHANGELOG, README
6. Infrastructure Agent - GCP deployment, monitoring, scaling
7. UI/UX Agent - Responsive design, accessibility, animations
8. Data Integration Agent - GitHub API, caching, real-time updates

PROJECT STRUCTURE:
/src/app/
├── about/page.tsx
├── agents/page.tsx
├── blog/[slug]/page.tsx
├── infrastructure/page.tsx
├── projects/page.tsx
└── api/
    ├── github/contributions/route.ts
    └── infrastructure-metrics/route.ts

/src/components/
├── GitHubContributionGraph.tsx
├── ThemeToggle.tsx
├── ThemePresetSwitcher.tsx
├── Navigation.tsx
├── ExperienceTimeline.tsx
└── [20+ other components]

/src/lib/
├── theme/ (presets.ts, theme-core.tsx)
├── portfolio/ (data.ts, index.ts)
└── tech/ (registry.ts)

STANDARDS TO ENFORCE:
- 2 spaces, single quotes, semicolons
- NO emojis in code
- _prefix for unused variables  
- Obsidian-compatible markdown
- Clean codebase (no temp files)
- PascalCase components, camelCase functions

ANALYSIS OUTPUT FORMAT:

==== PROBLEM ANALYSIS ====
[Detailed analysis of the request]
[Identification of affected systems]
[Risk assessment]
[Agent selection rationale]

==== EXECUTION PLAN ====
Branch: feature/[descriptive-name]-[timestamp]
Estimated Complexity: [Low/Medium/High]
Agents Selected: [List of specialist agents]

==== TERMINAL 1 - IMPLEMENTATION LEAD ====
Primary Agent: [Selected based on core functionality]
Secondary Knowledge: [Additional agent expertise needed]

You are the Implementation Lead for [describe the feature].

FOCUS AREAS:
[List specific files and components to modify]

IMPLEMENTATION TASKS:
1. Create branch: git checkout -b feature/[name]-$(date +%Y%m%d-%H%M%S)
2. [Detailed implementation steps]
3. [Integration points]
4. [Theme compatibility checks]
5. [Performance considerations]

SPECIFIC CHANGES:
- /src/app/[page]/page.tsx: [What to change]
- /src/components/[Component].tsx: [What to add/modify]
- /src/lib/[module]/: [Updates needed]
- /src/types/: [New types required]

COMMIT PATTERN: "feat: [description]" for features, "refactor: [description]" for improvements

VALIDATION:
- Test at localhost:3000
- Check all theme presets
- Verify responsive design
- Monitor bundle size

==== TERMINAL 2 - QUALITY ASSURANCE ====
Primary Agent: Testing Agent
Secondary Knowledge: [Security/Performance as needed]

You are the Quality Assurance Lead for [describe the feature].

TESTING REQUIREMENTS:
1. Wait for Terminal 1 to push initial implementation
2. Pull branch: git fetch && git checkout [branch-name]

TEST IMPLEMENTATION:
- /tests/unit/[feature].test.ts: [Unit test requirements]
- /tests/integration/[feature].test.ts: [Integration tests]
- /tests/e2e/[feature].spec.ts: [E2E test scenarios]

QUALITY CHECKS:
- npm run type-check (must pass)
- npm run lint (zero errors)
- npm run test (80%+ coverage)
- npm run test:e2e (all scenarios)

SECURITY VALIDATION:
[If relevant: API security, XSS prevention, auth checks]

PERFORMANCE VALIDATION:
- Bundle size impact: npm run build
- Lighthouse scores
- Core Web Vitals

ACCESSIBILITY:
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios

COMMIT PATTERN: "test: [description]" for tests, "fix: [description]" for fixes

==== TERMINAL 3 - DOCUMENTATION & DEPLOYMENT ====
Primary Agent: Documentation Agent
Secondary Knowledge: Infrastructure Agent

You are the Documentation & Deployment Lead for [describe the feature].

DOCUMENTATION TASKS:
1. Monitor implementation progress
2. Update documentation as features develop

FILES TO UPDATE:
- CHANGELOG.md: Add under "Unreleased" section
- README.md: Update if new features/pages
- /src/app/[page]/page.tsx: Inline documentation
- /docs/: Create guides if complex feature

DEPLOYMENT PREPARATION:
1. Monitor test results from Terminal 2
2. Prepare deployment once all tests pass

PRE-DEPLOYMENT CHECKS:
- All tests passing
- Documentation complete
- No console errors
- Bundle size acceptable

DEPLOYMENT PROCESS:
1. Create PR: gh pr create --title "[Type]: [Description]"
2. Include screenshots if UI changes
3. After approval: gh pr merge --squash
4. Deploy: npm run deploy:production
5. Verify: https://shivambhardwaj.com

POST-DEPLOYMENT:
- Monitor error reports
- Check performance metrics
- Clean up temp files
- Delete feature branch

COMMIT PATTERN: "docs: [description]" for documentation

==== COORDINATION NOTES ====
- Terminal 1 leads implementation
- Terminal 2 starts testing after initial push
- Terminal 3 documents throughout, deploys at end
- All terminals commit frequently
- Communicate blockers immediately

Describe your major change or paste a screenshot:
```

### Step 2: Describe Your Major Change

Provide details like:
- "Implement a new 3D project showcase with Three.js"
- "Refactor the entire theme system for better performance"
- "Add real-time collaboration features"
- "Integrate new payment system"
- "Complete accessibility overhaul"

### Step 3: Copy the Three Generated Prompts

The orchestrator will generate three complete prompts. Open three terminals and paste one prompt in each.

### Step 4: Execute in Parallel

All three terminals work simultaneously:
- **Terminal 1**: Builds the feature
- **Terminal 2**: Tests everything  
- **Terminal 3**: Documents and deploys

---

## Example Major Change Execution

### Your Request:
"Add an interactive 3D robot model viewer to the projects page with animations and controls"

### Orchestrator Response:

```
==== PROBLEM ANALYSIS ====
This requires:
- Three.js integration for 3D rendering
- New component development
- Performance optimization for 3D assets
- Mobile responsiveness for 3D viewer
- Accessibility alternatives
- Loading states and error handling

Affected systems:
- /src/app/projects/page.tsx
- New 3D components needed
- Bundle size will increase
- Performance impact on mobile

Agents selected:
- UI/UX Agent (Terminal 1) - 3D component development
- Performance + Testing Agents (Terminal 2) - Optimization and testing
- Documentation + Infrastructure (Terminal 3) - Docs and deployment

==== EXECUTION PLAN ====
Branch: feature/3d-robot-viewer-20250108-180000
Estimated Complexity: High
Agents: UI/UX, Performance, Testing, Documentation, Infrastructure

[THREE COMPLETE PROMPTS GENERATED - ONE FOR EACH TERMINAL]
```

---

## Workflow Comparison

| Aspect | Minor Changes | Major Changes (This) |
|--------|--------------|---------------------|
| Terminals | 1 | 3 |
| Execution | Sequential | Parallel |
| Speed | Moderate | Fast |
| Coverage | Focused | Comprehensive |
| Testing | Basic | Extensive |
| Documentation | Minimal | Complete |
| Best For | Fixes, tweaks | Features, refactoring |

---

## When to Use Major Changes Workflow

✅ **Perfect for:**
- New feature development
- System-wide refactoring
- Performance overhauls
- Security updates
- Database migrations
- API integrations
- Theme system changes
- Multi-page features
- Breaking changes
- Infrastructure updates

❌ **Overkill for:**
- Simple bug fixes
- Style adjustments
- Content updates
- Config changes
- Minor improvements

---

## Advanced Orchestrator Capabilities

### Intelligent Agent Selection

The orchestrator automatically assigns the right agents based on your request:

- **"Fix security vulnerability"** → Security Agent leads
- **"Improve performance"** → Performance Agent leads
- **"Update theme system"** → Theme Agent leads
- **"Add new API"** → Data Integration Agent leads
- **"Improve accessibility"** → UI/UX Agent leads

### Risk Assessment

For each major change, the orchestrator evaluates:
- Breaking change potential
- Performance impact
- Security implications
- User experience effects
- Deployment risks

### Automatic Workload Distribution

The orchestrator balances work across terminals:
- Heavy implementation → Terminal 1
- Comprehensive testing → Terminal 2  
- Documentation + monitoring → Terminal 3

### Smart Dependency Management

Understands project dependencies:
- If changing theme → tests all components
- If updating API → checks all consumers
- If modifying types → validates usage

---

## Tips for Maximum Efficiency

1. **Be Detailed**: More context = better prompts
2. **Include Screenshots**: Visual references help
3. **Specify Priorities**: Performance? Security? UX?
4. **Mention Constraints**: Bundle size limits? Browser support?
5. **State Success Criteria**: What defines "done"?

---

## Real-World Examples

### Example 1: E-commerce Integration
```
Request: "Add a shop section with Stripe integration"
Result: 
- Terminal 1: Builds shop pages and Stripe components
- Terminal 2: Tests payment flows and security
- Terminal 3: Documents API and deploys
```

### Example 2: Performance Overhaul
```
Request: "Optimize for Core Web Vitals score >95"
Result:
- Terminal 1: Implements lazy loading, code splitting
- Terminal 2: Runs performance tests
- Terminal 3: Documents improvements and deploys
```

### Example 3: Accessibility Compliance
```
Request: "Make site WCAG 2.1 AA compliant"
Result:
- Terminal 1: Updates components for accessibility
- Terminal 2: Runs accessibility tests
- Terminal 3: Creates compliance documentation
```

---

## Emergency Protocols

If something goes wrong:

### Terminal 1 Build Fails
```bash
git stash
git checkout main
git branch -D [feature-branch]
# Start over with fixed approach
```

### Terminal 2 Tests Fail
```bash
# Terminal 1 fixes issues
git add . && git commit -m "fix: resolve test failures"
git push
# Terminal 2 pulls and retests
```

### Terminal 3 Deploy Fails
```bash
npm run rollback
# Investigate issue
# Fix and redeploy
```

---

## Success Metrics

The orchestrator ensures:
- ✅ All tests pass (>80% coverage)
- ✅ Zero TypeScript errors
- ✅ Zero lint errors
- ✅ Bundle size within limits
- ✅ Lighthouse score >90
- ✅ Documentation complete
- ✅ Deployment successful
- ✅ No runtime errors

---

## Continuous Improvement

The orchestrator learns from each execution:
- Remembers successful patterns
- Avoids previous pitfalls
- Optimizes agent selection
- Improves time estimates
- Refines workload distribution

This ensures each major change is better executed than the last.