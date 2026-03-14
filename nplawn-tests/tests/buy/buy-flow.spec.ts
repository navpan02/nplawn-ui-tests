import { test, expect } from '@playwright/test';
import { BuyFlowPage } from '../../page-objects/BuyFlowPage';

/**
 * @critical
 * NPLawn Buy Flow — /buy-now (4-step wizard)
 *
 * Step 1: Property Details  → "Continue — View Your Property on Map →"
 * Step 2: Map & Lawn Size   → "See Pricing Plans →"
 * Step 3: Choose Your Plan  → select GrassPro → "Continue to Review →"
 * Step 4: Review & Order    → fill full name   → "Place Order →"
 * Confirmation: "Thank You, [name]!" + Order ID NPL-XXXXXX
 */

const STEP1_DATA = {
  address: '123 Main St, Naperville, IL',
  email:   'uitest@nplawn-test.com',
  phone:   '6305550000',
};

const TEST_NAME = 'Playwright Test';

/** Navigate through all 4 steps to the confirmation page. */
async function runFullBuyFlow(buy: BuyFlowPage) {
  const page = buy.page;

  // Step 1
  await buy.fillStep1(STEP1_DATA);
  await buy.continueToMapBtn.scrollIntoViewIfNeeded();
  await buy.continueToMapBtn.click();

  // Step 2 — map loads from geocoding; wait for the pricing button
  await expect(buy.mapHeading).toBeVisible({ timeout: 10_000 });
  await expect(buy.seePricingBtn).toBeVisible({ timeout: 15_000 });
  // Ensure a lawn size is set so pricing can be calculated
  const existingSize = await buy.lawnSizeAdjustInput.inputValue().catch(() => '');
  if (!existingSize || existingSize === '0') {
    await buy.lawnSizeAdjustInput.fill('5000');
  }
  await buy.seePricingBtn.click();

  // Step 3 — GrassPro is pre-selected; click its card to confirm selection
  await expect(buy.planHeading).toBeVisible({ timeout: 10_000 });
  try {
    await buy.grassProCard.click({ timeout: 3_000 });
  } catch {
    // Pre-selected — no click needed
  }
  await buy.continueToReviewBtn.scrollIntoViewIfNeeded();
  await buy.continueToReviewBtn.click();

  // Step 4
  await expect(buy.reviewHeading).toBeVisible({ timeout: 10_000 });
  await buy.fullNameField.fill(TEST_NAME);
  await buy.placeOrderBtn.scrollIntoViewIfNeeded();
  await buy.placeOrderBtn.click();

  // Confirmation
  await expect(buy.confirmationHeading).toBeVisible({ timeout: 15_000 });
}

test.describe('Buy Flow @critical', () => {

  test('buy-now page loads with step indicator and form fields', async ({ page }) => {
    const buy = new BuyFlowPage(page);
    await buy.goto();

    await expect(buy.pageHeading).toBeVisible();
    await expect(buy.stepIndicator).toBeVisible();
    await expect(buy.addressField).toBeVisible();
    await expect(buy.emailField).toBeVisible();
    await expect(buy.continueToMapBtn).toBeVisible();
    await expect(buy.continueToMapBtn).toBeEnabled();
  });

  test('step 1 — property address is required', async ({ page }) => {
    const buy = new BuyFlowPage(page);
    await buy.goto();

    await buy.continueToMapBtn.click();

    const addressInvalid = await buy.addressField.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    const stayedOnStep1 = await buy.addressField.isVisible({ timeout: 1_000 }).catch(() => false);
    expect(addressInvalid || stayedOnStep1, 'Step 1 should not advance with empty address').toBe(true);
  });

  test('step 3 — all three plan cards are visible', async ({ page }) => {
    const buy = new BuyFlowPage(page);
    await buy.goto();

    // Navigate through steps 1 and 2 to reach the plan selection step
    await buy.fillStep1(STEP1_DATA);
    await buy.continueToMapBtn.click();

    await expect(buy.seePricingBtn).toBeVisible({ timeout: 15_000 });
    const existingSize = await buy.lawnSizeAdjustInput.inputValue().catch(() => '');
    if (!existingSize || existingSize === '0') {
      await buy.lawnSizeAdjustInput.fill('5000');
    }
    await buy.seePricingBtn.click();

    await expect(buy.planHeading).toBeVisible({ timeout: 10_000 });
    await expect(buy.grassBasicCard).toBeVisible();
    await expect(buy.grassProCard).toBeVisible();
    await expect(buy.grassNaturalCard).toBeVisible();
    await expect(buy.continueToReviewBtn).toBeVisible();
  });

  test('full buy flow completes and shows order confirmation', async ({ page }) => {
    const buy = new BuyFlowPage(page);
    await buy.goto();

    await runFullBuyFlow(buy);

    // Confirmation content
    const heading = await buy.confirmationHeading.textContent();
    expect(heading).toContain(TEST_NAME);

    await expect(buy.orderIdLocator).toBeVisible();
    const orderIdText = await buy.orderIdLocator.textContent();
    expect(orderIdText).toMatch(/NPL-\d+/);

    await expect(buy.orderSummary).toBeVisible();
    // Plan name (GrassPro) should appear in the order summary
    await expect(page.getByText('GrassPro').first()).toBeVisible();

    await expect(buy.backToHomeBtn).toBeVisible();
    await expect(buy.contactUsBtn).toBeVisible();
  });

  test('back to home from confirmation navigates to home page', async ({ page }) => {
    const buy = new BuyFlowPage(page);
    await buy.goto();

    await runFullBuyFlow(buy);

    await buy.backToHomeBtn.click();
    await expect(page).toHaveURL(/\/NP02\/?$/, { timeout: 5_000 });
  });

});
