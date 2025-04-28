export const playerTypeDefs = /* GraphQL */ `
  type Player {
    _id: ID!
    name: String!
    armorClass: Int
    maxHP: Int
    level: Int
    createdAt: Date!
    userId: String!
    campaignId: ID!
  }

  input NewPlayerInput {
    name: String!
    campaignId: ID!
    armorClass: Int
    maxHP: Int
    level: Int
  }

  input UpdatePlayersInput {
    campaignId: ID!
    armorClass: Int
    maxHP: Int
    level: Int
    levelUp: Boolean
  }
`;
