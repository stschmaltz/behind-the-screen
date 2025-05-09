import React, { ChangeEvent } from 'react';
import { DocumentDuplicateIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FormInput } from '../../../../components/ui/FormInput';
import { Button } from '../../../../components/ui/Button';
import {
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';
import ViewStatsButton from '../../../../components/ui/ViewStatsButton';

interface Props {
  character: InitiativeOrderCharacter;
  onDelete?: () => void;
  onUpdate?: (character: InitiativeOrderCharacter) => void;
  monsterData?: EncounterCharacter;
  onDuplicate?: () => void;
  onViewStats?: () => void;
}

const InactiveEncounterCharacterRow = ({
  character,
  onDelete,
  onUpdate,
  onDuplicate,
  onViewStats,
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
        {onViewStats && <ViewStatsButton onClick={onViewStats} />}
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
        <div className="flex justify-end gap-1 items-center">
          {onDuplicate && (
            <Button
              variant="secondary"
              className="btn-square btn-xs bg-opacity-30 hover:bg-opacity-80"
              onClick={onDuplicate}
              tooltip="Duplicate Character"
              icon={<DocumentDuplicateIcon className="w-4 h-4" />}
            />
          )}
          {onDelete && (
            <Button
              variant="secondary"
              className="btn-square btn-xs bg-error bg-opacity-20 hover:bg-error hover:bg-opacity-40"
              onClick={onDelete}
              tooltip="Remove Character"
              icon={<TrashIcon className="w-4 h-4 text-error" />}
            />
          )}
        </div>
      </td>
    </tr>
  );
};

export default InactiveEncounterCharacterRow;
