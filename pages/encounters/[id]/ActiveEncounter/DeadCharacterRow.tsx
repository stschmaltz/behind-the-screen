import React from 'react';
import { Button } from '../../../../components/ui/Button';
import {
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';

interface DeadCharacterRowProps {
  character: InitiativeOrderCharacter;
  monsterData?: EncounterCharacter;
  onRevive: () => void;
}

const DeadCharacterRow: React.FC<DeadCharacterRowProps> = ({
  character,
  monsterData,
  onRevive,
}) => {
  return (
    <div className="bg-base-300 p-2 rounded-lg flex justify-between items-center opacity-70">
      <div className="flex items-center gap-2">
        <span className="text-sm line-through">{character.name}</span>
        {character.type === 'enemy' && monsterData && (
          <span className="text-xs text-gray-500">
            ({character.initiative})
          </span>
        )}
      </div>
      <Button
        variant="success"
        label="Revive"
        className="btn-xs btn-outline"
        onClick={onRevive}
      />
    </div>
  );
};

export default DeadCharacterRow;
