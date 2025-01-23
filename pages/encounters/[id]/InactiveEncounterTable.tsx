import React, { ChangeEvent, use, useEffect } from 'react';
import {
  Encounter,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../types/encounters';
import { Interface } from 'readline';
import FormInput from '../../../components/FormInput';
import InactiveEncounterCharacterRow from './InactiveEncounterCharacterRow';
import Button from '../../../components/Button';
import { Player } from '../../../types/player';

interface Props {
  encounter: Encounter;
  players: Player[];
}

const InactiveEncounterTable: React.FC<Props> = ({ encounter, players }) => {
  const [draftEncounter, setDraftEncounter] = React.useState(encounter);
  const handleAddEnemy = (enemy: EncounterCharacter) => {
    setDraftEncounter((prev) => ({
      ...prev,
      enemies: [...prev.enemies, enemy],
      initiativeOrder: [
        ...prev.initiativeOrder,
        {
          name: enemy.name,
          armorClass: enemy.armorClass,
          maxHP: enemy.maxHP,
          currentHP: enemy.currentHP,
          initiative: 0,
          conditions: [],
        },
      ],
    }));
  };
  useEffect(() => {
    const initiativeOrder =
      encounter.initiativeOrder.length > 0
        ? encounter.initiativeOrder
        : encounter.enemies.map(
            (enemy): InitiativeOrderCharacter => ({
              name: enemy.name,
              armorClass: enemy.armorClass,
              maxHP: enemy.maxHP,
              currentHP: enemy.currentHP,
              conditions: [],
            }),
          );
    const newEncounter = { ...encounter, initiativeOrder };

    setDraftEncounter(newEncounter);
  }, [encounter]);

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Initiative</th>
            <th>HP</th>
            <th>AC</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {draftEncounter.initiativeOrder.map((character) => (
            <InactiveEncounterCharacterRow
              key={character.name}
              character={character}
            />
          ))}
        </tbody>
      </table>
      <div className="flex mt-4 justify-end" style={{ gap: '1rem' }}>
        <NewEnemyModal onAddEnemy={handleAddEnemy} />

        <Button variant="primary" label="Add Players" />
        <Button variant="primary" label="Add NPCs" />
        <Button variant="primary" label="Start Encounter" />
      </div>
    </div>
  );
};

interface ModalProps {
  onAddEnemy: (enemy: EncounterCharacter) => void;
}

const NewEnemyModal: React.FC<ModalProps> = ({ onAddEnemy }) => {
  const [newEnemy, setNewEnemy] = React.useState<EncounterCharacter>({
    name: '',
    maxHP: 0,
    currentHP: 0,
    armorClass: 0,
    conditions: [],
  });

  return (
    <>
      <Button
        variant="primary"
        label="Add Enemy"
        onClick={() =>
          (
            document.getElementById('new-enemy-modal') as HTMLDialogElement
          ).showModal()
        }
      />
      <dialog className="modal" id="new-enemy-modal">
        <div className="modal-box">
          <h2 className="text-2xl font-bold mb-4">Add New Enemy</h2>
          <FormInput
            label="Name"
            id="name"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setNewEnemy({ ...newEnemy, name: e.target.value });
            }}
          />
          <FormInput
            label="HP"
            id="health"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setNewEnemy({
                ...newEnemy,
                maxHP: Number.parseInt(e.target.value),
                currentHP: Number.parseInt(e.target.value),
              });
            }}
            type="number"
          />
          <FormInput
            label="AC"
            id="armorClass"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setNewEnemy({
                ...newEnemy,
                armorClass: Number.parseInt(e.target.value),
              });
            }}
            type="number"
          />
          <div className="flex justify-end mt-4" style={{ gap: '1rem' }}>
            <Button
              variant="primary"
              label="Add Enemy"
              onClick={() => {
                onAddEnemy(newEnemy);
                setNewEnemy({
                  name: '',
                  maxHP: 0,
                  currentHP: 0,
                  armorClass: 0,
                  conditions: [],
                });
                (
                  document.getElementById(
                    'new-enemy-modal',
                  ) as HTMLDialogElement
                ).close();
              }}
            />
            <Button
              variant="error"
              label="Cancel"
              onClick={() => {
                (
                  document.getElementById(
                    'new-enemy-modal',
                  ) as HTMLDialogElement
                ).close();
              }}
            />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default InactiveEncounterTable;
