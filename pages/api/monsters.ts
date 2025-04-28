import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import { logger } from '../../lib/logger';

interface MonsterData {
  _id: string;
  name: string;
  [key: string]: unknown;
}

function createDeterministicId(name: string): string {
  const hash = crypto.createHash('md5').update(name).digest('hex');

  return hash.substring(0, 24);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data', 'monsters');

    const srdFilePath = path.join(jsonDirectory, 'srd_5e_monsters.json');
    const srdFileContents = await fs.readFile(srdFilePath, 'utf8');
    const srdMonsters = JSON.parse(srdFileContents);

    const gosFilePath = path.join(jsonDirectory, 'gos_5e_monsters.json');
    const gosFileContents = await fs.readFile(gosFilePath, 'utf8');
    const gosMonsters = JSON.parse(gosFileContents);

    const updatedGosMonsters = gosMonsters.map((monster: MonsterData) => ({
      ...monster,
      _id: createDeterministicId(monster.name),
    }));

    const monsterMap = new Map();

    srdMonsters.forEach((monster: MonsterData) => {
      monsterMap.set(monster.name.toLowerCase(), monster);
    });

    updatedGosMonsters.forEach((monster: MonsterData) => {
      monsterMap.set(monster.name.toLowerCase(), monster);
    });

    const mergedMonsters = Array.from(monsterMap.values());

    mergedMonsters.sort((a: MonsterData, b: MonsterData) =>
      a.name.localeCompare(b.name),
    );

    res.status(200).json(mergedMonsters);
  } catch (error) {
    logger.error('Error reading monster data:', error);
    res.status(500).json({ message: 'Error loading monster data' });
  }
}
