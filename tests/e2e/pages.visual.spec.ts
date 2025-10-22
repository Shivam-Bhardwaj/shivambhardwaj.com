import { test, expect } from '@playwright/test'

/**
 * Visual regression tests for all pages
 * Captures screenshots of Projects, Experience, Skills, and Contact pages
 */
test.describe('Projects Page Visual Tests', () => {
  test('should capture projects page - desktop', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/projects-desktop.png',
      fullPage: true,
    })

    expect(await page.screenshot()).toMatchSnapshot('projects-page.png')
  })

  test('should capture projects page - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/projects-mobile.png',
      fullPage: true,
    })
  })

  test('should capture individual project cards', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Find all project cards
    const projectCards = page.locator('[class*="card"], article, [role="article"]').first()
    const cardCount = await projectCards.count()

    if (cardCount > 0) {
      // Capture first project card
      await projectCards.screenshot({
        path: 'test-results/screenshots/project-card-example.png',
      })
    }
  })

  test('should capture project card hover states', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectCards = page.locator('[class*="card"], article').first()
    const cardCount = await projectCards.count()

    if (cardCount > 0) {
      // Normal state
      await projectCards.screenshot({
        path: 'test-results/screenshots/project-card-normal.png',
      })

      // Hover state
      await projectCards.hover()
      await page.waitForTimeout(500)

      await projectCards.screenshot({
        path: 'test-results/screenshots/project-card-hover.png',
      })
    }
  })
})

test.describe('Experience Page Visual Tests', () => {
  test('should capture experience page - desktop', async ({ page }) => {
    await page.goto('/experience')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/experience-desktop.png',
      fullPage: true,
    })

    expect(await page.screenshot()).toMatchSnapshot('experience-page.png')
  })

  test('should capture experience page - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/experience')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/experience-mobile.png',
      fullPage: true,
    })
  })

  test('should capture timeline visualization', async ({ page }) => {
    await page.goto('/experience')
    await page.waitForLoadState('networkidle')

    // Look for timeline or experience card elements
    const timeline = page.locator('[class*="timeline"], [class*="experience"]').first()
    const timelineCount = await timeline.count()

    if (timelineCount > 0) {
      await timeline.screenshot({
        path: 'test-results/screenshots/experience-timeline.png',
      })
    }
  })
})

test.describe('Skills Page Visual Tests', () => {
  test('should capture skills page - desktop', async ({ page }) => {
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/skills-desktop.png',
      fullPage: true,
    })

    expect(await page.screenshot()).toMatchSnapshot('skills-page.png')
  })

  test('should capture skills page - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/skills-mobile.png',
      fullPage: true,
    })
  })

  test('should capture skill categories', async ({ page }) => {
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')

    // Look for skill category sections
    const skillSection = page.locator('[class*="skill"], section').first()
    const sectionCount = await skillSection.count()

    if (sectionCount > 0) {
      await skillSection.screenshot({
        path: 'test-results/screenshots/skills-category.png',
      })
    }
  })

  test('should capture skills grid layout', async ({ page }) => {
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')

    // Capture just the skills grid area
    const skillsGrid = page.locator('[class*="grid"], main').first()
    const gridCount = await skillsGrid.count()

    if (gridCount > 0) {
      await skillsGrid.screenshot({
        path: 'test-results/screenshots/skills-grid.png',
      })
    }
  })
})

test.describe('Contact Page Visual Tests', () => {
  test('should capture contact page - desktop', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/contact-desktop.png',
      fullPage: true,
    })

    expect(await page.screenshot()).toMatchSnapshot('contact-page.png')
  })

  test('should capture contact page - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/screenshots/contact-mobile.png',
      fullPage: true,
    })
  })

  test('should capture contact form or links', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')

    // Look for contact form or social links
    const contactArea = page.locator('form, [class*="contact"], main').first()
    const areaCount = await contactArea.count()

    if (areaCount > 0) {
      await contactArea.screenshot({
        path: 'test-results/screenshots/contact-form.png',
      })
    }
  })
})

test.describe('Cross-page Visual Consistency', () => {
  test('should capture navigation across all pages', async ({ page }) => {
    const pages = ['/', '/projects', '/experience', '/skills', '/swarm', '/contact']

    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      const nav = page.getByRole('navigation')
      await expect(nav).toBeVisible()

      const pageName = pagePath === '/' ? 'home' : pagePath.slice(1)
      await nav.screenshot({
        path: `test-results/screenshots/nav-${pageName}.png`,
      })
    }
  })

  test('should capture footer across all pages', async ({ page }) => {
    const pages = ['/', '/projects', '/experience', '/skills', '/swarm', '/contact']

    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      // Look for footer element
      const footer = page.locator('footer, [role="contentinfo"]').first()
      const footerCount = await footer.count()

      if (footerCount > 0) {
        const pageName = pagePath === '/' ? 'home' : pagePath.slice(1)
        await footer.screenshot({
          path: `test-results/screenshots/footer-${pageName}.png`,
        })
      }
    }
  })

  test('should capture all pages in tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    const pages = [
      { path: '/', name: 'home' },
      { path: '/projects', name: 'projects' },
      { path: '/experience', name: 'experience' },
      { path: '/skills', name: 'skills' },
      { path: '/swarm', name: 'swarm' },
      { path: '/contact', name: 'contact' },
    ]

    for (const { path, name } of pages) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      await page.screenshot({
        path: `test-results/screenshots/${name}-tablet.png`,
        fullPage: true,
      })
    }
  })
})
