import { useState, useEffect } from 'react';
import {
  getUserPreferencesQuery,
  GetUserPreferencesResponse,
  setActiveCampaignMutation,
  setThemeMutation,
} from '../../data/graphql/snippets/user-preferences';
import { useQuery } from '../use-async-query';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import { logger } from '../../lib/logger';

interface UseUserPreferencesResult {
  activeCampaignId?: string;
  theme?: string;
  loading: boolean;
  setActiveCampaign: (campaignId: string | null) => Promise<void>;
  setThemePreference: (theme: string) => Promise<void>;
}

export function useUserPreferences(): UseUserPreferencesResult {
  const [activeCampaignId, setActiveCampaignIdState] = useState<
    string | undefined
  >(undefined);
  const [theme, setThemeState] = useState<string | undefined>(undefined);

  const { data, loading, error } = useQuery<GetUserPreferencesResponse>({
    query: getUserPreferencesQuery,
  });

  useEffect(() => {
    if (data?.getUserPreferences) {
      if (data.getUserPreferences.activeCampaignId) {
        setActiveCampaignIdState(data.getUserPreferences.activeCampaignId);
      }
      if (data.getUserPreferences.theme) {
        setThemeState(data.getUserPreferences.theme);

        // Set theme in localStorage and DOM when it loads from DB
        const storedTheme = localStorage.getItem('dme-theme');

        // Only apply from DB if it doesn't match what's in localStorage
        // This gives precedence to local changes
        if (!storedTheme || storedTheme !== data.getUserPreferences.theme) {
          localStorage.setItem('dme-theme', data.getUserPreferences.theme);
          document.documentElement.setAttribute(
            'data-theme',
            data.getUserPreferences.theme,
          );
        }
      }
    }
  }, [data]);

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

  const setThemePreference = async (newTheme: string): Promise<void> => {
    try {
      logger.info('Setting theme preference', { theme: newTheme });

      // Update local state
      setThemeState(newTheme);

      // Apply directly
      localStorage.setItem('dme-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);

      // Save to DB
      await asyncFetch(setThemeMutation, {
        input: { theme: newTheme },
      });
    } catch (error) {
      logger.error('Failed to set theme preference', error);
    }
  };

  return {
    activeCampaignId,
    theme,
    loading,
    setActiveCampaign,
    setThemePreference,
  };
}
