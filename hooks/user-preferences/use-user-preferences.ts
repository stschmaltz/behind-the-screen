import { useState, useEffect } from 'react';
import {
  getUserPreferencesQuery,
  setActiveCampaignMutation,
} from '../../data/graphql/snippets/user-preferences';
import type {
  GetUserPreferencesQuery,
  SetActiveCampaignMutation,
} from '../../src/generated/graphql';
import { useQuery } from '../use-async-query';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import { logger } from '../../lib/logger';
import { useTheme } from '../../context/ThemeContext';

interface UseUserPreferencesResult {
  activeCampaignId?: string;
  loading: boolean;
  setActiveCampaign: (campaignId: string | null) => Promise<void>;
}

export function useUserPreferences(): UseUserPreferencesResult {
  const [activeCampaignId, setActiveCampaignIdState] = useState<
    string | undefined
  >();

  const { data, loading } = useQuery<GetUserPreferencesQuery>({
    query: getUserPreferencesQuery,
  });

  useEffect(() => {
    if (!data?.getUserPreferences) return;

    const { activeCampaignId: dbCampaignId, theme: dbTheme } =
      data.getUserPreferences;

    if (dbCampaignId) {
      setActiveCampaignIdState(dbCampaignId);
    }
  }, [data]);

  const setActiveCampaign = async (
    campaignId: string | null,
  ): Promise<void> => {
    try {
      await asyncFetch<SetActiveCampaignMutation>(setActiveCampaignMutation, {
        input: { campaignId },
      });
      setActiveCampaignIdState(campaignId || undefined);
    } catch (error) {
      logger.error('Failed to set active campaign', error);
      throw error;
    }
  };

  return {
    activeCampaignId,
    loading,
    setActiveCampaign,
  };
}
