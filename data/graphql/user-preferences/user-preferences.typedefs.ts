const userPreferencesTypeDefs = /* GraphQL */ `
  type UserPreferences {
    _id: ID!
    activeCampaignId: ID
    theme: String
    aiGenerationUsageCount: Int
    aiUsageResetDate: Date
    hasRequestedMoreUses: Boolean
  }

  type AiUsageStat {
    email: String!
    usageCount: Int!
    limit: Int!
    resetDate: Date
    hasRequestedMoreUses: Boolean
    loginCount: Int
    lastLoginDate: Date
  }
`;

export { userPreferencesTypeDefs };
