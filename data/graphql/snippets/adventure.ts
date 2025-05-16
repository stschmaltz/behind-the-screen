export const allAdventuresQuery = /* GraphQL */ `
  query AllAdventures {
    getAdventures {
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

export interface AllAdventuresResponse {
  getAdventures: {
    _id: string;
    campaignId: string;
    name: string;
    description?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export const adventureByIdQuery = /* GraphQL */ `
  query AdventureById($id: ID!) {
    getAdventure(id: $id) {
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

export interface AdventureByIdResponse {
  getAdventure: {
    _id: string;
    campaignId: string;
    name: string;
    description?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

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
      campaignId
      name
      description
      status
      createdAt
      updatedAt
    }
  }
`;

export const deleteAdventureMutation = /* GraphQL */ `
  mutation DeleteAdventure($input: DeleteAdventureInput!) {
    deleteAdventure(input: $input)
  }
`;
