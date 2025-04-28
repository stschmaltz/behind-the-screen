import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';
import { PlayerRepositoryInterface } from '../../../repositories/player/player.repository.interface';
import { logger } from '../../../lib/logger';

const playerMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    savePlayer(input: NewPlayerInput!): Player
    deletePlayer(id: String!): Boolean
    updatePlayers(input: UpdatePlayersInput!): Boolean
  }
`;

interface SavePlayerArgs {
  input: {
    name: string;
    campaignId: string;
    armorClass?: number;
    maxHP?: number;
    level?: number;
  };
}

interface UpdatePlayersArgs {
  input: {
    campaignId: string;
    armorClass?: number;
    maxHP?: number;
    level?: number;
    levelUp?: boolean;
  };
}

const playerRepository = appContainer.get<PlayerRepositoryInterface>(
  TYPES.PlayerRepository,
);

const playerMutationResolver = {
  Mutation: {
    async savePlayer(
      _: unknown,
      { input }: SavePlayerArgs,
      context: GraphQLContext,
    ) {
      logger.info('savePlayer', input);
      isAuthorizedOrThrow(context);
      return playerRepository.savePlayer({
        name: input.name,
        userId: context.user._id,
        campaignId: input.campaignId,
        armorClass: input.armorClass,
        maxHP: input.maxHP,
        level: input.level || 1, // Default to level 1
      });
    },

    async deletePlayer(
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ) {
      logger.info('deletePlayer', id);
      isAuthorizedOrThrow(context);

      return playerRepository.deletePlayer({
        id,
        userId: context.user._id,
      });
    },

    async updatePlayers(
      _: unknown,
      { input }: UpdatePlayersArgs,
      context: GraphQLContext,
    ) {
      logger.info('updatePlayers', input);
      isAuthorizedOrThrow(context);

      return playerRepository.bulkUpdatePlayers({
        userId: context.user._id,
        campaignId: input.campaignId,
        armorClass: input.armorClass,
        maxHP: input.maxHP,
        level: input.level,
        levelUp: input.levelUp,
      });
    },
  },
};

export { playerMutationTypeDefs, playerMutationResolver };
