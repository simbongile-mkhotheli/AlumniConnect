import type {
  Event,
  EventFormData,
  EventFilters,
  EventAnalytics,
  EventStats,
  EventRSVPData,
  EventAttendee,
  ApiResponse,
  PaginatedResponse,
  BulkOperationResult,
  ExportResult,
  ImportResult,
} from '../types';
import { MockDataLoader } from '@shared/utils/mockDataLoader';

/**
 * Events Mock API Service
 * Uses db.json as data source via MockDataLoader
 */

// Utilities
const delay = (ms = 250) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Filter events based on filters
 */
const filterEvents = (events: Event[], filters: EventFilters): Event[] => {
  return MockDataLoader.filterItems(events, {
    status: filters.status,
    title: filters.search, // Search in title
    organizer: filters.search, // Search in organizer
    location: filters.search, // Search in location
  });
};

/**
 * EventsMockApiService
 * All methods now use data from db.json via MockDataLoader
 */
export class EventsMockApiService {
  static async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return Promise.resolve({ data: { status: 'ok' }, success: true, message: 'events mock healthy' });
  }

  /**
   * Get all events with optional filtering and pagination
   */
  static async getEvents(
    page: number = 1,
    limit: number = 20,
    filters?: EventFilters
  ): Promise<PaginatedResponse<Event>> {
    await delay();

    try {
      let events = await MockDataLoader.getEvents();

      // Apply filters if provided
      if (filters) {
        events = filterEvents(events, filters);
      }

      // Sort by start date (newest first) by default
      events = MockDataLoader.sortItems(events, 'startDate', 'desc');

      // Apply pagination
      const paginatedResult = MockDataLoader.paginateItems(events, page, limit);

      return {
        data: paginatedResult.items,
        pagination: {
          page: paginatedResult.page,
          limit: paginatedResult.limit,
          total: paginatedResult.total,
          totalPages: paginatedResult.totalPages,
        },
        success: true,
        message: 'Events retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
        success: false,
        message: 'Failed to retrieve events',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get event by ID
   */
  static async getEvent(id: string): Promise<ApiResponse<Event>> {
    await delay();

    try {
      const event = await MockDataLoader.findById<Event>('events', id);

      if (!event) {
        return {
          data: null as any,
          success: false,
          message: 'Event not found',
          error: {
            code: 404,
            message: 'Event not found',
          },
        };
      }

      return {
        data: event,
        success: true,
        message: 'Event retrieved successfully',
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to retrieve event',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Create new event
   */
  static async createEvent(eventData: EventFormData): Promise<ApiResponse<Event>> {
    await delay();

    try {
      const newEvent: Event = {
        ...eventData,
        id: `event-${Date.now()}`,
        rsvpCount: 0,
        attendanceCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const persisted = await MockDataLoader.createItem<Event>('events', newEvent);
      return {
        data: persisted!,
        success: true,
        message: 'Event created successfully',
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to create event',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Update event
   */
  static async updateEvent(
    id: string,
    eventData: Partial<EventFormData>
  ): Promise<ApiResponse<Event>> {
    await delay();

    try {
      const existingEvent = await MockDataLoader.findById<Event>('events', id);

      if (!existingEvent) {
        return {
          data: null as any,
          success: false,
          message: 'Event not found',
          error: {
            code: 404,
            message: 'Event not found',
          },
        };
      }

      const updatedEvent: Event = {
        ...existingEvent,
        ...eventData,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };
      const persisted = await MockDataLoader.putItem<Event>('events', id, updatedEvent);
      return {
        data: persisted!,
        success: true,
        message: 'Event updated successfully',
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to update event',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Delete event
   */
  static async deleteEvent(id: string): Promise<ApiResponse<void>> {
    await delay();

    try {
      const existingEvent = await MockDataLoader.findById<Event>('events', id);

      if (!existingEvent) {
        return {
          data: undefined as any,
          success: false,
          message: 'Event not found',
          error: {
            code: 404,
            message: 'Event not found',
          },
        };
      }
      await MockDataLoader.deleteItem('events', id);
      return {
        data: undefined as any,
        success: true,
        message: 'Event deleted successfully',
      };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to delete event',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Publish event
   */
  static async publishEvent(id: string): Promise<ApiResponse<Event>> {
    return this.updateEvent(id, { status: 'published' });
  }

  /**
   * Unpublish event
   */
  static async unpublishEvent(id: string): Promise<ApiResponse<Event>> {
    return this.updateEvent(id, { status: 'draft' });
  }

  /**
   * Cancel event
   */
  static async cancelEvent(id: string): Promise<ApiResponse<Event>> {
    return this.updateEvent(id, { status: 'cancelled' });
  }

  /**
   * RSVP to event
   */
  static async rsvpToEvent(
    id: string,
    rsvpData: EventRSVPData
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    await delay();

    try {
      const event = await MockDataLoader.findById<Event>('events', id);

      if (!event) {
        return {
          data: { success: false, message: 'Event not found' },
          success: false,
          message: 'Event not found',
          error: {
            code: 404,
            message: 'Event not found',
          },
        };
      }

      // Check if event is published and not cancelled
      if (event.status !== 'published') {
        return {
          data: { success: false, message: 'Event is not available for RSVP' },
          success: false,
          message: 'Event is not available for RSVP',
          error: {
            code: 400,
            message: 'Event is not published',
          },
        };
      }

      // Check if event is in the future
      const eventDate = new Date(event.startDate);
      const now = new Date();
      if (eventDate <= now) {
        return {
          data: { success: false, message: 'Cannot RSVP to past events' },
          success: false,
          message: 'Cannot RSVP to past events',
          error: {
            code: 400,
            message: 'Event has already started or ended',
          },
        };
      }

      // Simulate checking if user already RSVPed
      const existingRsvps = JSON.parse(localStorage.getItem('mockRsvps') || '{}');
      const userRsvps = existingRsvps[rsvpData.userId] || [];

      if (userRsvps.includes(id)) {
        return {
          data: {
            success: false,
            message: 'You have already RSVPed to this event',
          },
          success: false,
          message: 'Already RSVPed',
          error: {
            code: 400,
            message: 'User has already RSVPed to this event',
          },
        };
      }

      // Add RSVP
      userRsvps.push(id);
      existingRsvps[rsvpData.userId] = userRsvps;
      localStorage.setItem('mockRsvps', JSON.stringify(existingRsvps));

      // Update event RSVP count
      const updatedEvent = {
        ...event,
        rsvpCount: (event.rsvpCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('events');

      console.log(`✅ RSVP successful for user ${rsvpData.userId} to event ${id}`);

      return {
        data: { success: true, message: 'RSVP successful' },
        success: true,
        message: 'RSVP successful',
      };
    } catch (error) {
      return {
        data: { success: false, message: 'RSVP failed' },
        success: false,
        message: 'Failed to RSVP to event',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get event attendees
   */
  static async getEventAttendees(id: string): Promise<ApiResponse<EventAttendee[]>> {
    await delay();

    try {
      const event = await MockDataLoader.findById<Event>('events', id);

      if (!event) {
        return {
          data: [],
          success: false,
          message: 'Event not found',
          error: {
            code: 404,
            message: 'Event not found',
          },
        };
      }

      // Mock attendees data
      const mockAttendees: EventAttendee[] = Array.from(
        { length: event.rsvpCount || 0 },
        (_, index) => ({
          userId: `user-${index + 1}`,
          userName: `User ${index + 1}`,
          userEmail: `user${index + 1}@example.com`,
          rsvpDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          attendanceStatus: Math.random() > 0.3 ? 'registered' : 'attended',
          ticketType: 'general',
        })
      );

      return {
        data: mockAttendees,
        success: true,
        message: 'Event attendees retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve event attendees',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get event analytics
   */
  static async getEventAnalytics(id: string): Promise<ApiResponse<EventAnalytics>> {
    await delay();

    try {
      const event = await MockDataLoader.findById<Event>('events', id);

      if (!event) {
        return {
          data: null as any,
          success: false,
          message: 'Event not found',
          error: {
            code: 404,
            message: 'Event not found',
          },
        };
      }

      // Mock analytics data
      const analytics: EventAnalytics = {
        totalRSVPs: event.rsvpCount || 0,
        actualAttendance: event.attendanceCount || 0,
        attendanceRate: event.rsvpCount
          ? Math.round(((event.attendanceCount || 0) / event.rsvpCount) * 100)
          : 0,
        registrationTrend: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10) + 1,
        })),
        demographicBreakdown: {
          Alumni: 60,
          Students: 25,
          Industry: 15,
        },
        feedbackScore: 4.2 + Math.random() * 0.6,
        socialEngagement: {
          shares: Math.floor(Math.random() * 50) + 10,
          likes: Math.floor(Math.random() * 200) + 50,
          comments: Math.floor(Math.random() * 30) + 5,
        },
      };

      return {
        data: analytics,
        success: true,
        message: 'Event analytics retrieved successfully',
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to retrieve event analytics',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get events by status
   */
  static async getEventsByStatus(status: string): Promise<ApiResponse<Event[]>> {
    await delay();

    try {
      const events = await MockDataLoader.getEvents();
      const filteredEvents = events.filter(event => event.status === status);

      return {
        data: filteredEvents,
        success: true,
        message: `Events with status '${status}' retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve events by status',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(): Promise<ApiResponse<Event[]>> {
    await delay();

    try {
      const events = await MockDataLoader.getEvents();
      const now = new Date();

      const upcomingEvents = events
        .filter(event => event.status === 'published' && new Date(event.startDate) > now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      return {
        data: upcomingEvents,
        success: true,
        message: 'Upcoming events retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve upcoming events',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get past events
   */
  static async getPastEvents(): Promise<ApiResponse<Event[]>> {
    await delay();

    try {
      const events = await MockDataLoader.getEvents();
      const now = new Date();

      const pastEvents = events
        .filter(event => 
          event.status === 'published' &&
          new Date(event.endDate || event.startDate) < now
        )
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

      return {
        data: pastEvents,
        success: true,
        message: 'Past events retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve past events',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get featured events
   */
  static async getFeaturedEvents(): Promise<ApiResponse<Event[]>> {
    await delay();

    try {
      const events = await MockDataLoader.getEvents();
      const featuredEvents = events.filter(event => event.isFeatured);

      return {
        data: featuredEvents,
        success: true,
        message: 'Featured events retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve featured events',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Search events
   */
  static async searchEvents(
    query: string,
    filters?: Partial<EventFilters>
  ): Promise<ApiResponse<Event[]>> {
    await delay();

    try {
      const events = await MockDataLoader.getEvents();

      // Filter by search query
      const searchResults = events.filter(event =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        event.organizer.toLowerCase().includes(query.toLowerCase()) ||
        event.location.toLowerCase().includes(query.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      // Apply additional filters if provided
      let filteredResults = searchResults;
      if (filters) {
        filteredResults = filterEvents(searchResults, filters as EventFilters);
      }

      return {
        data: filteredResults,
        success: true,
        message: `Found ${filteredResults.length} events matching "${query}"`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to search events',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get events by sponsor
   */
  static async getEventsBySponsor(sponsor: string): Promise<ApiResponse<Event[]>> {
    await delay();

    try {
      const events = await MockDataLoader.getEvents();
      const sponsorEvents = events.filter(event => 
        event.sponsor?.toLowerCase() === sponsor.toLowerCase()
      );

      return {
        data: sponsorEvents,
        success: true,
        message: `Events sponsored by ${sponsor} retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve events by sponsor',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get event statistics
   */
  static async getEventStats(): Promise<ApiResponse<EventStats>> {
    await delay();

    try {
      const events = await MockDataLoader.getEvents();
      const now = new Date();

      const stats: EventStats = {
        totalEvents: events.length,
        publishedEvents: events.filter(e => e.status === 'published').length,
        draftEvents: events.filter(e => e.status === 'draft').length,
        scheduledEvents: events.filter(e => e.status === 'scheduled').length,
        cancelledEvents: events.filter(e => e.status === 'cancelled').length,
        totalRSVPs: events.reduce((sum, e) => sum + (e.rsvpCount || 0), 0),
        totalAttendees: events.reduce((sum, e) => sum + (e.attendanceCount || 0), 0),
        averageAttendanceRate: events.length > 0
          ? Math.round((events.reduce((sum, e) => {
              const rate = e.rsvpCount ? (e.attendanceCount || 0) / e.rsvpCount : 0;
              return sum + rate;
            }, 0) / events.length) * 100)
          : 0,
        upcomingEvents: events.filter(e => e.status === 'published' && new Date(e.startDate) > now).length,
        pastEvents: events.filter(e => e.status === 'published' && new Date(e.endDate || e.startDate) < now).length,
        monthlyTrend: Array.from({ length: 6 }, (_, i) => {
          const month = new Date();
          month.setMonth(month.getMonth() - (5 - i));
          return {
            month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            events: Math.floor(Math.random() * 10) + 1,
            rsvps: Math.floor(Math.random() * 100) + 20,
            attendance: Math.floor(Math.random() * 80) + 15,
          };
        }),
      };

      return {
        data: stats,
        success: true,
        message: 'Event statistics retrieved successfully',
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to retrieve event statistics',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Export events data
   */
  static async exportEvents(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    filters?: EventFilters
  ): Promise<ApiResponse<ExportResult>> {
    await delay();

    try {
      // Mock export functionality
      const downloadUrl = `https://api.alumniconnect.com/exports/events-${Date.now()}.${format}`;

      return {
        data: { downloadUrl },
        success: true,
        message: `Events exported successfully as ${format.toUpperCase()}`,
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to export events',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Import events data
   */
  static async importEvents(
    file: File,
    options?: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
    }
  ): Promise<ApiResponse<ImportResult>> {
    await delay(1000); // Longer delay for import

    try {
      // Mock import functionality
      const result: ImportResult = {
        imported: Math.floor(Math.random() * 20) + 5,
        skipped: Math.floor(Math.random() * 5),
        errors: [],
      };

      return {
        data: result,
        success: true,
        message: `Import completed: ${result.imported} events imported, ${result.skipped} skipped`,
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to import events',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Bulk operations on events
   */
  static async bulkOperation(
    operation: 'publish' | 'unpublish' | 'delete' | 'cancel' | 'feature' | 'unfeature',
    eventIds: string[]
  ): Promise<ApiResponse<BulkOperationResult>> {
    await delay();

    try {
      const events = await MockDataLoader.getEvents();
      let updatedCount = 0;

      for (const id of eventIds) {
        const event = events.find(e => e.id === id);
        if (event) {
          updatedCount++;
          // In real implementation, would update the event based on operation
        }
      }

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('events');

      const result: BulkOperationResult = { updatedCount };

      return {
        data: result,
        success: true,
        message: `Bulk ${operation} completed on ${updatedCount} events`,
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: `Failed to perform bulk ${operation}`,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}