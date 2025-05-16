const campaignTypeDefs = /* GraphQL */ `
  enum CampaignStatus {
    active
    completed
    archived
  }

  type Campaign {
    _id: ID!
    name: String!
    status: CampaignStatus
    createdAt: String!
    updatedAt: String!
  }

  input NewCampaignInput {
    id: ID
    name: String!
    status: CampaignStatus
  }

  input DeleteCampaignInput {
    id: ID!
  }
`;

export { campaignTypeDefs };
