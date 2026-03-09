import { Page, Locator } from '@playwright/test';

/**
 * NPLawn Contact Page — /NP02/contact
 *
 * Form uses className="form-input" / "form-textarea" with no name attributes.
 * Fields are identified by type and placeholder values from source.
 */
export class ContactFormPage {
  readonly page: Page;

  // ─── Page ──────────────────────────────────────────────────────────────────
  readonly pageHero:       Locator;  // "Let's Talk About Your Lawn"
  readonly heroBadge:      Locator;  // "Get in Touch"

  // ─── Form Fields ───────────────────────────────────────────────────────────
  readonly nameField:      Locator;  // Full Name *, placeholder="Jane Smith"
  readonly emailField:     Locator;  // Email, type="email", placeholder="jane@example.com"
  readonly phoneField:     Locator;  // Phone, type="tel", placeholder="(630) 555-0100"
  readonly serviceSelect:  Locator;  // Service Interested In, className="form-input" select
  readonly messageField:   Locator;  // Message *, textarea className="form-textarea"
  readonly submitButton:   Locator;  // "Send Message", className="btn-primary"

  // ─── Post-Submission ───────────────────────────────────────────────────────
  readonly successHeading: Locator;  // "Message Received!" h3
  readonly successMessage: Locator;  // "We'll be in touch within one business day."
  readonly errorBanner:    Locator;  // Red error banner (validation)

  constructor(page: Page) {
    this.page = page;

    this.pageHero       = page.locator('h1').filter({ hasText: "Let's Talk About" });
    this.heroBadge      = page.locator('.page-hero-badge').filter({ hasText: 'Get in Touch' });

    // Fields: no name attributes — matched by type/placeholder
    this.nameField      = page.locator('input.form-input[type="text"]').first();
    this.emailField     = page.locator('input.form-input[type="email"]');
    this.phoneField     = page.locator('input.form-input[type="tel"]');
    this.serviceSelect  = page.locator('select.form-input');
    this.messageField   = page.locator('textarea.form-textarea');
    this.submitButton   = page.locator('button.btn-primary', { hasText: 'Send Message' });

    this.successHeading = page.locator('h3').filter({ hasText: 'Message Received!' });
    this.successMessage = page.locator('text=We\'ll be in touch within one business day');
    this.errorBanner    = page.locator('.text-red-600, .border-red-200').first();
  }

  async goto() {
    await this.page.goto('/contact');
    await this.page.waitForLoadState('networkidle');
  }

  async fillAndSubmit(data: {
    name: string;
    email: string;
    phone?: string;
    service?: string;
    message: string;
  }) {
    await this.nameField.fill(data.name);
    await this.emailField.fill(data.email);
    if (data.phone) await this.phoneField.fill(data.phone);
    if (data.service) await this.serviceSelect.selectOption({ label: data.service });
    await this.messageField.fill(data.message);
    await this.submitButton.click();
  }
}
