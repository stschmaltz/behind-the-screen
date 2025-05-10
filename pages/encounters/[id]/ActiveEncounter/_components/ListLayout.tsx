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

export const ListLayout: React.FC<{
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
  onUpdateName?: (newName: string) => void;
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
  onUpdateName,
}) => (
  <div className=" flex flex-row  justify-between   items-start   gap-4">
    <div className="flex flex-col min-w-0 sm:flex-1">
      <CharacterInfo
        name={character.name}
        initiative={character.initiative}
        isCurrentTurn={isCurrentTurn}
        isMonster={isMonster}
        monsterData={monsterData}
        onViewStats={onViewStats}
        onUpdateName={onUpdateName}
      />
    </div>

    <div className="flex flex-col items-end gap-2 flex-shrink-0 sm:w-auto">
      <ConditionManager
        characterId={`desktop-${character._id}`}
        conditions={character.conditions ?? []}
        onAddCondition={onAddCondition}
        onRemoveCondition={onRemoveCondition}
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <ArmorClassInput
          id={`desktop-armorClass-${character._id}`}
          armorClass={character.armorClass}
          onChange={onUpdateArmorClass}
          width="w-[65px]"
        />
        <CharacterHP
          currentHP={character.currentHP ?? 0}
          maxHP={character.maxHP}
          tempHP={character.tempHP}
          modifierType={modifierType}
          modifierValue={modifierValue}
          setModifierType={setModifierType}
          setModifierValue={setModifierValue}
          onApplyModifier={onApplyModifier}
        />
      </div>
    </div>
  </div>
);

export default ListLayout;
