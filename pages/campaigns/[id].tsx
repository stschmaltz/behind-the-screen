import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useGetCampaign } from '../../hooks/campaign/get-campaign.hook';

const CampaignDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Ensure id is a string before passing to the hook
  const campaignId = typeof id === 'string' ? id : undefined;

  const { campaign, loading } = useGetCampaign(campaignId || '');

  if (!campaignId) {
    // Should ideally not happen if routing is set up correctly
    return <div>Invalid campaign ID specified.</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Campaign not found or failed to load.</p>
        <Link href="/campaigns">
          <button className="btn btn-link mt-4">Back to Campaigns</button>
        </Link>
      </div>
    );
  }

  // Basic display for now
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/campaigns">
          <button className="btn btn-ghost btn-sm">← Back to Campaigns</button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-4">{campaign.name}</h1>
      <p>Status: {campaign.status}</p>
      <p>Created: {campaign.createdAt.toLocaleDateString()}</p>
      {/* Add more campaign details here */}
    </div>
  );
};

export default CampaignDetailPage;
