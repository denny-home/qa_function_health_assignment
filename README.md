# Ezra Booking Flow Automation (Playwright)

This repository contains automated UI tests for the Ezra booking flow using Playwright.

The goal of this project is to demonstrate a **production-quality automation framework** using scalable architecture and clean coding practices.

---

# Overview

The booking flow is critical to Ezra's business operation. These tests validate the most important user journeys through the booking process.

The automation focuses on:

- Authentication for positive and negative tests.
- Booking Scan flow successfully.
- Cancel Booking scan flow successfully.

---

# Tech Stack

- Playwright
- JavaScript
- Node.js
- Page Object Model (POM)

---

# Project Structure
-qa_function_health_assignment
│
├── README.md
│
├── docs
│   └── automation_strategy.md
│
├── pages
│   ├── LoginPage.js
│   └── BookingServiceSelection.js
│   └── Questionnaire.js
│
├── tests
│   └── login.spec.js
|   └── booking.spec.js
│   └── questionnaire.spec.js
│
├── utils
│   └── testData.js
|   └── logger.js
|
├── fixtures
│   └── globalFixtures.js
│
├── playwright.config.js
│
└── package.json

---

# Automated Test Scenarios

| Test Case | Description |
|-----------|-------------|
| Authentication | Ensures mandatory booking fields are validated |
| Booking Scan Flow | Validates user can navigate through booking scan and payment |
| Appointment Selection | Verify user can cancel an appointment |

These tests represent **high-value and stable scenarios suitable for automation**.

---

# Setup

### Install dependencies

### Install Playwright browsers

### Run tests
- npm install
- npx playwright install
- npx playwright test

### Run tests with development environment
- ENV=staging npx playwright test tests/login.spec.js --project=chromium --headed
- ENV=dev SLOW_MO=5000 DEBUG=true npx playwright test tests/booking.spec.js
- ENV=dev SLOW_MO=5000 DEBUG=true npx playwright test tests/questionnaire.spec.js --project=chromium
- ENV=staging npx playwright test tests/login.spec.js


---

# Assumptions

- Tests are executed against the public booking interface (staging or production-like environment).
- Real payments are not processed; payment flows are simulated using test card data.
- Automation primarily validates navigation, form submission, and UI flow through the booking and payment steps.
- Users and test accounts are pre-provisioned and stable for repeatable automation.
- Tests assume stable network connectivity and consistent UI rendering.

---

# Trade-offs

| Trade-off                        | Explanation     
| -------------------------------- | ----------------------------------------------------------------------------- |
| Payment completion not automated | Avoids executing real financial transactions; payment verification relies on simulated test card flows.                 |
| Limited scenarios automated      | Automation focuses on core booking flows, maintainability, and reusability; edge cases may require manual verification. |
| Concurrency tests excluded       | UI automation is not reliable for high-concurrency scenarios; performance/load testing should be handled separately.    |
| UI-dependence                    | Tests rely on UI locators, which may break if the UI changes; mitigated by consistent selector strategy.                |

---

# Scalability

The framework follows the **Page Object Model**, allowing the automation suite to scale as new booking features are introduced.

Future improvements may include:

- CI/CD integration
- API-level booking tests
- Parallel test execution
- Test reporting dashboards
- Test data management
