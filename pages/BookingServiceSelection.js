const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { timeout } = require('../playwright.config');
const logger = require('../utils/logger');

class BookingServiceSelection {
  constructor(page) {
    this.page = page;
  }

   async gotoDashboard(testUrl,label='Home',timeout=500){
    logger.log('gotoDashboard.testUrl=',testUrl);
    await this.page.goto(testUrl);
    await this.verifyHomeByText(label=label);
  
  }
  async verifyHomeByText(expectedText='Home', timeout = 5000) {
    logger.log('verifyHomeByText.expectedText=',expectedText);
    try {
      const homeText = this.page.getByText(expectedText, { exact: true });
      await expect(homeText).toBeVisible({ timeout });
      await expect(homeText).toHaveText(expectedText);
    } catch (error) {
      logger.error(`❌ ${expectedText} not visible within ${timeout}ms`);
      throw error;
    }
  }

  async clickButtonByIndex(buttonName, index = 0, timeout = 10000) {
    const button = this.page.getByRole('button', { name: buttonName }).nth(index);
    await button.waitFor({ state: 'visible', timeout });
    await button.scrollIntoViewIfNeeded();
    await button.click();
  }

  async selectFirstNTimeSlots(n = 3) {
    // Locate all appointment divs
    const appointmentSlots = this.page.locator('.appointments__individual-appointment');

    // Wait until at least one slot is visible
    await expect(appointmentSlots.first()).toBeVisible({ timeout: 5000 });

    // Loop over the first n slots
    const count = await appointmentSlots.count();
    const limit = Math.min(n, count); // in case less than n slots are available
    for (let i = 0; i < limit; i++) {
      const slot = appointmentSlots.nth(i).locator('label');
      await slot.scrollIntoViewIfNeeded();
      await slot.click();
    }
  }

  /**
   * Select a cancellation reason from the cancel reason options
   * @param {string} reasonText - The visible text of the cancellation reason
   * @param {number} timeout - Timeout in milliseconds for UI waits (default 5000)
   */
  async selectCancelReason(reasonText, timeout = 5000) {
    logger.log(`[selectCancelReason] Selecting reason: "${reasonText}" with timeout=${timeout}`);

    try {
        // Locate the label by text
        const label = this.page.locator('.cancel-reason-buttons label', { hasText: reasonText, exact: true });

        // Wait for it to be visible
        await label.waitFor({ state: 'visible', timeout });

        // Click the label
        await label.click();

        // Optional verification: ensure corresponding input is checked
        const inputId = await label.getAttribute('for');
        if (inputId) {
            const inputLocator = this.page.locator(`#${inputId}`);
            await expect(inputLocator).toBeChecked({ timeout });
        }

        logger.success(`✅ Selected cancellation reason: "${reasonText}"`);
    } catch (error) {
        logger.error(`❌ Failed to select cancellation reason "${reasonText}": ${error.message}`);
        throw error;
    }
}
  /**
   * Click a button by its visible text and index
   * @param {string} buttonText - The visible text of the button
   * @param {number} index - The nth button to click (default 0)
   * @param {number} timeout - Timeout in milliseconds (default 500)
   */
  async clickButtonByTextNth(buttonText, index = 0, timeout = 500) {
    logger.log(`[clickButtonByTextNth] buttonText="${buttonText}", index=${index}, timeout=${timeout}`);

    // Get the button locator by role and index
    const button = this.page.getByRole('button', { name: buttonText }).nth(index);

    try {
      // Wait until button is visible
      await button.waitFor({ state: 'visible', timeout:timeout });
      // Ensure button is enabled
      const enabled = await button.isEnabled();
      if (!enabled) {
          throw new Error(`Button "${buttonText}" at index ${index} is disabled`);
      }

      // Scroll button into view if needed
      await button.scrollIntoViewIfNeeded();

      // Click the button
      await button.click();
      logger.success(`✅ Clicked "${buttonText}" button at index ${index}`);

    } catch (error) {
      logger.error(`❌ Failed to click "${buttonText}" button at index ${index}: ${error.message}`);
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
      await locator.waitFor({ state: 'visible', timeout:timeout });
      // Log success
      logger.success(`Text "${expectedText}" is displayed on the page. URL: ${this.page.url()}`);
    } catch (error) {
      logger.error(`Text "${expectedText}" NOT found on the page within ${timeout}ms. URL: ${this.page.url()}`);
      throw error; // Rethrow so test fails
    }
  }

  async bookingScan(options = { timeout: 500, cardInfo: null, email: 'test12345@email.com' }) {
    const { timeout, cardInfo, email } = options;
    logger.log("[bookingScan]: Starting scan booking, timeout=",timeout);
    logger.log("[bookingScan]: Starting scan booking, email=",email);
    logger.log("[bookingScan]: Starting scan booking, cardInfo=",cardInfo);

    // 1 Click "Book a scan" button
    await this.clickButtonByTextNth('Book a scan', 0, timeout);

    // 2 Select MRI Scan card
    const mriCard = this.page.locator('.encounter-card__title').filter({ hasText: 'MRI Scan' }).first();
    await expect(mriCard).toBeVisible({ timeout });
    logger.log('✅ MRI Scan card is visible');
    await mriCard.click();

    // 3 Submit plan selection
    const planSubmitBtn = this.page.getByTestId('select-plan-submit-btn');
    await expect(planSubmitBtn).toBeVisible({ timeout:timeout });
    await planSubmitBtn.click();
    logger.log('✅ Plan submitted');

    // 4 Select city
    const cityOption = this.page.getByText('San Francisco', { exact: true });
    await expect(cityOption).toBeVisible({ timeout });
    await cityOption.click();
    logger.log('✅ City selected: San Francisco');

    // 5 Continue modal
    const modal = this.page.locator('div.modal-dialogue__container');
    const continueBtn = modal.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeVisible({ timeout });
    await expect(continueBtn).toBeEnabled({ timeout });
    await continueBtn.scrollIntoViewIfNeeded();
    await continueBtn.click();
    logger.log('✅ Continue button clicked in modal');

    // 6 Select clinic
    const clinicOption = this.page.getByText(/QA Automation Center/i);
    await expect(clinicOption).toBeVisible({ timeout });
    await clinicOption.click();
    logger.log('✅ Clinic selected: QA Automation Center');

    // 7 Select date
    const dateCell = this.page.locator('[data-testid*="cal-day"]').first();
    await expect(dateCell).toBeVisible({ timeout:timeout });
    await dateCell.click();
    logger.log('✅ Date selected');

    // 8 Select time
    // await this.page.waitForTimeout(9000); // allow UI animation
    const timeSlot = this.page.getByTestId('3-28-cal-day-content');
    await expect(timeSlot).toBeVisible({ timeout:timeout });
    await timeSlot.scrollIntoViewIfNeeded();
    await timeSlot.click();
    logger.log('✅ Time slot selected');

    // 9 Select first N time slots (example: 1)
    await this.page.waitForTimeout(1000); 
    await this.selectFirstNTimeSlots(1);
    logger.log('✅ First time slot selected');

    // 10 Continue to payment
    await this.clickButtonByTextNth('Continue', 0, timeout);
    logger.log('✅ Proceeded to payment');

    // 11 Fill Stripe payment form 
    const stripeFrame = this.page.frameLocator('iframe[name^="__privateStripeFrame"]').first();

    const card = cardInfo || { number: '4242 4242 4242 4242', expiry: '12/30', cvc: '123', zip: '95123' };
    await stripeFrame.locator('input[name="number"]').fill(card.number);
    await stripeFrame.locator('input[name="expiry"]').fill(card.expiry);
    await stripeFrame.locator('input[name="cvc"]').fill(card.cvc);
    await stripeFrame.getByRole('textbox', { name: /zip/i }).fill(card.zip);
    logger.log('✅ Payment info filled');

    // 12 Fill email
    await stripeFrame.getByRole('textbox', { name: /email/i }).fill(email);
    logger.log(`✅ Email filled: ${email}`);

    // 13 Final submit
    await this.clickButtonByTextNth('Continue', 0, timeout);
    logger.success('✅ Booking scan completed successfully');
  }

  async cancelBooking(message='Testing', reasonText="Another reason",timeout=500) {
    await this.clickButtonByTextNth('Reschedule or Cancel',0, timeout);
    await this.verifyTextOnPage('Cancel appointment', {timeout:timeout}); // confirm page loaded
    await this.clickButtonByTextNth('Cancel', 0, timeout);
    await this.selectCancelReason(reasonText, timeout);
    await this.page.fill('#cancellationReasonExtraDescription', message);
    await this.clickButtonByTextNth('Cancel Scan', 0, timeout);
    logger.success('✅ Cancel Booking scan flow completed!');    
  }
}

module.exports = BookingServiceSelection;
