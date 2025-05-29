import { useCallback } from 'react';

export const useRateLimit = () => {
  const rateLimitState = {
    limit: 100,
    remaining: 100,
    reset: Math.floor(Date.now() / 1000) + 3600
  } as const;

  const checkRateLimit = useCallback(async () => {
    // Here you would typically make an API call to check rate limits
    // For now, we'll just return the current state
    return rateLimitState;
  }, [rateLimitState]);

  return { rateLimit: rateLimitState, checkRateLimit };
}
