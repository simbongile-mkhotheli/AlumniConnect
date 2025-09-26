import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MentorshipService } from '../mentorshipService';
import ApiService from '../api';
import { MentorshipsMockApiService } from '../mockApis';
import { MENTORSHIP } from '../endpoints';
import type {
  Mentorship,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../../types';

// Mock dependencies
vi.mock('../api');
vi.mock('../mockApis');
vi.mock('../endpoints', () => ({
  MENTORSHIP: {
    BASE: '/api/mentorships',
    BY_ID: (id: string) => `/api/mentorships/${id}`,
    APPROVE: (id: string) => `/api/mentorships/${id}/approve`,
    REJECT: (id: string) => `/api/mentorships/${id}/reject`,
    COMPLETE: (id: string) => `/api/mentorships/${id}/complete`,
    SESSIONS: (id: string) => `/api/mentorships/${id}/sessions`,
    SCHEDULE: (id: string) => `/api/mentorships/${id}/schedule`,
    BY_TYPE: (type: string) => `/api/mentorships/type/${type}`,
    BY_STATUS: (status: string) => `/api/mentorships/status/${status}`,
    ACTIVE: '/api/mentorships/active',
    PENDING: '/api/mentorships/pending',
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

describe('MentorshipService', () => {
  const mockMentorship: Mentorship = {
    id: '1',
    title: 'React Development Mentorship',
    type: 'technical',
    status: 'active',
    mentorId: 'mentor-1',
    mentorName: 'John Doe',
    menteeId: 'mentee-1',
    menteeName: 'Jane Smith',
    description: 'Learn React development from scratch',
    tags: ['react', 'javascript', 'frontend'],
    sessionCount: 5,
    nextSessionDate: '2024-01-15T10:00:00Z',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-03-01T00:00:00Z',
    category: 'web-development',
  };

  const mockPaginatedResponse: PaginatedResponse<Mentorship> = {
    data: [mockMentorship],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
    success: true,
  };

  const mockApiResponse: ApiResponse<Mentorship> = {
    data: mockMentorship,
    success: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.VITE_ENABLE_MOCK_API = 'false';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getMentorships', () => {
    it('should fetch mentorships with default parameters', async () => {
      vi.mocked(ApiService.getPaginated).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await MentorshipService.getMentorships();

      expect(ApiService.getPaginated).toHaveBeenCalledWith(
        MENTORSHIP.BASE,
        1,
        20,
        {}
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should fetch mentorships with custom parameters and filters', async () => {
      const filters: FilterState = {
        status: 'active',
        type: 'technical',
        search: 'react',
      };
      vi.mocked(ApiService.getPaginated).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await MentorshipService.getMentorships(2, 10, filters);

      expect(ApiService.getPaginated).toHaveBeenCalledWith(
        MENTORSHIP.BASE,
        2,
        10,
        {
          status: 'active',
          type: 'technical',
          search: 'react',
        }
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(MentorshipsMockApiService.getMentorships).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await MentorshipService.getMentorships();

      expect(MentorshipsMockApiService.getMentorships).toHaveBeenCalledWith(
        1,
        20,
        undefined
      );
      expect(ApiService.getPaginated).not.toHaveBeenCalled();
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('getMentorship', () => {
    it('should fetch a single mentorship by ID', async () => {
      vi.mocked(ApiService.get).mockResolvedValue(mockApiResponse);

      const result = await MentorshipService.getMentorship('1');

      expect(ApiService.get).toHaveBeenCalledWith(MENTORSHIP.BY_ID('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(MentorshipsMockApiService.getMentorship).mockResolvedValue(
        mockApiResponse
      );

      const result = await MentorshipService.getMentorship('1');

      expect(MentorshipsMockApiService.getMentorship).toHaveBeenCalledWith('1');
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('createMentorship', () => {
    it('should create a new mentorship', async () => {
      const mentorshipData = { ...mockMentorship };
      delete (mentorshipData as any).id;
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await MentorshipService.createMentorship(mentorshipData);

      expect(ApiService.post).toHaveBeenCalledWith(
        MENTORSHIP.BASE,
        mentorshipData
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mentorshipData = { ...mockMentorship };
      delete (mentorshipData as any).id;
      vi.mocked(MentorshipsMockApiService.createMentorship).mockResolvedValue(
        mockApiResponse
      );

      const result = await MentorshipService.createMentorship(mentorshipData);

      expect(MentorshipsMockApiService.createMentorship).toHaveBeenCalledWith(
        mentorshipData
      );
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('updateMentorship', () => {
    it('should update an existing mentorship', async () => {
      const updateData = { title: 'Updated Title' };
      vi.mocked(ApiService.put).mockResolvedValue(mockApiResponse);

      const result = await MentorshipService.updateMentorship('1', updateData);

      expect(ApiService.put).toHaveBeenCalledWith(
        MENTORSHIP.BY_ID('1'),
        updateData
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const updateData = { title: 'Updated Title' };
      vi.mocked(MentorshipsMockApiService.updateMentorship).mockResolvedValue(
        mockApiResponse
      );

      const result = await MentorshipService.updateMentorship('1', updateData);

      expect(MentorshipsMockApiService.updateMentorship).toHaveBeenCalledWith(
        '1',
        updateData
      );
      expect(ApiService.put).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('deleteMentorship', () => {
    it('should delete a mentorship', async () => {
      const deleteResponse: ApiResponse<null> = {
        success: true,
        data: null,
      };
      vi.mocked(ApiService.delete).mockResolvedValue(deleteResponse);

      const result = await MentorshipService.deleteMentorship('1');

      expect(ApiService.delete).toHaveBeenCalledWith(MENTORSHIP.BY_ID('1'));
      expect(result).toEqual(deleteResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const deleteResponse: ApiResponse<null> = {
        success: true,
        data: null,
      };
      vi.mocked(MentorshipsMockApiService.deleteMentorship).mockResolvedValue(
        deleteResponse
      );

      const result = await MentorshipService.deleteMentorship('1');

      expect(MentorshipsMockApiService.deleteMentorship).toHaveBeenCalledWith(
        '1'
      );
      expect(ApiService.delete).not.toHaveBeenCalled();
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('approveMentorship', () => {
    it('should approve a mentorship', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await MentorshipService.approveMentorship('1');

      expect(ApiService.post).toHaveBeenCalledWith(MENTORSHIP.APPROVE('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(MentorshipsMockApiService.approveMentorship).mockResolvedValue(
        mockApiResponse
      );

      const result = await MentorshipService.approveMentorship('1');

      expect(MentorshipsMockApiService.approveMentorship).toHaveBeenCalledWith(
        '1'
      );
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('rejectMentorship', () => {
    it('should reject a mentorship without reason', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await MentorshipService.rejectMentorship('1');

      expect(ApiService.post).toHaveBeenCalledWith(MENTORSHIP.REJECT('1'), {
        reason: undefined,
      });
      expect(result).toEqual(mockApiResponse);
    });

    it('should reject a mentorship with reason', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await MentorshipService.rejectMentorship(
        '1',
        'Not suitable'
      );

      expect(ApiService.post).toHaveBeenCalledWith(MENTORSHIP.REJECT('1'), {
        reason: 'Not suitable',
      });
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(MentorshipsMockApiService.rejectMentorship).mockResolvedValue(
        mockApiResponse
      );

      const result = await MentorshipService.rejectMentorship(
        '1',
        'Not suitable'
      );

      expect(MentorshipsMockApiService.rejectMentorship).toHaveBeenCalledWith(
        '1',
        'Not suitable'
      );
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('completeMentorship', () => {
    it('should complete a mentorship without feedback', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await MentorshipService.completeMentorship('1');

      expect(ApiService.post).toHaveBeenCalledWith(
        MENTORSHIP.COMPLETE('1'),
        undefined
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should complete a mentorship with feedback', async () => {
      const feedback = {
        mentorFeedback: 'Great mentee',
        menteeFeedback: 'Excellent mentor',
        rating: 5,
      };
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await MentorshipService.completeMentorship('1', feedback);

      expect(ApiService.post).toHaveBeenCalledWith(
        MENTORSHIP.COMPLETE('1'),
        feedback
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const feedback = { rating: 5 };
      vi.mocked(MentorshipsMockApiService.completeMentorship).mockResolvedValue(
        mockApiResponse
      );

      const result = await MentorshipService.completeMentorship('1', feedback);

      expect(MentorshipsMockApiService.completeMentorship).toHaveBeenCalledWith(
        '1',
        feedback
      );
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('getMentorshipSessions', () => {
    it('should fetch mentorship sessions', async () => {
      const mockSessions = [
        {
          sessionId: 'session-1',
          title: 'Introduction Session',
          scheduledAt: '2024-01-15T10:00:00Z',
          duration: 60,
          status: 'completed' as const,
        },
      ];
      const sessionsResponse: ApiResponse<typeof mockSessions> = {
        data: mockSessions,
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(sessionsResponse);

      const result = await MentorshipService.getMentorshipSessions('1');

      expect(ApiService.get).toHaveBeenCalledWith(MENTORSHIP.SESSIONS('1'));
      expect(result).toEqual(sessionsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mockSessions = [{ sessionId: 'session-1' }];
      const sessionsResponse: ApiResponse<typeof mockSessions> = {
        data: mockSessions,
        success: true,
      };
      vi.mocked(
        MentorshipsMockApiService.getMentorshipSessions
      ).mockResolvedValue(sessionsResponse);

      const result = await MentorshipService.getMentorshipSessions('1');

      expect(
        MentorshipsMockApiService.getMentorshipSessions
      ).toHaveBeenCalledWith('1');
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(sessionsResponse);
    });
  });

  describe('scheduleSession', () => {
    it('should schedule a new session', async () => {
      const sessionData = {
        title: 'New Session',
        scheduledAt: '2024-01-20T10:00:00Z',
        duration: 60,
      };
      const sessionResponse: ApiResponse<any> = {
        data: { sessionId: 'new-session' },
        success: true,
      };
      vi.mocked(ApiService.post).mockResolvedValue(sessionResponse);

      const result = await MentorshipService.scheduleSession('1', sessionData);

      expect(ApiService.post).toHaveBeenCalledWith(
        MENTORSHIP.SCHEDULE('1'),
        sessionData
      );
      expect(result).toEqual(sessionResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const sessionData = {
        title: 'New Session',
        scheduledAt: '2024-01-20T10:00:00Z',
        duration: 60,
      };
      const sessionResponse: ApiResponse<any> = {
        data: { sessionId: 'new-session' },
        success: true,
      };
      vi.mocked(MentorshipsMockApiService.scheduleSession).mockResolvedValue(
        sessionResponse
      );

      const result = await MentorshipService.scheduleSession('1', sessionData);

      expect(MentorshipsMockApiService.scheduleSession).toHaveBeenCalledWith(
        '1',
        sessionData
      );
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(sessionResponse);
    });
  });

  describe('getMentorshipsByType', () => {
    it('should fetch mentorships by type', async () => {
      const mentorshipsResponse: ApiResponse<Mentorship[]> = {
        data: [mockMentorship],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(mentorshipsResponse);

      const result = await MentorshipService.getMentorshipsByType('technical');

      expect(ApiService.get).toHaveBeenCalledWith(
        MENTORSHIP.BY_TYPE('technical')
      );
      expect(result).toEqual(mentorshipsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mentorshipsResponse: ApiResponse<Mentorship[]> = {
        data: [mockMentorship],
        success: true,
      };
      vi.mocked(
        MentorshipsMockApiService.getMentorshipsByType
      ).mockResolvedValue(mentorshipsResponse);

      const result = await MentorshipService.getMentorshipsByType('technical');

      expect(
        MentorshipsMockApiService.getMentorshipsByType
      ).toHaveBeenCalledWith('technical');
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mentorshipsResponse);
    });
  });

  describe('getMentorshipsByStatus', () => {
    it('should fetch mentorships by status', async () => {
      const mentorshipsResponse: ApiResponse<Mentorship[]> = {
        data: [mockMentorship],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(mentorshipsResponse);

      const result = await MentorshipService.getMentorshipsByStatus('active');

      expect(ApiService.get).toHaveBeenCalledWith(
        MENTORSHIP.BY_STATUS('active')
      );
      expect(result).toEqual(mentorshipsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mentorshipsResponse: ApiResponse<Mentorship[]> = {
        data: [mockMentorship],
        success: true,
      };
      vi.mocked(
        MentorshipsMockApiService.getMentorshipsByStatus
      ).mockResolvedValue(mentorshipsResponse);

      const result = await MentorshipService.getMentorshipsByStatus('active');

      expect(
        MentorshipsMockApiService.getMentorshipsByStatus
      ).toHaveBeenCalledWith('active');
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mentorshipsResponse);
    });
  });

  describe('getActiveMentorships', () => {
    it('should fetch active mentorships', async () => {
      const mentorshipsResponse: ApiResponse<Mentorship[]> = {
        data: [mockMentorship],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(mentorshipsResponse);

      const result = await MentorshipService.getActiveMentorships();

      expect(ApiService.get).toHaveBeenCalledWith(MENTORSHIP.ACTIVE);
      expect(result).toEqual(mentorshipsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mentorshipsResponse: ApiResponse<Mentorship[]> = {
        data: [mockMentorship],
        success: true,
      };
      vi.mocked(
        MentorshipsMockApiService.getActiveMentorships
      ).mockResolvedValue(mentorshipsResponse);

      const result = await MentorshipService.getActiveMentorships();

      expect(MentorshipsMockApiService.getActiveMentorships).toHaveBeenCalled();
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mentorshipsResponse);
    });
  });

  describe('getPendingMentorships', () => {
    it('should fetch pending mentorships', async () => {
      const mentorshipsResponse: ApiResponse<Mentorship[]> = {
        data: [mockMentorship],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(mentorshipsResponse);

      const result = await MentorshipService.getPendingMentorships();

      expect(ApiService.get).toHaveBeenCalledWith(MENTORSHIP.PENDING);
      expect(result).toEqual(mentorshipsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mentorshipsResponse: ApiResponse<Mentorship[]> = {
        data: [mockMentorship],
        success: true,
      };
      vi.mocked(
        MentorshipsMockApiService.getPendingMentorships
      ).mockResolvedValue(mentorshipsResponse);

      const result = await MentorshipService.getPendingMentorships();

      expect(
        MentorshipsMockApiService.getPendingMentorships
      ).toHaveBeenCalled();
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mentorshipsResponse);
    });
  });

  describe('bulkOperation', () => {
    it('should perform bulk operations', async () => {
      const bulkResponse: ApiResponse<any> = {
        data: { processed: 2, success: 2, failed: 0 },
        success: true,
      };
      vi.mocked(ApiService.bulkOperation).mockResolvedValue(bulkResponse);

      const result = await MentorshipService.bulkOperation('approve', [
        '1',
        '2',
      ]);

      expect(ApiService.bulkOperation).toHaveBeenCalledWith(
        MENTORSHIP.BASE,
        'approve',
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
      vi.mocked(MentorshipsMockApiService.bulkOperation).mockResolvedValue(
        bulkResponse
      );

      const result = await MentorshipService.bulkOperation('approve', [
        '1',
        '2',
      ]);

      expect(MentorshipsMockApiService.bulkOperation).toHaveBeenCalledWith(
        'approve',
        ['1', '2']
      );
      expect(ApiService.bulkOperation).not.toHaveBeenCalled();
      expect(result).toEqual(bulkResponse);
    });

    it('should handle all bulk operation types', async () => {
      const operations: Array<
        | 'approve'
        | 'reject'
        | 'complete'
        | 'delete'
        | 'activate'
        | 'cancel'
        | 'pause'
      > = [
        'approve',
        'reject',
        'complete',
        'delete',
        'activate',
        'cancel',
        'pause',
      ];
      const bulkResponse: ApiResponse<any> = {
        data: { processed: 1 },
        success: true,
      };
      vi.mocked(ApiService.bulkOperation).mockResolvedValue(bulkResponse);

      for (const operation of operations) {
        await MentorshipService.bulkOperation(operation, ['1']);
        expect(ApiService.bulkOperation).toHaveBeenCalledWith(
          MENTORSHIP.BASE,
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

      await expect(MentorshipService.getMentorship('1')).rejects.toThrow(
        'API Error'
      );
    });

    it('should handle mock API errors gracefully', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mockError = new Error('Mock API Error');
      vi.mocked(MentorshipsMockApiService.getMentorship).mockRejectedValue(
        mockError
      );

      await expect(MentorshipService.getMentorship('1')).rejects.toThrow(
        'Mock API Error'
      );
    });
  });
});
