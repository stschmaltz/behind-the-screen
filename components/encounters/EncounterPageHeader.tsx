import Link from 'next/link';
import CampaignSelector from '../selectors/CampaignSelector';
import AdventureSelector from '../selectors/AdventureSelector';
import PlayerManagementSection from '../../pages/encounters/PlayerManagementSection';
import { SettingsIcon } from '../icons';
import { Player } from '../../types/player';

interface EncounterPageHeaderProps {
  selectedCampaignId: string | undefined;
  selectedAdventureId: string | undefined;
  players: Player[] | undefined;
  handleCampaignChange: (id: string | undefined) => void;
  handleAdventureChange: (id: string | undefined) => void;
  newEncounterUrl: string;
}

const EncounterPageHeader = ({
  selectedCampaignId,
  selectedAdventureId,
  players,
  handleCampaignChange,
  handleAdventureChange,
  newEncounterUrl,
}: EncounterPageHeaderProps) => {
  return (
    <div className="flex flex-col w-full max-w-xl mx-auto">
      <div className="flex justify-end mb-2">
        <Link href="/campaigns">
          <button className="btn btn-sm btn-outline bg-neutral-content text-neutral">
            <span className="hidden sm:inline">Manage Campaigns</span>
            <SettingsIcon className="w-5 h-5 sm:hidden" />
          </button>
        </Link>
      </div>

      <div className="mb-4">
        <CampaignSelector
          onCampaignChange={handleCampaignChange}
          selectedCampaignId={selectedCampaignId}
        />
      </div>

      {selectedCampaignId && (
        <div className="w-full mb-4">
          <AdventureSelector
            selectedAdventureId={selectedAdventureId}
            onAdventureChange={handleAdventureChange}
          />
        </div>
      )}

      {selectedCampaignId && (
        <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full sm:w-auto">
            <PlayerManagementSection
              startingPlayers={players ?? []}
              campaignId={selectedCampaignId}
              buttonClassName="btn-primary btn w-full"
            />
          </div>

          <Link href={newEncounterUrl} className="w-full sm:w-auto">
            <button className="btn btn-primary w-full">New Encounter</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default EncounterPageHeader;
