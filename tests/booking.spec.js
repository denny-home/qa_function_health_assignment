const { test } = require('../fixtures/globalFixtures');
const LoginPage = require('../pages/LoginPage');
const BookingServiceSelection = require('../pages/BookingServiceSelection');
const { testUsers } = require('../utils/testData');
const { timeout } = require('../playwright.config');
const logger = require('../utils/logger');


let page;
let loginPage;

test.describe('Booking Scan Test Suite', () => {

  // Suite-wide setup: run before all tests
  test.beforeAll(async ({ browser }) => {
    logger.log('Test setup: launching browser and logging in');
    // Create a shared page
    page = await browser.newPage();
    // Instantiate LoginPage
    loginPage = new LoginPage(page);
    // Navigate and login
    await loginPage.navigate();
    const user = testUsers[1];
    await loginPage.login(user.email, user.password);
    // Verify login
    await loginPage.verifyUserLoggedIn();
    logger.success('✅  Login successful');

  });

  test.afterEach(async () => {
    logger.log('Teardown: return to home');
    try {
      await loginPage.gotoHome();
    } catch (err) {
      logger.warn('Skip gotoHome (page already closed)');
    }
  });

  // Suite-wide teardown: run after all tests
  test.afterAll(async () => {
    logger.log('Test teardown: logging out and closing browser');
    if (loginPage) {
      await loginPage.signOut?.(); // optional chaining if method exists
    }
  });

  test('Verify full booking flow works properly.', async ({ baseURL }) => {
    logger.log('baseURL=',baseURL);
    const timeout = 10000;
    const user = testUsers[1];
    const cardInfo = { number: '4242 4242 4242 4242', expiry: '12/34', cvc: '123', zip: '95123' };
  
    const servicePage = new BookingServiceSelection(page);
    await servicePage.bookingScan({email:user.email, cardInfo:cardInfo, timeout:timeout});
    // Wait for confirmation page
    await servicePage.verifyTextOnPage("You're almost done", { exactMatch: false, timeout: timeout })
  });

   test('Verify Cancel Booking works properly.', async ({ baseURL }) => {
    logger.log('baseURL=',baseURL);
    const timeout = 10000;
    const message = "This is a demo";
    const reasonText = "Another reason";
    const servicePage = new BookingServiceSelection(page);
    await servicePage.cancelBooking(message, reasonText,timeout);
    await servicePage.verifyTextOnPage('Your appointment has been cancelled', { exactMatch: false, timeout: timeout });
  });

  test('Verify Booking and Cancel Booking scan works properly.', async ({ baseURL }) => {
    logger.log('baseURL=',baseURL);
    const timeout = 10000;
    const user = testUsers[1];
    const cardInfo = { number: '4242 4242 4242 4242', expiry: '12/34', cvc: '123', zip: '95123' };
    const servicePage = new BookingServiceSelection(page);
    
    // 1. Booking scan
    await servicePage.bookingScan({email:user.email, cardInfo:cardInfo, timeout:timeout});
    // Wait for confirmation page
    await servicePage.verifyTextOnPage("You're almost done", { exactMatch: false, timeout: timeout })
    
    // 2. Cancel Booking Scan
    await servicePage.gotoDashboard(baseURL);
    const message = "This is a demo";
    const reasonText = "Another reason";
    await servicePage.cancelBooking(message, reasonText,timeout);
    await servicePage.verifyTextOnPage('Your appointment has been cancelled', { exactMatch: false, timeout: timeout });
  });
});