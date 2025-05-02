import Link from 'next/link';
import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PlayerManagementSection from './PlayerManagementSection';
import CampaignSelector from '../../components/selectors/CampaignSelector';
import AdventureSelector from '../../components/selectors/AdventureSelector';
import { getAllEncounters } from '../../hooks/encounter/get-all-encounters';
import { getAllAdventures } from '../../hooks/adventure/get-all-adventures';
import { useActiveCampaign } from '../../context/ActiveCampaignContext';
import DescriptionDisplay from '../../components/DescriptionDisplay';
import { Encounter } from '../../types/encounters';
import EncounterDifficultyBadge from '../../components/EncounterDifficultyBadge';
import { DocumentIcon, SettingsIcon } from '../../components/icons';

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
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const queryCampaignId = router.query.campaignId as string | undefined;
    const queryAdventureId = router.query.adventureId as string | undefined;

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
  }, [
    router.isReady,
    router.query.campaignId,
    router.query.adventureId,
    activeCampaignId,
    selectedCampaignId,
  ]);

  const { loading: encountersLoading, encounters } = getAllEncounters({
    campaignId: selectedCampaignId,
    adventureId: selectedAdventureId,
  });

  const { adventures, loading: adventuresLoading } = getAllAdventures({
    campaignId: selectedCampaignId,
  });

  const loadingState = (
    <div className="bg-base-100 flex items-center justify-center min-h-[40vh]">
      <p>Loading...</p>
    </div>
  );

  const emptyState = (
    <div className="flex items-center justify-center text-base-content opacity-80 min-h-[40vh]">
      No encounters found
    </div>
  );

  const noCampaignSelectedState = (
    <div className="flex flex-col items-center justify-center text-base-content opacity-80 p-8 bg-base-200 rounded-lg min-h-[40vh]">
      <DocumentIcon className="w-12 h-12 mb-4 opacity-50" />
      <p className="text-xl font-semibold mb-2">Select a Campaign</p>
      <p className="text-center">
        Please select a campaign to view its encounters.
      </p>
    </div>
  );

  const loading =
    encountersLoading ||
    playersLoading ||
    campaignsLoading ||
    adventuresLoading;

  const newEncounterParams = new URLSearchParams();
  if (selectedCampaignId) {
    newEncounterParams.append('campaignId', selectedCampaignId);
  }
  if (selectedAdventureId) {
    newEncounterParams.append('adventureId', selectedAdventureId);
  }
  const newEncounterUrl = `/encounters/new?${newEncounterParams.toString()}`;

  const handleCampaignChange = useCallback((id: string | undefined) => {
    setSelectedCampaignId(id);
    setSelectedAdventureId(undefined);
  }, []);

  const handleAdventureChange = useCallback((id: string | undefined) => {
    setSelectedAdventureId(id);
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-outline badge-success';
      case 'completed':
        return 'badge-ghost';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      default:
        return 'Inactive';
    }
  };

  const renderEncounterCard = (encounter: Encounter) => {
    const campaign = encounter.campaignId
      ? campaigns?.find((c) => c._id === encounter.campaignId.toString())
      : null;

    const adventure = encounter.adventureId
      ? adventures?.find((a) => a._id === encounter.adventureId?.toString())
      : null;

    const campaignPlayerLevels =
      players
        ?.filter((p) => p.campaignId === encounter.campaignId?.toString())
        .map((p) => p.level || 1) || [];

    return (
      <Link
        key={encounter._id.toString()}
        href={`/encounters/${encounter._id.toString()}`}
        className="block w-full"
      >
        <div className="p-4 bg-base-200 border border-base-300 rounded shadow-sm hover:bg-base-300 transition-colors">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold flex items-center gap-2">
              <span>{encounter.name}</span>
              <DescriptionDisplay
                encounterId={encounter._id.toString()}
                description={encounter.description}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm opacity-80">
                {encounter.createdAt.toLocaleString()}
              </div>
              <div className={`badge ${getStatusBadgeClass(encounter.status)}`}>
                {getStatusLabel(encounter.status)}
              </div>
            </div>
          </div>

          <div className="mt-2 flex gap-2 flex-wrap items-center">
            {encounter.campaignId && (
              <div className="badge badge-primary badge-outline badge-sm font-semibold">
                {campaign?.name || 'Campaign'}
              </div>
            )}
            {encounter.adventureId && (
              <div className="badge badge-secondary badge-outline badge-sm font-semibold">
                {adventure?.name || 'Adventure'}
              </div>
            )}
            {encounter.enemies?.length > 0 &&
              campaignPlayerLevels.length > 0 && (
                <EncounterDifficultyBadge
                  enemies={encounter.enemies}
                  playerLevels={campaignPlayerLevels}
                  className="badge-sm"
                />
              )}
          </div>
        </div>
      </Link>
    );
  };

  const renderContent = () => {
    if (!selectedCampaignId) {
      return noCampaignSelectedState;
    }

    if (loading) {
      return loadingState;
    }

    if (!encounters?.length) {
      return emptyState;
    }

    return (
      <div className="flex w-full flex-col gap-6">
        {/* Active encounters section */}
        {encounters.some((e) => e.status === 'active') && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
              <h2 className="text-xl font-semibold">
                Active Encounters
                <span className="ml-2 badge badge-accent">
                  {encounters.filter((e) => e.status === 'active').length}
                </span>
              </h2>
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => setShowActive(!showActive)}
              >
                {showActive ? 'Hide' : 'Show'}
              </button>
            </div>
            {showActive ? (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {encounters
                  .filter((encounter) => encounter.status === 'active')
                  .map(renderEncounterCard)}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic mt-1 mb-2">
                {encounters.filter((e) => e.status === 'active').length} active
                encounters
              </div>
            )}
          </div>
        )}

        {/* Inactive encounters section */}
        {encounters.some((e) => e.status === 'inactive') && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
              <h2 className="text-xl font-semibold">
                Ready Encounters
                <span className="ml-2 badge badge-secondary">
                  {encounters.filter((e) => e.status === 'inactive').length}
                </span>
              </h2>
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? 'Hide' : 'Show'}
              </button>
            </div>
            {showInactive ? (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {encounters
                  .filter((encounter) => encounter.status === 'inactive')
                  .map(renderEncounterCard)}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic mt-1 mb-2">
                {encounters.filter((e) => e.status === 'inactive').length} ready
                encounters
              </div>
            )}
          </div>
        )}

        {/* Completed encounters section */}
        {encounters.some((e) => e.status === 'completed') && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
              <h2 className="text-xl font-semibold">
                Completed Encounters
                <span className="ml-2 badge badge-ghost">
                  {encounters.filter((e) => e.status === 'completed').length}
                </span>
              </h2>
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? 'Hide' : 'Show'}
              </button>
            </div>
            {showCompleted ? (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {encounters
                  .filter((encounter) => encounter.status === 'completed')
                  .map(renderEncounterCard)}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic mt-1 mb-2">
                {encounters.filter((e) => e.status === 'completed').length}{' '}
                completed encounters
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-base-100 min-h-full p-4 flex flex-col w-full max-w-2xl space-y-4 m-auto min-w-72">
      <div className="flex flex-col items-center w-full max-w-[400px] mx-auto">
        <div className="w-full flex justify-between items-center mb-6 gap-4">
          <div className="flex flex-col w-96 max-w-[70%]">
            <CampaignSelector
              onCampaignChange={handleCampaignChange}
              selectedCampaignId={selectedCampaignId}
            />
          </div>

          <div className="flex flex-col items-center justify-end h-full">
            <div className="mt-8">
              <Link href="/campaigns" className="btn btn-outline">
                <span className="hidden sm:inline">Manage Campaigns</span>
                <SettingsIcon className="w-6 h-6 sm:hidden" />
              </Link>
            </div>
          </div>
        </div>

        {selectedCampaignId && (
          <div className="w-full flex flex-col mb-6 items-center">
            <AdventureSelector
              selectedAdventureId={selectedAdventureId}
              onAdventureChange={handleAdventureChange}
            />
          </div>
        )}

        {selectedCampaignId && (
          <div className="w-full flex justify-between items-center mb-8 gap-4">
            <PlayerManagementSection
              startingPlayers={players ?? []}
              campaignId={selectedCampaignId}
              buttonClassName="btn-primary btn"
            />

            <Link href={newEncounterUrl}>
              <button className="btn btn-primary">New Encounter</button>
            </Link>
          </div>
        )}
      </div>

      <div className="w-full">{renderContent()}</div>
    </div>
  );
};

export default EncountersPage;
