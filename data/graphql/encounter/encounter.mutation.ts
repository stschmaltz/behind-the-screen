import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';
import { EncounterRepositoryInterface } from '../../../repositories/encounter/encounter.repository.interface';
import { Encounter } from '../../../types/encounters';

const encounterMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    saveEncounter(input: NewEncounterInput!): Encounter
    deleteEncounter(input: DeleteEncounterInput!): Boolean
  }
`;

interface SaveEncounterArgs {
  input: Encounter;
}
interface DeleteEncounterArgs {
  input: {
    id: string;
  };
}

const encounterRepository = appContainer.get<EncounterRepositoryInterface>(
  TYPES.EncounterRepository,
);

const encounterMutationResolver = {
  Mutation: {
    async saveEncounter(
      _: never,
      { input }: SaveEncounterArgs,
      context: GraphQLContext,
    ) {
      console.log('saveEncounter', input);
      isAuthorizedOrThrow(context);

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
        userId: context.user._id,
      });
    },
    async deleteEncounter(
      _: never,
      { input: { id } }: DeleteEncounterArgs,
      context: GraphQLContext,
    ) {
      console.log('deleteEncounter', id);
      isAuthorizedOrThrow(context);

      return encounterRepository.deleteEncounter({
        id,
        userId: context.user._id,
      });
    },
  },
};

export { encounterMutationTypeDefs, encounterMutationResolver };
