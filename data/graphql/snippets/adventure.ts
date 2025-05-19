import type {
  AllAdventuresQuery,
  AdventureByIdQuery,
  SaveAdventureMutation,
  DeleteAdventureMutation,
  Adventure,
} from '../../../generated/graphql';

export const allAdventuresQuery = /* GraphQL */ `
  query AllAdventures {
    getAdventures {
      _id
      name
      status
      createdAt
      updatedAt
      campaignId
    }
  }
`;

export type AllAdventuresResponse = AllAdventuresQuery;

export const adventureByIdQuery = /* GraphQL */ `
  query AdventureById($id: ID!) {
    getAdventure(id: $id) {
      _id
      name
      status
      createdAt
      updatedAt
      campaignId
    }
  }
`;

export type AdventureByIdResponse = AdventureByIdQuery;

export const adventuresByCampaignQuery = /* GraphQL */ `
  query AdventuresByCampaign($campaignId: ID!) {
    getAdventuresByCampaign(campaignId: $campaignId) {
      _id
      campaignId
      name
      description
      status
      createdAt
      updatedAt
    }
  }
`;

export interface AdventuresByCampaignResponse {
  getAdventuresByCampaign: {
    _id: string;
    campaignId: string;
    name: string;
    description?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export const saveAdventureMutation = /* GraphQL */ `
  mutation SaveAdventure($input: NewAdventureInput!) {
    saveAdventure(input: $input) {
      _id
      name
      status
      createdAt
      updatedAt
      campaignId
    }
  }
`;

export type SaveAdventureMutationResponse = SaveAdventureMutation;

export const deleteAdventureMutation = /* GraphQL */ `
  mutation DeleteAdventure($input: DeleteAdventureInput!) {
    deleteAdventure(input: $input)
  }
`;

export type DeleteAdventureMutationResponse = DeleteAdventureMutation;
