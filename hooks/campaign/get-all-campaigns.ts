import {
  allCampaignsQuery,
  AllCampaignsResponse,
} from '../../data/graphql/snippets/campaign';
import { useQuery } from '../use-async-query';

interface TransformedCampaign {
  _id: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const isNonNullCampaign = (
  campaign: any,
): campaign is NonNullable<typeof campaign> =>
  campaign !== null && campaign !== undefined;

const transformCampaigns = (
  data: AllCampaignsResponse,
): TransformedCampaign[] =>
  (data.getCampaigns ?? [])
    .filter(isNonNullCampaign)
    .map((campaign) => ({
      _id: campaign._id ?? '',
      name: campaign.name ?? '',
      status: campaign.status ?? 'active',
      createdAt: campaign.createdAt ? new Date(campaign.createdAt) : new Date(),
      updatedAt: campaign.updatedAt ? new Date(campaign.updatedAt) : new Date(),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

function getAllCampaigns() {
  const { data, loading, refresh } = useQuery<TransformedCampaign[]>({
    query: allCampaignsQuery,
    transform: transformCampaigns,
  });

  const campaigns = data ?? [];

  return { campaigns, loading, refresh };
}

export { getAllCampaigns };
