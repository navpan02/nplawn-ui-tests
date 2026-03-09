import { Page, Locator } from '@playwright/test';

/**
 * NPLawn Login Page — /NP02/login
 *
 * Auth is handled via Supabase (signInWithPassword).
 * On success: redirects to / (regular user), /admin (admin), /CleanLawn/provider (provider)
 * Error messages come from Supabase response, e.g. "Incorrect email or password."
 */
export class LoginPage {
  readonly page: Page;

  // ─── Header ───────────────────────────────────────────────────────────────
  readonly brandHeading:  Locator;  // "NPLawn LLC" in dark header
  readonly subHeading:    Locator;  // "Sign in to your account"

  // ─── Form ─────────────────────────────────────────────────────────────────
  readonly emailField:    Locator;  // type="email"
  readonly passwordField: Locator;  // type="password"
  readonly submitButton:  Locator;  // form submit button

  // ─── Feedback ─────────────────────────────────────────────────────────────
  readonly errorMessage:  Locator;  // "Incorrect email or password." etc.
  readonly successToast:  Locator;  // Green toast shown after successful verify

  constructor(page: Page) {
    this.page = page;

    this.brandHeading  = page.locator('text=NPLawn LLC').first();
    this.subHeading    = page.locator('text=Sign in to your account');

    this.emailField    = page.locator('input[type="email"]');
    this.passwordField = page.locator('input[type="password"]').first();
    this.submitButton  = page.locator('button[type="submit"]');

    this.errorMessage  = page.locator('.text-red-600, .text-red-700').first();
    this.successToast  = page.locator('.text-green-700');
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }
}
