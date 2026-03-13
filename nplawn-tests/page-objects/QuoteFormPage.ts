import { Page, Locator } from '@playwright/test';

/**
 * NPLawn Quote Form — /NP02/quote  (multi-step, 2 steps)
 * Confirmation page: /NP02/quote/thanks
 *
 * Step 1: Personal details (id attributes present)
 * Step 2: Services & Frequency (button toggles, no id attributes)
 */
export class QuoteFormPage {
  readonly page: Page;

  // ─── Step 1 Fields (have id attributes) ──────────────────────────────────
  readonly nameField:     Locator;  // id="name", placeholder="Jane Smith"
  readonly emailField:    Locator;  // id="email", placeholder="jane@example.com"
  readonly phoneField:    Locator;  // id="phone", placeholder="(630) 555-0100"
  readonly addressField:  Locator;  // id="address", placeholder="123 Main St"
  readonly cityField:     Locator;  // id="city", placeholder="Chicago"
  readonly stateField:    Locator;  // id="state", placeholder="IL"
  readonly zipField:      Locator;  // id="zip", placeholder="60601"
  readonly nextButton:    Locator;  // Step 1 → Step 2 continue button

  // ─── Step 2 Elements ──────────────────────────────────────────────────────
  readonly propertySizeSelect: Locator; // "Property Size (sq ft)" select
  readonly frequencyButtons:   Locator; // One-time, Weekly, Bi-weekly, Monthly, Quarterly buttons
  readonly submitButton:       Locator; // Final submit button

  // ─── Confirmation Page ────────────────────────────────────────────────────
  // Route: /quote/thanks
  // H1: "You're all set, [name]!" (name comes from form state)
  readonly confirmationHeading: Locator;
  readonly confirmationBody:    Locator;  // "We've received your quote request..."
  readonly backHomeButton:      Locator;  // "Back to Home" link

  // ─── Error State ──────────────────────────────────────────────────────────
  readonly errorBanner: Locator;  // Red error banner: bg-red-50 border-red-200

  constructor(page: Page) {
    this.page = page;

    // Step 1
    this.nameField      = page.locator('#name');
    this.emailField     = page.locator('#email');
    this.phoneField     = page.locator('#phone');
    this.addressField   = page.locator('#address');
    this.cityField      = page.locator('#city');
    this.stateField     = page.locator('#state');
    this.zipField       = page.locator('#zip');
    this.nextButton     = page.locator('button[type="button"]').filter({ hasText: /next|continue/i });

    // Step 2
    this.propertySizeSelect = page.locator('select').filter({ hasText: /select approximate size/i });
    this.frequencyButtons   = page.locator('button[type="button"]').filter({ hasText: /weekly|monthly|one-time|quarterly/i });
    this.submitButton       = page.locator('button').filter({ hasText: /submit|request quote|send|get quote|finish|complete/i }).last();

    // Confirmation
    this.confirmationHeading = page.locator('h1').filter({ hasText: "You're all set" });
    this.confirmationBody    = page.locator('text=We\'ve received your quote request');
    this.backHomeButton      = page.locator('a').filter({ hasText: 'Back to Home' });

    this.errorBanner = page.locator('.bg-red-50');
  }

  async goto() {
    await this.page.goto('quote');
    await this.page.waitForLoadState('networkidle');
  }

  async fillStep1(data: {
    name: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  }) {
    await this.nameField.fill(data.name);
    await this.emailField.fill(data.email);
    if (data.phone) await this.phoneField.fill(data.phone);
    await this.addressField.fill(data.address);
    await this.cityField.fill(data.city);
    await this.stateField.fill(data.state);
    await this.zipField.fill(data.zip);
  }

  async selectService(serviceName: string) {
    await this.page.locator('button[type="button"]').filter({ hasText: serviceName }).click();
  }

  async selectFrequency(label: string) {
    await this.page.locator('button[type="button"]').filter({ hasText: label }).click();
  }
}
