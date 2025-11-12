import { useState, useCallback } from 'react';

interface AiUsageStatus {
  canUse: boolean;
  remaining: number;
  limit: number;
  resetDate: Date;
}

interface TrackUsageResponse {
  success: boolean;
  usage: number;
  remaining: number;
  limit: number;
}

export const useAiUsage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageStatus, setUsageStatus] = useState<AiUsageStatus | null>(null);

  const checkUsage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/ai-usage/check');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check AI usage');
      }

      setUsageStatus({
        ...data,
        resetDate: new Date(data.resetDate),
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackUsage = useCallback(async (): Promise<TrackUsageResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/ai-usage/track', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            `AI usage limit reached. Resets on ${new Date(data.resetDate).toLocaleDateString()}`,
          );
        }
        throw new Error(data.error || 'Failed to track AI usage');
      }

      if (usageStatus) {
        setUsageStatus({
          ...usageStatus,
          remaining: data.remaining,
        });
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [usageStatus]);

  return {
    loading,
    error,
    usageStatus,
    checkUsage,
    trackUsage,
  };
};

