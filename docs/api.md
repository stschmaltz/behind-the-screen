# API

The app has one GraphQL endpoint and a handful of REST routes. The type definitions in `data/graphql/` are the source of truth; this page is a map to them.

## Authentication

Auth0 handles login through `pages/api/auth/[...auth0].js`, and the session is an encrypted cookie. There are no bearer tokens. Requests from the browser are authenticated by the cookie.

For GraphQL, `pages/api/graphql.ts` reads the session and `lib/graphql-context.ts` loads the matching user document into `context.user` (cached in memory for five minutes). Most resolvers call `isAuthorizedOrThrow(context)` and pass `context.user._id` to the repository, which filters by it.

Exceptions:

- `userSignIn` runs before a user document exists, so it cannot use that guard. It checks that `input.auth0Id` matches the session's Auth0 id instead.
- `me` has no guard and returns a hard-coded placeholder user. Nothing in the app should rely on it.
- `saveEncounter` is guarded, but `EncounterRepository.saveEncounter` matches on `_id` alone and then sets `userId` to the caller. A signed-in user who knows another user's encounter id can overwrite that encounter and take ownership of it. Reads, deletes and `updateEncounterDescription` do filter by `userId`.

Passing `context.user._id` to a repository is therefore not proof of ownership filtering. Check the repository query.

The first request after login is the `userSignIn` mutation, sent by `hooks/use-user-sign-in.hook.ts`. It creates the user document if it does not exist.

## GraphQL

`POST /api/graphql`

Errors are masked: the client receives a generic message and the real error goes to the server log.

### Queries

| Operation                                  | Returns                   | Defined in                                   |
| ------------------------------------------ | ------------------------- | -------------------------------------------- |
| `me`                                       | `User!`                   | `user/user.query.ts`                         |
| `allEncounters`                            | `[Encounter!]!`           | `encounter/encounter.query.ts`               |
| `encounterById(id: String!)`               | `Encounter`               | `encounter/encounter.query.ts`               |
| `allPlayers`                               | `[Player!]!`              | `player/player.query.ts`                     |
| `playersByIds(ids: [String!]!)`            | `[Player!]!`              | `player/player.query.ts`                     |
| `getCampaigns`                             | `[Campaign]`              | `campaign/campaign.query.ts`                 |
| `getCampaign(id: ID!)`                     | `Campaign`                | `campaign/campaign.query.ts`                 |
| `getAdventures`                            | `[Adventure]`             | `adventure/adventure.query.ts`               |
| `getAdventure(id: ID!)`                    | `Adventure`               | `adventure/adventure.query.ts`               |
| `getAdventuresByCampaign(campaignId: ID!)` | `[Adventure]`             | `adventure/adventure.query.ts`               |
| `getUserPreferences`                       | `UserPreferences`         | `user-preferences/user-preferences.query.ts` |
| `getAiGenerationCount`                     | `Int!`                    | `user-preferences/user-preferences.query.ts` |
| `getAllUsageStats`                         | `[AiUsageStat!]!` (admin) | `user-preferences/user-preferences.query.ts` |

### Mutations

| Operation                                  | Returns              | Defined in                                      |
| ------------------------------------------ | -------------------- | ----------------------------------------------- |
| `userSignIn(input)`                        | `UserSignInResponse` | `user/user.mutation.ts`                         |
| `saveEncounter(input: NewEncounterInput!)` | `Encounter`          | `encounter/encounter.mutation.ts`               |
| `deleteEncounter(input)`                   | `Boolean`            | `encounter/encounter.mutation.ts`               |
| `updateEncounterDescription(input)`        | `Encounter`          | `encounter/encounter.mutation.ts`               |
| `createPlayer(input)`                      | `Player`             | `player/player.mutation.ts`                     |
| `updatePlayer(input)`                      | `Player`             | `player/player.mutation.ts`                     |
| `updatePlayers(input)`                     | `Boolean`            | `player/player.mutation.ts`                     |
| `deletePlayer(id: String!)`                | `Boolean`            | `player/player.mutation.ts`                     |
| `saveCampaign(input)`                      | `Campaign`           | `campaign/campaign.mutation.ts`                 |
| `deleteCampaign(input)`                    | `Boolean`            | `campaign/campaign.mutation.ts`                 |
| `saveAdventure(input)`                     | `Adventure`          | `adventure/adventure.mutation.ts`               |
| `deleteAdventure(input)`                   | `Boolean`            | `adventure/adventure.mutation.ts`               |
| `setActiveCampaign(input)`                 | `UserPreferences`    | `user-preferences/user-preferences.mutation.ts` |
| `setTheme(input)`                          | `UserPreferences`    | `user-preferences/user-preferences.mutation.ts` |
| `requestMoreUses`                          | `UserPreferences`    | `user-preferences/user-preferences.mutation.ts` |
| `generateNpc(...)`                         | generated NPC        | `generation/generate-npc.mutation.ts`           |
| `generateLoot(...)`                        | generated loot       | `generation/generate-loot.mutation.ts`          |

All paths are relative to `data/graphql/`.

### How encounters are saved

`saveEncounter` is an upsert that applies the supplied fields with `$set`. Omitting `_id` creates an encounter. Sending `_id` updates that encounter: fields present in the input overwrite the stored values, and fields left out keep their stored values. Omitting a field does not clear it; to clear `description`, send an empty string. The client sends the full encounter on every save, so in practice the stored document tracks the client's copy. Starting combat, advancing a turn, applying damage and adding a condition are all client-side changes to `status`, `initiativeOrder`, `currentTurn` and `currentRound`, followed by a `saveEncounter` call. There are no separate mutations for those actions.

The shapes are in `data/graphql/encounter/encounter.typedefs.ts` and mirrored in `types/encounters.ts`.

### Client operations

Most documents the browser sends live in `data/graphql/snippets/`. Three are defined inline in the page that sends them: `generateLoot` in `pages/loot-generator.tsx`, `generateNpc` in `pages/npc-generator.tsx` and `getAllUsageStats` in `pages/admin.tsx`. A field has to be listed in the operation the caller actually sends to be fetched, so check which one that is before editing.

`npm run codegen` needs a running dev server. It reads the schema from `http://localhost:3000/api/graphql`, scans `pages/**`, `components/**` and `data/graphql/snippets/**` for operations (see `codegen.yml`), and regenerates `generated/graphql.ts`.

## REST routes

| Route                 | Method | Access    | Purpose                                         |
| --------------------- | ------ | --------- | ----------------------------------------------- |
| `/api/auth/*`         | –      | public    | Auth0 login, callback and logout                |
| `/api/monsters`       | GET    | public    | Merged monster list from `data/monsters/*.json` |
| `/api/spells`         | GET    | public    | Spell list from `data/spells/spells.json`       |
| `/api/feedback`       | POST   | signed in | Stores feedback                                 |
| `/api/feedback/list`  | GET    | admin     | Lists feedback                                  |
| `/api/user/delete`    | DELETE | signed in | Deletes the caller's account and data           |
| `/api/user/count`     | GET    | admin     | User count                                      |
| `/api/user/list`      | GET    | admin     | Recent users                                    |
| `/api/ai-usage/check` | GET    | signed in | See `ai-usage-tracking.md`                      |
| `/api/ai-usage/track` | POST   | signed in | See `ai-usage-tracking.md`                      |
| `/api/ai-usage/stats` | GET    | admin     | See `ai-usage-tracking.md`                      |
| `/api/downtime`       | –      | –         | Backs the downtime page                         |

"Admin" means the caller's email is in the allowlist in `lib/featureFlags.ts`.
