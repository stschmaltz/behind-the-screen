import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { EncounterRepositoryInterface } from '../../../repositories/encounter/encounter.repository.interface';
import { Encounter } from '../../../types/encounters';

const encounterMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    saveEncounter(input: NewEncounterInput!): Encounter
  }
`;

interface SaveEncounterArgs {
  input: Encounter;
}

const encounterRepository = appContainer.get<EncounterRepositoryInterface>(
  TYPES.EncounterRepository,
);

const encounterMutationResolver = {
  Mutation: {
    async saveEncounter(_: never, { input }: SaveEncounterArgs) {
      console.log('saveEncounter', input);

      return encounterRepository.saveEncounter({
        _id: input._id,
        name: input.name,
        description: input.description,
        notes: input.notes,
        enemies: input.enemies,
        status: input.status,
        players: input.players,
        npcs: input.npcs,
        initiativeOrder: input.initiativeOrder,
        currentRound: input.currentRound,
        currentTurn: input.currentTurn,
      });
    },
  },
};

export { encounterMutationTypeDefs, encounterMutationResolver };
