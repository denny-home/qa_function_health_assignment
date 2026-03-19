const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button.submit-btn'); // fixed locator
  }

  async navigate() {
    await this.page.goto('/');
  }

  async gotoHome(testUrl=null) {
    logger.log('gotoHome.testUrl=',testUrl);
    await this.page.goto(testUrl);
    await this.verifyUserLoggedIn();
  }

  async login(email, password) {
    logger.log('email=',email,' pass=',password);
    try {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
    } catch (error) {
      logger.error(`❌ Login failed!`);
      throw error;
    }
  }

  async verifyUserLoggedIn(buttonText = 'Home', timeout = 5000) {
    logger.log('verifyUserLoggedIn');

    try {
      const signOutButton = this.page.getByText(buttonText, { exact: true });

      await expect(signOutButton).toBeVisible({ timeout });
      await expect(signOutButton).toHaveText(buttonText);

      // ✅ Handle optional "Accept" button safely
      const acceptButton = this.page.getByText('Accept', { exact: true });

      if (await acceptButton.isVisible().catch(() => false)) {
        logger.debug('👉 "Accept" button detected, clicking...');
        await acceptButton.click({ timeout });
      } else {
        logger.debug('👉 "Accept" button not present, skipping...');
      }

    } catch (error) {
      logger.error(`${buttonText} not visible within ${timeout}ms`);
      throw error;
    }

    logger.debug(`⚠️ Waiting ${timeout}ms for server to stabilize...`);
    await this.page.waitForTimeout(timeout);

    logger.success("✅ Login successful!");
  }

  /**
 * Verify the Sign Out button is visible on the page
 * @param {number} timeout - Maximum wait time in milliseconds
 */
async verifySignOut(timeout = 5000) {
  logger.debug(`[verifySignOut] Checking visibility of Sign Out button (timeout=${timeout}ms)`);

  const signOutButton = this.page.getByRole('button', { name: /sign\s*out/i });

  try {
    await expect(signOutButton).toBeVisible({ timeout });
    logger.success('Sign Out button is visible');
  } catch (error) {
    logger.error(`Sign Out button not visible within ${timeout}ms`);
    throw error;
  }
}

  async verifySignOutCaseInsensitive(timeout = 5000) {
    try {
      const signOutButton = this.page.getByText('Sign Out', { exact: true, matchCase: false });
      await expect(signOutButton).toBeVisible({ timeout });
      await expect(signOutButton).toHaveText(/sign out/i); // regex for extra safety
      logger.success('Sign Out button is visible');
    } catch (error) {
        logger.error(`❌ Sign Out button not visible within ${timeout}ms`);
      throw error;
    }
  }
  async verifyTextOnPage(expectedText, options = {}) {
    const { timeout = 5000, exactMatch = true } = options;
    logger.debug('verifyTextOnPage.expectedText=',expectedText, ' timeout=',timeout,' exactMatch=',exactMatch);
    // Prepare selector
    const selector = exactMatch ? `text="${expectedText}"` : `text=${expectedText}`;
    const locator = this.page.locator(selector).first();
    try {
      // Wait dynamically for the element to be visible
      await locator.waitFor({ state: 'visible', timeout: timeout });
      // Log success
      logger.success(`✅ Text "${expectedText}" is displayed on the page. URL: ${this.page.url()}`);
    } catch (error) {
      logger.error(`❌ Text "${expectedText}" NOT found on the page within ${timeout}ms. URL: ${this.page.url()}`);
      throw error; // Rethrow so test fails
    }
  }

  async verifyLoginError(expectedMessage = 'The username/password combination is invalid.', timeout=5000) {
    try {
      // Wait for the toast message to appear
        await this.page.waitForTimeout(1000); // allow UI animation
      const errorLocator = this.page.locator('div.toast');
      await errorLocator.waitFor({ state: 'visible', timeout: timeout });

      // Get the text content safely
      const errorText = (await errorLocator.textContent())?.trim() || '';
      logger.debug('ActualErrorText=',errorText);
      logger.debug('ExpectMessage=',expectedMessage);

      if (errorText === expectedMessage) {
        logger.log(`✅ Login error verified successfully: "${errorText}"`);
      } else {
        logger.warn(`⚠️ Login error mismatch. Expected: "${expectedMessage}", Got: "${errorText || 'none'}"`);
      }
      // Assert it is visible (optional for Playwright test assertions)
      await expect(errorLocator).toBeVisible();
      // Assert text matches expected message
      await expect(errorLocator).toHaveText(expectedMessage);
    } catch (err) {
      logger.error('❌ Login error not found or toast did not appear in time.', err);
      throw err; // rethrow so test fails
    }
  }

  async logout(timeout=5000) {
    const logoutButton = this.page.getByRole('button', { name: 'Sign out' });
    await logoutButton.waitFor({ state: 'visible', timeout: timeout });
    await logoutButton.click();
    // Verify login page appears again
    await this.page.waitForURL(/login|sign-in/, { timeout: timeout });
    logger.success('✅ User logged out and returned to login page.');
  }
}

module.exports = LoginPage;