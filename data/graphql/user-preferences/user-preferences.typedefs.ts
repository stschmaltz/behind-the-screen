const userPreferencesTypeDefs = /* GraphQL */ `
  type UserPreferences {
    _id: ID!
    activeCampaignId: ID
    theme: String
    hasRequestedMoreUses: Boolean
  }

  type AiUsageStat {
    email: String!
    usageCount: Int!
    totalUsageEver: Int!
    limit: Int!
    resetDate: String
    hasRequestedMoreUses: Boolean
    loginCount: Int
    lastLoginDate: String
  }
`;

export { userPreferencesTypeDefs };
