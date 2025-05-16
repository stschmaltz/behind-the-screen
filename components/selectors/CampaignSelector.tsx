import { useCallback, useRef, useState } from 'react';
import { getAllCampaigns } from '../../hooks/campaign/get-all-campaigns';
import { useUserPreferences } from '../../hooks/user-preferences/use-user-preferences';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import { saveCampaignMutation } from '../../data/graphql/snippets/campaign';
import { logger } from '../../lib/logger';
import { useActiveCampaign } from '../../context/ActiveCampaignContext';

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
  const { setActiveCampaignId } = useActiveCampaign();
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
      setActiveCampaignId(value || null);
      onCampaignChange(value || undefined);
    },
    [setActiveCampaign, setActiveCampaignId, onCampaignChange],
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
        setActiveCampaignId(newCampaignId);
        onCampaignChange(newCampaignId);

        setNewCampaignName('');
        setIsCreatingCampaign(false);

        await refreshCampaigns();
      }
    } catch (error) {
      logger.error('Failed to create campaign', error);
    }
  }, [
    newCampaignName,
    setActiveCampaign,
    setActiveCampaignId,
    onCampaignChange,
    refreshCampaigns,
  ]);

  const handleCancelCreate = useCallback(() => {
    setIsCreatingCampaign(false);
    setNewCampaignName('');
  }, []);

  return (
    <div className="w-full">
      {(!campaignsLoading && campaigns && campaigns.length === 0) ||
      isCreatingCampaign ? (
        <div className="card bg-base-200 p-3">
          <div className="form-control mb-2">
            <label className="label">
              <span className="label-text">New Campaign Name</span>
            </label>
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
          </div>
          <div className="flex gap-2 justify-end">
            {!(campaigns && campaigns.length === 0 && !campaignsLoading) && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleCancelCreate}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleCreateCampaign}
              disabled={!newCampaignName.trim()}
            >
              Create
            </button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default CampaignSelector;
