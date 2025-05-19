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
import {
  playerMutationResolver,
  playerMutationTypeDefs,
} from './player/player.mutation';
import {
  playerQueryResolver,
  playerQueryTypeDefs,
} from './player/player.query';
import { playerTypeDefs } from './player/player.typedefs';
import { campaignTypeDefs } from './campaign/campaign.typedefs';
import {
  campaignQueryTypeDefs,
  campaignQueryResolver,
} from './campaign/campaign.query';
import {
  campaignMutationTypeDefs,
  campaignMutationResolver,
} from './campaign/campaign.mutation';
import { adventureTypeDefs } from './adventure/adventure.typedefs';
import {
  adventureQueryTypeDefs,
  adventureQueryResolver,
} from './adventure/adventure.query';
import {
  adventureMutationTypeDefs,
  adventureMutationResolver,
} from './adventure/adventure.mutation';
import { userPreferencesTypeDefs } from './user-preferences/user-preferences.typedefs';
import {
  userPreferencesQueryTypeDefs,
  userPreferencesQueryResolver,
} from './user-preferences/user-preferences.query';
import {
  userPreferencesMutationTypeDefs,
  userPreferencesMutationResolver,
} from './user-preferences/user-preferences.mutation';
import {
  generateLootMutationTypeDefs,
  generateLootMutationResolver,
} from './generation/generate-loot.mutation';

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
  playerMutationTypeDefs,
  playerTypeDefs,
  playerQueryTypeDefs,
  campaignTypeDefs,
  campaignQueryTypeDefs,
  campaignMutationTypeDefs,
  adventureTypeDefs,
  adventureQueryTypeDefs,
  adventureMutationTypeDefs,
  userPreferencesTypeDefs,
  userPreferencesQueryTypeDefs,
  userPreferencesMutationTypeDefs,
  generateLootMutationTypeDefs,
];

const resolvers = [
  dateScalarResolver,
  userQueryResolver,
  userMutationResolver,
  encounterQueryResolver,
  encounterMutationResolver,
  playerMutationResolver,
  playerQueryResolver,
  campaignQueryResolver,
  campaignMutationResolver,
  adventureQueryResolver,
  adventureMutationResolver,
  userPreferencesQueryResolver,
  userPreferencesMutationResolver,
  generateLootMutationResolver,
];

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export { schema };
