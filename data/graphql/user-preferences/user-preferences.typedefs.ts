const userPreferencesTypeDefs = /* GraphQL */ `
  type UserPreferences {
    _id: ID!
    activeCampaignId: ID
    theme: String
    aiGenerationUsageCount: Int
    aiUsageResetDate: String
    hasRequestedMoreUses: Boolean
  }

  type AiUsageStat {
    email: String!
    usageCount: Int!
    limit: Int!
    resetDate: String
    hasRequestedMoreUses: Boolean
  }
`;

export { userPreferencesTypeDefs };
