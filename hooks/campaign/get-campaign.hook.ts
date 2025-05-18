import { useMemo } from 'react';
import {
  campaignByIdQuery,
  CampaignByIdResponse,
} from '../../data/graphql/snippets/campaign';
import { Campaign } from '../../types/campaigns';
import { useQuery } from '../use-async-query';

export interface TransformedCampaignData
  extends Omit<Campaign, 'createdAt' | 'updatedAt' | 'userId'> {
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transformCampaignData = (
  data: CampaignByIdResponse,
): TransformedCampaignData | null => {
  if (!data?.getCampaign) {
    return null;
  }
  return {
    ...data.getCampaign,
    status: data.getCampaign.status as 'active' | 'completed' | 'archived',
    createdAt: data.getCampaign.createdAt
      ? new Date(data.getCampaign.createdAt)
      : new Date(),
    updatedAt: data.getCampaign.updatedAt
      ? new Date(data.getCampaign.updatedAt)
      : new Date(),
  };
};

function useGetCampaign(id: string | undefined): {
  campaign: TransformedCampaignData | null;
  loading: boolean;
  refresh: () => Promise<TransformedCampaignData | null>;
} {
  const variables = useMemo(() => (id ? { id } : undefined), [id]);

  const {
    data: campaign,
    loading,
    refresh,
  } = useQuery<TransformedCampaignData | null>({
    query: campaignByIdQuery,
    variables,
    transform: transformCampaignData,
    enabled: !!id,
  });

  return { campaign, loading, refresh };
}

export { useGetCampaign };
