import { test, expect } from '@playwright/test'

/**
 * Visual regression tests for Homepage
 * These tests capture screenshots for visual documentation and regression testing
 */
test.describe('Homepage Visual Tests', () => {
  test('should capture full page screenshot - desktop', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for animations to settle
    await page.waitForTimeout(1000)

    // Capture full page screenshot
    await page.screenshot({
      path: 'test-results/screenshots/homepage-desktop-full.png',
      fullPage: true,
    })

    expect(await page.screenshot()).toMatchSnapshot('homepage-desktop.png')
  })

  test('should capture above-the-fold content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Capture viewport screenshot (above the fold)
    await page.screenshot({
      path: 'test-results/screenshots/homepage-above-fold.png',
    })

    // Verify hero section is visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should capture mobile viewport - portrait', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/homepage-mobile-portrait.png',
      fullPage: true,
    })

    expect(await page.screenshot()).toMatchSnapshot('homepage-mobile.png')
  })

  test('should capture tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/homepage-tablet.png',
      fullPage: true,
    })
  })

  test('should capture navigation menu', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Capture navigation area
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()

    await nav.screenshot({
      path: 'test-results/screenshots/navigation.png',
    })
  })

  test('should capture typewriter animation states', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Capture initial state
    await page.screenshot({
      path: 'test-results/screenshots/typewriter-state-1.png',
    })

    // Wait for animation to progress
    await page.waitForTimeout(2000)

    // Capture mid-animation state
    await page.screenshot({
      path: 'test-results/screenshots/typewriter-state-2.png',
    })

    // Wait for next cycle
    await page.waitForTimeout(3000)

    // Capture next state
    await page.screenshot({
      path: 'test-results/screenshots/typewriter-state-3.png',
    })
  })

  test('should capture hover states for interactive elements', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find "View Projects" button
    const projectsButton = page.getByRole('link', { name: 'View Projects' })
    await expect(projectsButton).toBeVisible()

    // Capture normal state
    await projectsButton.screenshot({
      path: 'test-results/screenshots/button-normal.png',
    })

    // Hover and capture hover state
    await projectsButton.hover()
    await page.waitForTimeout(500)

    await projectsButton.screenshot({
      path: 'test-results/screenshots/button-hover.png',
    })
  })

  test('should capture dark mode vs light mode comparison', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Capture light mode (default)
    await page.screenshot({
      path: 'test-results/screenshots/homepage-light-mode.png',
      fullPage: true,
    })

    // Toggle to dark mode (if theme toggle exists)
    const themeToggle = page.locator('[aria-label*="theme" i], [aria-label*="dark" i], button:has-text("Theme")')
    const themeToggleCount = await themeToggle.count()

    if (themeToggleCount > 0) {
      await themeToggle.first().click()
      await page.waitForTimeout(500)

      // Capture dark mode
      await page.screenshot({
        path: 'test-results/screenshots/homepage-dark-mode.png',
        fullPage: true,
      })
    }
  })

  test('should capture scroll behavior', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Top of page
    await page.screenshot({
      path: 'test-results/screenshots/scroll-top.png',
    })

    // Scroll to middle
    await page.evaluate(() => window.scrollBy(0, window.innerHeight))
    await page.waitForTimeout(500)

    await page.screenshot({
      path: 'test-results/screenshots/scroll-middle.png',
    })

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    await page.screenshot({
      path: 'test-results/screenshots/scroll-bottom.png',
    })
  })
})

test.describe('Navigation Visual Tests', () => {
  test('should capture active navigation states', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Home active state
    await page.screenshot({
      path: 'test-results/screenshots/nav-home-active.png',
    })

    // Navigate to projects
    await page.getByRole('link', { name: 'Projects' }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Projects active state
    await page.screenshot({
      path: 'test-results/screenshots/nav-projects-active.png',
    })
  })
})
