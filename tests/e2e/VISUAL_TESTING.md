# Visual E2E Testing Guide

This project uses Playwright for end-to-end visual testing with screenshot capture capabilities. Visual tests run on the server and results are accessible via a web interface.

## Quick Start

### Running Visual Tests Locally

1. **Start the development server** (in one terminal):
   ```bash
   npm run dev
   ```

2. **Run visual tests** (in another terminal):
   ```bash
   npm run test:e2e:visual
   ```

3. **View results**:
   - Open `http://localhost:3000/test-viewer.html` in your browser
   - Or use the Playwright HTML report: `npx playwright show-report`

### Testing Against Vercel Preview

When a PR is created, Vercel automatically creates a preview deployment. You can test against it:

```bash
# Set the Vercel preview URL
export VERCEL_PREVIEW_URL="https://your-preview-url.vercel.app"

# Run tests against preview
npm run test:e2e:vercel

# Or use the script
./scripts/run-visual-tests.sh
```

## Available Scripts

- `npm run test:e2e:visual` - Run all visual tests
- `npm run test:e2e:headless` - Run e2e tests in headless mode
- `npm run test:e2e:visual:update` - Update baseline screenshots
- `npm run test:e2e:vercel` - Test against Vercel preview URL
- `npm run test:results:serve` - Start dev server to view results
- `npm run test:results:clean` - Clean old test results

## Test Structure

Visual tests are organized into several suites:

### 1. Visual Regression Tests (`visual-regression.spec.ts`)
- Compares current screenshots with baseline images
- Tests all major pages (homepage, projects, skills, swarm, contact)
- Includes mobile, tablet, and desktop viewports

### 2. Responsive Visual Tests (`responsive-visual.spec.ts`)
- Tests responsive design across different viewport sizes
- Ensures UI adapts correctly on mobile, tablet, and desktop

### 3. Critical Paths Visual Tests (`critical-paths-visual.spec.ts`)
- Tests key user journeys with visual captures
- Documents navigation flows between pages

### 4. Enhanced Existing Tests
- `homepage.spec.ts` now includes visual snapshots
- Other e2e tests can be enhanced similarly

## Visual Testing Utilities

The `tests/e2e/utils/visual-testing.ts` module provides helper functions:

- `captureVisualSnapshot()` - Capture full-page screenshots
- `captureElementSnapshot()` - Capture specific element screenshots
- `compareWithBaseline()` - Compare with baseline images
- `updateBaseline()` - Update baseline screenshots
- `captureResponsiveSnapshots()` - Capture multiple viewport sizes
- `VIEWPORTS` - Standard viewport sizes (mobile, tablet, desktop)

## Updating Baselines

When UI changes are intentional, update the baseline screenshots:

```bash
# Run the baseline update test
npm run test:e2e:visual:update

# Or run with grep
npx playwright test --grep "update baseline"
```

## Viewing Results

### Web Viewer
Access the visual test results viewer at:
- Local: `http://localhost:3000/test-viewer.html`
- Results are stored in `public/test-results/` organized by date

### Playwright HTML Report
```bash
npx playwright show-report
```

### CI/CD Artifacts
When tests run in GitHub Actions, artifacts are uploaded:
- Visual test results
- Playwright HTML report
- Screenshots and videos

## Server-Based Workflow

Since development happens on a server:

1. **Push code to GitHub** → Creates PR
2. **Vercel creates preview** → Automatic preview deployment
3. **Run visual tests on server**:
   ```bash
   VERCEL_PREVIEW_URL="https://preview-url.vercel.app" ./scripts/run-visual-tests.sh
   ```
4. **View results** → `http://localhost:3000/test-viewer.html`
5. **Review and approve** → Merge PR if visual tests pass

## Configuration

Visual testing is configured in `playwright.config.ts`:

- **Screenshots**: Enabled for all tests (`screenshot: 'on'`)
- **Headless mode**: Enabled for server environment
- **Visual threshold**: 0.2 (20% pixel difference tolerance)
- **Base URL**: Configurable via `TEST_BASE_URL` environment variable

## Best Practices

1. **Run visual tests before merging PRs** - Catch visual regressions early
2. **Update baselines intentionally** - Don't ignore visual changes
3. **Review test results** - Use the web viewer to compare screenshots
4. **Test multiple viewports** - Ensure responsive design works
5. **Clean old results** - Periodically clean up old test artifacts

## Troubleshooting

### Tests fail with "baseline not found"
- This is expected on first run
- Run `npm run test:e2e:visual:update` to create baselines

### Screenshots not appearing in viewer
- Ensure `public/test-results/` directory exists
- Check that dev server is running
- Verify file permissions

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check that the base URL is accessible
- Ensure network is stable

## CI/CD Integration

Visual tests run automatically in GitHub Actions:
- Runs on every PR and push to main
- Uploads test artifacts for review
- Continues on error to allow manual review

See `.github/workflows/ci.yml` for configuration details.

