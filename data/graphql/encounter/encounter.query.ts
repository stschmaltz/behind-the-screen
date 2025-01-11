// graphql/encounter/encounter.query.ts
const encounterQueryTypeDefs = /* GraphQL */ `
  extend type Query {
    encounterById(id: String!): Encounter
    allEncounters: [Encounter!]!
  }
`;

const encounterQueryResolver = {
  Query: {
    async encounterById(_: never, { id }: { id: string }) {
      console.log('encounterById', id);
      return {
        /* ... */
      };
    },
    async allEncounters() {
      console.log('allEncounters');
      return [];
    },
  },
};

export { encounterQueryTypeDefs, encounterQueryResolver };
