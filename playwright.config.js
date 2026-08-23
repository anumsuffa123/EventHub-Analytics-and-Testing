const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',

  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
  },

  webServer: {
    command: 'cd frontend && npm run dev -- --host 0.0.0.0',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
