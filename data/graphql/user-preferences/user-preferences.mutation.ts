import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { UserPreferencesRepositoryInterface } from '../../../repositories/user-preferences/user-preferences.repository.interface';
import { UserPreferences } from '../../../types/user-preferences';
import { logger } from '../../../lib/logger';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';

const userPreferencesMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    setActiveCampaign(input: SetActiveCampaignInput!): UserPreferences
  }

  input SetActiveCampaignInput {
    campaignId: ID
  }
`;

interface SetActiveCampaignArgs {
  input: {
    campaignId: string | null;
  };
}

const userPreferencesRepository =
  appContainer.get<UserPreferencesRepositoryInterface>(
    TYPES.UserPreferencesRepository,
  );

const userPreferencesMutationResolver = {
  Mutation: {
    async setActiveCampaign(
      _: any,
      { input }: SetActiveCampaignArgs,
      context: GraphQLContext,
    ): Promise<UserPreferences | null> {
      logger.info('setActiveCampaign', input);
      isAuthorizedOrThrow(context);

      return userPreferencesRepository.setActiveCampaign({
        userId: context.user._id,
        campaignId: input.campaignId || null,
      });
    },
  },
};

export { userPreferencesMutationTypeDefs, userPreferencesMutationResolver };
