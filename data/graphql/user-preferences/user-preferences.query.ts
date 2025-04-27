import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { UserPreferencesRepositoryInterface } from '../../../repositories/user-preferences/user-preferences.repository.interface';
import { UserPreferences } from '../../../types/user-preferences';
import { logger } from '../../../lib/logger';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';

const userPreferencesQueryTypeDefs = /* GraphQL */ `
  extend type Query {
    getUserPreferences: UserPreferences
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
  },
};

export { userPreferencesQueryTypeDefs, userPreferencesQueryResolver };
