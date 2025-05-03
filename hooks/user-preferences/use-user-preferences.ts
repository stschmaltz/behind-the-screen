import { useState, useEffect } from 'react';
import {
  getUserPreferencesQuery,
  GetUserPreferencesResponse,
  setActiveCampaignMutation,
} from '../../data/graphql/snippets/user-preferences';
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
  >(undefined);

  let themeContext;
  try {
    themeContext = useTheme();
  } catch (e) {
    themeContext = null;
  }

  const { data, loading, error } = useQuery<GetUserPreferencesResponse>({
    query: getUserPreferencesQuery,
  });

  useEffect(() => {
    if (data?.getUserPreferences) {
      if (data.getUserPreferences.activeCampaignId) {
        setActiveCampaignIdState(data.getUserPreferences.activeCampaignId);
      }

      if (data.getUserPreferences.theme && themeContext) {
        const dbTheme = data.getUserPreferences.theme;
        const storedTheme = localStorage.getItem('dme-theme');
        if (!storedTheme) {
          themeContext.setTheme(dbTheme);
        }
      }
    }
  }, [data, themeContext]);

  const setActiveCampaign = async (
    campaignId: string | null,
  ): Promise<void> => {
    try {
      logger.info('Setting active campaign', { campaignId });

      await asyncFetch(setActiveCampaignMutation, {
        input: { campaignId },
      });

      setActiveCampaignIdState(campaignId || undefined);
    } catch (error) {
      logger.error('Failed to set active campaign', error);
    }
  };

  return {
    activeCampaignId,
    loading,
    setActiveCampaign,
  };
}
