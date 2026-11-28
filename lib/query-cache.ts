import { logger } from './logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const queryCache: Record<string, CacheEntry<unknown>> = {};
const CACHE_TTL = 10000; // Cache for 10 seconds
const inFlightQueries = new Map<string, Promise<unknown>>();
let cacheGeneration = 0;

export function getCacheKey(query: string, variables?: object): string {
  return `${query}:${variables ? JSON.stringify(variables) : ''}`;
}

export function getCachedResult<T>(key: string): T | null {
  const entry = queryCache[key];
  if (!entry) return null;

  const now = Date.now();
  if (now > entry.expiresAt) {
    logger.info(`Cache expired for key: ${key.substring(0, 50)}...`);
    delete queryCache[key];

    return null;
  }

  logger.info(`Cache HIT for key: ${key.substring(0, 50)}...`);

  return entry.data as T;
}

export function setCachedResult<T>(key: string, data: T): void {
  const now = Date.now();
  queryCache[key] = {
    data,
    timestamp: now,
    expiresAt: now + CACHE_TTL,
  };
  logger.info(`Cached result for key: ${key.substring(0, 50)}...`);
}

export function clearCache(): void {
  Object.keys(queryCache).forEach((key) => {
    delete queryCache[key];
  });
  cacheGeneration += 1;
  inFlightQueries.clear();
  logger.info('Query cache cleared');
}

interface SharedQueryOptions {
  useCache?: boolean;
  forceRefresh?: boolean;
}

export function loadSharedQuery<T>(
  key: string,
  load: () => Promise<T>,
  { useCache = true, forceRefresh = false }: SharedQueryOptions = {},
): Promise<T> {
  if (!useCache) return load();

  if (!forceRefresh) {
    const cached = getCachedResult<T>(key);
    if (cached) return Promise.resolve(cached);

    const pending = inFlightQueries.get(key);
    if (pending) return pending as Promise<T>;
  }

  const startedInGeneration = cacheGeneration;
  const request: Promise<T> = load()
    .then((data) => {
      if (startedInGeneration === cacheGeneration) setCachedResult(key, data);

      return data;
    })
    .finally(() => {
      if (inFlightQueries.get(key) === request) inFlightQueries.delete(key);
    });
  inFlightQueries.set(key, request);

  return request;
}

export function clearCacheEntry(key: string): void {
  if (queryCache[key]) {
    delete queryCache[key];
    logger.info(`Cache entry cleared for key: ${key.substring(0, 50)}...`);
  }
}
