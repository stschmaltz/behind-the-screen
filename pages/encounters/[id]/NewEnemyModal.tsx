import React from 'react';
import { Button } from '../../../components/Button';
import { FormInput } from '../../../components/FormInput';
import { EncounterCharacter } from '../../../types/encounters';
import { useModal } from '../../../hooks/use-modal';
import { generateMongoId } from '../../../lib/mongo';

interface Props {
  onAddEnemy: (enemy: EncounterCharacter) => void;
}

const INITIAL_ENEMY_STATE: EncounterCharacter = {
  name: '',
  maxHP: 0,
  armorClass: 0,
  _id: generateMongoId(),
};

const NewEnemyModal: React.FC<Props> = ({ onAddEnemy }) => {
  const [newEnemy, setNewEnemy] =
    React.useState<EncounterCharacter>(INITIAL_ENEMY_STATE);

  const handleSubmit = () => {
    onAddEnemy(newEnemy);
    setNewEnemy(INITIAL_ENEMY_STATE);
    closeModal();
  };
  const { showModal, closeModal } = useModal('new-enemy-modal');
  const handleChange = (
    field: keyof EncounterCharacter,
    value: string | number,
  ) => {
    setNewEnemy({
      ...newEnemy,
      [field]: value,
    });
  };

  return (
    <>
      <Button variant="primary" label="Add Enemy" onClick={showModal} />
      <dialog className="modal" id="new-enemy-modal">
        <div className="modal-box">
          <h2 className="text-2xl font-bold mb-4">Add New Enemy</h2>
          <FormInput
            label="Name"
            id="name"
            value={newEnemy.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <FormInput
            label="HP"
            id="health"
            type="number"
            value={newEnemy.maxHP}
            onChange={(e) => {
              const value = Number.parseInt(e.target.value);
              setNewEnemy({
                ...newEnemy,
                maxHP: value,
              });
            }}
          />
          <FormInput
            label="AC"
            id="armorClass"
            type="number"
            value={newEnemy.armorClass}
            onChange={(e) =>
              handleChange('armorClass', Number.parseInt(e.target.value))
            }
          />{' '}
          <div className="flex justify-end mt-4 gap-4">
            <Button
              variant="primary"
              label="Add Enemy"
              onClick={handleSubmit}
            />
            <Button variant="error" label="Cancel" onClick={closeModal} />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default NewEnemyModal;
