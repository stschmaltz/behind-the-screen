import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import { logger } from '../../lib/logger';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data', 'monsters');
    const filePath = path.join(jsonDirectory, 'srd_5e_monsters.json');

    const fileContents = await fs.readFile(filePath, 'utf8');

    const monsters = JSON.parse(fileContents);

    res.status(200).json(monsters);
  } catch (error) {
    logger.error('Error reading monster data:', error);
    res.status(500).json({ message: 'Error loading monster data' });
  }
}
