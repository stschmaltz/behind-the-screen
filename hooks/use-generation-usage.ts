import { useState, useEffect } from 'react';
import { useQuery } from './use-async-query';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import {
  getUserPreferencesQuery,
  incrementAiGenerationUsageMutation,
  requestMoreUsesMutation,
} from '../data/graphql/snippets/user-preferences';
import type { GetUserPreferencesQuery } from '../generated/graphql';
import { logger } from '../lib/logger';

const MAX_FREE_AI_GENERATIONS = 25;

interface UseGenerationUsageResult {
  usageCount: number;
  remainingUses: number;
  hasAvailableUses: boolean;
  resetDate: Date | null;
  hasRequestedMoreUses: boolean;
  isLoading: boolean;
  incrementUsage: () => Promise<void>;
  requestMoreUses: () => Promise<void>;
  refetch: () => void;
}

export function useGenerationUsage(): UseGenerationUsageResult {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [resetDate, setResetDate] = useState<Date | null>(null);
  const [hasRequestedMoreUses, setHasRequestedMoreUses] = useState<boolean>(false);

  const { data, loading, refresh } = useQuery<GetUserPreferencesQuery>({
    query: getUserPreferencesQuery,
  });

  useEffect(() => {
    if (data?.getUserPreferences) {
      if (data.getUserPreferences.aiGenerationUsageCount !== undefined && data.getUserPreferences.aiGenerationUsageCount !== null) {
        setUsageCount(data.getUserPreferences.aiGenerationUsageCount);
      }
      if (data.getUserPreferences.aiUsageResetDate) {
        setResetDate(new Date(data.getUserPreferences.aiUsageResetDate));
      }
      if (data.getUserPreferences.hasRequestedMoreUses !== undefined) {
        setHasRequestedMoreUses(data.getUserPreferences.hasRequestedMoreUses);
      }
    }
  }, [data]);

  const incrementUsage = async (): Promise<void> => {
    try {
      const result = await asyncFetch<{
        incrementAiGenerationUsage: { aiGenerationUsageCount: number };
      }>(incrementAiGenerationUsageMutation, {});

      setUsageCount(result.incrementAiGenerationUsage.aiGenerationUsageCount);
    } catch (error) {
      logger.error('Failed to increment AI generation usage', error);
      throw error;
    }
  };

  const requestMoreUsesHandler = async (): Promise<void> => {
    try {
      const result = await asyncFetch<{
        requestMoreUses: { hasRequestedMoreUses: boolean };
      }>(requestMoreUsesMutation, {});

      setHasRequestedMoreUses(result.requestMoreUses.hasRequestedMoreUses);
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
    resetDate,
    hasRequestedMoreUses,
    isLoading: loading,
    incrementUsage,
    requestMoreUses: requestMoreUsesHandler,
    refetch: refresh,
  };
}

