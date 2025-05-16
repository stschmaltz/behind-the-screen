export const getUserPreferencesQuery = /* GraphQL */ `
  query GetUserPreferences {
    getUserPreferences {
      _id
      activeCampaignId
      theme
    }
  }
`;

export interface GetUserPreferencesResponse {
  getUserPreferences: {
    _id: string;
    activeCampaignId?: string;
    theme?: string;
  } | null;
}

export const setActiveCampaignMutation = /* GraphQL */ `
  mutation SetActiveCampaign($input: SetActiveCampaignInput!) {
    setActiveCampaign(input: $input) {
      _id
      activeCampaignId
      theme
    }
  }
`;

export interface SetActiveCampaignResponse {
  setActiveCampaign: {
    _id: string;
    activeCampaignId?: string;
    theme?: string;
  };
}

export const setThemeMutation = /* GraphQL */ `
  mutation SetTheme($input: SetThemeInput!) {
    setTheme(input: $input) {
      _id
      activeCampaignId
      theme
    }
  }
`;

export interface SetThemeResponse {
  setTheme: {
    _id: string;
    activeCampaignId?: string;
    theme: string;
  };
}
