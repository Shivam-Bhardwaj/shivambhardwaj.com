import { test, expect } from '@playwright/test'
import {
  captureVisualSnapshot,
  captureResponsiveSnapshots,
  VIEWPORTS,
  generateTestMetadata,
} from '../utils/visual-testing'

test.describe('Responsive Visual Tests', () => {
  test('homepage responsive breakpoints', async ({ page }) => {
    await page.goto('/')
    
    const screenshots = await captureResponsiveSnapshots(page, 'homepage-responsive', [
      { name: 'mobile', ...VIEWPORTS.mobile },
      { name: 'tablet', ...VIEWPORTS.tablet },
      { name: 'desktop', ...VIEWPORTS.desktop },
      { name: 'desktop-large', ...VIEWPORTS.desktopLarge },
    ])
    
    generateTestMetadata('homepage-responsive', screenshots, {
      viewports: ['mobile', 'tablet', 'desktop', 'desktop-large'],
    })
    
    // Verify page is responsive
    for (const viewport of [
      VIEWPORTS.mobile,
      VIEWPORTS.tablet,
      VIEWPORTS.desktop,
    ]) {
      await page.setViewportSize(viewport)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }
  })

  test('navigation responsive behavior', async ({ page }) => {
    await page.goto('/')
    
    // Test mobile navigation
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.waitForLoadState('networkidle')
    const mobileNav = await captureVisualSnapshot(page, 'navigation-mobile', VIEWPORTS.mobile)
    
    // Test desktop navigation
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.waitForLoadState('networkidle')
    const desktopNav = await captureVisualSnapshot(page, 'navigation-desktop', VIEWPORTS.desktop)
    
    generateTestMetadata('navigation-responsive', [mobileNav, desktopNav], {
      viewports: ['mobile', 'desktop'],
    })
  })

  test('projects page responsive', async ({ page }) => {
    await page.goto('/projects')
    
    const screenshots = await captureResponsiveSnapshots(page, 'projects-responsive', [
      { name: 'mobile', ...VIEWPORTS.mobile },
      { name: 'tablet', ...VIEWPORTS.tablet },
      { name: 'desktop', ...VIEWPORTS.desktop },
    ])
    
    generateTestMetadata('projects-responsive', screenshots)
  })

  test('skills page responsive', async ({ page }) => {
    await page.goto('/skills')
    
    const screenshots = await captureResponsiveSnapshots(page, 'skills-responsive', [
      { name: 'mobile', ...VIEWPORTS.mobile },
      { name: 'desktop', ...VIEWPORTS.desktop },
    ])
    
    generateTestMetadata('skills-responsive', screenshots)
  })
})

