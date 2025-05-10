import React, { forwardRef, useState } from 'react';
import ListLayout from './_components/ListLayout';
import {
  Condition,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';
import MonsterDetailModal from '../MonsterDetailModal';

const ActiveEncounterCharacterRow = forwardRef<
  HTMLDivElement,
  {
    character: InitiativeOrderCharacter;
    isCurrentTurn: boolean;
    onUpdateCharacter: (character: InitiativeOrderCharacter) => void;
    monsterData?: EncounterCharacter;
    onPopoverVisibilityChange?: (isOpen: boolean) => void;
  }
>(
  (
    {
      character,
      isCurrentTurn,
      onUpdateCharacter,
      monsterData,
      onPopoverVisibilityChange,
    },
    ref,
  ) => {
    const [_, setPopoverOpen] = useState(false);
    const [modifierValue, setModifierValue] = useState<string>('');
    const [modifierType, setModifierType] = useState<
      'damage' | 'heal' | 'temp'
    >('damage');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isMonster = character.type === 'enemy' && Boolean(monsterData);
    const currentHP = character.currentHP ?? 0;

    const openModal = () => setIsModalOpen(true);

    const handleHealthApply = () => {
      const numValue = Number(modifierValue);
      if (isNaN(numValue) || numValue <= 0) return;

      let newHP = currentHP;
      let newTempHP = character.tempHP ?? 0;

      if (modifierType === 'damage') {
        let damage = numValue;
        if (newTempHP > 0) {
          if (damage >= newTempHP) {
            damage -= newTempHP;
            newTempHP = 0;
          } else {
            newTempHP -= damage;
            damage = 0;
          }
        }
        newHP = Math.max(0, newHP - damage);
      } else if (modifierType === 'heal') {
        if (character.maxHP !== undefined) {
          newHP = Math.min(character.maxHP, newHP + numValue);
        } else {
          newHP = newHP + numValue;
        }
      } else if (modifierType === 'temp') {
        if (numValue > newTempHP) {
          newTempHP = numValue;
        }
      }

      onUpdateCharacter({ ...character, currentHP: newHP, tempHP: newTempHP });
      setModifierValue('');
      setPopoverOpen(false);
      onPopoverVisibilityChange?.(false);
    };

    const handleUpdateArmorClass = (value: number) => {
      onUpdateCharacter({ ...character, armorClass: value });
    };

    const handleAddCondition = (condition: Condition) => {
      onUpdateCharacter({
        ...character,
        conditions: [...(character.conditions ?? []), condition],
      });
    };

    const handleRemoveCondition = (condition: Condition) => {
      onUpdateCharacter({
        ...character,
        conditions: (character.conditions ?? []).filter((c) => c !== condition),
      });
    };

    return (
      <div
        ref={ref}
        className={`card relative border-[1px] ${isCurrentTurn ? 'bg-primary bg-opacity-10 z-10 border-primary ' : 'bg-base-300/40'} shadow-sm mb-1`}
      >
        {
          <MonsterDetailModal
            monster={monsterData}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        }

        <div className="card-body p-4 ">
          <ListLayout
            character={character}
            isCurrentTurn={isCurrentTurn}
            isMonster={isMonster}
            monsterData={monsterData}
            modifierType={modifierType}
            modifierValue={modifierValue}
            setModifierType={setModifierType}
            setModifierValue={setModifierValue}
            onUpdateArmorClass={handleUpdateArmorClass}
            onApplyModifier={handleHealthApply}
            onAddCondition={handleAddCondition}
            onRemoveCondition={handleRemoveCondition}
            onViewStats={monsterData ? openModal : undefined}
          />
        </div>
      </div>
    );
  },
);

ActiveEncounterCharacterRow.displayName = 'ActiveEncounterCharacterRow';
export default ActiveEncounterCharacterRow;
