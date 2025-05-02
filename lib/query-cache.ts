import { logger } from './logger';

// Cache implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const queryCache: Record<string, CacheEntry<unknown>> = {};
const CACHE_TTL = 10000; // Cache for 10 seconds

// Generate a cache key from query and variables
export function getCacheKey(query: string, variables?: object): string {
  return `${query}:${variables ? JSON.stringify(variables) : ''}`;
}

// Check if a cached result exists and is valid
export function getCachedResult<T>(key: string): T | null {
  const entry = queryCache[key];
  if (!entry) return null;

  const now = Date.now();
  if (now > entry.expiresAt) {
    // Cache expired
    logger.info(`Cache expired for key: ${key.substring(0, 50)}...`);
    delete queryCache[key];

    return null;
  }

  logger.info(`Cache HIT for key: ${key.substring(0, 50)}...`);

  return entry.data as T;
}

// Set a result in the cache
export function setCachedResult<T>(key: string, data: T): void {
  const now = Date.now();
  queryCache[key] = {
    data,
    timestamp: now,
    expiresAt: now + CACHE_TTL,
  };
  logger.info(`Cached result for key: ${key.substring(0, 50)}...`);
}

// Clear the entire cache
export function clearCache(): void {
  Object.keys(queryCache).forEach((key) => {
    delete queryCache[key];
  });
  logger.info('Query cache cleared');
}

// Clear a specific cache entry
export function clearCacheEntry(key: string): void {
  if (queryCache[key]) {
    delete queryCache[key];
    logger.info(`Cache entry cleared for key: ${key.substring(0, 50)}...`);
  }
}
