import { useState, useCallback } from 'react';
import { AnalyticsEvent } from '../types';

export const useAnalytics = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  const trackEvent = useCallback((event: AnalyticsEvent) => {
    setEvents(prev => [...prev, event]);
    // Here you would typically send the event to an analytics service
    console.log('Analytics event:', event);
  }, []);

  return { trackEvent, events };
}
