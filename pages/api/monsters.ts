import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import path from 'path';
import { logger } from '../../lib/logger';
import {
  readJsonFileCached,
  setStaticDataCacheHeaders,
} from '../../lib/static-data';

interface MonsterData {
  _id: string;
  name: string;
  [key: string]: unknown;
}

function createDeterministicId(name: string): string {
  const hash = crypto.createHash('md5').update(name).digest('hex');

  return hash.substring(0, 24);
}

let mergedMonstersPromise: Promise<MonsterData[]> | null = null;

const loadMergedMonsters = async (): Promise<MonsterData[]> => {
  const jsonDirectory = path.join(process.cwd(), 'data', 'monsters');
  const [srdMonsters, gosMonsters] = await Promise.all([
    readJsonFileCached<MonsterData[]>(
      path.join(jsonDirectory, 'srd_5e_monsters.json'),
    ),
    readJsonFileCached<MonsterData[]>(
      path.join(jsonDirectory, 'gos_5e_monsters.json'),
    ),
  ]);

  const monsterMap = new Map<string, MonsterData>();

  srdMonsters.forEach((monster) => {
    monsterMap.set(monster.name.toLowerCase(), monster);
  });

  gosMonsters.forEach((monster) => {
    monsterMap.set(monster.name.toLowerCase(), {
      ...monster,
      _id: createDeterministicId(monster.name),
    });
  });

  return Array.from(monsterMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
};

const getMergedMonsters = (): Promise<MonsterData[]> => {
  if (!mergedMonstersPromise) {
    mergedMonstersPromise = loadMergedMonsters();
    mergedMonstersPromise.catch(() => {
      mergedMonstersPromise = null;
    });
  }

  return mergedMonstersPromise;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const mergedMonsters = await getMergedMonsters();
    setStaticDataCacheHeaders(res);
    res.status(200).json(mergedMonsters);
  } catch (error) {
    logger.error('Error reading monster data:', error);
    res.status(500).json({ message: 'Error loading monster data' });
  }
}
