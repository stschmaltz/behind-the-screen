import {
  AGE_RANGES,
  APPEARANCE_TRAITS,
  BACKGROUNDS,
  GENDERS,
  MOTIVATIONS,
  NAMES_BY_RACE_AND_GENDER,
  OCCUPATIONS,
  PERSONALITY_TRAITS,
  QUIRKS,
  RACES,
  SECRETS,
} from '../data/npc-data';
import { NpcType } from '../components/npc';

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateFreeNpc(
  raceFilter?: string,
  occupationFilter?: string,
  includeSecret: boolean = false,
  includeBackground: boolean = false,
): NpcType {
  const race =
    raceFilter && RACES.includes(raceFilter)
      ? raceFilter
      : getRandomElement(RACES);

  const gender = getRandomElement(GENDERS);

  const namesList = NAMES_BY_RACE_AND_GENDER[race]?.[gender] ||
    NAMES_BY_RACE_AND_GENDER['Human']?.['Male'] || ['Unknown'];
  const name = getRandomElement(namesList);

  const occupation =
    occupationFilter && OCCUPATIONS.includes(occupationFilter)
      ? occupationFilter
      : getRandomElement(OCCUPATIONS);

  const ageRanges = AGE_RANGES[race] || AGE_RANGES['Human'];
  const age = getRandomElement(ageRanges);

  const personality = getRandomElement(PERSONALITY_TRAITS);
  const appearance = getRandomElement(APPEARANCE_TRAITS);
  const quirk = getRandomElement(QUIRKS);
  const motivation = getRandomElement(MOTIVATIONS);

  const npc: NpcType = {
    name,
    race,
    gender,
    age,
    occupation,
    personality,
    appearance,
    quirk,
    motivation,
  };

  if (includeSecret) {
    npc.secret = getRandomElement(SECRETS);
  }

  if (includeBackground) {
    npc.background = getRandomElement(BACKGROUNDS);
  }

  return npc;
}
