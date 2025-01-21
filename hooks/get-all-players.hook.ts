import { allPlayersQuery } from "../data/graphql/snippets/player";
import { Player } from "../types/player";
import { useQuery } from "./use-async-query";

//TODO: add get players by id
function getAllPlayers(): {players: Player[], loading: boolean} {
    const { data , loading: playersLoading } = useQuery<Player[]>({
        query: allPlayersQuery,
        transform: (data) => data.allPlayers,
      });

      const players = data ?? [];

      return { players, loading: playersLoading };
}

export { getAllPlayers };