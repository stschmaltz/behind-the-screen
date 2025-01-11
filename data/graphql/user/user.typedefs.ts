// graphql/user/user.typeDefs.ts
const userTypeDefs = /* GraphQL */ `
  type User {
    _id: String!
    email: String!
  }

  type UserSignInResponse {
    user: User!
  }

  input UserSignInInput {
    email: String!
  }
`;

export { userTypeDefs };
