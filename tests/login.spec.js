const { test, expect } = require('../fixtures/globalFixtures');
const LoginPage = require('../pages/LoginPage');
const { testUsers } = require('../utils/testData');
const logger = require('../utils/logger');


test.describe('Authentication Test Suite', () => {

  let loginPage;

  test.beforeEach(async ({ page }) => {
    logger.log('Setup: open login page');

    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test.afterEach(async () => {
    logger.log('Teardown: return to home');

    try {
      await loginPage.gotoHome();
    } catch (err) {
      logger.warn('Skip gotoHome (page already closed)');
    }
  });

  test('Valid login', async () => {
    const user = testUsers[1];

    await loginPage.login(user.email, user.password);
    await loginPage.verifyUserLoggedIn();
  });

  test('Invalid password', async () => {
    const user = testUsers[1];

    await loginPage.login(user.email, 'wrongPassword');
    await loginPage.verifyLoginError();
  });

  test('Invalid email', async () => {
    await loginPage.login('wrong@email.com', 'Password123');
    await loginPage.verifyLoginError('The username/password combination is invalid.');
  });

});
