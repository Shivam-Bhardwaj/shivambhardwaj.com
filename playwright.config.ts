import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html', { outputFolder: './tests/reports/playwright-html-report' }],
    ['junit', { outputFile: './tests/reports/junit-results.xml' }],
    ['json', { outputFile: './tests/reports/test-results.json' }],
    ...(process.env.CI ? [] : [['list'] as const])
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.CI ? true : false,
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  ...(process.env.CI ? {} : {
    webServer: {
      command: 'npm run build && npm run start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  }),

  // Performance testing configuration
  expect: {
    timeout: 10 * 1000,
  },

  timeout: 30 * 1000,
  globalTimeout: 10 * 60 * 1000,

  // Global setup and teardown
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',

  // Output directories
  outputDir: './tests/reports/playwright-artifacts',
  
  // Metadata for reporting
  metadata: {
    'Test Environment': process.env.NODE_ENV || 'development',
    'Base URL': process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    'CI': process.env.CI || 'false',
  },
});