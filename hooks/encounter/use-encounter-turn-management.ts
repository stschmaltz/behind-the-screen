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
