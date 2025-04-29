import React from 'react';
import { ChangeEvent } from 'react';
import { MinusIcon } from '@heroicons/react/24/outline';
import { FormInput } from '../../../../components/FormInput';
import { Button } from '../../../../components/Button';
import {
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';
import MonsterDetailModal from '../MonsterDetailModal';

type Props = {
  character: InitiativeOrderCharacter;
  onDelete: () => void;
  onUpdate?: (character: InitiativeOrderCharacter) => void;
  monsterData?: EncounterCharacter;
};

const InactiveEncounterCharacterRow = ({
  character,
  onDelete,
  onUpdate,
  monsterData,
}: Props) => {
  const handleNumberChange = (
    field: keyof Omit<
      InitiativeOrderCharacter,
      'name' | '_id' | 'conditions' | 'type'
    >,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value =
      event.target.value === '' ? undefined : Number(event.target.value);
    onUpdate?.({
      ...character,
      [field]: value,
    });
  };

  const isMonster = character.type === 'enemy' && monsterData;

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-2 px-4">{character.name}</td>
      <td className="py-2 px-4">
        <FormInput
          type="number"
          value={character.initiative ?? ''}
          className="w-16"
          id={`initiative-${character.name}`}
          aria-label="Initiative"
          onChange={(e) => handleNumberChange('initiative', e)}
        />
      </td>
      <td className="py-2 px-4">
        <FormInput
          type="number"
          value={character.maxHP ?? ''}
          className="w-16"
          id={`maxHP-${character.name}`}
          aria-label="Maximum HP"
          onChange={(e) => {
            const maxHP = Number(e.target.value);
            onUpdate?.({
              ...character,
              maxHP,
              currentHP: Math.max(character.currentHP ?? maxHP, maxHP),
            });
          }}
        />
      </td>
      <td className="py-2 px-4">
        <FormInput
          type="number"
          value={character.armorClass ?? ''}
          className="w-16"
          id={`armorClass-${character.name}`}
          aria-label="Armor Class"
          onChange={(e) => handleNumberChange('armorClass', e)}
        />
      </td>
      <td className="py-2 px-4">
        <div className="flex justify-end gap-2 items-center">
          {isMonster && <MonsterDetailModal monster={monsterData} />}
          <Button
            variant="error"
            className="btn-square btn-sm"
            onClick={onDelete}
            tooltip="Remove Enemy"
            icon={<MinusIcon className="w-3 h-6 stroke-black" />}
          />
        </div>
      </td>
    </tr>
  );
};

export default InactiveEncounterCharacterRow;
