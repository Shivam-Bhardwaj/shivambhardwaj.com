import { Page, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Visual testing utilities for server-based e2e testing
 * Screenshots are stored in public/test-results for web access
 */

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const TEST_RESULTS_DIR = path.join(PUBLIC_DIR, 'test-results')
const BASELINE_DIR = path.join(process.cwd(), 'tests', 'e2e', 'screenshots', 'baseline')

/**
 * Ensure test results directory exists
 */
export function ensureTestResultsDir(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
  const runDir = path.join(TEST_RESULTS_DIR, timestamp)
  
  if (!fs.existsSync(runDir)) {
    fs.mkdirSync(runDir, { recursive: true })
  }
  
  return runDir
}

/**
 * Ensure baseline directory exists
 */
export function ensureBaselineDir(): string {
  if (!fs.existsSync(BASELINE_DIR)) {
    fs.mkdirSync(BASELINE_DIR, { recursive: true })
  }
  return BASELINE_DIR
}

/**
 * Generate a safe filename from test name
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .substring(0, 100)
}

/**
 * Capture a full-page screenshot and save to public directory
 */
export async function captureVisualSnapshot(
  page: Page,
  testName: string,
  viewport?: { width: number; height: number }
): Promise<string> {
  const runDir = ensureTestResultsDir()
  const fileName = `${sanitizeFileName(testName)}.png`
  const filePath = path.join(runDir, fileName)
  
  // Set viewport if provided
  if (viewport) {
    await page.setViewportSize(viewport)
  }
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle')
  
  // Capture screenshot
  await page.screenshot({
    path: filePath,
    fullPage: true,
  })
  
  // Return web-accessible path
  const relativePath = path.relative(PUBLIC_DIR, filePath)
  return `/${relativePath.replace(/\\/g, '/')}`
}

/**
 * Capture screenshot of a specific element
 */
export async function captureElementSnapshot(
  page: Page,
  selector: string,
  testName: string
): Promise<string> {
  const runDir = ensureTestResultsDir()
  const fileName = `${sanitizeFileName(testName)}-${sanitizeFileName(selector)}.png`
  const filePath = path.join(runDir, fileName)
  
  const element = page.locator(selector)
  await element.waitFor({ state: 'visible' })
  
  await element.screenshot({
    path: filePath,
  })
  
  const relativePath = path.relative(PUBLIC_DIR, filePath)
  return `/${relativePath.replace(/\\/g, '/')}`
}

/**
 * Compare current screenshot with baseline
 */
export async function compareWithBaseline(
  page: Page,
  testName: string,
  viewport?: { width: number; height: number }
): Promise<void> {
  ensureBaselineDir()
  
  if (viewport) {
    await page.setViewportSize(viewport)
  }
  
  await page.waitForLoadState('networkidle')
  
  // Use Playwright's built-in visual comparison
  await expect(page).toHaveScreenshot(`${sanitizeFileName(testName)}.png`, {
    fullPage: true,
  })
}

/**
 * Update baseline screenshot
 */
export async function updateBaseline(
  page: Page,
  testName: string,
  viewport?: { width: number; height: number }
): Promise<void> {
  const baselineDir = ensureBaselineDir()
  const fileName = `${sanitizeFileName(testName)}.png`
  const filePath = path.join(baselineDir, fileName)
  
  if (viewport) {
    await page.setViewportSize(viewport)
  }
  
  await page.waitForLoadState('networkidle')
  
  await page.screenshot({
    path: filePath,
    fullPage: true,
  })
}

/**
 * Capture screenshots for multiple viewports
 */
export async function captureResponsiveSnapshots(
  page: Page,
  testName: string,
  viewports: Array<{ name: string; width: number; height: number }>
): Promise<string[]> {
  const screenshots: string[] = []
  
  for (const viewport of viewports) {
    const screenshotPath = await captureVisualSnapshot(
      page,
      `${testName}-${viewport.name}`,
      { width: viewport.width, height: viewport.height }
    )
    screenshots.push(screenshotPath)
  }
  
  return screenshots
}

/**
 * Generate test result metadata JSON
 */
export function generateTestMetadata(
  testName: string,
  screenshots: string[],
  metadata?: Record<string, any>
): void {
  const runDir = ensureTestResultsDir()
  const metaFile = path.join(runDir, 'metadata.json')
  
  const existingMeta = fs.existsSync(metaFile)
    ? JSON.parse(fs.readFileSync(metaFile, 'utf-8'))
    : { tests: [] }
  
  existingMeta.tests.push({
    name: testName,
    timestamp: new Date().toISOString(),
    screenshots,
    ...metadata,
  })
  
  fs.writeFileSync(metaFile, JSON.stringify(existingMeta, null, 2))
}

/**
 * Standard viewport sizes for responsive testing
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  desktopLarge: { width: 2560, height: 1440 },
} as const

