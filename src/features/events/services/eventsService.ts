import { ApiService, shouldUseMockApi } from '@shared/services';
import { EventsMockApiService } from './mockApi';
import { EVENTS_ENDPOINTS } from './endpoints';
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
    filters?: EventFilters
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

    return ApiService.getPaginated<Event>(EVENTS_ENDPOINTS.BASE, page, limit, params);
  }

  /**
   * Get event by ID
   */
  static async getEvent(id: string): Promise<ApiResponse<Event>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.getEvent(id);
    }

    return ApiService.get<Event>(EVENTS_ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new event
   */
  static async createEvent(
    eventData: EventFormData
  ): Promise<ApiResponse<Event>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.createEvent(eventData);
    }

    return ApiService.post<Event>(EVENTS_ENDPOINTS.BASE, eventData);
  }

  /**
   * Update existing event
   */
  static async updateEvent(
    id: string,
    eventData: Partial<EventFormData>
  ): Promise<ApiResponse<Event>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.updateEvent(id, eventData);
    }

    return ApiService.put<Event>(EVENTS_ENDPOINTS.BY_ID(id), eventData);
  }

  /**
   * Delete event
   */
  static async deleteEvent(id: string): Promise<ApiResponse<void>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.deleteEvent(id);
    }

    return ApiService.delete<void>(EVENTS_ENDPOINTS.BY_ID(id));
  }

  /**
   * Publish event
   */
  static async publishEvent(id: string): Promise<ApiResponse<Event>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.publishEvent(id);
    }

    return ApiService.post<Event>(EVENTS_ENDPOINTS.PUBLISH(id));
  }

  /**
   * Unpublish event
   */
  static async unpublishEvent(id: string): Promise<ApiResponse<Event>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.unpublishEvent(id);
    }

    return ApiService.post<Event>(EVENTS_ENDPOINTS.UNPUBLISH(id));
  }

  /**
   * Cancel event
   */
  static async cancelEvent(id: string): Promise<ApiResponse<Event>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.cancelEvent(id);
    }

    return ApiService.post<Event>(EVENTS_ENDPOINTS.CANCEL(id));
  }

  /**
   * Get event attendees
   */
  static async getEventAttendees(id: string): Promise<ApiResponse<EventAttendee[]>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.getEventAttendees(id);
    }

    return ApiService.get<EventAttendee[]>(EVENTS_ENDPOINTS.ATTENDEES(id));
  }

  /**
   * RSVP to event
   */
  static async rsvpToEvent(
    id: string,
    rsvpData: EventRSVPData
  ): Promise<ApiResponse<{ success: boolean; message: string; rsvpCount?: number }>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.rsvpToEvent(id, rsvpData);
    }

    return ApiService.post<{
      success: boolean;
      message: string;
      rsvpCount?: number;
    }>(EVENTS_ENDPOINTS.RSVP(id), rsvpData);
  }

  /**
   * Get event analytics
   */
  static async getEventAnalytics(id: string): Promise<ApiResponse<EventAnalytics>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.getEventAnalytics(id);
    }

    return ApiService.get<EventAnalytics>(EVENTS_ENDPOINTS.ANALYTICS(id));
  }

  /**
   * Get featured events
   */
  static async getFeaturedEvents(): Promise<ApiResponse<Event[]>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.getFeaturedEvents();
    }

    return ApiService.get<Event[]>(EVENTS_ENDPOINTS.FEATURED);
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(): Promise<ApiResponse<Event[]>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.getUpcomingEvents();
    }

    return ApiService.get<Event[]>(EVENTS_ENDPOINTS.UPCOMING);
  }

  /**
   * Get past events
   */
  static async getPastEvents(): Promise<ApiResponse<Event[]>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.getPastEvents();
    }

    return ApiService.get<Event[]>(EVENTS_ENDPOINTS.PAST);
  }

  /**
   * Search events
   */
  static async searchEvents(
    query: string,
    filters?: Partial<EventFilters>
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

    return ApiService.get<Event[]>(EVENTS_ENDPOINTS.BY_STATUS(status));
  }

  /**
   * Get events by sponsor
   */
  static async getEventsBySponsor(sponsor: string): Promise<ApiResponse<Event[]>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.getEventsBySponsor(sponsor);
    }

    return ApiService.get<Event[]>(`${EVENTS_ENDPOINTS.BASE}?sponsor=${sponsor}`);
  }

  /**
   * Get event statistics
   */
  static async getEventStats(): Promise<ApiResponse<EventStats>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.getEventStats();
    }

    return ApiService.get<EventStats>(`${EVENTS_ENDPOINTS.BASE}/stats`);
  }

  /**
   * Export events data
   */
  static async exportEvents(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    filters?: EventFilters
  ): Promise<ApiResponse<ExportResult>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.exportEvents(format, filters);
    }

    const params = {
      format,
      ...filters,
    };

    return ApiService.get<ExportResult>(`${EVENTS_ENDPOINTS.BASE}/export`, params);
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
    if (shouldUseMockApi()) {
      return EventsMockApiService.importEvents(file, options);
    }

    return ApiService.uploadFile<ImportResult>(`${EVENTS_ENDPOINTS.BASE}/import`, file, options);
  }

  /**
   * Bulk operations on events
   */
  static async bulkOperation(
    operation: 'publish' | 'unpublish' | 'delete' | 'cancel' | 'feature' | 'unfeature',
    eventIds: string[]
  ): Promise<ApiResponse<BulkOperationResult>> {
    if (shouldUseMockApi()) {
      return EventsMockApiService.bulkOperation(operation, eventIds);
    }

    return ApiService.bulkOperation<BulkOperationResult>(EVENTS_ENDPOINTS.BASE, operation, eventIds);
  }
}

export default EventsService;