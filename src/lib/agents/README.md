# Testing and QA Agents

A comprehensive automated testing and deployment system for the robotics portfolio website. These agents help prevent broken deployments and catch issues early in the development process.

## Overview

The agent system consists of three main agents:

1. **QA Agent** - Comprehensive quality assurance testing
2. **Build Agent** - Build verification and validation  
3. **Deploy Agent** - Safe deployment with comprehensive checks

## Quick Start

```bash
# Run QA tests
npm run test:qa

# Verify build process
npm run test:build  

# Safe deployment to production
npm run deploy:safe

# Deploy to staging
npm run deploy:staging
```

## Agents

### 1. QA Agent (`qa-agent.ts`)

Performs comprehensive quality assurance testing including:

- ✅ TypeScript compilation
- ✅ ESLint rule validation
- ✅ Unit test execution with coverage
- ✅ Build process verification
- ✅ Static export validation
- ✅ Navigation link validation
- ✅ Responsive design configuration
- ✅ Performance metrics testing
- ✅ Accessibility compliance
- ✅ Robot behavior component validation
- ✅ Security vulnerability scanning

**Usage:**
```bash
npm run test:qa
```

**Programmatic Usage:**
```typescript
import { runQATests } from './src/lib/agents/qa-agent';

const report = await runQATests();
if (report.overallPassed) {
  console.log('All QA tests passed!');
}
```

### 2. Build Agent (`build-agent.ts`)

Verifies the build process and validates output:

- ✅ Prerequisites checking (Node.js version, dependencies)
- ✅ Clean build process
- ✅ TypeScript type checking
- ✅ Production build execution
- ✅ Static export validation
- ✅ Build warning analysis
- ✅ Asset validation (CSS, JS, media files)
- ✅ Page generation verification
- ✅ Bundle size monitoring
- ✅ Build manifest validation

**Usage:**
```bash
npm run test:build
```

**Programmatic Usage:**
```typescript
import { runBuildVerification } from './src/lib/agents/build-agent';

const report = await runBuildVerification();
if (report.buildSuccess) {
  console.log('Build verification passed!');
}
```

### 3. Deploy Agent (`deploy-agent.ts`)

Safe deployment with comprehensive pre and post-deployment checks:

**Pre-deployment:**
- ✅ Git repository status check
- ✅ QA test execution
- ✅ Build verification
- ✅ Security audit
- ✅ Firebase configuration validation

**Deployment:**
- ✅ Clean production build
- ✅ Firebase hosting deployment
- ✅ Deployment URL extraction

**Post-deployment:**
- ✅ Live site verification
- ✅ Performance monitoring
- ✅ Cleanup of artifacts

**Usage:**
```bash
# Deploy to production
npm run deploy:safe

# Deploy to staging
npm run deploy:staging
```

**Programmatic Usage:**
```typescript
import { runSafeDeployment } from './src/lib/agents/deploy-agent';

const report = await runSafeDeployment(undefined, 'production');
if (report.deploymentSuccess) {
  console.log('Deployment successful!');
  console.log('Live at:', report.deploymentInfo.deploymentUrl);
}
```

## Complete Validation Pipeline

Run all agents in sequence:

```typescript
import { runCompleteValidation } from './src/lib/agents';

const results = await runCompleteValidation();
if (results.overallSuccess) {
  console.log('Ready for deployment!');
}
```

## Configuration

### Environment Variables

The agents respect the following environment variables:

- `NODE_ENV` - Environment (development/production/test)
- `CI` - Continuous Integration mode flag

### Firebase Configuration

Ensure you have a valid `firebase.json` in your project root:

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "trailingSlash": false
  }
}
```

### Project Structure Requirements

The agents expect the following project structure:

```
project-root/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utility libraries
│   └── data/               # Data files
├── tests/                   # Test suites
├── out/                     # Build output (generated)
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── firebase.json
└── tsconfig.json
```

## Thresholds and Limits

### QA Agent
- **Test Coverage:** Minimum 70%
- **TypeScript:** Zero compilation errors
- **Linting:** Zero ESLint errors

### Build Agent
- **Bundle Size Warning:** 50MB
- **Bundle Size Critical:** 100MB
- **Required Pages:** All routes must generate HTML files
- **Build Warnings:** Critical warnings cause failure

### Deploy Agent
- **Security:** No high/critical vulnerabilities
- **Git Status:** No uncommitted changes
- **Pre-checks:** All QA and build checks must pass

## Error Handling

Each agent provides detailed error reporting:

```typescript
// Example error handling
try {
  const report = await runQATests();
  if (!report.overallPassed) {
    const failures = report.results.filter(r => !r.passed);
    failures.forEach(failure => {
      console.error(`❌ ${failure.name}: ${failure.message}`);
    });
  }
} catch (error) {
  console.error('QA Agent failed:', error);
}
```

## Continuous Integration

Use in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run QA Tests
  run: npm run test:qa

- name: Verify Build
  run: npm run test:build

- name: Deploy (if tests pass)
  run: npm run deploy:safe
  if: success()
```

## Troubleshooting

### Common Issues

**TypeScript Errors:**
```bash
# Check TypeScript configuration
npx tsc --showConfig
npm run type-check
```

**Build Failures:**
```bash
# Clean and rebuild
npm run clean
npm run build
```

**Firebase Deployment Issues:**
```bash
# Verify Firebase CLI
firebase --version
firebase login
firebase projects:list
```

**Security Vulnerabilities:**
```bash
# Check and fix security issues
npm audit
npm audit fix
```

### Debug Mode

Enable verbose logging by setting environment variables:

```bash
DEBUG=true npm run test:qa
VERBOSE=true npm run deploy:safe
```

## Extending the Agents

### Adding New Tests to QA Agent

```typescript
// In qa-agent.ts
private async testCustomFeature(): Promise<void> {
  const startTime = Date.now();
  try {
    console.log('🔧 Testing custom feature...');
    
    // Your test logic here
    
    this.results.push({
      name: 'Custom Feature',
      passed: true,
      message: 'Custom feature test passed',
      duration: Date.now() - startTime
    });
  } catch (error: any) {
    this.results.push({
      name: 'Custom Feature',
      passed: false,
      message: `Custom feature test failed: ${error.message}`,
      duration: Date.now() - startTime
    });
  }
}
```

### Adding New Build Checks

```typescript
// In build-agent.ts
private async validateCustomBuild(): Promise<void> {
  // Custom build validation logic
}
```

### Adding New Deployment Steps

```typescript
// In deploy-agent.ts
private async customDeploymentStep(): Promise<boolean> {
  this.updateStep('Custom Step', 'running', 'Executing custom step...');
  
  try {
    // Custom deployment logic
    
    this.updateStep('Custom Step', 'success', 'Custom step completed');
    return true;
  } catch (error: any) {
    this.updateStep('Custom Step', 'failed', `Custom step failed: ${error.message}`);
    return false;
  }
}
```

## Best Practices

1. **Run QA tests before every commit**
2. **Use build verification for PR checks**
3. **Always use safe deployment for production**
4. **Monitor deployment reports for performance trends**
5. **Keep Firebase CLI and dependencies updated**
6. **Review security audit results regularly**

## Contributing

When adding new features to the agents:

1. Follow the existing error handling patterns
2. Add comprehensive logging and progress indicators
3. Include duration tracking for performance monitoring
4. Update type definitions and interfaces
5. Add corresponding tests and documentation

## Support

For issues with the agents:

1. Check the troubleshooting section
2. Review the detailed error reports
3. Verify project configuration matches requirements
4. Check dependencies and versions

The agents are designed to be practical development tools that catch issues early and prevent broken deployments. They provide detailed reporting and are easily extensible for project-specific needs.