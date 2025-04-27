import { useMemo } from 'react';
import { encounterByIdQuery } from '../../data/graphql/snippets/encounter';
import { Encounter } from '../../types/encounters';
import { useQuery } from '../use-async-query';

function getEncounter(id: string): {
  encounter: Encounter | null;
  loading: boolean;
} {
  const variables = useMemo(() => ({ id }), [id]);
  const transform = useMemo(() => (data: any) => data.encounterById, []);

  const { data: encounter, loading } = useQuery<Encounter>({
    query: encounterByIdQuery,
    variables,
    transform,
    enabled: !!id,
  });

  return { encounter, loading };
}

export { getEncounter };
