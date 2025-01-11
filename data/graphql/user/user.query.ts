const userQueryTypeDefs = /* GraphQL */ `
  extend type Query {
    me: User!
  }
`;

const userQueryResolver = {
  Query: {
    async me() {
      // example stub
      return { _id: '123', email: 'sample@example.com' };
    },
  },
};

export { userQueryTypeDefs, userQueryResolver };
