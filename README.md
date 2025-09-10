# Antimony Labs - Robotics Engineering Portfolio

Advanced robotics engineering portfolio featuring interactive 3D demonstrations, component-based architecture, and real-time performance monitoring. Built with Next.js 15 and deployable on Vercel.

**Live URL**: https://shivambhardwaj.com  

## 🚀 Key Features

### 🤖 Interactive Robotics Showcase
- **3D Robot Models**: Interactive manipulators, mobile platforms, and specialized systems
- **Physics Simulation**: Real-time collision detection and dynamics
- **Multi-Robot Coordination**: Collaborative task demonstrations
- **Performance Optimization**: Adaptive quality settings and LOD system

### 🏗️ Advanced Architecture
- **Component Registry**: Centralized component management with hot swapping
- **Feature Flag System**: Runtime feature control with A/B testing
- **Performance Monitoring**: Real-time FPS tracking and optimization
- **Micro-frontend Ready**: Scalable architecture for complex applications

### 🎨 Design System
- **Advanced Theming**: Multiple preset themes (Oceanic, Forest, Sunset)
- **Responsive Design**: Optimized for all device types
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation
- **Animation System**: Physics-based motion design

### 📊 GitHub Integration
- **Live Contribution Graph**: Real-time GitHub activity visualization
- **Repository Dashboard**: Project showcase with technical specifications
- **Code Statistics**: Programming language usage and contribution patterns

## 🛠 Tech Stack

### Core Technologies
- **Frontend**: Next.js 15.5.2, React 18.3.1, TypeScript 5.7.2
- **3D Graphics**: Three.js 0.180.0, React Three Fiber 8.17.10
- **Animations**: Framer Motion 11.0.0, GSAP (for complex 3D animations)
- **Physics**: Cannon.js for realistic collision detection
- **Styling**: Tailwind CSS 3.4.17 with custom design tokens

### Development Tools
- **Component Development**: Storybook 9.1.5 with interactive demos
- **Testing**: Vitest, Playwright, React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Documentation**: Comprehensive docs with Obsidian compatibility

## 🏃‍♂️ Quick Start

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

## 📁 Project Structure

```
antimony-labs/
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── about/              # About page
│   │   ├── agents/             # AI agents portfolio page
│   │   ├── blog/               # Blog pages
│   │   │   └── [slug]/         # Dynamic blog routes
│   │   ├── infrastructure/     # Infrastructure documentation page
│   │   ├── projects/           # Projects showcase page
│   │   ├── api/                # API routes
│   │   │   ├── github/         # GitHub integration endpoints
│   │   │   │   └── contributions/
│   │   │   ├── health/         # Health check endpoint
│   │   │   └── infrastructure-metrics/
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout with theme provider
│   │   └── page.tsx            # Homepage with GitHub dashboard
│   ├── components/             # Reusable components
│   │   ├── DeploymentDashboard.tsx
│   │   ├── ExperienceTimeline.tsx
│   │   ├── Footer.tsx
│   │   ├── GitHubCommitChart.tsx
│   │   ├── GitHubContributionGraph.tsx
│   │   ├── InfrastructureMetrics.tsx
│   │   ├── Navigation.tsx
│   │   ├── SocialShareButtons.tsx
│   │   ├── StructuredData.tsx
│   │   ├── TechnicalSpecs.tsx
│   │   ├── TechStack.tsx
│   │   ├── ThemePresetSwitcher.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useGitHub.ts
│   │   └── useGitHubContributions.ts
│   ├── lib/                    # Utility libraries
│   │   ├── blog-data.ts        # Blog data management
│   │   ├── blog-utils.ts       # Blog utilities
│   │   ├── github-utils.ts     # GitHub API utilities
│   │   ├── portfolio/          # Portfolio data
│   │   │   ├── data.ts
│   │   │   └── index.ts
│   │   ├── tech/               # Tech stack registry
│   │   │   └── registry.ts
│   │   └── theme/              # Theme system
│   │       ├── index.ts
│   │       ├── index.tsx
│   │       ├── presets.ts      # Theme presets (Oceanic, Forest, Sunset)
│   │       ├── theme-core.tsx
│   │       └── types.ts
│   ├── services/               # Business logic
│   │   └── github.ts           # GitHub service layer
│   └── types/                  # TypeScript definitions
│       ├── github.ts
│       └── portfolio.ts
├── docs/                       # Comprehensive documentation
│   ├── architecture/           # System architecture documentation
│   │   ├── ARCHITECTURE.md     # Overall system design
│   │   ├── COMPONENT_SYSTEM.md # Component registry system
│   │   ├── ROBOTICS_GUIDE.md   # 3D robotics implementation
│   │   ├── FEATURE_FLAGS.md    # Feature flag management
│   │   └── MIGRATION_GUIDE.md  # Architectural migration guide
│   ├── components/             # Component library documentation
│   │   ├── README.md           # Component usage guide
│   │   ├── examples/           # Usage examples
│   │   │   ├── ui-components.md
│   │   │   └── robotics-components.md
│   │   ├── playground/         # Interactive component demos
│   │   └── api/               # Component API documentation
│   └── design/                 # Design system documentation
│       ├── PRINCIPLES.md       # Design philosophy and principles
│       ├── PATTERNS.md         # UI patterns and best practices
│       ├── ANIMATIONS.md       # Animation guidelines
│       └── INSPIRATION.md      # Design references and inspiration
├── stories/                    # Storybook component showcase
│   ├── README.md              # Storybook documentation
│   ├── Navigation.stories.tsx
│   ├── Footer.stories.tsx
│   ├── GitHubContributionGraph.stories.tsx
│   ├── TechStack.stories.tsx
│   └── Robotics.stories.tsx   # 3D robotics demonstrations
├── .storybook/                # Storybook configuration
│   ├── main.ts               # Storybook main config
│   └── preview.ts            # Global decorators and parameters
│   ├── agent-prompts/          # AI agent configurations
│   │   ├── 4-terminal-workflow.md
│   │   ├── bug-fix-prompt-generator.md
│   │   └── specialized-agents.md
│   ├── audits/                 # Audit reports
│   │   └── AUDIT_REPORT.md
│   ├── development/            # Development guides
│   │   └── STYLEGUIDE.md
│   └── project-management/     # Project management
│       └── TODO.md
├── public/                     # Static assets
│   ├── favicon.ico
│   └── robots.txt
├── scripts/                    # Automation scripts
│   ├── deployment/             # Deployment scripts
│   │   ├── auto-deploy.js
│   │   ├── deploy-gcp.sh
│   │   ├── deploy-production.js
│   │   ├── deploy-staging.js
│   │   ├── error-handler.js
│   │   └── rollback.js
│   └── master-controller.js    # Main controller script
├── tests/                      # Test files
│   ├── accessibility/          # Accessibility tests
│   │   └── smoke.test.ts
│   ├── e2e/                    # End-to-end tests
│   ├── integration/            # Integration tests
│   ├── security/               # Security tests
│   └── unit/                   # Unit tests
│       └── smoke.test.ts
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── app.yaml                    # Google App Engine config
├── app-staging.yaml            # Staging environment config
├── CHANGELOG.md                # Version history
├── CLAUDE.md                   # Claude AI instructions
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies & scripts
├── playwright.config.ts        # E2E testing config
├── README.md                   # This file
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
└── vitest.config.ts            # Unit testing config
```

## 🎯 Development Workflow

### 1. Local Development
```bash
npm run dev
```

- Starts Next.js development server
- Opens browser automatically at http://localhost:3000
- Hot reload enabled
- TypeScript checking active

### 2. Testing
```bash
npm test
```

- Runs unit tests with Vitest
- Executes E2E tests with Playwright
- Accessibility and performance tests
- Coverage reports generated

### 3. Deploy to Vercel
This project is configured for easy deployment to Vercel.

1.  **Sign up for a Vercel account.**
2.  **Create a new project and connect your Git repository.**
3.  **Vercel will automatically detect the Next.js framework and configure the build settings.**
4.  **Deploy!**

Alternatively, you can use the Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

## 📚 Documentation & Architecture

### Architecture Overview
The portfolio is built on a sophisticated architecture designed for scalability and maintainability:

- **Component Registry System**: Centralized component management with hot swapping capabilities
- **Feature Flag Management**: Runtime feature control with A/B testing support
- **3D Robotics Engine**: Interactive demonstrations with physics simulation
- **Performance Monitoring**: Real-time metrics and adaptive optimization

### Documentation Structure
```bash
# View architecture documentation
docs/architecture/ARCHITECTURE.md       # System overview
docs/architecture/COMPONENT_SYSTEM.md   # Component registry
docs/architecture/ROBOTICS_GUIDE.md     # 3D implementation
docs/architecture/FEATURE_FLAGS.md      # Flag management
docs/architecture/MIGRATION_GUIDE.md    # Migration procedures

# Design system documentation
docs/design/PRINCIPLES.md               # Design philosophy
docs/design/PATTERNS.md                 # UI patterns
docs/design/ANIMATIONS.md               # Animation guidelines
docs/design/INSPIRATION.md              # Design references

# Component library documentation
docs/components/README.md               # Component guide
docs/components/examples/                # Usage examples
```

### Interactive Component Showcase
```bash
# Start Storybook development server
npm run storybook

# Build static Storybook
npm run build-storybook
```

Visit http://localhost:6006 for interactive component documentation and demos.

## 🤖 3D Robotics Features

### Robot Types Supported
- **6-DOF Manipulator Arms**: Precise positioning with inverse kinematics
- **Mobile Platforms**: Differential drive and omnidirectional movement
- **Collaborative Robots**: Multi-arm coordination scenarios
- **Specialized Systems**: Custom robotics implementations

### Interactive Features
- **Joint Control**: Direct manipulation of robot joints
- **End Effector Positioning**: Cartesian space control
- **Physics Simulation**: Real-time collision detection
- **Path Planning**: Waypoint-based navigation
- **Performance Monitoring**: FPS tracking with adaptive quality

### Technical Implementation
- **Three.js**: Core 3D rendering engine
- **React Three Fiber**: React integration layer
- **Cannon.js**: Physics simulation
- **Level of Detail**: Automatic quality adjustment
- **Mobile Optimization**: Touch-based interaction

## 🌐 Live URLs

- **Production**: https://shivambhardwaj.com
- **Storybook**: https://antimony-labs-storybook.netlify.app (when deployed)

## 📚 Documentation

### Getting Started - Choose Your Workflow
- **[docs/agent-prompts/MINOR_CHANGES_WORKFLOW.md](docs/agent-prompts/MINOR_CHANGES_WORKFLOW.md)** - **Single Terminal** - Iterative development for bug fixes and small features
- **[docs/agent-prompts/MAJOR_CHANGES_WORKFLOW.md](docs/agent-prompts/MAJOR_CHANGES_WORKFLOW.md)** - **Three Terminals** - Parallel execution for complex features
- **[QUICK_START.md](QUICK_START.md)** - Project health check and setup guide

### Project Documentation
- **[README.md](README.md)** - Project overview and setup (this file)
- **[CLAUDE.md](CLAUDE.md)** - AI assistant instructions and project context
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes

### Development Documentation
- **[docs/development/STYLEGUIDE.md](docs/development/STYLEGUIDE.md)** - Design system and styling conventions
- **[docs/project-management/TODO.md](docs/project-management/TODO.md)** - Task tracking and project status
- **[docs/audits/AUDIT_REPORT.md](docs/audits/AUDIT_REPORT.md)** - Comprehensive audit framework

### AI Agent Documentation
- **[docs/agent-prompts/specialized-agents.md](docs/agent-prompts/specialized-agents.md)** - 8 specialized AI agent configurations (reference)
- **[docs/agent-prompts/MINOR_CHANGES_WORKFLOW.md](docs/agent-prompts/MINOR_CHANGES_WORKFLOW.md)** - Quick fixes and iterations workflow
- **[docs/agent-prompts/MAJOR_CHANGES_WORKFLOW.md](docs/agent-prompts/MAJOR_CHANGES_WORKFLOW.md)** - Complex features workflow

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - TypeScript type checking

### Testing
- `npm run test` - Run unit tests
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run E2E tests
- `npm run test:accessibility` - Accessibility tests
- `npm run test:performance` - Performance tests

### Quality
- `npm run lint` - ESLint code quality
- `npm run lint:fix` - Auto-fix lint issues
- `npm run security:audit` - Security audit

### Deployment
- `npm run deploy` - Deploy to Vercel

## 📊 Monitoring

### Health Endpoints
- `GET /api/health` - Service status
- `GET /api/tech-versions` - Technology stack info

## 🚀 Deployment

The application is configured for deployment to Vercel.

1.  **Build**: Next.js production build (handled by Vercel)
2.  **Deploy**: Push to your Git repository (main branch)
3.  **SSL**: Automatic SSL certificate provisioning
4.  **Scaling**: Automatic scaling based on traffic
5.  **CDN**: Static assets served via Vercel's CDN

## 🔒 Security Features

- **HTTPS Only**: Automatic SSL certificates
- **CORS Configured**: Proper cross-origin handling
- **Security Headers**: Helmet.js integration
- **Input Validation**: TypeScript type safety
- **Dependency Scanning**: Automated security audits

## 🤝 Contributing

This is a personal portfolio, but feel free to:
- Report issues
- Suggest improvements
- Fork for your own use

## 📄 License

MIT License - Feel free to use this as a template for your own portfolio.

---

**Built with ❤️ by Antimony Labs**
