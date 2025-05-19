import { useState, useCallback } from 'react';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import {
  saveCampaignMutation,
  deleteCampaignMutation,
} from '../../data/graphql/snippets/campaign';
import type {
  SaveCampaignMutation,
  DeleteCampaignMutation,
  UserPreferences,
  GetUserPreferencesQuery,
  SetActiveCampaignMutation,
} from '../../generated/graphql';
import { Campaign, NewCampaign } from '../../types/campaigns';
import { logger } from '../../lib/logger';
import {
  getUserPreferencesQuery,
  setActiveCampaignMutation,
} from '../../data/graphql/snippets/user-preferences';
import { useQuery } from '../use-async-query';

type CampaignUpdatePayload = Partial<
  Omit<Campaign, '_id' | 'userId' | 'createdAt' | 'updatedAt'> & {
    name: string;
  }
> & { _id: string };

const useManageCampaign = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const saveCampaign = async (
    campaignData: Campaign | NewCampaign | CampaignUpdatePayload | any,
  ): Promise<string | null> => {
    const campaign = campaignData as
      | Campaign
      | NewCampaign
      | CampaignUpdatePayload;

    if (!campaign.name) {
      logger.info('Validation failed: Campaign name is required', {
        name: campaign.name,
      });
      return null;
    }

    setIsSaving(true);
    try {
      const isUpdate = '_id' in campaign && campaign._id;
      const campaignId = isUpdate ? campaign._id : 'new';

      logger.debug('Saving campaign', {
        id: campaignId,
        name: campaign.name,
        isUpdate: !!isUpdate,
      });

      const mutationInput: any = {
        name: campaign.name,
        ...(campaign.status && { status: campaign.status }),
      };

      if (isUpdate) {
        mutationInput.id = campaignId;
      }

      const result = await asyncFetch<SaveCampaignMutation>(
        saveCampaignMutation,
        { input: mutationInput },
      );
      const savedCampaignId = result?.saveCampaign?._id;

      logger.info('Campaign saved successfully', {
        id: savedCampaignId || campaignId,
        name: campaign.name,
      });
      setIsSaving(false);
      return savedCampaignId || null;
    } catch (err) {
      logger.error('Failed to save campaign', {
        error: err instanceof Error ? err.message : String(err),
        name: campaign.name,
      });
      setIsSaving(false);
      return null;
    }
  };

  const deleteCampaign = async (campaignId: string): Promise<boolean> => {
    logger.debug('Deleting campaign', { id: campaignId });
    setIsDeleting(true);
    try {
      await asyncFetch<DeleteCampaignMutation>(deleteCampaignMutation, {
        input: { id: campaignId },
      });
      const userPreferences = await asyncFetch<GetUserPreferencesQuery>(
        getUserPreferencesQuery,
      );

      if (
        userPreferences?.getUserPreferences?.activeCampaignId === campaignId
      ) {
        await asyncFetch<SetActiveCampaignMutation>(setActiveCampaignMutation, {
          input: { id: null },
        });
      }

      logger.info('Campaign deleted successfully', { id: campaignId });
      setIsDeleting(false);
      return true;
    } catch (err) {
      logger.error('Failed to delete campaign', {
        error: err instanceof Error ? err.message : String(err),
        id: campaignId,
      });
      setIsDeleting(false);
      return false;
    }
  };

  const handleSave = useCallback(
    async (
      campaign: Campaign | Omit<NewCampaign, 'userId'> | CampaignUpdatePayload,
    ): Promise<string | null> => {
      return saveCampaign(campaign as any);
    },
    [saveCampaign],
  );

  return { isSaving, isDeleting, handleSave, deleteCampaign };
};

export { useManageCampaign };
