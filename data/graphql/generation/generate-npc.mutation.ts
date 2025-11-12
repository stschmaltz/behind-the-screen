import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';
import { logger } from '../../../lib/logger';
import fetch from 'node-fetch';

const generateNpcMutationTypeDefs = /* GraphQL */ `
  type Npc {
    name: String!
    race: String!
    gender: String!
    age: String!
    occupation: String!
    personality: String!
    appearance: String!
    quirk: String!
    motivation: String!
    secret: String
    background: String
  }

  extend type Mutation {
    generateNpc(
      race: String
      occupation: String
      context: String
      includeSecret: Boolean!
      includeBackground: Boolean!
    ): Npc!
  }
`;

const MASTRA_SERVICE_BASE_URL = process.env.MASTRA_SERVICE_BASE_URL;
const MASTRA_WORKFLOW_PATH = '/api/workflows/npcGenerationWorkflow/start-async';

function buildMastraUrl() {
  if (!MASTRA_SERVICE_BASE_URL) {
    throw new Error('Mastra service base URL not set.');
  }
  return `${MASTRA_SERVICE_BASE_URL.replace(/\/$/, '')}${MASTRA_WORKFLOW_PATH}`;
}

async function sendMastraRequest(url: string, body: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.clone().text();
  return { res, text };
}

function parseNpcData(responseText: string) {
  const data = JSON.parse(responseText);
  if (data && typeof data === 'object' && data.name) return data;
  if (data?.output && typeof data.output === 'object' && data.output.name)
    return data.output;
  if (
    data?.results?.formatNpc?.output &&
    typeof data.results.formatNpc.output === 'object' &&
    data.results.formatNpc.output.name
  )
    return data.results.formatNpc.output;
  if (data && typeof data.text === 'string') {
    try {
      const inner = JSON.parse(data.text);
      if (inner && typeof inner === 'object' && inner.name) return inner;
      if (
        inner?.output &&
        typeof inner.output === 'object' &&
        inner.output.name
      )
        return inner.output;
    } catch {}
  }
  return null;
}

const generateNpcMutationResolver = {
  Mutation: {
    async generateNpc(
      _: any,
      {
        race,
        occupation,
        context,
        includeSecret,
        includeBackground,
      }: {
        race?: string;
        occupation?: string;
        context?: string;
        includeSecret: boolean;
        includeBackground: boolean;
      },
      contextObj: GraphQLContext,
    ) {
      isAuthorizedOrThrow(contextObj);

      const fullMastraUrl = buildMastraUrl();
      const requestBody = {
        inputData: {
          race: race || undefined,
          occupation: occupation || undefined,
          context: context || undefined,
          includeSecret,
          includeBackground,
        },
      };

      logger.info('[generateNpc] Sending request to Mastra:', {
        url: fullMastraUrl,
        body: requestBody,
      });

      const { res: mastraResponse, text: responseText } =
        await sendMastraRequest(fullMastraUrl, requestBody);

      logger.info('[generateNpc] Raw response from Mastra:', responseText);

      if (!mastraResponse.ok) {
        throw new Error(
          `Mastra service error: ${mastraResponse.status} - ${responseText || mastraResponse.statusText}`,
        );
      }

      const npcData = parseNpcData(responseText);

      if (!npcData || !npcData.name) {
        throw new Error('Mastra service did not return valid NPC data.');
      }

      return npcData;
    },
  },
};

export { generateNpcMutationTypeDefs, generateNpcMutationResolver };
