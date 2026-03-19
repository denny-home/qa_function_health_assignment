const { defineConfig, devices } = require('@playwright/test');

// Default URLs for environments
const ENV = process.env.ENV || 'production';  // Set via ENV variable: dev, staging, production
const BASE_URLS = {
  dev: 'https://myezra-staging.ezra.com/',
  staging: 'https://staging-hub.ezra.com/',
  production: 'https://www.ezra.com',
};

const baseURL = process.env.BASE_URL || BASE_URLS[ENV];
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
module.exports = defineConfig({
  testDir: './tests',      // tests folder
  fullyParallel: true,     // run tests in parallel across files
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 600000, // 60 secs
  reporter: [
    ['html', { open: 'never', outputFolder: `func_health_report_${timestamp}`, embedScreenshots: true }],
    ['json', { outputFile: `test-results/results-${timestamp}.json` }],
    ['junit', { outputFile: `test-results/junit-${timestamp}.xml` }],
  ],
  use: {
    headless: false,
    baseURL: baseURL,
    slowMo: 250,          // slow down each action by 250ms
    headless: process.env.DEBUG !== 'true',
    viewport: { width: 1280, height: 720 },
    trace: 'retain-on-failure', // keep trace only if the test fails
    screenshot: 'only-on-failure', // optional: take screenshot only on failure
    // video: 'retain-on-failure', // optional: record video only if test fails
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
    // Example: add a mobile project
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 13'] },
    // },
  ],
});

/**
 * ✅ Usage Examples
 * Run on Dev Chrome
 *  ENV=dev npx playwright test --project=chromium
 * Run on Staging iPhone
 *  ENV=staging npx playwright test --project="firefox"
 * Run with Custom URL
 *  BASE_URL=https://custom.ezra.com npx playwright test
 * 
 * Since your config determines the URL with:

const ENV = process.env.ENV || 'production';

and staging is:

staging: 'https://staging-hub.ezra.com/'
Run basic.spec.js Against Staging
Run with Chromium (recommended for debugging)
ENV=staging npx playwright test tests/basic.spec.js --project=chromium
Run With All Browsers
ENV=staging npx playwright test tests/basic.spec.js

Playwright will run the script on:
Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari


============ USAGES =============
* ENV=staging npx playwright test tests/basic.spec.js --project=chromium --headed
* ENV=dev SLOW_MO=5000 DEBUG=true npx playwright test tests/login.spec.js
* ENV=dev SLOW_MO=5000 DEBUG=true npx playwright test tests/login.spec.js --project=chromium
 */