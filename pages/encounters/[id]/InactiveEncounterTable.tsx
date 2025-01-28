import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { NewEnemyModal } from './NewEnemyModal';
import { AddPlayersModal } from './AddPlayersModal';
import { InactiveEncounterCharacterRow } from './InactiveEncounterCharacterRow';
import { useUnsavedChangesWarning } from '../../../hooks/use-unsaved-changes-warning';
import {
  Encounter,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../types/encounters';
import { Player } from '../../../types/player';

interface Props {
  encounter: Encounter;
  players: Player[];
}

const toInitiativeOrder = (
  character: Player | EncounterCharacter,
  type: 'player' | 'enemy' | 'npc',
): InitiativeOrderCharacter => ({
  _id: character._id,
  name: character.name,
  armorClass: character.armorClass,
  maxHP: character.maxHP,
  conditions: [],
  type,
});

const InactiveEncounterTable: React.FC<Props> = ({ encounter, players }) => {
  const [draftEncounter, setDraftEncounter] = useState(encounter);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useUnsavedChangesWarning(hasUnsavedChanges);

  const handleAddEnemy = (newEnemy: EncounterCharacter) => {
    setHasUnsavedChanges(true);
    setDraftEncounter((prev) => ({
      ...prev,
      enemies: [...prev.enemies, newEnemy],
      initiativeOrder: [
        ...prev.initiativeOrder,
        toInitiativeOrder(newEnemy, 'enemy'),
      ],
    }));
  };

  const handleAddPlayers = (selectedPlayers: Player[]) => {
    setHasUnsavedChanges(true);
    setDraftEncounter((prev) => ({
      ...prev,
      players: [
        ...prev.players,
        ...selectedPlayers.map((p) => ({ _id: p._id })),
      ],
      initiativeOrder: [
        ...prev.initiativeOrder,
        ...selectedPlayers.map((player) => toInitiativeOrder(player, 'player')),
      ],
    }));
  };

  const handleUpdateCharacter = (character: InitiativeOrderCharacter) => {
    setHasUnsavedChanges(true);
    setDraftEncounter((prev) => ({
      ...prev,
      initiativeOrder: prev.initiativeOrder.map((c) =>
        c._id === character._id ? character : c,
      ),
    }));
  };

  const handleDeleteCharacter = (characterName: string) => {
    setHasUnsavedChanges(true);
    setDraftEncounter((prev) => ({
      ...prev,
      initiativeOrder: prev.initiativeOrder.filter(
        (c) => c.name !== characterName,
      ),
      enemies: prev.enemies.filter((e) => e.name !== characterName),
    }));
  };

  useEffect(() => {
    const encounterPlayers = encounter.players
      .map(({ _id }) => players.find((player) => player._id === _id))
      .filter((player): player is Player => player !== undefined);

    const initiativeOrder =
      encounter.initiativeOrder.length > 0
        ? encounter.initiativeOrder
        : [
            ...encounter.enemies.map((enemy) =>
              toInitiativeOrder(enemy, 'enemy'),
            ),
            ...encounterPlayers.map((player) =>
              toInitiativeOrder(player, 'player'),
            ),
          ];

    setDraftEncounter({ ...encounter, initiativeOrder });
  }, [encounter, players]);

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
              onDelete={() => handleDeleteCharacter(character.name)}
              onUpdate={handleUpdateCharacter}
            />
          ))}
        </tbody>
      </table>
      <div className="flex mt-4 justify-end gap-4">
        <NewEnemyModal onAddEnemy={handleAddEnemy} />
        <AddPlayersModal onAddPlayers={handleAddPlayers} players={players} />
        <Button variant="primary" label="Start Encounter" />
      </div>
    </div>
  );
};

export { InactiveEncounterTable };
