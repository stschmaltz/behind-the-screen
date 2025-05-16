import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { AdventureRepositoryInterface } from '../../../repositories/adventure/adventure.repository.interface';
import { Adventure } from '../../../types/adventures';
import { logger } from '../../../lib/logger';
import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';

const adventureMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    saveAdventure(input: NewAdventureInput!): Adventure
    deleteAdventure(input: DeleteAdventureInput!): Boolean
  }
`;

interface SaveAdventureArgs {
  input: {
    id?: string;
    campaignId: string;
    name: string;
    description?: string;
    status: 'active' | 'completed' | 'archived';
  };
}

interface DeleteAdventureArgs {
  input: { id: string };
}

const adventureRepository = appContainer.get<AdventureRepositoryInterface>(
  TYPES.AdventureRepository,
);

const adventureMutationResolver = {
  Mutation: {
    async saveAdventure(
      _: any,
      { input }: SaveAdventureArgs,
      context: GraphQLContext,
    ): Promise<Adventure | null> {
      logger.info('saveAdventure', input);
      isAuthorizedOrThrow(context);

      return adventureRepository.saveAdventure({
        ...input,
        userId: context.user._id,
        campaignId: input.campaignId,
      });
    },

    async deleteAdventure(
      _: any,
      { input: { id } }: DeleteAdventureArgs,
      context: GraphQLContext,
    ): Promise<boolean> {
      logger.info('deleteAdventure', id);
      isAuthorizedOrThrow(context);

      return adventureRepository.deleteAdventure({
        id,
        userId: context.user._id,
      });
    },
  },
};

export { adventureMutationTypeDefs, adventureMutationResolver };
