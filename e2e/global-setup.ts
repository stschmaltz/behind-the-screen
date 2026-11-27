import fs from 'fs';
import { Api } from './support/api';
import {
  assertSafeDatabase,
  AUTH_DIR,
  BASE_URL,
  SEED_FILE,
  STORAGE_STATE,
} from './support/env';
import {
  createSessionCookie,
  OTHER_USER,
  PRIMARY_USER,
  SESSION_COOKIE_NAME,
} from './support/session';

export interface Seed {
  campaignId: string;
  adventureId: string;
  playerIds: string[];
}

export default async function globalSetup() {
  assertSafeDatabase();
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const primary = await Api.as(PRIMARY_USER);
  const other = await Api.as(OTHER_USER);

  await primary.signIn();
  await other.signIn();
  await primary.purge();
  await other.purge();

  const campaignId = await primary.createCampaign('E2E Campaign');
  const adventureId = await primary.createAdventure(
    campaignId,
    'E2E Adventure',
  );
  const playerIds = [
    await primary.createPlayer(campaignId, 'Tessa Fighter'),
    await primary.createPlayer(campaignId, 'Wim Wizard'),
  ];

  await primary.warmUp('/encounters/');
  await primary.warmUp(`/encounters/${campaignId}/`);

  const seed: Seed = { campaignId, adventureId, playerIds };
  fs.writeFileSync(SEED_FILE, JSON.stringify(seed, null, 2));

  const { hostname } = new URL(BASE_URL);
  fs.writeFileSync(
    STORAGE_STATE,
    JSON.stringify({
      cookies: [
        {
          name: SESSION_COOKIE_NAME,
          value: await createSessionCookie(PRIMARY_USER),
          domain: hostname,
          path: '/',
          expires: -1,
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        },
      ],
      origins: [],
    }),
  );

  await primary.dispose();
  await other.dispose();
}
