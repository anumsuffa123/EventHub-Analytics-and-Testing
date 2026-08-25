# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
## Testing

EventHub uses automated tests for frontend, backend, and end-to-end testing.

### Frontend Tests

Frontend tests use Vitest and React Testing Library.

Run frontend tests:

```bash
cd frontend
npm run test:run
Run tests in watch mode:
cd frontend
npm test
Frontend tests cover:
•	Analytics component rendering
•	Registration statistics
•	Date-range filtering
•	Clear filter interaction
•	Empty state handling
Backend Tests
Backend tests use Jest and Supertest.
Run backend tests:
cd backend
npm test
Backend tests cover:
•	Signup validation
•	Login failure handling
•	Authentication protection
•	Registration validation
•	Authenticated registration retrieval
End-to-End Tests
End-to-end tests use Playwright.
Install Playwright browsers:
npx playwright install
Run E2E tests:
npx playwright test
Run E2E tests with the browser visible:
npx playwright test --headed
The E2E test simulates a real user flow:
1.	Open the login page
2.	Login with a test account
3.	Navigate to the dashboard
4.	Register for an event
5.	Verify successful registration

---

# 🎯 Final project structure


EventHub/
│
├── backend/
│   ├── server.js
│   ├── registrations.json
│   ├── users.json
│   ├── package.json
│   │
│   └── tests/
│       └── server.test.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── analytics/
│   │   │       └── EventAnalytics.jsx
│   │   │
│   │   ├── tests/
│   │   │   └── EventAnalytics.test.jsx
│   │   │
│   │   └── test/
│   │       └── setup.js
│   │
│   ├── package.json
│   └── vite.config.js
│
├── e2e/
│   └── eventhub.spec.js
│
├── playwright.config.js
└── README.md
