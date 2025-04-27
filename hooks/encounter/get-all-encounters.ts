import {
  allEncountersQuery,
  AllEncountersResponse,
} from '../../data/graphql/snippets/encounter';
import { Encounter } from '../../types/encounters';
import { useQuery } from '../use-async-query';

interface GetAllEncountersOptions {
  campaignId?: string;
  adventureId?: string;
}

const transformEncounters = (data: AllEncountersResponse): Encounter[] =>
  data.allEncounters
    .map((encounter) => ({
      ...encounter,
      createdAt: new Date(encounter.createdAt),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

function getAllEncounters(options?: GetAllEncountersOptions): {
  encounters: Encounter[];
  loading: boolean;
  refresh: () => Promise<Encounter[] | null>;
} {
  const { data, loading, refresh } = useQuery<Encounter[]>({
    query: allEncountersQuery,
    transform: transformEncounters,
  });

  const encounters = data ?? [];

  const normalizedCampaignId = options?.campaignId?.toString();
  const normalizedAdventureId = options?.adventureId?.toString();

  const filteredEncounters = encounters.filter((encounter) => {
    if (!options) return true;

    if (normalizedCampaignId) {
      if (!encounter.campaignId) return false;

      const encounterCampaignId = encounter.campaignId.toString();
      if (encounterCampaignId !== normalizedCampaignId) {
        return false;
      }
    }

    if (normalizedAdventureId) {
      if (!encounter.adventureId) return false;

      const encounterAdventureId = encounter.adventureId?.toString();
      if (encounterAdventureId !== normalizedAdventureId) {
        return false;
      }
    }

    return true;
  });

  return { encounters: filteredEncounters, loading, refresh };
}

export { getAllEncounters };
