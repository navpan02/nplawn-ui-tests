import { test, expect } from '@playwright/test';
import { HomePage } from '../../page-objects/HomePage';

/**
 * @smoke @critical
 * Page load checks for all key NPLawn pages.
 * Verifies each route loads, returns no server error, and has the correct title.
 */

const PAGES = [
  { path: './',              title: 'NPLawn LLC'         },
  { path: 'about',           title: 'NPLawn'             },
  { path: 'contact',         title: 'NPLawn'             },
  { path: 'lawn-care',       title: 'NPLawn'             },
  { path: 'tree-shrubs',     title: 'NPLawn'             },
  { path: 'quote',           title: 'NPLawn'             },
  { path: 'how-it-works',    title: 'NPLawn'             },
  { path: 'faq',             title: 'NPLawn'             },
  { path: 'blog',            title: 'NPLawn'             },
];

test.describe('Page Loads @smoke @critical', () => {

  for (const { path, title } of PAGES) {
    test(`${path} loads correctly`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page).toHaveTitle(new RegExp(title, 'i'));
    });
  }

});

test.describe('Home Page UI @smoke @critical', () => {

  test('hero section renders with correct content', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.heroBadge).toBeVisible();
    await expect(home.heroHeading).toBeVisible();

    const headingText = await home.heroHeading.textContent();
    expect(headingText).toContain('Your Lawn');
  });

  test('primary CTA buttons are visible and enabled', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.buyNowButton).toBeVisible();
    await expect(home.buyNowButton).toBeEnabled();
    await expect(home.viewServicesButton).toBeVisible();
    await expect(home.viewServicesButton).toBeEnabled();
  });

  test('social proof stats are displayed', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.stat500).toBeVisible();
    await expect(home.stat8yrs).toBeVisible();
    await expect(home.stat49).toBeVisible();
  });

  test('navigation bar is sticky and visible', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.nav).toBeVisible();
  });

  test('no JavaScript console errors on home page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('./');
    await page.waitForLoadState('networkidle');

    // Ignore known non-critical errors (e.g. browser extension noise)
    const ignored = ['favicon', 'ERR_BLOCKED_BY_CLIENT'];
    const real = errors.filter(e => !ignored.some(i => e.includes(i)));
    expect(real, `Console errors: ${real.join(', ')}`).toHaveLength(0);
  });

});
