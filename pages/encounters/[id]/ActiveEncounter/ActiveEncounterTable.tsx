import React from 'react';
import ActiveEncounterCharacterRow from './ActiveEncounterCharacterRow';
import { Button } from '../../../../components/Button';
import { Player } from '../../../../types/player';
import { useEncounterContext } from '../../../../context/EncounterContext';
import { useSaveEncounter } from '../../../../hooks/encounter/use-save-encounter';
import { showDaisyToast } from '../../../../lib/daisy-toast';
import { useEncounterTurnManagement } from '../../../../hooks/encounter/use-encounter-turn-management';
import { Encounter } from '../../../../types/encounters';

const ActiveEncounterTable: React.FC<{
  players: Player[];
}> = ({ players: _ }) => {
  const { encounter, setEncounter } = useEncounterContext();
  const { handleSave } = useSaveEncounter();

  const onSave = (newEncounter: Encounter) => {
    handleSave(newEncounter);
    setEncounter(newEncounter);
    // Show toast when turn changes
    if (newEncounter.currentTurn !== encounter.currentTurn) {
      const currentCharacter = newEncounter.initiativeOrder.sort(
        (a, b) => (b.initiative ?? 0) - (a.initiative ?? 0),
      )[(newEncounter.currentTurn ?? 1) - 1];
      showDaisyToast('info', `${currentCharacter.name}'s turn`);
    }
  };

  const {
    currentCharacter,
    sortedCharacters,
    handleNextTurn,
    handlePreviousTurn,
    handleUpdateCharacter,
  } = useEncounterTurnManagement(encounter, onSave);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="badge badge-info mr-2">
            Round {encounter.currentRound ?? 1}
          </span>
          <span className="badge badge-info">Turn {encounter.currentTurn}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            label="Previous Turn"
            onClick={handlePreviousTurn}
            disabled={
              encounter.currentTurn === 1 && encounter.currentRound === 1
            }
          />
          <Button
            variant="primary"
            label="Next Turn"
            onClick={handleNextTurn}
          />
        </div>
      </div>

      <div className="space-y-4">
        {sortedCharacters.map((character) => (
          <ActiveEncounterCharacterRow
            key={character.name}
            character={character}
            isCurrentTurn={character.name === currentCharacter.name}
            onUpdateCharacter={handleUpdateCharacter}
          />
        ))}
      </div>
    </div>
  );
};

export { ActiveEncounterTable };
