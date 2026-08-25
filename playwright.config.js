const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',

  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'cd backend && npm start',
      port: 5000,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      env: { JWT_SECRET: 'test-secret' }
    },
    {
      command: 'cd frontend && npm run dev',
      port: 5173,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    }
  ],
});