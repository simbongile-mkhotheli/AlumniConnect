import ApiService from './api';
import { EventsMockApiService } from './mockApis';
import { EVENTS } from './endpoints';
import { shouldUseMockApi } from './useMockApi';
import type {
  Event,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../types';

/**
 * Events Service
 * Handles all event-related API operations
 */
export class EventsService {

  /**
   * Get all events with optional filtering and pagination
   */
  static async getEvents(
    page: number = 1,
    limit: number = 20,
    filters?: FilterState
  ): Promise<PaginatedResponse<Event>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.getEvents(page, limit, filters);
    }

    const params: Record<string, any> = {};

    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if (filters?.location) params.location = filters.location;
    if (filters?.sponsor) params.sponsor = filters.sponsor;
    if (filters?.search) params.search = filters.search;

  return ApiService.getPaginated<Event>(EVENTS.BASE, page, limit, params);
  }

  /**
   * Get event by ID
   */
  static async getEvent(id: string): Promise<ApiResponse<Event>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.getEvent(id);
    }

  return ApiService.get<Event>(EVENTS.BY_ID(id));
  }

  /**
   * Create new event
   */
  static async createEvent(
    eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Event>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.createEvent(eventData);
    }

  return ApiService.post<Event>(EVENTS.BASE, eventData);
  }

  /**
   * Update existing event
   */
  static async updateEvent(
    id: string,
    eventData: Partial<Event>
  ): Promise<ApiResponse<Event>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.updateEvent(id, eventData);
    }

  return ApiService.put<Event>(EVENTS.BY_ID(id), eventData);
  }

  /**
   * Delete event
   */
  static async deleteEvent(id: string): Promise<ApiResponse<void>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.deleteEvent(id);
    }

  return ApiService.delete<void>(EVENTS.BY_ID(id));
  }

  /**
   * Publish event
   */
  static async publishEvent(id: string): Promise<ApiResponse<Event>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.publishEvent(id);
    }

  return ApiService.post<Event>(EVENTS.PUBLISH(id));
  }

  /**
   * Unpublish event
   */
  static async unpublishEvent(id: string): Promise<ApiResponse<Event>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.unpublishEvent(id);
    }

  return ApiService.post<Event>(EVENTS.UNPUBLISH(id));
  }

  /**
   * Cancel event
   */
  static async cancelEvent(id: string): Promise<ApiResponse<Event>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.cancelEvent(id);
    }

  return ApiService.post<Event>(EVENTS.CANCEL(id));
  }

  /**
   * Get event attendees
   */
  static async getEventAttendees(id: string): Promise<
    ApiResponse<
      Array<{
        userId: string;
        userName: string;
        userEmail: string;
        rsvpDate: string;
        attendanceStatus: 'registered' | 'attended' | 'no_show';
        ticketType?: string;
      }>
    >
  > {
  if (shouldUseMockApi()) {
      return EventsMockApiService.getEventAttendees(id);
    }

  return ApiService.get<any[]>(EVENTS.ATTENDEES(id));
  }

  /**
   * RSVP to event
   */
  static async rsvpToEvent(
    id: string,
    rsvpData: {
      userId: string;
      ticketType?: string;
      specialRequests?: string;
    }
  ): Promise<ApiResponse<{ success: boolean; message: string; rsvpCount?: number }>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.rsvpToEvent(id, rsvpData);
    }
    // For now backend returns success + message; we extend with optional rsvpCount for tests expecting count only
    return ApiService.post<{
      success: boolean;
      message: string;
      rsvpCount?: number;
    }>(
      EVENTS.RSVP(id),
      rsvpData
    );
  }

  /**
   * Get event analytics
   */
  static async getEventAnalytics(id: string): Promise<
    ApiResponse<{
      totalRSVPs: number;
      actualAttendance: number;
      attendanceRate: number;
      registrationTrend: Array<{ date: string; count: number }>[];
      demographicBreakdown: Record<string, number>;
      feedbackScore: number;
      socialEngagement: {
        shares: number;
        likes: number;
        comments: number;
      };
    }>
  > {
  if (shouldUseMockApi()) {
      return EventsMockApiService.getEventAnalytics(id);
    }

  return ApiService.get<any>(EVENTS.ANALYTICS(id));
  }

  /**
   * Get featured events
   */
  static async getFeaturedEvents(): Promise<ApiResponse<Event[]>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.getFeaturedEvents();
    }

  return ApiService.get<Event[]>(EVENTS.FEATURED);
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(): Promise<ApiResponse<Event[]>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.getUpcomingEvents();
    }

  return ApiService.get<Event[]>(EVENTS.UPCOMING);
  }

  /**
   * Get past events
   */
  static async getPastEvents(): Promise<ApiResponse<Event[]>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.getPastEvents();
    }

  return ApiService.get<Event[]>(EVENTS.PAST);
  }

  /**
   * Search events
   */
  static async searchEvents(
    query: string,
    filters?: Partial<FilterState>
  ): Promise<ApiResponse<Event[]>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.searchEvents(query, filters);
    }

    const params = {
      q: query,
      ...filters,
    };

  return ApiService.get<Event[]>('/search/events', params);
  }

  /**
   * Get events by status
   */
  static async getEventsByStatus(status: string): Promise<ApiResponse<Event[]>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.getEventsByStatus(status);
    }
  // Tests expect the endpoint factory EVENTS.BY_STATUS(status)
  return ApiService.get<Event[]>(EVENTS.BY_STATUS(status));
  }

  /**
   * Get events by sponsor
   */
  static async getEventsBySponsor(
    sponsor: string
  ): Promise<ApiResponse<Event[]>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.getEventsBySponsor(sponsor);
    }

  return ApiService.get<Event[]>(`${EVENTS.BASE}?sponsor=${sponsor}`);
  }

  /**
   * Get event statistics
   */
  static async getEventStats(): Promise<
    ApiResponse<{
      totalEvents: number;
      publishedEvents: number;
      draftEvents: number;
      scheduledEvents: number;
      cancelledEvents: number;
      totalRSVPs: number;
      totalAttendees: number;
      averageAttendanceRate: number;
      upcomingEvents: number;
      pastEvents: number;
      monthlyTrend: Array<{
        month: string;
        events: number;
        rsvps: number;
        attendance: number;
      }>;
    }>
  > {
  if (shouldUseMockApi()) {
      return EventsMockApiService.getEventStats();
    }

  return ApiService.get<any>(`${EVENTS.BASE}/stats`);
  }

  /**
   * Export events data
   */
  static async exportEvents(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    filters?: FilterState
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.exportEvents(format, filters);
    }

    const params = {
      format,
      ...filters,
    };

    return ApiService.get<{
      downloadUrl: string;
    }>(
      `${EVENTS.BASE}/export`,
      params
    );
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
  ): Promise<
    ApiResponse<{
      imported: number;
      skipped: number;
      errors: string[];
    }>
  > {
  if (shouldUseMockApi()) {
      return EventsMockApiService.importEvents(file, options);
    }

    return ApiService.uploadFile<{
      imported: number;
      skipped: number;
      errors: string[];
    }>(
      `${EVENTS.BASE}/import`, file, options
    );
  }

  /**
   * Bulk operations on events
   */
  static async bulkOperation(
    operation:
      | 'publish'
      | 'unpublish'
      | 'delete'
      | 'cancel'
      | 'feature'
      | 'unfeature',
    eventIds: string[]
  ): Promise<ApiResponse<any>> {
  if (shouldUseMockApi()) {
      return EventsMockApiService.bulkOperation(operation, eventIds);
    }

  return ApiService.bulkOperation<any>(EVENTS.BASE, operation, eventIds);
  }
}

export default EventsService;
