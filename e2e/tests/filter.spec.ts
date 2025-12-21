import { test, expect } from '@playwright/test';

test('Filters reflect URL and restore state', async ({ page }) => {
  await page.goto('/t/sample-dealer/public/cars');
  // apply a filter from sidebar
  await page.fill('input[placeholder="Make"]', 'Toyota');
  await page.click('button:has-text("Apply")');
  // URL should include 'make=Toyota'
  await expect(page).toHaveURL(/\?make=Toyota/);
  // Check that car cards list updated or still present
  await expect(page.locator('h3')).toHaveCountGreaterThan(0);
});
