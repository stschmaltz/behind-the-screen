// graphql/encounter/encounter.mutation.ts

import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { NewEncounter } from '../../../types/encounters';

// const encounterRepository = appContainer.get<EncounterRepositoryInterface>(
//   TYPES.EncounterRepository,
// );

const encounterMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    saveEncounter(input: NewEncounterInput!): Encounter
  }
`;

interface SaveEncounterArgs {
  input: NewEncounter; // or matching partial fields if needed
}

const encounterMutationResolver = {
  Mutation: {
    async saveEncounter(_: never, { input }: SaveEncounterArgs) {
      try {
        console.log('saveEncounter', input);
        // const newEncounter = await encounterRepository.saveEncounter(input);
        // return newEncounter;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to save encounter');
      }
    },
  },
};

export { encounterMutationTypeDefs, encounterMutationResolver };
