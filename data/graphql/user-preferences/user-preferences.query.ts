import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { UserPreferencesRepositoryInterface } from '../../../repositories/user-preferences/user-preferences.repository.interface';
import { LootGenerationRepositoryInterface } from '../../../repositories/generation/loot-generation.repository.interface';
import { NpcGenerationRepositoryInterface } from '../../../repositories/generation/npc-generation.repository.interface';
import { UserPreferences } from '../../../types/user-preferences';
import { logger } from '../../../lib/logger';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';
import { isFeatureEnabled } from '../../../lib/featureFlags';

const userPreferencesQueryTypeDefs = /* GraphQL */ `
  extend type Query {
    getUserPreferences: UserPreferences
    getAllUsageStats: [AiUsageStat!]!
    getAiGenerationCount: Int!
  }
`;

const userPreferencesRepository =
  appContainer.get<UserPreferencesRepositoryInterface>(
    TYPES.UserPreferencesRepository,
  );
const lootGenerationRepository =
  appContainer.get<LootGenerationRepositoryInterface>(
    TYPES.LootGenerationRepository,
  );
const npcGenerationRepository =
  appContainer.get<NpcGenerationRepositoryInterface>(
    TYPES.NpcGenerationRepository,
  );

const userPreferencesQueryResolver = {
  Query: {
    async getUserPreferences(
      _: any,
      __: any,
      context: GraphQLContext,
    ): Promise<UserPreferences | null> {
      logger.info('getUserPreferences');
      isAuthorizedOrThrow(context);

      return userPreferencesRepository.getUserPreferences(context.user._id);
    },

    async getAllUsageStats(
      _: any,
      __: any,
      context: GraphQLContext,
    ): Promise<
      Array<{
        email: string;
        usageCount: number;
        limit: number;
        resetDate?: string;
        loginCount?: number;
        lastLoginDate?: string;
      }>
    > {
      logger.info('getAllUsageStats');
      isAuthorizedOrThrow(context);

      if (!isFeatureEnabled(context.user.email)) {
        throw new Error('Unauthorized');
      }

      return userPreferencesRepository.getAllUsageStats();
    },

    async getAiGenerationCount(
      _: any,
      __: any,
      context: GraphQLContext,
    ): Promise<number> {
      logger.info('getAiGenerationCount');
      isAuthorizedOrThrow(context);

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [lootCount, npcCount] = await Promise.all([
        lootGenerationRepository.countAiGenerations({
          userId: context.user._id,
          since: sevenDaysAgo,
        }),
        npcGenerationRepository.countAiGenerations({
          userId: context.user._id,
          since: sevenDaysAgo,
        }),
      ]);

      return lootCount + npcCount;
    },
  },
};

export { userPreferencesQueryTypeDefs, userPreferencesQueryResolver };
