import { useState, useEffect, useCallback, useRef } from 'react';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import { logger } from '../lib/logger';
import {
  getCacheKey,
  getCachedResult,
  setCachedResult,
} from '../lib/query-cache';

interface QueryConfig<T> {
  query: string;
  transform?: (data: any) => T;
  enabled?: boolean;
  variables?: object;
  skipCache?: boolean; // Option to bypass cache
}

export function useQuery<T>({
  query,
  transform,
  enabled = true,
  variables,
  skipCache = false,
}: QueryConfig<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isManuallyRefreshing = useRef(false);
  const cacheKey = getCacheKey(query, variables);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      isManuallyRefreshing.current = true;
      setLoading(true);

      try {
        // Check cache first unless forced refresh or skipCache
        if (!forceRefresh && !skipCache) {
          const cachedData = getCachedResult<T>(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setError(null);
            setLoading(false);
            isManuallyRefreshing.current = false;
            return cachedData;
          }
        }

        // Fetch fresh data
        logger.info(`API CALL for query: ${query.substring(0, 50)}...`);
        const response = await asyncFetch<T>(query, variables);
        const transformedData = transform ? transform(response) : response;

        // Update cache
        if (!skipCache) {
          setCachedResult(cacheKey, transformedData);
        }

        setData(transformedData);
        setError(null);
        return transformedData;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
        isManuallyRefreshing.current = false;
      }
    },
    [query, variables, transform, skipCache, cacheKey],
  );

  useEffect(() => {
    if (!enabled || isManuallyRefreshing.current) return;

    let isMounted = true;
    setLoading(true);

    // Check cache first
    if (!skipCache) {
      const cachedData = getCachedResult<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setError(null);
        setLoading(false);
        return;
      }
    }

    (async () => {
      try {
        logger.info(
          `API CALL (effect) for query: ${query.substring(0, 50)}...`,
        );
        const response = await asyncFetch<T>(query, variables);
        if (!isMounted) return;

        const transformedData = transform ? transform(response) : response;

        // Update cache
        if (!skipCache) {
          setCachedResult(cacheKey, transformedData);
        }

        setData(transformedData);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error('An error occurred'));
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [query, enabled, variables, transform, skipCache, cacheKey]);

  // Manual refresh function that bypasses cache
  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, refresh };
}
