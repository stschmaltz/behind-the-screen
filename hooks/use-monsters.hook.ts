import { useCallback, useEffect, useState } from 'react';
import { EncounterCharacter } from '../types/encounters';
import { generateMongoId } from '../lib/mongo';
import { logger } from '../lib/logger';

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

export const useMonsters = () => {
  const [monsters, setMonsters] = useState<MonsterData[]>([]);
  const [options, setOptions] = useState<MonsterOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonsters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/monsters');
      if (!response.ok) {
        throw new Error('Failed to fetch monsters');
      }
      const data: MonsterData[] = await response.json();

      const monsterOptions: MonsterOption[] = data.map((monster) => ({
        _id: monster._id,
        name: monster.name,
        original: monster,
      }));

      setMonsters(data);
      setOptions(monsterOptions);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      logger.error('Error fetching monsters:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonsters();
  }, [fetchMonsters]);

  return {
    monsters,
    options,
    isLoading,
    error,
    refetch: fetchMonsters,
  };
};
