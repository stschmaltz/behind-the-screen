import { useState, useEffect } from 'react';
import { useQuery } from './use-async-query';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import {
  getUserPreferencesQuery,
  getAiGenerationCountQuery,
  requestMoreUsesMutation,
} from '../data/graphql/snippets/user-preferences';
import type { GetUserPreferencesQuery } from '../generated/graphql';
import { logger } from '../lib/logger';

const MAX_FREE_AI_GENERATIONS = 25;

interface UseGenerationUsageResult {
  usageCount: number;
  remainingUses: number;
  hasAvailableUses: boolean;
  hasRequestedMoreUses: boolean;
  isLoading: boolean;
  refetch: () => void;
  requestMoreUses: () => Promise<void>;
}

export function useGenerationUsage(): UseGenerationUsageResult {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [hasRequestedMoreUses, setHasRequestedMoreUses] = useState<boolean>(false);

  const { data: prefsData, loading: prefsLoading } = useQuery<GetUserPreferencesQuery>({
    query: getUserPreferencesQuery,
  });

  const { data: countData, loading: countLoading, refresh } = useQuery<{ getAiGenerationCount: number }>({
    query: getAiGenerationCountQuery,
    skipCache: true,
  });

  useEffect(() => {
    if (prefsData?.getUserPreferences) {
      if (prefsData.getUserPreferences.hasRequestedMoreUses !== undefined && prefsData.getUserPreferences.hasRequestedMoreUses !== null) {
        setHasRequestedMoreUses(prefsData.getUserPreferences.hasRequestedMoreUses);
      }
    }
  }, [prefsData]);

  useEffect(() => {
    if (countData?.getAiGenerationCount !== undefined) {
      setUsageCount(countData.getAiGenerationCount);
    }
  }, [countData]);

  useEffect(() => {
    const handleFocus = () => {
      refresh();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refresh]);

  const requestMoreUsesHandler = async (): Promise<void> => {
    try {
      const result = await asyncFetch<{
        requestMoreUses: { hasRequestedMoreUses: boolean };
      }>(requestMoreUsesMutation, {});

      setHasRequestedMoreUses(result.requestMoreUses.hasRequestedMoreUses);
      refresh();
    } catch (error) {
      logger.error('Failed to request more uses', error);
      throw error;
    }
  };

  const remainingUses = Math.max(0, MAX_FREE_AI_GENERATIONS - usageCount);
  const hasAvailableUses = usageCount < MAX_FREE_AI_GENERATIONS;

  return {
    usageCount,
    remainingUses,
    hasAvailableUses,
    hasRequestedMoreUses,
    isLoading: prefsLoading || countLoading,
    refetch: refresh,
    requestMoreUses: requestMoreUsesHandler,
  };
}

