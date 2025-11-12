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
import { showDaisyToast } from '../../lib/daisy-toast';

const DEBOUNCE_DELAY = 500;

/**
 * Builds the mutation input object for saving an encounter
 * Includes only fields that are present and valid
 */
const buildEncounterMutationInput = (
  encounter: Encounter | NewEncounterTemplate,
  encounterId: string,
): any => {
  const baseFields = {
    name: encounter.name,
    description: encounter.description,
    notes: encounter.notes,
    enemies: encounter.enemies,
    status: encounter.status,
    campaignId: encounter.campaignId,
  };

  const optionalFields: Record<string, any> = {};

  if (encounterId !== 'new') {
    optionalFields._id = encounterId;
  }

  // Add optional fields if they exist
  const fieldChecks: Array<[string, string]> = [
    ['adventureId', 'adventureId'],
    ['players', 'players'],
    ['npcs', 'npcs'],
    ['initiativeOrder', 'initiativeOrder'],
    ['currentRound', 'currentRound'],
    ['currentTurn', 'currentTurn'],
  ];

  fieldChecks.forEach(([outputKey, inputKey]) => {
    if (inputKey in encounter && (encounter as any)[inputKey]) {
      optionalFields[outputKey] = (encounter as any)[inputKey];
    }
  });

  return { ...baseFields, ...optionalFields };
};

const validateNewEncounter = (
  encounter: Encounter | NewEncounterTemplate,
  options?: { requireAdventure?: boolean },
): string[] => {
  const errors: string[] = [];
  if (!encounter.name) errors.push('Name is required');
  if (!encounter.enemies.length) errors.push('At least one enemy is required');
  if (!encounter.enemies.every((enemy) => enemy.name))
    errors.push('All enemies must have a name');
  if (!encounter.notes.every((note) => note))
    errors.push('All notes must have a value');
  if (options?.requireAdventure) {
    if (
      !('adventureId' in encounter) ||
      !encounter.adventureId ||
      encounter.adventureId === 'all'
    ) {
      errors.push('Please select an adventure');
    }
  }
  return errors;
};

const useManageEncounter = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const saveEncounter = async (
    encounterData: Encounter | NewEncounterTemplate | any,
    options?: { requireAdventure?: boolean },
  ): Promise<{ success: boolean; errors?: string[] }> => {
    const encounter = encounterData as Encounter | NewEncounterTemplate;
    const validationErrors = validateNewEncounter(encounter, options);
    logger.debug('Validating encounter', {
      validationErrors,
      name: encounter.name,
    });

    if (validationErrors.length > 0) {
      logger.info(`Validation failed: ${validationErrors.join('; ')}`, {
        name: encounter.name,
        errors: validationErrors,
      });
      return { success: false, errors: validationErrors };
    }

    try {
      const encounterId =
        '_id' in encounter && encounter._id ? encounter._id : 'new';
      logger.debug('Saving encounter', {
        id: encounterId,
        name: encounter.name,
      });

      const mutationInput = buildEncounterMutationInput(encounter, encounterId);

      await asyncFetch(saveEncounterMutation, { input: mutationInput });
      logger.info('Encounter saved successfully', {
        id: encounterId,
        name: encounter.name,
      });

      if (encounterId === 'new') {
        setTimeout(() => {
          const readyEncountersSection =
            document.getElementById('ready-encounters');
          if (readyEncountersSection) {
            readyEncountersSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
          const card = Array.from(
            document.querySelectorAll('.encounter-card'),
          ).find((el) => {
            const nameEl = el.querySelector('.card-title');
            return (
              nameEl && nameEl.textContent?.trim() === encounter.name.trim()
            );
          });
        }, 500);
      }

      return { success: true };
    } catch (err) {
      logger.error('Failed to save encounter', {
        error: err instanceof Error ? err.message : String(err),
        name: encounter.name,
      });
      return { success: false, errors: ['Failed to save encounter'] };
    }
  };

  const debouncedSave = useCallback(
    debounce(
      (
        encounter: Encounter | NewEncounterTemplate | any,
        resolve: (result: { success: boolean; errors?: string[] }) => void,
        options?: { requireAdventure?: boolean },
      ) => {
        setIsSaving(true);
        saveEncounter(encounter, options)
          .then((result) => {
            setIsSaving(false);
            resolve(result);
          })
          .catch((error) => {
            logger.error('Error in debounced save', error);
            setIsSaving(false);
            resolve({ success: false, errors: ['Failed to save encounter'] });
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
      options?: { requireAdventure?: boolean },
    ): Promise<{ success: boolean; errors?: string[] }> => {
      return new Promise((resolve) => {
        debouncedSave(encounter, resolve, options);
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
    setIsDeleting(true);
    try {
      await asyncFetch(deleteEncounterMutation, {
        input: { id: encounterId.toString() },
      });
      logger.info('Encounter deleted successfully', { id: encounterId });
      setIsDeleting(false);
      return true;
    } catch (err) {
      logger.error('Failed to delete encounter', err);
      setIsDeleting(false);
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

  return {
    isSaving,
    handleSave,
    deleteEncounter,
    isDeleting,
    updateDescription,
  };
};

export { useManageEncounter, validateNewEncounter };
