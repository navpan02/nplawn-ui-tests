import { Page, Locator } from '@playwright/test';

/**
 * NPLawn Buy Flow — /buy-now
 * 4-step wizard: Property Details → Map & Lawn Size → Select Plan → Review & Order → Confirmation
 *
 * Step 1 — Property Details:
 *   Fields: Property Address *, Phone Number, Email Address
 *   Button: "Continue — View Your Property on Map →"
 *
 * Step 2 — Map & Lawn Size:
 *   Leaflet map auto-loaded from address. Editable lawn size input.
 *   Button: "See Pricing Plans →"
 *
 * Step 3 — Select Plan:
 *   Three plan cards: GrassBasic, GrassPro (Most Popular, pre-selected), GrassNatural
 *   Button: "Continue to Review →"
 *
 * Step 4 — Review & Order:
 *   Full Name input, SELECTED PLAN summary card, pricing breakdown
 *   Button: "Place Order →"
 *
 * Confirmation:
 *   H1: "Thank You, [name]!"  Order ID: NPL-XXXXXX
 *   Buttons: "Back to Home", "Contact Us"
 */
export class BuyFlowPage {
  readonly page: Page;

  // ─── Step 1: Property Details ──────────────────────────────────────────────
  readonly pageHeading:      Locator;  // "Get Started with NPLawn"
  readonly stepIndicator:    Locator;  // "Property Details" label on step 1 circle
  readonly addressField:     Locator;  // Property Address *, placeholder="123 Main St, Naperville, IL"
  readonly phoneField:       Locator;  // Phone Number, placeholder="(630) 555-0100"
  readonly emailField:       Locator;  // Email Address, placeholder="you@example.com"
  readonly continueToMapBtn: Locator;  // "Continue — View Your Property on Map →"

  // ─── Step 2: Map & Lawn Size ───────────────────────────────────────────────
  readonly mapHeading:         Locator;  // "Your Property on the Map"
  readonly mapContainer:       Locator;  // .leaflet-container
  readonly lawnSizeLabel:      Locator;  // "ESTIMATED LAWN SIZE"
  readonly lawnSizeAdjustInput: Locator; // Editable sq ft input ("Adjust if needed")
  readonly seePricingBtn:      Locator;  // "See Pricing Plans →"

  // ─── Step 3: Select Plan ───────────────────────────────────────────────────
  readonly planHeading:         Locator;  // "Choose Your Plan"
  readonly grassBasicCard:      Locator;  // GrassBasic heading inside its card
  readonly grassProCard:        Locator;  // GrassPro heading inside its card (pre-selected)
  readonly grassNaturalCard:    Locator;  // GrassNatural heading inside its card
  readonly continueToReviewBtn: Locator;  // "Continue to Review →"

  // ─── Step 4: Review & Order ────────────────────────────────────────────────
  readonly reviewHeading:    Locator;  // "Review & Place Your Order"
  readonly fullNameField:    Locator;  // "Your Full Name *", placeholder="Jane Smith", maxlength=50
  readonly selectedPlanCard: Locator;  // "SELECTED PLAN" dark summary card
  readonly placeOrderBtn:    Locator;  // "Place Order →"

  // ─── Confirmation ──────────────────────────────────────────────────────────
  readonly confirmationHeading: Locator;  // "Thank You, [name]!"
  readonly orderIdLocator:      Locator;  // Text containing NPL-XXXXXX
  readonly orderSummary:        Locator;  // "ORDER SUMMARY" section heading
  readonly backToHomeBtn:       Locator;  // "Back to Home" button
  readonly contactUsBtn:        Locator;  // "Contact Us" button

  constructor(page: Page) {
    this.page = page;

    // Step 1
    this.pageHeading      = page.locator('h1').filter({ hasText: 'Get Started with NPLawn' });
    this.stepIndicator    = page.locator('text=Property Details').first();
    this.addressField     = page.locator('input[placeholder*="Main St"]');
    this.phoneField       = page.locator('input[placeholder*="555-0100"]');
    this.emailField       = page.locator('input[type="email"], input[placeholder*="example.com"]').first();
    this.continueToMapBtn = page.locator('button').filter({ hasText: /Continue.*Map/i });

    // Step 2
    this.mapHeading          = page.locator('h1, h2, h3').filter({ hasText: /property.*map|map.*property|your property|step 2/i }).first();
    this.mapContainer        = page.locator('.leaflet-container');
    this.lawnSizeLabel       = page.locator('text=ESTIMATED LAWN SIZE');
    this.lawnSizeAdjustInput = page.locator('input[type="number"]').first();
    this.seePricingBtn       = page.locator('button').filter({ hasText: /pricing|see.*plan|view.*plan/i }).first();

    // Step 3
    this.planHeading         = page.locator('h1, h2').filter({ hasText: 'Choose Your Plan' });
    this.grassBasicCard      = page.locator('h2, h3').filter({ hasText: 'GrassBasic' }).first();
    this.grassProCard        = page.locator('h2, h3').filter({ hasText: 'GrassPro' }).first();
    this.grassNaturalCard    = page.locator('h2, h3').filter({ hasText: 'GrassNatural' }).first();
    this.continueToReviewBtn = page.locator('button').filter({ hasText: /Continue to Review/i });

    // Step 4
    this.reviewHeading    = page.locator('h1, h2').filter({ hasText: 'Review & Place Your Order' });
    this.fullNameField    = page.locator('input[placeholder="Jane Smith"]');
    this.selectedPlanCard = page.locator('text=SELECTED PLAN');
    this.placeOrderBtn    = page.locator('button').filter({ hasText: /Place Order/i });

    // Confirmation
    this.confirmationHeading = page.locator('h1').filter({ hasText: 'Thank You' });
    this.orderIdLocator      = page.getByText(/NPL-\d+/).first();
    this.orderSummary        = page.locator('text=ORDER SUMMARY');
    this.backToHomeBtn       = page.locator('a, button').filter({ hasText: 'Back to Home' }).first();
    this.contactUsBtn        = page.locator('a, button').filter({ hasText: 'Contact Us' }).first();
  }

  async goto() {
    await this.page.goto('buy-now');
    await this.page.waitForLoadState('networkidle');
  }

  async fillStep1(data: { address: string; phone?: string; email?: string }) {
    await this.addressField.fill(data.address);
    if (data.phone) await this.phoneField.fill(data.phone);
    if (data.email) await this.emailField.fill(data.email);
  }
}
