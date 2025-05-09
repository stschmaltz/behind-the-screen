import React from 'react';
import { EncounterCharacter } from '../../../../../types/encounters';
import ViewStatsButton from '../../../../../components/ui/ViewStatsButton';
import InlineEditableText from '../../../../../components/ui/InlineEditableText';

interface CharacterInfoProps {
  name: string;
  initiative?: number;
  isCurrentTurn: boolean;
  isMonster: boolean;
  monsterData?: EncounterCharacter;
  onViewStats?: () => void;
  onUpdateName?: (newName: string) => void;
}

export const CharacterInfo: React.FC<CharacterInfoProps> = ({
  name,
  initiative,
  isCurrentTurn,
  isMonster,
  onViewStats,
  onUpdateName,
}) => (
  <>
    <h3 className="text-lg font-bold flex items-center gap-2 flex-wrap">
      {isMonster && onUpdateName ? (
        <InlineEditableText
          initialValue={name}
          onSave={(newName) => {
            if (newName.trim() && newName !== name) {
              onUpdateName(newName);
            }
          }}
          inputClassName="input input-bordered input-sm w-full h-6 px-1 py-0"
          displayClassName="truncate max-w-[120px] sm:max-w-none font-medium cursor-pointer"
          ariaLabel="Edit enemy name"
        />
      ) : (
        <span>{name}</span>
      )}
      {isCurrentTurn && (
        <span className="badge badge-outline badge-primary whitespace-nowrap">
          Current Turn
        </span>
      )}
    </h3>
    <div className="mt-1 flex flex-col">
      <span className="text-sm text-base-content text-opacity-70">
        Initiative: {initiative}
      </span>
      {onViewStats && <ViewStatsButton onClick={onViewStats} />}
    </div>
  </>
);

export default CharacterInfo;
