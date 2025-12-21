import { test, expect } from '@playwright/test';

// Verify landing page Featured Vehicles auto-advances via scrollLeft

test('Landing featured vehicles auto-advance, dots and keyboard navigation', async ({ page }) => {
  await page.goto('/');
  // Wait until the featured section is visible
  await page.waitForSelector('section:has-text("Featured Vehicles")');
  const containerSelector = 'section:has-text("Featured Vehicles") div[tabindex="0"]';
  await page.waitForSelector(containerSelector);

  // Auto-advance should scroll to the next item
  const before = await page.$eval(containerSelector, (el: HTMLElement) => el.scrollLeft);
  await page.waitForTimeout(4200); // wait slightly longer than 3500ms interval
  const after = await page.$eval(containerSelector, (el: HTMLElement) => el.scrollLeft);
  expect(after).toBeGreaterThan(before);

  // Dots should exist and reflect the active slide
  const tablist = await page.$('section:has-text("Featured Vehicles") [role="tablist"]');
  expect(tablist).not.toBeNull();
  const dots = await page.$$('section:has-text("Featured Vehicles") [role="tablist"] button');
  expect(dots.length).toBeGreaterThan(0);
  // Press ArrowRight and verify active dot changes
  await page.focus(containerSelector);
  const activeBefore = await page.$eval('section:has-text("Featured Vehicles") [role="tablist"] button[aria-selected="true"]', el => el.getAttribute('aria-label'));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(600); // allow keyboard to trigger move
  const activeAfter = await page.$eval('section:has-text("Featured Vehicles") [role="tablist"] button[aria-selected="true"]', el => el.getAttribute('aria-label'));
  expect(activeAfter).not.toBe(activeBefore);

  // Click Next arrow and ensure a change
  const nextBtn = await page.$('section:has-text("Featured Vehicles") button[aria-label="Next"]');
  if (nextBtn) {
    await nextBtn.click();
    await page.waitForTimeout(600);
    const activeAfterClick = await page.$eval('section:has-text("Featured Vehicles") [role="tablist"] button[aria-selected="true"]', el => el.getAttribute('aria-label'));
    expect(activeAfterClick).not.toBe(activeAfter);
  }
});

test('Featured vehicles card shows professionally formatted card', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('section:has-text("Featured Vehicles")');
  // Ensure a View Car button exists within featured section
  const viewCar = await page.$('section:has-text("Featured Vehicles") [data-testid="car-view-details"]');
  expect(viewCar).not.toBeNull();
  // Enquire button exists
  const enquire = await page.$('section:has-text("Featured Vehicles") [data-testid="car-enquire"]');
  expect(enquire).not.toBeNull();
  // viewCar variable is our primary assertion
  expect(viewCar).not.toBeNull();
  // Ensure the card title is present
  const title = await page.textContent('section:has-text("Featured Vehicles") [data-testid="car-title"]');
  expect(title).toBeTruthy();
  // Ensure the price text is present
  const price = await page.textContent('section:has-text("Featured Vehicles") [data-testid="car-price"]');
  // If price is present it should be a non-empty string
  expect(price && price.trim().length).toBeGreaterThan(0);

  // Click the View Car button and check Quick View modal
  await page.click('section:has-text("Featured Vehicles") [data-testid="car-view-details"]');
  await page.waitForSelector('[data-testid="car-quickview"]');
  const dialogHeader = await page.textContent('[data-testid="car-quickview"] h3');
  expect(dialogHeader).toContain(title!.trim());
});

test('Hero CTA and TrustBar are present', async ({ page }) => {
  await page.goto('/');
  // hero CTA
  await page.waitForSelector('[data-testid="hero-cta-trial"]');
  const trialText = await page.textContent('[data-testid="hero-cta-trial"]');
  expect(trialText?.trim()).toBe('Start Free Trial');

  await page.waitForSelector('[data-testid="hero-cta-demo"]');
  const demoText = await page.textContent('[data-testid="hero-cta-demo"]');
  expect(demoText?.trim()).toBe('Schedule Demo');

  // TrustBar presence - assert a metric is visible
  await page.waitForSelector('text=Dealers onboarded');
  const metricText = await page.textContent('text=Dealers onboarded');
  expect(metricText).toContain('Dealers onboarded');
  // Click Schedule Demo and ensure the DemoModal opens
  await page.click('[data-testid="hero-cta-demo"]');
  await page.waitForSelector('role=dialog >> text=Denuel Auto — Demo Preview');
  const dialogHeader = await page.textContent('role=dialog >> text=Denuel Auto — Demo Preview');
  expect(dialogHeader).toBeTruthy();
});
