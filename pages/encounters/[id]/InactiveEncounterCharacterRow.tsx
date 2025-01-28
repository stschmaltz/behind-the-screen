import { ChangeEvent, useState } from 'react';
import { FormInput } from '../../../components/FormInput';
import { Button } from '../../../components/Button';

type Character = {
  name: string;
  armorClass?: number;
  maxHP?: number;
  currentHP?: number;
  initiative?: number;
};

type Props = {
  character: Character;
  onDelete: () => void;
  onUpdate?: (character: Character) => void;
};

const InactiveEncounterCharacterRow = ({
  character,
  onDelete,
  onUpdate,
}: Props) => {
  const [stats, setStats] = useState({
    name: character.name,
    armorClass: character.armorClass,
    maxHP: character.maxHP,
    initiative: character.initiative,
  });

  const handleNumberChange = (
    field: keyof Omit<typeof stats, 'name'>,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value =
      event.target.value === '' ? undefined : Number(event.target.value);
    const newStats = { ...stats, [field]: value };
    setStats(newStats);
    onUpdate?.({ ...newStats, currentHP: character.currentHP });
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-2 px-4">{stats.name}</td>
      <td className="py-2 px-4">
        <FormInput
          type="number"
          value={stats.initiative}
          className="w-16"
          id={`initiative-${stats.name}`}
          aria-label="Initiative"
          onChange={(e) => handleNumberChange('initiative', e)}
        />
      </td>
      <td className="py-2 px-4">
        <FormInput
          type="number"
          value={stats.maxHP ?? ''}
          className="w-16"
          id={`maxHP-${stats.name}`}
          aria-label="Maximum HP"
          onChange={(e) => handleNumberChange('maxHP', e)}
        />
      </td>
      <td className="py-2 px-4">
        <FormInput
          type="number"
          value={stats.armorClass ?? ''}
          className="w-16"
          id={`armorClass-${stats.name}`}
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
            aria-label={`Delete ${stats.name}`}
          />
        </div>
      </td>
    </tr>
  );
};

export { InactiveEncounterCharacterRow };
