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
  onUpdateInitiative?: (value: number) => void;
}

export const CharacterInfo: React.FC<CharacterInfoProps> = ({
  name,
  initiative,
  isCurrentTurn,
  isMonster,
  onViewStats,
  onUpdateName,
  onUpdateInitiative,
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
      {onUpdateInitiative ? (
        <span className="text-sm text-base-content text-opacity-70 flex items-center gap-1 group">
          Initiative:
          <input
            type="number"
            value={initiative ?? ''}
            min={0}
            max={35}
            aria-label="Initiative"
            onChange={(e) => onUpdateInitiative(Number(e.target.value))}
            className="w-12 bg-transparent border-none outline-none text-base-content text-opacity-90 px-1 py-0 focus:bg-base-200/60 focus:shadow-inner rounded transition group-hover:bg-base-200/40 group-hover:shadow-inner"
            style={{ appearance: 'textfield' }}
          />
        </span>
      ) : (
        <span className="text-sm text-base-content text-opacity-70">
          Initiative: {initiative}
        </span>
      )}
      {onViewStats && <ViewStatsButton onClick={onViewStats} />}
    </div>
  </>
);

export default CharacterInfo;
