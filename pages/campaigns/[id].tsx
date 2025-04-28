import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useGetCampaign } from '../../hooks/campaign/get-campaign.hook';
import {
  getAllAdventures,
  TransformedAdventure,
} from '../../hooks/adventure/get-all-adventures';
import { useManageAdventure } from '../../hooks/adventure/use-manage-adventure';
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

const CampaignDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const campaignId = typeof id === 'string' ? id : undefined;

  const { campaign, loading } = useGetCampaign(campaignId || '');
  const {
    adventures,
    loading: adventuresLoading,
    refresh: refreshAdventures,
  } = getAllAdventures({
    campaignId,
  });
  const { handleSave, deleteAdventure, isSaving, isDeleting } =
    useManageAdventure();
  const { players, loading: _playersLoading } = getAllPlayers();

  const [newAdventureName, setNewAdventureName] = useState('');
  const [renamingAdventureId, setRenamingAdventureId] = useState<string | null>(
    null,
  );
  const [adventureToDelete, setAdventureToDelete] = useState<string | null>(
    null,
  );
  const [adventureRenameValue, setAdventureRenameValue] = useState('');

  const handleCreateAdventure = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAdventureName.trim() || !campaignId) return;

    const success = await handleSave({
      name: newAdventureName.trim(),
      status: 'active',
      campaignId,
    });

    if (success) {
      setNewAdventureName('');
      refreshAdventures();
    } else {
      logger.error('Failed to create adventure');
    }
  };

  const handleRenameStart = (adventure: { _id: string; name: string }) => {
    setRenamingAdventureId(adventure._id);
    setAdventureRenameValue(adventure.name);
  };

  const handleRenameCancel = () => {
    setRenamingAdventureId(null);
    setAdventureRenameValue('');
  };

  const handleRenameSubmit = async (
    e: FormEvent,
    adventure: TransformedAdventure,
  ) => {
    e.preventDefault();
    if (!renamingAdventureId || !adventureRenameValue.trim()) return;

    const updatePayload = {
      _id: adventure._id,
      name: adventureRenameValue.trim(),
      description: adventure.description,
      status: adventure.status as 'active' | 'completed' | 'archived',
      campaignId: adventure.campaignId,
    };

    const success = await handleSave(updatePayload);
    if (success) {
      refreshAdventures();
      handleRenameCancel();
    } else {
      logger.error('Failed to rename adventure');
    }
  };

  const handleDeleteClick = (adventureId: string) => {
    setAdventureToDelete(adventureId);
  };

  const handleDeleteCancel = () => {
    setAdventureToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!adventureToDelete) return;

    const success = await deleteAdventure(adventureToDelete);
    if (success) {
      refreshAdventures();
      setAdventureToDelete(null);
    } else {
      logger.error('Failed to delete adventure');
      setAdventureToDelete(null);
    }
  };

  if (!campaignId) {
    // Should ideally not happen if routing is set up correctly
    return <div>Invalid campaign ID specified.</div>;
  }

  if (loading || adventuresLoading) {
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

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="mb-6">
        <Link href="/campaigns">
          <button className="btn btn-ghost btn-sm">← Back to Campaigns</button>
        </Link>
      </div>

      <div className="bg-base-200 rounded-lg p-6 mb-8 shadow-sm">
        <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`badge ${campaign.status === 'active' ? 'badge-accent' : 'badge-ghost'}`}
          >
            {campaign.status === 'active' ? 'Active' : 'Completed'}
          </div>
        </div>
        <div className="mt-4">
          {campaignId && (
            <PlayerManagementSection
              startingPlayers={players ?? []}
              campaignId={campaignId}
              buttonClassName="btn-sm"
            />
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Adventures</h2>

        <form onSubmit={handleCreateAdventure} className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="New adventure name"
            className="input input-bordered flex-grow"
            value={newAdventureName}
            onChange={(e) => setNewAdventureName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving || !newAdventureName.trim()}
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              'Create Adventure'
            )}
          </button>
        </form>

        {adventures && adventures.length > 0 ? (
          <div className="space-y-4">
            {adventures.map((adventure) => (
              <div
                key={adventure._id}
                className="p-4 bg-base-200 border border-base-300 rounded shadow-sm"
              >
                {renamingAdventureId === adventure._id ? (
                  <form
                    onSubmit={(e) => handleRenameSubmit(e, adventure)}
                    className="flex gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={adventureRenameValue}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAdventureRenameValue(e.target.value)
                      }
                      className="input input-bordered input-sm flex-grow"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="btn btn-xs btn-success"
                      disabled={isSaving || !adventureRenameValue.trim()}
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
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold hover:underline">
                        {adventure.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => handleRenameStart(adventure)}
                          disabled={isDeleting}
                        >
                          Rename
                        </button>
                        <button
                          className="btn btn-xs btn-error btn-ghost"
                          onClick={() => handleDeleteClick(adventure._id)}
                          disabled={
                            renamingAdventureId === adventure._id || isDeleting
                          }
                        >
                          {isDeleting && adventureToDelete === adventure._id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="text-sm opacity-80">
                          {new Date().toLocaleDateString()}
                        </div>
                        <div
                          className={`badge ${adventure.status === 'active' ? 'badge-accent' : 'badge-ghost'}`}
                        >
                          {adventure.status === 'active'
                            ? 'Active'
                            : 'Completed'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-base-200 rounded-lg">
            <p className="text-base-content opacity-70">
              No adventures yet. Create your first one!
            </p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!adventureToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Adventure?"
        message={`Are you sure you want to delete the adventure${adventures.find((a) => a._id === adventureToDelete)?.name ? ` "${adventures.find((a) => a._id === adventureToDelete)?.name}"` : ''}? This action cannot be undone.
        
⚠️ WARNING: Deleting an adventure will also permanently delete any encounters, NPCs, and player records linked to it. This data cannot be recovered.`}
      />
    </div>
  );
};

export default CampaignDetailPage;
