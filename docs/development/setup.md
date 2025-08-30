# 🛠️ Development Setup Guide

Get your development environment ready to contribute to the Interactive Robotics Portfolio.

## 📋 Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **npm** | 9+ | Package management |
| **Git** | 2.30+ | Version control |
| **VS Code** | Latest | Recommended IDE |

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux Ubuntu 18.04+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space
- **Display**: 1920x1080 resolution recommended
- **GPU**: WebGL-compatible graphics card

## 🚀 Quick Start

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/Shivam-Bhardwaj/shivambhardwaj.com.git
cd shivambhardwaj.com

# Or use GitHub CLI
gh repo clone Shivam-Bhardwaj/shivambhardwaj.com
cd shivambhardwaj.com
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm run version-check
```

### 3. Environment Setup

Create `.env.local` file:

```env
# Development environment
NODE_ENV=development

# API Configuration (optional)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Feature flags
NEXT_PUBLIC_ENABLE_TELEMETRY=true
NEXT_PUBLIC_DEBUG_MODE=true
```

### 4. Start Development Server

```bash
# Start development server
npm run dev

# Server will be available at http://localhost:3000
```

## 🔧 Development Commands

### Core Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run clean        # Clean build artifacts

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm run type-check   # TypeScript checking
npm run format       # Format code with Prettier

# Testing
npm run test         # Run all tests
npm run test:watch   # Watch mode for tests
npm run test:coverage # Generate coverage report
npm run test:e2e     # End-to-end tests
npm run test:a11y    # Accessibility tests
```

### Advanced Commands

```bash
# AI-Powered Development
npm run claude              # Interactive AI assistant
npm run claude:quick        # Quick AI commands
npm run claude:context      # Generate project context
npm run agent              # Master automation agent
npm run agent:quality      # Code quality analysis
npm run fix:validation     # Auto-fix validation issues

# Security & Quality
npm run security:audit     # Security vulnerability scan
npm run validate:pre-push  # Pre-push validation
npm run test:security      # Security-focused tests
npm run performance:audit  # Performance analysis

# Deployment
npm run deploy            # Deploy to Firebase
npm run deploy:preview    # Deploy to preview channel
npm run push:safe        # Safe push with validation
```

## 🏗️ Project Architecture

### Directory Structure

```
shivambhardwaj.com/
├── src/                    # Source code
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   └── (routes)/      # Route groups
│   │
│   ├── components/        # React components
│   │   ├── ui/           # Base UI components
│   │   ├── calculators/  # Robotics calculators
│   │   └── simulations/  # Interactive demos
│   │
│   ├── lib/              # Core libraries
│   │   ├── robotics/     # Robotics algorithms
│   │   ├── swarm/        # Swarm intelligence
│   │   ├── robotAI/      # AI behaviors
│   │   └── utils/        # Utility functions
│   │
│   ├── config/           # Configuration
│   ├── data/            # Static data
│   └── styles/          # Global styles
│
├── tests/               # Test suites
├── scripts/            # Development scripts
├── docs/              # Documentation
├── public/           # Static assets
└── config files      # Various config files
```

### Key Technologies

```typescript
// Core stack
interface TechStack {
  framework: "Next.js 15.4.5";
  runtime: "React 18.3";
  language: "TypeScript 5";
  styling: "Tailwind CSS v4";
  animation: "Framer Motion 12";
  
  // Robotics-specific
  graphics: "WebGL + Canvas API";
  algorithms: "Custom TypeScript implementations";
  simulation: "Real-time physics engines";
  
  // Development
  testing: ["Jest", "Playwright", "React Testing Library"];
  linting: ["ESLint", "Prettier"];
  ai_tools: ["Claude Code", "Custom agents"];
}
```

## 🧪 Testing Setup

### Running Tests

```bash
# Unit tests
npm run test                    # All tests
npm run test:unit               # Unit tests only
npm run test:watch             # Watch mode
npm run test:coverage          # With coverage

# Integration tests
npm run test:integration       # Integration tests
npm run test:a11y             # Accessibility tests
npm run test:performance      # Performance tests

# End-to-end tests
npm run test:e2e              # All E2E tests
npm run test:e2e:ui           # Playwright UI mode
npm run test:e2e:headed       # With browser UI
```

### Test Configuration

The project uses multiple testing frameworks:

- **Jest** for unit and integration tests
- **Playwright** for E2E testing across browsers
- **React Testing Library** for component testing
- **jest-axe** for accessibility testing

### Writing Tests

Example test structure:

```typescript
// components/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe } from '@jest/globals';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
  
  test('handles user interaction', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

## 🔍 IDE Configuration

### VS Code Setup

Install recommended extensions:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright",
    "ms-vscode.vscode-jest"
  ]
}
```

Workspace settings:

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Debugging Configuration

Launch configuration for debugging:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal"
    }
  ]
}
```

## 🤖 AI-Powered Development

### Claude Code Integration

This project includes advanced AI assistance:

```bash
# Interactive AI assistant
npm run claude

# Quick AI commands
npm run claude:quick

# Generate project context
npm run claude:context
```

### Automation Agents

Multiple AI agents for development tasks:

```bash
# Master agent - comprehensive automation
npm run agent

# Specialized agents
npm run agent:quality        # Code quality analysis
npm run agent:security       # Security scanning
npm run agent:tests         # Test coverage analysis
npm run agent:docs          # Documentation updates
```

### Custom Development Scripts

The project includes custom Node.js scripts:

- **Quality Check Agent**: Automated code quality analysis
- **Pre-push Agent**: Comprehensive validation before pushing
- **Deploy Agent**: Automated deployment with checks
- **Test Logger**: Advanced test result analysis

## 🐛 Debugging Guide

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

#### Node Modules Issues

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### TypeScript Errors

```bash
# Reset TypeScript
npm run type-check
rm -rf .next
npm run build
```

### Performance Debugging

```bash
# Analyze bundle size
npm run build:analyze

# Performance profiling
npm run test:performance

# Memory usage analysis
node --inspect npm run dev
```

## 🚀 Contributing Workflow

### Development Process

1. **Create Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

2. **Make Changes**
- Write code following project conventions
- Add tests for new functionality
- Update documentation as needed

3. **Quality Checks**
```bash
npm run lint                # Code quality
npm run type-check         # Type safety
npm run test               # All tests
npm run test:a11y         # Accessibility
```

4. **Pre-push Validation**
```bash
npm run validate:pre-push  # Comprehensive checks
```

5. **Commit and Push**
```bash
git add .
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
```

6. **Create Pull Request**
- Describe changes and rationale
- Include screenshots for UI changes
- Reference related issues

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Custom rules for robotics projects
- **Prettier**: Consistent code formatting
- **Test Coverage**: Maintain 70%+ coverage
- **Documentation**: Update docs for public APIs

## 📞 Getting Help

### Resources

- **📖 Documentation**: [Full docs site](/)
- **🐛 Issues**: [GitHub Issues](https://github.com/Shivam-Bhardwaj/robotics-portfolio/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/Shivam-Bhardwaj/robotics-portfolio/discussions)
- **📧 Email**: contact@shivambhardwaj.com

### Community Guidelines

- Be respectful and constructive
- Provide detailed bug reports
- Include code examples when asking for help
- Follow the project's code of conduct

---

Ready to start developing? [Explore the codebase](../codebase_summary.md) or [check out the component library](../reference/components.md)!