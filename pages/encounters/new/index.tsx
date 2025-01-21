// pages/encounters/new.tsx
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ChangeEvent, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import NewNotesSection from './NewNotesSection';
import NewEnemiesSection from './NewEnemiesSection';
import { NewEncounterTemplate } from '../../../types/encounters';
import FormInput from '../../../components/FormInput';
import Button from '../../../components/Button';
import { asyncFetch } from '../../../data/graphql/graphql-fetcher';
import { saveEncounterMutation } from '../../../data/graphql/snippets/encounter';
import { showDaisyToast } from '../../../lib/daisy-toast';

const NewEncounterPage: NextPage = () => {
  const router = useRouter(); // for redirecting
  const [isSaving, setIsSaving] = useState(false);

  const [newEncounter, setNewEncounter] = useState<NewEncounterTemplate>({
    name: '',
    description: '',
    notes: [],
    enemies: [],
    status: 'inactive',
  });

  const validateNewEncounter = () => {
    if (!newEncounter.name) return 'Name is required';
    if (!newEncounter.enemies.length) return 'At least one enemy is required';
    if (!newEncounter.enemies.every((enemy) => enemy.name))
      return 'All enemies must have a name';
    if (!newEncounter.enemies.every((enemy) => enemy.maxHP))
      return 'All enemies must have a max HP';
    if (!newEncounter.enemies.every((enemy) => enemy.maxHP > 0))
      return 'All enemies must have a max HP greater than 0';
    if (!newEncounter.notes.every((note) => note))
      return 'All notes must have a value';

    return '';
  };

  const handleFieldChange =
    (field: keyof NewEncounterTemplate) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setNewEncounter((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSave = async () => {
    setIsSaving(true);
    const validationError = validateNewEncounter();

    if (validationError) {
      showDaisyToast('error', validationError);
      setIsSaving(false);

      return;
    }

    try {
      await asyncFetch(saveEncounterMutation, {
        input: { ...newEncounter },
      });
      toast.success('Encounter saved!');
      router.push('/encounters');   
    } catch (err) {
      console.error(err);
      showDaisyToast('error', 'Failed to save encounter');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <ToastContainer />

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

        <NewNotesSection
          notes={newEncounter.notes}
          onNotesChange={(updatedNotes) =>
            setNewEncounter((prev) => ({ ...prev, notes: updatedNotes }))
          }
        />

        <NewEnemiesSection
          enemies={newEncounter.enemies}
          onEnemiesChange={(updatedEnemies) =>
            setNewEncounter((prev) => ({ ...prev, enemies: updatedEnemies }))
          }
        />

        <div className="mt-10">
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isSaving}
            label="Save"
          />
        </div>
      </form>
    </div>
  );
};

export default NewEncounterPage;
