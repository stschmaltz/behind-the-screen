import {
  allCampaignsQuery,
  AllCampaignsResponse,
} from '../../data/graphql/snippets/campaign';
import { useQuery } from '../use-async-query';

// Define a type that matches what the transform returns
interface TransformedCampaign {
  _id: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the transform function outside the hook for stability
const transformCampaigns = (
  data: AllCampaignsResponse,
): TransformedCampaign[] =>
  data.getCampaigns
    .map((campaign) => ({
      ...campaign,
      createdAt: new Date(campaign.createdAt),
      updatedAt: new Date(campaign.updatedAt),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

function getAllCampaigns() {
  const { data, loading, refresh } = useQuery<TransformedCampaign[]>({
    query: allCampaignsQuery,
    transform: transformCampaigns, // Use the stable transform function
  });

  const campaigns = data ?? [];

  return { campaigns, loading, refresh };
}

export { getAllCampaigns };
