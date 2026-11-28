import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

const adventuresQuery = `
  query getAdventuresByCampaign($campaignId: ID!) {
    getAdventuresByCampaign(campaignId: $campaignId) {
      _id
      name
    }
  }
`;

const fillEncounter = async (page: Page, name: string) => {
  await page.locator('#name').fill(name);
  await page.getByRole('button', { name: 'Add Enemy', exact: true }).click();
  await page.locator('#enemy-name-0').fill('Goblin');
  await page.locator('#enemy-hp-0').fill('7');
  await page.locator('#enemy-ac-0').fill('15');
};

test.describe('creating an encounter', () => {
  test('saving creates the adventure typed into a campaign that has none', async ({
    page,
    api,
  }) => {
    const stamp = Date.now().toString(16);
    const campaignId = await api.createCampaign(`E2E Empty Campaign ${stamp}`);
    const adventureName = `Chapter ${stamp}`;
    const encounterName = `E2E typed adventure ${stamp}`;

    await page.goto(`/encounters/new/?campaignId=${campaignId}`);
    await page.getByPlaceholder('Enter adventure name').fill(adventureName);
    await fillEncounter(page, encounterName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page).toHaveURL(/\/encounters\/?\?.*newEncounterCreated/);
    const { getAdventuresByCampaign } = await api.gql<{
      getAdventuresByCampaign: { _id: string; name: string }[];
    }>(adventuresQuery, { campaignId });
    expect(getAdventuresByCampaign.map((a) => a.name)).toEqual([adventureName]);
  });

  test('the only active adventure is selected for you', async ({
    page,
    seed,
  }) => {
    const encounterName = `E2E preselected ${Date.now().toString(16)}`;

    await page.goto(`/encounters/new/?campaignId=${seed.campaignId}`);
    await expect(
      page.locator('select').filter({ hasText: 'Select an adventure' }),
    ).toHaveValue(seed.adventureId);
    await fillEncounter(page, encounterName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page).toHaveURL(/\/encounters\/?\?.*newEncounterCreated/);
    await expect(page.getByText(encounterName, { exact: true })).toBeVisible();
  });
});
