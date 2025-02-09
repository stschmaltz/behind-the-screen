// useEncounterTurnManagement.ts

import { InitiativeOrderCharacter, Encounter } from "../../types/encounters";

interface UseTurnManagementResult {
  currentCharacter: InitiativeOrderCharacter;
  sortedCharacters: InitiativeOrderCharacter[];
  handleNextTurn: () => void;
  handlePreviousTurn: () => void;
  handleUpdateCharacter: (character: InitiativeOrderCharacter) => void;
}

export const useEncounterTurnManagement = (
  encounter: Encounter,
  onSave: (encounter: Encounter) => void
): UseTurnManagementResult => {
  const sortedCharacters = [...encounter.initiativeOrder].sort(
    (a, b) => (b.initiative ?? 0) - (a.initiative ?? 0)
  );

  const updateEncounter = (turn: number, round: number) => {
    // Don't allow going before round 1, turn 1
 

    onSave({
      ...encounter,
      currentTurn: turn,
      currentRound: round
    });
  };

  const handleNextTurn = () => {
    const isLastTurn = encounter.currentTurn === sortedCharacters.length;
    updateEncounter(
      isLastTurn ? 1 : encounter.currentTurn + 1,
      isLastTurn ? encounter.currentRound + 1 : encounter.currentRound
    );
  };

  const handlePreviousTurn = () => {
    const isFirstRound = encounter.currentRound === 1;  
    const isFirstTurn = encounter.currentTurn === 1;
    if(isFirstTurn && isFirstRound) return

    const newTurn = isFirstTurn ? sortedCharacters.length : encounter.currentTurn - 1;
    const newRound = isFirstTurn ? Math.max(1, encounter.currentRound - 1) : encounter.currentRound;
    

    updateEncounter(
        newTurn,
        newRound
    );
  };

  const handleUpdateCharacter = (updatedCharacter: InitiativeOrderCharacter) => {
    onSave({
      ...encounter,
      initiativeOrder: encounter.initiativeOrder.map((char) =>
        char.name === updatedCharacter.name ? updatedCharacter : char
      ),
    });
  };

  const currentCharacter = sortedCharacters[(encounter.currentTurn ?? 1) - 1];

  return {
    currentCharacter,
    sortedCharacters,
    handleNextTurn,
    handlePreviousTurn,
    handleUpdateCharacter
  };
};