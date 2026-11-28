import { APIRequestContext, request } from '@playwright/test';
import { BASE_URL } from './env';
import { createSessionCookie, SESSION_COOKIE_NAME, TestUser } from './session';

export interface SeedCharacter {
  _id: string;
  name: string;
  maxHP: number;
  initiative?: number;
  type: 'enemy' | 'player';
}

export interface SeedEncounterInput {
  name: string;
  status: 'inactive' | 'active';
  campaignId: string;
  adventureId: string;
  characters: SeedCharacter[];
}

interface GraphQLResult<T> {
  data: T | null;
  errors?: { message: string }[];
}

export class Api {
  private constructor(
    private context: APIRequestContext,
    readonly user: TestUser,
  ) {}

  static async as(user: TestUser): Promise<Api> {
    const cookie = await createSessionCookie(user);
    const context = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { cookie: `${SESSION_COOKIE_NAME}=${cookie}` },
    });

    return new Api(context, user);
  }

  dispose = () => this.context.dispose();

  async raw<T>(query: string, variables?: object): Promise<GraphQLResult<T>> {
    // The dev server can drop the first connection while it compiles the
    // API route (or restarts after rewriting tsconfig), so retry briefly.
    let lastError: unknown;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = await this.context.post('/api/graphql', {
          data: { query, variables },
          timeout: 90_000,
        });

        return await response.json();
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 3_000));
      }
    }
    throw lastError;
  }

  async gql<T>(query: string, variables?: object): Promise<T> {
    const result = await this.raw<T>(query, variables);
    if (result.errors?.length || !result.data) {
      throw new Error(
        `GraphQL failed: ${JSON.stringify(result.errors ?? result)}`,
      );
    }

    return result.data;
  }

  /**
   * Asks the dev server for a page until it answers 200, so the slow first
   * compile of a route happens here and not inside a test's timeout.
   */
  async warmUp(path: string) {
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        const response = await this.context.get(path, { timeout: 120_000 });
        if (response.ok()) return;
      } catch {
        // server still compiling or restarting
      }
      await new Promise((resolve) => setTimeout(resolve, 3_000));
    }
    throw new Error(`Dev server never served ${path}`);
  }

  signIn = () =>
    this.gql(
      `mutation ($input: UserSignInInput!) { userSignIn(input: $input) { user { _id } } }`,
      {
        input: {
          email: this.user.email,
          auth0Id: this.user.sub,
          name: this.user.name,
        },
      },
    );

  async createCampaign(name: string): Promise<string> {
    const data = await this.gql<{ saveCampaign: { _id: string } }>(
      `mutation ($input: NewCampaignInput!) { saveCampaign(input: $input) { _id } }`,
      { input: { name, status: 'active' } },
    );

    return data.saveCampaign._id;
  }

  async createAdventure(campaignId: string, name: string): Promise<string> {
    const data = await this.gql<{ saveAdventure: { _id: string } }>(
      `mutation ($input: NewAdventureInput!) { saveAdventure(input: $input) { _id } }`,
      { input: { campaignId, name, status: 'active' } },
    );

    return data.saveAdventure._id;
  }

  async createPlayer(campaignId: string, name: string): Promise<string> {
    const data = await this.gql<{ createPlayer: { _id: string } }>(
      `mutation ($input: NewPlayerInput!) { createPlayer(input: $input) { _id } }`,
      { input: { campaignId, name, armorClass: 16, maxHP: 40, level: 3 } },
    );

    return data.createPlayer._id;
  }

  async createEncounter(input: SeedEncounterInput): Promise<string> {
    const enemies = input.characters.filter((c) => c.type === 'enemy');
    const players = input.characters.filter((c) => c.type === 'player');
    const data = await this.gql<{ saveEncounter: { _id: string } }>(
      `mutation ($input: NewEncounterInput!) { saveEncounter(input: $input) { _id } }`,
      {
        input: {
          name: input.name,
          description: 'Created by the e2e suite',
          notes: [],
          status: input.status,
          campaignId: input.campaignId,
          adventureId: input.adventureId,
          currentRound: 1,
          currentTurn: 1,
          enemies: enemies.map((c) => ({
            _id: c._id,
            name: c.name,
            maxHP: c.maxHP,
            armorClass: 12,
            challenge: '1/4',
          })),
          players: players.map((c) => ({ _id: c._id })),
          initiativeOrder: input.characters.map((c) => ({
            _id: c._id,
            name: c.name,
            maxHP: c.maxHP,
            currentHP: c.maxHP,
            tempHP: 0,
            armorClass: 12,
            initiative: c.initiative,
            conditions: [],
            type: c.type,
          })),
        },
      },
    );

    return data.saveEncounter._id;
  }

  async getEncounter(id: string) {
    const data = await this.gql<{
      encounterById: {
        _id: string;
        name: string;
        status: string;
        currentTurn: number;
        currentRound: number;
        createdAt: string;
        initiativeOrder: { _id: string; name: string; currentHP: number }[];
      } | null;
    }>(
      `query ($id: String!) { encounterById(id: $id) {
        _id name status currentTurn currentRound createdAt
        initiativeOrder { _id name currentHP }
      } }`,
      { id },
    );

    return data.encounterById;
  }

  owned = () =>
    this.gql<{
      allEncounters: {
        name: string;
        campaignId: string;
        adventureId: string;
      }[];
      getAdventures: { _id: string; name: string; campaignId: string }[];
      getCampaigns: { _id: string; name: string }[];
    }>(
      `query {
        allEncounters { name campaignId adventureId }
        getAdventures { _id name campaignId }
        getCampaigns { _id name }
      }`,
    );

  /** Removes everything this test user owns so each run starts clean. */
  async purge() {
    const data = await this.gql<{
      allEncounters: { _id: string }[];
      allPlayers: { _id: string }[];
      getAdventures: { _id: string }[];
      getCampaigns: { _id: string }[];
    }>(
      `query { allEncounters { _id } allPlayers { _id } getAdventures { _id } getCampaigns { _id } }`,
    );

    for (const { _id } of data.allEncounters) {
      await this.gql(
        `mutation ($input: DeleteEncounterInput!) { deleteEncounter(input: $input) }`,
        { input: { id: _id } },
      );
    }
    for (const { _id } of data.allPlayers) {
      await this.gql(`mutation ($id: String!) { deletePlayer(id: $id) }`, {
        id: _id,
      });
    }
    for (const { _id } of data.getAdventures) {
      await this.gql(
        `mutation ($input: DeleteAdventureInput!) { deleteAdventure(input: $input) }`,
        { input: { id: _id } },
      );
    }
    for (const { _id } of data.getCampaigns) {
      await this.gql(
        `mutation ($input: DeleteCampaignInput!) { deleteCampaign(input: $input) }`,
        { input: { id: _id } },
      );
    }
  }
}
