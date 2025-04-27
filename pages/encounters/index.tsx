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
    if (selectedCampaignId) return;

    const queryCampaignId = router.query.selectedCampaign as string | undefined;

    if (queryCampaignId) {
      setSelectedCampaignId(queryCampaignId);
    } else if (activeCampaignId) {
      setSelectedCampaignId(activeCampaignId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCampaignId, router.query.selectedCampaign]);

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

          {(encounter.campaignId || encounter.adventureId) && (
            <div className="mt-2 flex gap-2">
              {encounter.campaignId && (
                <div className="badge badge-outline">
                  {campaign?.name || 'Campaign'}
                </div>
              )}
              {encounter.adventureId && (
                <div className="badge badge-outline">
                  {adventure?.name || 'Adventure'}
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-base-100 h-full p-4 flex flex-col items-center w-full max-w-2xl space-y-4 m-auto min-w-72">
      <h1 className="text-2xl font-bold mb-2">Encounters</h1>

      <CampaignSelector
        onCampaignChange={handleCampaignChange}
        selectedCampaignId={selectedCampaignId}
      />

      {selectedCampaignId && (
        <AdventureSelector
          campaignId={selectedCampaignId}
          selectedAdventureId={selectedAdventureId}
          onAdventureChange={handleAdventureChange}
        />
      )}

      {selectedCampaignId && (
        <div className="flex w-full justify-between items-center mb-4">
          <div className="flex gap-2">
            <PlayerManagementSection
              startingPlayers={players ?? []}
              campaignId={selectedCampaignId}
            />
          </div>

          <Link href={newEncounterUrl}>
            <button className="btn btn-primary">New Encounter</button>
          </Link>
        </div>
      )}

      {!selectedCampaignId ? (
        noCampaignSelectedState
      ) : loading ? (
        loadingState
      ) : !encounters?.length ? (
        emptyState
      ) : (
        <div className="flex w-full flex-col gap-6">
          {/* Active Encounters */}
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

          {/* Inactive Encounters */}
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

          {/* Completed Encounters */}
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
