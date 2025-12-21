import { test, expect } from '@playwright/test';

test('Logged-in buyer can favorite a car and see it on Saved page', async ({ page }) => {
  const base = '/t/sample-dealer';
  // register a buyer
  await page.goto(`${base}/auth/register`);
  await page.fill('input[name="email"]', `playwright-${Date.now()}@example.com`);
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button:has-text("Create account")');
  // go to stock
  await page.goto(`${base}/public/cars`);
  await page.waitForSelector('a:has-text("View")');
  // click first 'View'
  await page.click('a:has-text("View")');
  await page.waitForSelector('button[aria-label="Add to favorites"], button[title="Add to favorites"]');
  await page.click('button[aria-label="Add to favorites"]');
  // Go to favorites page
  await page.goto(`${base}/favorites`);
  await expect(page.locator('text=My Favorites')).toBeVisible();
  await expect(page.locator('img')).toHaveCountGreaterThan(0);
});
