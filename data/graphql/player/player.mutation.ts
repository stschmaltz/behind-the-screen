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
  }
`;

interface SavePlayerArgs {
  input: {
    name: string;
    campaignId: string;
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
  },
};

export { playerMutationTypeDefs, playerMutationResolver };
