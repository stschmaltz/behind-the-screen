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
): InitiativeOrderCharacter => ({
  name: character.name,
  armorClass: character.armorClass,
  maxHP: character.maxHP,
  currentHP: character.currentHP,
  conditions: [],
});

const InactiveEncounterTable: React.FC<Props> = ({ encounter, players }) => {
  const [draftEncounter, setDraftEncounter] = React.useState(encounter);
  const handleAddEnemy = (newEnemy: EncounterCharacter) => {
    setDraftEncounter((prev) => ({
      ...prev,
      enemies: [...prev.enemies, newEnemy],
      initiativeOrder: [...prev.initiativeOrder, toInitiativeOrder(newEnemy)],
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
            ...encounter.enemies.map(toInitiativeOrder),
            ...encounterPlayers.map(toInitiativeOrder),
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
                ...players.map(toInitiativeOrder),
              ],
            }));
          }}
          players={players}
        />
        <Button variant="primary" label="Add Players" />
        <Button variant="primary" label="Add NPCs" />
        <Button variant="primary" label="Start Encounter" />
      </div>
    </div>
  );
};

export { InactiveEncounterTable };
