import { ApiService, shouldUseMockApi } from '@shared/services';
import { SponsorsMockApiService } from './mockApi';
import { SPONSORS_ENDPOINTS } from './endpoints';
import type {
  Sponsor,
  SponsorFormData,
  SponsorFilters,
  ApiResponse,
  PaginatedResponse,
  BulkOperationResult,
  ExportResult,
  ImportResult,
} from '../types';

/**
 * Sponsors Service
 * Handles all sponsor-related API operations
 */
export class SponsorsService {
  /**
   * Get all sponsors with optional filtering and pagination
   */
  static async getSponsors(
    page: number = 1,
    limit: number = 20,
    filters?: SponsorFilters
  ): Promise<PaginatedResponse<Sponsor>> {
    if (shouldUseMockApi()) {
      return SponsorsMockApiService.getSponsors(page, limit, filters);
    }

    const params: Record<string, any> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.tier) params.tier = filters.tier;
    if (filters?.search) params.search = filters.search;

    return ApiService.getPaginated<Sponsor>(SPONSORS_ENDPOINTS.BASE, page, limit, params);
  }

  /**
   * Get sponsor by ID
   */
  static async getSponsor(id: string): Promise<ApiResponse<Sponsor>> {
    if (shouldUseMockApi()) {
      return SponsorsMockApiService.getSponsor(id);
    }

    return ApiService.get<Sponsor>(SPONSORS_ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new sponsor
   */
  static async createSponsor(sponsorData: SponsorFormData): Promise<ApiResponse<Sponsor>> {
    if (shouldUseMockApi()) {
      return SponsorsMockApiService.createSponsor(sponsorData);
    }

    return ApiService.post<Sponsor>(SPONSORS_ENDPOINTS.BASE, sponsorData);
  }

  /**
   * Update existing sponsor
   */
  static async updateSponsor(
    id: string,
    sponsorData: Partial<SponsorFormData>
  ): Promise<ApiResponse<Sponsor>> {
    if (shouldUseMockApi()) {
      return SponsorsMockApiService.updateSponsor(id, sponsorData);
    }

    return ApiService.put<Sponsor>(SPONSORS_ENDPOINTS.BY_ID(id), sponsorData);
  }

  /**
   * Delete sponsor
   */
  static async deleteSponsor(id: string): Promise<ApiResponse<void>> {
    if (shouldUseMockApi()) {
      return SponsorsMockApiService.deleteSponsor(id);
    }

    return ApiService.delete<void>(SPONSORS_ENDPOINTS.BY_ID(id));
  }

  /**
   * Activate sponsor
   */
  static async activateSponsor(id: string): Promise<ApiResponse<Sponsor>> {
    if (shouldUseMockApi()) {
      return SponsorsMockApiService.activateSponsor(id);
    }

    return ApiService.post<Sponsor>(SPONSORS_ENDPOINTS.ACTIVATE(id));
  }

  /**
   * Deactivate sponsor
   */
  static async deactivateSponsor(id: string): Promise<ApiResponse<Sponsor>> {
    if (shouldUseMockApi()) {
      return SponsorsMockApiService.deactivateSponsor(id);
    }

    return ApiService.post<Sponsor>(SPONSORS_ENDPOINTS.DEACTIVATE(id));
  }

  /**
   * Get sponsors by tier
   */
  static async getSponsorsByTier(tier: string): Promise<ApiResponse<Sponsor[]>> {
    if (shouldUseMockApi()) {
      return SponsorsMockApiService.getSponsorsByTier(tier);
    }

    return ApiService.get<Sponsor[]>(SPONSORS_ENDPOINTS.BY_TIER(tier));
  }

  /**
   * Bulk operations on sponsors
   */
  static async bulkOperation(
    operation: 'activate' | 'deactivate' | 'delete',
    sponsorIds: string[]
  ): Promise<ApiResponse<BulkOperationResult>> {
    if (shouldUseMockApi()) {
      return SponsorsMockApiService.bulkOperation(operation, sponsorIds);
    }

    return ApiService.bulkOperation<BulkOperationResult>(SPONSORS_ENDPOINTS.BASE, operation, sponsorIds);
  }
}

export default SponsorsService;