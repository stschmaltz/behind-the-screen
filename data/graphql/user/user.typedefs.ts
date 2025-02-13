const userTypeDefs = /* GraphQL */ `
  type User {
    _id: String!
    auth0Id: String!
    email: String!
    name: String
    picture: String
  }

  type UserSignInResponse {
    user: User!
  }

  input UserSignInInput {
    email: String!
    auth0Id: String!
    name: String
    picture: String
  }
`;

export { userTypeDefs };