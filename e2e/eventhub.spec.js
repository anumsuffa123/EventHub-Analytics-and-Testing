const { test, expect } = require('@playwright/test');

test('user can login and see dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill('YOUR_TEST_EMAIL');

  await page.getByLabel(/password/i).fill('YOUR_TEST_PASSWORD');

  await page.getByRole('button', { name: /login/i }).click();

  await expect(page).toHaveURL(/dashboard/);

  await expect(
    page.getByText('Event Analytics')
  ).toBeVisible();
});

test('user can login and register for an event', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill('test@example.com');
  await page.getByLabel(/password/i).fill('Test1234');

  await page.getByRole('button', { name: /login/i }).click();

  await expect(page).toHaveURL(/dashboard/);

  await page.getByLabel(/full name/i).fill('Test Student');

  await page.getByLabel(/phone/i).fill('03001234567');

  await page.getByLabel(/student id/i).fill('TEST001');

  // Fill remaining fields...

  await page.getByRole('button', { name: /register/i }).click();

  await expect(
    page.getByText(/student registered/i)
  ).toBeVisible();
});
