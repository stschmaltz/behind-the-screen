import { useState, useCallback, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import { saveEncounterMutation } from '../../data/graphql/snippets/encounter';
import { Encounter, NewEncounterTemplate } from '../../types/encounters';

const DEBOUNCE_DELAY = 500;

const useSaveEncounter = () => {
  const [isSaving, setIsSaving] = useState(false);

  const latestSavePromiseRef = useRef<Promise<boolean> | null>(null);

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

    if (validationError) {
      return false;
    }

    try {
      await asyncFetch(saveEncounterMutation, { input: { ...encounter } });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const debouncedSave = useCallback(
    debounce(
      async (encounter: Encounter | NewEncounterTemplate) => {
        setIsSaving(true);

        try {
          const promise = saveEncounter(encounter);
          latestSavePromiseRef.current = promise;

          const result = await promise;

          if (latestSavePromiseRef.current === promise) {
            setIsSaving(false);
            return result;
          }
        } catch (error) {
          setIsSaving(false);
          throw error;
        }
      },
      DEBOUNCE_DELAY,
      {
        leading: false,
        trailing: true, // Execute on the trailing edge
      },
    ),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const handleSave = useCallback(
    async (encounter: Encounter | NewEncounterTemplate): Promise<boolean> => {
      console.log('handleSave', { encounter });
      return await Promise.resolve(debouncedSave(encounter)).then(
        (result) => result ?? false,
      );
    },
    [debouncedSave],
  );

  return { isSaving, handleSave };
};

export { useSaveEncounter };
