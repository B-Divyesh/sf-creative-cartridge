import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const activityActions = [
  'Paint with sound',
  'Set a story',
  'Make six frames',
  'Tap a rhythm',
  'Print a creature',
  'Raise the curtain'
];

const seriousOrCritical = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
  violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''));

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('creative-cartridge');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });
    if ('serviceWorker' in navigator) await navigator.serviceWorker.ready;
  });
  await page.reload();
});

test('front page is finite and all six activities open', async ({ page }) => {
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.activity-card')).toHaveCount(6);
  for (const button of await page.locator('[data-activity]').all()) {
    await button.click();
    await expect(page.locator('.sheet')).toBeVisible();
    await page.getByRole('button', { name: 'Return to the front page' }).click();
  }
});

test('parent can set PIN and publish a smaller issue', async ({ page }) => {
  await page.getByRole('button', { name: 'Parent desk' }).click();
  await page.getByLabel('New four-digit PIN').fill('2468');
  await page.getByRole('button', { name: 'Set PIN and open' }).click();
  await expect(page.getByRole('heading', { name: 'Parent desk' })).toBeVisible();
  const checks = page.locator('.check-list input');
  for (let index = 2; index < 6; index += 1) await checks.nth(index).uncheck();
  await page.getByRole('button', { name: 'Publish these departments' }).click();
  await expect(page.locator('.activity-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Parent desk' }).click();
  await page.getByLabel('Parent PIN').fill('2468');
  await page.getByRole('button', { name: 'Open the desk' }).click();
  await expect(page.getByText('2 saved pieces')).toHaveCount(0);
});

test('shape story gives an empty state, creates, and saves locally', async ({ page }) => {
  await page.getByRole('button', { name: /Set a story/ }).click();
  await expect(page.getByText('The page is empty. Add one shape to begin.')).toBeVisible();
  await page.getByRole('button', { name: 'Add a circle' }).click();
  await page.getByRole('button', { name: 'Save this story page' }).click();
  await expect(page.getByText('Saved to this device.')).toBeVisible();
  await expect(page.getByText(/Shape story with 1 pieces/)).toBeVisible();
});

test('keyboard can make and play a rhythm', async ({ page }) => {
  await page.getByRole('button', { name: /Tap a rhythm/ }).click();
  await page.keyboard.press('1');
  await page.keyboard.press('2');
  await expect(page.locator('.beat.on')).toHaveCount(2);
  await page.getByRole('button', { name: 'Play the tape once' }).click();
  await expect(page.getByRole('button', { name: 'Stop the tape' })).toBeVisible();
});

test('skip link transfers keyboard focus to the main content', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to the activities' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('every activity sheet has valid ARIA and contrast on desktop and 390px mobile', async ({ page }) => {
  for (const viewport of [{ label: 'desktop', width: 1280, height: 800 }, { label: '390px mobile', width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const action of activityActions) {
      await page.getByRole('button', { name: action }).click();
      const opacityAtAnimationMidpoint = await page.locator('.sheet').evaluate(element => {
        for (const animation of element.getAnimations()) {
          animation.pause();
          const duration = Number(animation.effect?.getTiming().duration) || 0;
          animation.currentTime = duration / 2;
        }
        return getComputedStyle(element).opacity;
      });
      expect(opacityAtAnimationMidpoint).toBe('1');

      const results = await new AxeBuilder({ page: page as never }).analyze();
      expect(seriousOrCritical(results.violations), `${action} ${viewport.label} accessibility violations`).toEqual([]);

      if (action === 'Make six frames') {
        await expect(page.getByRole('region', { name: 'Six printed frames' })).toHaveAttribute('tabindex', '0');
      }
      if (action === 'Tap a rhythm') {
        await expect(page.getByRole('list', { name: 'Sixteen-hit rhythm tape' })).toBeVisible();
        await expect(page.getByRole('listitem')).toHaveCount(16);
        await expect(page.getByRole('listitem').first()).toContainText('Beat 1, empty');
        await expect(page.locator('.beat[aria-label]')).toHaveCount(0);
      }
      await page.getByRole('button', { name: 'Return to the front page' }).click();
    }
  }
});

test('home and parent gate have no serious accessibility violations', async ({ page }) => {
  const home = await new AxeBuilder({ page: page as never }).analyze();
  expect(seriousOrCritical(home.violations)).toEqual([]);
  await page.getByRole('button', { name: 'Parent desk' }).click();
  const gate = await new AxeBuilder({ page: page as never }).analyze();
  expect(seriousOrCritical(gate.violations)).toEqual([]);
});

test('static deployment policy serves immutable bundles and a typed manifest', async () => {
  const config = JSON.parse(await readFile('dist/staticwebapp.config.json', 'utf8')) as {
    routes: Array<{ route: string; headers: Record<string, string> }>;
    globalHeaders: Record<string, string>;
    mimeTypes: Record<string, string>;
  };
  const route = (path: string) => config.routes.find(item => item.route === path)?.headers;

  expect(route('/assets/*')?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
  expect(route('/sw.js')?.['Cache-Control']).toBe('no-cache, no-store, must-revalidate');
  expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');

  const serviceWorker = await readFile('dist/sw.js', 'utf8');
  expect(serviceWorker).not.toContain('/staticwebapp.config.json');
});

test('installed shell reloads while offline', async ({ page, context }) => {
  await page.waitForFunction(() => 'serviceWorker' in navigator);
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await page.reload();
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  }
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toContainText('Creative');
  await expect(page.getByText('Offline — the cartridge still works')).toBeVisible();
  await context.setOffline(false);
});

test('privacy and terms are real standalone pages', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.locator('h1')).toHaveText('Privacy');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.goto('/terms/');
  await expect(page.locator('h1')).toHaveText('Terms');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('returned purchase license is stored, stripped, and unlocks bonus ink', async ({ page }) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => String(input).includes('/verify?')
      ? Promise.resolve(new Response(JSON.stringify({ valid: true, reason: 'ok', expires_at: null }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      : originalFetch(input, init);
  });
  await page.goto('/?license=test-license-token');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cc_license_verdict'))).toContain('"valid":true');
  expect(page.url()).not.toContain('license=');
  await page.getByRole('button', { name: /Set a story/ }).click();
  await expect(page.getByRole('button', { name: 'Add a Weekend comet' })).toBeVisible();
});
