import { test as base, expect, Locator, Page } from '@playwright/test';
import fs from 'fs';
import { Api, SeedCharacter } from './api';
import { SEED_FILE } from './env';
import { PRIMARY_USER } from './session';
import type { Seed } from '../global-setup';

let counter = 0;
const id = () =>
  `${Date.now().toString(16)}${(counter++).toString(16).padStart(4, '0')}`
    .padEnd(24, '0')
    .slice(0, 24);

export const ROSTER = [
  { name: 'Alpha Boss', initiative: 20 },
  { name: 'Bravo Goblin', initiative: 18 },
  { name: 'Charlie Goblin', initiative: 16 },
  { name: 'Delta Wolf', initiative: 14 },
  { name: 'Echo Wolf', initiative: 12 },
  { name: 'Foxtrot Bugbear', initiative: 10 },
  { name: 'Golf Hobgoblin', initiative: 8 },
  { name: 'Hotel Hobgoblin', initiative: 6 },
  { name: 'India Worg', initiative: 4 },
  { name: 'Juliet Worg', initiative: 2 },
];

interface Fixtures {
  api: Api;
  seed: Seed;
  createEncounter: (options?: {
    status?: 'inactive' | 'active';
    name?: string;
  }) => Promise<{ id: string; name: string }>;
}

export const test = base.extend<Fixtures>({
  api: async ({}, provide) => {
    const api = await Api.as(PRIMARY_USER);
    await provide(api);
    await api.dispose();
  },
  seed: async ({}, provide) => {
    await provide(JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8')));
  },
  createEncounter: async ({ api, seed }, provide, testInfo) => {
    await provide(async ({ status = 'active', name } = {}) => {
      const encounterName =
        name ?? `E2E ${testInfo.title.slice(0, 40)} ${id().slice(8, 12)}`;
      const characters: SeedCharacter[] = [
        ...ROSTER.map((c) => ({
          _id: id(),
          name: c.name,
          maxHP: 10,
          initiative: c.initiative,
          type: 'enemy' as const,
        })),
        {
          _id: seed.playerIds[0],
          name: 'Tessa Fighter',
          maxHP: 40,
          initiative: 15,
          type: 'player' as const,
        },
      ];
      const encounterId = await api.createEncounter({
        name: encounterName,
        status,
        campaignId: seed.campaignId,
        adventureId: seed.adventureId,
        characters,
      });

      return { id: encounterId, name: encounterName };
    });
  },
});

export { expect };

/** Page object for the encounter detail screen. */
export class EncounterPage {
  constructor(readonly page: Page) {}

  async open(encounterId: string) {
    await this.page.goto(`/encounters/${encounterId}/`);
  }

  row(name: string): Locator {
    return this.page
      .locator('.card', { has: this.page.getByLabel('Adjust HP') })
      .filter({ hasText: name });
  }

  currentTurnRow(): Locator {
    return this.page.locator('.card', {
      has: this.page.getByText('Current Turn', { exact: true }),
      hasNot: this.page.locator('.card'),
    });
  }

  turnBadge = (turn: number) =>
    this.page.getByText(`Turn ${turn}`, { exact: true });

  roundBadge = (round: number) =>
    this.page.getByText(`Round ${round}`, { exact: true });

  nextButton = () =>
    this.page.getByRole('button', { name: 'Next', exact: true });

  deadPool = () => this.page.getByRole('heading', { name: /Dead Pool/ });

  /**
   * Runs an action and waits for the save it triggers to land. Saves are
   * debounced, so the request we want always starts after the action returns;
   * waiting for a new request avoids matching an earlier save still in flight.
   */
  async andSave(action: () => Promise<unknown>) {
    await action();
    const request = await this.page.waitForRequest(
      (candidate) =>
        candidate.url().includes('/api/graphql') &&
        (candidate.postData() ?? '').includes('saveEncounter'),
    );
    const response = await request.response();
    expect((await response?.json())?.errors).toBeUndefined();
  }

  async damage(name: string, amount: number) {
    await this.row(name).getByLabel('Adjust HP').click();
    await this.page.getByPlaceholder('Amount').fill(String(amount));
    await this.page.getByRole('button', { name: 'Apply' }).click();
  }

  /** Total scroll offset of the page and every scrollable element in it. */
  totalScroll = () =>
    this.page.evaluate(
      () =>
        window.scrollY +
        Array.from(document.querySelectorAll('*')).reduce(
          (sum, el) => sum + el.scrollTop,
          0,
        ),
    );
}
