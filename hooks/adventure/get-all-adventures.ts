import {
  allAdventuresQuery,
  AllAdventuresResponse,
  adventuresByCampaignQuery,
  AdventuresByCampaignResponse,
} from '../../data/graphql/snippets/adventure';
import { useQuery } from '../use-async-query';
import { useMemo } from 'react';

interface GetAllAdventuresOptions {
  campaignId?: string;
}

// Define a type for transformed adventure
interface TransformedAdventure {
  _id: string;
  campaignId: string;
  name: string;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define transform functions outside for stability
const transformAdventuresByCampaign = (
  data: AdventuresByCampaignResponse,
): TransformedAdventure[] =>
  data.getAdventuresByCampaign
    .map((adventure) => ({
      ...adventure,
      createdAt: new Date(adventure.createdAt),
      updatedAt: new Date(adventure.updatedAt),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

const transformAllAdventures = (
  data: AllAdventuresResponse,
): TransformedAdventure[] =>
  data.getAdventures
    .map((adventure) => ({
      ...adventure,
      createdAt: new Date(adventure.createdAt),
      updatedAt: new Date(adventure.updatedAt),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

function getAllAdventures(options?: GetAllAdventuresOptions) {
  const campaignId = options?.campaignId;

  // Memoize the variables object
  const variables = useMemo(
    () => (campaignId ? { campaignId } : undefined),
    [campaignId],
  );

  // Use stable transform and memoized variables
  const queryConfig = useMemo(() => {
    if (campaignId) {
      return {
        query: adventuresByCampaignQuery,
        variables: variables,
        transform: transformAdventuresByCampaign,
      };
    } else {
      return {
        query: allAdventuresQuery,
        transform: transformAllAdventures,
      };
    }
  }, [campaignId, variables]);

  const { data, loading, refresh } =
    useQuery<TransformedAdventure[]>(queryConfig);

  const adventures = data ?? [];
  return { adventures, loading, refresh };
}

export { getAllAdventures };
