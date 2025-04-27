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

  const isManuallyRefreshing = useRef(false);

  const fetchData = useCallback(async () => {
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
      isManuallyRefreshing.current = false;
    }
  }, [query, variables, transform]);

  useEffect(() => {
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
    if (!enabled || isManuallyRefreshing.current) return;

    fetchData();
  }, [enabled, fetchData]);

  return { data, loading, error, refresh: fetchData };
}
