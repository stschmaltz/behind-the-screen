// hooks/encounter/use-save-encounter.ts
import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import {
  deleteEncounterMutation,
  saveEncounterMutation,
} from '../../data/graphql/snippets/encounter';
import { Encounter, NewEncounterTemplate } from '../../types/encounters';

const DEBOUNCE_DELAY = 500;

const useManageEncounter = () => {
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

  const saveEncounter = async (
    encounter: Encounter | NewEncounterTemplate,
  ): Promise<boolean> => {
    const validationError = validateNewEncounter(encounter);
    console.log('validationError', { validationError });
    if (validationError) {
      console.log('validationErrorFALSE');
      return false;
    }

    try {
      console.log(
        'asyncFetch(saveEncounterMutation, { input: { ...encounter })',
      );
      await asyncFetch(saveEncounterMutation, { input: { ...encounter } });
      console.log('done');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const debouncedSave = useCallback(
    debounce(
      (
        encounter: Encounter | NewEncounterTemplate,
        resolve: (result: boolean) => void,
      ) => {
        setIsSaving(true);
        saveEncounter(encounter)
          .then((result) => {
            setIsSaving(false);
            resolve(result);
          })
          .catch((error) => {
            console.error(error);
            setIsSaving(false);
            resolve(false);
          });
      },
      DEBOUNCE_DELAY,
      {
        leading: false,
        trailing: true,
      },
    ),
    [],
  );

  const handleSave = useCallback(
    async (encounter: Encounter | NewEncounterTemplate): Promise<boolean> => {
      console.log('handleSave', { encounter });
      return new Promise((resolve) => {
        debouncedSave(encounter, resolve);
      });
    },
    [debouncedSave],
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const deleteEncounter = async (encounterId: string): Promise<boolean> => {
    console.log('deleteEncounter', encounterId);
    try {
      await asyncFetch(deleteEncounterMutation, {
        input: { id: encounterId.toString() },
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return { isSaving, handleSave, deleteEncounter };
};

export { useManageEncounter };
