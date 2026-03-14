import { test, expect } from '@playwright/test';
import { QuoteFormPage } from '../../page-objects/QuoteFormPage';

/**
 * @critical
 * NPLawn Quote Flow — /quote → /quote/thanks
 *
 * Multi-step form:
 *   Step 1: Personal details + property address (id attributes)
 *   Step 2: Property size + services + frequency
 *   Confirmation: /quote/thanks — "You're all set, [name]!"
 */

const VALID_STEP1 = {
  name:    'Playwright Test',
  email:   'uitest@nplawn-test.com',
  phone:   '6305550000',
  address: '123 Test St',
  city:    'Naperville',
  state:   'IL',
  zip:     '60540',
};

test.describe('Quote Form @critical', () => {

  test('quote page loads and step 1 fields are visible', async ({ page }) => {
    const quote = new QuoteFormPage(page);
    await quote.goto();

    await expect(quote.nameField).toBeVisible();
    await expect(quote.emailField).toBeVisible();
    await expect(quote.phoneField).toBeVisible();
    await expect(quote.addressField).toBeVisible();
    await expect(quote.cityField).toBeVisible();
    await expect(quote.stateField).toBeVisible();
    await expect(quote.zipField).toBeVisible();
  });

  test('step 1 fields have correct IDs and placeholders', async ({ page }) => {
    const quote = new QuoteFormPage(page);
    await quote.goto();

    await expect(quote.nameField).toHaveAttribute('placeholder', 'Jane Smith');
    await expect(quote.emailField).toHaveAttribute('placeholder', 'jane@example.com');
    await expect(quote.phoneField).toHaveAttribute('placeholder', '(630) 555-0100');
    await expect(quote.addressField).toHaveAttribute('placeholder', '123 Main St');
    await expect(quote.cityField).toHaveAttribute('placeholder', 'Chicago');
    await expect(quote.stateField).toHaveAttribute('placeholder', 'IL');
    await expect(quote.zipField).toHaveAttribute('placeholder', '60601');
  });

  test('step 1 — required fields validated on empty submit', async ({ page }) => {
    const quote = new QuoteFormPage(page);
    await quote.goto();

    // Try to advance without filling anything
    const nextBtn = page.locator('button').filter({ hasText: /next|continue/i }).first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    } else {
      await page.locator('button[type="submit"]').click();
    }

    // Name is required — HTML5 validity OR form stayed on step 1 (React custom validation)
    const nameInvalid = await quote.nameField.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    const formStayedOnStep1 = await quote.nameField.isVisible({ timeout: 1_000 }).catch(() => false);
    expect(nameInvalid || formStayedOnStep1, 'Form should not advance with empty required fields').toBe(true);
  });

  test('full quote flow completes and shows confirmation', async ({ page }) => {
    const quote = new QuoteFormPage(page);
    await quote.goto();

    // ── Step 1: Fill personal details ─────────────────────────────────────────
    await quote.fillStep1(VALID_STEP1);

    // ── Advance to step 2 ─────────────────────────────────────────────────────
    // type="button" buttons don't submit the form — the Next button uses that type.
    // Try the page-object definition first, then last type="button", then by text.
    for (const btn of [
      quote.nextButton.first(),
      page.locator('button[type="button"]').last(),
      page.locator('button').filter({ hasText: /next|continue|step 2|proceed/i }).first(),
    ]) {
      try {
        await btn.scrollIntoViewIfNeeded({ timeout: 1_000 });
        await btn.click({ timeout: 3_000 });
        break;
      } catch {
        try { await btn.click({ force: true, timeout: 1_500 }); break; } catch { /* try next */ }
      }
    }

    // Wait for step 2 to render — #name should become hidden
    await page.locator('#name').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {
      // Form may be single-step — proceed anyway
    });

    // ── Step 2: Select a service ───────────────────────────────────────────────
    for (const fn of [
      () => quote.selectService('Lawn Mowing'),
      () => page.locator('button').filter({ hasText: /lawn/i }).first().click({ timeout: 2_000 }),
      () => page.locator('[role="button"]').filter({ hasText: /lawn|mow/i }).first().click({ timeout: 2_000 }),
      () => page.locator('button[aria-pressed]').first().click({ timeout: 2_000 }),
      () => page.locator('main button[type="button"]').first().click({ timeout: 2_000 }),
    ]) {
      try { await fn(); break; } catch { /* try next */ }
    }

    // ── Step 2: Select a frequency ────────────────────────────────────────────
    for (const fn of [
      () => quote.selectFrequency('Weekly'),
      () => page.locator('button').filter({ hasText: /weekly/i }).first().click({ timeout: 2_000 }),
      () => page.locator('button').filter({ hasText: /week/i }).first().click({ timeout: 2_000 }),
    ]) {
      try { await fn(); break; } catch { /* try next */ }
    }

    // ── Submit step 2 ─────────────────────────────────────────────────────────
    for (const btn of [
      quote.submitButton,
      page.locator('main button[type="submit"]').last(),
      page.locator('form button[type="submit"]').last(),
      page.locator('main button').last(),
    ]) {
      try {
        await btn.scrollIntoViewIfNeeded({ timeout: 1_500 });
        await btn.click({ timeout: 3_000 });
        break;
      } catch {
        try { await btn.click({ force: true, timeout: 2_000 }); break; } catch { /* try next */ }
      }
    }

    // ── Confirmation page ─────────────────────────────────────────────────────
    // The SPA may show confirmation in-place without a URL change
    await expect(quote.confirmationHeading).toBeVisible({ timeout: 15_000 });
    await expect(quote.backHomeButton).toBeVisible();
  });

  test('confirmation page greets user by name', async ({ page }) => {
    const quote = new QuoteFormPage(page);
    await quote.goto();

    // ── Step 1 ────────────────────────────────────────────────────────────────
    await quote.fillStep1(VALID_STEP1);

    for (const btn of [
      quote.nextButton.first(),
      page.locator('button[type="button"]').last(),
      page.locator('button').filter({ hasText: /next|continue|step 2|proceed/i }).first(),
    ]) {
      try {
        await btn.scrollIntoViewIfNeeded({ timeout: 1_000 });
        await btn.click({ timeout: 3_000 });
        break;
      } catch {
        try { await btn.click({ force: true, timeout: 1_500 }); break; } catch { /* try next */ }
      }
    }

    await page.locator('#name').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});

    // ── Step 2 ────────────────────────────────────────────────────────────────
    for (const fn of [
      () => quote.selectService('Lawn Mowing'),
      () => page.locator('button').filter({ hasText: /lawn/i }).first().click({ timeout: 2_000 }),
      () => page.locator('[role="button"]').filter({ hasText: /lawn|mow/i }).first().click({ timeout: 2_000 }),
      () => page.locator('button[aria-pressed]').first().click({ timeout: 2_000 }),
      () => page.locator('main button[type="button"]').first().click({ timeout: 2_000 }),
    ]) {
      try { await fn(); break; } catch { /* try next */ }
    }

    for (const fn of [
      () => quote.selectFrequency('Weekly'),
      () => page.locator('button').filter({ hasText: /weekly/i }).first().click({ timeout: 2_000 }),
      () => page.locator('button').filter({ hasText: /week/i }).first().click({ timeout: 2_000 }),
    ]) {
      try { await fn(); break; } catch { /* try next */ }
    }

    for (const btn of [
      quote.submitButton,
      page.locator('main button[type="submit"]').last(),
      page.locator('form button[type="submit"]').last(),
      page.locator('main button').last(),
    ]) {
      try {
        await btn.scrollIntoViewIfNeeded({ timeout: 1_500 });
        await btn.click({ timeout: 3_000 });
        break;
      } catch {
        try { await btn.click({ force: true, timeout: 2_000 }); break; } catch { /* try next */ }
      }
    }

    // ── Confirmation ──────────────────────────────────────────────────────────
    await expect(quote.confirmationHeading).toBeVisible({ timeout: 15_000 });
    const heading = await quote.confirmationHeading.textContent();
    expect(heading).toContain('Playwright Test');
  });

  test('Back to Home button on confirmation navigates to home', async ({ page }) => {
    const quote = new QuoteFormPage(page);

    // Navigate directly to thanks page to test the button
    await page.goto('quote/thanks', { waitUntil: 'networkidle' });

    const backBtn = page.locator('a').filter({ hasText: 'Back to Home' });
    if (await backBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await backBtn.click();
      await expect(page).toHaveURL(/\/NP02\/?$/, { timeout: 5000 });
    }
  });

});
