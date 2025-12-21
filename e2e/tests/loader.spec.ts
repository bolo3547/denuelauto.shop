import { test, expect } from '@playwright/test';

test('Homepage CTA shows loader and navigates to register', async ({ page, baseURL }) => {
  await page.goto('/');

  // Wait for hero CTA and click
  await page.waitForSelector('[data-testid="hero-cta-start"]', { timeout: 5000 });
  await page.click('[data-testid="hero-cta-start"]');

  // Expect a global status role overlay to appear
  await page.waitForSelector('[role="status"]', { timeout: 5000 });
  const status = await page.$('[role="status"]');
  expect(status).not.toBeNull();

  // Wait for navigation to /register (client push)
  await page.waitForURL('**/register**', { timeout: 10000 });
  expect(page.url()).toContain('/register');
});
