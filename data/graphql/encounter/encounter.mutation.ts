import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';
import { EncounterRepositoryInterface } from '../../../repositories/encounter/encounter.repository.interface';
import { Encounter } from '../../../types/encounters';
import { logger } from '../../../lib/logger';

const encounterMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    saveEncounter(input: NewEncounterInput!): Encounter
    deleteEncounter(input: DeleteEncounterInput!): Boolean
    updateEncounterDescription(
      input: UpdateEncounterDescriptionInput!
    ): Encounter # Assuming it returns the updated Encounter
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

interface UpdateEncounterDescriptionArgs {
  input: {
    _id: string;
    description: string;
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
      logger.info('saveEncounter', input);
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
        campaignId: input.campaignId,
        adventureId: input.adventureId,
      });
    },
    async deleteEncounter(
      _: never,
      { input: { id } }: DeleteEncounterArgs,
      context: GraphQLContext,
    ) {
      logger.info('deleteEncounter', id);
      isAuthorizedOrThrow(context);

      return encounterRepository.deleteEncounter({
        id,
        userId: context.user._id,
      });
    },
    async updateEncounterDescription(
      _: never,
      { input }: UpdateEncounterDescriptionArgs,
      context: GraphQLContext,
    ): Promise<Encounter | null> {
      logger.info('updateEncounterDescription mutation resolver', input);
      isAuthorizedOrThrow(context);

      const updatedEncounter =
        await encounterRepository.updateEncounterDescription({
          _id: input._id,
          description: input.description,
          userId: context.user._id,
        });

      return updatedEncounter;
    },
  },
};

export { encounterMutationTypeDefs, encounterMutationResolver };
