import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
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
    async playersByIds(_: unknown, { ids }: { ids: string[] }) {
      return playerRepository.getPlayersByIds(ids);
    },
    async allPlayers() {
      return playerRepository.getAllPlayers();
    },
  },
};

export { playerQueryTypeDefs, playerQueryResolver };
