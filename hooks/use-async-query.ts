import { useState, useEffect, useCallback, useRef } from 'react';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import { logger } from '../lib/logger';
import {
  getCacheKey,
  getCachedResult,
  loadSharedQuery,
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
  const cacheKey = getCacheKey(query, variables);
  const [data, setData] = useState<T | null>(() =>
    enabled && !skipCache ? getCachedResult<T>(cacheKey) : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isManuallyRefreshing = useRef(false);

  const load = useCallback(
    (forceRefresh: boolean) =>
      loadSharedQuery<T>(
        cacheKey,
        async () => {
          logger.info(`API CALL for query: ${query.substring(0, 50)}...`);
          const response = await asyncFetch<T>(query, variables);

          return transform ? transform(response) : response;
        },
        { useCache: !skipCache, forceRefresh },
      ),
    [query, variables, transform, skipCache, cacheKey],
  );

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      isManuallyRefreshing.current = true;
      setLoading(true);

      try {
        const result = await load(forceRefresh);
        setData(result);
        setError(null);

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
        isManuallyRefreshing.current = false;
      }
    },
    [load],
  );

  useEffect(() => {
    if (!enabled || isManuallyRefreshing.current) return;

    let isMounted = true;
    setLoading(true);

    load(false)
      .then((result) => {
        if (!isMounted) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error('An error occurred'));
        console.error(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [enabled, load]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, refresh };
}
