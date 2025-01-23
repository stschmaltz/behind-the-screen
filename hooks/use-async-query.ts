// hooks/useQuery.ts
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!enabled) return;

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
  }, [query, enabled]);

  return { data, loading, error };
}
