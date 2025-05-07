import { useState } from 'react';
import EncounterCard from './EncounterCard';
import { Encounter } from '../../types/encounters';
import { Campaign } from '../../types/campaigns';
import { TransformedAdventure } from '../../hooks/adventure/get-all-adventures';
import { Player } from '../../types/player';

interface EncounterListProps {
  encounters: Encounter[];
  campaigns?: Campaign[];
  adventures?: TransformedAdventure[];
  players?: Player[];
  isSaving: boolean;
  isDeleting: boolean;
  encounterToDelete: string | null;
  onCopyClick: (encounter: Encounter) => void;
  onDeleteClick: (encounterId: string) => void;
}

const EncounterList = ({
  encounters,
  campaigns,
  adventures,
  players,
  isSaving,
  isDeleting,
  encounterToDelete,
  onCopyClick,
  onDeleteClick,
}: EncounterListProps) => {
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeEncounters = encounters.filter((e) => e.status === 'active');
  const inactiveEncounters = encounters.filter((e) => e.status === 'inactive');
  const completedEncounters = encounters.filter(
    (e) => e.status === 'completed',
  );

  const renderListSection = (
    title: string,
    badgeClass: string,
    filteredEncounters: Encounter[],
    showState: boolean,
    setShowState: (show: boolean) => void,
    sectionId?: string,
  ) => {
    if (filteredEncounters.length === 0) return null;

    return (
      <div className="w-full" id={sectionId}>
        <div className="flex justify-between items-center mb-2 border-b pb-2">
          <h2 className="text-xl font-semibold">
            {title}
            <span className={`ml-2 badge ${badgeClass}`}>
              {filteredEncounters.length}
            </span>
          </h2>
          <button
            className="btn btn-xs btn-ghost"
            onClick={() => setShowState(!showState)}
          >
            {showState ? 'Hide' : 'Show'}
          </button>
        </div>
        {showState ? (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredEncounters.map((encounter) => (
              <EncounterCard
                key={encounter._id.toString()}
                encounter={encounter}
                campaigns={campaigns}
                adventures={adventures}
                players={players}
                isSaving={isSaving}
                isDeleting={isDeleting}
                encounterToDelete={encounterToDelete}
                onCopyClick={onCopyClick}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic mt-1 mb-2">
            {filteredEncounters.length} {title.toLowerCase()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {renderListSection(
        'Active Encounters',
        'badge-accent',
        activeEncounters,
        showActive,
        setShowActive,
        'active-encounters',
      )}
      {renderListSection(
        'Ready Encounters',
        'badge-secondary',
        inactiveEncounters,
        showInactive,
        setShowInactive,
        'ready-encounters',
      )}
      {renderListSection(
        'Completed Encounters',
        'badge-ghost',
        completedEncounters,
        showCompleted,
        setShowCompleted,
        'completed-encounters',
      )}
    </div>
  );
};

export default EncounterList;
