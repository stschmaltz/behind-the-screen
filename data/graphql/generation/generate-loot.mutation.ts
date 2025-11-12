import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { LootGenerationRepositoryInterface } from '../../../repositories/generation/loot-generation.repository.interface';
import { logger } from '../../../lib/logger';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';
import fetch from 'node-fetch';

const MASTRA_SERVICE_BASE_URL = process.env.MASTRA_SERVICE_BASE_URL;
const MASTRA_WORKFLOW_PATH =
  '/api/workflows/lootGenerationWorkflow/start-async';

const generateLootMutationTypeDefs = /* GraphQL */ `
  type LootItem {
    level: String
    coins: String
    item: String
    description: String
    note: String
    source: String
    rarity: String
  }

  extend type Mutation {
    generateLoot(
      partyLevel: Int!
      srdItemCount: Int!
      randomItemCount: Int!
      context: String
      lootQuality: String
    ): [LootItem!]!
  }
`;

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

function parseLootArray(responseText: string) {
  const lootData = JSON.parse(responseText);
  if (Array.isArray(lootData)) return lootData;
  if (lootData && Array.isArray(lootData.result)) return lootData.result;
  if (lootData && Array.isArray(lootData.output)) return lootData.output;
  if (
    lootData?.results?.formatLoot?.output &&
    Array.isArray(lootData.results.formatLoot.output)
  )
    return lootData.results.formatLoot.output;
  if (lootData && typeof lootData.text === 'string') {
    try {
      const inner = JSON.parse(lootData.text);
      if (Array.isArray(inner)) return inner;
      if (inner && Array.isArray(inner.output)) return inner.output;
    } catch {}
  }
  return null;
}

async function saveLootGeneration({
  userId,
  partyLevel,
  srdItemCount,
  randomItemCount,
  context,
  loot,
}: any) {
  const lootGenerationRepository =
    appContainer.get<LootGenerationRepositoryInterface>(
      TYPES.LootGenerationRepository,
    );
  await lootGenerationRepository.saveGeneration({
    userId,
    timestamp: Date.now(),
    partyLevel,
    srdItemCount,
    randomItemCount,
    context: context || '',
    loot,
  });
}

const generateLootMutationResolver = {
  Mutation: {
    async generateLoot(
      _: any,
      { partyLevel, srdItemCount, randomItemCount, context, lootQuality }: any,
      contextObj: GraphQLContext,
    ) {
      isAuthorizedOrThrow(contextObj);
      const fullMastraUrl = buildMastraUrl();
      const requestBody = {
        inputData: {
          partyLevel,
          srdItemCount,
          randomItemCount,
          context: context || undefined,
          lootQuality: lootQuality || 'standard',
        },
      };
      logger.info('[generateLoot] Sending request to Mastra:', {
        url: fullMastraUrl,
        body: requestBody,
      });
      const { res: mastraResponse, text: responseText } =
        await sendMastraRequest(fullMastraUrl, requestBody);
      logger.info('[generateLoot] Raw response from Mastra:', responseText);
      if (!mastraResponse.ok) {
        throw new Error(
          `Mastra service error: ${mastraResponse.status} - ${responseText || mastraResponse.statusText}`,
        );
      }
      const lootArray = parseLootArray(responseText);
      if (!lootArray) {
        throw new Error('Mastra service did not return an array.');
      }
      await saveLootGeneration({
        userId: contextObj.user._id,
        partyLevel,
        srdItemCount,
        randomItemCount,
        context,
        loot: lootArray,
      });
      return lootArray;
    },
  },
};

export { generateLootMutationTypeDefs, generateLootMutationResolver };
