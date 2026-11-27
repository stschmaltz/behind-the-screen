# Testing

Tests run on Jest with Testing Library in a jsdom environment. Configuration is in `jest.config.js` and `jest.setup.js`.

## Commands

| Task            | Command                                          |
| --------------- | ------------------------------------------------ |
| All tests       | `npm test`                                       |
| One file        | `npx jest hooks/__tests__/useEnemyState.test.ts` |
| By test name    | `npx jest -t "applies damage"`                   |
| Watch mode      | `npm run test:watch`                             |
| Coverage report | `npm run test:coverage` (writes `coverage/`)     |

## Where tests live

Each test sits in a `__tests__/` directory beside the code it covers and is named `<source file>.test.ts` or `.test.tsx`.

| Area                      | Tests                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------ |
| Difficulty and XP maths   | `lib/__tests__/encounterUtils.test.ts`                                               |
| Immutable list helpers    | `lib/__tests__/stateUtils.test.ts`                                                   |
| Character and enemy state | `hooks/__tests__/useCharacterState.test.ts`, `hooks/__tests__/useEnemyState.test.ts` |
| Monster data parsing      | `hooks/__tests__/use-monsters.hook.test.ts`                                          |
| Encounter setup draft     | `hooks/encounter/__tests__/use-draft-encounter.test.ts`                              |

Not covered by unit tests: resolvers, repositories, REST routes and most components. Check those by hand or in a browser.

## What the setup file does

`jest.setup.js` replaces `global.fetch` with a `jest.fn()` and clears all mocks before each test. A test that triggers a network call must give `fetch` a return value, or the code under test receives `undefined`.

## Writing tests

- Put logic worth testing in `lib/` or in a hook, then test it there. Hooks are tested with `renderHook` and `act` from `@testing-library/react`.
- Mock the module boundary, not the internals. Typical mocks are `data/graphql/graphql-fetcher`, `lib/logger`, `posthog-js`, `next/router` and `@auth0/nextjs-auth0/client`.
- Test what the user or caller observes. Query by role and visible text, and assert on returned state.
- A bug fix comes with a test that fails on the old code. Confirm it does fail before relying on it.
- Build fixtures with unique `_id` values. Characters often share a name, and the app identifies them by id.

## Type checking tests

`npm run tsc` covers test files as well as source.

## End-to-end tests (Playwright)

Browser tests for the encounter flow live in `e2e/`. They drive the real app
against the real API and database.

```bash
npm run test:e2e        # headless run
npm run test:e2e:ui     # interactive runner
npx playwright show-report
```

First time only: `npx playwright install chromium`.

### How it works

- **Its own server.** The suite starts `next dev` on port 3100 with a separate
  build folder (`.next-e2e`), so it does not interfere with a dev server you
  already have open on port 3000. It never reuses a server that is already
  running. To point it at an external server, set `E2E_BASE_URL` together with
  `E2E_ALLOW_ANY_DB=true`: the suite cannot check that server's database.
- **Sign-in.** Tests never visit the Auth0 login page. `e2e/support/session.ts`
  signs a session cookie for two dedicated test users (`e2e|dm-essentials-primary`
  and `e2e|dm-essentials-other`) using `AUTH0_SECRET` from `.env.local`.
- **Data.** `e2e/global-setup.ts` deletes everything those two test users own,
  then creates a campaign, an adventure and two players. Each test seeds its own
  encounter through the GraphQL API (`e2e/support/api.ts`).
- **Safety.** The suite writes to whatever database `.env.local` points at and
  refuses to run unless `DB_NAME` contains `dev`, `test`, `e2e` or `local`
  (override with `E2E_ALLOW_ANY_DB=true`). It only ever touches the two test
  users' data.

### Writing a test

```ts
import { EncounterPage, expect, test } from './support/fixtures';

test('next turn', async ({ page, createEncounter }) => {
  const encounter = await createEncounter(); // active, 10 enemies + 1 player
  const view = new EncounterPage(page);
  await view.open(encounter.id);

  await view.andSave(() => view.nextButton().click());

  await expect(view.currentTurnRow()).toContainText('Bravo Goblin');
});
```

Use `view.andSave(...)` before reloading or checking the API: combat autosaves are
debounced by half a second, so a reload straight after a click can beat the save.
