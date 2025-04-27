// useEncounterTurnManagement.ts

import { InitiativeOrderCharacter, Encounter } from '../../types/encounters';

interface UseTurnManagementResult {
  currentCharacter: InitiativeOrderCharacter;
  sortedCharacters: InitiativeOrderCharacter[];
  deadCharacters: InitiativeOrderCharacter[];
  handleNextTurn: () => void;
  handlePreviousTurn: () => void;
  handleUpdateCharacter: (character: InitiativeOrderCharacter) => void;
}

export const useEncounterTurnManagement = (
  encounter: Encounter,
  onSave: (encounter: Encounter) => void,
): UseTurnManagementResult => {
  // Filter out dead enemy characters (currentHP <= 0)
  // Only filter enemies - players and NPCs stay in rotation even when down
  const aliveCharacters = encounter.initiativeOrder.filter(
    (character) => character.type !== 'enemy' || (character.currentHP ?? 0) > 0,
  );

  // Sort living characters by initiative
  const sortedCharacters = [...aliveCharacters].sort(
    (a, b) => (b.initiative ?? 0) - (a.initiative ?? 0),
  );

  // Get dead characters for the "dead pool"
  const deadCharacters = encounter.initiativeOrder
    .filter(
      (character) =>
        character.type === 'enemy' && (character.currentHP ?? 0) <= 0,
    )
    .sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));

  const updateEncounter = (turn: number, round: number) => {
    // Don't allow going before round 1, turn 1
    onSave({
      ...encounter,
      currentTurn: turn,
      currentRound: round,
    });
  };

  const handleNextTurn = () => {
    // If no characters are alive, don't advance the turn
    if (sortedCharacters.length === 0) return;

    const isLastTurn = encounter.currentTurn === sortedCharacters.length;
    updateEncounter(
      isLastTurn ? 1 : encounter.currentTurn + 1,
      isLastTurn ? encounter.currentRound + 1 : encounter.currentRound,
    );
  };

  const handlePreviousTurn = () => {
    // If no characters are alive, don't go to previous turn
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

  // Ensure current turn is valid with our filtered list
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
  };
};
