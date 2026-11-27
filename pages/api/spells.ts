import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import {
  readJsonFileCached,
  setStaticDataCacheHeaders,
} from '../../lib/static-data';

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
    const spells = await readJsonFileCached<unknown[]>(spellsFilePath);
    setStaticDataCacheHeaders(res);
    res.status(200).json(spells);
  } catch (_error) {
    res.status(500).json({ message: 'Error loading spells data' });
  }
}
