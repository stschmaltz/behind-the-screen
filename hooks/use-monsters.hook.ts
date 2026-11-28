import { useCallback, useEffect, useRef, useState } from 'react';
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

interface MonsterCatalog {
  monsters: MonsterData[];
  options: MonsterOption[];
}

let monsterCatalogPromise: Promise<MonsterCatalog> | null = null;

export const loadMonsterCatalog = (
  forceRefresh = false,
): Promise<MonsterCatalog> => {
  if (!monsterCatalogPromise || forceRefresh) {
    const pending = fetch('/api/monsters')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch monsters');
        }

        return response.json() as Promise<MonsterData[]>;
      })
      .then((data) => ({
        monsters: data,
        options: data.map((monster) => ({
          _id: monster._id,
          name: monster.name,
          original: monster,
        })),
      }));
    pending.catch(() => {
      if (monsterCatalogPromise === pending) monsterCatalogPromise = null;
    });
    monsterCatalogPromise = pending;
  }

  return monsterCatalogPromise;
};

export const useMonsters = () => {
  const [monsters, setMonsters] = useState<MonsterData[]>([]);
  const [options, setOptions] = useState<MonsterOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchMonsters = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const catalog = await loadMonsterCatalog(forceRefresh);
      if (!isMounted.current) return;
      setMonsters(catalog.monsters);
      setOptions(catalog.options);
    } catch (err: unknown) {
      if (!isMounted.current) return;
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      logger.error('Error fetching monsters:', err);
      setError(errorMessage);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => fetchMonsters(true), [fetchMonsters]);

  useEffect(() => {
    fetchMonsters();
  }, [fetchMonsters]);

  return {
    monsters,
    options,
    isLoading,
    error,
    refetch,
  };
};
