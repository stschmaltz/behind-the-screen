import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { CampaignRepositoryInterface } from '../../../repositories/campaign/campaign.repository.interface';
import { Campaign } from '../../../types/campaigns';
import { logger } from '../../../lib/logger';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';

const campaignQueryTypeDefs = /* GraphQL */ `
  extend type Query {
    getCampaign(id: ID!): Campaign
    getCampaigns: [Campaign]
  }
`;

const campaignRepository = appContainer.get<CampaignRepositoryInterface>(
  TYPES.CampaignRepository,
);

const campaignQueryResolver = {
  Query: {
    async getCampaign(
      _: any,
      { id }: { id: string },
      context: GraphQLContext,
    ): Promise<Campaign | null> {
      logger.info('getCampaign', id);
      isAuthorizedOrThrow(context);

      return campaignRepository.getCampaignById({
        id,
        userId: context.user._id,
      });
    },

    async getCampaigns(
      _: any,
      __: any,
      context: GraphQLContext,
    ): Promise<Campaign[]> {
      logger.info('getCampaigns');
      isAuthorizedOrThrow(context);

      return campaignRepository.getAllCampaigns({
        userId: context.user._id,
      });
    },
  },
};

export { campaignQueryTypeDefs, campaignQueryResolver };
