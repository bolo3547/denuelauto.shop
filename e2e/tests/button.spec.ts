import { test, expect } from '@playwright/test';

test('ActionButton shows loading and completes', async ({ page }) => {
  await page.goto('/test/button');

  const btn = page.locator('button', { hasText: 'Save' });
  await btn.click();

  // button should be disabled while loading
  await expect(btn).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('text=Saved!')).toBeVisible({ timeout: 2000 });
  // button should not be busy after success
  await expect(btn).not.toHaveAttribute('aria-busy', 'true');
});
