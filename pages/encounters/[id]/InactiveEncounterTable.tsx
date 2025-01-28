import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { NewEnemyModal } from './NewEnemyModal';
import { AddPlayersModal } from './AddPlayersModal';
import { InactiveEncounterCharacterRow } from './InactiveEncounterCharacterRow';
import { useUnsavedChangesWarning } from '../../../hooks/use-unsaved-changes-warning';
import {
  Encounter,
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../../types/encounters';
import { Player } from '../../../types/player';
import { useEncounterDraft } from './hooks/use-draft-encounter';
import { showDaisyToast } from '../../../lib/daisy-toast';
import { ToastContainer } from 'react-toastify';

interface Props {
  encounter: Encounter;
  players: Player[];
}

const InactiveEncounterTable: React.FC<Props> = ({ encounter, players }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    draftEncounter,
    handleAddEnemy,
    handleAddPlayers,
    handleUpdateCharacter,
    handleDeleteCharacter,
    handleSave,
    isSaving,
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

  const isAllInitiativeSet = draftEncounter.initiativeOrder.every(
    (character) => character.initiative !== undefined,
  );

  return (
    <div className="overflow-x-auto">
      <ToastContainer />

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
              key={character.name}
              character={character}
              onDelete={() => handleDeleteCharacter(character.name)}
              onUpdate={handleUpdateCharacter}
            />
          ))}
        </tbody>
      </table>
      {!isAllInitiativeSet && (
        <p className="text-red-500 text-sm mt-2 align-right">
          Not all characters have initiative set
        </p>
      )}
      <div className="flex mt-4 justify-end gap-4">
        <NewEnemyModal onAddEnemy={handleAddEnemy} />
        <AddPlayersModal onAddPlayers={handleAddPlayers} players={players} />
        <Button
          variant="secondary"
          label="Save"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          loading={isSaving}
        />
        <Button
          variant="primary"
          label="Start Encounter"
          disabled={!isAllInitiativeSet}
        />
      </div>
    </div>
  );
};

export { InactiveEncounterTable };
