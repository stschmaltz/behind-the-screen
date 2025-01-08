import { NextPage } from 'next';
import { ChangeEvent, useState } from 'react';
import { NewEncounterTemplate } from '../../types/encounters';
import FormInput from '../../components/FormInput';
import NewNotesSection from '../../components/encounters/NewNotesSection';
import NewEnemiesSection from '../../components/encounters/NewEnemiesSection';
import Button from '../../components/Button';

const NewEncounterPage: NextPage = () => {
  const [newEncounter, setNewEncounter] = useState<NewEncounterTemplate>({
    name: '',
    description: '',
    notes: [],
    enemies: [],
    status: 'inactive',
    createdAt: new Date(),
  });

  const handleFieldChange =
    (field: keyof NewEncounterTemplate) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setNewEncounter((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSave = () => {
    console.log('Encounter to save:', newEncounter);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-4">New Encounter</h1>

      <form className="w-full max-w-lg bg-base-300 shadow-md rounded px-8 pt-6 pb-8 mb-4 max-h-[70vh] overflow-y-auto">
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

        <div className="flex items-center justify-between">
          <Button onClick={handleSave} label="Save" />
        </div>
      </form>
    </div>
  );
};

export default NewEncounterPage;
