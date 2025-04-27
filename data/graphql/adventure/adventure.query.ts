import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { AdventureRepositoryInterface } from '../../../repositories/adventure/adventure.repository.interface';
import { Adventure } from '../../../types/adventures';
import { logger } from '../../../lib/logger';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';

const adventureQueryTypeDefs = /* GraphQL */ `
  extend type Query {
    getAdventure(id: ID!): Adventure
    getAdventures: [Adventure]
    getAdventuresByCampaign(campaignId: ID!): [Adventure]
  }
`;

const adventureRepository = appContainer.get<AdventureRepositoryInterface>(
  TYPES.AdventureRepository,
);

const adventureQueryResolver = {
  Query: {
    async getAdventure(
      _: any,
      { id }: { id: string },
      context: GraphQLContext,
    ): Promise<Adventure | null> {
      logger.info('getAdventure', id);
      isAuthorizedOrThrow(context);

      return adventureRepository.getAdventureById({
        id,
        userId: context.user._id,
      });
    },

    async getAdventures(
      _: any,
      __: any,
      context: GraphQLContext,
    ): Promise<Adventure[]> {
      logger.info('getAdventures');
      isAuthorizedOrThrow(context);

      return adventureRepository.getAllAdventures({
        userId: context.user._id,
      });
    },

    async getAdventuresByCampaign(
      _: any,
      { campaignId }: { campaignId: string },
      context: GraphQLContext,
    ): Promise<Adventure[]> {
      logger.info('getAdventuresByCampaign', campaignId);
      isAuthorizedOrThrow(context);

      return adventureRepository.getAdventuresByCampaign({
        userId: context.user._id,
        campaignId,
      });
    },
  },
};

export { adventureQueryTypeDefs, adventureQueryResolver };
