import {
  GraphQLContext,
  isAuthorizedOrThrow,
} from '../../../lib/graphql-context';

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

const races = [
  'Human',
  'Elf',
  'Dwarf',
  'Halfling',
  'Gnome',
  'Half-Elf',
  'Half-Orc',
  'Tiefling',
  'Dragonborn',
];

const genders = ['Male', 'Female', 'Non-binary'];

const namesByRaceAndGender: Record<
  string,
  Record<string, string[]>
> = {
  Human: {
    Male: [
      'Marcus',
      'Thomas',
      'William',
      'James',
      'Robert',
      'John',
      'David',
      'Richard',
    ],
    Female: [
      'Sarah',
      'Emma',
      'Elizabeth',
      'Catherine',
      'Margaret',
      'Mary',
      'Anna',
      'Grace',
    ],
    'Non-binary': [
      'Jordan',
      'Riley',
      'Taylor',
      'Morgan',
      'Alex',
      'Casey',
      'Drew',
      'Phoenix',
    ],
  },
  Elf: {
    Male: [
      'Elrond',
      'Legolas',
      'Thranduil',
      'Galadriel',
      'Faelar',
      'Erevan',
      'Quarion',
      'Soveliss',
    ],
    Female: [
      'Arwen',
      'Galadriel',
      'Lúthien',
      'Silaqui',
      'Thia',
      'Naivara',
      'Sariel',
      'Birel',
    ],
    'Non-binary': [
      'Aelar',
      'Valanthe',
      'Mirthal',
      'Ilphas',
      'Keyleth',
      'Theren',
      'Alea',
      'Eroan',
    ],
  },
  Dwarf: {
    Male: [
      'Thorin',
      'Gimli',
      'Balin',
      'Bruenor',
      'Durin',
      'Torgrim',
      'Harbek',
      'Darrak',
    ],
    Female: [
      'Kathra',
      'Amber',
      'Artin',
      'Audhild',
      'Bardryn',
      'Dagnal',
      'Diesa',
      'Eldeth',
    ],
    'Non-binary': [
      'Torben',
      'Eberk',
      'Oskar',
      'Rangrim',
      'Rurik',
      'Taklinn',
      'Vondal',
      'Morgran',
    ],
  },
};

const occupations = [
  'Merchant',
  'Guard',
  'Innkeeper',
  'Blacksmith',
  'Farmer',
  'Scholar',
  'Priest',
  'Baker',
  'Fisherman',
  'Tailor',
  'Carpenter',
  'Alchemist',
  'Herbalist',
  'Town Crier',
  'Stable Hand',
  'Cook',
  'Bard',
  'Apothecary',
  'Librarian',
  'Street Performer',
];

const ageRanges: Record<string, string[]> = {
  Human: ['Young (18-30)', 'Middle-aged (31-50)', 'Elder (51-80)'],
  Elf: ['Young (20-100)', 'Middle-aged (101-500)', 'Elder (501-750)'],
  Dwarf: ['Young (20-50)', 'Middle-aged (51-200)', 'Elder (201-350)'],
  Halfling: ['Young (20-35)', 'Middle-aged (36-70)', 'Elder (71-150)'],
};

const personalityTraits = [
  'friendly and outgoing',
  'gruff but kind-hearted',
  'suspicious and cautious',
  'cheerful and optimistic',
  'melancholic and introspective',
  'ambitious and driven',
  'laid-back and easygoing',
  'nervous and twitchy',
  'wise and patient',
  'hot-headed and impulsive',
  'sarcastic and witty',
  'earnest and sincere',
];

const appearanceTraits = [
  'tall and lanky with piercing eyes',
  'short and stout with a broad smile',
  'average height with a weathered face',
  'muscular build with numerous scars',
  'thin and frail with gentle features',
  'well-groomed with fine clothing',
  'unkempt with wild hair',
  'distinctive tattoos covering their arms',
  'a prominent scar across their face',
  'unusual eye color that stands out',
  'elegant bearing and refined posture',
  'rough hands showing years of hard work',
];

const quirks = [
  'constantly adjusts their clothing',
  'speaks in rhymes when excited',
  'collects unusual trinkets',
  'has a nervous laugh',
  'whistles old tunes absentmindedly',
  'always carries a good luck charm',
  'quotes ancient proverbs',
  'has a pet bird that sits on their shoulder',
  'speaks to themselves when thinking',
  'fidgets with their rings or jewelry',
  'always offers food to visitors',
  'tells elaborate stories about mundane events',
];

const motivations = [
  'seeking revenge for a past wrong',
  'protecting their family at all costs',
  'accumulating wealth and influence',
  'finding redemption for past mistakes',
  'uncovering ancient knowledge',
  'establishing a lasting legacy',
  'simply enjoying life to the fullest',
  'helping those less fortunate',
  'proving their worth to others',
  'escaping from a troubled past',
  'fulfilling a sacred duty',
  'pursuing a forbidden love',
];

const secrets = [
  'is actually nobility in hiding',
  'witnessed a murder but never reported it',
  'has a hidden magical talent',
  'is deeply in debt to a dangerous organization',
  'is writing an exposé about local corruption',
  'has a secret family in another town',
  'was once an adventurer who fled from danger',
  'knows the location of a hidden treasure',
  'is being blackmailed by someone powerful',
  'is planning to leave town suddenly',
  'has been stealing from their employer',
  'is secretly working for rival factions',
];

const backgrounds = [
  'grew up in poverty and worked hard to achieve their current position',
  'comes from a long line of craftspeople, carrying on family traditions',
  'fled from their homeland after a political upheaval',
  'was orphaned young and raised by the local community',
  'received excellent education but chose a different path than expected',
  'served in the military before settling into civilian life',
  'traveled extensively before deciding to settle down',
  'inherited their business from a deceased relative',
  'survived a plague that took most of their family',
  'was once involved in adventuring but retired after a close call',
  'made a fortune and lost it, now rebuilding their life',
  'was trained for a completely different profession but changed careers',
];

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateName(race: string, gender: string): string {
  const raceNames = namesByRaceAndGender[race] || namesByRaceAndGender.Human;
  const names = raceNames[gender] || raceNames.Male;
  return randomChoice(names);
}

function generateAge(race: string): string {
  const ageOptions = ageRanges[race] || ageRanges.Human;
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

      const selectedRace = race || randomChoice(races);
      const selectedGender = randomChoice(genders);
      const selectedOccupation = occupation || randomChoice(occupations);

      const npc = {
        name: generateName(selectedRace, selectedGender),
        race: selectedRace,
        gender: selectedGender,
        age: generateAge(selectedRace),
        occupation: selectedOccupation,
        personality: randomChoice(personalityTraits),
        appearance: randomChoice(appearanceTraits),
        quirk: randomChoice(quirks),
        motivation: randomChoice(motivations),
        secret: includeSecret ? randomChoice(secrets) : undefined,
        background: includeBackground ? randomChoice(backgrounds) : undefined,
      };

      return npc;
    },
  },
};

export { generateNpcMutationTypeDefs, generateNpcMutationResolver };

