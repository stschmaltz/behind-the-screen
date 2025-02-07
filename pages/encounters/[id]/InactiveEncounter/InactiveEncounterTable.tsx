import React, { useState } from 'react';
import InactiveEncounterCharacterRow from './InactiveEncounterCharacterRow';
import { NewEnemyModal } from '../NewEnemyModal';
import AddPlayersModal from '../AddPlayersModal';
import { useEncounterDraft } from '../../../../hooks/encounter/use-draft-encounter';
import { Button } from '../../../../components/Button';
import { useUnsavedChangesWarning } from '../../../../hooks/use-unsaved-changes-warning';
import { Encounter } from '../../../../types/encounters';
import { Player } from '../../../../types/player';
import { showDaisyToast } from '../../../../lib/daisy-toast';
import { useEncounterContext } from '../../../../context/EncounterContext';

interface Props {
  encounter: Encounter;
  players: Player[];
}

const InactiveEncounterTable: React.FC<Props> = ({ players }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { encounter, setEncounter } = useEncounterContext();

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
          onClick={() => {
            handleSave({ ...draftEncounter, status: 'active' });
            showDaisyToast('success', 'Encounter started');
            setEncounter({ ...draftEncounter, status: 'active' });
          }}
        />
      </div>
    </div>
  );
};

export default InactiveEncounterTable;
