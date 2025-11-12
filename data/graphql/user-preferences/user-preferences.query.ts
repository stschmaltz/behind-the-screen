import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { UserPreferencesRepositoryInterface } from '../../../repositories/user-preferences/user-preferences.repository.interface';
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
  }
`;

const userPreferencesRepository =
  appContainer.get<UserPreferencesRepositoryInterface>(
    TYPES.UserPreferencesRepository,
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
    ): Promise<Array<{
      email: string;
      usageCount: number;
      limit: number;
      resetDate?: string;
    }>> {
      logger.info('getAllUsageStats');
      isAuthorizedOrThrow(context);

      if (!isFeatureEnabled(context.user.email)) {
        throw new Error('Unauthorized');
      }

      return userPreferencesRepository.getAllUsageStats();
    },
  },
};

export { userPreferencesQueryTypeDefs, userPreferencesQueryResolver };
