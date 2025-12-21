import { test, expect } from '@playwright/test';

// This e2e test checks the dealer onboarding wizard flow and submits the form
// It stubs POST /api/tenants to avoid changing backend state and confirm success UI

test('Dealer onboarding wizard completes and shows success', async ({ page }) => {
  const base = '/register';

  // Intercept the tenant creation request to return a successful response
  await page.route('**/api/tenants', route => {
    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant: { id: 'test-tenant' } })
    });
  });

  await page.goto(base);
  await page.waitForSelector('input[aria-label="Dealership Name"]');

  // Step 1: Business basics
  await page.fill('input[aria-label="Dealership Name"]', `e2e Dealer ${Date.now()}`);
  await page.selectOption('select[aria-label="Country"]', 'Zambia');
  await page.fill('input[aria-label="City / Town"]', 'Lusaka');
  await page.fill('input[aria-label="Phone Number"]', '+260971234567');
  await page.fill('input[aria-label="Email"]', `e2e-${Date.now()}@example.com`);
  await page.fill('input[aria-label="Slug (website URL)"]', `e2e-${Date.now()}`);

  // Go to next
  await page.click('button:has-text("Next")');
  await page.waitForSelector('text=Sales & Geography');

  // Step 2: Sales & geography
  // Toggle an optional field (e.g., "Do you export vehicles?") if needed
  // The wizard uses optional fields; we can proceed without filling everything
  await page.click('button:has-text("Next")');
  await page.waitForSelector('text=Website Look & Brand Tone');

  // Step 3: Website look & brand tone
  // Fill some optional aesthetic fields
  await page.fill('input[placeholder="https://example.com/logo.png"]', 'https://example.com/logo.png');
  await page.selectOption('select[aria-label="Theme palette"]', 'Deep Blue + Gold');
  await page.click('button:has-text("Next")');
  await page.waitForSelector('text=Choose Your Plan');

  // Step 4: Plan & confirmation
  // Select a plan — capture one of the plan cards "starter" if present
  // Use a visible button inside the pricing card if the test app uses a clickable card
  await page.click('text=Recommended', { strict: false }).catch(() => {});
  // Select a radio or click on the plan card; fallback to clicking a plan's button
  // Ensure we choose a plan by clicking a plan card or its surrounding button
  // If there's a radio control or clickable region for selecting plan, attempt selecting first plan
  const planCard = page.locator('.grid .bg-[#FFD700], .grid .border, .grid button:has-text("Select")').first();
  if (await planCard.count()) {
    await planCard.click();
  }

  // Choose onboarding priority radio
  await page.click('input[type="radio"][name="priority"]');

  // Choose initial stock volume
  await page.selectOption('#initialStockVolume', '21–50');

  // Accept terms
  await page.click('text=I accept the Terms & Conditions and Privacy Policy');

  // Submit the form and expect success toast / message
  await page.click('button:has-text("Create my dealership system")');
  await page.waitForSelector('text=Your Denuel Auto system is ready!');
  await expect(page.locator('text=Your Denuel Auto system is ready!')).toBeVisible();
});
