import { useMemo } from 'react';
import { encounterByIdQuery } from '../../data/graphql/snippets/encounter';
import { Encounter } from '../../types/encounters';
import { useQuery } from '../use-async-query';

function getEncounter(id: string): {
  encounter: Encounter | null;
  loading: boolean;
} {
  // Memoize variables and transform to prevent unnecessary re-renders/fetches
  const variables = useMemo(() => ({ id }), [id]);
  const transform = useMemo(() => (data: any) => data.encounterById, []);

  const { data: encounter, loading } = useQuery<Encounter>({
    query: encounterByIdQuery,
    variables,
    transform,
    enabled: !!id, // Ensure fetching is enabled only when id is present
  });

  return { encounter, loading };
}

export { getEncounter };
