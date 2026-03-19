const { test: base, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const test = base.extend({});

test.afterEach(async ({ page }, testInfo) => {

  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    fs.mkdirSync(screenshotsDir, { recursive: true });
    const safeTitle = testInfo.title.replace(/[^\w\d]+/g, '_');
    const filePath = path.join(
      screenshotsDir,
      `${safeTitle}_${testInfo.project.name}_${Date.now()}.png`
    );
    await page.screenshot({path: filePath,fullPage: true});
    console.log(`📸 Screenshot captured: ${filePath}`);
  }

});

module.exports = { test, expect };
