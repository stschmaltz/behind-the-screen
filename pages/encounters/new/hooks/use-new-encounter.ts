import { ChangeEvent, useState } from 'react';
import { INITIAL_NEW_ENCOUNTER } from '..';
import { asyncFetch } from '../../../../data/graphql/graphql-fetcher';
import { saveEncounterMutation } from '../../../../data/graphql/snippets/encounter';
import { showDaisyToast } from '../../../../lib/daisy-toast';
import { NewEncounterTemplate } from '../../../../types/encounters';

export const useNewEncounter = () => {
  const [newEncounter, setNewEncounter] = useState<NewEncounterTemplate>(
    INITIAL_NEW_ENCOUNTER,
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange =
    (field: keyof NewEncounterTemplate) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setNewEncounter((prev) => ({ ...prev, [field]: e.target.value }));
    };

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

  const handleSave = async () => {
    setIsSaving(true);
    const validationError = validateNewEncounter();

    if (validationError) {
      showDaisyToast('error', validationError);
      setIsSaving(false);

      return;
    }

    try {
      await asyncFetch(saveEncounterMutation, { input: { ...newEncounter } });

      return true;
    } catch (err) {
      console.error(err);
      showDaisyToast('error', 'Failed to save encounter');

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    newEncounter,
    setNewEncounter,
    isSaving,
    handleFieldChange,
    handleSave,
  };
};
