import React from 'react';
import { ConditionManager } from './ConditionManager';
import { CharacterHP } from './CharacterHP';
import { ArmorClassInput } from './ArmorClassInput';
import {
  Condition,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../../types/encounters';

export const MobileListLayout: React.FC<{
  character: InitiativeOrderCharacter;
  isCurrentTurn: boolean;
  isMonster: boolean;
  monsterData?: EncounterCharacter;
  modifierType: 'damage' | 'heal' | 'temp';
  modifierValue: string;
  setModifierType: (type: 'damage' | 'heal' | 'temp') => void;
  setModifierValue: (value: string) => void;
  onUpdateArmorClass: (value: number) => void;
  onApplyModifier: () => void;
  onAddCondition: (condition: Condition) => void;
  onRemoveCondition: (condition: Condition) => void;
  onViewStats?: () => void;
}> = ({
  character,
  isCurrentTurn,
  isMonster,
  modifierType,
  modifierValue,
  setModifierType,
  setModifierValue,
  onUpdateArmorClass,
  onApplyModifier,
  onAddCondition,
  onRemoveCondition,
  onViewStats,
}) => (
  <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-1 sm:hidden">
    <h3 className="text-lg font-bold flex items-center gap-2 flex-wrap w-full">
      <span>{character.name}</span>
      {isCurrentTurn && (
        <span className="badge badge-primary whitespace-nowrap">
          Current Turn
        </span>
      )}
    </h3>

    <div className="flex justify-between items-start w-full">
      <div className="mt-1 flex flex-col">
        <span className="text-sm text-base-content text-opacity-70">
          Initiative: {character.initiative}
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

      <div className="flex flex-col items-end gap-2">
        <ArmorClassInput
          id={`mobile-armorClass-${character._id}`}
          armorClass={character.armorClass}
          onChange={onUpdateArmorClass}
        />

        <CharacterHP
          currentHP={character.currentHP ?? 0}
          maxHP={character.maxHP}
          modifierType={modifierType}
          modifierValue={modifierValue}
          setModifierType={setModifierType}
          setModifierValue={setModifierValue}
          onApplyModifier={onApplyModifier}
        />

        <ConditionManager
          characterId={`mobile-${character._id}`}
          conditions={character.conditions ?? []}
          onAddCondition={onAddCondition}
          onRemoveCondition={onRemoveCondition}
        />
      </div>
    </div>
  </div>
);

export default MobileListLayout;
