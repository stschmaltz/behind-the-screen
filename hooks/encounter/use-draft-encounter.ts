import { useEffect, useState } from 'react';
import {
  Encounter,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../types/encounters';
import { Player } from '../../types/player';

export const useEncounterDraft = (
  encounter: Encounter,
  players: Player[],
  setHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void,
) => {
  const [draftEncounter, setDraftEncounter] = useState(encounter);

  const toInitiativeOrder = (
    character: Player | EncounterCharacter,
    type: 'player' | 'enemy' | 'npc',
  ): InitiativeOrderCharacter => ({
    _id: character._id,
    name: character.name,
    armorClass: character.armorClass,
    maxHP: character.maxHP,
    currentHP: character.maxHP,
    conditions: [],
    type,
  });

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

  const handleAddEnemy = (newEnemy: EncounterCharacter) => {
    setHasUnsavedChanges?.(true);
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
    setHasUnsavedChanges?.(true);
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
    setHasUnsavedChanges?.(true);
    setDraftEncounter((prev) => ({
      ...prev,
      initiativeOrder: prev.initiativeOrder.map((c) =>
        c._id === character._id ? character : c,
      ),
    }));
  };

  const handleDeleteCharacter = (characterName: string) => {
    setHasUnsavedChanges?.(true);
    setDraftEncounter((prev) => ({
      ...prev,
      initiativeOrder: prev.initiativeOrder.filter(
        (c) => c.name !== characterName,
      ),
      enemies: prev.enemies.filter((e) => e.name !== characterName),
    }));
  };

  return {
    draftEncounter,
    handleAddEnemy,
    handleAddPlayers,
    handleUpdateCharacter,
    handleDeleteCharacter,
  };
};
