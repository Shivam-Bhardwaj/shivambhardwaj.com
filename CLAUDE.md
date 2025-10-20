# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Create production build with static export (outputs to /out)
- `npm run start` - Start production server
- `npm run clean` - Remove .next and out directories

### Code Quality
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run type-check` - TypeScript type checking without emit

### Testing
- `npm run test` - Run unit tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report (threshold: 70%)
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Open Playwright UI for debugging
- `npm run test:a11y` - Run accessibility tests
- `npm run test:security` - Run security audit and tests
- `npm run test:performance` - Run performance tests
- `npm run test:all` - Run all test suites
- `npm run test:ci` - CI pipeline test suite

### Security
- `npm run security:audit` - Run npm audit for high severity issues
- `npm run security:scan` - Run custom security scanning script

## Architecture

### Tech Stack
- **Next.js 15.4.5** with App Router - Static export
- **React 18.3.1** with TypeScript 5 (strict mode)
- **Tailwind CSS v4** with PostCSS processing
- **Framer Motion 12.23.12** for animations
- **Testing**: Jest (unit/integration), Playwright (E2E), jest-axe (a11y)

### Project Structure
```
shivambhardwaj.com/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout with RoombaSimulation background
│   │   └── globals.css   # Global styles and Tailwind directives
│   ├── components/       # Reusable React components
│   │   └── ui/          # Base UI components (Button, Card, etc.)
│   ├── data/            # Centralized data (site.ts, experience.ts, projects.ts)
│   └── lib/             # Utility functions and robotics algorithms
│       └── robotics/    # SLAM, pathfinding, sensor fusion algorithms
├── tests/               # Comprehensive test suite
│   ├── unit/           # Component and function tests
│   ├── integration/    # User flow tests
│   ├── e2e/           # Playwright end-to-end tests
│   ├── accessibility/  # WCAG compliance tests
│   ├── performance/   # Lighthouse and Core Web Vitals
│   └── security/      # Security vulnerability tests
└── public/             # Static assets and logos
```

### Key Patterns
- **Path aliases**: Use `@/` for imports from src directory
- **Data centralization**: All site config in `src/data/site.ts`
- **Component composition**: RootLayout wraps all pages with shared UI
- **Static export**: No server-side features, pure static HTML/CSS/JS
- **Testing coverage**: Minimum 70% coverage threshold enforced

### Deployment - Load Balanced Multi-Server

**Production Architecture**:
```
Cloudflare Global CDN
        ↓
  Tunnel: xps2018-multi
   (8 connections)
    /            \
xps2018         RPi
(Primary)    (Backup)
Port 80      Port 80
```

**Deployment Servers**:
- **xps2018** (10.0.0.109) - Primary, 32GB RAM, x86_64, Ubuntu 24.04
- **RPi/sbl1** (10.0.0.174) - Backup, 7.7GB RAM, ARM64, Armbian
- **Load Balancing**: Cloudflare Tunnel automatically distributes traffic
- **Failover**: < 1 second if either server goes down
- **Repository**: https://github.com/Shivam-Bhardwaj/shivambhardwaj.com

**Deployment Process (on xps2018)**:
```bash
cd ~/shivambhardwaj.com
git pull
npm install
npm run build
rsync -av --delete ./out/ /var/www/shivambhardwaj.com/
```

**Sync to RPi** (for redundancy):
```bash
# Option 1: Git pull on RPi
ssh curious@10.0.0.174
cd ~/shivambhardwaj.com && git pull && npm run build
rsync -av --delete ./out/ /var/www/shivambhardwaj.com/

# Option 2: Direct sync from xps2018
sshpass -p 'iou' rsync -av /var/www/shivambhardwaj.com/ curious@10.0.0.174:/var/www/shivambhardwaj.com/
```

### AI-First Repository

**Philosophy**: This codebase is designed for AI agents to maintain, not humans.

- **Code Documentation**: For AI context and understanding
- **User Documentation**: Lives on the deployed website, not in repo
- **Deployment**: Fully automated via scripts
- **Maintenance**: AI agents handle updates
- **Orchestration**: Human provides direction, AI executes

**Credentials**: Never commit credentials
- API keys, tokens, passwords go in `~/SbL/.secrets/` on servers
- .gitignore blocks .secrets/, *.env files
- See `~/SbL/PRODUCTION_STATUS.md` on xps2018 for deployment details

### Critical Notes
- Static export only (no SSR, no API routes in production)
- Build creates `/out` directory with all static files
- Both servers must be kept in sync for failover to work
- Cloudflare Tunnel handles SSL/TLS, no certificates needed locally
- See ~/SbL/ directory on xps2018 for deployment documentation
