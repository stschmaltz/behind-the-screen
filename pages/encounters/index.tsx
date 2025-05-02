import Link from 'next/link';
import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PlayerManagementSection from './PlayerManagementSection';
import CampaignSelector from '../../components/selectors/CampaignSelector';
import AdventureSelector from '../../components/selectors/AdventureSelector';
import { getAllPlayers } from '../../hooks/get-all-players.hook';
import { getAllEncounters } from '../../hooks/encounter/get-all-encounters';
import { getAllCampaigns } from '../../hooks/campaign/get-all-campaigns';
import { getAllAdventures } from '../../hooks/adventure/get-all-adventures';
import { useUserPreferences } from '../../hooks/user-preferences/use-user-preferences';
import DescriptionDisplay from '../../components/DescriptionDisplay';
import { Encounter } from '../../types/encounters';
import EncounterDifficultyBadge from '../../components/EncounterDifficultyBadge';

const EncountersPage: NextPage = () => {
  const router = useRouter();
  const { activeCampaignId } = useUserPreferences();
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
  const { campaigns, loading: campaignsLoading } = getAllCampaigns();
  const { players, loading: playersLoading } = getAllPlayers();
  const { adventures, loading: adventuresLoading } = getAllAdventures({
    campaignId: selectedCampaignId,
  });

  const loadingState = (
    <div className="bg-base-100 flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );

  const emptyState = (
    <div className="flex items-center justify-center text-base-content opacity-80">
      No encounters found
    </div>
  );

  const noCampaignSelectedState = (
    <div className="flex flex-col items-center justify-center text-base-content opacity-80 p-8 bg-base-200 rounded-lg">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-12 h-12 mb-4 opacity-50"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
        />
      </svg>
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
        return 'badge-accent';
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

  return (
    <div className="bg-base-100 h-full p-4 flex flex-col items-center w-full max-w-2xl space-y-4 m-auto min-w-72">
      <div className="flex flex-col items-center max-w-[400px] w-full">
        <div className="w-full flex justify-between items-center mb-6 gap-4">
          <div className="flex flex-col w-96 max-w-[70%]">
            <CampaignSelector
              onCampaignChange={handleCampaignChange}
              selectedCampaignId={selectedCampaignId}
            />
          </div>

          <div className="flex flex-col items-center justify-end h-full ">
            <div className="mt-8">
              <Link href="/campaigns" className="btn btn-outline">
                <span className="hidden sm:inline">Manage Campaigns</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 sm:hidden"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {selectedCampaignId && (
          <div className="w-full flex flex-col mb-6 items-center ">
            <AdventureSelector
              campaignId={selectedCampaignId}
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

      {!selectedCampaignId ? (
        noCampaignSelectedState
      ) : loading ? (
        loadingState
      ) : !encounters?.length ? (
        emptyState
      ) : (
        <div className="flex w-full flex-col gap-6">
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
                  {encounters.filter((e) => e.status === 'active').length}{' '}
                  active encounters
                </div>
              )}
            </div>
          )}

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
                  {encounters.filter((e) => e.status === 'inactive').length}{' '}
                  ready encounters
                </div>
              )}
            </div>
          )}

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
      )}
    </div>
  );
};

export default EncountersPage;
