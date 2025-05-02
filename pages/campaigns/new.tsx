import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useManageCampaign } from '../../hooks/campaign/use-manage-campaign';
import { logger } from '../../lib/logger';

const NewCampaignPage: NextPage = () => {
  const router = useRouter();
  const { handleSave, isSaving } = useManageCampaign();
  const [campaignName, setCampaignName] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) return;

    try {
      const newCampaignId = await handleSave({
        name: campaignName.trim(),
        status: 'active',
      });

      if (newCampaignId) {
        router.push(`/campaigns/${newCampaignId}`);
      } else {
        logger.error(
          'Failed to create new campaign (handleSave returned null)',
        );
      }
    } catch (error) {
      logger.error('Failed to create new campaign (exception caught)', error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="mb-6">
        <Link href="/campaigns">
          <button className="btn btn-ghost btn-sm">← Back to Campaigns</button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Create New Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="campaignName" className="label">
            <span className="label-text">Campaign Name</span>
          </label>
          <input
            id="campaignName"
            type="text"
            placeholder="Enter campaign name"
            className="input input-bordered w-full"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSaving || !campaignName.trim()}
        >
          {isSaving ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            'Create Campaign'
          )}
        </button>
      </form>
    </div>
  );
};

export default NewCampaignPage;
