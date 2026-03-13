import { Page, Locator } from '@playwright/test';

/**
 * NPLawn Home Page — /NP02/
 * React SPA served from https://navpan02.github.io/NP02
 */
export class HomePage {
  readonly page: Page;

  // ─── Hero Section ──────────────────────────────────────────────────────────
  readonly heroBadge:      Locator;  // "Locally Owned Since 2017"
  readonly heroHeading:    Locator;  // "Your Lawn, Our Expertise."
  readonly buyNowButton:   Locator;  // Primary CTA → /buy-now
  readonly viewServicesButton: Locator; // Secondary CTA → /lawn-care

  // ─── Stats ─────────────────────────────────────────────────────────────────
  readonly stat500:        Locator;  // "500+" Properties Served
  readonly stat8yrs:       Locator;  // "8 yrs" In Business
  readonly stat49:         Locator;  // "4.9★" Average Rating

  // ─── Navigation ────────────────────────────────────────────────────────────
  readonly nav:            Locator;  // sticky nav bar
  readonly navGetQuote:    Locator;  // "Get a Quote" nav link

  constructor(page: Page) {
    this.page = page;

    this.heroBadge         = page.locator('text=Locally Owned Since 2017');
    this.heroHeading       = page.locator('h1').filter({ hasText: 'Your Lawn' });
    this.buyNowButton      = page.locator('a[href*="buy-now"]').filter({ hasText: 'Buy Now' });
    this.viewServicesButton= page.locator('a[href*="lawn-care"]').filter({ hasText: 'View Services' });

    this.stat500           = page.locator('text=500+');
    this.stat8yrs          = page.locator('text=8 yrs');
    this.stat49            = page.locator('text=4.9★');

    this.nav               = page.locator('nav.sticky, nav[class*="sticky"]');
    this.navGetQuote       = page.locator('nav a, nav button').filter({ hasText: 'Get a Quote' });
  }

  async goto() {
    await this.page.goto('./');
    await this.page.waitForLoadState('networkidle');
  }
}
