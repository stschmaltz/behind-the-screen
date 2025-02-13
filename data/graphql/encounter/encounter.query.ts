import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import {
  GraphQLContext,
  isAuthorized,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';
import { EncounterRepositoryInterface } from '../../../repositories/encounter/encounter.repository.interface';

const encounterQueryTypeDefs = /* GraphQL */ `
  extend type Query {
    encounterById(id: String!): Encounter
    allEncounters: [Encounter!]!
  }
`;

const encounterRepository = appContainer.get<EncounterRepositoryInterface>(
  TYPES.EncounterRepository,
);

const encounterQueryResolver = {
  Query: {
    async encounterById(
      _: never,
      { id }: { id: string },
      context: GraphQLContext,
    ) {
      isAuthorizedOrThrow(context);

      return encounterRepository.getEncounterById({
        id,
        userId: context.user._id,
      });
    },
    async allEncounters(_: never, __: never, context: GraphQLContext) {
      console.log('allEncounters');
      isAuthorizedOrThrow(context);

      return encounterRepository.getAllEncounters({
        userId: context.user._id,
      });
    },
  },
};

export { encounterQueryTypeDefs, encounterQueryResolver };
