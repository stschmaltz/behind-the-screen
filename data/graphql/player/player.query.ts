import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import {
  GraphQLContext,
  isAuthorized,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';
import { PlayerRepositoryInterface } from '../../../repositories/player/player.repository.interface';

const playerQueryTypeDefs = /* GraphQL */ `
  extend type Query {
    playersByIds(ids: [String!]!): [Player!]!
    allPlayers: [Player!]!
  }
`;

const playerRepository = appContainer.get<PlayerRepositoryInterface>(
  TYPES.PlayerRepository,
);

const playerQueryResolver = {
  Query: {
    async playersByIds(
      _: unknown,
      { ids }: { ids: string[] },
      context: GraphQLContext,
    ) {
      isAuthorizedOrThrow(context);
      return playerRepository.getPlayersByIds({
        ids,
        userId: context.user._id,
      });
    },
    async allPlayers(_: never, __: never, context: GraphQLContext) {
      isAuthorizedOrThrow(context);

      return playerRepository.getAllPlayers({
        userId: context.user._id,
      });
    },
  },
};

export { playerQueryTypeDefs, playerQueryResolver };
