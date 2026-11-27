# AI generation limits

The NPC and loot generators have an AI mode that calls an external Mastra service (`MASTRA_SERVICE_BASE_URL`) and a free mode that generates locally from tables (`lib/generate-free-npc.ts`, `lib/generate-free-loot.ts`). AI mode is limited to 25 generations per user in a rolling seven days.

There are two limit implementations in the repository. Only the first is used by the UI.

## In use: counting saved generations

- Each AI generation is saved to the `npc_generations` or `loot_generations` collection by the `generateNpc` and `generateLoot` resolvers in `data/graphql/generation/`.
- The `getAiGenerationCount` query (`data/graphql/user-preferences/user-preferences.query.ts`) returns the number of AI generations from the last seven days. It is not a count of every saved document:
  - NPC generations: every document in `npc_generations` for the user in that window.
  - Loot generations: only documents with `randomItemCount > 0`. Loot made purely from SRD items is free and is not counted.
  - Exempt users: the query returns `-999999` instead of a count, so the client-side check `usageCount < 25` always passes. Treat a negative value as "unlimited", not as a number of generations.
- `hooks/use-generation-usage.ts` compares that count with `MAX_FREE_AI_GENERATIONS` (25). When none remain, the generator pages switch to free mode.
- `requestMoreUses` records that a user asked for a higher limit, in their preferences.

The limit is applied in the browser. The `generateNpc` and `generateLoot` resolvers require a signed-in user but do not check the count themselves.

## Not wired up: per-user counter

A second system stores a counter on the user document (`aiUsageCount`, `aiUsageResetDate`, `aiWeeklyLimit`) and exposes it through REST:

| Route                 | Method | Purpose                                          |
| --------------------- | ------ | ------------------------------------------------ |
| `/api/ai-usage/check` | GET    | Remaining uses for the caller                    |
| `/api/ai-usage/track` | POST   | Increment the caller's counter; 429 at the limit |
| `/api/ai-usage/stats` | GET    | All users' counters (admin)                      |

`hooks/use-ai-usage.ts` wraps these routes, but no page or component imports it. If the generators are kept, enforcing the limit inside the resolvers would replace both systems; if they are removed, all of this goes with them.

## Exempt users

Emails listed in `AI_EXEMPT_USERS` in `lib/ai-usage-config.ts` have no limit.
