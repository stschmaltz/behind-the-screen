import { ChangeEvent } from 'react';
import { FormInput } from '../../../../components/FormInput';
import { Button } from '../../../../components/Button';
import { InitiativeOrderCharacter } from '../../../../types/encounters';

type Props = {
  character: InitiativeOrderCharacter;
  onDelete: () => void;
  onUpdate?: (character: InitiativeOrderCharacter) => void;
};

const InactiveEncounterCharacterRow = ({
  character,
  onDelete,
  onUpdate,
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
      </td>
      <td className="py-2 px-4">
        <FormInput
          type="number"
          value={character.maxHP ?? ''}
          className="w-16"
          id={`maxHP-${character.name}`}
          aria-label="Maximum HP"
          onChange={(e) => {
            // update current and maxhp when maxhp changes
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
        <div className="flex justify-end">
          <Button
            variant="error"
            label="Delete"
            onClick={onDelete}
            aria-label={`Delete ${character.name}`}
          />
        </div>
      </td>
    </tr>
  );
};

export default InactiveEncounterCharacterRow;
