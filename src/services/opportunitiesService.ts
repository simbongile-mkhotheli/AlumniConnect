import ApiService from './api';
import { OpportunitiesMockApiService } from './mockApis';
import { OPPORTUNITIES } from './endpoints';
import { shouldUseMockApi } from './useMockApi';
import type {
  Opportunity,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../types';

/**
 * Opportunities Service
 * Handles all opportunity-related API operations
 */
export class OpportunitiesService {
  /**
   * Check if mock API should be used
   */
  private static useMockApi(): boolean { return shouldUseMockApi(); }

  /**
   * List opportunities with pagination & optional filters
   */
  static async getOpportunities(
    page = 1,
    limit = 20,
    filters?: FilterState
  ): Promise<PaginatedResponse<Opportunity>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.getOpportunities(page, limit, filters);
    }

    const params: Record<string, any> = {};

    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if (filters?.level) params.level = filters.level;
    if (filters?.search) params.search = filters.search;

    return ApiService.getPaginated<Opportunity>(
      OPPORTUNITIES.BASE,
      page,
      limit,
      params
    );
  }

  /**
   * Get single opportunity by id
   */
  static async getOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.getOpportunity(id);
    }
    return ApiService.get<Opportunity>(OPPORTUNITIES.BY_ID(id));
  }

  /**
   * Create opportunity
   */
  static async createOpportunity(
    data: Omit<Opportunity, 'id' | 'createdAt'>
  ): Promise<ApiResponse<Opportunity>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.createOpportunity(data);
    }
    return ApiService.post<Opportunity>(OPPORTUNITIES.BASE, data);
  }

  /**
   * Update opportunity
   */
  static async updateOpportunity(
    id: string,
    data: Partial<Opportunity>
  ): Promise<ApiResponse<Opportunity>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.updateOpportunity(id, data);
    }
    return ApiService.put<Opportunity>(OPPORTUNITIES.BY_ID(id), data);
  }

  /**
   * Delete opportunity
   */
  static async deleteOpportunity(id: string): Promise<ApiResponse<void>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.deleteOpportunity(id);
    }
    return ApiService.delete<void>(OPPORTUNITIES.BY_ID(id));
  }

  /**
   * Activate opportunity
   */
  static async activateOpportunity(
    id: string
  ): Promise<ApiResponse<Opportunity>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.activateOpportunity(id);
    }
    return ApiService.post<Opportunity>(OPPORTUNITIES.ACTIVATE(id));
  }

  /**
   * Deactivate opportunity
   */
  static async deactivateOpportunity(
    id: string
  ): Promise<ApiResponse<Opportunity>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.deactivateOpportunity(id);
    }
    return ApiService.post<Opportunity>(OPPORTUNITIES.DEACTIVATE(id));
  }

  /**
   * Expire opportunity
   */
  static async expireOpportunity(
    id: string
  ): Promise<ApiResponse<Opportunity>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.expireOpportunity(id);
    }
    return ApiService.post<Opportunity>(OPPORTUNITIES.EXPIRE(id));
  }

  /**
   * Renew opportunity
   */
  static async renewOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.renewOpportunity(id);
    }
    return ApiService.post<Opportunity>(OPPORTUNITIES.RENEW(id));
  }

  /**
   * Approve opportunity
   */
  static async approveOpportunity(
    id: string
  ): Promise<ApiResponse<Opportunity>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.approveOpportunity(id);
    }
    return ApiService.post<Opportunity>(OPPORTUNITIES.APPROVE(id));
  }

  /**
   * Reject opportunity
   */
  static async rejectOpportunity(
    id: string
  ): Promise<ApiResponse<Opportunity>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.rejectOpportunity(id);
    }
    return ApiService.post<Opportunity>(OPPORTUNITIES.REJECT(id));
  }

  /**
   * Bulk operation
   */
  static async bulkOperation(
    operation: 'activate' | 'expire' | 'delete',
    ids: string[]
  ): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.bulkOperation(operation, ids);
    }
    return ApiService.bulkOperation<any>(OPPORTUNITIES.BASE, operation, ids);
  }

  /**
   * Get opportunities by type
   */
  static async getOpportunitiesByType(type: string): Promise<ApiResponse<Opportunity[]>> {
    // Accept any string and defer to backend/mock; tests pass raw strings
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.getOpportunitiesByType(type as any);
    }
    return ApiService.get<Opportunity[]>(OPPORTUNITIES.BY_TYPE(type as any));
  }

  /**
   * Get opportunities by level
   */
  static async getOpportunitiesByLevel(level: string): Promise<ApiResponse<Opportunity[]>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.getOpportunitiesByLevel(level as any);
    }
    return ApiService.get<Opportunity[]>(OPPORTUNITIES.BY_LEVEL(level as any));
  }

  /**
   * Get active opportunities
   */
  static async getActiveOpportunities(): Promise<ApiResponse<Opportunity[]>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.getActiveOpportunities();
    }
    return ApiService.get<Opportunity[]>(OPPORTUNITIES.ACTIVE);
  }

  /**
   * Get featured opportunities
   */
  static async getFeaturedOpportunities(): Promise<ApiResponse<Opportunity[]>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.getFeaturedOpportunities();
    }
    return ApiService.get<Opportunity[]>(OPPORTUNITIES.FEATURED);
  }

  /**
   * Get applications for an opportunity
   */
  static async getOpportunityApplications(
    opportunityId: string
  ): Promise<ApiResponse<any[]>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.getOpportunityApplications(
        opportunityId
      );
    }
    return ApiService.get<any[]>(OPPORTUNITIES.APPLICATIONS(opportunityId));
  }

  /**
   * Apply to an opportunity
   */
  static async applyToOpportunity(
    opportunityId: string,
    application: any
  ): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.applyToOpportunity(
        opportunityId,
        application
      );
    }
    return ApiService.post<any>(
      OPPORTUNITIES.APPLY(opportunityId),
      application
    );
  }

  /**
   * Search opportunities
   */
  static async searchOpportunities(
    query: string,
    filters?: Partial<FilterState>
  ): Promise<ApiResponse<Opportunity[]>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.searchOpportunities(query, filters);
    }

    const params = {
      q: query,
      ...filters,
    };

    return ApiService.get<Opportunity[]>('/search/opportunities', params);
  }

  /**
   * Get opportunity stats
   */
  static async getOpportunityStats(
    opportunityId: string
  ): Promise<ApiResponse<Record<string, any>>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.getOpportunityStats(opportunityId);
    }
    return ApiService.get<Record<string, any>>(
      OPPORTUNITIES.ANALYTICS(opportunityId)
    );
  }

  /**
   * Export opportunities
   */
  static async exportOpportunities(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    filters?: FilterState
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.exportOpportunities(format, filters);
    }

    const params = {
      format,
      ...filters,
    };

    return ApiService.get<{ downloadUrl: string }>(
      OPPORTUNITIES.EXPORT,
      params
    );
  }

  /**
   * Import opportunities
   */
  static async importOpportunities(
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
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.importOpportunities(file, options);
    }

    return ApiService.uploadFile<{
      imported: number;
      skipped: number;
      errors: string[];
    }>(OPPORTUNITIES.IMPORT, file, options);
  }

  /**
   * Mark as filled
   */
  static async markAsFilled(
    opportunityId: string
  ): Promise<ApiResponse<Opportunity>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.markAsFilled(opportunityId);
    }
    return ApiService.post<Opportunity>(
      OPPORTUNITIES.MARK_FILLED(opportunityId)
    );
  }

  /**
   * Get opportunity analytics
   */
  static async getOpportunityAnalytics(
    opportunityId: string
  ): Promise<ApiResponse<Record<string, any>>> {
    if (this.useMockApi()) {
      return OpportunitiesMockApiService.getOpportunityAnalytics(opportunityId);
    }
    return this.getOpportunityStats(opportunityId);
  }
}

export default OpportunitiesService;
