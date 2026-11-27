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
