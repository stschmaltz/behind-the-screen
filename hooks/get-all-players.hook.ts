import { useMemo } from 'react';
import { allPlayersQuery } from '../data/graphql/snippets/player';
import type { AllPlayersQuery } from '../generated/graphql';
import { useQuery } from './use-async-query';

const EMPTY_PLAYERS: AllPlayersQuery['allPlayers'] = [];

function getAllPlayers(): {
  players: AllPlayersQuery['allPlayers'];
  loading: boolean;
  refresh: () => Promise<AllPlayersQuery | null>;
} {
  const {
    data,
    loading: playersLoading,
    refresh,
  } = useQuery<AllPlayersQuery>({
    query: allPlayersQuery,
  });

  const players = useMemo(() => data?.allPlayers ?? EMPTY_PLAYERS, [data]);

  return { players, loading: playersLoading, refresh };
}

export { getAllPlayers };
