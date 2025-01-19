export const playerTypeDefs = /* GraphQL */ `
  type Player {
    _id: ID!
    name: String!
    createdAt: Date!
  }

  input NewPlayerInput {
    name: String!
  }
`;
