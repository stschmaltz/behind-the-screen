import Link from 'next/link';
import { getAllCampaigns } from '../../hooks/campaign/get-all-campaigns';
import { getAllAdventures } from '../../hooks/adventure/get-all-adventures';
import { useModal } from '../../hooks/use-modal';

interface CampaignAdventureSectionProps {
  onCampaignFilter: (campaignId: string | undefined) => void;
  onAdventureFilter: (adventureId: string | undefined) => void;
  selectedCampaignId?: string;
  selectedAdventureId?: string;
}

const CampaignAdventureSection = ({
  onCampaignFilter,
  onAdventureFilter,
  selectedCampaignId,
  selectedAdventureId,
}: CampaignAdventureSectionProps) => {
  const { campaigns, loading: _campaignsLoading } = getAllCampaigns();
  const { adventures, loading: adventuresLoading } = getAllAdventures({
    campaignId: selectedCampaignId,
  });

  const { showModal: showCampaignsModal, closeModal: closeCampaignsModal } =
    useModal('campaigns-modal');
  const { showModal: showAdventuresModal, closeModal: closeAdventuresModal } =
    useModal('adventures-modal');

  return (
    <div className="flex flex-col w-full space-y-2">
      <div className="flex items-center gap-2">
        <button
          className="btn btn-sm btn-secondary"
          onClick={showCampaignsModal}
        >
          Campaigns
        </button>
        <button
          className="btn btn-sm btn-secondary"
          onClick={showAdventuresModal}
        >
          Adventures
        </button>
      </div>

      <dialog id="campaigns-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Campaigns</h3>

          <div className="flex flex-col gap-2 mb-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">
                  Filter Encounters by Campaign
                </span>
              </div>
              <select
                className="select select-bordered"
                value={selectedCampaignId || ''}
                onChange={(e) => {
                  const value = e.target.value || undefined;
                  onCampaignFilter(value);
                  if (!value) {
                    onAdventureFilter(undefined);
                  }
                }}
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

          <div className="flex justify-between mb-4">
            <Link href="/campaigns">
              <button className="btn btn-sm">Manage All Campaigns</button>
            </Link>
            <Link href="/campaigns/new">
              <button className="btn btn-sm btn-primary">New Campaign</button>
            </Link>
          </div>

          <div className="modal-action">
            <button className="btn" onClick={closeCampaignsModal}>
              Close
            </button>
          </div>
        </div>
      </dialog>

      <dialog id="adventures-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Adventures</h3>

          {selectedCampaignId && (
            <div className="flex flex-col gap-2 mb-4">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Filter by Adventure</span>
                </div>
                <select
                  className="select select-bordered"
                  value={selectedAdventureId || ''}
                  onChange={(e) =>
                    onAdventureFilter(e.target.value || undefined)
                  }
                  disabled={!selectedCampaignId}
                >
                  <option value="">All Adventures</option>
                  {adventures?.map((adventure) => (
                    <option key={adventure._id} value={adventure._id}>
                      {adventure.name}
                    </option>
                  ))}
                </select>
              </label>
              {adventures?.length === 0 && !adventuresLoading && (
                <p className="text-sm text-warning">
                  No adventures found for this campaign.
                </p>
              )}
            </div>
          )}

          {!selectedCampaignId && (
            <div className="alert alert-info mb-4">
              <span>Select a campaign first to filter by adventure</span>
            </div>
          )}

          <div className="flex justify-between mb-4">
            <Link href="/adventures">
              <button className="btn btn-sm">Manage All Adventures</button>
            </Link>
            <Link href="/adventures/new">
              <button
                className="btn btn-sm btn-primary"
                disabled={!selectedCampaignId}
              >
                New Adventure
              </button>
            </Link>
          </div>

          <div className="modal-action">
            <button className="btn" onClick={closeAdventuresModal}>
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default CampaignAdventureSection;
