// hooks/useQuery.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { asyncFetch } from '../data/graphql/graphql-fetcher';

interface QueryConfig<T> {
  query: string;
  transform?: (data: any) => T;
  enabled?: boolean;
  variables?: object;
}

export function useQuery<T>({
  query,
  transform,
  enabled = true,
  variables,
}: QueryConfig<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Use a ref to track if we're currently in a manual refresh
  const isManuallyRefreshing = useRef(false);

  const fetchData = useCallback(async () => {
    // Mark that we're manually refreshing
    isManuallyRefreshing.current = true;
    setLoading(true);
    try {
      const response = await asyncFetch<T>(query, variables);
      const transformedData = transform ? transform(response) : response;
      setData(transformedData);
      setError(null);
      return transformedData;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
      // Reset the manual refresh flag after completion
      isManuallyRefreshing.current = false;
    }
  }, [query, variables, transform]);

  useEffect(() => {
    // Skip the automatic fetch if we're currently doing a manual refresh
    if (!enabled || isManuallyRefreshing.current) return;

    let isMounted = true;
    setLoading(true);

    (async () => {
      try {
        const response = await asyncFetch<T>(query, variables);
        if (!isMounted) return;

        const transformedData = transform ? transform(response) : response;
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
  }, [query, enabled, variables, transform]);

  useEffect(() => {
    // Skip the automatic fetch if we're currently doing a manual refresh
    if (!enabled || isManuallyRefreshing.current) return;

    fetchData();
  }, [enabled, fetchData]); // Depend on enabled and the stable fetchData callback

  return { data, loading, error, refresh: fetchData };
}
