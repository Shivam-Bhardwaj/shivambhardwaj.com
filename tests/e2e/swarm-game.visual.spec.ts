import { test, expect } from '@playwright/test'

/**
 * Visual regression tests for Swarm Game
 * These tests capture screenshots of the interactive swarm robotics simulation
 */
test.describe('Swarm Game Visual Tests', () => {
  test('should capture initial game state', async ({ page }) => {
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Capture full page with initial game state
    await page.screenshot({
      path: 'test-results/screenshots/swarm-initial-state.png',
      fullPage: true,
    })

    expect(await page.screenshot()).toMatchSnapshot('swarm-game-initial.png')
  })

  test('should capture canvas with default robot count', async ({ page }) => {
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Capture just the canvas
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()

    await canvas.screenshot({
      path: 'test-results/screenshots/swarm-canvas-default.png',
    })
  })

  test('should capture game states with different robot counts', async ({ page }) => {
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')

    const slider = page.getByRole('slider')
    const canvas = page.locator('canvas')

    // Capture with minimum robots (5)
    await slider.fill('5')
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/screenshots/swarm-5-robots.png',
      fullPage: true,
    })

    // Capture with medium robots (25)
    await slider.fill('25')
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/screenshots/swarm-25-robots.png',
      fullPage: true,
    })

    // Capture with maximum robots (50)
    await slider.fill('50')
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/screenshots/swarm-50-robots.png',
      fullPage: true,
    })
  })

  test('should capture game in action - swarm movement', async ({ page }) => {
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')

    const canvas = page.locator('canvas')

    // Set to 20 robots for clear visualization
    await page.getByRole('slider').fill('20')
    await page.waitForTimeout(500)

    // Capture before click
    await page.screenshot({
      path: 'test-results/screenshots/swarm-before-click.png',
      fullPage: true,
    })

    // Click to set target
    await canvas.click({ position: { x: 300, y: 200 } })
    await page.waitForTimeout(500)

    // Capture immediately after click (swarm should start moving)
    await page.screenshot({
      path: 'test-results/screenshots/swarm-movement-start.png',
      fullPage: true,
    })

    // Capture mid-movement
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: 'test-results/screenshots/swarm-movement-mid.png',
      fullPage: true,
    })

    // Capture after convergence
    await page.waitForTimeout(2000)
    await page.screenshot({
      path: 'test-results/screenshots/swarm-movement-converged.png',
      fullPage: true,
    })
  })

  test('should capture multiple target changes', async ({ page }) => {
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')

    const canvas = page.locator('canvas')

    // Set to 15 robots
    await page.getByRole('slider').fill('15')
    await page.waitForTimeout(500)

    // First target - top left
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: 'test-results/screenshots/swarm-target-1.png',
      fullPage: true,
    })

    // Second target - bottom right
    await canvas.click({ position: { x: 500, y: 300 } })
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: 'test-results/screenshots/swarm-target-2.png',
      fullPage: true,
    })

    // Third target - center
    await canvas.click({ position: { x: 300, y: 200 } })
    await page.waitForTimeout(1500)
    await page.screenshot({
      path: 'test-results/screenshots/swarm-target-3.png',
      fullPage: true,
    })
  })

  test('should capture UI controls in detail', async ({ page }) => {
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')

    // Capture the slider control area
    const controlsArea = page.locator('.flex.flex-col.items-center').first()
    await expect(controlsArea).toBeVisible()

    await controlsArea.screenshot({
      path: 'test-results/screenshots/swarm-controls.png',
    })

    // Capture the slider at different positions
    const slider = page.getByRole('slider')

    await slider.fill('10')
    await slider.screenshot({
      path: 'test-results/screenshots/swarm-slider-10.png',
    })

    await slider.fill('30')
    await slider.screenshot({
      path: 'test-results/screenshots/swarm-slider-30.png',
    })

    await slider.fill('50')
    await slider.screenshot({
      path: 'test-results/screenshots/swarm-slider-50.png',
    })
  })

  test('should capture timer display during game', async ({ page }) => {
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')

    const canvas = page.locator('canvas')

    // Capture timer at start (0.0s)
    const timerDisplay = page.getByText(/Time: \d+\.\d+s/)
    await expect(timerDisplay).toBeVisible()

    await timerDisplay.screenshot({
      path: 'test-results/screenshots/swarm-timer-0.png',
    })

    // Start game and capture timer after 1 second
    await canvas.click({ position: { x: 300, y: 200 } })
    await page.waitForTimeout(1000)

    await timerDisplay.screenshot({
      path: 'test-results/screenshots/swarm-timer-1.png',
    })

    // Capture timer after 3 seconds
    await page.waitForTimeout(2000)

    await timerDisplay.screenshot({
      path: 'test-results/screenshots/swarm-timer-3.png',
    })
  })

  test('should capture mobile viewport game', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Capture mobile view
    await page.screenshot({
      path: 'test-results/screenshots/swarm-mobile.png',
      fullPage: true,
    })

    const canvas = page.locator('canvas')
    await canvas.click({ position: { x: 200, y: 150 } })
    await page.waitForTimeout(1500)

    // Capture mobile game in action
    await page.screenshot({
      path: 'test-results/screenshots/swarm-mobile-active.png',
      fullPage: true,
    })

    expect(await page.screenshot()).toMatchSnapshot('swarm-mobile.png')
  })

  test('should capture tablet viewport game', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/swarm-tablet.png',
      fullPage: true,
    })
  })

  test('should capture desktop ultra-wide viewport', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 })
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/swarm-ultrawide.png',
      fullPage: true,
    })
  })

  test('should capture game state during reset', async ({ page }) => {
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')

    const canvas = page.locator('canvas')
    const slider = page.getByRole('slider')

    // Start game
    await slider.fill('20')
    await canvas.click({ position: { x: 300, y: 200 } })
    await page.waitForTimeout(1000)

    // Capture active state
    await page.screenshot({
      path: 'test-results/screenshots/swarm-before-reset.png',
      fullPage: true,
    })

    // Change robot count to trigger reset
    await slider.fill('30')
    await page.waitForTimeout(500)

    // Capture reset state
    await page.screenshot({
      path: 'test-results/screenshots/swarm-after-reset.png',
      fullPage: true,
    })

    // Verify timer reset
    await expect(page.getByText('Time: 0.0s')).toBeVisible()
  })

  test('should capture edge case - maximum robots stress test', async ({ page }) => {
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')

    const slider = page.getByRole('slider')
    const canvas = page.locator('canvas')

    // Set to maximum
    await slider.fill('50')
    await page.waitForTimeout(500)

    // Capture initial max state
    await page.screenshot({
      path: 'test-results/screenshots/swarm-max-robots-initial.png',
      fullPage: true,
    })

    // Start swarm movement
    await canvas.click({ position: { x: 300, y: 200 } })
    await page.waitForTimeout(2000)

    // Capture max robots in motion
    await page.screenshot({
      path: 'test-results/screenshots/swarm-max-robots-motion.png',
      fullPage: true,
    })
  })
})
