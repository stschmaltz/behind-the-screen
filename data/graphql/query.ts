const queryTypeDefs = /* GraphQL */ `
  type Query {
    me: User!
  }
`;

const queryResolver = {
  Query: {
    async me() {
      return { name: 'Shane Schmaltz' };
    },
  },
};

export { queryResolver, queryTypeDefs };
