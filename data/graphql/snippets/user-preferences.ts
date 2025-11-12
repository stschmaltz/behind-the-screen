export const getUserPreferencesQuery = /* GraphQL */ `
  query GetUserPreferences {
    getUserPreferences {
      _id
      activeCampaignId
      theme
      aiGenerationUsageCount
    }
  }
`;

export const setActiveCampaignMutation = /* GraphQL */ `
  mutation SetActiveCampaign($input: SetActiveCampaignInput!) {
    setActiveCampaign(input: $input) {
      _id
      activeCampaignId
      theme
      aiGenerationUsageCount
    }
  }
`;

export const incrementAiGenerationUsageMutation = /* GraphQL */ `
  mutation IncrementAiGenerationUsage {
    incrementAiGenerationUsage {
      _id
      aiGenerationUsageCount
    }
  }
`;

export const setThemeMutation = /* GraphQL */ `
  mutation SetTheme($input: SetThemeInput!) {
    setTheme(input: $input) {
      _id
      activeCampaignId
      theme
    }
  }
`;
