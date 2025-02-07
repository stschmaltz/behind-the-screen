import React, { ChangeEvent } from 'react';
import { EncounterCharacter } from '../../../types/encounters';
import { FormInput } from '../../../components/FormInput';
import { Button } from '../../../components/Button';
import { generateMongoId } from '../../../lib/mongo';

interface NewEnemiesSectionProps {
  enemies: EncounterCharacter[];
  onEnemiesChange: (updatedEnemies: EncounterCharacter[]) => void;
}

const NewEnemiesSection: React.FC<NewEnemiesSectionProps> = ({
  enemies,
  onEnemiesChange,
}) => {
  const handleEnemyFieldChange = (
    index: number,
    field: keyof EncounterCharacter,
    value: string | number,
  ) => {
    const updated = [...enemies];
    updated[index] = { ...updated[index], [field]: value };
    onEnemiesChange(updated);
  };

  const addEnemy = () => {
    onEnemiesChange([
      ...enemies,
      {
        name: '',
        maxHP: 0,
        armorClass: 0,
        _id: generateMongoId(),
      },
    ]);
  };

  const removeEnemy = (index: number) => {
    onEnemiesChange(enemies.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      <label className="label">Enemies</label>

      {enemies.map((enemy, index) => (
        <div key={index} className="mb-4 flex gap-2 items-end flex-wrap">
          <FormInput
            id={`enemy-name-${enemy._id}`}
            label="Name"
            value={enemy.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleEnemyFieldChange(index, 'name', e.target.value)
            }
            width="w-5/12"
          />
          <FormInput
            id={`enemy-maxHP-${enemy._id}`}
            label="HP"
            type="number"
            value={enemy.maxHP}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const val = Number(e.target.value);
              const updatedEnemies = [...enemies];
              updatedEnemies[index] = {
                ...updatedEnemies[index],
                maxHP: val,
              };
              onEnemiesChange(updatedEnemies);
            }}
          />

          <FormInput
            id={`enemy-armorClass-${enemy._id}`}
            label="AC"
            type="number"
            value={enemy.armorClass}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleEnemyFieldChange(
                index,
                'armorClass',
                Number(e.target.value),
              )
            }
          />

          <Button
            variant="error"
            label="Remove"
            onClick={() => removeEnemy(index)}
            className="btn-sm mb-2"
          />
        </div>
      ))}

      <Button
        variant="secondary"
        label="Add Enemy"
        onClick={addEnemy}
        className="btn-sm"
      />
    </div>
  );
};

export default NewEnemiesSection;
