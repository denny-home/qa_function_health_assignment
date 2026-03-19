const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { timeout } = require('../playwright.config');
const logger = require('../utils/logger');
const { totalmem } = require('os');

class Questionnaire {
  constructor(page) {
    this.page = page;

    // question -> handler mapping
    this.questionHandlers = {
      "General Questions": async () => await this.clickContinueButton(10000),
      "intend to get the scan for yourself or are you filling out the Medical Questionnaire for another person?": async () => {
        await this.clickButtonByName("Myself");
        await this.clickContinueButton();},
      "Please confirm you have read and accepted our cancellation, missed appointment, rescheduling and refund policy.": async () => {
        await this.clickButtonByName("I understand");
        await this.clickContinueButton();},
      "What is your current weight?": async () => { await this.fillInput('#weight', 170); await this.clickContinueButton();},
      "What is your current height?":async () => { 
        await this.fillInput('#height\\.heightFeet', 5); 
        await this.fillInput('#height\\.heightInches', 2); 
        await this.clickContinueButton();},
      "What is your ethnic origin?":async () => {
        await this.clickButtonByName("White or Caucasian");
        await this.clickContinueButton();},
      "Please provide your address.":async () =>{await this.fillAddress({address1: "123 Main Street",address2: "Apt 5",city: "Fremont",state: "California",zip: "94536"}); await this.clickContinueButton();},
      "Tell us more information about yourself so we can personalize your scan results.":async () => await this.clickContinueButton(),
      "Our scans are for general health screening. They are not designed to diagnose or monitor medical conditions,":async () => {await this.clickButtonByName("Yes"); await this.clickContinueButton();},
      "Do you currently have a Primary Care Provider?":async () => { await this.clickButtonByName("No"); await this.clickContinueButton();},
      "Have you had any recent Emergency Room visits or hospitalizations that require follow-up care?":async () => { await this.clickButtonByName("No"); await this.clickContinueButton();},
      "Do you have any":async () => { await this.clickButtonByName("No"); await this.clickContinueButton();},
      "have you had any surgeries or cosmetic procedures in the past?":async () => { await this.clickButtonByName("No"); await this.clickContinueButton();},
      "Have you had or do you currently have cancer?":async () => { await this.clickButtonByName("No"); await this.clickContinueButton();},
      "Has anyone in your family been diagnosed with cancer?":async () =>{ await this.clickButtonByName("Yes"); await this.clickContinueButton();},
      "What type(s) of cancer have your family member(s) had?":async () => {
        //await this.fillFamilyCancerHistory([{relation: "Mother",location: "Breast"},{relation: "Father",location: "Lung"}]);
        await this.fillFamilyCancerHistory([{relation: "Mother",location: "Breast"}]);
        await this.clickContinueButton();},
      "Are you currently taking any medications?":async () => { await this.clickButtonByName("No"); await this.clickContinueButton();},
      "Have you had any imaging within the last year?":async () => { await this.clickButtonByName("No"); await this.clickContinueButton();},
      "Have you had a prostate specific antigen (PSA) checked before?":async () => { await this.clickButtonByName("No"); await this.clickContinueButton();},
      "Scan Safety":async () => { await this.clickContinueButton(); await this.clickContinueButton();},
      "For MRI safety, please indicate if you have any of the following implants, procedures, or history":async () => {
        const checkboxText = 'I confirm that I have read the list of metallic implants and procedures below and declare that none apply to me.';
        await this.clickCheckboxByText(checkboxText);
        await this.clickContinueButton();},
      "For MRI safety, please indicate if you have or currently wearing":async () => {
        const checkboxText2 = 'I confirm that I have reviewed the list of items and devices below and declare that none apply to me at the time of my MRI.';
        await this.clickCheckboxByText(checkboxText2);
        await this.clickContinueButton();},
      "What to expect during your scan":async () => await this.clickContinueButton(),
      "Are you claustrophobic?":async () => {
        await this.clickButtonByName("Yes");
        await this.clickContinueButton();},
      "If claustrophobia prevents you from completing your scan, a refund will not be available. However, you may reschedule for a 25% fee of the package price (promo codes excluded), as appointment time and resources are reserved for your scan.":async () => {
        await this.clickButtonByName("I understand"); await this.clickContinueButton();},
      "Will you require any disability accommodations for your imaging scan or to complete your medical intake?":async () => {
        await this.clickButtonByName("No");
        await this.clickContinueButton();},
      "I hereby attest and affirm that I have disclosed my medical history accurately":async () => {
        await this.clickButtonByName("Yes");
        await this.clickContinueButton();},
      "Congratulations! You’re all set.":async () => await this.clickButtonByTextNth("Back to dashboard",0,5000)

    };
  }

  async clickContinueButton(timeout = 5000) {
    logger.log("clickContinueButton: waiting for #next");
    const button = this.page.locator('#next').first();
    try {
      // Wait for the button to be visible before clicking
      await button.waitFor({ state: 'visible', timeout });
      await button.click();
      logger.log("clickContinueButton: clicked successfully");
    } catch (err) {
      logger.log(`⚠️ Continue button not clickable within ${timeout}ms`);
      throw err; // optional: rethrow to fail the flow
    }
  }

  async clickButtonByName(text, timeout = 5000) {
    logger.log('clickButtonByName.text=', text);
    // Locate the button inside step__form with a label matching the text
    const button = this.page.locator(`.step__form button:has(label:text-is("${text}"))`).first();
    try {
      // Wait for the button to be visible before clicking
      await button.waitFor({ state: 'visible', timeout });
      await button.click();
      logger.log('clickButtonByName completed');
    } catch (err) {
      logger.log(`⚠️ Button "${text}" not clickable within ${timeout}ms`);
      throw err; // optionally rethrow
    }
  }

  async clickCheckboxByText(text) {
    logger.log('clickCheckBoxByText')
    const checkbox = this.page.locator('.step__form button.checkbox').filter({ hasText: text });
    await checkbox.first().click();
  }

  async fillInput(selector, value) {
    logger.log(`fillInput.selector=${selector},value=${value}`);
    await this.page.waitForTimeout(1000);
    const input = this.page.locator(selector).first();
    await input.waitFor({ state: 'visible' });
    await input.click({ clickCount: 3 }); // select all text
    await input.press('Backspace');       // clear
    await input.type(value.toString(), { delay: 50 }); // slower typing for masks

    return true;
  }

  async fillAddress({address1, address2 = "", city, state, zip}) {
    logger.log('fillAddress');
    await this.page.fill('#memberAddress\\.address', address1);
    if (address2) {
      await this.page.fill('#memberAddress\\.address2', address2);
    }
    await this.page.fill('#memberAddress\\.city', city);
    // Open state dropdown
    await this.page.click('.multiselect');
    // Select state
    await this.page.locator('.multiselect__option span').filter({ hasText: state }).first().click();
    await this.page.fill('#memberAddress\\.zip', zip);
  }
  async fillFamilyCancerHistory(members) {
    logger.log('fillFamilyCancerHistory');
    for (let i = 0; i < members.length; i++) {
      const { relation, location } = members[i];
      const container = this.page.locator('.history-container').nth(i);
      // Select family member
      await container.locator('.family-member-dropdown .multiselect').click();
      await this.page.locator('.multiselect__option span').filter({ hasText: relation }).first().click();
      // Fill body location
      await container.locator('textarea').fill(location);

      // Add new if more members
      if (i < members.length - 1) {
        await this.page.click('button:has-text("Add new")');
      }
    }
  }

  async getSectionStartContent() {
    logger.log('getSectionStartContent');
    // Locate the container
    const container = this.page.locator('.section-start').first();

    const visible = await container.isVisible().catch(() => false);
    if (!visible) return null;

    // Get the h3 text (title)
    const title = (await container.locator('h3').innerText()).trim();

    // Get the description text (b3 class)
    const descriptionLocator = container.locator('.b3');
    let description = '';
    if (await descriptionLocator.isVisible().catch(() => false)) {
      description = (await descriptionLocator.innerText()).trim();
    }

    logger.log('title=',title);
    logger.log('description=',description);
    return { title, description };
  }

  async getCurrentQuestion() {
    const locator = this.page.locator('.step__questions .h3').first();

    const visible = await locator.isVisible().catch(() => false);
    if (!visible) return null;

    return (await locator.innerText()).trim();
  }

/**
 * Get current content (section or question)
 * Supports h3 and h4 titles
 */

  async getCurrentContent(timeout = 5000) {
    logger.debug('🔥 [getCurrentContent] Detecting current UI content');
    // Small smart wait instead of hard sleep
    await this.page.waitForLoadState('domcontentloaded');
    try {
      // ---------- SECTION ----------
      const sectionStart = this.page.locator('.section-start').first();
      if (await sectionStart.isVisible({ timeout }).catch(() => false)) {
        const titleLocator = sectionStart.locator('h3, h4').first(); // ✅ support h3 + h4
        const descLocator = sectionStart.locator('.b3');
        const title = (await titleLocator.textContent() || '').trim();
        let description = '';
        if (await descLocator.isVisible().catch(() => false)) {
          description = (await descLocator.textContent() || '').trim();
        }
        logger.log(`🔥 [getCurrentContent] Section detected: "${title}"`);
        return {type: 'section', title, description};
      }

      // ---------- QUESTION ----------
      const stepQuestion = this.page.locator('.step__questions').first();
      if (await stepQuestion.isVisible({ timeout }).catch(() => false)) {
        const titleLocator = stepQuestion.locator('.h3, .h4').first(); // ✅ support .h3 + .h4
        const descLocator = stepQuestion.locator('.question--pre');
        const title = (await titleLocator.textContent() || '').trim();
        let description = '';
        if (await descLocator.isVisible().catch(() => false)) {
          description = (await descLocator.textContent() || '').trim();
        }
        logger.log(`👉 [getCurrentContent] Question detected: "${title}"`);
        return {type: 'question', title, description};
      }

      // ---------- FALLBACK ----------
      logger.warn('[getCurrentContent] No known content type detected');

      return {
        type: 'unknown',
        title: '',
        description: ''
      };

    } catch (error) {
      logger.error(`[getCurrentContent] Failed to detect content: ${error.message}`);
      throw error;
    }
  }

  /**
 * Wait for completion screen (success message)
 * @param {number} timeout
 * @returns {boolean}
 */
  async waitForCompletion(timeout = 5000) {
    logger.debug(`⏳ Waiting for completion screen (${timeout}ms)`);
    const expectedText = 'Congratulations! You’re all set.'
    const successTitle = this.page.locator('h4', {hasText: expectedText,});
    try {
      await successTitle.waitFor({ state: 'visible', timeout });
      logger.success(`✅ ${expectedText} found.`);
      return true;
    } catch {
      logger.warn(`⚠️ ${expectedText} not found!`);
      return false;
    }
  }

  async completeQuestionnaire(timeout=5000) {
    logger.log('completedQuestionnaire');
    let status = false;
    await this.page.waitForTimeout(1000);
    await this.clickButtonByTextNth('Start',0, timeout);
    await this.page.waitForTimeout(timeout);
    let counter = 1;
    while (true) {
      logger.debug(`🔄 ${counter}. Getting next screen... 🔄`);
      if (await this.waitForCompletion()) {
        logger.success("✅ Questionnaire completed!");
        break;
      }

      // 2️⃣ Get current visible content (section or question)
      const content = await this.getCurrentContent();
      if (!content) {
        logger.debug("⚠️ No content detected");
        break;
      }
      // logger.debug('content.title=',content.title);
      // logger.debug('content.description=',content.description);
      // 3️⃣ Use title + description to match handler
      const textToMatch = `${content.title} ${content.description}`.toLowerCase();
      logger.debug('textToMatch=',textToMatch);
      const entry = Object.entries(this.questionHandlers).find(([key]) => textToMatch.includes(key.toLowerCase()));
      logger.debug('entry=',entry);
      logger.debug('textToMatch=',textToMatch);
      if (!entry) {
        logger.error("❌ No handler found for:", textToMatch);
        break;
      }

      const handler = entry[1];

      // 4️⃣ Execute handler
      await handler();

      // 5️⃣ Wait a short time for UI to update
      await this.page.waitForTimeout(500);
      counter++;
    }

    logger.success("🎉 Flow finished");
    // await this.page.waitForTimeout(5000);
    return true;
  }

  async clickButtonByName(buttonText = "Yes") {
    logger.log(`🖱️ Clicking button: ${buttonText}`);
    await this.page.getByRole('button', { name: new RegExp(buttonText, 'i') }).click();
  }

  async gotoDashboard(testUrl,label='Home',timeout=500){
    logger.log('🖱️ gotoDashboard.testUrl=',testUrl);
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

  async clickButtonByTextNth(buttonText, index = 0, timeout = 500) {
      logger.log('🖱️ clickButtonByTextNth.buttonText=',buttonText,'index=',index,'timeout=',timeout);
      const button = this.page.getByRole('button', { name: buttonText }).nth(index);
      // Wait for the button to appear and be enabled
      await button.waitFor({ state: 'visible', timeout: timeout });
      if (await button.isEnabled()) {
        await button.click();
        logger.log(`Clicked "${buttonText}" button at index ${index}`);
      } else {
        logger.warn(`Button "${buttonText}" at index ${index} is disabled`);
      }
    }
  async verifyTextOnPage(expectedText, timeout = 5000) {
    await this.page.waitForTimeout(timeout+ 1000);
    const locator = this.page.getByText(expectedText).first();
    try {
      await locator.waitFor({ state: 'visible', timeout:timeout });
      logger.log(`✅ PASS: Text "${expectedText}" is displayed on the page`);
    } catch (error) {
      logger.error(`❌ FAIL: Text "${expectedText}" NOT found on the page`);
      throw error;
    }
  }
}

module.exports = Questionnaire;