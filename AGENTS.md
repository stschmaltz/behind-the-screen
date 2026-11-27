# Agent instructions

Encounter Manager (repo name `behind-the-screen`, live at https://encountermanager.com) is a D&D 5e combat tracker for Dungeon Masters. It has real users, it is maintained by one person, and it deploys to production automatically when `main` changes. Read this file before changing anything.

## Product priorities

- **Encounter management is the product.** Prep an encounter, run it at the table, improvise one in under a minute. Changes should make one of those three faster or quieter.
- The NPC and loot generators get very little use and may be removed. Do not invest in them unless asked.
- Prefer removing friction over adding features. Barely-used features (notes, NPC character type, themes) are candidates to cut, so do not build on top of them.
- Most combat happens on desktop, in sessions lasting one to three hours. Losing a DM's in-progress fight is the worst bug this app can have.

## Commands

| Task                | Command                                    | Notes                                                                 |
| ------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| Dev server          | `npm run dev`                              | http://localhost:3000. Needs `.env.local` (copy `.env.base`).         |
| Type check          | `npm run tsc`                              | `noEmit` is set in `tsconfig.json`.                                   |
| Lint                | `npm run lint`                             | Runs with `--fix`, so it rewrites files. Review the diff afterwards.  |
| Lint without fixing | `npx next lint --ignore-path .gitignore .` | Use this to check only.                                               |
| Unit tests          | `npm test`                                 | Jest and Testing Library, jsdom.                                      |
| One test file       | `npx jest path/to/file.test.ts`            |                                                                       |
| End-to-end tests    | `npm run test:e2e`                         | Playwright. Starts its own dev server on port 3100. See below.        |
| Format              | `npm run fmt`                              | Prettier: semicolons, single quotes.                                  |
| Production build    | `npm run build`                            | Also regenerates the sitemap and the PWA service worker in `public/`. |
| GraphQL types       | `npm run codegen`                          | Needs the dev server running. Writes `generated/graphql.ts`.          |

Before calling work done, run the type check, lint and tests. For anything a user sees, also load it in a browser. For anything that touches the encounter flow, also run the end-to-end tests.

## Architecture

Next.js 15 with the **Pages Router** (there is no `app/` directory), React 19, TypeScript in strict mode, Tailwind with DaisyUI, MongoDB through the native driver, Auth0, and a GraphQL Yoga API served from a single route.

A request flows through these layers, top to bottom:

| Layer            | Location                                                             | Role                                                                       |
| ---------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Page             | `pages/**`                                                           | Route component. Reads data through hooks.                                 |
| Hook             | `hooks/**`                                                           | `useQuery` from `hooks/use-async-query.ts`, or `asyncFetch` for mutations. |
| Operation string | `data/graphql/snippets/*.ts`, or inline in a few pages               | The query and mutation documents the client sends.                         |
| API route        | `pages/api/graphql.ts`                                               | GraphQL Yoga. Builds the context from the Auth0 session.                   |
| Schema           | `data/graphql/<domain>/*.typedefs.ts`, `*.query.ts`, `*.mutation.ts` | Type definitions and resolvers, assembled in `data/graphql/index.ts`.      |
| Repository       | `repositories/<domain>/`                                             | All MongoDB access. Bound in `container/inversify.config.ts`.              |
| Database         | `data/database/mongodb.ts`                                           | Cached `MongoClient`.                                                      |

Other directories:

- `components/` holds shared UI. `components/ui/` has the primitives (Button, FormInput, Combobox, NavBar).
- `context/` holds React context providers. `pages/_app.tsx` wires them up.
- `lib/` holds pure helpers. `encounterUtils.ts` has the difficulty and XP maths, `stateUtils.ts` has immutable list helpers.
- `types/` holds the domain types. `types/encounters.ts` is the one to read first.
- `data/monsters/*.json` and `data/spells/spells.json` are static SRD data, served by `pages/api/monsters.ts` and `pages/api/spells.ts`.
- `generated/graphql.ts` is codegen output. Never edit it by hand.
- `scripts/` holds one-off data scripts for the monster and spell JSON.

### Adding a GraphQL field or operation

Touch these in order, or the change will silently not work:

1. Type definitions in `data/graphql/<domain>/<domain>.typedefs.ts`, including the `input` type if it is a mutation argument.
2. Resolver in `<domain>.query.ts` or `<domain>.mutation.ts`. Call `isAuthorizedOrThrow(context)` first and pass `context.user._id` to the repository.
3. Repository method and its interface in `repositories/<domain>/`.
4. Client operation string. Most are in `data/graphql/snippets/<domain>.ts`, but some are inline in the page that sends them (`pages/loot-generator.tsx`, `pages/npc-generator.tsx`, `pages/admin.tsx`). Find the operation the caller actually sends and update that one. A field missing from it is never fetched.
5. TypeScript type in `types/`.
6. A new domain also needs registering in `data/graphql/index.ts`, `container/types.ts` and `container/inversify.config.ts`.

## Encounter domain

- An `Encounter` has a status of `inactive` (being prepped), `active` (combat running) or `completed`.
- `enemies` and `npcs` are stat blocks stored on the encounter. `players` stores only player ids; the player documents live in their own collection.
- `initiativeOrder` is the combat state: one entry per combatant with `currentHP`, `tempHP`, `initiative`, `conditions` and `type`. `currentTurn` and `currentRound` index into it.
- **Identify characters by `_id`, never by name.** Several goblins share a name.
- The whole encounter is saved as one document through the `saveEncounter` mutation. There are no per-action mutations such as "next turn" or "apply damage". Saves are debounced on the client.
- The setup screen is `pages/encounters/[id]/InactiveEncounter/`, the combat screen is `pages/encounters/[id]/ActiveEncounter/`. State lives in `context/EncounterContext.tsx` and the hooks in `hooks/encounter/`.

## Conventions

- **No comments** unless the code is complex in a way that cannot be simplified. Write clearer code instead.
- Use relative imports. The `@/` alias in `tsconfig.json` points at a `src/` directory that does not exist, and nothing uses it.
- ESLint errors on `any` and on unused variables (prefix intentionally unused ones with `_`), and warns on `console` and on a missing blank line before `return`.
- Log through `logger` from `lib/logger.ts`.
- Style with DaisyUI component classes (`btn`, `card`, `modal`) and Tailwind utilities. Check `components/ui/` before writing a new primitive.
- Update state immutably. Put complex state transitions in a hook or in `lib/`, where they can be unit tested, and keep components thin.
- Hook file names are mixed (`use-thing.ts`, `use-thing.hook.ts`, `useThing.ts`, and data hooks named `get-thing.ts`). Use `use-thing.ts` for new files and do not rename existing ones as a side effect.
- Tests live in `__tests__/` beside the code they cover.
- Analytics events go through `posthog.capture`. List every event in `.posthog-events.json` and keep that file truthful.

## Gotchas

- **Every `.tsx` file under `pages/` is a route.** Encounter components are colocated in `pages/encounters/**` and each has a default export, so each is technically reachable by URL. Put new shared components in `components/`.
- **Auth is enforced in two separate places.** Pages are gated client-side by `components/ProtectedLayout.tsx` using the `PUBLIC_PATHS` list in `lib/routes.ts`, so a new public page must be added there. A public page that search engines should index also needs adding to `INDEXABLE_ROUTES` in `lib/seo.ts` and `PUBLIC_PAGES` in `next-sitemap.config.js`. Data is gated server-side in each resolver and repository query. A resolver without `isAuthorizedOrThrow` and a `userId` filter is a data leak. Existing code has a gap: the `me` query returns a hard-coded placeholder. Do not copy that pattern.
- **`useQuery` has a 10 second in-memory cache** (`lib/query-cache.ts`). After a mutation, call `clearCache()` (as `hooks/encounter/use-manage-encounter.ts` does), call `refresh`, or pass `skipCache`, or the screen shows stale data that the next save can write back.
- **Memoise `variables` and `transform`** passed to `useQuery`. They are effect dependencies, so a new object on each render refetches in a loop.
- **GraphQL errors are masked.** The client only ever sees "API request failed". Read the dev server output for the real error.
- **The pre-commit hook calls `npx.cmd`**, which exists only on Windows. On other systems the hook fails; run lint by hand and say so if you bypass it.
- **`public/sw.js` and `public/workbox-*.js` are build output** from `next-pwa`. They are tracked by accident; do not edit them or commit changes to them.
- **Admin pages** (`pages/admin.tsx`, `pages/api/user/count.ts`, `pages/api/user/list.ts`, `pages/api/feedback/list.ts`, `pages/api/ai-usage/stats.ts`) are gated by the email allowlist in `lib/featureFlags.ts`. `pages/api/user/delete.ts` is not admin-only: any signed-in user can call it to delete their own account.
- **`.env.local` usually points at the production database.** Treat local writes as production writes. Read freely; create, change or delete data only when asked.
- **Auth0 login cannot be automated by an agent** because it needs the owner's password. The end-to-end tests get around this by signing a session cookie for dedicated test users (`e2e/support/session.ts`); they write those users' data to the database in `.env.local` and refuse to run unless `DB_NAME` contains `dev`, `test`, `e2e` or `local`. To check a one-off screen in a browser without logging in, render the component on a temporary page with fixture data and delete the page before finishing.
- `npm run sync-auth0-logins` points at a script that is not in the repository.

## Working agreements

- Never push to `main` and never merge a pull request. `main` deploys straight to production on Vercel. Work on a branch and open a pull request.
- **Finish every unit of work with a reviewed pull request, without being asked.** When a unit of work is done and verified: commit it, push the branch, open a pull request (or push to the one already open for that branch), request a GitHub Copilot review, then read the review and address it. Fix what is right, reply with the reason where a comment is wrong, and push the fixes. Report the pull request link and what the review changed. Do not merge.
- Request the Copilot review with the GraphQL `requestReviews` mutation and `botIds: ["BOT_kgDOCnlnWA"]` (the `copilot-pull-request-reviewer` bot). `gh pr edit --add-reviewer` fails on this repository, and the REST `requested_reviewers` endpoint silently ignores the bot.
- Several agent sessions often work on this repository at once. Before a broad edit, check `git status` for changes you did not make, leave them alone, and mention any overlap.
- Commit in small units with present-tense messages ("Fix turn order after revive"). Keep refactors in separate commits from behaviour changes.
- A bug fix comes with a test that fails without the fix.
- Be honest about verification. State what was checked in a browser, what was only covered by tests, and what was not checked at all.
- The monster and spell data is SRD 5.1 content under the Open Game License (`OGL.txt`). Do not add non-SRD Wizards of the Coast content.

## More documentation

- `README.md`: setup and overview for humans.
- `docs/api.md`: the GraphQL and REST surface.
- `docs/testing.md`: how tests are organised and what is covered, including the Playwright end-to-end suite.
- `docs/ai-usage-tracking.md`: the weekly limit on AI generations.
