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
import { dateScalarTypeDefs } from './scalars/date/date.typedef';
import { dateScalarResolver } from './scalars/date/date.resolver';

const baseSchema = /* GraphQL */ `
  type Query
  type Mutation
`;

const typeDefs = [
  baseSchema,
  dateScalarTypeDefs,
  userTypeDefs,
  userQueryTypeDefs,
  userMutationTypeDefs,
  encounterTypeDefs,
  encounterQueryTypeDefs,
  encounterMutationTypeDefs,
];

const resolvers = [
  dateScalarResolver,
  userQueryResolver,
  userMutationResolver,
  encounterQueryResolver,
  encounterMutationResolver,
];

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export { schema };
