import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';
import {
  RACES,
  GENDERS,
  NAMES_BY_RACE_AND_GENDER,
  OCCUPATIONS,
  AGE_RANGES,
  PERSONALITY_TRAITS,
  APPEARANCE_TRAITS,
  QUIRKS,
  MOTIVATIONS,
  SECRETS,
  BACKGROUNDS,
} from '../../npc-data';

const generateNpcMutationTypeDefs = /* GraphQL */ `
  type Npc {
    name: String!
    race: String!
    gender: String!
    age: String!
    occupation: String!
    personality: String!
    appearance: String!
    quirk: String!
    motivation: String!
    secret: String
    background: String
  }

  extend type Mutation {
    generateNpc(
      race: String
      occupation: String
      context: String
      includeSecret: Boolean!
      includeBackground: Boolean!
    ): Npc!
  }
`;

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateName(race: string, gender: string): string {
  const raceNames =
    NAMES_BY_RACE_AND_GENDER[race] || NAMES_BY_RACE_AND_GENDER.Human;
  const names = raceNames[gender] || raceNames.Male;
  return randomChoice(names);
}

function generateAge(race: string): string {
  const ageOptions = AGE_RANGES[race] || AGE_RANGES.Human;
  return randomChoice(ageOptions);
}

const generateNpcMutationResolver = {
  Mutation: {
    async generateNpc(
      _: any,
      {
        race,
        occupation,
        context,
        includeSecret,
        includeBackground,
      }: {
        race?: string;
        occupation?: string;
        context?: string;
        includeSecret: boolean;
        includeBackground: boolean;
      },
      contextObj: GraphQLContext,
    ) {
      isAuthorizedOrThrow(contextObj);

      const selectedRace = race || randomChoice(RACES);
      const selectedGender = randomChoice(GENDERS);
      const selectedOccupation = occupation || randomChoice(OCCUPATIONS);

      const npc = {
        name: generateName(selectedRace, selectedGender),
        race: selectedRace,
        gender: selectedGender,
        age: generateAge(selectedRace),
        occupation: selectedOccupation,
        personality: randomChoice(PERSONALITY_TRAITS),
        appearance: randomChoice(APPEARANCE_TRAITS),
        quirk: randomChoice(QUIRKS),
        motivation: randomChoice(MOTIVATIONS),
        secret: includeSecret ? randomChoice(SECRETS) : undefined,
        background: includeBackground ? randomChoice(BACKGROUNDS) : undefined,
      };

      return npc;
    },
  },
};

export { generateNpcMutationTypeDefs, generateNpcMutationResolver };
