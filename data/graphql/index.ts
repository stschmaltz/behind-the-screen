import { makeExecutableSchema } from '@graphql-tools/schema';
import { userTypeDefs } from './user/user.typedefs';
import { userQueryTypeDefs, userQueryResolver } from './user/user.query';
import {
  userMutationTypeDefs,
  userMutationResolver,
} from './user/user.mutation';
import { encounterTypeDefs } from './encounter/encounter.typedefs';
import {
  encounterMutationTypeDefs,
  encounterMutationResolver,
} from './encounter/encounter.mutation';
import {
  encounterQueryResolver,
  encounterQueryTypeDefs,
} from './encounter/encounter.query';

const baseSchema = /* GraphQL */ `
  type Query
  type Mutation
`;

const typeDefs = [
  baseSchema,
  userTypeDefs,
  userQueryTypeDefs,
  userMutationTypeDefs,
  encounterTypeDefs,
  encounterMutationTypeDefs,
  encounterQueryTypeDefs,
];

const resolvers = [
  userQueryResolver,
  userMutationResolver,
  encounterMutationResolver,
  encounterQueryResolver,
];

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export { schema };
