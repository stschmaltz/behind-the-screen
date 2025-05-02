import { EncounterCharacter } from '../../../types/encounters';
import { generateMongoId } from '../../../lib/mongo';
import { logger } from '../../../lib/logger';

export interface MonsterOption {
  _id: string;
  name: string;
  [key: string]: unknown;
}

export interface MonsterData {
  _id: string;
  name: string;
  'Hit Points': string;
  'Armor Class': string;
  meta: string;
  Speed: string;
  Challenge: string;
  Traits: string;
  Actions: string;
  'Legendary Actions'?: string;
  img_url?: string;
  STR: string;
  DEX: string;
  CON: string;
  INT: string;
  WIS: string;
  CHA: string;
}

export const fetchMonsters = async (): Promise<{
  monsters: MonsterData[];
  options: MonsterOption[];
  error: string | null;
}> => {
  try {
    const response = await fetch('/api/monsters');
    if (!response.ok) {
      throw new Error('Failed to fetch monsters');
    }
    const data: MonsterData[] = await response.json();

    const options: MonsterOption[] = data.map((monster) => ({
      _id: monster._id,
      name: monster.name,
      original: monster,
    }));

    return { monsters: data, options, error: null };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'An unknown error occurred';
    logger.error('Error fetching monsters:', err);

    return { monsters: [], options: [], error: errorMessage };
  }
};

export const parseStat = (statString: string): number => {
  const match = statString.match(/^\d+/);

  return match ? parseInt(match[0], 10) : 0;
};

export const parseAbilityScore = (abilityString: string): number => {
  return parseInt(abilityString, 10) || 0;
};

export const createEmptyEnemy = (): EncounterCharacter => {
  return {
    name: '',
    maxHP: 0,
    armorClass: 0,
    _id: generateMongoId(),
  };
};

export const applyMonsterDataToEnemy = (
  enemy: EncounterCharacter,
  monster: MonsterData,
): EncounterCharacter => {
  return {
    ...enemy,
    name: monster.name,
    maxHP: parseStat(monster['Hit Points']),
    armorClass: parseStat(monster['Armor Class']),
    meta: monster.meta,
    speed: monster.Speed,
    stats: {
      STR: parseAbilityScore(monster.STR),
      DEX: parseAbilityScore(monster.DEX),
      CON: parseAbilityScore(monster.CON),
      INT: parseAbilityScore(monster.INT),
      WIS: parseAbilityScore(monster.WIS),
      CHA: parseAbilityScore(monster.CHA),
    },
    challenge: monster.Challenge,
    traits: monster.Traits,
    actions: monster.Actions,
    legendaryActions: monster['Legendary Actions'],
    img_url: monster.img_url,
    monsterSource: monster.name,
  };
};

export const createEmptyEnemyState = (
  enemy: EncounterCharacter,
): EncounterCharacter => {
  return {
    ...enemy,
    name: '',
    maxHP: 0,
    armorClass: 0,
    meta: undefined,
    speed: undefined,
    stats: undefined,
    challenge: undefined,
    traits: undefined,
    actions: undefined,
    legendaryActions: undefined,
    img_url: undefined,
    monsterSource: undefined,
  };
};
