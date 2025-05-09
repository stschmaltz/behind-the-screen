import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const spellsFilePath = path.join(
      process.cwd(),
      'data',
      'spells',
      'spells.json',
    );
    const spellsFileContents = await fs.readFile(spellsFilePath, 'utf8');
    const spells = JSON.parse(spellsFileContents);
    res.status(200).json(spells);
  } catch (_error) {
    res.status(500).json({ message: 'Error loading spells data' });
  }
}
