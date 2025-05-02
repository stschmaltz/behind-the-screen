import React from 'react';
import { ConditionManager } from './ConditionManager';
import { CharacterHP } from './CharacterHP';
import { ArmorClassInput } from './ArmorClassInput';
import { CharacterInfo } from './CharacterInfo';
import {
  Condition,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../../types/encounters';

export const DesktopListLayout: React.FC<{
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
  monsterData,
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
  <div className="hidden sm:flex sm:flex-row sm:justify-between sm:items-start sm:gap-4">
    <div className="flex flex-col min-w-0 sm:flex-1">
      <CharacterInfo
        name={character.name}
        initiative={character.initiative}
        isCurrentTurn={isCurrentTurn}
        isMonster={isMonster}
        monsterData={monsterData}
        onViewStats={onViewStats}
      />
    </div>

    <div className="flex flex-col items-end gap-2 flex-shrink-0 sm:w-auto">
      <ArmorClassInput
        id={`desktop-armorClass-${character._id}`}
        armorClass={character.armorClass}
        onChange={onUpdateArmorClass}
        width="w-[65px]"
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
        characterId={`desktop-${character._id}`}
        conditions={character.conditions ?? []}
        onAddCondition={onAddCondition}
        onRemoveCondition={onRemoveCondition}
      />
    </div>
  </div>
);

export default DesktopListLayout;
