import { test, expect } from '@playwright/test'
import {
  captureVisualSnapshot,
  generateTestMetadata,
  VIEWPORTS,
} from '../utils/visual-testing'

test.describe('Critical Paths Visual Tests', () => {
  test('homepage to projects flow', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const homepageScreenshot = await captureVisualSnapshot(
      page,
      'critical-homepage',
      VIEWPORTS.desktop
    )
    
    // Click on projects link
    await page.getByRole('link', { name: /projects/i }).first().click()
    await page.waitForLoadState('networkidle')
    
    const projectsScreenshot = await captureVisualSnapshot(
      page,
      'critical-projects',
      VIEWPORTS.desktop
    )
    
    generateTestMetadata('homepage-to-projects', [homepageScreenshot, projectsScreenshot], {
      flow: 'homepage -> projects',
    })
  })

  test('homepage to skills flow', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const homepageScreenshot = await captureVisualSnapshot(
      page,
      'critical-homepage-skills',
      VIEWPORTS.desktop
    )
    
    await page.getByRole('link', { name: /skills/i }).first().click()
    await page.waitForLoadState('networkidle')
    
    const skillsScreenshot = await captureVisualSnapshot(
      page,
      'critical-skills',
      VIEWPORTS.desktop
    )
    
    generateTestMetadata('homepage-to-skills', [homepageScreenshot, skillsScreenshot], {
      flow: 'homepage -> skills',
    })
  })

  test('homepage to swarm game flow', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const homepageScreenshot = await captureVisualSnapshot(
      page,
      'critical-homepage-swarm',
      VIEWPORTS.desktop
    )
    
    await page.getByRole('link', { name: /swarm/i }).first().click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait for canvas
    
    const swarmScreenshot = await captureVisualSnapshot(
      page,
      'critical-swarm',
      VIEWPORTS.desktop
    )
    
    generateTestMetadata('homepage-to-swarm', [homepageScreenshot, swarmScreenshot], {
      flow: 'homepage -> swarm',
    })
  })

  test('navigation flow across all pages', async ({ page }) => {
    const pages = [
      { path: '/', name: 'home' },
      { path: '/projects', name: 'projects' },
      { path: '/skills', name: 'skills' },
      { path: '/swarm', name: 'swarm' },
      { path: '/contact', name: 'contact' },
    ]
    
    const screenshots: string[] = []
    
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path)
      await page.waitForLoadState('networkidle')
      
      if (pageInfo.path === '/swarm') {
        await page.waitForTimeout(1000)
      }
      
      const screenshot = await captureVisualSnapshot(
        page,
        `critical-${pageInfo.name}`,
        VIEWPORTS.desktop
      )
      screenshots.push(screenshot)
    }
    
    generateTestMetadata('full-navigation-flow', screenshots, {
      pages: pages.map(p => p.name),
    })
  })

  test('mobile critical path', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const mobileHomepage = await captureVisualSnapshot(
      page,
      'critical-mobile-homepage',
      VIEWPORTS.mobile
    )
    
    await page.getByRole('link', { name: /projects/i }).first().click()
    await page.waitForLoadState('networkidle')
    
    const mobileProjects = await captureVisualSnapshot(
      page,
      'critical-mobile-projects',
      VIEWPORTS.mobile
    )
    
    generateTestMetadata('mobile-critical-path', [mobileHomepage, mobileProjects], {
      flow: 'mobile homepage -> projects',
    })
  })
})

