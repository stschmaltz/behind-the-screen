import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { PlayerRepositoryInterface } from '../../../repositories/player/player.repository.interface';

const playerMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    savePlayer(input: NewPlayerInput!): Player
    deletePlayer(id: String!): Boolean
  }
`;

interface SavePlayerArgs {
  input: {
    name: string;
  };
}

const playerRepository = appContainer.get<PlayerRepositoryInterface>(
  TYPES.PlayerRepository,
);

const playerMutationResolver = {
  Mutation: {
    async savePlayer(_: unknown, { input }: SavePlayerArgs) {
      console.log('savePlayer', input);
      return playerRepository.savePlayer({
        name: input.name,
      });
    },

    async deletePlayer(_: unknown, { id }: { id: string }) {
      console.log('deletePlayer', id);
      return playerRepository.deletePlayer(id);
    },
  },
};

export { playerMutationTypeDefs, playerMutationResolver };
