import React, { ChangeEvent, useState } from 'react';
import { DocumentDuplicateIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FormInput } from '../../../../components/ui/FormInput';
import { Button } from '../../../../components/ui/Button';
import {
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';
import ViewStatsButton from '../../../../components/ui/ViewStatsButton';
import MonsterDetailModal from '../MonsterDetailModal';
import InlineEditableText from '../../../../components/ui/InlineEditableText';

interface Props {
  character: InitiativeOrderCharacter;
  onDelete?: () => void;
  onUpdate?: (character: InitiativeOrderCharacter) => void;
  monsterData?: EncounterCharacter;
  onDuplicate?: () => void;
}

const InactiveEncounterCharacterRow = ({
  character,
  onDelete,
  onUpdate,
  onDuplicate,
  monsterData,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleNumberChange = (
    field: keyof Omit<
      InitiativeOrderCharacter,
      'name' | '_id' | 'conditions' | 'type'
    >,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    let value =
      event.target.value === '' ? undefined : Number(event.target.value);
    if (field === 'initiative' && typeof value === 'number') {
      value = Math.min(Math.max(0, value), 35);
    }
    onUpdate?.({
      ...character,
      [field]: value,
    });
  };
  const openModal = () => setIsModalOpen(true);

  return (
    <>
      <MonsterDetailModal
        monster={monsterData}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <tr className="border-1 border-primary/30">
        <td className="min-w-[120px] max-w-[180px] sticky left-0 z-10 p-0 ">
          <div
            className={`flex flex-col rounded-md bg-base-100 py-1 min-h-12  justify-center px-4 ${
              monsterData ? 'my-1' : ''
            }`}
          >
            {monsterData ? (
              <InlineEditableText
                initialValue={character.name}
                onSave={(newName) => {
                  if (newName.trim() && newName !== character.name) {
                    onUpdate?.({ ...character, name: newName });
                  }
                }}
                inputClassName="input input-bordered input-sm w-full h-6 px-1 py-0"
                displayClassName="truncate w-full max-w-[120px] sm:max-w-none font-medium cursor-pointer"
                ariaLabel="Edit enemy name"
              />
            ) : (
              <span className="truncate w-full max-w-[120px] sm:max-w-none font-medium ">
                {character.name}
              </span>
            )}
            {monsterData && (
              <span className="w-fit mb">
                <ViewStatsButton onClick={openModal} />
              </span>
            )}
          </div>
        </td>
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
          <div className="flex gap-1 items-center justify-end sm:justify-end sm:items-center">
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
    </>
  );
};

export default InactiveEncounterCharacterRow;
