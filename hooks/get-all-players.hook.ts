import { useMemo } from 'react';
import { allPlayersQuery } from '../data/graphql/snippets/player';
import { Player } from '../types/player';
import { useQuery } from './use-async-query';

// Define the transform function outside the hook for stability
const transformPlayers = (data: { allPlayers: Player[] }): Player[] =>
  data.allPlayers;

const EMPTY_PLAYERS: Player[] = []; // Stable empty array reference

function getAllPlayers(): {
  players: Player[];
  loading: boolean;
  refresh: () => Promise<Player[] | null>;
} {
  const {
    data,
    loading: playersLoading,
    refresh,
  } = useQuery<Player[]>({
    query: allPlayersQuery,
    transform: transformPlayers,
  });

  // Memoize the players array reference
  const players = useMemo(() => data ?? EMPTY_PLAYERS, [data]);

  return { players, loading: playersLoading, refresh };
}

export { getAllPlayers };
