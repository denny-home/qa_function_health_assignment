# Automation Strategy – Ezra Booking Flow

## Objective

The goal of this automation suite is to validate the most critical workflows in the Ezra booking process. Since the booking flow directly impacts revenue and customer experience, ensuring its reliability is essential.

Automation focuses on validating the following areas:

- Booking navigation
- User input validation
- Transition to payment step

---

# Test Case Selection

The following scenarios were selected for automation due to their business impact and stability.

| Test Case | Reason for Automation |
|-----------|----------------------|
| Successful Booking Flow | Core revenue-generating functionality |
| Required Field Validation | Prevents invalid data entry |
| Appointment Slot Selection | Ensures booking availability works correctly |

These scenarios are stable and repeatable, making them ideal candidates for UI automation.

---

# Automation Framework Design

The test framework is built using **Playwright** with a **Page Object Model (POM)** architecture.

### Key design principles

- Reusable page components
- Clear separation of test logic and UI interactions
- Scalable folder structure
- Maintainable selectors

---

# Framework Structure
pages/
Contains page object classes responsible for interacting with UI elements.

tests/
Contains test cases and assertions.

utils/
Reusable utilities and test data.

docs/
Project documentation and automation strategy.

test-results/
Contains test results and screenshots.

---

# Trade-offs

| Trade-off | Explanation |
|-----------|-------------|
| Payment transaction not completed | Avoid executing real financial transactions |
| Limited automation coverage | Focus on demonstrating framework design |
| Race condition tests excluded | UI automation not ideal for concurrency scenarios |

---

# Assumptions

- Booking pages are accessible publicly
- Payment page can be validated without completing a transaction
- Page selectors remain stable during test execution

---

# Future Improvements

If this automation suite were implemented in a production environment, additional improvements would include:

### CI/CD Integration

- Automated test execution on pull requests
- Nightly regression testing

### Test Coverage Expansion

- Full payment flow validation
- Negative payment scenarios
- Location-based booking scenarios

### Test Reporting

Integration with reporting tools such as:

- Allure
- Playwright HTML reports
- Slack notifications

### Performance Testing

Booking flow performance could be monitored using:

- API response validation
- synthetic monitoring

---

# Conclusion

This automation framework demonstrates scalable test architecture and clean engineering practices suitable for production-level QA automation.

