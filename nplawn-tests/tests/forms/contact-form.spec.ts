import { test, expect } from '@playwright/test';
import { ContactFormPage } from '../../page-objects/ContactFormPage';

/**
 * @critical
 * NPLawn Contact Form — /contact
 *
 * Form submits via localStorage/state only (no real backend POST from tests).
 * Success state: shows "Message Received!" h3 in place of the form.
 */

test.describe('Contact Form @critical', () => {

  test('contact page loads with correct hero text', async ({ page }) => {
    const contact = new ContactFormPage(page);
    await contact.goto();

    await expect(contact.pageHero).toBeVisible();
    await expect(contact.heroBadge).toBeVisible();
  });

  test('all form fields are visible and enabled', async ({ page }) => {
    const contact = new ContactFormPage(page);
    await contact.goto();

    await expect(contact.nameField).toBeVisible();
    await expect(contact.emailField).toBeVisible();
    await expect(contact.phoneField).toBeVisible();
    await expect(contact.serviceSelect).toBeVisible();
    await expect(contact.messageField).toBeVisible();
    await expect(contact.submitButton).toBeVisible();
    await expect(contact.submitButton).toBeEnabled();
  });

  test('form fields have correct placeholders', async ({ page }) => {
    const contact = new ContactFormPage(page);
    await contact.goto();

    await expect(contact.nameField).toHaveAttribute('placeholder', 'Jane Smith');
    await expect(contact.emailField).toHaveAttribute('placeholder', 'jane@example.com');
    await expect(contact.phoneField).toHaveAttribute('placeholder', '(630) 555-0100');
  });

  test('submit without required fields shows validation', async ({ page }) => {
    const contact = new ContactFormPage(page);
    await contact.goto();

    // Click submit without filling anything
    await contact.submitButton.click();

    // Name field is required — browser native validation or red border should appear
    const nameInvalid = await contact.nameField.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(nameInvalid, 'Name field should be invalid on empty submit').toBe(true);
  });

  test('invalid email format shows validation error', async ({ page }) => {
    const contact = new ContactFormPage(page);
    await contact.goto();

    await contact.nameField.fill('Test User');
    await contact.emailField.fill('not-an-email');
    await contact.messageField.fill('Test message');
    await contact.submitButton.click();

    const emailInvalid = await contact.emailField.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(emailInvalid, 'Email should fail validation for non-email input').toBe(true);
  });

  test('valid submission shows success message', async ({ page }) => {
    const contact = new ContactFormPage(page);
    await contact.goto();

    await contact.fillAndSubmit({
      name:    'Playwright Test',
      email:   'uitest@nplawn-test.com',
      phone:   '6305550000',
      message: '[AUTOMATED TEST] Please ignore this submission.',
    });

    await expect(contact.successHeading).toBeVisible({ timeout: 10_000 });
    await expect(contact.successMessage).toBeVisible();
  });

  test('form disappears after successful submission', async ({ page }) => {
    const contact = new ContactFormPage(page);
    await contact.goto();

    await contact.fillAndSubmit({
      name:    'Playwright Test',
      email:   'uitest@nplawn-test.com',
      message: '[AUTOMATED TEST] Form visibility check.',
    });

    await expect(contact.successHeading).toBeVisible({ timeout: 10_000 });
    // The form should no longer be visible after success
    await expect(contact.submitButton).not.toBeVisible();
  });

});
