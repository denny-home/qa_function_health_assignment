const { test, expect } = require('../fixtures/globalFixtures');
const LoginPage = require('../pages/LoginPage');
const Questionnaire = require('../pages/Questionnaire');
const { testUsers } = require('../utils/testData');
const { timeout } = require('../playwright.config');
const logger = require('../utils/logger');


let page;
let loginPage;
let context;
test.describe('Questionnaire Test Suite', () => {

  //Suite-wide setup: run before all tests
  test.beforeAll(async ({ browser }) => {
    logger.log('Test setup: launching browser and logging in');
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    const user = testUsers[1];
    await loginPage.login(user.email, user.password);
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

  test('Verify full questionnaire flow works properly.', async ({ baseURL }) => {
    logger.log('baseURL=',baseURL);
    const timeout = 10000;
    const user = testUsers[1];
    const cardInfo = { number: '4242 4242 4242 4242', expiry: '12/34', cvc: '123', zip: '95123' };
    const questionnaire = new Questionnaire(page);
    const status = await questionnaire.completeQuestionnaire();
    logger.log('status=',status);
    expect(status, 'Questionnaire should complete successfully').toBe(true);
    logger.log('Test full questionnaire completed.');
    
  });

   test('Verify access questionnaire from another user.', async ({ baseURL }) => {
    logger.log('baseURL=',baseURL);
    const timeout = 10000;
    const cardInfo = { number: '4242 4242 4242 4242', expiry: '12/34', cvc: '123', zip: '95123' };
    const user1 = testUsers[1];  
    logger.log('user1=',user1);
    const user2 = testUsers[2];  
    logger.log('user2=',user2);
    logger.log('🧪 Step 1. Login to user 1.');
    logger.log('🧪 Step 2. Create a questionnaire successfully.');
    const questionnaire = new Questionnaire(page);
    const status = await questionnaire.completeQuestionnaire();
    expect(status, 'Questionnaire should complete successfully').toBe(true);
    logger.log('Test full questionnaire completed.');
    logger.log('🧪 Step 3. Logout from user 1.');
    await loginPage.gotoHome(baseURL);
    await loginPage.logout();
    logger.log('🧪 Step 4. Login to user 2 and Assume is newly create. So no document, appointment, etc');
    await loginPage.login(user2.email, user2.password);
    logger.log('🧪 Step 4. Verify user 2 is empty.');
    await loginPage.verifyTextOnPage('no appointments',timeout);
    logger.log('Test access questionnaire from another user completed.');
    
  });
});
