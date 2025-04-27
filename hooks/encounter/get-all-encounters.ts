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

// Define the transform function outside the hook for stability
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

  // Normalize filter IDs to make comparison consistent
  const normalizedCampaignId = options?.campaignId?.toString();
  const normalizedAdventureId = options?.adventureId?.toString();

  // Apply filters if options are provided
  const filteredEncounters = encounters.filter((encounter) => {
    // If no filters are specified, include all encounters
    if (!options) return true;

    // Filter by campaignId if specified
    if (normalizedCampaignId) {
      // Skip this encounter if it has no campaignId
      if (!encounter.campaignId) return false;

      const encounterCampaignId = encounter.campaignId.toString();
      if (encounterCampaignId !== normalizedCampaignId) {
        return false;
      }
    }

    // Filter by adventureId if specified
    if (normalizedAdventureId) {
      // Skip this encounter if it has no adventureId
      if (!encounter.adventureId) return false;

      const encounterAdventureId = encounter.adventureId?.toString(); // Use optional chaining
      if (encounterAdventureId !== normalizedAdventureId) {
        return false;
      }
    }

    return true;
  });

  return { encounters: filteredEncounters, loading, refresh };
}

export { getAllEncounters };
