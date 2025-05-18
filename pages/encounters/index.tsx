import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAllEncounters } from '../../hooks/encounter/get-all-encounters';
import { getAllAdventures } from '../../hooks/adventure/get-all-adventures';
import { useActiveCampaign } from '../../context/ActiveCampaignContext';
import { DocumentIcon } from '../../components/icons';
import { useManageEncounter } from '../../hooks/encounter/use-manage-encounter';
import EncounterList from '../../components/encounters/EncounterList';
import EncounterPageHeader from '../../components/encounters/EncounterPageHeader';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import CopyConfirmationModal from '../../components/modals/CopyConfirmationModal';
import { logger } from '../../lib/logger';
import type { Encounter } from '../../src/generated/graphql';
import type { NewEncounterTemplate } from '../../types/encounters';

const LoadingState = () => (
  <div className="bg-base-100 flex items-center justify-center min-h-[40vh]">
    <p>Loading...</p>
  </div>
);

const EmptyState = () => (
  <div className="flex items-center justify-center text-base-content opacity-80 min-h-[40vh]">
    No encounters found
  </div>
);

const NoCampaignSelectedState = () => (
  <div className="flex flex-col items-center justify-center text-base-content opacity-80 p-8 bg-base-200 rounded-lg min-h-[40vh]">
    <DocumentIcon className="w-12 h-12 mb-4 opacity-50" />
    <p className="text-xl font-semibold mb-2">Select a Campaign</p>
    <p className="text-center mb-2">
      Please select or create a campaign to manage its encounters.
    </p>
  </div>
);

const EncountersPage: NextPage = () => {
  const router = useRouter();
  const {
    activeCampaignId: contextCampaignId,
    campaigns,
    campaignsLoading,
    players,
    playersLoading,
  } = useActiveCampaign();
  const activeCampaignId = contextCampaignId || undefined;
  const [selectedCampaignId, setSelectedCampaignId] = useState<
    string | undefined
  >(undefined);
  const [selectedAdventureId, setSelectedAdventureId] = useState<
    string | undefined
  >(undefined);
  const {
    handleSave: performSaveEncounter,
    isSaving,
    deleteEncounter,
    isDeleting,
  } = useManageEncounter();
  const [encounterToDelete, setEncounterToDelete] = useState<string | null>(
    null,
  );
  const [encounterToCopy, setEncounterToCopy] = useState<Encounter | null>(
    null,
  );
  const [newEncounterName, setNewEncounterName] = useState<string>('');

  useEffect(() => {
    if (!router.isReady) return;
    const queryCampaignId = router.query.campaignId as string | undefined;
    const queryAdventureId = router.query.adventureId as string | undefined;
    const newEncounterCreated = router.query.newEncounterCreated === 'true';
    const newEncounterName = router.query.newEncounterName
      ? decodeURIComponent(router.query.newEncounterName as string)
      : undefined;
    let campaignToSet = queryCampaignId;
    if (!campaignToSet && !selectedCampaignId) {
      campaignToSet = activeCampaignId;
    }
    if (campaignToSet) {
      setSelectedCampaignId(campaignToSet);
    }
    const currentOrQueryCampaignId = campaignToSet || selectedCampaignId;
    if (currentOrQueryCampaignId && queryAdventureId) {
      setSelectedAdventureId(queryAdventureId);
    }
    if (newEncounterCreated && newEncounterName) {
      const {
        newEncounterCreated: _newEncounterCreated,
        newEncounterName: _newEncounterName,
        ...restQuery
      } = router.query;
      setTimeout(() => {
        document
          .getElementById('ready-encounters')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        router.replace(
          { pathname: router.pathname, query: restQuery },
          undefined,
          { shallow: true },
        );
      }, 1000);
    }
  }, [
    router.isReady,
    router.query,
    activeCampaignId,
    selectedCampaignId,
    router.pathname,
    router,
  ]);

  const {
    loading: encountersLoading,
    encounters,
    refresh: refreshEncounters,
  } = getAllEncounters({
    campaignId: selectedCampaignId,
    adventureId: selectedAdventureId,
  });
  const { adventures, loading: adventuresLoading } = getAllAdventures({
    campaignId: selectedCampaignId,
  });
  const loading =
    encountersLoading ||
    playersLoading ||
    campaignsLoading ||
    adventuresLoading;

  const newEncounterParams = new URLSearchParams();
  if (selectedCampaignId)
    newEncounterParams.append('campaignId', selectedCampaignId);
  if (selectedAdventureId)
    newEncounterParams.append('adventureId', selectedAdventureId);
  const newEncounterUrl = `/encounters/new?${newEncounterParams.toString()}`;

  const handleCampaignChange = useCallback((id: string | undefined) => {
    setSelectedCampaignId(id);
    setSelectedAdventureId(undefined);
  }, []);

  const handleAdventureChange = useCallback((id: string | undefined) => {
    setSelectedAdventureId(id);
  }, []);

  const handleDeleteClick = (encounterId: string) =>
    setEncounterToDelete(encounterId);

  const handleDeleteConfirm = useCallback(async () => {
    if (!encounterToDelete || isDeleting) return;
    const success = await deleteEncounter(encounterToDelete);
    if (success) {
      logger.info('Encounter deleted successfully, refreshing...');
      await refreshEncounters();
      setEncounterToDelete(null);
    } else {
      logger.error('Failed to delete encounter.');
      setEncounterToDelete(null);
    }
  }, [encounterToDelete, isDeleting, deleteEncounter, refreshEncounters]);

  const handleDeleteCancel = () => {
    if (isDeleting) return;
    setEncounterToDelete(null);
  };

  const handleCopyClick = (encounter: Encounter) => {
    setNewEncounterName(`${encounter.name} (Copy)`);
    setEncounterToCopy(encounter);
  };

  const handleCopyConfirm = useCallback(async () => {
    if (!encounterToCopy || isSaving || !newEncounterName.trim()) return;
    logger.debug('Original encounter ID for copy:', encounterToCopy._id);
    const newEncounterData: NewEncounterTemplate = {
      name: newEncounterName.trim(),
      status: 'inactive',
      enemies: (encounterToCopy.enemies || []).map((e) => ({
        ...e,
        meta: e.meta ?? undefined,
        speed: e.speed ?? undefined,
        challenge: e.challenge ?? undefined,
        actions: e.actions ?? undefined,
        legendaryActions: e.legendaryActions ?? undefined,
        img_url: e.img_url ?? undefined,
        monsterSource: e.monsterSource ?? undefined,
        traits: e.traits ?? undefined,
        stats: e.stats
          ? {
              STR: e.stats.STR ?? 0,
              DEX: e.stats.DEX ?? 0,
              CON: e.stats.CON ?? 0,
              INT: e.stats.INT ?? 0,
              WIS: e.stats.WIS ?? 0,
              CHA: e.stats.CHA ?? 0,
            }
          : undefined,
      })),
      notes: encounterToCopy.notes || [],
      description: encounterToCopy.description || '',
      campaignId: encounterToCopy.campaignId?.toString() || '',
      adventureId: encounterToCopy.adventureId?.toString(),
    };
    logger.debug('Attempting to save cloned data:', newEncounterData);
    const success = await performSaveEncounter(newEncounterData);
    setEncounterToCopy(null);
    setNewEncounterName('');
    if (success) {
      logger.info('Save reported success. Refreshing encounters list...');
      try {
        await refreshEncounters();
        logger.info('Encounter list refresh completed.');
        setTimeout(() => {
          document
            .getElementById('ready-encounters')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
      } catch (refreshError) {
        logger.error('Error during encounter list refresh:', refreshError);
      }
    } else {
      logger.error('Save reported failure.');
    }
  }, [
    encounterToCopy,
    isSaving,
    newEncounterName,
    performSaveEncounter,
    refreshEncounters,
  ]);

  const handleCopyCancel = () => {
    if (isSaving) return;
    setEncounterToCopy(null);
    setNewEncounterName('');
  };

  const renderContent = () => {
    if (!selectedCampaignId) return <NoCampaignSelectedState />;
    if (loading) return <LoadingState />;
    if (!encounters?.length) return <EmptyState />;

    return (
      <EncounterList
        encounters={encounters}
        campaigns={campaigns ?? undefined}
        adventures={adventures}
        players={players ?? undefined}
        isSaving={isSaving}
        isDeleting={isDeleting}
        encounterToDelete={encounterToDelete}
        onCopyClick={handleCopyClick}
        onDeleteClick={handleDeleteClick}
      />
    );
  };

  return (
    <div className="bg-base-200 min-h-full p-4 flex flex-col w-full max-w-2xl space-y-4 m-auto min-w-72">
      <EncounterPageHeader
        selectedCampaignId={selectedCampaignId}
        selectedAdventureId={selectedAdventureId}
        players={players ?? undefined}
        handleCampaignChange={handleCampaignChange}
        handleAdventureChange={handleAdventureChange}
        newEncounterUrl={newEncounterUrl}
      />
      <div className="w-full">{renderContent()}</div>
      <ConfirmationModal
        isOpen={!!encounterToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Encounter?"
        message={`Are you sure you want to delete the encounter "${encounters?.find((e) => e._id === encounterToDelete)?.name || 'this encounter'}"? This action cannot be undone.`}
        isProcessing={isDeleting}
      />
      <CopyConfirmationModal
        isOpen={!!encounterToCopy}
        onClose={handleCopyCancel}
        onConfirm={handleCopyConfirm}
        encounterName={encounterToCopy?.name}
        newEncounterName={newEncounterName}
        setNewEncounterName={setNewEncounterName}
        isSaving={isSaving}
      />
    </div>
  );
};

export default EncountersPage;
