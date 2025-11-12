import { test, expect } from '@playwright/test';

test.describe('Full Encounter Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('complete encounter workflow: sign-in → campaign → encounter → players → play turns → complete', async ({
    page,
  }) => {
    await page.goto('/');

    await test.step('Sign in', async () => {
      await page.getByRole('link', { name: /sign in/i }).click();
      await page.waitForURL('**/api/auth/login');
      
      await page.fill('input[name="username"]', process.env.TEST_USER_EMAIL!);
      await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
      await page.getByRole('button', { name: /continue/i }).click();
      
      await page.waitForURL('/');
      await expect(page.getByText(/welcome/i)).toBeVisible();
    });

    await test.step('Create a campaign', async () => {
      await page.getByRole('link', { name: /campaigns/i }).click();
      await page.getByRole('button', { name: /new campaign/i }).click();
      
      const campaignName = `E2E Test Campaign ${Date.now()}`;
      await page.fill('input[name="name"]', campaignName);
      await page.fill('textarea[name="description"]', 'Automated test campaign');
      await page.getByRole('button', { name: /create/i }).click();
      
      await expect(page.getByText(campaignName)).toBeVisible();
    });

    await test.step('Create players', async () => {
      await page.getByRole('button', { name: /add player/i }).click();
      
      await page.fill('input[name="playerName"]', 'Test Fighter');
      await page.fill('input[name="level"]', '5');
      await page.fill('input[name="armorClass"]', '18');
      await page.fill('input[name="maxHP"]', '45');
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.getByText('Test Fighter')).toBeVisible();

      await page.getByRole('button', { name: /add player/i }).click();
      await page.fill('input[name="playerName"]', 'Test Wizard');
      await page.fill('input[name="level"]', '5');
      await page.fill('input[name="armorClass"]', '12');
      await page.fill('input[name="maxHP"]', '30');
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.getByText('Test Wizard')).toBeVisible();
    });

    await test.step('Create encounter', async () => {
      await page.getByRole('link', { name: /encounters/i }).click();
      await page.getByRole('button', { name: /new encounter/i }).click();
      
      const encounterName = `E2E Test Encounter ${Date.now()}`;
      await page.fill('input[name="name"]', encounterName);
      
      await page.getByRole('button', { name: /add enemy/i }).click();
      await page.fill('input[placeholder*="search monster"]', 'Goblin');
      await page.getByRole('option', { name: 'Goblin' }).click();
      
      await page.getByRole('button', { name: /add enemy/i }).click();
      await page.fill('input[placeholder*="search monster"]', 'Goblin');
      await page.getByRole('option', { name: 'Goblin' }).click();
      
      await page.getByRole('button', { name: /save encounter/i }).click();
      await expect(page.getByText(encounterName)).toBeVisible();
    });

    await test.step('Add players to encounter', async () => {
      await page.getByRole('button', { name: /add players/i }).click();
      
      await page.getByRole('checkbox', { name: /test fighter/i }).check();
      await page.getByRole('checkbox', { name: /test wizard/i }).check();
      
      await page.getByRole('button', { name: /add selected/i }).click();
      
      await expect(page.getByText('Test Fighter')).toBeVisible();
      await expect(page.getByText('Test Wizard')).toBeVisible();
    });

    await test.step('Start encounter and roll initiative', async () => {
      await page.getByRole('button', { name: /start encounter/i }).click();
      
      await page.getByRole('button', { name: /roll initiative/i }).click();
      
      await expect(page.getByText(/initiative order/i)).toBeVisible();
      
      const initiativeOrder = page.locator('[data-testid="initiative-order"]');
      await expect(initiativeOrder.locator('li')).toHaveCount(4);
    });

    await test.step('Play several turns', async () => {
      for (let turn = 0; turn < 3; turn++) {
        const currentCreature = page.locator('[data-testid="current-turn"]');
        await expect(currentCreature).toBeVisible();
        
        const attackButton = currentCreature.getByRole('button', {
          name: /attack/i,
        });
        if (await attackButton.isVisible()) {
          await attackButton.click();
          
          const targetSelect = page.getByRole('combobox', {
            name: /target/i,
          });
          await targetSelect.selectOption({ index: 1 });
          
          await page.fill('input[name="damage"]', '5');
          await page.getByRole('button', { name: /apply damage/i }).click();
        }
        
        await page.getByRole('button', { name: /next turn/i }).click();
      }
      
      const roundIndicator = page.getByText(/round \d+/i);
      await expect(roundIndicator).toBeVisible();
    });

    await test.step('Complete encounter', async () => {
      await page.getByRole('button', { name: /end encounter/i }).click();
      
      await page
        .getByRole('button', { name: /confirm.*complete/i })
        .click();
      
      await expect(page.getByText(/encounter completed/i)).toBeVisible();
      
      const status = page.getByTestId('encounter-status');
      await expect(status).toHaveText(/completed/i);
    });

    await test.step('Verify encounter history', async () => {
      await page.getByRole('link', { name: /encounters/i }).click();
      
      await page.getByRole('tab', { name: /completed/i }).click();
      
      await expect(
        page.getByText(/e2e test encounter/i).first(),
      ).toBeVisible();
    });
  });
});

