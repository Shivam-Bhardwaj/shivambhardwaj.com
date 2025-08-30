# MASTER GUIDE - Robotics Portfolio Development

> **LLM Consistency Guide**: This comprehensive reference ensures consistent development across all AI-assisted coding sessions.

## 🎯 PROJECT OVERVIEW

**Shivam Bhardwaj's Robotics Portfolio** - A production-ready interactive portfolio showcasing robotics engineering expertise through advanced web technologies and real-time simulations.

### Core Identity
- **Domain**: shivambhardwaj.com (Firebase hosting)
- **Purpose**: Professional robotics engineering portfolio
- **Audience**: Employers, collaborators, robotics community
- **Unique Value**: Interactive robotics simulations with professional-grade code

## 🏗️ ARCHITECTURE STANDARDS

### Technology Stack (Fixed - Do Not Change)
```yaml
Framework: Next.js 15.4.5 (App Router, Static Export)
Language: TypeScript 5 (Strict Mode)
Styling: Tailwind CSS v4
Animation: Framer Motion 12.23.12
Testing: Vitest (unit) + Playwright (E2E) + Jest-axe (a11y)
Deployment: Firebase Hosting
Build: Static site generation only
```

### Code Quality Standards
```yaml
TypeScript: Strict mode enabled, no 'any' types allowed
ESLint: Next.js configuration with strict rules
Testing: 70% minimum coverage across branches/functions/lines
Documentation: All public APIs and components documented
Security: OWASP Top 10 compliance, no secrets in code
Performance: <3s load time, >95 Lighthouse score
```

## 📁 PROJECT STRUCTURE (CANONICAL)

```
robotics-portfolio/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with navigation
│   │   ├── page.tsx            # Homepage with hero
│   │   ├── projects/page.tsx   # Project showcase
│   │   ├── experience/page.tsx # Career timeline
│   │   ├── skills/page.tsx     # Technical skills
│   │   ├── calculators/page.tsx # Robotics tools
│   │   ├── swarm/page.tsx      # Swarm simulation
│   │   └── contact/page.tsx    # Contact form
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # Base UI components
│   │   ├── calculators/        # Interactive calculators
│   │   ├── Navbar.tsx          # Main navigation
│   │   ├── Footer.tsx          # Site footer
│   │   ├── GTARobots.tsx       # Advanced swarm sim
│   │   ├── SwarmDefenderCanvas.tsx # Game simulation
│   │   └── RobotGameTest.tsx   # Testing environment
│   ├── lib/                    # Core business logic
│   │   ├── robotics/           # Robotics algorithms
│   │   │   ├── math.ts         # Vector operations
│   │   │   ├── algorithms.ts   # SLAM, pathfinding
│   │   │   ├── sensors.ts      # Sensor simulation
│   │   │   └── ros-system/     # ROS implementation
│   │   ├── swarm/              # Multi-agent systems
│   │   ├── robotAI/            # AI behaviors
│   │   └── telemetry/          # Performance monitoring
│   ├── data/                   # Static configuration
│   │   ├── site.ts             # Site metadata
│   │   ├── projects.ts         # Portfolio projects
│   │   └── experience.ts       # Career data
│   └── config/                 # Build configuration
├── tests/                      # Comprehensive test suite
│   ├── unit/                   # Component tests
│   ├── integration/            # User flow tests
│   ├── e2e/                    # Playwright tests
│   ├── accessibility/          # WCAG compliance
│   └── security/               # Security tests
├── docs/                       # Documentation
│   ├── codebase_summary.md     # Technical overview
│   ├── MASTER_GUIDE.md         # This file
│   └── index.html              # GitHub Pages
├── scripts/                    # Build automation
├── public/                     # Static assets
└── out/                        # Build output
```

## 🎨 DESIGN SYSTEM

### Brand Colors (Consistent Usage)
```css
--brand-primary: #d946ef;      /* Fuchsia-600 */
--brand-accent: #06b6d4;       /* Cyan-600 */
--brand-secondary: #8b5cf6;    /* Violet-500 */
--brand-warning: #f59e0b;      /* Amber-500 */
--brand-success: #10b981;      /* Emerald-500 */
--brand-error: #ef4444;        /* Red-500 */
```

### Typography
```css
Primary Font: Inter (system-ui fallback)
Accent Font: Orbitron (for tech elements)
Code Font: JetBrains Mono
```

### Component Patterns
```tsx
// Standard component structure
'use client';  // When hooks are used
import React from 'react';
import { motion } from 'framer-motion';

interface ComponentProps {
  // Proper TypeScript interfaces
}

export default function Component({ props }: ComponentProps) {
  // Implementation
}
```

## 🤖 ROBOTICS IMPLEMENTATIONS

### Core Algorithms
1. **Swarm Flocking** (`GTARobots.tsx`)
   - Separation, Alignment, Cohesion
   - Obstacle avoidance with raycasting
   - Emergent formation behaviors

2. **ROS System** (`lib/robotics/ros-system/`)
   - Master/Node architecture
   - Message passing system
   - Navigation and control

3. **Path Planning** (`algorithms.ts`)
   - A* pathfinding
   - Dynamic obstacle avoidance
   - Trajectory optimization

4. **Sensor Fusion** (`sensors.ts`)
   - IMU, GPS, LiDAR integration
   - Kalman filtering
   - Noise modeling

### Interactive Calculators
- **Kinematics**: Forward/inverse calculations
- **PID Tuning**: Controller optimization
- **Trajectory Planning**: Path generation
- **Sensor Fusion**: Multi-sensor integration
- **3D Transforms**: Rotation matrices

## 📋 DEVELOPMENT WORKFLOWS

### Daily Development Process
```bash
1. Start: npm run dev
2. Code: Follow TypeScript strict mode
3. Test: npm run test (continuous)
4. Build: npm run build (verify)
5. Deploy: npm run deploy (Firebase)
```

### Code Standards Checklist
- [ ] TypeScript interfaces (no `any` types)
- [ ] ESLint passing (no warnings)
- [ ] Test coverage >70%
- [ ] Component documentation
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Performance optimized
- [ ] Security compliant

### Git Workflow
```bash
# Branch naming
feature/component-name
bugfix/issue-description
hotfix/critical-fix

# Commit format
feat: add new robotics calculator
fix: resolve swarm simulation performance
docs: update component documentation
test: add integration tests for navigation
```

## 🧪 TESTING STRATEGY

### Test Categories & Coverage
```yaml
Unit Tests: Component logic, utilities (>80% coverage)
Integration: User interactions, data flow (>70% coverage)  
E2E Tests: Critical user journeys (100% coverage)
A11y Tests: WCAG compliance (all components)
Performance: Lighthouse scores (>95 desktop, >90 mobile)
Security: Vulnerability scanning (no high/critical)
```

### Test Execution
```bash
# Comprehensive test suite
npm run test:all

# Individual test types
npm run test:unit
npm run test:integration  
npm run test:e2e
npm run test:accessibility
npm run test:performance
npm run test:security
```

## 🚀 DEPLOYMENT PIPELINE

### Build Process
```bash
1. Type Check: npm run type-check
2. Lint Check: npm run lint
3. Test Suite: npm run test:all
4. Security Audit: npm run security:audit
5. Build: npm run build
6. Deploy: firebase deploy
```

### Environment Configuration
```yaml
Development: Local development server
Staging: Preview builds for testing
Production: Firebase hosting (shivambhardwaj.com)
```

## 🔒 SECURITY REQUIREMENTS

### OWASP Top 10 Compliance
1. **Injection Prevention**: Input sanitization
2. **Authentication**: No auth required (static site)
3. **Sensitive Data**: No secrets in code
4. **XML External Entities**: N/A (no XML processing)
5. **Broken Access Control**: N/A (public site)
6. **Security Misconfiguration**: CSP headers
7. **XSS Prevention**: React built-in protection
8. **Insecure Deserialization**: JSON only
9. **Components with Vulnerabilities**: Regular audits
10. **Insufficient Logging**: Error monitoring

### Security Headers
```javascript
// next.config.ts
headers: [
  {
    source: '/(.*)',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' }
    ]
  }
]
```

## 📈 PERFORMANCE STANDARDS

### Core Web Vitals Targets
```yaml
First Contentful Paint: <1.5s
Largest Contentful Paint: <2.5s  
Cumulative Layout Shift: <0.1
First Input Delay: <100ms
```

### Optimization Techniques
- Static site generation (Next.js export)
- Image optimization (WebP/AVIF formats)
- Code splitting (dynamic imports)
- Bundle size monitoring
- Aggressive caching strategies

## 🎯 COMPONENT GUIDELINES

### Standard Component Template
```tsx
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  // Add specific props with types
}

/**
 * Component description
 * @param props - Component properties
 * @returns JSX element
 */
export default function Component({ className, children, ...props }: ComponentProps) {
  // State management
  const [state, setState] = useState(initialValue);

  // Effects with proper cleanup
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  return (
    <motion.div
      className={cn('base-styles', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### Animation Standards
```tsx
// Page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

// Hover effects
const hoverVariants = {
  scale: 1.05,
  transition: { duration: 0.2 }
};
```

## 📊 MONITORING & ANALYTICS

### Performance Monitoring
- Bundle size tracking
- Lighthouse CI integration
- Core Web Vitals monitoring
- Error boundary implementation

### User Analytics
- Google Analytics integration
- User interaction tracking
- Performance metrics collection
- Error logging and reporting

## 🔧 TROUBLESHOOTING GUIDE

### Common Issues & Solutions

#### Build Failures
```bash
Error: TypeScript errors
Solution: npm run type-check && fix issues

Error: ESLint violations  
Solution: npm run lint:fix

Error: Test failures
Solution: npm run test:debug
```

#### Performance Issues
```bash
Large bundle size: Analyze with npm run build:analyze
Slow rendering: Check React DevTools profiler
Memory leaks: Monitor with browser dev tools
```

#### Deployment Issues
```bash
Firebase deploy fails: Check firebase.json config
Static export errors: Verify next.config.ts
Missing assets: Check public/ directory structure
```

## 🤝 COLLABORATION STANDARDS

### Code Review Checklist
- [ ] TypeScript compilation passes
- [ ] ESLint rules followed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Performance impact assessed
- [ ] Security implications reviewed
- [ ] Accessibility tested
- [ ] Mobile responsiveness verified

### Documentation Requirements
- Component props documentation
- Complex algorithm explanations
- API endpoint documentation
- Setup and installation guides
- Troubleshooting sections

## 📚 REFERENCE LINKS

### Official Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

### Testing Resources
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Testing](https://playwright.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Robotics References
- [ROS Documentation](https://docs.ros.org/)
- [Robotics Algorithms](https://en.wikipedia.org/wiki/Robot_navigation)
- [Swarm Intelligence](https://en.wikipedia.org/wiki/Swarm_intelligence)

---

## 🚨 CRITICAL REMINDERS FOR AI DEVELOPMENT

### DO NOT CHANGE
- Project structure (established and working)
- Technology stack versions (Next.js 15.4.5, etc.)
- Build configuration (Firebase static export)
- Core robotics algorithms (tested and optimized)
- Brand colors and design system

### ALWAYS DO
- Use TypeScript strict mode with proper interfaces
- Follow ESLint rules without exceptions
- Maintain 70%+ test coverage
- Document all new components
- Test across browsers and devices
- Verify accessibility compliance
- Monitor performance impact

### NEVER DO  
- Use 'any' types in TypeScript
- Skip testing for new features
- Commit secrets or API keys
- Break existing functionality
- Ignore ESLint warnings
- Deploy without testing
- Modify core configuration without review

## 📝 SESSION HANDOFF PROTOCOL

When starting a new AI development session:

1. **Read this guide completely**
2. **Review current codebase structure**
3. **Run test suite to verify status**
4. **Check latest commits for context**
5. **Understand current development phase**
6. **Follow established patterns consistently**

This ensures continuity and maintains code quality across all development sessions.

---

**This document serves as the single source of truth for all development decisions and maintains consistency across AI-assisted development sessions.**