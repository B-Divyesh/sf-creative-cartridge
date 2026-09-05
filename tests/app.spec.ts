import { expect, test, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const activityActions = ['Paint with sound', 'Set a story', 'Make six frames', 'Tap a rhythm', 'Print a creature', 'Raise the curtain'];
const seriousOrCritical = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) => violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''));

async function removeProductData(page: Page) {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    await Promise.all(['creative-cartridge', 'demo:creative-cartridge'].map(name => new Promise<void>(resolve => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve(); request.onerror = () => resolve(); request.onblocked = () => resolve();
    })));
  });
}

async function openDemo(page: Page) {
  await removeProductData(page);
  await page.goto('/demo');
  await expect(page.getByRole('complementary', { name: 'Demo controls' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Six saved sample pieces' })).toBeVisible();
}

async function setDemoPin(page: Page, pin = '2468') {
  await page.getByRole('button', { name: 'Parent desk', exact: true }).click();
  await page.getByLabel('New four-digit PIN').fill(pin);
  await page.getByRole('button', { name: 'Set PIN and open' }).click();
  await expect(page.getByRole('heading', { name: 'Parent desk' })).toBeVisible();
}

async function closeActivity(page: Page) {
  await page.getByRole('button', { name: 'Return to the front page' }).click();
  await expect(page.getByRole('heading', { name: /Try six offline creative activities/ })).toBeVisible();
}

async function makeOnePiece(page: Page, action: string) {
  await page.getByRole('button', { name: action, exact: true }).click();
  if (action === 'Paint with sound') { await page.locator('canvas').focus(); await page.keyboard.press('Space'); await page.getByRole('button', { name: 'Save this score' }).click(); }
  if (action === 'Set a story') { await page.getByRole('button', { name: 'Add a circle' }).click(); await page.getByRole('button', { name: 'Save this story page' }).click(); }
  if (action === 'Make six frames') { for (let number = 1; number <= 6; number += 1) await page.getByRole('button', { name: `Print frame ${number}` }).click(); await expect(page.getByText('Six frames are ready to play.')).toBeVisible(); await page.getByRole('button', { name: 'Save these cards' }).click(); }
  if (action === 'Tap a rhythm') { await page.keyboard.press('1'); await page.keyboard.press('2'); await page.getByRole('button', { name: 'Save this rhythm' }).click(); }
  if (action === 'Print a creature') { await page.getByRole('button', { name: 'Print a name' }).click(); await page.getByRole('button', { name: 'Save this species' }).click(); }
  if (action === 'Raise the curtain') await page.getByRole('button', { name: 'Save this little stage' }).click();
  await expect(page.getByText('Saved to this device.')).toBeVisible();
}

test('@claim:finite-activities six complete activities make a saved piece', async ({ page }) => {
  await openDemo(page);
  for (const action of activityActions) { await makeOnePiece(page, action); await closeActivity(page); }
  await expect(page.getByRole('heading', { name: 'Six saved sample pieces' })).toBeVisible();
});

test('@claim:offline-reload demo reloads offline after its first visit', async ({ browser }: { browser: Browser }) => {
  const context = await browser.newContext(); const page = await context.newPage();
  await openDemo(page);
  await page.waitForFunction(() => 'serviceWorker' in navigator); await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) { await page.reload(); await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller)); }
  await context.setOffline(true); await page.reload();
  await expect(page.getByRole('heading', { name: 'Try six offline creative activities' })).toBeVisible();
  await expect(page.getByText('Offline — the cartridge still works')).toBeVisible();
  await context.close();
});

test('@claim:no-tracking demo use makes only same-origin requests', async ({ page }) => {
  await removeProductData(page); const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  await page.goto('/demo'); await makeOnePiece(page, 'Set a story'); await closeActivity(page);
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:local-demo-isolation demo changes do not alter a parent-curated real issue', async ({ page }) => {
  await removeProductData(page); await page.goto('/');
  await page.getByRole('button', { name: 'Parent desk', exact: true }).click(); await page.getByLabel('New four-digit PIN').fill('2468'); await page.getByRole('button', { name: 'Set PIN and open' }).click();
  const selections = page.locator('.check-list input'); for (let index = 1; index < 6; index += 1) await selections.nth(index).uncheck();
  await page.getByRole('button', { name: 'Publish these departments' }).click(); await expect(page.locator('.activity-card')).toHaveCount(1);
  await page.goto('/demo'); await expect(page.locator('.activity-card')).toHaveCount(6); await makeOnePiece(page, 'Set a story');
  await page.getByRole('button', { name: 'Start for real' }).click(); await expect(page.locator('.activity-card')).toHaveCount(1); await expect(page.locator('.saved-list')).toHaveCount(0);
});

test('@claim:parent-curation a parent can publish a smaller activity set', async ({ page }) => {
  await openDemo(page); await setDemoPin(page); const selections = page.locator('.check-list input'); for (let index = 2; index < 6; index += 1) await selections.nth(index).uncheck();
  await page.getByRole('button', { name: 'Publish these departments' }).click(); await expect(page.locator('.activity-card')).toHaveCount(2);
});

test('@claim:local-persistence a saved sample piece survives a reload', async ({ page }) => {
  await openDemo(page); await makeOnePiece(page, 'Set a story'); await page.reload();
  await expect(page.getByText(/Shape story with 1 pieces/)).toBeVisible();
});

test('@claim:json-export parent export downloads a JSON backup with saved work', async ({ page }) => {
  await openDemo(page); await setDemoPin(page); const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: /Export 6 saved pieces/ }).click();
  const download = await downloadPromise; const backup = JSON.parse(await readFile(await download.path()!, 'utf8')) as { product: string; works: unknown[] };
  expect(backup.product).toBe('creative-cartridge'); expect(backup.works).toHaveLength(6);
});

test('@claim:additive-import valid imports add work without removing the sample archive', async ({ page }) => {
  await openDemo(page); await setDemoPin(page);
  const backup = { works: [{ id: 'new-imported-story', activity: 'shape-story', title: 'Imported story from a grandparent', createdAt: '2026-09-01T12:00:00.000Z', data: { pieces: [] } }] };
  await page.locator('input[type="file"]').setInputFiles({ name: 'creative-cartridge.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.getByText('Imported 1 piece.')).toBeVisible(); await expect(page.getByRole('button', { name: /Export 7 saved pieces/ })).toBeVisible();
});

test('@claim:clear-archive a parent can permanently clear the sample archive', async ({ page }) => {
  await openDemo(page); await setDemoPin(page); page.once('dialog', dialog => dialog.accept()); await page.getByRole('button', { name: 'Clear all saved pieces' }).click();
  await expect(page.getByText('All saved pieces were removed from this browser.')).toBeVisible(); await expect(page.getByRole('button', { name: 'Export 0 saved pieces' })).toBeDisabled();
});

test('@claim:parent-pin a four-digit PIN gates settings and stores no readable PIN', async ({ page }) => {
  await openDemo(page); await setDemoPin(page, '2468'); await page.getByRole('button', { name: 'Close parent desk' }).click(); await page.reload();
  await page.getByRole('button', { name: 'Parent desk', exact: true }).click(); await page.getByLabel('Parent PIN').fill('1111'); await page.getByRole('button', { name: 'Open the desk' }).click();
  await expect(page.getByRole('alert')).toContainText('did not match'); const storedPin = await page.evaluate(() => localStorage.getItem('demo:cc_parent_pin'));
  expect(storedPin).toMatch(/^[a-f0-9]{64}$/); expect(storedPin).not.toContain('2468');
});

test('@claim:small-download small-download display removes the cover image', async ({ page }) => {
  await openDemo(page); await setDemoPin(page); await page.locator('input[data-small]').check(); await expect(page.locator('.hero picture')).toBeHidden();
});

test('@claim:weekend-ink-checkout Weekend Ink shows $6 once and starts hosted checkout', async ({ page }) => {
  await openDemo(page); await setDemoPin(page); await expect(page.getByRole('dialog').getByRole('heading', { name: 'Weekend Ink — $6 USD once' })).toBeVisible();
  const popupPromise = page.context().waitForEvent('page'); await page.getByRole('link', { name: 'Buy Weekend Ink' }).click(); const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded'); expect(new URL(popup.url()).hostname).toMatch(/(^|\.)dodopayments\.com$/); await popup.close();
});

test('@claim:license-return a returned license is stored, removed from the URL, checked once, and used from cache offline', async ({ browser }: { browser: Browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => { const originalFetch = window.fetch.bind(window); window.fetch = (input, init) => String(input).includes('/verify?') ? (() => { const calls = Number(sessionStorage.getItem('verification-calls') ?? '0') + 1; sessionStorage.setItem('verification-calls', String(calls)); return Promise.resolve(new Response(JSON.stringify({ valid: true, reason: 'ok', expires_at: null }), { headers: { 'Content-Type': 'application/json' } })); })() : originalFetch(input, init); });
  const page = await context.newPage(); await removeProductData(page); await page.goto('/demo?license=sample-license');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('demo:cc_license_verdict'))).toContain('"valid":true'); expect(page.url()).not.toContain('license=');
  expect(await page.evaluate(() => localStorage.getItem('demo:sb_license:creative-cartridge'))).toBe('sample-license'); await page.reload();
  expect(await page.evaluate(() => sessionStorage.getItem('verification-calls'))).toBe('1');
  await page.evaluate(() => navigator.serviceWorker.ready); if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload(); await context.setOffline(true); await page.reload();
  await expect(page.getByRole('heading', { name: 'Try six offline creative activities' })).toBeVisible(); await context.close();
});

test('@claim:weekend-ink-extras a verified Weekend Ink license adds an extra paper stamp', async ({ page }) => {
  await page.addInitScript(() => { const originalFetch = window.fetch.bind(window); window.fetch = (input, init) => String(input).includes('/verify?') ? Promise.resolve(new Response(JSON.stringify({ valid: true, reason: 'ok', expires_at: null }), { headers: { 'Content-Type': 'application/json' } })) : originalFetch(input, init); });
  await removeProductData(page); await page.goto('/demo?license=extra-stamps'); await expect.poll(() => page.evaluate(() => localStorage.getItem('demo:cc_license_verdict'))).toContain('"valid":true');
  await page.getByRole('button', { name: 'Set a story', exact: true }).click(); await expect(page.getByRole('button', { name: 'Add a Weekend comet' })).toBeVisible();
});

test('@claim:core-stays-free sample activities and archive controls work without Weekend Ink', async ({ page }) => {
  await openDemo(page); await makeOnePiece(page, 'Tap a rhythm'); await closeActivity(page); await setDemoPin(page);
  await expect(page.getByRole('button', { name: /Export 7 saved pieces/ })).toBeEnabled(); await expect(page.getByText('Weekend Ink is active on this device.')).toHaveCount(0);
});

test('mobile first screen states the job, audience, and sample action before scrolling', async ({ page }) => {
  await removeProductData(page); await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/'); await expect(page.locator('h1')).toHaveText('Set up offline creative play');
  await expect(page.getByText('For parents setting up an older computer for a child ages 4–7.')).toBeVisible(); const action = page.getByRole('link', { name: 'Try it with sample data' }); await expect(action).toBeVisible();
  const box = await action.boundingBox(); expect(box!.y + box!.height).toBeLessThanOrEqual(844); await expect(page.getByText('Works offline after the first visit.')).toBeVisible();
});

test('activity URLs have titles and browser back and forward restore the screen', async ({ page }) => {
  await openDemo(page); await page.getByRole('button', { name: 'Set a story', exact: true }).click(); await expect(page).toHaveURL(/\/demo\/activities\/shape-story$/); await expect(page).toHaveTitle('Shape stories — Creative Cartridge');
  await expect(page.locator('.sheet h1')).toHaveText('Shape stories'); await page.goBack(); await expect(page).toHaveURL(/\/demo$/); await expect(page.getByRole('heading', { name: 'Try six offline creative activities' })).toBeVisible(); await page.goForward(); await expect(page.locator('.sheet h1')).toHaveText('Shape stories');
});

test('legal pages and 404 use the shared frame and route-specific titles', async ({ page }) => {
  await page.goto('/privacy/'); await expect(page).toHaveTitle('Privacy — Creative Cartridge'); await expect(page.getByRole('link', { name: 'Creative Cartridge', exact: true })).toBeVisible(); await expect(page.getByText('Built by Param Factory')).toBeVisible();
  await page.goto('/terms/'); await expect(page).toHaveTitle('Terms — Creative Cartridge'); await page.goto('/not-a-real-cartridge-page'); await expect(page).toHaveTitle('Page not found — Creative Cartridge'); await expect(page.locator('h1')).toHaveText('This page is not in the cartridge');
});

test('all routes have no serious accessibility violations', async ({ page }) => {
  await openDemo(page);
  for (const action of activityActions) { await page.getByRole('button', { name: action, exact: true }).click(); const report = await new AxeBuilder({ page: page as never }).analyze(); expect(seriousOrCritical(report.violations), action).toEqual([]); await closeActivity(page); }
  const homeReport = await new AxeBuilder({ page: page as never }).analyze(); expect(seriousOrCritical(homeReport.violations)).toEqual([]);
});

test('static deployment configuration has a designed 404 and known direct routes', async () => {
  const config = JSON.parse(await readFile('dist/staticwebapp.config.json', 'utf8')) as { routes: Array<{ route: string; rewrite?: string }>; responseOverrides: Record<string, { rewrite: string }> };
  expect(config.responseOverrides['404'].rewrite).toBe('/404.html'); expect(config.routes.filter(route => route.rewrite === '/index.html')).toHaveLength(14);
});
