import { test, expect } from '@playwright/test';

test.describe('Example E2E Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/dungeon master/i);
  });

  test('can navigate to campaigns page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /campaigns/i }).click();
    await expect(page).toHaveURL(/\/campaigns/);
  });
});

