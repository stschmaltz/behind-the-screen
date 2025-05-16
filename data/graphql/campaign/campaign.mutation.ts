import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { CampaignRepositoryInterface } from '../../../repositories/campaign/campaign.repository.interface';
import { Campaign } from '../../../types/campaigns';
import { logger } from '../../../lib/logger';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';

const campaignMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    saveCampaign(input: NewCampaignInput!): Campaign
    deleteCampaign(input: DeleteCampaignInput!): Boolean
  }
`;

interface SaveCampaignArgs {
  input: {
    id?: string;
    name: string;
    status?: 'active' | 'completed' | 'archived';
  };
}

interface DeleteCampaignArgs {
  input: { id: string };
}

const campaignRepository = appContainer.get<CampaignRepositoryInterface>(
  TYPES.CampaignRepository,
);

const campaignMutationResolver = {
  Mutation: {
    async saveCampaign(
      _: any,
      { input }: SaveCampaignArgs,
      context: GraphQLContext,
    ): Promise<Campaign | null> {
      logger.info('saveCampaign', input);
      isAuthorizedOrThrow(context);

      return campaignRepository.saveCampaign({
        ...input,
        userId: context.user._id,
      });
    },

    async deleteCampaign(
      _: any,
      { input: { id } }: DeleteCampaignArgs,
      context: GraphQLContext,
    ): Promise<boolean> {
      logger.info('deleteCampaign', id);
      isAuthorizedOrThrow(context);

      return campaignRepository.deleteCampaign({
        id,
        userId: context.user._id,
      });
    },
  },
};

export { campaignMutationTypeDefs, campaignMutationResolver };
