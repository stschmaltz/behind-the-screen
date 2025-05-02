import React, { useState } from 'react';
import InactiveEncounterCharacterRow from './InactiveEncounterCharacterRow';
import NewEnemyModal from '../enemy/NewEnemyModal';
import AddPlayersModal from '../AddPlayersModal';
import { useEncounterDraft } from '../../../../hooks/encounter/use-draft-encounter';
import { Button } from '../../../../components/Button';
import { useUnsavedChangesWarning } from '../../../../hooks/use-unsaved-changes-warning';
import {
  Encounter,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';
import { Player } from '../../../../types/player';
import { showDaisyToast } from '../../../../lib/daisy-toast';
import { useEncounterContext } from '../../../../context/EncounterContext';
import { getAbilityModifier, rollInitiative } from '../../../../lib/random';
import CondensedDifficultyCalculator from '../../../../components/CondensedDifficultyCalculator';
import { logger } from '../../../../lib/logger';

interface Props {
  encounter: Encounter;
  players: Player[];
}

const InactiveEncounterTable: React.FC<Props> = ({ players }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { encounter, setEncounter, handleSave, isSaving } =
    useEncounterContext();
  const {
    draftEncounter,
    handleAddCharacter,
    handleAddPlayers,
    handleUpdateCharacter,
    handleDeleteCharacter,
  } = useEncounterDraft(encounter, players, setHasUnsavedChanges);

  const onSave = async () => {
    const success = await handleSave(draftEncounter);
    if (success) {
      setHasUnsavedChanges(false);
      showDaisyToast('success', 'Encounter saved');
    } else {
      showDaisyToast('error', 'Failed to save encounter');
    }
  };

  useUnsavedChangesWarning(hasUnsavedChanges);

  const rollEnemyInitiatives = () => {
    const rolledInitiatives: {
      name: string;
      roll: number;
      previous?: number;
    }[] = [];
    const isReroll = enemiesWithoutInitiative === 0;

    const updatedInitiativeOrder = draftEncounter.initiativeOrder.map(
      (character) => {
        if (
          character.type === 'enemy' &&
          (character.initiative === undefined || isReroll)
        ) {
          const monsterData = draftEncounter.enemies.find(
            (enemy) => enemy._id === character._id,
          );

          const dexModifier = monsterData?.stats
            ? getAbilityModifier(monsterData.stats.DEX)
            : 0;

          const initiativeRoll = rollInitiative(dexModifier);

          rolledInitiatives.push({
            name: character.name,
            roll: initiativeRoll,
            previous: character.initiative,
          });

          return {
            ...character,
            initiative: initiativeRoll,
          };
        }

        return character;
      },
    );

    handleUpdateInitiativeOrder(updatedInitiativeOrder);

    if (rolledInitiatives.length > 0) {
      const initiativeMessage = rolledInitiatives
        .map((item) => {
          if (item.previous !== undefined) {
            return `${item.name}: ${item.previous} → ${item.roll}`;
          }

          return `${item.name}: ${item.roll}`;
        })
        .join(', ');

      showDaisyToast(
        'info',
        isReroll
          ? `Re-rolled initiative: ${initiativeMessage}`
          : `Rolled initiative: ${initiativeMessage}`,
      );
    } else {
      showDaisyToast('info', 'No enemies to roll initiative for');
    }

    setHasUnsavedChanges(true);
  };

  const handleUpdateInitiativeOrder = (
    newOrder: InitiativeOrderCharacter[],
  ) => {
    newOrder.forEach((character) => {
      const existingCharacter = draftEncounter.initiativeOrder.find(
        (c) => c._id === character._id,
      );

      if (
        existingCharacter &&
        character.initiative !== existingCharacter.initiative
      ) {
        handleUpdateCharacter(character);
      }
    });
  };

  const startEncounter = async () => {
    const updatedEncounter = {
      ...draftEncounter,
      status: 'active' as const,
    };

    const success = await handleSave(updatedEncounter);
    if (success) {
      showDaisyToast('success', 'Encounter started');
      setEncounter(updatedEncounter);
    } else {
      showDaisyToast('error', 'Failed to start encounter');
    }
  };

  const getMonsterData = (
    characterId: string,
  ): EncounterCharacter | undefined => {
    return (
      draftEncounter.enemies.find((enemy) => enemy._id === characterId) ||
      draftEncounter.npcs?.find((npc) => npc._id === characterId)
    );
  };

  const handleDuplicateCharacter = (
    characterToDuplicate: InitiativeOrderCharacter,
  ) => {
    const fullCharacterData = getMonsterData(characterToDuplicate._id);
    if (!fullCharacterData) {
      logger.error(
        'Could not find full data for character:',
        characterToDuplicate.name,
      );
      showDaisyToast('error', 'Could not duplicate character: data not found.');

      return;
    }

    handleAddCharacter(
      fullCharacterData,
      characterToDuplicate.type === 'npc' ? 'npc' : 'enemy',
    );
    showDaisyToast('success', `Duplicated ${characterToDuplicate.name}`);
  };

  const isAllInitiativeSet = draftEncounter.initiativeOrder.every(
    (character) => character.initiative !== undefined,
  );

  const enemiesWithoutInitiative = draftEncounter.initiativeOrder.filter(
    (character) =>
      character.type === 'enemy' && character.initiative === undefined,
  ).length;

  const totalEnemies = draftEncounter.initiativeOrder.filter(
    (character) => character.type === 'enemy',
  ).length;

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="flex justify-between mb-2">
          <h3 className="text-lg font-semibold">Initiative Order</h3>
          <div className="flex gap-2">
            <span className="badge badge-outline whitespace-nowrap">
              Players:{' '}
              {
                draftEncounter.initiativeOrder.filter((c) => c.type !== 'enemy')
                  .length
              }
            </span>
            <span className="badge badge-outline whitespace-nowrap">
              Enemies: {totalEnemies}
            </span>
          </div>
        </div>

        <div className="bg-base-100 p-2 rounded-md mb-3">
          <CondensedDifficultyCalculator
            enemies={draftEncounter.enemies}
            encounterPlayers={draftEncounter.initiativeOrder.filter(
              (c) => c.type === 'player',
            )}
            players={players}
            className="w-full"
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Initiative</th>
              <th>HP</th>
              <th>AC</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {draftEncounter.initiativeOrder.map((character) => (
              <InactiveEncounterCharacterRow
                key={character._id}
                character={character}
                onDelete={() => handleDeleteCharacter(character._id)}
                onUpdate={handleUpdateCharacter}
                onDuplicate={() => handleDuplicateCharacter(character)}
                monsterData={getMonsterData(character._id)}
              />
            ))}
          </tbody>
        </table>
        {!isAllInitiativeSet && (
          <div className="mt-2 flex flex-col items-end">
            <p className="text-red-500 text-sm text-right">
              Not all characters have initiative set
            </p>
            {totalEnemies > 0 && (
              <button
                onClick={rollEnemyInitiatives}
                className="btn btn-sm btn-ghost flex items-center gap-1 mt-1"
                title="Roll initiative for all enemies using their DEX modifiers"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                  <circle cx="8" cy="8" r="1"></circle>
                  <circle cx="16" cy="8" r="1"></circle>
                  <circle cx="8" cy="16" r="1"></circle>
                  <circle cx="16" cy="16" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                </svg>
                {enemiesWithoutInitiative > 0
                  ? `Auto-roll enemy initiative (${enemiesWithoutInitiative})`
                  : 'Re-roll all enemy initiatives'}
              </button>
            )}
          </div>
        )}

        {isAllInitiativeSet && totalEnemies > 0 && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={rollEnemyInitiatives}
              className="btn btn-sm btn-ghost flex items-center gap-1"
              title="Re-roll initiative for all enemies using their DEX modifiers"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                <circle cx="8" cy="8" r="1"></circle>
                <circle cx="16" cy="8" r="1"></circle>
                <circle cx="8" cy="16" r="1"></circle>
                <circle cx="16" cy="16" r="1"></circle>
                <circle cx="12" cy="12" r="1"></circle>
              </svg>
              Re-roll all enemy initiatives
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <NewEnemyModal
            onAddCharacter={(character, _, type) => {
              handleAddCharacter(character, type);
            }}
            className="w-full"
            allowedCharacterTypes={['enemy']}
          />
          <AddPlayersModal
            onAddPlayers={handleAddPlayers}
            players={players}
            selectedCampaignId={encounter.campaignId.toString()}
            currentPlayerIds={draftEncounter.players.map(
              (player) => player._id,
            )}
            className="w-full"
          />
          <Button
            variant="secondary"
            label="Save"
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            loading={isSaving}
            className="w-full"
          />
          <Button
            variant="primary"
            label="Start Encounter"
            disabled={!isAllInitiativeSet}
            className="w-full"
            onClick={startEncounter}
          />
        </div>
      </div>
    </div>
  );
};

export default InactiveEncounterTable;
