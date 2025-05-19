import type {
  AllCampaignsQuery,
  CampaignByIdQuery,
  SaveCampaignMutation,
  DeleteCampaignMutation,
  Campaign,
} from '../../../generated/graphql';

export const allCampaignsQuery = /* GraphQL */ `
  query AllCampaigns {
    getCampaigns {
      _id
      name
      status
      createdAt
      updatedAt
    }
  }
`;

export type AllCampaignsResponse = AllCampaignsQuery;

export const campaignByIdQuery = /* GraphQL */ `
  query CampaignById($id: ID!) {
    getCampaign(id: $id) {
      _id
      name
      status
      createdAt
      updatedAt
    }
  }
`;

export type CampaignByIdResponse = CampaignByIdQuery;

export const saveCampaignMutation = /* GraphQL */ `
  mutation SaveCampaign($input: NewCampaignInput!) {
    saveCampaign(input: $input) {
      _id
      name
      status
      createdAt
      updatedAt
    }
  }
`;

export type SaveCampaignMutationResponse = SaveCampaignMutation;

export const deleteCampaignMutation = /* GraphQL */ `
  mutation DeleteCampaign($input: DeleteCampaignInput!) {
    deleteCampaign(input: $input)
  }
`;

export type DeleteCampaignMutationResponse = DeleteCampaignMutation;
