import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';
import { PlayerRepositoryInterface } from '../../../repositories/player/player.repository.interface';
import { logger } from '../../../lib/logger';
import {
  NewPlayerInput,
  UpdatePlayerInput,
  UpdatePlayersInput,
} from '../../../src/generated/graphql';

const playerMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    createPlayer(input: NewPlayerInput!): Player
    updatePlayer(input: UpdatePlayerInput!): Player
    deletePlayer(id: String!): Boolean
    updatePlayers(input: UpdatePlayersInput!): Boolean
  }

  input UpdatePlayerInput {
    _id: String!
    name: String
    campaignId: String
    armorClass: Int
    maxHP: Int
    level: Int
  }
`;

const playerRepository = appContainer.get<PlayerRepositoryInterface>(
  TYPES.PlayerRepository,
);

const playerMutationResolver = {
  Mutation: {
    async createPlayer(
      _: unknown,
      { input }: { input: NewPlayerInput },
      context: GraphQLContext,
    ) {
      logger.info('createPlayer', input);
      isAuthorizedOrThrow(context);
      return playerRepository.createPlayer(
        {
          name: input.name,
          campaignId: input.campaignId,
          armorClass: input.armorClass,
          maxHP: input.maxHP,
          level: input.level || 1,
        },
        context.user._id,
      );
    },

    async updatePlayer(
      _: unknown,
      { input }: { input: UpdatePlayerInput },
      context: GraphQLContext,
    ) {
      logger.info('updatePlayer', input);
      isAuthorizedOrThrow(context);
      return playerRepository.updatePlayer({
        _id: input._id,
        userId: context.user._id,
        name: input.name,
        campaignId: input.campaignId,
        armorClass: input.armorClass,
        maxHP: input.maxHP,
        level: input.level,
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
      { input }: { input: UpdatePlayersInput },
      context: GraphQLContext,
    ) {
      logger.info('updatePlayers', input);
      isAuthorizedOrThrow(context);

      return playerRepository.bulkUpdatePlayers({
        userId: context.user._id,
        campaignId: input.campaignId,
        armorClass: input.armorClass ?? undefined,
        maxHP: input.maxHP ?? undefined,
        level: input.level ?? undefined,
        levelUp: input.levelUp ?? undefined,
      });
    },
  },
};

export { playerMutationTypeDefs, playerMutationResolver };
