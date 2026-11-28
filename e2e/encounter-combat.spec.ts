import { EncounterPage, expect, test } from './support/fixtures';

test.describe('running an encounter', () => {
  test('opens from the encounter list', async ({
    page,
    seed,
    createEncounter,
  }) => {
    const encounter = await createEncounter({ status: 'inactive' });

    await page.goto(`/encounters/?campaignId=${seed.campaignId}`);
    await page.getByText(encounter.name, { exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`/encounters/${encounter.id}`));
    await expect(
      page.getByRole('button', { name: 'Start Encounter' }),
    ).toBeVisible();
  });

  test('starting an encounter persists', async ({
    page,
    api,
    createEncounter,
  }) => {
    const encounter = await createEncounter({ status: 'inactive' });
    const view = new EncounterPage(page);
    await view.open(encounter.id);

    await view.andSave(() =>
      page.getByRole('button', { name: 'Start Encounter' }).click(),
    );

    await expect(view.nextButton()).toBeVisible();
    await expect(view.currentTurnRow()).toContainText('Alpha Boss');

    await page.reload();
    await expect(view.nextButton()).toBeVisible();
    expect((await api.getEncounter(encounter.id))?.status).toBe('active');
  });

  test('turns advance in initiative order and survive a reload', async ({
    page,
    api,
    createEncounter,
  }) => {
    const encounter = await createEncounter();
    const view = new EncounterPage(page);
    await view.open(encounter.id);

    await expect(view.turnBadge(1)).toBeVisible();
    await expect(view.currentTurnRow()).toContainText('Alpha Boss');

    await view.andSave(() => view.nextButton().click());
    await expect(view.currentTurnRow()).toContainText('Bravo Goblin');
    await view.andSave(() => view.nextButton().click());
    await expect(view.currentTurnRow()).toContainText('Charlie Goblin');

    await page.reload();

    await expect(view.turnBadge(3)).toBeVisible();
    await expect(view.currentTurnRow()).toContainText('Charlie Goblin');
    expect((await api.getEncounter(encounter.id))?.currentTurn).toBe(3);
  });

  test('saving does not reset the created date', async ({
    page,
    api,
    createEncounter,
  }) => {
    const encounter = await createEncounter();
    const before = (await api.getEncounter(encounter.id))?.createdAt;
    const view = new EncounterPage(page);
    await view.open(encounter.id);

    await view.andSave(() => view.nextButton().click());

    expect((await api.getEncounter(encounter.id))?.createdAt).toBe(before);
  });

  test('killing an earlier enemy keeps the turn on the acting character', async ({
    page,
    api,
    createEncounter,
  }) => {
    const encounter = await createEncounter();
    const view = new EncounterPage(page);
    await view.open(encounter.id);

    await view.andSave(() => view.nextButton().click());
    await view.andSave(() => view.nextButton().click());
    await expect(view.currentTurnRow()).toContainText('Charlie Goblin');

    await view.andSave(() => view.damage('Alpha Boss', 10));

    await expect(view.deadPool()).toBeVisible();
    await expect(view.row('Alpha Boss')).toHaveCount(0);
    await expect(view.currentTurnRow()).toContainText('Charlie Goblin');
    await expect(view.turnBadge(2)).toBeVisible();

    await page.reload();

    await expect(view.deadPool()).toBeVisible();
    await expect(view.currentTurnRow()).toContainText('Charlie Goblin');
    const saved = await api.getEncounter(encounter.id);
    expect(
      saved?.initiativeOrder.find((c) => c.name === 'Alpha Boss')?.currentHP,
    ).toBe(0);
  });

  test('a new round starts when the last enemy dies on its own turn', async ({
    page,
    createEncounter,
  }) => {
    const encounter = await createEncounter();
    const view = new EncounterPage(page);
    await view.open(encounter.id);

    for (let turn = 1; turn < 11; turn++) {
      await view.nextButton().click();
    }
    await expect(view.currentTurnRow()).toContainText('Juliet Worg');

    await view.damage('Juliet Worg', 10);

    await expect(view.roundBadge(2)).toBeVisible();
    await expect(view.turnBadge(1)).toBeVisible();
    await expect(view.currentTurnRow()).toContainText('Alpha Boss');

    await view.nextButton().click();
    await expect(view.turnBadge(2)).toBeVisible();
    await expect(view.currentTurnRow()).toContainText('Bravo Goblin');
  });

  test('reviving from the dead pool restores the enemy at 1 HP', async ({
    page,
    createEncounter,
  }) => {
    const encounter = await createEncounter();
    const view = new EncounterPage(page);
    await view.open(encounter.id);

    await view.damage('Delta Wolf', 10);
    await expect(view.row('Delta Wolf')).toHaveCount(0);

    await page.getByRole('button', { name: 'Show' }).click();
    await page.getByRole('button', { name: 'Revive' }).click();

    await expect(view.row('Delta Wolf')).toContainText('HP: 1/10');
    await expect(view.deadPool()).toHaveCount(0);
    await expect(view.currentTurnRow()).toContainText('Alpha Boss');
  });

  test('scrolling still works after dismissing the HP popover with Escape', async ({
    page,
    createEncounter,
  }) => {
    const encounter = await createEncounter();
    const view = new EncounterPage(page);
    await view.open(encounter.id);
    await expect(view.currentTurnRow()).toBeVisible();

    const adjust = view.row('Bravo Goblin').getByLabel('Adjust HP');
    await adjust.click();
    const amount = page.getByPlaceholder('Amount');
    await expect(amount).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(amount).toHaveCount(0);

    const box = await view.row('Charlie Goblin').boundingBox();
    if (!box) throw new Error('Row is not on screen');
    await page.mouse.move(box.x + 40, box.y + box.height / 2);
    const before = await view.totalScroll();

    await page.mouse.wheel(0, 400);

    await expect.poll(() => view.totalScroll()).toBeGreaterThan(before);
  });

  test('a rename survives later combat saves', async ({
    page,
    api,
    createEncounter,
  }) => {
    const encounter = await createEncounter();
    const renamed = `${encounter.name} renamed`;
    const view = new EncounterPage(page);
    await view.open(encounter.id);

    await page.getByRole('button', { name: /^Encounter name/ }).click();
    const nameInput = page.getByRole('textbox', { name: 'Encounter name' });
    await nameInput.fill(renamed);
    await view.andSave(() => nameInput.press('Enter'));

    await view.andSave(() => view.nextButton().click());

    expect((await api.getEncounter(encounter.id))?.name).toBe(renamed);
    await page.reload();
    await expect(
      page.getByRole('button', { name: /^Encounter name/ }),
    ).toContainText(renamed);
  });

  test('finishing an encounter marks it completed', async ({
    page,
    api,
    createEncounter,
  }) => {
    const encounter = await createEncounter();
    const view = new EncounterPage(page);
    await view.open(encounter.id);

    await page.getByRole('button', { name: 'Finish Encounter' }).click();
    await expect(page.getByText('Finish Encounter?')).toBeVisible();
    await page
      .locator('dialog', { hasText: 'Finish Encounter?' })
      .getByRole('button', { name: 'Finish Encounter' })
      .click();

    await expect(page).toHaveURL(/\/encounters\/?(\?.*)?$/);
    expect((await api.getEncounter(encounter.id))?.status).toBe('completed');
  });
});
