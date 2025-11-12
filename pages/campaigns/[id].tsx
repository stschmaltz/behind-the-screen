import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useGetCampaign } from '../../hooks/campaign/get-campaign.hook';
import {
  getAllAdventures,
  TransformedAdventure,
} from '../../hooks/adventure/get-all-adventures';
import { useManageAdventure } from '../../hooks/adventure/use-manage-adventure';
import { logger } from '../../lib/logger';
import { getAllPlayers } from '../../hooks/get-all-players.hook';
import CampaignHeader from '../../components/campaigns/CampaignHeader';
import AdventureList from '../../components/campaigns/AdventureList';
import ConfirmationModal from '../../components/modals/ConfirmationModal';

const CampaignDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const campaignId = typeof id === 'string' && id.length > 0 ? id : undefined;
  const { campaign, loading: campaignLoading } = useGetCampaign(campaignId);
  const {
    adventures,
    loading: adventuresLoading,
    refresh: refreshAdventures,
  } = getAllAdventures({ campaignId });
  const { handleSave, deleteAdventure, isSaving, isDeleting } =
    useManageAdventure();
  const { players, loading: playersLoading } = getAllPlayers();
  const [newAdventureName, setNewAdventureName] = useState('');
  const [renamingAdventureId, setRenamingAdventureId] = useState<string | null>(
    null,
  );
  const [adventureToDelete, setAdventureToDelete] = useState<string | null>(
    null,
  );

  const sortedAdventures = useMemo(() => {
    if (!adventures) return [];

    return [...adventures].sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;

      return a.name.localeCompare(b.name);
    });
  }, [adventures]);

  if (!router.isReady || !campaignId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const handleCreateAdventure = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAdventureName.trim() || !campaignId) {
      logger.warn('Attempted to create adventure without campaignId');

      return;
    }
    const adventureId = await handleSave({
      name: newAdventureName.trim(),
      status: 'active',
      campaignId,
    });
    if (adventureId) {
      setNewAdventureName('');
      router.push(
        `/encounters?campaignId=${campaignId}&adventureId=${adventureId}`,
      );
    } else {
      logger.error('Failed to create adventure');
    }
  };

  const handleRename = async (adventureId: string, newName: string) => {
    const adventure = adventures?.find((a) => a._id === adventureId);
    if (!adventure || !campaignId) return;
    setRenamingAdventureId(adventureId);
    const updatePayload = {
      _id: adventure._id,
      name: newName.trim(),
      description: adventure.description,
      status: adventure.status as 'active' | 'completed' | 'archived',
      campaignId,
    };
    const success = await handleSave(updatePayload);
    if (success) {
      refreshAdventures();
      setRenamingAdventureId(null);
    } else {
      logger.error('Failed to rename adventure');
      setRenamingAdventureId(null);
    }
  };

  const handleDelete = (adventureId: string) => {
    setAdventureToDelete(adventureId);
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

  const handleMarkAdventureComplete = async (
    adventure: TransformedAdventure,
  ) => {
    if (!campaignId) return;
    const updatePayload = {
      ...adventure,
      status: 'completed' as const,
      campaignId,
    };
    const success = await handleSave(updatePayload);
    if (success) {
      refreshAdventures();
    } else {
      logger.error('Failed to mark adventure as complete', {
        adventureId: adventure._id,
      });
    }
  };

  const isLoading = campaignLoading || adventuresLoading || playersLoading;
  if (isLoading) {
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
          <button className="btn btn-primary mt-4">Back to Campaigns</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <CampaignHeader
        campaign={campaign}
        players={players ?? []}
        campaignId={campaignId}
      />
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Adventures</h2>
        <AdventureList
          adventures={sortedAdventures}
          onCreate={handleCreateAdventure}
          onRename={handleRename}
          onDelete={handleDelete}
          onMarkComplete={handleMarkAdventureComplete}
          isSaving={isSaving}
          isDeleting={isDeleting}
          renamingAdventureId={renamingAdventureId}
          adventureToDeleteId={adventureToDelete}
          newAdventureName={newAdventureName}
          setNewAdventureName={setNewAdventureName}
        />
      </div>
      <ConfirmationModal
        isOpen={!!adventureToDelete}
        onClose={() => setAdventureToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Adventure?"
        message={`Are you sure you want to delete the adventure${adventures?.find((a) => a._id === adventureToDelete)?.name ? ` \"${adventures.find((a) => a._id === adventureToDelete)?.name}\"` : ''}? This action cannot be undone.\n\n⚠️ WARNING: Deleting an adventure will also permanently delete any encounters, NPCs, and player records linked to it. This data cannot be recovered.`}
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default CampaignDetailPage;
