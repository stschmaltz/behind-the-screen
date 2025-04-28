import React from 'react';
import { EncounterCharacter } from '../../../../../types/encounters';
import MonsterDetailModal from '../../MonsterDetailModal';

export const CharacterInfo: React.FC<{
  name: string;
  initiative?: number;
  isCurrentTurn: boolean;
  isMonster: boolean;
  monsterData?: EncounterCharacter;
}> = ({ name, initiative, isCurrentTurn, isMonster, monsterData }) => (
  <>
    <h3 className="text-lg font-bold flex items-center gap-2 flex-wrap">
      <span>{name}</span>
      {isCurrentTurn && (
        <span className="badge badge-primary whitespace-nowrap">
          Current Turn
        </span>
      )}
    </h3>
    <div className="mt-1">
      <span className="text-sm text-base-content text-opacity-70">
        Initiative: {initiative}
      </span>
      {isMonster && monsterData && (
        <div className="mt-1 flex">
          <MonsterDetailModal monster={monsterData} />
        </div>
      )}
    </div>
  </>
);

export default CharacterInfo;
