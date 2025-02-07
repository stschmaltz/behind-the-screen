import React, { useState } from 'react';
import ActiveEncounterCharacterRow from './ActiveEncounterCharacterRow';
import { Button } from '../../../../components/Button';
import { showDaisyToast } from '../../../../lib/daisy-toast';
import {
  Encounter,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';
import { Player } from '../../../../types/player';
import { useEncounterContext } from '../../../../context/EncounterContext';

const ActiveEncounterTable: React.FC<{
  players: Player[];
}> = ({ players: _ }) => {
  const { encounter, setEncounter } = useEncounterContext();
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  const sortedCharacters = [...encounter.initiativeOrder].sort(
    (a, b) => (b.initiative ?? 0) - (a.initiative ?? 0),
  );

  const onSave = (newEncounter: Encounter) => {
    setEncounter(newEncounter);
    // TODO: optimistic update, call mutation to update encounter
  };

  const handleNextTurn = () => {
    setCurrentTurnIndex((prev) => (prev + 1) % sortedCharacters.length);
    showDaisyToast(
      'info',
      `${sortedCharacters[(currentTurnIndex + 1) % sortedCharacters.length].name}'s turn`,
    );
  };

  const handlePreviousTurn = () => {
    setCurrentTurnIndex(
      (prev) => (prev - 1 + sortedCharacters.length) % sortedCharacters.length,
    );
    showDaisyToast(
      'info',
      `${sortedCharacters[(currentTurnIndex - 1 + sortedCharacters.length) % sortedCharacters.length].name}'s turn`,
    );
  };

  const handleUpdateCharacter = (
    updatedCharacter: InitiativeOrderCharacter,
  ) => {
    const newEncounter = {
      ...encounter,
      initiativeOrder: encounter.initiativeOrder.map((char) =>
        char.name === updatedCharacter.name ? updatedCharacter : char,
      ),
    };
    onSave(newEncounter);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Combat Round</h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            label="Previous Turn"
            onClick={handlePreviousTurn}
          />
          <Button
            variant="primary"
            label="Next Turn"
            onClick={handleNextTurn}
          />
        </div>
      </div>

      <div className="space-y-4">
        {sortedCharacters.map((character, index) => (
          <ActiveEncounterCharacterRow
            key={character.name}
            character={character}
            isCurrentTurn={index === currentTurnIndex}
            onUpdateCharacter={handleUpdateCharacter}
          />
        ))}
      </div>
    </div>
  );
};

export { ActiveEncounterTable };
