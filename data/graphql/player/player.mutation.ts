import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { GraphQLContext,  isAuthorizedOrThrow } from '../../../lib/graphql-context';
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
    async savePlayer(_: unknown, { input }: SavePlayerArgs, context:GraphQLContext) {
      console.log('savePlayer', input);
      isAuthorizedOrThrow(context)
      return playerRepository.savePlayer({
        name: input.name,
        userId: context.user._id,
      });
    },

    async deletePlayer(_: unknown, { id }: { id: string }, context: GraphQLContext) {
      console.log('deletePlayer', id);
      isAuthorizedOrThrow(context)

      return playerRepository.deletePlayer({
        id,
        userId: context.user._id,
      });
    },
  },
};

export { playerMutationTypeDefs, playerMutationResolver };
