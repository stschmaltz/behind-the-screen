import { Api } from './support/api';
import { expect, test } from './support/fixtures';
import { OTHER_USER } from './support/session';

test.describe('encounter ownership', () => {
  test('another user cannot read or overwrite an encounter', async ({
    api,
    seed,
    createEncounter,
  }) => {
    const encounter = await createEncounter();
    const intruder = await Api.as(OTHER_USER);

    expect(await intruder.getEncounter(encounter.id)).toBeNull();

    const attempt = await intruder.raw(
      `mutation ($input: NewEncounterInput!) { saveEncounter(input: $input) { _id } }`,
      {
        input: {
          _id: encounter.id,
          name: 'Hijacked',
          notes: [],
          enemies: [],
          campaignId: seed.campaignId,
        },
      },
    );
    await intruder.dispose();

    expect(attempt.errors?.length).toBeGreaterThan(0);
    const untouched = await api.getEncounter(encounter.id);
    expect(untouched?.name).toBe(encounter.name);
    expect(untouched?.initiativeOrder).toHaveLength(11);
  });

  test('signed-out visitors are sent to the login prompt', async ({
    browser,
    createEncounter,
  }) => {
    const encounter = await createEncounter();
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();

    await page.goto(`/encounters/${encounter.id}/`);

    await expect(page).toHaveURL(/login-required/);
    await context.close();
  });
});
