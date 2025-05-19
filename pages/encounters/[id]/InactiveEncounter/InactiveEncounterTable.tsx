import React, { useState } from 'react';
import InactiveEncounterCharacterRow from './InactiveEncounterCharacterRow';
import NewEnemyModal from '../enemy/NewEnemyModal';
import AddPlayersModal from '../AddPlayersModal';
import { useEncounterDraft } from '../../../../hooks/encounter/use-draft-encounter';
import { Button } from '../../../../components/ui/Button';
import { useUnsavedChangesWarning } from '../../../../hooks/use-unsaved-changes-warning';
import {
  Encounter,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../../types/encounters';
import type { Player } from '../../../../generated/graphql';
import { showDaisyToast } from '../../../../lib/daisy-toast';
import { useEncounterContext } from '../../../../context/EncounterContext';
import { logger } from '../../../../lib/logger';
import { CondensedDifficultyCalculator } from '../../../../components/encounter-difficulty/CondensedDifficultyCalculator';
import InitiativeRoller from '../../../../components/encounter/InitiativeRoller';

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
              <th>Temp HP</th>
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
            <div className="flex flex-row gap-1">
              <InitiativeRoller
                characters={draftEncounter.initiativeOrder}
                type="player"
                players={players}
                onUpdateInitiative={handleUpdateInitiativeOrder}
                disabled={
                  draftEncounter.initiativeOrder.filter(
                    (c) => c.type === 'player',
                  ).length === 0
                }
              />
              <InitiativeRoller
                characters={draftEncounter.initiativeOrder}
                type="enemy"
                onUpdateInitiative={handleUpdateInitiativeOrder}
                getStatsForCharacter={(id) => {
                  const data = getMonsterData(id);

                  return data && data.stats ? data.stats : undefined;
                }}
                disabled={totalEnemies === 0}
              />
            </div>
          </div>
        )}

        {isAllInitiativeSet && totalEnemies > 0 && (
          <div className="mt-2 flex justify-end">
            <InitiativeRoller
              characters={draftEncounter.initiativeOrder}
              type="enemy"
              onUpdateInitiative={handleUpdateInitiativeOrder}
              getStatsForCharacter={(id) => {
                const data = getMonsterData(id);

                return data && data.stats ? data.stats : undefined;
              }}
            />
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
            allowedCharacterTypes={['enemy', 'npc']}
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
            variant="success"
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
