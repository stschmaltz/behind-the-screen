import Link from 'next/link';
import { NextPage } from 'next';
import { getAllCampaigns } from '../../hooks/campaign/get-all-campaigns';

const CampaignsPage: NextPage = () => {
  const { campaigns, loading } = getAllCampaigns();

  const loadingState = (
    <div className="bg-base-100 flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );

  const emptyState = (
    <div className="flex items-center justify-center text-base-content opacity-80">
      No campaigns found
    </div>
  );

  return (
    <div className="bg-base-100 min-h-screen p-4 flex flex-col items-center w-full max-w-2xl space-y-4 m-auto min-w-72">
      <h1 className="text-2xl font-bold mb-6">Campaigns</h1>
      <div className="flex w-full justify-between items-center mb-8 max-w-md">
        <Link href="/campaigns/new">
          <button className="btn btn-primary">New Campaign</button>
        </Link>
      </div>
      {loading && loadingState}
      {!loading &&
        (!campaigns?.length ? (
          emptyState
        ) : (
          <div className="flex w-full flex-col gap-2">
            {campaigns.map((campaign) => (
              <Link
                key={campaign._id}
                href={`/campaigns/${campaign._id}`}
                className="block w-full"
              >
                <div className="p-4 bg-base-200 border border-base-300 rounded shadow-sm flex justify-between items-center hover:bg-base-300 transition-colors">
                  <div className="text-lg font-semibold">{campaign.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm opacity-80">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                    <div
                      className={`badge ${
                        campaign.status === 'active'
                          ? 'badge-accent'
                          : 'badge-ghost'
                      }`}
                    >
                      {campaign.status === 'active' ? 'Active' : 'Completed'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
    </div>
  );
};

export default CampaignsPage;
