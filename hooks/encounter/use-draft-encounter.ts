import { useEffect, useRef, useState } from 'react';
import {
  Encounter,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../types/encounters';
import type { Player } from '../../generated/graphql';

export const useEncounterDraft = (
  encounter: Encounter,
  players: Player[],
  setHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void,
) => {
  const [draftEncounter, setDraftEncounter] = useState(encounter);
  const hasLocalEdits = useRef(false);
  const lastEncounterId = useRef(encounter._id);
  const markEdited = () => {
    hasLocalEdits.current = true;
    setHasUnsavedChanges?.(true);
  };

  const toInitiativeOrder = (
    character: Player | EncounterCharacter,
    type: 'player' | 'enemy' | 'npc',
  ): InitiativeOrderCharacter => ({
    _id: character._id,
    name: character.name,
    armorClass: character.armorClass ?? undefined,
    maxHP: character.maxHP ?? undefined,
    currentHP: character.maxHP ?? undefined,
    tempHP: 0,
    conditions: [],
    type,
  });

  useEffect(() => {
    const isSameEncounter = lastEncounterId.current === encounter._id;
    lastEncounterId.current = encounter._id;

    if (isSameEncounter && hasLocalEdits.current) {
      setDraftEncounter((prev) => ({
        ...prev,
        name: encounter.name,
        description: encounter.description,
      }));

      return;
    }

    hasLocalEdits.current = false;

    if (encounter.initiativeOrder.length > 0) {
      setDraftEncounter(encounter);

      return;
    }

    const encounterPlayers = encounter.players
      .map(({ _id }) => players.find((player) => player._id === _id))
      .filter((player): player is Player => player !== undefined);

    const initiativeOrder = [
      ...encounter.enemies.map((enemy) => toInitiativeOrder(enemy, 'enemy')),
      ...(encounter.npcs ?? []).map((npc) => toInitiativeOrder(npc, 'npc')),
      ...encounterPlayers.map((player) => toInitiativeOrder(player, 'player')),
    ];

    setDraftEncounter({ ...encounter, initiativeOrder });
  }, [encounter, players]);

  const handleAddCharacter = (
    newCharacter: EncounterCharacter,
    type: 'enemy' | 'npc' | 'player',
  ) => {
    markEdited();
    setDraftEncounter((prev) => ({
      ...prev,
      enemies: type === 'npc' ? prev.enemies : [...prev.enemies, newCharacter],
      npcs: type === 'npc' ? [...(prev.npcs ?? []), newCharacter] : prev.npcs,
      initiativeOrder: [
        ...prev.initiativeOrder,
        toInitiativeOrder(newCharacter, type),
      ],
    }));
  };

  const handleAddPlayers = (
    selectedPlayers: import('../../types/player').PlayerWithInitiative[],
  ) => {
    markEdited();
    setDraftEncounter((prev) => {
      const newPlayers = selectedPlayers
        .map((sp) => sp.player)
        .filter(
          (selectedPlayer) =>
            !prev.players.some((p) => p._id === selectedPlayer._id),
        );

      if (newPlayers.length === 0) {
        return prev;
      }

      return {
        ...prev,
        players: [...prev.players, ...newPlayers.map((p) => ({ _id: p._id }))],
        initiativeOrder: [
          ...prev.initiativeOrder,
          ...selectedPlayers.map(({ player, initiative }) => ({
            _id: player._id,
            name: player.name,
            armorClass: player.armorClass ?? undefined,
            maxHP: player.maxHP ?? undefined,
            currentHP: player.maxHP ?? undefined,
            tempHP: 0,
            conditions: [],
            type: 'player' as const,
            initiative: initiative ? Number(initiative) : undefined,
          })),
        ],
      };
    });
  };

  const handleUpdateCharacter = (character: InitiativeOrderCharacter) => {
    markEdited();
    setDraftEncounter((prev) => ({
      ...prev,
      initiativeOrder: prev.initiativeOrder.map((c) =>
        c._id === character._id ? character : c,
      ),
    }));
  };

  const handleDeleteCharacter = (characterId: string) => {
    markEdited();
    setDraftEncounter((prev) => {
      const characterToDelete = prev.initiativeOrder.find(
        (c) => c._id === characterId,
      );

      if (!characterToDelete) {
        return prev;
      }

      const newState = {
        ...prev,
        initiativeOrder: prev.initiativeOrder.filter(
          (c) => c._id !== characterId,
        ),
      };

      if (characterToDelete.type !== 'player') {
        newState.enemies = prev.enemies.filter((e) => e._id !== characterId);
        newState.npcs = (prev.npcs ?? []).filter((n) => n._id !== characterId);
      }

      if (characterToDelete.type === 'player') {
        newState.players = prev.players.filter(
          (p) => p._id !== characterToDelete._id,
        );
      }

      return newState;
    });
  };

  return {
    draftEncounter,
    handleAddCharacter,
    handleAddPlayers,
    handleUpdateCharacter,
    handleDeleteCharacter,
  };
};
