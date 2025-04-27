import React, { useState } from 'react';
import ActiveEncounterCharacterRow from './ActiveEncounterCharacterRow';
import { Button } from '../../../../components/Button';
import { Player } from '../../../../types/player';
import { useEncounterContext } from '../../../../context/EncounterContext';
import { showDaisyToast } from '../../../../lib/daisy-toast';
import { useEncounterTurnManagement } from '../../../../hooks/encounter/use-encounter-turn-management';
import {
  Encounter,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';

const DeadCharacterRow: React.FC<{
  character: InitiativeOrderCharacter;
  monsterData?: EncounterCharacter;
  onRevive: () => void;
}> = ({ character, monsterData, onRevive }) => {
  return (
    <div className="bg-base-300 p-2 rounded-lg flex justify-between items-center opacity-70">
      <div className="flex items-center gap-2">
        <span className="text-sm line-through">{character.name}</span>
        {character.type === 'enemy' && monsterData && (
          <span className="text-xs text-gray-500">
            ({character.initiative})
          </span>
        )}
      </div>
      <Button
        variant="secondary"
        label="Revive"
        className="btn-xs text-success"
        onClick={onRevive}
      />
    </div>
  );
};

const ActiveEncounterTable: React.FC<{
  players: Player[];
}> = ({ players: _ }) => {
  const { encounter, setEncounter, handleSave, isSaving } =
    useEncounterContext();
  const [showDeadPool, setShowDeadPool] = useState(true);

  const onSave = (newEncounter: Encounter) => {
    handleSave(newEncounter);
    setEncounter(newEncounter);

    if (newEncounter.currentTurn !== encounter.currentTurn) {
      const currentCharacter = newEncounter.initiativeOrder
        .sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0))
        .filter((char) => char.type !== 'enemy' || (char.currentHP ?? 0) > 0)[
        (newEncounter.currentTurn ?? 1) - 1
      ];

      if (currentCharacter) {
        showDaisyToast('info', `${currentCharacter.name}'s turn`);
      }
    }
  };

  const {
    currentCharacter,
    sortedCharacters,
    deadCharacters,
    handleNextTurn,
    handlePreviousTurn,
    handleUpdateCharacter,
  } = useEncounterTurnManagement(encounter, onSave);

  const getMonsterData = (
    characterId: string,
  ): EncounterCharacter | undefined => {
    return encounter.enemies.find((enemy) => enemy._id === characterId);
  };

  const handleReviveCharacter = (characterId: string) => {
    const characterToRevive = encounter.initiativeOrder.find(
      (char) => char._id === characterId,
    );

    if (characterToRevive) {
      const monsterData = getMonsterData(characterId);
      const maxHP = monsterData?.maxHP || characterToRevive.maxHP || 1;

      handleUpdateCharacter({
        ...characterToRevive,
        currentHP: 1,
        maxHP: maxHP,
      });

      showDaisyToast(
        'success',
        `${characterToRevive.name} has been revived with 1 HP!`,
      );
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <span className="badge badge-info">
            Round {encounter.currentRound ?? 1}
          </span>
          <span className="badge badge-info">Turn {encounter.currentTurn}</span>
          {isSaving && <span className="badge badge-warning">Saving...</span>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            label="Previous"
            className="btn-sm w-24"
            onClick={handlePreviousTurn}
            disabled={
              encounter.currentTurn === 1 && encounter.currentRound === 1
            }
          />
          <Button
            variant="primary"
            label="Next"
            className="btn-sm w-24"
            onClick={handleNextTurn}
          />
        </div>
      </div>

      <div className="space-y-2 w-full">
        {sortedCharacters.map((character) => (
          <ActiveEncounterCharacterRow
            key={character._id}
            character={character}
            isCurrentTurn={character._id === currentCharacter._id}
            onUpdateCharacter={handleUpdateCharacter}
            monsterData={
              character.type === 'enemy'
                ? getMonsterData(character._id)
                : undefined
            }
          />
        ))}
      </div>

      {deadCharacters.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="mr-2">☠️</span>
              Dead Pool
              <span className="ml-2 badge badge-sm">
                {deadCharacters.length}
              </span>
            </h3>
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => setShowDeadPool(!showDeadPool)}
            >
              {showDeadPool ? 'Hide' : 'Show'}
            </button>
          </div>

          {showDeadPool && (
            <div className="bg-base-200 rounded-lg p-3 space-y-2">
              {deadCharacters.map((character) => (
                <DeadCharacterRow
                  key={character._id}
                  character={character}
                  monsterData={
                    character.type === 'enemy'
                      ? getMonsterData(character._id)
                      : undefined
                  }
                  onRevive={() => handleReviveCharacter(character._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveEncounterTable;
