const userPreferencesTypeDefs = /* GraphQL */ `
  type UserPreferences {
    _id: ID!
    activeCampaignId: ID
    theme: String
    aiGenerationUsageCount: Int
  }

  type AiUsageStat {
    email: String!
    usageCount: Int!
    limit: Int!
    resetDate: String
  }
`;

export { userPreferencesTypeDefs };
