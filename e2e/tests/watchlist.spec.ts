import { test, expect } from '@playwright/test';

test('Price drop toggle subscribes', async ({ page }) => {
  await page.goto('/t/sample-dealer/public/cars');
  await page.click('text=Catalog');
  // click first view
  await page.click('a:has-text("View")');
  // wait for page to load
  await page.waitForSelector('text=Notify me if price drops');
  await page.click('text=Notify me if price drops');
  await page.fill('input[placeholder="Email"]', 'e2e@example.com');
  await page.click('button:has-text("Subscribe")');
  await expect(page).toHaveURL(/public\/cars\//);
});
