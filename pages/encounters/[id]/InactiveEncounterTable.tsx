import React, { useEffect } from 'react';
import { InactiveEncounterCharacterRow } from './InactiveEncounterCharacterRow';
import { NewEnemyModal } from './NewEnemyModal';
import { AddPlayersModal } from './AddPlayersModal';
import {
  Encounter,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../types/encounters';
import { Button } from '../../../components/Button';
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
  const [draftEncounter, setDraftEncounter] = React.useState(encounter);
  const handleAddEnemy = (newEnemy: EncounterCharacter) => {
    setDraftEncounter((prev) => ({
      ...prev,
      enemies: [...prev.enemies, newEnemy],
      initiativeOrder: [
        ...prev.initiativeOrder,
        toInitiativeOrder(newEnemy, 'enemy'),
      ],
    }));
  };

  useEffect(() => {
    const encounterPlayers = encounter.players
      .map(({ _id }) => {
        return players.find((player) => player._id === _id);
      })
      .filter((player) => player !== undefined);

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

    const newEncounter = { ...encounter, initiativeOrder };

    setDraftEncounter(newEncounter);
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
              onDelete={() => {
                setDraftEncounter((prev) => ({
                  ...prev,
                  initiativeOrder: prev.initiativeOrder.filter(
                    (c) => c.name !== character.name,
                  ),
                  enemies: prev.enemies.filter(
                    (e) => e.name !== character.name,
                  ),
                }));
              }}
            />
          ))}
        </tbody>
      </table>
      <div className="flex mt-4 justify-end" style={{ gap: '1rem' }}>
        <NewEnemyModal onAddEnemy={handleAddEnemy} />
        <AddPlayersModal
          onAddPlayers={(players: Player[]) => {
            console.log(players);
            setDraftEncounter((prev) => ({
              ...prev,
              players: [
                ...prev.players,
                ...players.map((p) => ({ _id: p._id })),
              ],
              initiativeOrder: [
                ...prev.initiativeOrder,
                ...players.map((player) => toInitiativeOrder(player, 'player')),
              ],
            }));
          }}
          players={players}
        />
        {/* <Button variant="primary" label="Add NPCs" /> */}
        <Button variant="primary" label="Start Encounter" />
      </div>
    </div>
  );
};

export { InactiveEncounterTable };
