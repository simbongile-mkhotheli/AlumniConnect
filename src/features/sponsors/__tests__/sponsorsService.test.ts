import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SponsorsService } from '../services/sponsorsService';
import { ApiService } from '@shared/services';
import { SponsorsMockApiService } from '../services/mockApi';
import { SPONSORS_ENDPOINTS as SPONSORS } from '../services/endpoints';
import type {
  Sponsor,
  SponsorFilters,
} from '../types';
import type { ApiResponse, PaginatedResponse } from '@shared/types';

// Mock dependencies
vi.mock('@shared/services', () => ({
  ApiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    getPaginated: vi.fn(),
    bulkOperation: vi.fn(),
  },
  shouldUseMockApi: vi.fn(() => false),
}));
vi.mock('../services/mockApi');
vi.mock('../services/endpoints', () => ({
  SPONSORS_ENDPOINTS: {
    BASE: '/api/sponsors',
    BY_ID: (id: string) => `/api/sponsors/${id}`,
    ACTIVATE: (id: string) => `/api/sponsors/${id}/activate`,
    DEACTIVATE: (id: string) => `/api/sponsors/${id}/deactivate`,
    BY_TIER: (tier: string) => `/api/sponsors/tier/${tier}`,
    BY_STATUS: (status: string) => `/api/sponsors/status/${status}`,
    ACTIVE: '/api/sponsors/active',
    STATS: '/api/sponsors/stats',
  },
}));

// Mock environment variable (align with implementation's expected key)
const mockEnv = vi.hoisted(() => ({
  VITE_USE_MOCK_API: 'false',
}));

vi.stubGlobal('import', {
  meta: {
    env: mockEnv,
  },
});

describe('SponsorsService', () => {
  const mockSponsor: Sponsor = {
    id: '1',
    name: 'TechCorp Solutions',
    tier: 'platinum',
    status: 'active',
    logo: 'https://example.com/logo.png',
    description: 'Leading technology solutions provider',
    website: 'https://techcorp.com',
    contactEmail: 'contact@techcorp.com',
    eventsSponsored: 15,
    chaptersSponsored: 8,
    totalValue: 50000,
    partnershipSince: '2022-01-01T00:00:00Z',
    tags: ['technology', 'enterprise', 'innovation'],
    createdAt: '2022-01-01T00:00:00Z',
  };

  const mockPaginatedResponse: PaginatedResponse<Sponsor> = {
    data: [mockSponsor],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
    success: true,
    message: 'Sponsors retrieved successfully',
  };

  const mockApiResponse: ApiResponse<Sponsor> = {
    data: mockSponsor,
    success: true,
    message: 'Sponsor operation successful',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  mockEnv.VITE_USE_MOCK_API = 'false';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSponsors', () => {
    it('should fetch sponsors with default parameters', async () => {
      vi.mocked(ApiService.getPaginated).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await SponsorsService.getSponsors();

      expect(ApiService.getPaginated).toHaveBeenCalledWith(
        SPONSORS.BASE,
        1,
        20,
        {}
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should fetch sponsors with custom parameters and filters', async () => {
      const filters: SponsorFilters = {
        status: 'active',
        tier: 'platinum',
        search: 'tech',
      };
      vi.mocked(ApiService.getPaginated).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await SponsorsService.getSponsors(2, 10, filters);

      expect(ApiService.getPaginated).toHaveBeenCalledWith(
        SPONSORS.BASE,
        2,
        10,
        {
          status: 'active',
          tier: 'platinum',
          search: 'tech',
        }
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should use mock API when enabled', async () => {
  mockEnv.VITE_USE_MOCK_API = 'true';
  const { shouldUseMockApi } = await import('@shared/services');
  (shouldUseMockApi as any).mockReturnValue(true);
      vi.mocked(SponsorsMockApiService.getSponsors).mockResolvedValue(
        mockPaginatedResponse
      );

      const result = await SponsorsService.getSponsors();

      expect(SponsorsMockApiService.getSponsors).toHaveBeenCalledWith(
        1,
        20,
        undefined
      );
      expect(ApiService.getPaginated).not.toHaveBeenCalled();
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('getSponsor', () => {
    it('should fetch a single sponsor by ID', async () => {
      vi.mocked(ApiService.get).mockResolvedValue(mockApiResponse);

      const result = await SponsorsService.getSponsor('1');

      expect(ApiService.get).toHaveBeenCalledWith(SPONSORS.BY_ID('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
  mockEnv.VITE_USE_MOCK_API = 'true';
  const { shouldUseMockApi } = await import('@shared/services');
  (shouldUseMockApi as any).mockReturnValue(true);
      vi.mocked(SponsorsMockApiService.getSponsor).mockResolvedValue(
        mockApiResponse
      );

      const result = await SponsorsService.getSponsor('1');

      expect(SponsorsMockApiService.getSponsor).toHaveBeenCalledWith('1');
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('createSponsor', () => {
    it('should create a new sponsor', async () => {
      const sponsorData = { ...mockSponsor };
      delete (sponsorData as any).id;
      delete (sponsorData as any).createdAt;
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await SponsorsService.createSponsor(sponsorData);

      expect(ApiService.post).toHaveBeenCalledWith(SPONSORS.BASE, sponsorData);
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
  mockEnv.VITE_USE_MOCK_API = 'true';
  const { shouldUseMockApi } = await import('@shared/services');
  (shouldUseMockApi as any).mockReturnValue(true);
      const sponsorData = { ...mockSponsor };
      delete (sponsorData as any).id;
      delete (sponsorData as any).createdAt;
      vi.mocked(SponsorsMockApiService.createSponsor).mockResolvedValue(
        mockApiResponse
      );

      const result = await SponsorsService.createSponsor(sponsorData);

      expect(SponsorsMockApiService.createSponsor).toHaveBeenCalledWith(
        sponsorData
      );
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('updateSponsor', () => {
    it('should update an existing sponsor', async () => {
      const updateData = { name: 'Updated Sponsor Name' };
      vi.mocked(ApiService.put).mockResolvedValue(mockApiResponse);

      const result = await SponsorsService.updateSponsor('1', updateData);

      expect(ApiService.put).toHaveBeenCalledWith(
        SPONSORS.BY_ID('1'),
        updateData
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
  mockEnv.VITE_USE_MOCK_API = 'true';
  const { shouldUseMockApi } = await import('@shared/services');
  (shouldUseMockApi as any).mockReturnValue(true);
      const updateData = { name: 'Updated Sponsor Name' };
      vi.mocked(SponsorsMockApiService.updateSponsor).mockResolvedValue(
        mockApiResponse
      );

      const result = await SponsorsService.updateSponsor('1', updateData);

      expect(SponsorsMockApiService.updateSponsor).toHaveBeenCalledWith(
        '1',
        updateData
      );
      expect(ApiService.put).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('deleteSponsor', () => {
    it('should delete a sponsor', async () => {
      const deleteResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
        message: 'Sponsor deleted successfully',
      };
      vi.mocked(ApiService.delete).mockResolvedValue(deleteResponse);

      const result = await SponsorsService.deleteSponsor('1');

      expect(ApiService.delete).toHaveBeenCalledWith(SPONSORS.BY_ID('1'));
      expect(result).toEqual(deleteResponse);
    });

    it('should use mock API when enabled', async () => {
  mockEnv.VITE_USE_MOCK_API = 'true';
  const { shouldUseMockApi } = await import('@shared/services');
  (shouldUseMockApi as any).mockReturnValue(true);
      const deleteResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
        message: 'Sponsor deleted successfully',
      };
      vi.mocked(SponsorsMockApiService.deleteSponsor).mockResolvedValue(
        deleteResponse
      );

      const result = await SponsorsService.deleteSponsor('1');

      expect(SponsorsMockApiService.deleteSponsor).toHaveBeenCalledWith('1');
      expect(ApiService.delete).not.toHaveBeenCalled();
      expect(result).toEqual(deleteResponse);
    });
  });

  describe('activateSponsor', () => {
    it('should activate a sponsor', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await SponsorsService.activateSponsor('1');

      expect(ApiService.post).toHaveBeenCalledWith(SPONSORS.ACTIVATE('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
  mockEnv.VITE_USE_MOCK_API = 'true';
  const { shouldUseMockApi } = await import('@shared/services');
  (shouldUseMockApi as any).mockReturnValue(true);
      vi.mocked(SponsorsMockApiService.activateSponsor).mockResolvedValue(
        mockApiResponse
      );

      const result = await SponsorsService.activateSponsor('1');

      expect(SponsorsMockApiService.activateSponsor).toHaveBeenCalledWith('1');
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('deactivateSponsor', () => {
    it('should deactivate a sponsor', async () => {
      vi.mocked(ApiService.post).mockResolvedValue(mockApiResponse);

      const result = await SponsorsService.deactivateSponsor('1');

      expect(ApiService.post).toHaveBeenCalledWith(SPONSORS.DEACTIVATE('1'));
      expect(result).toEqual(mockApiResponse);
    });

    it('should use mock API when enabled', async () => {
  mockEnv.VITE_USE_MOCK_API = 'true';
  const { shouldUseMockApi } = await import('@shared/services');
  (shouldUseMockApi as any).mockReturnValue(true);
      vi.mocked(SponsorsMockApiService.deactivateSponsor).mockResolvedValue(
        mockApiResponse
      );

      const result = await SponsorsService.deactivateSponsor('1');

      expect(SponsorsMockApiService.deactivateSponsor).toHaveBeenCalledWith(
        '1'
      );
      expect(ApiService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('getSponsorsByTier', () => {
    it('should fetch sponsors by tier', async () => {
      const sponsorsResponse: ApiResponse<Sponsor[]> = {
        data: [mockSponsor],
        success: true,
        message: 'Sponsors retrieved successfully',
      };
      vi.mocked(ApiService.get).mockResolvedValue(sponsorsResponse);

      const result = await SponsorsService.getSponsorsByTier('platinum');

      expect(ApiService.get).toHaveBeenCalledWith(SPONSORS.BY_TIER('platinum'));
      expect(result).toEqual(sponsorsResponse);
    });

    it('should use mock API when enabled', async () => {
  mockEnv.VITE_USE_MOCK_API = 'true';
  const { shouldUseMockApi } = await import('@shared/services');
  (shouldUseMockApi as any).mockReturnValue(true);
      const sponsorsResponse: ApiResponse<Sponsor[]> = {
        data: [mockSponsor],
        success: true,
        message: 'Sponsors retrieved successfully',
      };
      vi.mocked(SponsorsMockApiService.getSponsorsByTier).mockResolvedValue(
        sponsorsResponse
      );

      const result = await SponsorsService.getSponsorsByTier('platinum');

      expect(SponsorsMockApiService.getSponsorsByTier).toHaveBeenCalledWith(
        'platinum'
      );
      expect(ApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(sponsorsResponse);
    });
  });

  // Removed tests for non-existent methods: getSponsorsByStatus, getActiveSponsors, getSponsorStats

  describe('bulkOperation', () => {
    it('should perform bulk operations', async () => {
      const bulkResponse: ApiResponse<any> = {
        data: { processed: 2, success: 2, failed: 0 },
        success: true,
        message: 'Bulk operation completed',
      };
      vi.mocked(ApiService.bulkOperation).mockResolvedValue(bulkResponse);

      const result = await SponsorsService.bulkOperation('activate', [
        '1',
        '2',
      ]);

      expect(ApiService.bulkOperation).toHaveBeenCalledWith(
        SPONSORS.BASE,
        'activate',
        ['1', '2']
      );
      expect(result).toEqual(bulkResponse);
    });

    it('should use mock API when enabled', async () => {
  mockEnv.VITE_USE_MOCK_API = 'true';
  const { shouldUseMockApi } = await import('@shared/services');
  (shouldUseMockApi as any).mockReturnValue(true);
      const bulkResponse: ApiResponse<any> = {
        data: { processed: 2 },
        success: true,
        message: 'Bulk operation completed',
      };
      vi.mocked(SponsorsMockApiService.bulkOperation).mockResolvedValue(
        bulkResponse
      );

      const result = await SponsorsService.bulkOperation('deactivate', [
        '1',
        '2',
      ]);

      expect(SponsorsMockApiService.bulkOperation).toHaveBeenCalledWith(
        'deactivate',
        ['1', '2']
      );
      expect(ApiService.bulkOperation).not.toHaveBeenCalled();
      expect(result).toEqual(bulkResponse);
    });

    it('should handle all bulk operation types', async () => {
      const operations: Array<'activate' | 'deactivate' | 'delete'> = ['activate', 'deactivate', 'delete'];
      const bulkResponse: ApiResponse<any> = {
        data: { processed: 1 },
        success: true,
        message: 'Bulk operation completed',
      };
      vi.mocked(ApiService.bulkOperation).mockResolvedValue(bulkResponse);

      for (const operation of operations) {
        await SponsorsService.bulkOperation(operation, ['1']);
        expect(ApiService.bulkOperation).toHaveBeenCalledWith(
          SPONSORS.BASE,
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

      await expect(SponsorsService.getSponsor('1')).rejects.toThrow(
        'API Error'
      );
    });

    it('should handle mock API errors gracefully', async () => {
  mockEnv.VITE_USE_MOCK_API = 'true';
  const { shouldUseMockApi } = await import('@shared/services');
  (shouldUseMockApi as any).mockReturnValue(true);
      const mockError = new Error('Mock API Error');
      vi.mocked(SponsorsMockApiService.getSponsor).mockRejectedValue(mockError);

      await expect(SponsorsService.getSponsor('1')).rejects.toThrow(
        'Mock API Error'
      );
    });
  });
});
