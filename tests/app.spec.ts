import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

test('home and parent gate have no serious accessibility violations', async ({ page }) => {
  const home = await new AxeBuilder({ page: page as never }).analyze();
  expect(home.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Parent desk' }).click();
  const gate = await new AxeBuilder({ page: page as never }).analyze();
  expect(gate.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
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
  await page.goto('/terms/');
  await expect(page.locator('h1')).toHaveText('Terms');
});
