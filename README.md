# Encounter Manager

A free D&D 5e encounter manager and combat tracker for Dungeon Masters, live at [encountermanager.com](https://encountermanager.com). The repository is named `behind-the-screen`.

## What it does

- **Prep encounters.** Build an encounter from a searchable SRD monster library or custom stat blocks, and see its difficulty for your party.
- **Run combat.** Track initiative, turns and rounds, hit points, temporary hit points and conditions, with monster stat blocks and spell descriptions on hand.
- **Organise.** Group encounters into campaigns and adventures, and keep a roster of player characters per campaign.
- **Generate.** NPC and loot generators, with an optional AI mode.

## Tech stack

| Area      | Choice                                                 |
| --------- | ------------------------------------------------------ |
| Framework | Next.js 15 (Pages Router), React 19, TypeScript        |
| Styling   | Tailwind CSS with DaisyUI                              |
| API       | GraphQL Yoga on a single route, plus a few REST routes |
| Database  | MongoDB (native driver)                                |
| Auth      | Auth0 (`@auth0/nextjs-auth0`)                          |
| Analytics | PostHog, Vercel Analytics                              |
| Tests     | Jest, Testing Library                                  |
| Hosting   | Vercel, installable as a PWA                           |

## Getting started

You need Node.js 22, a MongoDB database and an Auth0 application.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your environment file and fill it in:
   ```bash
   cp .env.base .env.local
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000.

### Environment variables

`.env.base` lists every variable. The app will not start without the MongoDB and Auth0 values.

| Variable                                                                                            | Needed for                             |
| --------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `MONGODB_URI`, `DB_NAME`                                                                            | Everything                             |
| `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` | Login                                  |
| `AUTH0_MANAGEMENT_CLIENT_ID`, `AUTH0_MANAGEMENT_CLIENT_SECRET`                                      | Account deletion                       |
| `SITE_URL`                                                                                          | Sitemap generation at build time       |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`                                               | Analytics                              |
| `SENDGRID_API_KEY`, `FEEDBACK_TO_EMAIL`, `FEEDBACK_FROM_EMAIL`                                      | Feedback email                         |
| `MASTRA_SERVICE_BASE_URL`                                                                           | AI mode in the NPC and loot generators |

`.env.local` is ignored by git. If it points at the production database, local changes are production changes.

## Commands

| Command                 | What it does                                                   |
| ----------------------- | -------------------------------------------------------------- |
| `npm run dev`           | Start the dev server                                           |
| `npm run build`         | Production build, then sitemap generation                      |
| `npm run start`         | Serve the production build                                     |
| `npm run tsc`           | Type check                                                     |
| `npm run lint`          | ESLint with `--fix`                                            |
| `npm run fmt`           | Prettier                                                       |
| `npm test`              | Unit tests                                                     |
| `npm run test:watch`    | Unit tests in watch mode                                       |
| `npm run test:coverage` | Unit tests with a coverage report                              |
| `npm run codegen`       | Regenerate `generated/graphql.ts` (dev server must be running) |

## Project structure

| Path                             | Contents                                                            |
| -------------------------------- | ------------------------------------------------------------------- |
| `pages/`                         | Routes and the components that belong to a single route             |
| `pages/api/`                     | `graphql.ts` (the GraphQL endpoint), Auth0 handlers and REST routes |
| `components/`                    | Shared UI; primitives are in `components/ui/`                       |
| `hooks/`                         | Data fetching and state logic                                       |
| `context/`                       | React context providers                                             |
| `data/graphql/`                  | Schema and resolvers by domain; client operations in `snippets/`    |
| `data/monsters/`, `data/spells/` | Static SRD data                                                     |
| `repositories/`                  | MongoDB access, one repository per domain                           |
| `container/`                     | Inversify bindings for the repositories                             |
| `lib/`                           | Pure helpers (difficulty maths, logging, caching)                   |
| `types/`                         | Domain types                                                        |
| `generated/`                     | GraphQL codegen output                                              |
| `scripts/`                       | One-off scripts for the monster and spell data                      |
| `docs/`                          | API, testing and AI usage notes                                     |

## How it fits together

The browser talks to one GraphQL endpoint. A page calls a hook; the hook sends an operation from `data/graphql/snippets/`; the resolver checks the Auth0 session and calls a repository; the repository reads or writes MongoDB, always filtered by the signed-in user.

An encounter is a single document. Combat state (initiative order, hit points, conditions, current turn and round) is edited in the browser and saved as a whole with the `saveEncounter` mutation.

More detail: [docs/api.md](docs/api.md), [docs/testing.md](docs/testing.md), [docs/ai-usage-tracking.md](docs/ai-usage-tracking.md).

## Working on this with an AI agent

[AGENTS.md](AGENTS.md) holds the instructions for coding agents: product priorities, commands, architecture, conventions and the traps that are easy to fall into. Claude Code loads it through [CLAUDE.md](CLAUDE.md); Cursor, Codex and other tools read `AGENTS.md` directly. Keep it current when the architecture or the workflow changes.

## Deployment

Vercel builds every branch as a preview and deploys `main` to production. Environment variables are managed in the Vercel dashboard.

## License

MIT, copyright Shane Schmaltz. See [LICENSE.md](LICENSE.md). The project is not open for contributions.

## Legal notice: D&D SRD and Open Game License

This application includes Open Game Content from the System Reference Document 5.1 (SRD 5.1) by Wizards of the Coast, LLC, used under the terms of the Open Game License v1.0a. Only content from the SRD 5.1 is included. Dungeons & Dragons and D&D are trademarks of Wizards of the Coast, LLC. See [OGL.txt](OGL.txt) for the full license text.
