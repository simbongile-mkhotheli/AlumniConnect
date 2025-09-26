import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QAService } from '../qaService';
import ApiService from '../api';
import { QAMockApiService } from '../mockApis';
import { QA } from '../endpoints';
import type {
  QAItem,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../../types';

// Mock dependencies
vi.mock('../api');
vi.mock('../mockApis');
vi.mock('../endpoints', () => ({
  QA: {
    BASE: '/api/qa',
    BY_ID: (id: string) => `/api/qa/${id}`,
    PUBLISH: (id: string) => `/api/qa/${id}/publish`,
    ARCHIVE: (id: string) => `/api/qa/${id}/archive`,
    FLAG: (id: string) => `/api/qa/${id}/flag`,
    UNFLAG: (id: string) => `/api/qa/${id}/unflag`,
    ANSWERS: (id: string) => `/api/qa/${id}/answers`,
    VOTE: (id: string) => `/api/qa/${id}/vote`,
    BY_CATEGORY: (category: string) => `/api/qa/category/${category}`,
    BY_TYPE: (type: string) => `/api/qa/type/${type}`,
    TRENDING: '/api/qa/trending',
    UNANSWERED: '/api/qa/unanswered',
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

describe('QAService', () => {
  const mockQAItem: QAItem = {
    id: '1',
    type: 'question',
    status: 'published',
    category: 'technical',
    title: 'How to optimize React performance?',
    content: 'I need help optimizing my React application performance...',
    authorId: 'author-1',
    authorName: 'John Doe',
    tags: ['react', 'performance', 'optimization'],
    answerCount: 3,
    viewCount: 150,
    voteCount: 25,
    commentCount: 8,
    participantCount: 12,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };

  const mockPaginatedResponse: PaginatedResponse<QAItem> = {
    data: [mockQAItem],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
    success: true,
  };

  const mockApiResponse: ApiResponse<QAItem> = {
    data: mockQAItem,
    success: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.VITE_ENABLE_MOCK_API = 'false';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getQAItems', () => {
    it('should fetch Q&A items with default parameters', async () => {
      vi.mocked(ApiService.getPaginated).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await QAService.getQAItems();

      expect(ApiService.getPaginated).toHaveBeenCalledWith(QA.BASE, 1, 20, {});
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should fetch Q&A items with custom parameters and filters', async () => {
      const filters: FilterState = {
        status: 'published',
        type: 'question',
        category: 'technical',
        search: 'react',
      };
      vi.mocked(ApiService.getPaginated).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await QAService.getQAItems(2, 10, filters);

      expect(ApiService.getPaginated).toHaveBeenCalledWith(QA.BASE, 2, 10, {
        status: 'published',
        type: 'question',
        category: 'technical',
        search: 'react',
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(QAMockApiService.getQAItems).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await QAService.getQAItems();

      expect(QAMockApiService.getQAItems).toHaveBeenCalledWith(
        1,
        20,
        undefined
      );
      expect(ApiService.getPaginated).not.toHaveBeenCalled();
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('getQAItem', () => {
    it('should fetch a single Q&A item by ID', async () => {
      vi.mocked(ApiService.get).mockResolvedValue(mockApiResponse);

      const result = await QAService.getQAItem('1');

      expect(ApiService.get).toHaveBeenCalledWith(QA.BY_ID('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(QAMockApiService.getQAItem).mockResolvedValue(mockApiResponse);

      const result = await QAService.getQAItem('1');

      expect(QAMockApiService.getQAItem).toHaveBeenCalledWith('1');
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });

    it('should handle API errors gracefully', async () => {
      const apiError = new Error('API Error');
      vi.mocked(ApiService.get).mockRejectedValue(apiError);

      await expect(QAService.getQAItem('1')).rejects.toThrow('API Error');
    });

    it('should handle mock API errors gracefully', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mockError = new Error('Mock API Error');
      vi.mocked(QAMockApiService.getQAItem).mockRejectedValue(mockError);

      await expect(QAService.getQAItem('1')).rejects.toThrow('Mock API Error');
    });
  });

  describe('createQAItem', () => {
    it('should create a new Q&A item', async () => {
      const qaItemData = {
        type: 'question' as const,
        status: 'pending' as const,
        category: 'technical' as const,
        title: 'New Question',
        content: 'Question content',
        authorId: 'author-1',
        authorName: 'John Doe',
        tags: ['react'],
        answerCount: 0,
        viewCount: 0,
        voteCount: 0,
      };
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await QAService.createQAItem(qaItemData);

      expect(ApiService.post).toHaveBeenCalledWith(QA.BASE, qaItemData);
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const qaItemData = {
        type: 'question' as const,
        status: 'pending' as const,
        category: 'technical' as const,
        title: 'New Question',
        content: 'Question content',
        authorId: 'author-1',
        authorName: 'John Doe',
        tags: ['react'],
        answerCount: 0,
        viewCount: 0,
        voteCount: 0,
      };
      vi.mocked(QAMockApiService.createQAItem).mockResolvedValue(
        mockApiResponse
      );

      const result = await QAService.createQAItem(qaItemData);

      expect(QAMockApiService.createQAItem).toHaveBeenCalledWith(qaItemData);
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('updateQAItem', () => {
    it('should update an existing Q&A item', async () => {
      const updateData = { title: 'Updated Title' };
      vi.mocked(ApiService.put).mockResolvedValue(mockApiResponse);

      const result = await QAService.updateQAItem('1', updateData);

      expect(ApiService.put).toHaveBeenCalledWith(QA.BY_ID('1'), updateData);
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const updateData = { title: 'Updated Title' };
      vi.mocked(QAMockApiService.updateQAItem).mockResolvedValue(
        mockApiResponse
      );

      const result = await QAService.updateQAItem('1', updateData);

      expect(QAMockApiService.updateQAItem).toHaveBeenCalledWith(
        '1',
        updateData
      );
      expect(ApiService.put).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('deleteQAItem', () => {
    it('should delete a Q&A item', async () => {
      const deleteResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };
      vi.mocked(ApiService.delete).mockResolvedValue(deleteResponse);

      const result = await QAService.deleteQAItem('1');

      expect(ApiService.delete).toHaveBeenCalledWith(QA.BY_ID('1'));
      expect(result).toEqual(deleteResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const deleteResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };
      vi.mocked(QAMockApiService.deleteQAItem).mockResolvedValue(
        deleteResponse
      );

      const result = await QAService.deleteQAItem('1');

      expect(QAMockApiService.deleteQAItem).toHaveBeenCalledWith('1');
      expect(ApiService.delete).not.toHaveBeenCalled();
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('publishQAItem', () => {
    it('should publish a Q&A item', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await QAService.publishQAItem('1');

      expect(ApiService.post).toHaveBeenCalledWith(QA.PUBLISH('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(QAMockApiService.publishQAItem).mockResolvedValue(
        mockApiResponse
      );

      const result = await QAService.publishQAItem('1');

      expect(QAMockApiService.publishQAItem).toHaveBeenCalledWith('1');
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('archiveQAItem', () => {
    it('should archive a Q&A item', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await QAService.archiveQAItem('1');

      expect(ApiService.post).toHaveBeenCalledWith(QA.ARCHIVE('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(QAMockApiService.archiveQAItem).mockResolvedValue(
        mockApiResponse
      );

      const result = await QAService.archiveQAItem('1');

      expect(QAMockApiService.archiveQAItem).toHaveBeenCalledWith('1');
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('flagQAItem', () => {
    it('should flag a Q&A item without reason', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await QAService.flagQAItem('1');

      expect(ApiService.post).toHaveBeenCalledWith(QA.FLAG('1'), {
        reason: undefined,
      });
      expect(result).toEqual(mockApiResponse);
    });

    it('should flag a Q&A item with reason', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await QAService.flagQAItem('1', 'Inappropriate content');

      expect(ApiService.post).toHaveBeenCalledWith(QA.FLAG('1'), {
        reason: 'Inappropriate content',
      });
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(QAMockApiService.flagQAItem).mockResolvedValue(mockApiResponse);

      const result = await QAService.flagQAItem('1', 'Spam');

      expect(QAMockApiService.flagQAItem).toHaveBeenCalledWith('1', 'Spam');
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('unflagQAItem', () => {
    it('should unflag a Q&A item', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await QAService.unflagQAItem('1');

      expect(ApiService.post).toHaveBeenCalledWith(QA.UNFLAG('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(QAMockApiService.unflagQAItem).mockResolvedValue(
        mockApiResponse
      );

      const result = await QAService.unflagQAItem('1');

      expect(QAMockApiService.unflagQAItem).toHaveBeenCalledWith('1');
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('approveQAItem', () => {
    it('should approve a Q&A item', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await QAService.approveQAItem('1');

      expect(ApiService.post).toHaveBeenCalledWith(`${QA.BY_ID('1')}/approve`);
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      vi.mocked(QAMockApiService.approveQAItem).mockResolvedValue(
        mockApiResponse
      );

      const result = await QAService.approveQAItem('1');

      expect(QAMockApiService.approveQAItem).toHaveBeenCalledWith('1');
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('rejectQAItem', () => {
    it('should reject a Q&A item', async () => {
      const rejectResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };
      vi.mocked(ApiService.post).mockResolvedValue(rejectResponse);

      const result = await QAService.rejectQAItem('1');

      expect(ApiService.post).toHaveBeenCalledWith(`${QA.BY_ID('1')}/reject`);
      expect(result).toEqual(rejectResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const rejectResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };
      vi.mocked(QAMockApiService.rejectQAItem).mockResolvedValue(
        rejectResponse
      );

      const result = await QAService.rejectQAItem('1');

      expect(QAMockApiService.rejectQAItem).toHaveBeenCalledWith('1');
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(rejectResponse);
    });
  });

  describe('getQAAnswers', () => {
    it('should fetch Q&A answers', async () => {
      const mockAnswers = [
        {
          answerId: 'answer-1',
          content: 'This is an answer',
          authorId: 'author-2',
          authorName: 'Jane Smith',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          voteCount: 10,
          isAccepted: true,
          isVerified: false,
        },
      ];
      const answersResponse: ApiResponse<typeof mockAnswers> = {
        data: mockAnswers,
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(answersResponse);

      const result = await QAService.getQAAnswers('1');

      expect(ApiService.get).toHaveBeenCalledWith(QA.ANSWERS('1'));
      expect(result).toEqual(answersResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mockAnswers = [{ answerId: 'answer-1' }];
      const answersResponse: ApiResponse<typeof mockAnswers> = {
        data: mockAnswers,
        success: true,
      };
      vi.mocked(QAMockApiService.getQAAnswers).mockResolvedValue(
        answersResponse
      );

      const result = await QAService.getQAAnswers('1');

      expect(QAMockApiService.getQAAnswers).toHaveBeenCalledWith('1');
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(answersResponse);
    });
  });

  describe('voteOnQAItem', () => {
    it('should vote on a Q&A item', async () => {
      const voteData = {
        userId: 'user-1',
        voteType: 'up' as const,
      };
      const voteResponse: ApiResponse<{ voteCount: number }> = {
        data: { voteCount: 26 },
        success: true,
      };
      vi.mocked(ApiService.post).mockResolvedValue(voteResponse);

      const result = await QAService.voteOnQAItem('1', voteData);

      expect(ApiService.post).toHaveBeenCalledWith(QA.VOTE('1'), voteData);
      expect(result).toEqual(voteResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const voteData = {
        userId: 'user-1',
        voteType: 'down' as const,
      };
      const voteResponse: ApiResponse<{ voteCount: number }> = {
        data: { voteCount: 24 },
        success: true,
      };
      vi.mocked(QAMockApiService.voteOnQAItem).mockResolvedValue(voteResponse);

      const result = await QAService.voteOnQAItem('1', voteData);

      expect(QAMockApiService.voteOnQAItem).toHaveBeenCalledWith('1', voteData);
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(voteResponse);
    });
  });

  describe('getQAItemsByCategory', () => {
    it('should fetch Q&A items by category', async () => {
      const qaItemsResponse: ApiResponse<QAItem[]> = {
        data: [mockQAItem],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(qaItemsResponse);

      const result = await QAService.getQAItemsByCategory('technical');

      expect(ApiService.get).toHaveBeenCalledWith(QA.BY_CATEGORY('technical'));
      expect(result).toEqual(qaItemsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const qaItemsResponse: ApiResponse<QAItem[]> = {
        data: [mockQAItem],
        success: true,
      };
      vi.mocked(QAMockApiService.getQAItemsByCategory).mockResolvedValue(
        qaItemsResponse
      );

      const result = await QAService.getQAItemsByCategory('technical');

      expect(QAMockApiService.getQAItemsByCategory).toHaveBeenCalledWith(
        'technical'
      );
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(qaItemsResponse);
    });
  });

  describe('getQAItemsByType', () => {
    it('should fetch Q&A items by type', async () => {
      const qaItemsResponse: ApiResponse<QAItem[]> = {
        data: [mockQAItem],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(qaItemsResponse);

      const result = await QAService.getQAItemsByType('question');

      expect(ApiService.get).toHaveBeenCalledWith(QA.BY_TYPE('question'));
      expect(result).toEqual(qaItemsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const qaItemsResponse: ApiResponse<QAItem[]> = {
        data: [mockQAItem],
        success: true,
      };
      vi.mocked(QAMockApiService.getQAItemsByType).mockResolvedValue(
        qaItemsResponse
      );

      const result = await QAService.getQAItemsByType('question');

      expect(QAMockApiService.getQAItemsByType).toHaveBeenCalledWith(
        'question'
      );
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(qaItemsResponse);
    });
  });

  describe('getTrendingQAItems', () => {
    it('should fetch trending Q&A items', async () => {
      const qaItemsResponse: ApiResponse<QAItem[]> = {
        data: [mockQAItem],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(qaItemsResponse);

      const result = await QAService.getTrendingQAItems();

      expect(ApiService.get).toHaveBeenCalledWith(QA.TRENDING);
      expect(result).toEqual(qaItemsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const qaItemsResponse: ApiResponse<QAItem[]> = {
        data: [mockQAItem],
        success: true,
      };
      vi.mocked(QAMockApiService.getTrendingQAItems).mockResolvedValue(
        qaItemsResponse
      );

      const result = await QAService.getTrendingQAItems();

      expect(QAMockApiService.getTrendingQAItems).toHaveBeenCalled();
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(qaItemsResponse);
    });
  });

  describe('getUnansweredQAItems', () => {
    it('should fetch unanswered Q&A items', async () => {
      const qaItemsResponse: ApiResponse<QAItem[]> = {
        data: [mockQAItem],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(qaItemsResponse);

      const result = await QAService.getUnansweredQAItems();

      expect(ApiService.get).toHaveBeenCalledWith(QA.UNANSWERED);
      expect(result).toEqual(qaItemsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const qaItemsResponse: ApiResponse<QAItem[]> = {
        data: [mockQAItem],
        success: true,
      };
      vi.mocked(QAMockApiService.getUnansweredQAItems).mockResolvedValue(
        qaItemsResponse
      );

      const result = await QAService.getUnansweredQAItems();

      expect(QAMockApiService.getUnansweredQAItems).toHaveBeenCalled();
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(qaItemsResponse);
    });
  });

  describe('searchQAItems', () => {
    it('should search Q&A items', async () => {
      const qaItemsResponse: ApiResponse<QAItem[]> = {
        data: [mockQAItem],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(qaItemsResponse);

      const result = await QAService.searchQAItems('react performance');

      expect(ApiService.get).toHaveBeenCalledWith('/search/qa', {
        q: 'react performance',
      });
      expect(result).toEqual(qaItemsResponse);
    });

    it('should search Q&A items with filters', async () => {
      const filters = { category: 'technical', status: 'published' };
      const qaItemsResponse: ApiResponse<QAItem[]> = {
        data: [mockQAItem],
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(qaItemsResponse);

      const result = await QAService.searchQAItems('react', filters);

      expect(ApiService.get).toHaveBeenCalledWith('/search/qa', {
        q: 'react',
        category: 'technical',
        status: 'published',
      });
      expect(result).toEqual(qaItemsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const qaItemsResponse: ApiResponse<QAItem[]> = {
        data: [mockQAItem],
        success: true,
      };
      vi.mocked(QAMockApiService.searchQAItems).mockResolvedValue(
        qaItemsResponse
      );

      const result = await QAService.searchQAItems('react', {
        category: 'technical',
      });

      expect(QAMockApiService.searchQAItems).toHaveBeenCalledWith('react', {
        category: 'technical',
      });
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(qaItemsResponse);
    });
  });

  describe('getQAStats', () => {
    it('should fetch Q&A statistics', async () => {
      const statsResponse: ApiResponse<any> = {
        data: {
          totalQuestions: 150,
          totalAnswers: 300,
          totalViews: 5000,
          totalVotes: 1200,
        },
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(statsResponse);

      const result = await QAService.getQAStats();

      expect(ApiService.get).toHaveBeenCalledWith(`${QA.BASE}/stats`);
      expect(result).toEqual(statsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const statsResponse: ApiResponse<any> = {
        data: { totalQuestions: 100 },
        success: true,
      };
      vi.mocked(QAMockApiService.getQAStats).mockResolvedValue(statsResponse);

      const result = await QAService.getQAStats();

      expect(QAMockApiService.getQAStats).toHaveBeenCalled();
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(statsResponse);
    });
  });

  describe('exportQAItems', () => {
    it('should export Q&A items with default format', async () => {
      const exportResponse: ApiResponse<{ downloadUrl: string }> = {
        data: { downloadUrl: 'https://example.com/export.csv' },
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(exportResponse);

      const result = await QAService.exportQAItems();

      expect(ApiService.get).toHaveBeenCalledWith(`${QA.BASE}/export`, {
        format: 'csv',
      });
      expect(result).toEqual(exportResponse);
    });

    it('should export Q&A items with custom format and filters', async () => {
      const filters = { status: 'published', category: 'technical' };
      const exportResponse: ApiResponse<{ downloadUrl: string }> = {
        data: { downloadUrl: 'https://example.com/export.xlsx' },
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(exportResponse);

      const result = await QAService.exportQAItems('xlsx', filters);

      expect(ApiService.get).toHaveBeenCalledWith(`${QA.BASE}/export`, {
        format: 'xlsx',
        status: 'published',
        category: 'technical',
      });
      expect(result).toEqual(exportResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const exportResponse: ApiResponse<{ downloadUrl: string }> = {
        data: { downloadUrl: 'mock-url' },
        success: true,
      };
      vi.mocked(QAMockApiService.exportQAItems).mockResolvedValue(
        exportResponse
      );

      const result = await QAService.exportQAItems('json');

      expect(QAMockApiService.exportQAItems).toHaveBeenCalledWith(
        'json',
        undefined
      );
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(exportResponse);
    });
  });

  describe('importQAItems', () => {
    it('should import Q&A items', async () => {
      const file = new File(['content'], 'qa-items.csv', { type: 'text/csv' });
      const importResponse: ApiResponse<{
        imported: number;
        skipped: number;
        errors: string[];
      }> = {
        data: {
          imported: 10,
          skipped: 2,
          errors: ['Invalid format on row 5'],
        },
        success: true,
      };
      vi.mocked(ApiService.uploadFile).mockResolvedValue(importResponse);

      const result = await QAService.importQAItems(file);

      expect(ApiService.uploadFile).toHaveBeenCalledWith(
        `${QA.BASE}/import`,
        file,
        undefined
      );
      expect(result).toEqual(importResponse);
    });

    it('should import Q&A items with options', async () => {
      const file = new File(['content'], 'qa-items.csv', { type: 'text/csv' });
      const options = { skipDuplicates: true, updateExisting: false };
      const importResponse: ApiResponse<{
        imported: number;
        skipped: number;
        errors: string[];
      }> = {
        data: { imported: 8, skipped: 4, errors: [] },
        success: true,
      };
      vi.mocked(ApiService.uploadFile).mockResolvedValue(importResponse);

      const result = await QAService.importQAItems(file, options);

      expect(ApiService.uploadFile).toHaveBeenCalledWith(
        `${QA.BASE}/import`,
        file,
        options
      );
      expect(result).toEqual(importResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const file = new File(['content'], 'qa-items.csv', { type: 'text/csv' });
      const importResponse: ApiResponse<{
        imported: number;
        skipped: number;
        errors: string[];
      }> = {
        data: { imported: 5, skipped: 0, errors: [] },
        success: true,
      };
      vi.mocked(QAMockApiService.importQAItems).mockResolvedValue(
        importResponse
      );

      const result = await QAService.importQAItems(file);

      expect(QAMockApiService.importQAItems).toHaveBeenCalledWith(
        file,
        undefined
      );
      expect(ApiService.uploadFile).not.toHaveBeenCalled();
      expect(result).toEqual(importResponse);
    });
  });

  describe('addAnswer', () => {
    it('should add an answer to a question', async () => {
      const answerData = {
        content: 'This is my answer',
        authorId: 'author-2',
      };
      const answerResponse: ApiResponse<any> = {
        data: { answerId: 'answer-1', content: 'This is my answer' },
        success: true,
      };
      vi.mocked(ApiService.post).mockResolvedValue(answerResponse);

      const result = await QAService.addAnswer('1', answerData);

      expect(ApiService.post).toHaveBeenCalledWith(
        `${QA.BY_ID('1')}/answers`,
        answerData
      );
      expect(result).toEqual(answerResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const answerData = {
        content: 'Mock answer',
        authorId: 'author-2',
      };
      const answerResponse: ApiResponse<any> = {
        data: { answerId: 'mock-answer' },
        success: true,
      };
      vi.mocked(QAMockApiService.addAnswer).mockResolvedValue(answerResponse);

      const result = await QAService.addAnswer('1', answerData);

      expect(QAMockApiService.addAnswer).toHaveBeenCalledWith('1', answerData);
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(answerResponse);
    });
  });

  describe('acceptAnswer', () => {
    it('should accept an answer', async () => {
      const acceptResponse: ApiResponse<any> = {
        data: { accepted: true },
        success: true,
      };
      vi.mocked(ApiService.post).mockResolvedValue(acceptResponse);

      const result = await QAService.acceptAnswer('1', 'answer-1');

      expect(ApiService.post).toHaveBeenCalledWith(
        `${QA.BY_ID('1')}/answers/answer-1/accept`
      );
      expect(result).toEqual(acceptResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const acceptResponse: ApiResponse<any> = {
        data: { accepted: true },
        success: true,
      };
      vi.mocked(QAMockApiService.acceptAnswer).mockResolvedValue(
        acceptResponse
      );

      const result = await QAService.acceptAnswer('1', 'answer-1');

      expect(QAMockApiService.acceptAnswer).toHaveBeenCalledWith(
        '1',
        'answer-1'
      );
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(acceptResponse);
    });
  });

  describe('verifyAnswer', () => {
    it('should verify an answer', async () => {
      const verifyResponse: ApiResponse<any> = {
        data: { verified: true },
        success: true,
      };
      vi.mocked(ApiService.post).mockResolvedValue(verifyResponse);

      const result = await QAService.verifyAnswer('1', 'answer-1');

      expect(ApiService.post).toHaveBeenCalledWith(
        `${QA.BY_ID('1')}/answers/answer-1/verify`
      );
      expect(result).toEqual(verifyResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const verifyResponse: ApiResponse<any> = {
        data: { verified: true },
        success: true,
      };
      vi.mocked(QAMockApiService.verifyAnswer).mockResolvedValue(
        verifyResponse
      );

      const result = await QAService.verifyAnswer('1', 'answer-1');

      expect(QAMockApiService.verifyAnswer).toHaveBeenCalledWith(
        '1',
        'answer-1'
      );
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(verifyResponse);
    });
  });

  describe('addComment', () => {
    it('should add a comment to a Q&A item', async () => {
      const commentData = {
        content: 'This is a comment',
        authorId: 'author-3',
      };
      const commentResponse: ApiResponse<any> = {
        data: { commentId: 'comment-1' },
        success: true,
      };
      vi.mocked(ApiService.post).mockResolvedValue(commentResponse);

      const result = await QAService.addComment('1', commentData);

      expect(ApiService.post).toHaveBeenCalledWith(
        `${QA.BY_ID('1')}/comments`,
        commentData
      );
      expect(result).toEqual(commentResponse);
    });

    it('should add a reply comment', async () => {
      const commentData = {
        content: 'This is a reply',
        authorId: 'author-3',
        parentCommentId: 'comment-1',
      };
      const commentResponse: ApiResponse<any> = {
        data: { commentId: 'comment-2' },
        success: true,
      };
      vi.mocked(ApiService.post).mockResolvedValue(commentResponse);

      const result = await QAService.addComment('1', commentData);

      expect(ApiService.post).toHaveBeenCalledWith(
        `${QA.BY_ID('1')}/comments`,
        commentData
      );
      expect(result).toEqual(commentResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const commentData = {
        content: 'Mock comment',
        authorId: 'author-3',
      };
      const commentResponse: ApiResponse<any> = {
        data: { commentId: 'mock-comment' },
        success: true,
      };
      vi.mocked(QAMockApiService.addComment).mockResolvedValue(commentResponse);

      const result = await QAService.addComment('1', commentData);

      expect(QAMockApiService.addComment).toHaveBeenCalledWith(
        '1',
        commentData
      );
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(commentResponse);
    });
  });

  describe('getQAComments', () => {
    it('should fetch Q&A comments', async () => {
      const mockComments = [
        {
          commentId: 'comment-1',
          content: 'Great question!',
          authorId: 'author-3',
          authorName: 'Bob Wilson',
          createdAt: '2024-01-03T00:00:00Z',
          replies: [],
        },
      ];
      const commentsResponse: ApiResponse<typeof mockComments> = {
        data: mockComments,
        success: true,
      };
      vi.mocked(ApiService.get).mockResolvedValue(commentsResponse);

      const result = await QAService.getQAComments('1');

      expect(ApiService.get).toHaveBeenCalledWith(`${QA.BY_ID('1')}/comments`);
      expect(result).toEqual(commentsResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mockComments = [{ commentId: 'mock-comment' }];
      const commentsResponse: ApiResponse<typeof mockComments> = {
        data: mockComments,
        success: true,
      };
      vi.mocked(QAMockApiService.getQAComments).mockResolvedValue(
        commentsResponse
      );

      const result = await QAService.getQAComments('1');

      expect(QAMockApiService.getQAComments).toHaveBeenCalledWith('1');
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(commentsResponse);
    });
  });

  describe('trackView', () => {
    it('should track a view without user ID', async () => {
      const viewResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };
      vi.mocked(ApiService.post).mockResolvedValue(viewResponse);

      const result = await QAService.trackView('1');

      expect(ApiService.post).toHaveBeenCalledWith(`${QA.BY_ID('1')}/view`, {
        userId: undefined,
      });
      expect(result).toEqual(viewResponse);
    });

    it('should track a view with user ID', async () => {
      const viewResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };
      vi.mocked(ApiService.post).mockResolvedValue(viewResponse);

      const result = await QAService.trackView('1', 'user-1');

      expect(ApiService.post).toHaveBeenCalledWith(`${QA.BY_ID('1')}/view`, {
        userId: 'user-1',
      });
      expect(result).toEqual(viewResponse);
    });

    it('should use mock API when enabled', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const viewResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };
      vi.mocked(QAMockApiService.trackView).mockResolvedValue(viewResponse);

      const result = await QAService.trackView('1', 'user-1');

      expect(QAMockApiService.trackView).toHaveBeenCalledWith('1', 'user-1');
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(viewResponse);
    });
  });

  describe('bulkOperation', () => {
    it('should perform bulk operations', async () => {
      const bulkResponse: ApiResponse<any> = {
        data: { processed: 2, success: 2, failed: 0 },
        success: true,
      };
      vi.mocked(ApiService.bulkOperation).mockResolvedValue(bulkResponse);

      const result = await QAService.bulkOperation('publish', ['1', '2']);

      expect(ApiService.bulkOperation).toHaveBeenCalledWith(
        QA.BASE,
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
      vi.mocked(QAMockApiService.bulkOperation).mockResolvedValue(bulkResponse);

      const result = await QAService.bulkOperation('archive', ['1', '2']);

      expect(QAMockApiService.bulkOperation).toHaveBeenCalledWith('archive', [
        '1',
        '2',
      ]);
      expect(ApiService.bulkOperation).not.toHaveBeenCalled();
      expect(result).toEqual(bulkResponse);
    });

    it('should handle all bulk operation types', async () => {
      const operations: Array<
        'publish' | 'archive' | 'flag' | 'unflag' | 'approve' | 'delete'
      > = ['publish', 'archive', 'flag', 'unflag', 'approve', 'delete'];
      const bulkResponse: ApiResponse<any> = {
        data: { processed: 1 },
        success: true,
      };
      vi.mocked(ApiService.bulkOperation).mockResolvedValue(bulkResponse);

      for (const operation of operations) {
        await QAService.bulkOperation(operation, ['1']);
        expect(ApiService.bulkOperation).toHaveBeenCalledWith(
          QA.BASE,
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

      await expect(QAService.getQAItem('1')).rejects.toThrow('API Error');
    });

    it('should handle mock API errors gracefully', async () => {
      mockEnv.VITE_ENABLE_MOCK_API = 'true';
      const mockError = new Error('Mock API Error');
      vi.mocked(QAMockApiService.getQAItem).mockRejectedValue(mockError);

      await expect(QAService.getQAItem('1')).rejects.toThrow('Mock API Error');
    });
  });
});
