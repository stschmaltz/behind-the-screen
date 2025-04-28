import { useMemo } from 'react';
import {
  campaignByIdQuery,
  CampaignByIdResponse,
} from '../../data/graphql/snippets/campaign';
import { Campaign } from '../../types/campaigns'; // Assuming Campaign type includes needed fields
import { useQuery } from '../use-async-query';

// Type for the hook's return value, matching the transformed data
interface TransformedCampaignData
  extends Omit<Campaign, 'createdAt' | 'updatedAt' | 'userId'> {
  userId?: string; // Make userId optional
  createdAt: Date;
  updatedAt: Date;
}

// Transformation function to convert string dates to Date objects and cast status
const transformCampaignData = (
  data: CampaignByIdResponse,
): TransformedCampaignData | null => {
  if (!data?.getCampaign) {
    return null;
  }
  return {
    ...data.getCampaign,
    // Cast status to the expected literal type
    status: data.getCampaign.status as 'active' | 'completed' | 'archived',
    createdAt: new Date(data.getCampaign.createdAt),
    updatedAt: new Date(data.getCampaign.updatedAt),
  };
};

function useGetCampaign(id: string): {
  campaign: TransformedCampaignData | null;
  loading: boolean;
  refresh: () => Promise<TransformedCampaignData | null>;
} {
  const variables = useMemo(() => ({ id }), [id]);

  const {
    data: campaign,
    loading,
    refresh,
  } = useQuery<TransformedCampaignData | null>({
    query: campaignByIdQuery,
    variables,
    transform: transformCampaignData,
    enabled: !!id, // Only run query if ID is available
  });

  return { campaign, loading, refresh };
}

export { useGetCampaign };
