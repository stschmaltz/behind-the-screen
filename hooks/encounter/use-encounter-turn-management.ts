import posthog from 'posthog-js';
import {
  InitiativeOrderCharacter,
  Encounter,
  EncounterCharacter,
} from '../../types/encounters';
import { PlayerWithInitiative } from '../../types/player';
import type { Player } from '../../generated/graphql';
import {
  getTurnIndex,
  getTurnOrder,
  resolveTurnAfterRosterChange,
} from '../../lib/encounterUtils';

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
  const sortedCharacters = getTurnOrder(encounter.initiativeOrder);
  const currentTurnIndex = getTurnIndex(
    encounter.currentTurn,
    sortedCharacters.length,
  );
  const currentTurnNumber = currentTurnIndex + 1;
  const currentRoundNumber = encounter.currentRound ?? 1;

  const saveWithRoster = (
    changes: Partial<Encounter> & {
      initiativeOrder: InitiativeOrderCharacter[];
    },
  ) => {
    onSave({
      ...encounter,
      ...changes,
      ...resolveTurnAfterRosterChange(
        encounter.initiativeOrder,
        changes.initiativeOrder,
        encounter.currentTurn,
        currentRoundNumber,
      ),
    });
  };

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

    const isLastTurn = currentTurnNumber >= sortedCharacters.length;
    const newTurn = isLastTurn ? 1 : currentTurnNumber + 1;
    const newRound = isLastTurn ? currentRoundNumber + 1 : currentRoundNumber;

    // Track turn advanced event
    posthog.capture('turn_advanced', {
      encounter_id: encounter._id,
      current_round: currentRoundNumber,
      new_round: newRound,
      is_new_round: isLastTurn,
      active_character_count: sortedCharacters.length,
    });

    updateEncounter(newTurn, newRound);
  };

  const handlePreviousTurn = () => {
    if (sortedCharacters.length === 0) return;

    const isFirstRound = currentRoundNumber <= 1;
    const isFirstTurn = currentTurnNumber === 1;
    if (isFirstTurn && isFirstRound) return;

    const newTurn = isFirstTurn
      ? sortedCharacters.length
      : currentTurnNumber - 1;
    const newRound = isFirstTurn
      ? Math.max(1, currentRoundNumber - 1)
      : currentRoundNumber;

    updateEncounter(newTurn, newRound);
  };

  const handleUpdateCharacter = (
    updatedCharacter: InitiativeOrderCharacter,
  ) => {
    saveWithRoster({
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

    saveWithRoster({
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

    saveWithRoster({
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
