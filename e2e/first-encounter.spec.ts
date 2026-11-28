import { Api } from './support/api';
import { BASE_URL } from './support/env';
import { expect, test } from './support/fixtures';
import {
  createSessionCookie,
  NEWCOMER_USER,
  SESSION_COOKIE_NAME,
} from './support/session';

test.describe('first encounter', () => {
  test('a DM with no campaigns can save an encounter straight away', async ({
    browser,
  }) => {
    const newcomer = await Api.as(NEWCOMER_USER);
    await newcomer.signIn();
    await newcomer.purge();

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
    const page = await context.newPage();

    await page.goto('/encounters/new/');
    await expect(
      page.getByText(/will be saved to .My Campaign./),
    ).toBeVisible();

    await page.locator('#name').fill('Goblin Ambush');
    await page.getByRole('button', { name: 'Add Enemy' }).click();
    await page.locator('#enemy-name-0').fill('Goblin');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

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
    await newcomer.purge();
    await newcomer.dispose();
  });
});
