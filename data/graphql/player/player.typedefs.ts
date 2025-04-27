export const playerTypeDefs = /* GraphQL */ `
  type Player {
    _id: ID!
    name: String!
    armorClass: Int
    maxHP: Int
    createdAt: Date!
    userId: String!
    campaignId: ID!
  }

  input NewPlayerInput {
    name: String!
    campaignId: ID!
  }
`;
