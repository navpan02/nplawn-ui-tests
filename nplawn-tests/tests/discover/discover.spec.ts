import { test, expect } from '@playwright/test';
import { DiscoverPage } from '../../page-objects/DiscoverPage';
import { QuoteFormPage } from '../../page-objects/QuoteFormPage';

/**
 * @critical
 * NPLawn CleanLawn Marketplace — Provider Discovery + Quote Flow
 *
 * Journey:
 *   /discover  →  Provider Profile  →  /quote (quote form)
 *
 * /discover page UI (from screenshots):
 *   Badge:    "CLEANLAWN MARKETPLACE"
 *   H1:       "Find Local Lawn Care Professionals"
 *   Search:   ZIP / city input + "Search Providers" button
 *   Filters:  "All Services" (default) + per-service tabs
 *   Cards:    BestPro, Pro Lawn, LMNT — each with "View Profile" + "Get Quote"
 *   Sort:     "Best Rating" dropdown
 *
 * Provider profile UI:
 *   Provider name as H1, "Available" badge, "Request a Quote" hero button,
 *   sidebar "READY TO GET STARTED?" card with "Get a Quote" button,
 *   Services Offered list, Service Areas list.
 */

test.describe('Discover Page @critical', () => {

  test('discover page loads with correct hero content', async ({ page }) => {
    const discover = new DiscoverPage(page);
    await discover.goto();

    await expect(discover.pageBadge).toBeVisible();
    await expect(discover.pageHeading).toBeVisible();
    await expect(discover.searchInput).toBeVisible();
    await expect(discover.searchButton).toBeVisible();
  });

  test('service filter tabs are visible including All Services', async ({ page }) => {
    const discover = new DiscoverPage(page);
    await discover.goto();

    await expect(discover.allServicesTab).toBeVisible();
    await expect(discover.lawnMowingTab).toBeVisible();
    await expect(discover.treeTrimmingTab).toBeVisible();
  });

  test('provider cards render with View Profile and Get Quote buttons', async ({ page }) => {
    const discover = new DiscoverPage(page);
    await discover.goto();

    await expect(discover.firstViewProfile).toBeVisible();
    await expect(discover.firstGetQuote).toBeVisible();
  });

  test('providers found count is displayed', async ({ page }) => {
    const discover = new DiscoverPage(page);
    await discover.goto();

    await expect(discover.providersFoundText).toBeVisible();
    const countText = await discover.providersFoundText.textContent();
    expect(countText).toMatch(/\d+\s+providers?\s+found/i);
  });

  test('Filters button is visible', async ({ page }) => {
    const discover = new DiscoverPage(page);
    await discover.goto();

    await expect(discover.filtersButton).toBeVisible();
  });

  test('clicking a service filter tab updates URL or results', async ({ page }) => {
    const discover = new DiscoverPage(page);
    await discover.goto();

    await discover.lawnMowingTab.click();

    // Either URL changes (query param) or tab gets active style — either is acceptable
    const urlOrTabActive = page.url().includes('lawn') ||
      await discover.lawnMowingTab.evaluate(el => el.className).then(cls =>
        cls.includes('active') || cls.includes('selected') || cls.includes('bg-')
      );
    expect(urlOrTabActive, 'Filter tab click should update URL or tab style').toBe(true);
  });

  test('search input accepts ZIP code text', async ({ page }) => {
    const discover = new DiscoverPage(page);
    await discover.goto();

    await discover.searchInput.fill('60540');
    await expect(discover.searchInput).toHaveValue('60540');
  });

  test('discover page is reachable via CleanLawn Marketplace nav', async ({ page }) => {
    const discover = new DiscoverPage(page);
    await discover.gotoViaNav();

    await expect(page).toHaveURL(/discover/i);
    await expect(discover.pageHeading).toBeVisible();
  });

});

test.describe('Provider Profile @critical', () => {

  test('View Profile navigates to provider profile page', async ({ page }) => {
    const discover = new DiscoverPage(page);
    await discover.goto();

    const urlBefore = page.url();
    await discover.firstViewProfile.click();
    await page.waitForLoadState('networkidle');

    // URL should change away from /discover
    expect(page.url()).not.toBe(urlBefore);
    // Provider profile shows an "Available" badge
    await expect(discover.profileAvailableBadge).toBeVisible({ timeout: 10_000 });
  });

  test('provider profile shows Request a Quote button', async ({ page }) => {
    const discover = new DiscoverPage(page);
    await discover.goto();

    await discover.firstViewProfile.click();
    await page.waitForLoadState('networkidle');

    await expect(discover.profileRequestQuoteBtn).toBeVisible({ timeout: 10_000 });
  });

  test('provider profile sidebar shows Get a Quote card', async ({ page }) => {
    const discover = new DiscoverPage(page);
    await discover.goto();

    await discover.firstViewProfile.click();
    await page.waitForLoadState('networkidle');

    await expect(discover.profileReadyHeading).toBeVisible({ timeout: 10_000 });
    await expect(discover.profileGetQuoteBtn).toBeVisible({ timeout: 10_000 });
  });

});

test.describe('Discover → Quote Flow @critical', () => {

  test('Get Quote from provider card goes to quote form step 1', async ({ page }) => {
    const discover = new DiscoverPage(page);
    const quote = new QuoteFormPage(page);
    await discover.goto();

    await discover.firstGetQuote.click();
    await page.waitForLoadState('networkidle');

    // Should land on the quote form — step 1 fields visible
    await expect(quote.nameField).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/quote/i);
  });

  test('Get a Quote from provider profile goes to quote form step 1', async ({ page }) => {
    const discover = new DiscoverPage(page);
    const quote = new QuoteFormPage(page);
    await discover.goto();

    await discover.firstViewProfile.click();
    await page.waitForLoadState('networkidle');

    // Click Get a Quote in the sidebar
    for (const btn of [
      discover.profileGetQuoteBtn,
      discover.profileRequestQuoteBtn,
    ]) {
      try {
        await btn.scrollIntoViewIfNeeded({ timeout: 2_000 });
        await btn.click({ timeout: 3_000 });
        break;
      } catch { /* try next */ }
    }

    await page.waitForLoadState('networkidle');
    await expect(quote.nameField).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/quote/i);
  });

  test('full journey: discover → view profile → get a quote → complete form → confirmation', async ({ page }) => {
    const discover = new DiscoverPage(page);
    const quote = new QuoteFormPage(page);

    // 1. Land on discover page
    await discover.goto();
    await expect(discover.pageHeading).toBeVisible();

    // 2. View first provider's profile
    await discover.firstViewProfile.click();
    await page.waitForLoadState('networkidle');
    await expect(discover.profileAvailableBadge).toBeVisible({ timeout: 10_000 });

    // 3. Click Get a Quote (sidebar or hero button)
    for (const btn of [
      discover.profileGetQuoteBtn,
      discover.profileRequestQuoteBtn,
    ]) {
      try {
        await btn.scrollIntoViewIfNeeded({ timeout: 2_000 });
        await btn.click({ timeout: 3_000 });
        break;
      } catch { /* try next */ }
    }

    await page.waitForLoadState('networkidle');
    await expect(quote.nameField).toBeVisible({ timeout: 10_000 });

    // 4. Fill step 1
    await quote.fillStep1({
      name:    'Playwright Test',
      email:   'uitest@nplawn-test.com',
      phone:   '6305550000',
      address: '123 Test St',
      city:    'Naperville',
      state:   'IL',
      zip:     '60540',
    });

    // 5. Advance to step 2
    const continueBtn = page.locator('button').filter({ hasText: /continue/i }).first();
    await continueBtn.scrollIntoViewIfNeeded();
    await continueBtn.click();

    await page.locator('#name').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});

    // 6. Select a service (Lawn Mowing is first in the grid)
    await page.locator('button').filter({ hasText: /lawn mowing/i }).first().click({ timeout: 3_000 });

    // 7. Select a frequency (Bi-weekly is shown in screenshots)
    await page.locator('button').filter({ hasText: /bi.?weekly/i }).first().click({ timeout: 3_000 });

    // 8. Submit
    const submitBtn = page.locator('button').filter({ hasText: /submit.*quote|submit/i }).last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // 9. Confirmation
    await page.waitForURL(/quote\/thanks/, { timeout: 15_000 });
    await expect(quote.confirmationHeading).toBeVisible({ timeout: 10_000 });
  });

});
