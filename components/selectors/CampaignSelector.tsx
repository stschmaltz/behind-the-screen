import { useCallback, useRef, useState } from 'react';
import { getAllCampaigns } from '../../hooks/campaign/get-all-campaigns';
import { useUserPreferences } from '../../hooks/user-preferences/use-user-preferences';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import { saveCampaignMutation } from '../../data/graphql/snippets/campaign';
import { logger } from '../../lib/logger';

interface CampaignSelectorProps {
  onCampaignChange: (campaignId: string | undefined) => void;
  selectedCampaignId?: string;
}

interface SaveCampaignResponse {
  saveCampaign: {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

const CampaignSelector = ({
  onCampaignChange,
  selectedCampaignId,
}: CampaignSelectorProps) => {
  const {
    campaigns,
    loading: campaignsLoading,
    refresh: refreshCampaigns,
  } = getAllCampaigns();
  const { setActiveCampaign } = useUserPreferences();
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const newCampaignInputRef = useRef<HTMLInputElement>(null);

  const handleCampaignChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;

      if (value === 'new') {
        setIsCreatingCampaign(true);
        setTimeout(() => {
          newCampaignInputRef.current?.focus();
        }, 0);

        return;
      }

      await setActiveCampaign(value || null);
      onCampaignChange(value || undefined);
    },
    [setActiveCampaign, onCampaignChange],
  );

  const handleCreateCampaign = useCallback(async () => {
    if (!newCampaignName.trim()) return;

    try {
      const result = await asyncFetch<SaveCampaignResponse>(
        saveCampaignMutation,
        {
          input: {
            name: newCampaignName,
            status: 'active',
          },
        },
      );

      const newCampaignId = result?.saveCampaign?._id;

      if (newCampaignId) {
        await setActiveCampaign(newCampaignId);
        onCampaignChange(newCampaignId);

        setNewCampaignName('');
        setIsCreatingCampaign(false);

        await refreshCampaigns();
      }
    } catch (error) {
      logger.error('Failed to create campaign', error);
    }
  }, [newCampaignName, setActiveCampaign, onCampaignChange, refreshCampaigns]);

  const handleCancelCreate = useCallback(() => {
    setIsCreatingCampaign(false);
    setNewCampaignName('');
  }, []);

  return (
    <div className="w-full max-w-md">
      {!isCreatingCampaign ? (
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Campaign</span>
          </label>
          <select
            className="select select-bordered"
            value={selectedCampaignId || ''}
            onChange={handleCampaignChange}
            disabled={campaignsLoading}
          >
            {!campaignsLoading && campaigns && campaigns.length === 0 && (
              <option value="">No campaigns found</option>
            )}
            {campaignsLoading && (
              <option value="" disabled>
                Loading campaigns...
              </option>
            )}
            {campaigns?.map((campaign) => (
              <option key={campaign._id} value={campaign._id}>
                {campaign.name}
              </option>
            ))}
            <option value="new" className="text-primary font-semibold">
              + Create New Campaign
            </option>
          </select>
        </div>
      ) : (
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">New Campaign Name</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              ref={newCampaignInputRef}
              className="input input-bordered w-full"
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              placeholder="Enter campaign name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCampaign();
                if (e.key === 'Escape') handleCancelCreate();
              }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateCampaign}
              disabled={!newCampaignName.trim()}
            >
              Create
            </button>
            <button className="btn btn-ghost" onClick={handleCancelCreate}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignSelector;
