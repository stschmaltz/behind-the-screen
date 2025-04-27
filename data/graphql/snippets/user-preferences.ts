export const getUserPreferencesQuery = /* GraphQL */ `
  query GetUserPreferences {
    getUserPreferences {
      _id
      activeCampaignId
    }
  }
`;

export interface GetUserPreferencesResponse {
  getUserPreferences: {
    _id: string;
    activeCampaignId?: string;
  } | null;
}

export const setActiveCampaignMutation = /* GraphQL */ `
  mutation SetActiveCampaign($input: SetActiveCampaignInput!) {
    setActiveCampaign(input: $input) {
      _id
      activeCampaignId
    }
  }
`;

export interface SetActiveCampaignResponse {
  setActiveCampaign: {
    _id: string;
    activeCampaignId?: string;
  };
}
