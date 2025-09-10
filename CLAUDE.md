# Antimony Labs Portfolio - Google Cloud Project

## Project Overview
This is the Antimony Labs portfolio website - a Next.js 15 application deployed on Google Cloud Platform (App Engine) showcasing robotics engineering expertise and autonomous systems projects.

**Live URL**: https://shivambhardwaj.com
**GCP Project ID**: anti-mony
**Runtime**: Node.js 20 on Google App Engine
**Instance Class**: F2 (1 CPU, 0.5GB RAM)

## Architecture
- **Platform**: Google App Engine (F2 instances)
- **Auto Scaling**: 0-10 instances (target CPU: 60%, throughput: 60%)
- **Region**: us-central1 (Iowa)
- **Frontend**: Next.js 15.5.2, React 18.3.1, TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.17
- **3D Graphics**: Three.js 0.180.0, React Three Fiber 8.17.10
- **Animations**: Framer Motion 11.0.0
- **Icons**: Lucide React 0.400.0, React Icons 5.5.0
- **Charts**: Recharts 3.1.2
- **Markdown**: React Markdown 10.1.0
- **Logging**: Google Cloud Logging 11.0.0
- **Monitoring**: Google Cloud Monitoring 4.1.0
- **Error Reporting**: Google Cloud Error Reporting 3.0.5

## Key Features
- **Homepage**: Live GitHub contributions graph and activity dashboard
- **Projects**: Interactive robotics and autonomous systems showcase
- **About**: Professional experience timeline with technical achievements
- **Infrastructure**: Detailed GCP architecture and monitoring dashboards
- **AI Agents**: Specialized development agents portfolio
- **Blog**: Technical articles with markdown support and metadata
- **Theme System**: Dynamic theming with presets (Oceanic, Forest, Sunset) and dark/light mode toggle
- **Theme Components**: ThemeProvider, ThemeToggle, ThemePresetSwitcher

## Pages Structure
- `/` - Homepage with GitHub integration
- `/projects` - Portfolio showcase
- `/about` - Professional experience
- `/infrastructure` - Technical infrastructure documentation
- `/agents` - AI development agents
- `/blog` - Technical blog
- `/blog/[slug]` - Individual blog posts

## API Endpoints
- `/api/health` - Health check for GCP monitoring
- `/api/github/contributions` - GitHub contributions data
- `/api/infrastructure-metrics` - Infrastructure monitoring metrics

## Deployment
This project uses Google Cloud Platform deployment exclusively:

```bash
# Build the application
npm run build

# Deploy to Google Cloud (staging)
npm run deploy:staging

# Deploy to Google Cloud (production)
npm run deploy:production

# Alternative deployment scripts
node scripts/deployment/deploy-production.js
node scripts/deployment/auto-deploy.js

# Direct GCP deployment
gcloud app deploy app.yaml --quiet

# Rollback if needed
npm run rollback
node scripts/deployment/rollback.js
```

## Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Clean build artifacts
npm run clean
```

## Testing Suite
```bash
# Unit tests (Vitest)
npm run test
npm run test:watch
npm run test:coverage
npm run test:ui
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:debug

# Specialized tests
npm run test:performance
npm run test:security
npm run test:accessibility

# Run all tests
npm run test:all
npm run test:ci

# Security audit
npm run security:audit
npm run security:scan
```

## Google Cloud Configuration
- **Health Checks**: Readiness at `/api/health` (5s interval), Liveness (30s interval)
- **Static Files**: Served via App Engine handlers (/_next/static, /public)
- **Environment Variables**: NODE_ENV=production, GCP_PROJECT_ID=anti-mony
- **Security**: HTTPS-only, secure headers
- **Resources**: 1 CPU, 0.5GB RAM, 10GB disk
- **Failure Thresholds**: Readiness (2), Liveness (4)

## Infrastructure Management
```bash
# Terraform operations
npm run infrastructure:plan
npm run infrastructure:apply
npm run infrastructure:destroy

# GCP logs
npm run logs:view
npm run logs:tail

# Monitoring
npm run monitoring:dashboard

# GCloud setup
npm run setup:gcloud
```

## Project Structure
```
antimony-labs/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── about/        # About page
│   │   ├── agents/       # AI agents page
│   │   ├── blog/         # Blog pages
│   │   ├── infrastructure/ # Infrastructure page
│   │   └── projects/     # Projects page
│   ├── components/       # React components
│   │   ├── DeploymentDashboard.tsx
│   │   ├── ExperienceTimeline.tsx
│   │   ├── GitHubContributionGraph.tsx
│   │   ├── GitHubCommitChart.tsx
│   │   ├── InfrastructureMetrics.tsx
│   │   ├── Navigation.tsx
│   │   ├── SocialShareButtons.tsx
│   │   ├── StructuredData.tsx
│   │   ├── TechnicalSpecs.tsx
│   │   └── TechStack.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useGitHub.ts
│   │   └── useGitHubContributions.ts
│   ├── lib/             # Utilities and data
│   │   ├── blog-data.ts
│   │   ├── blog-utils.ts
│   │   ├── github-utils.ts
│   │   ├── portfolio/
│   │   ├── tech/
│   │   └── theme/       # Theme system
│   │       ├── index.ts
│   │       ├── presets.ts
│   │       ├── theme-core.tsx
│   │       └── types.ts
│   ├── services/        # Business logic
│   │   └── github.ts
│   └── types/           # TypeScript definitions
│       ├── github.ts
│       └── portfolio.ts
├── scripts/
│   └── deployment/      # Deployment scripts
│       ├── auto-deploy.js
│       ├── deploy-gcp.sh
│       ├── deploy-production.js
│       ├── deploy-staging.js
│       ├── error-handler.js
│       └── rollback.js
├── tests/               # Test files
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── security/
│   └── accessibility/
├── public/              # Static assets
├── app.yaml            # Google App Engine config
├── app-staging.yaml    # Staging environment config
└── package.json        # Project dependencies
```

## Code Standards
- **NO EMOJIS** or non-ASCII characters in codebase
- **2 spaces** indentation (NO TABS)
- **Single quotes** for strings
- **Semicolons** REQUIRED
- **Trailing commas** in multiline structures
- **LF line endings** (except .bat files: CRLF)
- **Underscore prefix** for unused variables (_unused)
- **PascalCase**: Components, Types, Interfaces
- **camelCase**: Functions, Variables
- **UPPER_SNAKE_CASE**: Constants

## Documentation Standards (Obsidian Compatibility)
- **PRIMARY VIEWER**: All markdown documentation is viewed in Obsidian
- **NO NESTED CODE BLOCKS**: Never use triple backticks inside markdown blocks
- **FORMATTING RULES**:
  - Use bullet points and numbered lists instead of code blocks where possible
  - For code examples, use single code blocks without nesting
  - Use **bold** for emphasis instead of inline code for non-code text
  - Structure content with clear headers (##, ###, ####)
  - Use tables for structured data
  - Avoid complex markdown that might not render in Obsidian
- **FILE ORGANIZATION**:
  - Keep related docs in same folder for Obsidian vault organization
  - Use descriptive filenames that work well in Obsidian's graph view
  - Add internal links between related documents using `[[filename]]` format when appropriate

## Important Notes
- **NO VERCEL DEPLOYMENT** - This is a Google Cloud Platform project only
- **THEME SYSTEM** - Advanced theming with multiple presets (Oceanic, Forest, Sunset) and dark/light mode support
- **NO PLACEHOLDERS** - All pages have meaningful, functional content
- **GitHub Integration** - Live repository data fetched server-side
- **Real Infrastructure** - All metrics and documentation are actual/relevant
- **Clean Codebase** - No temporary scripts or unused files
- **Automated Deployment** - Full CI/CD pipeline with auto-rollback

## Testing Requirements
Before any deployment:
1. Run `npm run type-check` - Must pass with zero errors
2. Run `npm run lint` - Must pass with zero warnings
3. Run `npm run build` - Must complete successfully
4. Run `npm run test:all` - All tests must pass

## Performance Targets
- **Lighthouse Score**: >90 for all metrics
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Bundle Size**: Main bundle <200KB gzipped
- **API Response**: <500ms for all endpoints

## Security Measures
- **Dependencies**: Regular audit with `npm audit`
- **Headers**: Strict CSP, X-Frame-Options, X-Content-Type-Options
- **HTTPS**: Enforced for all requests
- **Secrets**: Managed via GCP Secret Manager
- **Authentication**: OAuth 2.0 for GitHub API

## Monitoring & Logging
- **Cloud Logging**: All application logs centralized
- **Error Reporting**: Automatic error tracking and alerts
- **Uptime Monitoring**: Health checks every 5 seconds
- **Performance Monitoring**: Real-time metrics dashboard
- **Custom Metrics**: Business-specific KPIs tracked

## Recent Updates
- Upgraded Three.js to 0.180.0 for better performance
- Implemented GitHub contributions graph with server-side caching
- Added comprehensive testing suite with Vitest and Playwright
- Integrated Google Cloud monitoring and error reporting
- Optimized build process with parallel deployment scripts
- Added infrastructure metrics dashboard
- Implemented proper error handling with automatic rollback
- Added advanced theme system with multiple color presets
- Integrated dark/light mode toggle with persistent preferences

## Contact
- **Email**: curious.antimony@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/shivambdj/
- **GitHub**: https://github.com/Shivam-Bhardwaj
- **Twitter**: https://x.com/LazyShivam

## License
Private repository - All rights reserved