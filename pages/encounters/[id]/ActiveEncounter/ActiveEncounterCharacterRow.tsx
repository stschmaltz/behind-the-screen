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

      const applyDamage = (hp: number, temp: number, dmg: number) => {
        if (temp > 0) {
          if (dmg >= temp) {
            dmg -= temp;
            temp = 0;
          } else {
            temp -= dmg;
            dmg = 0;
          }
        }

        return { hp: Math.max(0, hp - dmg), temp };
      };

      const applyHeal = (hp: number, heal: number, max?: number) =>
        max !== undefined ? Math.min(max, hp + heal) : hp + heal;

      const applyTemp = (temp: number, value: number) =>
        value > temp ? value : temp;

      switch (modifierType) {
        case 'damage': {
          const result = applyDamage(newHP, newTempHP, numValue);
          newHP = result.hp;
          newTempHP = result.temp;
          break;
        }
        case 'heal':
          newHP = applyHeal(newHP, numValue, character.maxHP);
          break;
        case 'temp':
          newTempHP = applyTemp(newTempHP, numValue);
          break;
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

    const handleInitiativeChange = (value: number) => {
      const clamped = Math.min(Math.max(0, value), 35);
      onUpdateCharacter({ ...character, initiative: clamped });
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
            onUpdateInitiative={handleInitiativeChange}
          />
        </div>
      </div>
    );
  },
);

ActiveEncounterCharacterRow.displayName = 'ActiveEncounterCharacterRow';
export default ActiveEncounterCharacterRow;
