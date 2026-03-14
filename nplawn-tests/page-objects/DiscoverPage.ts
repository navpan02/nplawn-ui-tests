import { Page, Locator } from '@playwright/test';

/**
 * NPLawn Discover / Provider Directory — /NP02/discover
 * Accessible via: CleanLawn Marketplace → "Find & Browse Providers"
 *
 * UI:
 *   Badge:    "CLEANLAWN MARKETPLACE"
 *   H1:       "Find Local Lawn Care Professionals"
 *   Search:   input[placeholder*="60540"], "Search Providers" button
 *   Filters:  "All Services" tab (default), + service filter tabs across top
 *   Results:  "N providers found" count text, provider cards
 *   Sort:     "Best Rating" select dropdown
 *   Each card: provider name, location, availability badge,
 *              "View Profile" button + "Get Quote" button
 *
 * Provider Profile — /NP02/CleanLawn/provider/[slug]
 *   H1:   provider name
 *   Badge: "Available"
 *   CTA:  "Request a Quote" button (hero) + "Get a Quote" button (sidebar card)
 *   Heading in sidebar card: "READY TO GET STARTED?"
 */
export class DiscoverPage {
  readonly page: Page;

  // ─── Hero / Search Section ────────────────────────────────────────────────
  readonly pageBadge:         Locator;  // "CLEANLAWN MARKETPLACE"
  readonly pageHeading:       Locator;  // "Find Local Lawn Care Professionals"
  readonly searchInput:       Locator;  // placeholder="ZIP code or city (e.g. 60540, Naperville)"
  readonly searchButton:      Locator;  // "Search Providers"

  // ─── Filter Tabs ──────────────────────────────────────────────────────────
  readonly allServicesTab:    Locator;  // "All Services" (default selected)
  readonly lawnMowingTab:     Locator;  // "Lawn Mowing"
  readonly treeTrimmingTab:   Locator;  // "Tree Trimming"

  // ─── Results / Sort ───────────────────────────────────────────────────────
  readonly providersFoundText: Locator; // "N providers found"
  readonly sortDropdown:       Locator; // "Best Rating" sort select
  readonly filtersButton:      Locator; // "Filters" button

  // ─── Provider Cards (first card) ─────────────────────────────────────────
  readonly providerCards:      Locator; // all provider card containers
  readonly firstViewProfile:   Locator; // "View Profile" on first card
  readonly firstGetQuote:      Locator; // "Get Quote" on first card

  // ─── Provider Profile Page ────────────────────────────────────────────────
  readonly profileAvailableBadge: Locator;  // "Available" badge on profile
  readonly profileRequestQuoteBtn: Locator; // "Request a Quote" in profile hero
  readonly profileGetQuoteBtn:     Locator; // "Get a Quote" in sidebar card
  readonly profileReadyHeading:    Locator; // "READY TO GET STARTED?"

  constructor(page: Page) {
    this.page = page;

    // Hero / Search
    this.pageBadge    = page.locator('text=CLEANLAWN MARKETPLACE').first();
    this.pageHeading  = page.locator('h1').filter({ hasText: 'Find Local Lawn Care Professionals' });
    this.searchInput  = page.locator('input[placeholder*="60540"]');
    this.searchButton = page.locator('button').filter({ hasText: /search providers/i });

    // Filters
    this.allServicesTab  = page.locator('button, [role="tab"]').filter({ hasText: /^all services$/i }).first();
    this.lawnMowingTab   = page.locator('button, [role="tab"]').filter({ hasText: /^lawn mowing$/i }).first();
    this.treeTrimmingTab = page.locator('button, [role="tab"]').filter({ hasText: /^tree trimming$/i }).first();

    // Results
    this.providersFoundText = page.locator('text=/\\d+ providers? found/i');
    this.sortDropdown       = page.locator('select').filter({ hasText: /best rating/i })
                                  .or(page.locator('[class*="sort"] select, [class*="sort"] button').first());
    this.filtersButton      = page.locator('button').filter({ hasText: /^filters$/i });

    // Provider cards — the card wrappers contain both "View Profile" and "Get Quote"
    this.providerCards    = page.locator('main').locator('[class*="card"], [class*="provider"]').filter({ has: page.locator('button', { hasText: /view profile/i }) });
    this.firstViewProfile = page.locator('button').filter({ hasText: /view profile/i }).first();
    this.firstGetQuote    = page.locator('main').locator('button').filter({ hasText: /^get quote$/i }).first();

    // Provider Profile
    this.profileAvailableBadge   = page.locator('text=Available').first();
    this.profileRequestQuoteBtn  = page.locator('button').filter({ hasText: /request a quote/i }).first();
    this.profileGetQuoteBtn      = page.locator('a, button').filter({ hasText: /^get a quote$/i }).first();
    this.profileReadyHeading     = page.locator('text=READY TO GET STARTED?');
  }

  async goto() {
    await this.page.goto('discover');
    await this.page.waitForLoadState('networkidle');
  }

  /** Navigate via the header nav: CleanLawn Marketplace → Find & Browse Providers */
  async gotoViaNav() {
    await this.page.goto('./');
    await this.page.waitForLoadState('networkidle');

    // Open the "CleanLawn Marketplace" dropdown
    await this.page.locator('nav').getByRole('button', { name: /cleanlawn marketplace/i })
      .or(this.page.locator('nav').getByText(/cleanlawn marketplace/i).first())
      .click();

    // Click "Find & Browse Providers" in the dropdown
    await this.page.getByRole('link', { name: /find.*browse providers/i })
      .or(this.page.locator('a').filter({ hasText: /find.*browse providers/i }).first())
      .click();

    await this.page.waitForLoadState('networkidle');
  }
}
