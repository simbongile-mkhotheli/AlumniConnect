import { useState, useEffect } from 'react';
import { EventsService } from '../services';

/**
 * Hook to fetch and manage upcoming events count
 */
export function useUpcomingEventsCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingEventsCount = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch events and count upcoming ones
        const response = await EventsService.getEvents(1, 100); // Get more events to count properly

        if (response.success && response.data) {
          const now = new Date();
          const upcomingCount = response.data.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= now;
          }).length;

          setCount(upcomingCount);
        } else {
          throw new Error(response.message || 'Failed to fetch events count');
        }
      } catch (err) {
        console.error('❌ Error fetching upcoming events count:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load events count'
        );
        // Set fallback count
        setCount(8);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEventsCount();
  }, []);

  return { count, loading, error };
}
