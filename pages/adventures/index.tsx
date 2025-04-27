import Link from 'next/link';
import { NextPage } from 'next';
import { useState } from 'react';
import { getAllAdventures } from '../../hooks/adventure/get-all-adventures';
import { getAllCampaigns } from '../../hooks/campaign/get-all-campaigns';

const AdventuresPage: NextPage = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<
    string | undefined
  >(undefined);
  const { adventures, loading } = getAllAdventures({
    campaignId: selectedCampaignId,
  });
  const { campaigns, loading: campaignsLoading } = getAllCampaigns();

  const loadingState = (
    <div className="bg-base-100 flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );

  const emptyState = (
    <div className="flex items-center justify-center text-base-content opacity-80">
      No adventures found
    </div>
  );

  return (
    <div className="bg-base-100 min-h-screen p-4 flex flex-col items-center w-full max-w-2xl space-y-4 m-auto min-w-72">
      <h1 className="text-2xl font-bold mb-6">Adventures</h1>

      <div className="flex w-full justify-between items-center mb-4 max-w-md">
        <Link href="/adventures/new">
          <button className="btn btn-primary">New Adventure</button>
        </Link>
      </div>

      {/* Campaign Filter */}
      <div className="w-full mb-4">
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Filter by Campaign</span>
          </div>
          <select
            className="select select-bordered"
            value={selectedCampaignId || ''}
            onChange={(e) => setSelectedCampaignId(e.target.value || undefined)}
          >
            <option value="">All Campaigns</option>
            {campaigns?.map((campaign) => (
              <option key={campaign._id} value={campaign._id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(loading || campaignsLoading) && loadingState}
      {!loading &&
        !campaignsLoading &&
        (!adventures?.length ? (
          emptyState
        ) : (
          <div className="flex w-full flex-col gap-2">
            {adventures.map((adventure) => {
              const campaign = campaigns?.find(
                (c) => c._id === adventure.campaignId,
              );

              return (
                <Link
                  key={adventure._id}
                  href={`/adventures/${adventure._id}`}
                  className="block w-full"
                >
                  <div className="p-4 bg-base-200 border border-base-300 rounded shadow-sm hover:bg-base-300 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold">
                        {adventure.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm opacity-80">
                          {new Date(adventure.createdAt).toLocaleDateString()}
                        </div>
                        <div
                          className={`badge ${
                            adventure.status === 'active'
                              ? 'badge-accent'
                              : 'badge-ghost'
                          }`}
                        >
                          {adventure.status === 'active'
                            ? 'Active'
                            : 'Completed'}
                        </div>
                      </div>
                    </div>
                    {campaign && (
                      <div className="mt-2 text-sm text-base-content opacity-70">
                        Campaign: {campaign.name}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
    </div>
  );
};

export default AdventuresPage;
