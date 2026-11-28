import { Browser, Page } from '@playwright/test';
import { Api } from './support/api';
import { BASE_URL } from './support/env';
import { expect, test } from './support/fixtures';
import {
  createSessionCookie,
  NEWCOMER_USER,
  SESSION_COOKIE_NAME,
} from './support/session';

const openAsNewcomer = async (browser: Browser) => {
  const context = await browser.newContext({
    storageState: {
      cookies: [
        {
          name: SESSION_COOKIE_NAME,
          value: await createSessionCookie(NEWCOMER_USER),
          domain: new URL(BASE_URL).hostname,
          path: '/',
          expires: -1,
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        },
      ],
      origins: [],
    },
  });

  return { context, page: await context.newPage() };
};

const fillEncounter = async (page: Page, name: string) => {
  await page.locator('#name').fill(name);
  await page.getByRole('button', { name: 'Add Enemy' }).click();
  await page.locator('#enemy-name-0').fill('Goblin');
};

const saveButton = (page: Page) =>
  page.getByRole('button', { name: 'Save', exact: true });

test.describe('first encounter', () => {
  let newcomer: Api;

  test.beforeEach(async () => {
    newcomer = await Api.as(NEWCOMER_USER);
    await newcomer.signIn();
    await newcomer.purge();
  });

  test.afterEach(async () => {
    await newcomer.purge();
    await newcomer.dispose();
  });

  test('a DM with no campaigns can save an encounter straight away', async ({
    browser,
  }) => {
    const { context, page } = await openAsNewcomer(browser);

    await page.goto('/encounters/new/');
    await expect(
      page.getByText(/will be saved to .My Campaign./),
    ).toBeVisible();

    await fillEncounter(page, 'Goblin Ambush');
    await saveButton(page).click();

    await expect(
      page.getByRole('heading', { name: /Ready Encounters/ }),
    ).toBeVisible();
    await expect(page.getByText('Goblin Ambush')).toBeVisible();

    const owned = await newcomer.owned();
    expect(owned.getCampaigns.map((c) => c.name)).toEqual(['My Campaign']);
    expect(owned.getAdventures).toEqual([
      expect.objectContaining({
        name: 'My Adventure',
        campaignId: owned.getCampaigns[0]._id,
      }),
    ]);
    expect(owned.allEncounters).toEqual([
      {
        name: 'Goblin Ambush',
        campaignId: owned.getCampaigns[0]._id,
        adventureId: owned.getAdventures[0]._id,
      },
    ]);

    await context.close();
  });

  test('saving still works when the campaign list cannot be reloaded', async ({
    browser,
  }) => {
    const { context, page } = await openAsNewcomer(browser);

    await page.goto('/encounters/new/');
    await expect(
      page.getByText(/will be saved to .My Campaign./),
    ).toBeVisible();
    await page.route('**/api/graphql', (route) =>
      route.request().postData()?.includes('AllCampaigns')
        ? route.fulfill({ status: 500, body: 'unavailable' })
        : route.continue(),
    );

    await fillEncounter(page, 'Flaky Network');
    await saveButton(page).click();

    await expect
      .poll(async () => (await newcomer.owned()).allEncounters.length)
      .toBe(1);
    await context.close();
  });

  test('an adventure made on the page counts, so no default one is added', async ({
    browser,
  }) => {
    const campaignId = await newcomer.createCampaign('Solo Campaign');
    const { context, page } = await openAsNewcomer(browser);

    await page.goto(`/encounters/new/?campaignId=${campaignId}`);
    await page.getByPlaceholder('Enter adventure name').fill('Chapter One');
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    const adventureSelect = page
      .locator('select')
      .filter({ has: page.locator('option[value="all"]') });
    await expect(adventureSelect).toHaveValue(/^[0-9a-f]{24}$/);
    await adventureSelect.selectOption('all');

    await fillEncounter(page, 'Unfiled');
    await saveButton(page).click();

    await expect(page.getByText('Please select an adventure')).toBeVisible();
    const owned = await newcomer.owned();
    expect(owned.getAdventures.map((a) => a.name)).toEqual(['Chapter One']);
    expect(owned.allEncounters).toEqual([]);
    await context.close();
  });
});
