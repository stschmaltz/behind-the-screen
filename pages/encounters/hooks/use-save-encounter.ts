import { useState } from 'react';
import { asyncFetch } from '../../../data/graphql/graphql-fetcher';
import { saveEncounterMutation } from '../../../data/graphql/snippets/encounter';
import { Encounter, NewEncounterTemplate } from '../../../types/encounters';

const useSaveEncounter = () => {
  const [isSaving, setIsSaving] = useState(false);

  const validateNewEncounter = (
    encounter: Encounter | NewEncounterTemplate,
  ) => {
    if (!encounter.name) return 'Name is required';
    if (!encounter.enemies.length) return 'At least one enemy is required';
    if (!encounter.enemies.every((enemy) => enemy.name))
      return 'All enemies must have a name';
    if (!encounter.enemies.every((enemy) => enemy.maxHP))
      return 'All enemies must have a max HP';
    if (!encounter.enemies.every((enemy) => enemy.maxHP > 0))
      return 'All enemies must have a max HP greater than 0';
    if (!encounter.notes.every((note) => note))
      return 'All notes must have a value';

    return '';
  };

  const handleSave = async (
    encounter: Encounter | NewEncounterTemplate,
  ): Promise<boolean> => {
    console.log('handleSave', {
      encounter,
    });
    setIsSaving(true);
    const validationError = validateNewEncounter(encounter);

    if (validationError) {
      setIsSaving(false);

      return false;
    }

    try {
      await asyncFetch(saveEncounterMutation, { input: { ...encounter } });

      return true;
    } catch (err) {
      console.error(err);

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, handleSave };
};

export { useSaveEncounter };
