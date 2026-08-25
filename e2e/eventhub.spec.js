const { test, expect } = require('@playwright/test');

async function createTestUser(request) {
  const email = `test${Date.now()}@example.com`;
  const password = 'Test1234';

  const response = await request.post('/api/auth/signup', {
    data: {
      fullName: 'Playwright Test User',
      email,
      password,
      confirmPassword: password,
    },
  });

  expect(response.status()).toBe(201);

  return { email, password };
}

test('user can login and see dashboard', async ({ page, request }) => {
  const user = await createTestUser(request);

  await page.goto('/login');

  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);

  await page.getByRole('button', { name: /login/i }).click();

  await expect(page).toHaveURL(/dashboard/);

  await expect(
    page.getByText('Event Analytics')
  ).toBeVisible();
});