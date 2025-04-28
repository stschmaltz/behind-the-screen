import Link from 'next/link';
import { NextPage } from 'next';
import { ChangeEvent, FormEvent, useState } from 'react';
import { getAllCampaigns } from '../../hooks/campaign/get-all-campaigns';
import { useManageCampaign } from '../../hooks/campaign/use-manage-campaign';
import { logger } from '../../lib/logger';
import PlayerManagementSection from '../encounters/PlayerManagementSection';
import { getAllPlayers } from '../../hooks/get-all-players.hook';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-error" onClick={onConfirm}>
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const CampaignsPage: NextPage = () => {
  const { campaigns, loading, refresh: refreshCampaigns } = getAllCampaigns();
  const { handleSave, deleteCampaign, isSaving, isDeleting } =
    useManageCampaign();
  const { players, loading: _playersLoading } = getAllPlayers();

  const [renamingCampaignId, setRenamingCampaignId] = useState<string | null>(
    null,
  );
  const [newName, setNewName] = useState<string>('');
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  const handleRenameStart = (campaign: { _id: string; name: string }) => {
    setRenamingCampaignId(campaign._id);
    setNewName(campaign.name);
  };

  const handleRenameCancel = () => {
    setRenamingCampaignId(null);
    setNewName('');
  };

  const handleRenameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!renamingCampaignId || !newName.trim()) return;

    const campaignToUpdate = campaigns?.find(
      (c) => c._id === renamingCampaignId,
    );
    if (!campaignToUpdate) return;

    const updatePayload = {
      _id: campaignToUpdate._id,
      name: newName.trim(),
      status: campaignToUpdate.status as 'active' | 'completed' | 'archived',
    };

    const success = await handleSave(updatePayload);
    if (success) {
      await refreshCampaigns();
      handleRenameCancel();
    } else {
      logger.error('Failed to rename campaign');
    }
  };

  const handleDeleteClick = (campaignId: string) => {
    setCampaignToDelete(campaignId);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;

    const success = await deleteCampaign(campaignToDelete);
    if (success) {
      await refreshCampaigns();
      setCampaignToDelete(null);
    } else {
      logger.error('Failed to delete campaign');
      setCampaignToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setCampaignToDelete(null);
  };

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
          <div className="flex w-full flex-col gap-2 max-w-md">
            {campaigns.map((campaign) => {
              const isRenaming = renamingCampaignId === campaign._id;

              return (
                <div
                  key={campaign._id}
                  className="p-4 bg-base-200 border border-base-300 rounded shadow-sm flex flex-col gap-2"
                >
                  {isRenaming ? (
                    <form
                      onSubmit={handleRenameSubmit}
                      className="flex gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={newName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setNewName(e.target.value)
                        }
                        className="input input-bordered input-sm flex-grow"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="btn btn-xs btn-success"
                        disabled={isSaving || !newName.trim()}
                      >
                        {isSaving ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          'Save'
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={handleRenameCancel}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center">
                      <Link
                        href={`/campaigns/${campaign._id}`}
                        className="text-lg font-semibold hover:underline"
                      >
                        {campaign.name}
                      </Link>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => handleRenameStart(campaign)}
                          disabled={isDeleting}
                        >
                          Rename
                        </button>
                        <button
                          className="btn btn-xs btn-error btn-ghost"
                          onClick={() => handleDeleteClick(campaign._id)}
                          disabled={isRenaming || isDeleting}
                        >
                          {isDeleting && campaignToDelete === campaign._id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="text-sm opacity-80">
                        {new Date().toLocaleDateString()}
                      </div>
                      <div
                        className={`badge ${campaign.status === 'active' ? 'badge-accent' : 'badge-ghost'}`}
                      >
                        {campaign.status === 'active' ? 'Active' : 'Completed'}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <PlayerManagementSection
                        startingPlayers={players ?? []}
                        campaignId={campaign._id}
                        buttonClassName="btn-xs btn-ghost"
                      />
                      <Link
                        href={`/campaigns/${campaign._id}`}
                        className="btn btn-xs btn-outline btn-info"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      <ConfirmationModal
        isOpen={!!campaignToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Campaign?"
        message={`Are you sure you want to delete the campaign${campaigns?.find((c) => c._id === campaignToDelete)?.name ? ` "${campaigns.find((c) => c._id === campaignToDelete)?.name}"` : ''}? This action cannot be undone. 
        
⚠️ WARNING: Deleting a campaign will also permanently delete any adventures, characters, and encounters linked to it. This data cannot be recovered.`}
      />
    </div>
  );
};

export default CampaignsPage;
