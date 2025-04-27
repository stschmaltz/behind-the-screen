import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import {
  deleteEncounterMutation,
  saveEncounterMutation,
  updateEncounterDescriptionMutation,
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
      console.log('encounter', encounter);
      const encounterId =
        '_id' in encounter && encounter._id ? encounter._id : 'new';
      logger.debug('Saving encounter', {
        id: encounterId,
        name: encounter.name,
      });

      const mutationInput: any = {
        name: encounter.name,
        description: encounter.description,
        notes: encounter.notes,
        enemies: encounter.enemies,
        status: encounter.status,
        campaignId: encounter.campaignId,
      };

      if (encounterId !== 'new') {
        mutationInput._id = encounterId;
      }

      if ('adventureId' in encounter && encounter.adventureId) {
        mutationInput.adventureId = encounter.adventureId;
      }

      if ('players' in encounter && encounter.players) {
        mutationInput.players = encounter.players;
      }

      if ('npcs' in encounter && encounter.npcs) {
        mutationInput.npcs = encounter.npcs;
      }

      if ('initiativeOrder' in encounter && encounter.initiativeOrder) {
        mutationInput.initiativeOrder = encounter.initiativeOrder;
      }

      if ('currentRound' in encounter && encounter.currentRound) {
        mutationInput.currentRound = encounter.currentRound;
      }

      if ('currentTurn' in encounter && encounter.currentTurn) {
        mutationInput.currentTurn = encounter.currentTurn;
      }

      await asyncFetch(saveEncounterMutation, { input: mutationInput });
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
    async (
      encounter: Encounter | Omit<NewEncounterTemplate, 'userId'>,
    ): Promise<boolean> => {
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

  const updateDescription = useCallback(
    async (encounterId: string, newDescription: string): Promise<void> => {
      logger.debug('Updating encounter description', {
        id: encounterId,
        descriptionLength: newDescription.length,
      });
      try {
        await asyncFetch(updateEncounterDescriptionMutation, {
          input: { _id: encounterId, description: newDescription },
        });
        logger.info('Encounter description updated successfully', {
          id: encounterId,
        });
      } catch (err) {
        logger.error('Failed to update encounter description', err);
        throw err;
      }
    },
    [],
  );

  return { isSaving, handleSave, deleteEncounter, updateDescription };
};

export { useManageEncounter };
