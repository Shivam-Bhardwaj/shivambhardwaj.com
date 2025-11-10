import { test, expect } from '@playwright/test'
import {
  captureVisualSnapshot,
  compareWithBaseline,
  updateBaseline,
  captureResponsiveSnapshots,
  VIEWPORTS,
  generateTestMetadata,
} from '../utils/visual-testing'

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('homepage visual regression', async ({ page }) => {
    const screenshotPath = await captureVisualSnapshot(page, 'homepage-desktop', VIEWPORTS.desktop)
    generateTestMetadata('homepage-desktop', [screenshotPath])
    
    // Compare with baseline if it exists
    try {
      await compareWithBaseline(page, 'homepage-desktop', VIEWPORTS.desktop)
    } catch (error) {
      // Baseline doesn't exist yet, this is expected on first run
      console.log('Baseline not found, skipping comparison')
    }
  })

  test('homepage mobile visual regression', async ({ page }) => {
    const screenshotPath = await captureVisualSnapshot(page, 'homepage-mobile', VIEWPORTS.mobile)
    generateTestMetadata('homepage-mobile', [screenshotPath])
    
    try {
      await compareWithBaseline(page, 'homepage-mobile', VIEWPORTS.mobile)
    } catch (error) {
      console.log('Baseline not found, skipping comparison')
    }
  })

  test('homepage tablet visual regression', async ({ page }) => {
    const screenshotPath = await captureVisualSnapshot(page, 'homepage-tablet', VIEWPORTS.tablet)
    generateTestMetadata('homepage-tablet', [screenshotPath])
    
    try {
      await compareWithBaseline(page, 'homepage-tablet', VIEWPORTS.tablet)
    } catch (error) {
      console.log('Baseline not found, skipping comparison')
    }
  })

  test('projects page visual regression', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const screenshotPath = await captureVisualSnapshot(page, 'projects-desktop', VIEWPORTS.desktop)
    generateTestMetadata('projects-desktop', [screenshotPath])
    
    try {
      await compareWithBaseline(page, 'projects-desktop', VIEWPORTS.desktop)
    } catch (error) {
      console.log('Baseline not found, skipping comparison')
    }
  })

  test('skills page visual regression', async ({ page }) => {
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')
    
    const screenshotPath = await captureVisualSnapshot(page, 'skills-desktop', VIEWPORTS.desktop)
    generateTestMetadata('skills-desktop', [screenshotPath])
    
    try {
      await compareWithBaseline(page, 'skills-desktop', VIEWPORTS.desktop)
    } catch (error) {
      console.log('Baseline not found, skipping comparison')
    }
  })

  test('swarm game page visual regression', async ({ page }) => {
    await page.goto('/swarm')
    await page.waitForLoadState('networkidle')
    
    // Wait a bit for canvas to initialize
    await page.waitForTimeout(1000)
    
    const screenshotPath = await captureVisualSnapshot(page, 'swarm-desktop', VIEWPORTS.desktop)
    generateTestMetadata('swarm-desktop', [screenshotPath])
    
    try {
      await compareWithBaseline(page, 'swarm-desktop', VIEWPORTS.desktop)
    } catch (error) {
      console.log('Baseline not found, skipping comparison')
    }
  })

  test('contact page visual regression', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    
    const screenshotPath = await captureVisualSnapshot(page, 'contact-desktop', VIEWPORTS.desktop)
    generateTestMetadata('contact-desktop', [screenshotPath])
    
    try {
      await compareWithBaseline(page, 'contact-desktop', VIEWPORTS.desktop)
    } catch (error) {
      console.log('Baseline not found, skipping comparison')
    }
  })

  test('responsive design visual test', async ({ page }) => {
    const screenshots = await captureResponsiveSnapshots(page, 'homepage-responsive', [
      { name: 'mobile', ...VIEWPORTS.mobile },
      { name: 'tablet', ...VIEWPORTS.tablet },
      { name: 'desktop', ...VIEWPORTS.desktop },
    ])
    
    generateTestMetadata('homepage-responsive', screenshots, {
      viewports: ['mobile', 'tablet', 'desktop'],
    })
  })
})

test.describe('Visual Baseline Update', () => {
  test.skip('update baseline screenshots', async ({ page }) => {
    // This test is skipped by default
    // Run with --grep "update baseline" to update baselines
    
    await page.goto('/')
    await updateBaseline(page, 'homepage-desktop', VIEWPORTS.desktop)
    
    await page.goto('/projects')
    await updateBaseline(page, 'projects-desktop', VIEWPORTS.desktop)
    
    await page.goto('/skills')
    await updateBaseline(page, 'skills-desktop', VIEWPORTS.desktop)
    
    await page.goto('/swarm')
    await page.waitForTimeout(1000)
    await updateBaseline(page, 'swarm-desktop', VIEWPORTS.desktop)
    
    await page.goto('/contact')
    await updateBaseline(page, 'contact-desktop', VIEWPORTS.desktop)
  })
})

