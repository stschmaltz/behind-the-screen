import { useState, useCallback } from 'react';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import {
  saveAdventureMutation,
  deleteAdventureMutation,
} from '../../data/graphql/snippets/adventure';
import type {
  SaveAdventureMutation,
  DeleteAdventureMutation,
} from '../../src/generated/graphql';
import { Adventure, NewAdventure } from '../../types/adventures';
import { logger } from '../../lib/logger';
import { TransformedAdventure } from './get-all-adventures';

type AdventureUpdatePayload = Partial<
  Omit<Adventure, '_id' | 'userId' | 'createdAt' | 'updatedAt'> & {
    name: string;
  }
> & { _id: string };

const useManageAdventure = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const saveAdventure = async (
    adventureData:
      | Adventure
      | NewAdventure
      | AdventureUpdatePayload
      | TransformedAdventure,
  ): Promise<string | null> => {
    const adventure = adventureData as
      | Adventure
      | NewAdventure
      | AdventureUpdatePayload;
    if (!adventure.name) {
      logger.info('Validation failed: Adventure name is required', {
        name: adventure.name,
      });
      return null;
    }

    setIsSaving(true);
    try {
      const isUpdate = '_id' in adventure && adventure._id;
      const adventureId = isUpdate ? adventure._id : 'new';

      logger.debug('Saving adventure', {
        id: adventureId,
        name: adventure.name,
        isUpdate: !!isUpdate,
      });

      const mutationInput: any = {
        name: adventure.name,
        ...(adventure.description && { description: adventure.description }),
        ...(adventure.status && { status: adventure.status }),
        ...(adventure.campaignId && { campaignId: adventure.campaignId }),
      };

      if (isUpdate) {
        mutationInput.id = adventureId;
      }

      const result = await asyncFetch<SaveAdventureMutation>(
        saveAdventureMutation,
        { input: mutationInput },
      );
      const savedAdventureId = result?.saveAdventure?._id;

      logger.info('Adventure saved successfully', {
        id: savedAdventureId || adventureId,
        name: adventure.name,
      });
      setIsSaving(false);
      return savedAdventureId || null;
    } catch (err) {
      logger.error('Failed to save adventure', {
        error: err instanceof Error ? err.message : String(err),
        name: adventure.name,
      });
      setIsSaving(false);
      return null;
    }
  };

  const deleteAdventure = async (adventureId: string): Promise<boolean> => {
    logger.debug('Deleting adventure', { id: adventureId });
    setIsDeleting(true);
    try {
      await asyncFetch<DeleteAdventureMutation>(deleteAdventureMutation, {
        input: { id: adventureId },
      });
      logger.info('Adventure deleted successfully', { id: adventureId });
      setIsDeleting(false);
      return true;
    } catch (err) {
      logger.error('Failed to delete adventure', {
        error: err instanceof Error ? err.message : String(err),
        id: adventureId,
      });
      setIsDeleting(false);
      return false;
    }
  };

  const handleSave = useCallback(
    async (
      adventure:
        | Adventure
        | Omit<NewAdventure, 'userId'>
        | AdventureUpdatePayload,
    ): Promise<string | null> => {
      return saveAdventure(adventure as any);
    },
    [saveAdventure],
  );

  return { isSaving, isDeleting, handleSave, deleteAdventure };
};

export { useManageAdventure };
