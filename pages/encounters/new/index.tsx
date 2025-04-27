import { NextPage } from 'next';
import { useRouter } from 'next/router';
import NewEnemiesSection from './NewEnemiesSection';
import { useNewEncounter } from '../../../hooks/encounter/use-new-encounter';
import { NewEncounterTemplate } from '../../../types/encounters';
import { FormInput } from '../../../components/FormInput';
import { Button } from '../../../components/Button';
import { showDaisyToast } from '../../../lib/daisy-toast';
import { useManageEncounter } from '../../../hooks/encounter/use-manage-encounter';

export const INITIAL_NEW_ENCOUNTER: NewEncounterTemplate = {
  name: '',
  description: '',
  notes: [],
  enemies: [],
  status: 'inactive',
  userId: '',
};

const NewEncounterPage: NextPage = () => {
  const router = useRouter();
  const { handleSave, isSaving } = useManageEncounter();
  const { newEncounter, setNewEncounter, handleFieldChange } =
    useNewEncounter();

  const onSave = async () => {
    const success = await handleSave(newEncounter);
    if (success) {
      showDaisyToast('success', 'Encounter saved');
      router.push('/encounters');
    } else {
      showDaisyToast('error', 'Failed to save encounter');
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-4">New Encounter</h1>

      <form className="w-full max-w-xl bg-base-300 shadow-md rounded px-8 pt-6 pb-8 mb-4 max-h-[70vh] overflow-y-auto">
        <FormInput
          id="name"
          label="Name"
          value={newEncounter.name}
          onChange={handleFieldChange('name')}
        />
        <FormInput
          id="description"
          label="Description"
          value={newEncounter.description}
          onChange={handleFieldChange('description')}
        />

        {/* <NewNotesSection
          notes={newEncounter.notes}
          onNotesChange={(updatedNotes) =>
            setNewEncounter((prev) => ({ ...prev, notes: updatedNotes }))
          }
        /> */}

        <NewEnemiesSection
          enemies={newEncounter.enemies}
          onEnemiesChange={(updatedEnemies) =>
            setNewEncounter((prev) => ({ ...prev, enemies: updatedEnemies }))
          }
        />

        <div className="mt-10">
          <Button
            className="w-full"
            onClick={onSave}
            disabled={isSaving}
            label="Save"
          />
        </div>
      </form>
    </div>
  );
};

export default NewEncounterPage;
