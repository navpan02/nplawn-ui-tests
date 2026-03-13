import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';

/**
 * @critical
 * NPLawn Login — /login
 *
 * Auth via Supabase signInWithPassword.
 * Redirects: / (regular user), /admin (admin), /CleanLawn/provider (provider)
 *
 * Credentials from environment variables:
 *   TEST_USER_EMAIL / TEST_USER_PASSWORD
 */

const EMAIL    = process.env.TEST_USER_EMAIL    || '';
const PASSWORD = process.env.TEST_USER_PASSWORD || '';

test.describe('Login Page @critical', () => {

  test('login page loads with correct branding', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(login.brandHeading).toBeVisible();
    await expect(login.subHeading).toBeVisible();
  });

  test('email and password fields are present', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(login.emailField).toBeVisible();
    await expect(login.passwordField).toBeVisible();
    await expect(login.submitButton).toBeVisible();
    await expect(login.submitButton).toBeEnabled();
  });

  test('invalid credentials show error message', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.login('wrong@example.com', 'wrongpassword123');

    // Supabase returns "Incorrect email or password." for invalid credentials
    await expect(login.errorMessage).toBeVisible({ timeout: 10_000 });
    const errorText = await login.errorMessage.textContent();
    expect(errorText?.toLowerCase()).toMatch(/incorrect|invalid/);
  });

  test('login with empty fields shows validation', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.submitButton.click();

    const emailInvalid = await login.emailField.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(emailInvalid, 'Email field should be invalid when empty').toBe(true);
  });

  // ── Only run if credentials are configured ─────────────────────────────────
  test('valid credentials redirect to home or dashboard', async ({ page }) => {
    if (!EMAIL || !PASSWORD) {
      test.skip(true, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set');
    }

    const login = new LoginPage(page);
    await login.goto();
    await login.login(EMAIL, PASSWORD);

    // Detect wrong credentials early instead of hitting the 15s timeout
    const loginRejected = await login.errorMessage.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(loginRejected, 'Credentials rejected by Supabase — verify TEST_USER_EMAIL / TEST_USER_PASSWORD in GitHub Secrets').toBe(false);

    // Should redirect away from /login to /, /admin, or /CleanLawn/provider
    await page.waitForURL(url => !url.pathname.endsWith('/login'), { timeout: 15_000 });
    expect(page.url()).not.toContain('/login');
  });

});
