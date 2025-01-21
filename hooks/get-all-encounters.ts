import { allEncountersQuery, AllEncountersResponse } from "../data/graphql/snippets/encounter";
import { Encounter } from "../types/encounters";
import { useQuery } from "./use-async-query";

function getAllEncounters(): { encounters: Encounter[]; loading: boolean } {
    const { data, loading } = useQuery<
    Encounter[]
  >({
    query: allEncountersQuery,
    transform: (data: AllEncountersResponse) =>
      data.allEncounters
        .map((encounter) => ({
          ...encounter,
          createdAt: new Date(encounter.createdAt),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  });
  
  const encounters = data ?? [];

  return{ encounters, loading};
}

export { getAllEncounters };