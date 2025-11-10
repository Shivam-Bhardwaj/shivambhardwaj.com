import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshots for all tests (visual testing) */
    screenshot: 'on',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Timeout for each action */
    actionTimeout: 30000,
    
    /* Navigation timeout */
    navigationTimeout: 30000,
    
    /* Headless mode for server environment */
    headless: true,
  },

  /* Configure projects for major browsers */
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

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },

    /* Performance testing configuration */
    {
      name: 'performance',
      testMatch: '**/*.performance.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        // Use Lighthouse for performance audits
        trace: 'on',
        video: 'on',
      },
    },

    /* Accessibility testing configuration */
    {
      name: 'accessibility',
      testMatch: '**/*.a11y.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    /* Visual testing configuration */
    {
      name: 'visual',
      testMatch: '**/*.visual.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        screenshot: 'on',
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),

  /* Test timeout */
  timeout: 60000,
  
  /* Expect timeout and visual comparison settings */
  expect: {
    timeout: 10000,
    /* Visual comparison threshold (0-1) */
    toHaveScreenshot: {
      threshold: 0.2,
    },
    toMatchSnapshot: {
      threshold: 0.2,
    },
  },

  /* Maximum test failures */
  maxFailures: process.env.CI ? 10 : undefined,

  /* Output directory for test artifacts */
  outputDir: 'test-results/',
})