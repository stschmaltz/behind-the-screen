import {
  InitiativeOrderCharacter,
  Encounter,
  EncounterCharacter,
} from '../../types/encounters';
import { PlayerWithInitiative } from '../../types/player';
import type { Player } from '../../generated/graphql';

interface UseTurnManagementResult {
  currentCharacter: InitiativeOrderCharacter;
  sortedCharacters: InitiativeOrderCharacter[];
  deadCharacters: InitiativeOrderCharacter[];
  handleNextTurn: () => void;
  handlePreviousTurn: () => void;
  handleUpdateCharacter: (character: InitiativeOrderCharacter) => void;
  handleAddCharacterToActive: (
    character: EncounterCharacter,
    initiative: number,
    type: 'enemy' | 'npc',
  ) => void;
  handleAddPlayersToActive: (players: PlayerWithInitiative[]) => void;
}

export const useEncounterTurnManagement = (
  encounter: Encounter,
  onSave: (encounter: Encounter) => void,
): UseTurnManagementResult => {
  const aliveCharacters = encounter.initiativeOrder.filter(
    (character) => character.type !== 'enemy' || (character.currentHP ?? 0) > 0,
  );

  const sortedCharacters = [...aliveCharacters].sort(
    (a, b) => (b.initiative ?? 0) - (a.initiative ?? 0),
  );

  const deadCharacters = encounter.initiativeOrder
    .filter(
      (character) =>
        character.type === 'enemy' && (character.currentHP ?? 0) <= 0,
    )
    .sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));

  const updateEncounter = (turn: number, round: number) => {
    onSave({
      ...encounter,
      currentTurn: turn,
      currentRound: round,
    });
  };

  const handleNextTurn = () => {
    if (sortedCharacters.length === 0) return;

    const isLastTurn = encounter.currentTurn === sortedCharacters.length;
    updateEncounter(
      isLastTurn ? 1 : encounter.currentTurn + 1,
      isLastTurn ? encounter.currentRound + 1 : encounter.currentRound,
    );
  };

  const handlePreviousTurn = () => {
    if (sortedCharacters.length === 0) return;

    const isFirstRound = encounter.currentRound === 1;
    const isFirstTurn = encounter.currentTurn === 1;
    if (isFirstTurn && isFirstRound) return;

    const newTurn = isFirstTurn
      ? sortedCharacters.length
      : encounter.currentTurn - 1;
    const newRound = isFirstTurn
      ? Math.max(1, encounter.currentRound - 1)
      : encounter.currentRound;

    updateEncounter(newTurn, newRound);
  };

  const handleUpdateCharacter = (
    updatedCharacter: InitiativeOrderCharacter,
  ) => {
    onSave({
      ...encounter,
      initiativeOrder: encounter.initiativeOrder.map((char) =>
        char._id === updatedCharacter._id ? updatedCharacter : char,
      ),
    });
  };

  const handleAddCharacterToActive = (
    newCharacter: EncounterCharacter,
    initiative: number,
    type: 'enemy' | 'npc',
  ) => {
    const newInitiativeCharacter: InitiativeOrderCharacter = {
      _id: newCharacter._id,
      name: newCharacter.name,
      armorClass: newCharacter.armorClass,
      maxHP: newCharacter.maxHP,
      currentHP: newCharacter.maxHP,
      tempHP: 0,
      initiative: initiative,
      conditions: [],
      type: type,
    };

    const updatedEnemies = [...encounter.enemies];
    const updatedNpcs = [...(encounter.npcs || [])];

    if (type === 'enemy') {
      updatedEnemies.push(newCharacter);
    } else {
      updatedNpcs.push(newCharacter);
    }

    onSave({
      ...encounter,
      enemies: updatedEnemies,
      npcs: updatedNpcs,
      initiativeOrder: [...encounter.initiativeOrder, newInitiativeCharacter],
    });
  };

  const toInitiativeOrderPlayer = (
    player: Player,
    initiative: number,
  ): InitiativeOrderCharacter => ({
    _id: player._id,
    name: player.name,
    armorClass: player.armorClass ?? undefined,
    maxHP: player.maxHP ?? undefined,
    currentHP: player.maxHP ?? undefined,
    tempHP: 0,
    conditions: [],
    type: 'player',
    initiative: initiative,
  });

  const handleAddPlayersToActive = (
    selectedPlayers: PlayerWithInitiative[],
  ) => {
    const newPlayerInitiativeEntries = selectedPlayers.map(
      ({ player, initiative }) =>
        toInitiativeOrderPlayer(player, Number(initiative)),
    );

    onSave({
      ...encounter,
      players: [
        ...encounter.players,
        ...selectedPlayers.map(({ player }) => ({ _id: player._id })),
      ],
      initiativeOrder: [
        ...encounter.initiativeOrder,
        ...newPlayerInitiativeEntries,
      ],
    });
  };

  let currentTurnIndex = (encounter.currentTurn ?? 1) - 1;
  if (currentTurnIndex >= sortedCharacters.length) {
    currentTurnIndex = 0;
  }

  const currentCharacter =
    sortedCharacters.length > 0
      ? sortedCharacters[currentTurnIndex]
      : ({
          name: 'No active characters',
          _id: 'none',
          type: 'enemy',
          conditions: [],
        } as InitiativeOrderCharacter);

  return {
    currentCharacter,
    sortedCharacters,
    deadCharacters,
    handleNextTurn,
    handlePreviousTurn,
    handleUpdateCharacter,
    handleAddCharacterToActive,
    handleAddPlayersToActive,
  };
};
