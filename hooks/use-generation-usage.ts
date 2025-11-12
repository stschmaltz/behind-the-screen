import { useState, useEffect } from 'react';
import { useQuery } from './use-async-query';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import {
  getUserPreferencesQuery,
  incrementAiGenerationUsageMutation,
} from '../data/graphql/snippets/user-preferences';
import type { GetUserPreferencesQuery } from '../generated/graphql';
import { logger } from '../lib/logger';

const MAX_FREE_AI_GENERATIONS = 10;

interface UseGenerationUsageResult {
  usageCount: number;
  remainingUses: number;
  hasAvailableUses: boolean;
  isLoading: boolean;
  incrementUsage: () => Promise<void>;
  refetch: () => void;
}

export function useGenerationUsage(): UseGenerationUsageResult {
  const [usageCount, setUsageCount] = useState<number>(0);

  const { data, loading, refresh } = useQuery<GetUserPreferencesQuery>({
    query: getUserPreferencesQuery,
  });

  useEffect(() => {
    if (data?.getUserPreferences?.aiGenerationUsageCount !== undefined && data.getUserPreferences.aiGenerationUsageCount !== null) {
      setUsageCount(data.getUserPreferences.aiGenerationUsageCount);
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

  const remainingUses = Math.max(0, MAX_FREE_AI_GENERATIONS - usageCount);
  const hasAvailableUses = usageCount < MAX_FREE_AI_GENERATIONS;

  return {
    usageCount,
    remainingUses,
    hasAvailableUses,
    isLoading: loading,
    incrementUsage,
    refetch: refresh,
  };
}

