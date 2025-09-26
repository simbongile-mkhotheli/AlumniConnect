import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventsService } from '../eventsService';
import ApiService from '../api';
import { EventsMockApiService } from '../mockApis';
import { EVENTS } from '../endpoints';
import type {
  Event,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../../types';

// Mock dependencies
vi.mock('../api');
vi.mock('../mockApis');
vi.mock('../endpoints', () => ({
  EVENTS: {
    BASE: '/api/events',
    BY_ID: (id: string) => `/api/events/${id}`,
    PUBLISH: (id: string) => `/api/events/${id}/publish`,
    CANCEL: (id: string) => `/api/events/${id}/cancel`,
    RSVP: (id: string) => `/api/events/${id}/rsvp`,
    BY_STATUS: (status: string) => `/api/events/status/${status}`,
    FEATURED: '/api/events/featured',
    UPCOMING: '/api/events/upcoming',
  },
}));

// Mock environment variable
const mockEnv = vi.hoisted(() => ({
  VITE_ENABLE_MOCK_API: 'false',
}));

vi.stubGlobal('import', {
  meta: {
    env: mockEnv,
  },
});

describe('EventsService', () => {
  const mockEvent: Event = {
    id: '1',
    title: 'React Conference 2024',
    slug: 'react-conference-2024',
    excerpt: 'Join us for the biggest React conference of the year',
    description:
      'A comprehensive conference covering the latest in React development...',
    coverUrl: 'https://example.com/cover.jpg',
    organizer: 'Tech Events Inc',
    location: 'Cape Town',
    venue: 'Cape Town Convention Centre',
    address: '1 Lower Long Street, Cape Town',
    startDate: '2024-06-15T09:00:00Z',
    endDate: '2024-06-15T17:00:00Z',
    sponsor: 'TechCorp',
    status: 'published',
    isFeatured: true,
    tags: ['react', 'javascript', 'frontend'],
    rsvpUrl: 'https://example.com/rsvp',
    rsvpCount: 150,
    attendanceCount: 120,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };

  const mockPaginatedResponse: PaginatedResponse<Event> = {
    data: [mockEvent],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
    success: true,
  };

  const mockApiResponse: ApiResponse<Event> = {
    data: mockEvent,
    success: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.VITE_ENABLE_MOCK_API = 'false';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getEvents', () => {
    it('should fetch events with default parameters', async () => {
      vi.mocked(ApiService.getPaginated).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await EventsService.getEvents();

      expect(ApiService.getPaginated).toHaveBeenCalledWith(
        EVENTS.BASE,
        1,
        20,
        {}
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should fetch events with custom parameters and filters', async () => {
      const filters: FilterState = {
        status: 'published',
        location: 'Cape Town',
        search: 'react',
      };
      vi.mocked(ApiService.getPaginated).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await EventsService.getEvents(2, 10, filters);

      expect(ApiService.getPaginated).toHaveBeenCalledWith(EVENTS.BASE, 2, 10, {
        status: 'published',
        location: 'Cape Town',
        search: 'react',
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(EventsMockApiService.getEvents).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await EventsService.getEvents();

      expect(EventsMockApiService.getEvents).toHaveBeenCalledWith(
        1,
        20,
        undefined
      );
      expect(ApiService.getPaginated).not.toHaveBeenCalled();
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('getEvent', () => {
    it('should fetch a single event by ID', async () => {
      vi.mocked(ApiService.get).mockResolvedValue(mockApiResponse);

      const result = await EventsService.getEvent('1');

      expect(ApiService.get).toHaveBeenCalledWith(EVENTS.BY_ID('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(EventsMockApiService.getEvent).mockResolvedValue(
        mockApiResponse
      );

      const result = await EventsService.getEvent('1');

      expect(EventsMockApiService.getEvent).toHaveBeenCalledWith('1');
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const eventData = { ...mockEvent };
      delete (eventData as any).id;
      delete (eventData as any).createdAt;
      delete (eventData as any).updatedAt;
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await EventsService.createEvent(eventData);

      expect(ApiService.post).toHaveBeenCalledWith(EVENTS.BASE, eventData);
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const eventData = { ...mockEvent };
      delete (eventData as any).id;
      delete (eventData as any).createdAt;
      delete (eventData as any).updatedAt;
      vi.mocked(EventsMockApiService.createEvent).mockResolvedValue(
        mockApiResponse
      );

      const result = await EventsService.createEvent(eventData);

      expect(EventsMockApiService.createEvent).toHaveBeenCalledWith(eventData);
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      const updateData = { title: 'Updated Event Title' };
      vi.mocked(ApiService.put).mockResolvedValue(mockApiResponse);

      const result = await EventsService.updateEvent('1', updateData);

      expect(ApiService.put).toHaveBeenCalledWith(
        EVENTS.BY_ID('1'),
        updateData
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const updateData = { title: 'Updated Event Title' };
      vi.mocked(EventsMockApiService.updateEvent).mockResolvedValue(
        mockApiResponse
      );

      const result = await EventsService.updateEvent('1', updateData);

      expect(EventsMockApiService.updateEvent).toHaveBeenCalledWith(
        '1',
        updateData
      );
      expect(ApiService.put).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      const deleteResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };
      vi.mocked(ApiService.delete).mockResolvedValue(deleteResponse);

      const result = await EventsService.deleteEvent('1');

      expect(ApiService.delete).toHaveBeenCalledWith(EVENTS.BY_ID('1'));
      expect(result).toEqual(deleteResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const deleteResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };
      vi.mocked(EventsMockApiService.deleteEvent).mockResolvedValue(
        deleteResponse
      );

      const result = await EventsService.deleteEvent('1');

      expect(EventsMockApiService.deleteEvent).toHaveBeenCalledWith('1');
      expect(ApiService.delete).not.toHaveBeenCalled();
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('publishEvent', () => {
    it('should publish an event', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await EventsService.publishEvent('1');

      expect(ApiService.post).toHaveBeenCalledWith(EVENTS.PUBLISH('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(EventsMockApiService.publishEvent).mockResolvedValue(
        mockApiResponse
      );

      const result = await EventsService.publishEvent('1');

      expect(EventsMockApiService.publishEvent).toHaveBeenCalledWith('1');
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('cancelEvent', () => {
    it('should cancel an event', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await EventsService.cancelEvent('1');

      expect(ApiService.post).toHaveBeenCalledWith(EVENTS.CANCEL('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(EventsMockApiService.cancelEvent).mockResolvedValue(
        mockApiResponse
      );

      const result = await EventsService.cancelEvent('1');

      expect(EventsMockApiService.cancelEvent).toHaveBeenCalledWith('1');
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('rsvpToEvent', () => {
    it('should RSVP to an event', async () => {
      const rsvpData = { userId: 'user-1', attending: true };
      const rsvpResponse: ApiResponse<{ success: boolean; message: string; rsvpCount?: number }> = {
        data: { success: true, message: 'RSVP successful', rsvpCount: 151 },
        success: true,
      };
      vi.mocked(ApiService.post).mockResolvedValue(rsvpResponse);

      const result = await EventsService.rsvpToEvent('1', rsvpData);

      expect(ApiService.post).toHaveBeenCalledWith(EVENTS.RSVP('1'), rsvpData);
      expect(result).toEqual(rsvpResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const rsvpData = { userId: 'user-1', attending: false };
      const rsvpResponse: ApiResponse<{ success: boolean; message: string; rsvpCount?: number }> = {
        data: { success: true, message: 'RSVP cancelled successfully', rsvpCount: 149 },
        success: true,
      };
      vi.mocked(EventsMockApiService.rsvpToEvent).mockResolvedValue(
        rsvpResponse
      );

      const result = await EventsService.rsvpToEvent('1', rsvpData);

      expect(EventsMockApiService.rsvpToEvent).toHaveBeenCalledWith(
        '1',
        rsvpData
      );
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(rsvpResponse);
    });
  });

  describe('getEventsByStatus', () => {
    it('should fetch events by status', async () => {
      const eventsResponse: ApiResponse<Event[]> = {
        data: [mockEvent],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(eventsResponse);

      const result = await EventsService.getEventsByStatus('published');

      expect(ApiService.get).toHaveBeenCalledWith(
        EVENTS.BY_STATUS('published')
      );
      expect(result).toEqual(eventsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const eventsResponse: ApiResponse<Event[]> = {
        data: [mockEvent],
        success: true,
      };
      vi.mocked(EventsMockApiService.getEventsByStatus).mockResolvedValue(
        eventsResponse
      );

      const result = await EventsService.getEventsByStatus('published');

      expect(EventsMockApiService.getEventsByStatus).toHaveBeenCalledWith(
        'published'
      );
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(eventsResponse);
    });
  });

  describe('getFeaturedEvents', () => {
    it('should fetch featured events', async () => {
      const eventsResponse: ApiResponse<Event[]> = {
        data: [mockEvent],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(eventsResponse);

      const result = await EventsService.getFeaturedEvents();

      expect(ApiService.get).toHaveBeenCalledWith(EVENTS.FEATURED);
      expect(result).toEqual(eventsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const eventsResponse: ApiResponse<Event[]> = {
        data: [mockEvent],
        success: true,
      };
      vi.mocked(EventsMockApiService.getFeaturedEvents).mockResolvedValue(
        eventsResponse
      );

      const result = await EventsService.getFeaturedEvents();

      expect(EventsMockApiService.getFeaturedEvents).toHaveBeenCalled();
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(eventsResponse);
    });
  });

  describe('getUpcomingEvents', () => {
    it('should fetch upcoming events', async () => {
      const eventsResponse: ApiResponse<Event[]> = {
        data: [mockEvent],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(eventsResponse);

      const result = await EventsService.getUpcomingEvents();

      expect(ApiService.get).toHaveBeenCalledWith(EVENTS.UPCOMING);
      expect(result).toEqual(eventsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const eventsResponse: ApiResponse<Event[]> = {
        data: [mockEvent],
        success: true,
      };
      vi.mocked(EventsMockApiService.getUpcomingEvents).mockResolvedValue(
        eventsResponse
      );

      const result = await EventsService.getUpcomingEvents();

      expect(EventsMockApiService.getUpcomingEvents).toHaveBeenCalled();
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(eventsResponse);
    });
  });

  describe('bulkOperation', () => {
    it('should perform bulk operations', async () => {
      const bulkResponse: ApiResponse<any> = {
        data: { processed: 2, success: 2, failed: 0 },
        success: true,
      };
      vi.mocked(ApiService.bulkOperation).mockResolvedValue(bulkResponse);

      const result = await EventsService.bulkOperation('publish', ['1', '2']);

      expect(ApiService.bulkOperation).toHaveBeenCalledWith(
        EVENTS.BASE,
        'publish',
        ['1', '2']
      );
      expect(result).toEqual(bulkResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const bulkResponse: ApiResponse<any> = {
        data: { processed: 2 },
        success: true,
      };
      vi.mocked(EventsMockApiService.bulkOperation).mockResolvedValue(
        bulkResponse
      );

      const result = await EventsService.bulkOperation('cancel', ['1', '2']);

      expect(EventsMockApiService.bulkOperation).toHaveBeenCalledWith(
        'cancel',
        ['1', '2']
      );
      expect(ApiService.bulkOperation).not.toHaveBeenCalled();
      expect(result).toEqual(bulkResponse);
    });

    it('should handle all bulk operation types', async () => {
      const operations: Array<
        'publish' | 'cancel' | 'delete' | 'feature' | 'unfeature'
      > = ['publish', 'cancel', 'delete', 'feature', 'unfeature'];
      const bulkResponse: ApiResponse<any> = {
        data: { processed: 1 },
        success: true,
      };
      vi.mocked(ApiService.bulkOperation).mockResolvedValue(bulkResponse);

      for (const operation of operations) {
        await EventsService.bulkOperation(operation, ['1']);
        expect(ApiService.bulkOperation).toHaveBeenCalledWith(
          EVENTS.BASE,
          operation,
          ['1']
        );
      }
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const apiError = new Error('API Error');
      vi.mocked(ApiService.get).mockRejectedValue(apiError);

      await expect(EventsService.getEvent('1')).rejects.toThrow('API Error');
    });

    it('should handle mock API errors gracefully', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mockError = new Error('Mock API Error');
      vi.mocked(EventsMockApiService.getEvent).mockRejectedValue(mockError);

      await expect(EventsService.getEvent('1')).rejects.toThrow(
        'Mock API Error'
      );
    });
  });
});
