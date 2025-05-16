import { useMemo } from 'react';
import { allPlayersQuery } from '../data/graphql/snippets/player';
import { Player } from '../types/player';
import { useQuery } from './use-async-query';

const transformPlayers = (data: { allPlayers: Player[] }): Player[] =>
  data.allPlayers;

const EMPTY_PLAYERS: Player[] = [];

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

  const players = useMemo(() => data ?? EMPTY_PLAYERS, [data]);

  return { players, loading: playersLoading, refresh };
}

export { getAllPlayers };
