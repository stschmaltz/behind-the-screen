import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { GraphQLContext } from '../../../lib/context';
import { EncounterRepositoryInterface } from '../../../repositories/encounter/encounter.repository.interface';

const encounterQueryTypeDefs = /* GraphQL */ `
  extend type Query {
    encounterById(id: String!): Encounter
    allEncounters: [Encounter!]!
  }
`;

const encounterRepository = appContainer.get<EncounterRepositoryInterface>(
  TYPES.EncounterRepository,
);

const encounterQueryResolver = {
  Query: {
    async encounterById(_: never, { id }: { id: string }, context: GraphQLContext) {
      
      console.log('encounterById', {id,context});

      return encounterRepository.getEncounterById(id);
    },
    async allEncounters() {
      console.log('allEncounters');

      return encounterRepository.getAllEncounters();
    },
  },
};

export { encounterQueryTypeDefs, encounterQueryResolver };
