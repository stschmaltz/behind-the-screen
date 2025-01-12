import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
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
    async encounterById(_: never, { id }: { id: string }) {
      console.log('encounterById', id);

      return encounterRepository.getEncounterById(id);
    },
    async allEncounters() {
      console.log('allEncounters');

      return encounterRepository.getAllEncounters();
    },
  },
};

export { encounterQueryTypeDefs, encounterQueryResolver };
