const adventureTypeDefs = /* GraphQL */ `
  enum AdventureStatus {
    active
    completed
    archived
  }

  type Adventure {
    _id: ID!
    campaignId: ID!
    name: String!
    description: String
    status: AdventureStatus!
    createdAt: String!
    updatedAt: String!
  }

  input NewAdventureInput {
    id: ID
    campaignId: ID!
    name: String!
    description: String
    status: AdventureStatus!
  }

  input DeleteAdventureInput {
    id: ID!
  }
`;

export { adventureTypeDefs };
