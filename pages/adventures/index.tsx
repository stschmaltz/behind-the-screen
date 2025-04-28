import Link from 'next/link';
import { NextPage } from 'next';
import { ChangeEvent, FormEvent, useState } from 'react';
import { getAllAdventures } from '../../hooks/adventure/get-all-adventures';
import { useManageAdventure } from '../../hooks/adventure/use-manage-adventure';
import { getAllCampaigns } from '../../hooks/campaign/get-all-campaigns';
import { logger } from '../../lib/logger';

// A simple modal component (replace with a proper modal if available)
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

const AdventuresPage: NextPage = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<
    string | undefined
  >(undefined);
  const {
    adventures,
    loading,
    refresh: refreshAdventures,
  } = getAllAdventures({
    campaignId: selectedCampaignId,
  });
  const { campaigns, loading: campaignsLoading } = getAllCampaigns();
  const { handleSave, deleteAdventure, isSaving, isDeleting } =
    useManageAdventure();

  const [renamingAdventureId, setRenamingAdventureId] = useState<string | null>(
    null,
  );
  const [newName, setNewName] = useState<string>('');
  const [adventureToDelete, setAdventureToDelete] = useState<string | null>(
    null,
  );

  const handleRenameStart = (adventure: { _id: string; name: string }) => {
    setRenamingAdventureId(adventure._id);
    setNewName(adventure.name);
  };

  const handleRenameCancel = () => {
    setRenamingAdventureId(null);
    setNewName('');
  };

  const handleRenameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!renamingAdventureId || !newName.trim()) return;

    const adventureToUpdate = adventures.find(
      (a) => a._id === renamingAdventureId,
    );
    if (!adventureToUpdate) return;

    const updatePayload = {
      _id: adventureToUpdate._id,
      name: newName.trim(),
      description: adventureToUpdate.description,
      status: adventureToUpdate.status as 'active' | 'completed' | 'archived',
      campaignId: adventureToUpdate.campaignId,
    };

    const success = await handleSave(updatePayload);
    if (success) {
      await refreshAdventures();
      handleRenameCancel();
    } else {
      logger.error('Failed to rename adventure');
    }
  };

  const handleDeleteClick = (adventureId: string) => {
    setAdventureToDelete(adventureId);
  };

  const handleDeleteConfirm = async () => {
    if (!adventureToDelete) return;

    const success = await deleteAdventure(adventureToDelete);
    if (success) {
      await refreshAdventures();
      setAdventureToDelete(null);
    } else {
      logger.error('Failed to delete adventure');
      setAdventureToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setAdventureToDelete(null);
  };

  const loadingState = (
    <div className="bg-base-100 flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
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

      <div className="w-full mb-4 max-w-md">
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Filter by Campaign</span>
          </div>
          <select
            className="select select-bordered"
            value={selectedCampaignId || ''}
            onChange={(e) => setSelectedCampaignId(e.target.value || undefined)}
            disabled={campaignsLoading || !campaigns}
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
          <div className="flex w-full flex-col gap-2 max-w-md">
            {adventures.map((adventure) => {
              const campaign = campaigns?.find(
                (c) => c._id === adventure.campaignId,
              );
              const isRenaming = renamingAdventureId === adventure._id;

              return (
                <div
                  key={adventure._id}
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
                        href={`/adventures/${adventure._id}`}
                        className="text-lg font-semibold hover:underline"
                      >
                        {adventure.name}
                      </Link>
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
                          disabled={isRenaming || isDeleting}
                        >
                          {isDeleting && adventureToDelete === adventure._id ? (
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
                        {new Date(adventure.createdAt).toLocaleDateString()}
                      </div>
                      <div
                        className={`badge ${adventure.status === 'active' ? 'badge-accent' : 'badge-ghost'}`}
                      >
                        {adventure.status === 'active' ? 'Active' : 'Completed'}
                      </div>
                      {campaign && (
                        <div className="text-base-content opacity-70">
                          Campaign: {campaign.name}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/adventures/${adventure._id}`}
                      className="btn btn-xs btn-outline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      <ConfirmationModal
        isOpen={!!adventureToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Adventure?"
        message={`Are you sure you want to delete the adventure${adventures.find((a) => a._id === adventureToDelete)?.name ? ` "${adventures.find((a) => a._id === adventureToDelete)?.name}"` : ''}? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdventuresPage;
