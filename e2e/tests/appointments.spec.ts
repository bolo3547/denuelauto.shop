import { test, expect } from '@playwright/test';

test('Book an appointment and see it in account', async ({ page }) => {
  const base = '/t/sample-dealer';
  await page.goto(`${base}/public/cars`);
  await page.click('a:has-text("View")');
  await page.waitForSelector('button:has-text("Book appointment")');
  await page.click('button:has-text("Book appointment")');
  // Fill appointment form
  await page.fill('input[placeholder="Full name"]', 'Automated User');
  await page.fill('input[placeholder="Phone"]', '+260971234567');
  await page.fill('input[type="datetime-local"]', '2025-12-01T10:30');
  await page.click('button:has-text("Book")');
  // Visit account appointments
  await page.goto(`${base}/account/appointments`);
  await expect(page.locator('text=Appointments')).toBeVisible();
  await expect(page.locator('text=Automated User')).toBeVisible();
});
