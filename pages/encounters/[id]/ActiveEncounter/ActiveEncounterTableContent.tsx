import React, { useEffect, useRef, useState } from 'react';
import ActiveEncounterCharacterRow from './ActiveEncounterCharacterRow';
import DeadCharacterRow from './DeadCharacterRow';
import { Button } from '../../../../components/ui/Button';
import type { Player } from '../../../../generated/graphql';
import { useEncounterContext } from '../../../../context/EncounterContext';
import { showDaisyToast } from '../../../../lib/daisy-toast';
import { useEncounterTurnManagement } from '../../../../hooks/encounter/use-encounter-turn-management';
import { Encounter, EncounterCharacter } from '../../../../types/encounters';
import { usePopoverContext } from '../../../../context/PopoverContext';
import NewEnemyModal from '../enemy/NewEnemyModal';
import AddPlayersModal from '../AddPlayersModal';

interface ActiveEncounterTableContentProps {
  players: Player[];
}

const ActiveEncounterTableContent: React.FC<
  ActiveEncounterTableContentProps
> = ({ players: _ }) => {
  const { encounter, setEncounter, handleSave } = useEncounterContext();
  const { isScrollLockActive } = usePopoverContext();
  const [showDeadPool, setShowDeadPool] = useState(false);
  const scrollableListRef = useRef<HTMLDivElement>(null);
  const characterRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const listElement = scrollableListRef.current;
    const preventDefault = (e: WheelEvent | TouchEvent) => e.preventDefault();

    if (isScrollLockActive) {
      window.addEventListener('wheel', preventDefault, { passive: false });
      window.addEventListener('touchmove', preventDefault, { passive: false });
      listElement?.addEventListener('wheel', preventDefault, {
        passive: false,
      });
      listElement?.addEventListener('touchmove', preventDefault, {
        passive: false,
      });
    }

    return () => {
      window.removeEventListener('wheel', preventDefault);
      window.removeEventListener('touchmove', preventDefault);
      listElement?.removeEventListener('wheel', preventDefault);
      listElement?.removeEventListener('touchmove', preventDefault);
    };
  }, [isScrollLockActive]);

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
        showDaisyToast('success', `${currentCharacter.name}'s turn`);
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
    handleAddCharacterToActive,
    handleAddPlayersToActive,
  } = useEncounterTurnManagement(encounter, onSave);

  useEffect(() => {
    if (currentCharacter && characterRowRefs.current[currentCharacter._id]) {
      characterRowRefs.current[currentCharacter._id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentCharacter, currentCharacter?._id]);

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
    <div className="w-full max-w-full flex flex-col ">
      <div className="flex flex-col-reverse sm:flex-row gap-6 mb-2 w-full items-center justify-center rounded-lg p-2 border border-base-300  bg-base-100">
        <div className="flex flex-col items-center gap-2 w-full mt-2 md:mt-0 sm:w-1/2 ">
          <div className="flex flex-wrap gap-2 justify-center items-center mb-2">
            <span className="badge  badge-outline">
              Round {encounter.currentRound ?? 1}
            </span>
            <span className="badge  badge-outline">
              Turn {encounter.currentTurn}
            </span>
          </div>
          <div className="flex flex-row gap-2 w-full">
            <Button
              variant="secondary"
              label="Previous"
              className="btn-sm w-full flex-1 disabled:bg-secondary/25"
              onClick={handlePreviousTurn}
              disabled={
                encounter.currentTurn === 1 && encounter.currentRound === 1
              }
            />
            <Button
              variant="primary"
              label="Next"
              className="btn-sm w-full flex-1"
              onClick={handleNextTurn}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-1/4 ml-4">
          <div className="w-full flex-1">
            <NewEnemyModal
              onAddCharacter={(character, initiative, type) => {
                if (initiative !== undefined) {
                  handleAddCharacterToActive(character, initiative, type);
                }
              }}
              requireInitiative={true}
              className="btn-sm w-full"
              buttonVariant="accent"
            />
          </div>
          <div className="w-full flex-1">
            <AddPlayersModal
              onAddPlayers={(playersWithInitiative) => {
                handleAddPlayersToActive(playersWithInitiative);
              }}
              players={_}
              selectedCampaignId={encounter.campaignId.toString()}
              currentPlayerIds={encounter.players.map((p) => p._id)}
              className="btn-sm w-full"
              buttonVariant="accent"
              requireInitiative={true}
            />
          </div>
        </div>
      </div>

      <div
        ref={scrollableListRef}
        className={`relative  h-full max-h-[60vh] sm:max-h-[70vh] mb-4 overflow-y-auto`}
      >
        <div className="space-y-2 w-full bg-base-100 rounded-lg p-2 border border-base-300">
          {sortedCharacters.map((character) => (
            <ActiveEncounterCharacterRow
              key={character._id}
              ref={(el) => {
                characterRowRefs.current[character._id] = el;
              }}
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
      </div>

      {deadCharacters.length > 0 && (
        <div className="mt-6 p-4 bg-base-200 rounded-lg border border-base-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold flex items-center">
              <span className="mr-2">☠️</span>
              Dead Pool
              <span className="ml-2 badge badge-sm badge-error">
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

          {showDeadPool ? (
            <div className="space-y-2 mt-3">
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
          ) : (
            <div className="text-sm text-gray-500 italic mt-1">
              {deadCharacters.length} characters are in the dead pool
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveEncounterTableContent;
