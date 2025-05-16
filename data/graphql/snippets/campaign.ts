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

export interface AllCampaignsResponse {
  getCampaigns: {
    _id: string;
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

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

export interface CampaignByIdResponse {
  getCampaign: {
    _id: string;
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

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

export const deleteCampaignMutation = /* GraphQL */ `
  mutation DeleteCampaign($input: DeleteCampaignInput!) {
    deleteCampaign(input: $input)
  }
`;
