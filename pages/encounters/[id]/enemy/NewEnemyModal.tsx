import React, { useRef, useState } from 'react';
import MonsterSelector from './MonsterSelector';
import BasicEnemyForm from './BasicEnemyForm';
import AdvancedEnemyForm from './AdvancedEnemyForm';
import { Button } from '../../../../components/Button';
import { EncounterCharacter } from '../../../../types/encounters';
import { useModal } from '../../../../hooks/use-modal';

interface Props {
  onAddCharacter: (
    character: EncounterCharacter,
    initiative: number | undefined,
    type: 'enemy' | 'npc',
  ) => void;
  requireInitiative?: boolean;
  className?: string;
  allowedCharacterTypes?: ('enemy' | 'npc')[];
}

const INITIAL_ENEMY_STATE: EncounterCharacter = {
  name: '',
  maxHP: 0,
  armorClass: 0,
  _id: '',
  stats: {
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  },
};

const NewEnemyModal: React.FC<Props> = ({
  onAddCharacter,
  requireInitiative,
  className,
  allowedCharacterTypes = ['enemy', 'npc'],
}) => {
  const [newEnemy, setNewEnemy] =
    useState<EncounterCharacter>(INITIAL_ENEMY_STATE);
  const [initiative, setInitiative] = useState<number | ''>('');
  const [selectedMonsterName, setSelectedMonsterName] = useState<string>('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [characterType, setCharacterType] = useState<'enemy' | 'npc'>(
    allowedCharacterTypes.includes('enemy') ? 'enemy' : 'npc',
  );

  const modalRef = useRef<HTMLDialogElement>(null);
  const defaultModal = useModal('new-enemy-modal');

  const showModal = () => {
    const activeElement = document.activeElement;
    modalRef.current?.showModal();

    if (activeElement instanceof HTMLElement) {
      setTimeout(() => {
        activeElement.focus();
      }, 50);
    }
  };

  const closeModal = () => {
    defaultModal.closeModal();
  };

  const handleStatUpdate = (enemy: EncounterCharacter) => {
    setNewEnemy(enemy);
  };

  const handleMonsterSelect = (
    monster: EncounterCharacter,
    monsterName: string,
  ) => {
    setNewEnemy(monster);
    setSelectedMonsterName(monsterName);
  };

  const handleSubmit = () => {
    if (
      !newEnemy.name ||
      newEnemy.maxHP <= 0 ||
      newEnemy.armorClass <= 0 ||
      (requireInitiative && (initiative === '' || isNaN(Number(initiative))))
    ) {
      alert(
        `Please select a monster or fill in all required fields (Name, HP > 0, AC > 0${requireInitiative ? ', Initiative' : ''}) with valid values.`,
      );

      return;
    }

    onAddCharacter(newEnemy, Number(initiative) || undefined, characterType);

    handleCloseActions();
  };

  const handleCloseActions = () => {
    setSelectedMonsterName('');
    setNewEnemy(INITIAL_ENEMY_STATE);
    setInitiative('');
    setIsAdvancedOpen(false);
    closeModal();
  };

  return (
    <>
      <Button
        variant="primary"
        label="Add Character"
        onClick={showModal}
        className={className}
      />
      <dialog ref={modalRef} className="modal" id="new-enemy-modal">
        <div className="modal-box">
          <h2 className="text-2xl font-bold mb-4">Add New Character</h2>

          <MonsterSelector
            onMonsterSelect={handleMonsterSelect}
            selectedMonsterName={selectedMonsterName}
          />

          <BasicEnemyForm
            enemy={newEnemy}
            onEnemyChange={handleStatUpdate}
            initiative={initiative}
            setInitiative={setInitiative}
            requireInitiative={requireInitiative}
          />

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Character Type</span>
            </label>
            <div className="flex gap-4">
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="character-type"
                  className="radio checked:bg-red-500"
                  value="enemy"
                  checked={characterType === 'enemy'}
                  onChange={() => setCharacterType('enemy')}
                  disabled={!allowedCharacterTypes.includes('enemy')}
                />
                <span className="label-text ml-2">Enemy</span>
              </label>
              {allowedCharacterTypes.includes('npc') && (
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="character-type"
                    className="radio checked:bg-blue-500"
                    value="npc"
                    checked={characterType === 'npc'}
                    onChange={() => setCharacterType('npc')}
                  />
                  <span className="label-text ml-2">NPC</span>
                </label>
              )}
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-200 mt-4">
            <input
              type="checkbox"
              checked={isAdvancedOpen}
              onChange={(e) => setIsAdvancedOpen(e.target.checked)}
            />
            <div className="collapse-title font-medium">
              Advanced Monster Fields
            </div>
            <div className="collapse-content">
              <AdvancedEnemyForm
                enemy={newEnemy}
                onEnemyChange={handleStatUpdate}
              />
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button
                className="btn btn-ghost mr-2"
                onClick={handleCloseActions}
              >
                Cancel
              </button>
            </form>
            <Button variant="primary" label="Add" onClick={handleSubmit} />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleCloseActions}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default NewEnemyModal;
