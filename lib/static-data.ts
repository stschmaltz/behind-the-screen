import type { NextApiResponse } from 'next';
import { promises as fs } from 'fs';

const cache = new Map<string, Promise<unknown>>();

export const readJsonFileCached = <T>(filePath: string): Promise<T> => {
  let pending = cache.get(filePath);
  if (!pending) {
    pending = fs.readFile(filePath, 'utf8').then((raw) => JSON.parse(raw));
    pending.catch(() => cache.delete(filePath));
    cache.set(filePath, pending);
  }

  return pending as Promise<T>;
};

export const setStaticDataCacheHeaders = (res: NextApiResponse): void => {
  res.setHeader(
    'Cache-Control',
    'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
  );
};
