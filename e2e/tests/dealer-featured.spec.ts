import { test, expect } from '@playwright/test';

test('Dealer Template featured carousel auto-advance & controls work', async ({ page }) => {
  await page.goto('/dealer-template');
  await page.waitForSelector('text=Featured Vehicles');
  const containerSelector = 'section:has-text("Featured Vehicles") div[tabindex="0"]';
  await page.waitForSelector(containerSelector);

  const before = await page.$eval(containerSelector, (el: HTMLElement) => el.scrollLeft);
  await page.waitForTimeout(4200);
  const after = await page.$eval(containerSelector, (el: HTMLElement) => el.scrollLeft);
  expect(after).toBeGreaterThan(before);

  // Verify arrows exist and can change slides
  const nextBtn = await page.$('section:has-text("Featured Vehicles") button[aria-label="Next"]');
  expect(nextBtn).not.toBeNull();
  if (nextBtn) {
    await nextBtn.click();
    await page.waitForTimeout(600);
    const afterClick = await page.$eval(containerSelector, (el: HTMLElement) => el.scrollLeft);
    expect(afterClick).toBeGreaterThan(before);
  }
});
