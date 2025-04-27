import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import {
  deleteEncounterMutation,
  saveEncounterMutation,
} from '../../data/graphql/snippets/encounter';
import { Encounter, NewEncounterTemplate } from '../../types/encounters';
import { logger } from '../../lib/logger';

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
    encounterData: Encounter | NewEncounterTemplate | any,
  ): Promise<boolean> => {
    const encounter = encounterData as Encounter | NewEncounterTemplate;
    const validationError = validateNewEncounter(encounter);
    logger.debug('Validating encounter', {
      validationError,
      name: encounter.name,
    });

    if (validationError) {
      logger.info(`Validation failed: ${validationError}`, {
        name: encounter.name,
        error: validationError,
      });
      return false;
    }

    try {
      const encounterId = 'id' in encounter ? encounter.id : 'new';
      logger.debug('Saving encounter', {
        id: encounterId,
        name: encounter.name,
      });
      await asyncFetch(saveEncounterMutation, { input: { ...encounter } });
      logger.info('Encounter saved successfully', {
        id: encounterId,
        name: encounter.name,
      });
      return true;
    } catch (err) {
      logger.error('Failed to save encounter', {
        error: err instanceof Error ? err.message : String(err),
        name: encounter.name,
      });
      return false;
    }
  };

  const debouncedSave = useCallback(
    debounce(
      (
        encounter: Encounter | NewEncounterTemplate | any,
        resolve: (result: boolean) => void,
      ) => {
        setIsSaving(true);
        saveEncounter(encounter)
          .then((result) => {
            setIsSaving(false);
            resolve(result);
          })
          .catch((error) => {
            logger.error('Error in debounced save', error);
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
      const encounterId = 'id' in encounter ? encounter.id : 'new';
      logger.debug('Handle save called', { id: encounterId });
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
    logger.debug('Deleting encounter', { id: encounterId });
    try {
      await asyncFetch(deleteEncounterMutation, {
        input: { id: encounterId.toString() },
      });
      logger.info('Encounter deleted successfully', { id: encounterId });
      return true;
    } catch (err) {
      logger.error('Failed to delete encounter', err);
      return false;
    }
  };

  return { isSaving, handleSave, deleteEncounter };
};

export { useManageEncounter };
