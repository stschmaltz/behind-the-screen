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
    setTheme(input: SetThemeInput!): UserPreferences
    incrementAiGenerationUsage: UserPreferences
  }

  input SetActiveCampaignInput {
    campaignId: ID
  }

  input SetThemeInput {
    theme: String!
  }
`;

interface SetActiveCampaignArgs {
  input: {
    campaignId: string | null;
  };
}

interface SetThemeArgs {
  input: {
    theme: string;
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

    async setTheme(
      _: any,
      { input }: SetThemeArgs,
      context: GraphQLContext,
    ): Promise<UserPreferences | null> {
      logger.info('setTheme', input);
      isAuthorizedOrThrow(context);

      return userPreferencesRepository.setTheme({
        userId: context.user._id,
        theme: input.theme,
      });
    },

    async incrementAiGenerationUsage(
      _: any,
      __: any,
      context: GraphQLContext,
    ): Promise<UserPreferences | null> {
      logger.info('incrementAiGenerationUsage');
      isAuthorizedOrThrow(context);

      return userPreferencesRepository.incrementAiGenerationUsage(
        context.user._id,
      );
    },

    async requestMoreUses(
      _: any,
      __: any,
      context: GraphQLContext,
    ): Promise<UserPreferences | null> {
      logger.info('requestMoreUses');
      isAuthorizedOrThrow(context);

      return userPreferencesRepository.requestMoreUses(context.user._id);
    },
  },
};

export { userPreferencesMutationTypeDefs, userPreferencesMutationResolver };
