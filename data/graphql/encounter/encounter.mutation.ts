import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';

const encounterMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    saveEncounter(input: NewEncounterInput!): Encounter
  }
`;

interface SaveEncounterArgs {
  input: {
    name: string;
    description?: string;
    notes?: string[];
    enemies: Array<{
      name: string;
      maxHP: number;
      currentHP: number;
      conditions: string[];
      armorClass: number;
    }>;
    status?: string;
    players?: Array<{ _id: string }>;
    npcs?: Array<{
      name: string;
      maxHP: number;
      currentHP: number;
      conditions: string[];
      armorClass: number;
    }>;
    initiativeOrder?: Array<{
      characterId: number;
      initiative: number;
    }>;
    currentRound?: number;
    currentTurn?: number;
  };
}

// const encounterRepository = appContainer.get<EncounterRepositoryInterface>(
//   TYPES.EncounterRepository,
// );

const encounterMutationResolver = {
  Mutation: {
    async saveEncounter(_: never, { input }: SaveEncounterArgs) {
      console.log('saveEncounter', input);
      //   return encounterRepository.saveEncounter(input);
    },
  },
};

export { encounterMutationTypeDefs, encounterMutationResolver };
