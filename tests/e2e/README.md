# E2E Visual Testing with Playwright

This directory contains end-to-end tests with comprehensive visual documentation through screenshot capture.

## Overview

We use Playwright for E2E testing with two modes:
1. **Functional Tests** - Test behavior, capture screenshots only on failure
2. **Visual Tests** - Capture screenshots for documentation and visual regression testing

## Test Files

### Functional Tests (`.spec.ts`)
- `homepage.spec.ts` - Homepage functionality and navigation
- `swarm-game.spec.ts` - Interactive swarm robotics game
- `accessibility.a11y.spec.ts` - Accessibility compliance (WCAG)
- `performance.performance.spec.ts` - Performance metrics and Lighthouse audits

### Visual Tests (`.visual.spec.ts`)
- `homepage.visual.spec.ts` - Homepage visual states and responsive layouts
- `swarm-game.visual.spec.ts` - Swarm game interactions and animations
- `pages.visual.spec.ts` - All pages (Projects, Experience, Skills, Contact)

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Visual Tests Only
```bash
npx playwright test --grep visual
```

### Specific Visual Test File
```bash
npx playwright test homepage.visual.spec.ts
```

### With UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=visual  # Visual tests with screenshots enabled
```

## Screenshot Locations

Screenshots are saved in two locations:

### 1. Named Screenshots (Organized)
Path: `test-results/screenshots/`

Examples:
```
test-results/screenshots/
├── homepage-desktop-full.png
├── homepage-mobile-portrait.png
├── homepage-tablet.png
├── swarm-initial-state.png
├── swarm-25-robots.png
├── swarm-movement-start.png
├── projects-desktop.png
├── skills-mobile.png
└── contact-form.png
```

### 2. Test Artifacts (Auto-generated)
Path: `test-results/`

Includes:
- Screenshots on failure
- Videos on failure
- Trace files
- Test reports (HTML, JSON, JUnit)

## Visual Test Coverage

### Homepage (`homepage.visual.spec.ts`)
- ✅ Full page screenshots (desktop, mobile, tablet)
- ✅ Above-the-fold content
- ✅ Navigation menu states
- ✅ Typewriter animation progression
- ✅ Button hover states
- ✅ Light/dark mode comparison
- ✅ Scroll behavior (top, middle, bottom)

### Swarm Game (`swarm-game.visual.spec.ts`)
- ✅ Initial game state
- ✅ Different robot counts (5, 25, 50)
- ✅ Swarm movement and convergence
- ✅ Multiple target changes
- ✅ UI controls (slider positions)
- ✅ Timer display
- ✅ Mobile and tablet viewports
- ✅ Ultra-wide displays
- ✅ Reset behavior

### Other Pages (`pages.visual.spec.ts`)
- ✅ Projects page (desktop, mobile, card hover states)
- ✅ Experience page (desktop, mobile, timeline)
- ✅ Skills page (desktop, mobile, grid layout)
- ✅ Contact page (desktop, mobile, form)
- ✅ Navigation consistency across all pages
- ✅ Footer consistency

## Viewport Sizes Tested

| Device | Width × Height | Purpose |
|--------|----------------|---------|
| Mobile Portrait | 375 × 667 | iPhone SE, 8 |
| Tablet | 768 × 1024 | iPad |
| Desktop | 1280 × 720 | Standard laptop |
| Ultra-wide | 2560 × 1440 | 2K monitors |

## Visual Regression Testing

### Snapshot Comparison
Visual tests use `expect(screenshot).toMatchSnapshot()` for automated visual regression:

```typescript
expect(await page.screenshot()).toMatchSnapshot('homepage-desktop.png')
```

**First run**: Creates baseline snapshots
**Subsequent runs**: Compares against baseline, fails if different

### Updating Snapshots
If visual changes are intentional:
```bash
npx playwright test --update-snapshots
```

## Best Practices

### 1. Wait for Content to Settle
```typescript
await page.waitForLoadState('networkidle')
await page.waitForTimeout(1000) // Let animations complete
```

### 2. Name Screenshots Descriptively
```typescript
await page.screenshot({
  path: 'test-results/screenshots/swarm-50-robots-converged.png',
})
```

### 3. Capture Both Full Page and Specific Elements
```typescript
// Full page
await page.screenshot({ fullPage: true })

// Specific element
await element.screenshot({ path: '...' })
```

### 4. Test Multiple States
- Initial load
- After interactions
- Hover states
- Different data states
- Responsive breakpoints

### 5. Document Animation Sequences
Capture key frames:
```typescript
// Before animation
await page.screenshot({ path: 'animation-start.png' })
await page.waitForTimeout(1000)

// Mid animation
await page.screenshot({ path: 'animation-mid.png' })
await page.waitForTimeout(2000)

// After animation
await page.screenshot({ path: 'animation-end.png' })
```

## Playwright Configuration

### Visual Test Project
Configured in `playwright.config.ts`:

```typescript
{
  name: 'visual',
  testMatch: '**/*.visual.spec.ts',
  use: {
    screenshot: 'on',  // Always capture
    video: 'on',       // Always record
  },
}
```

### Default Project Settings
```typescript
{
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

## Viewing Results

### HTML Report
```bash
npx playwright show-report
```

Opens interactive report with:
- Test results
- Screenshots
- Videos
- Traces

### Screenshots Directory
```bash
ls -la test-results/screenshots/
```

### Trace Viewer
```bash
npx playwright show-trace test-results/trace.zip
```

## CI/CD Integration

### Running in CI
```bash
npm run test:ci
```

Includes:
- All functional tests
- Visual regression tests
- Coverage reports
- Security audits

### Artifacts
CI should preserve:
- `test-results/` - All screenshots, videos, traces
- `playwright-report/` - HTML test report
- `test-results/results.json` - Machine-readable results
- `test-results/results.xml` - JUnit format

## Troubleshooting

### Screenshots are Blank or Wrong Size
- Ensure `waitForLoadState('networkidle')` before capture
- Add `waitForTimeout()` for animations
- Check viewport size is set correctly

### Visual Tests Failing Randomly
- Animations may not be consistent
- Increase wait times
- Use `test.slow()` for slower tests

### Missing Screenshots
- Check `test-results/screenshots/` directory exists
- Ensure tests are running with `visual` project
- Verify file paths are correct

### Snapshot Mismatches
- Review diff images in test report
- Update snapshots if changes are intentional:
  ```bash
  npx playwright test --update-snapshots
  ```

## Examples

### Capture Full Page
```typescript
test('should capture homepage', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await page.screenshot({
    path: 'test-results/screenshots/homepage.png',
    fullPage: true,
  })
})
```

### Capture Element
```typescript
test('should capture navigation', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('navigation')

  await nav.screenshot({
    path: 'test-results/screenshots/nav.png',
  })
})
```

### Capture Multiple States
```typescript
test('should capture button states', async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: 'Click Me' })

  // Normal
  await button.screenshot({ path: 'button-normal.png' })

  // Hover
  await button.hover()
  await button.screenshot({ path: 'button-hover.png' })

  // Focus
  await button.focus()
  await button.screenshot({ path: 'button-focus.png' })
})
```

## Visual Documentation

Screenshots serve multiple purposes:
1. **Visual Regression** - Detect unintended visual changes
2. **Documentation** - Show what the site looks like
3. **Design Review** - Share with stakeholders
4. **Bug Reports** - Attach to issues
5. **Onboarding** - Help new developers understand UI

## Next Steps

1. **Run visual tests regularly** - Catch visual regressions early
2. **Review screenshots** - Ensure quality and accuracy
3. **Update baselines** - When designs change intentionally
4. **Share screenshots** - Use in documentation and presentations
5. **Automate** - Integrate into CI/CD pipeline

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Screenshot API](https://playwright.dev/docs/screenshots)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Best Practices](https://playwright.dev/docs/best-practices)
