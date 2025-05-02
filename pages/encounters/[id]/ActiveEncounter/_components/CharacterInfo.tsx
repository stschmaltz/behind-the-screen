import React from 'react';
import { EncounterCharacter } from '../../../../../types/encounters';

export const CharacterInfo: React.FC<{
  name: string;
  initiative?: number;
  isCurrentTurn: boolean;
  isMonster: boolean;
  monsterData?: EncounterCharacter;
  onViewStats?: () => void;
}> = ({ name, initiative, isCurrentTurn, isMonster, onViewStats }) => (
  <>
    <h3 className="text-lg font-bold flex items-center gap-2 flex-wrap">
      <span>{name}</span>
      {isCurrentTurn && (
        <span className="badge badge-primary whitespace-nowrap">
          Current Turn
        </span>
      )}
    </h3>
    <div className="mt-1 flex flex-col">
      <span className="text-sm text-base-content text-opacity-70">
        Initiative: {initiative}
      </span>
      {isMonster && onViewStats && (
        <button
          onClick={onViewStats}
          className="btn btn-ghost btn-xs text-info p-0 h-auto justify-start mt-1 hover:bg-transparent"
          aria-label="View Stats"
        >
          View Stats
        </button>
      )}
    </div>
  </>
);

export default CharacterInfo;
