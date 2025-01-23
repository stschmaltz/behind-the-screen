import { useEffect, useState } from 'react';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import {
  EncounterByIdResponse,
  encounterByIdQuery,
} from '../data/graphql/snippets/encounter';
import { Encounter } from '../types/encounters';
import { useQuery } from './use-async-query';

function getEncounter(id: string): {
  encounter: Encounter | null;
  loading: boolean;
} {
  const { data: encounter, loading } = useQuery<Encounter>({
    query: encounterByIdQuery,
    variables: { id },
    transform: (data) => data.encounterById,
  });

  return { encounter, loading };
}

export { getEncounter };
