// src/services/partnersService.ts
import ApiService from './api';
import { PartnersMockApiService } from './mockApis/partnersMockApi';
import { PARTNERS } from './endpoints';
import { shouldUseMockApi } from './useMockApi';
import type {
  Partner,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../types';

/**
 * Partners Service
 * Handles all partner-related API operations
 */
export class PartnersService {
  /**
   * Check if mock API should be used
   */
  private static useMockApi(): boolean { return shouldUseMockApi(); }

  /**
   * Get all partners with optional filtering and pagination
   */
  static async getPartners(
    page: number = 1,
    limit: number = 20,
    filters?: FilterState
  ): Promise<PaginatedResponse<Partner>> {
    if (this.useMockApi()) {
      return PartnersMockApiService.getPartners({ page, limit, ...filters });
    }

    const params: Record<string, any> = {};

    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if (filters?.search) params.search = filters.search;

    return ApiService.getPaginated<Partner>(PARTNERS.BASE, page, limit, params);
  }

  /**
   * Get partner by ID
   */
  static async getPartner(id: string): Promise<ApiResponse<Partner>> {
    if (this.useMockApi()) {
      return PartnersMockApiService.getPartnerById(id);
    }

    return ApiService.get<Partner>(PARTNERS.BY_ID(id));
  }

  /**
   * Create new partner
   */
  static async createPartner(
    partnerData: Omit<Partner, 'id' | 'createdAt'>
  ): Promise<ApiResponse<Partner>> {
    if (this.useMockApi()) {
      return PartnersMockApiService.createPartner(partnerData);
    }

    return ApiService.post<Partner>(PARTNERS.BASE, partnerData);
  }

  /**
   * Update existing partner
   */
  static async updatePartner(
    id: string,
    partnerData: Partial<Partner>
  ): Promise<ApiResponse<Partner>> {
    if (this.useMockApi()) {
      return PartnersMockApiService.updatePartner(id, partnerData);
    }

    return ApiService.put<Partner>(PARTNERS.BY_ID(id), partnerData);
  }

  /**
   * Delete partner
   */
  static async deletePartner(id: string): Promise<ApiResponse<void>> {
    if (this.useMockApi()) {
      return PartnersMockApiService.deletePartner(id);
    }

    return ApiService.delete<void>(PARTNERS.BY_ID(id));
  }

  /**
   * Activate partner
   */
  static async activatePartner(id: string): Promise<ApiResponse<Partner>> {
    if (this.useMockApi()) {
      return PartnersMockApiService.activatePartner(id);
    }

    return ApiService.post<Partner>(PARTNERS.ACTIVATE(id));
  }

  /**
   * Deactivate partner
   */
  static async deactivatePartner(id: string): Promise<ApiResponse<Partner>> {
    if (this.useMockApi()) {
      return PartnersMockApiService.deactivatePartner(id);
    }

    return ApiService.post<Partner>(PARTNERS.DEACTIVATE(id));
  }

  /**
   * Get partner analytics
   */
  static async getPartnerAnalytics(id: string): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      // Mock analytics - this method doesn't exist in the refactored mock API
      return {
        data: { totalOpportunities: 5, totalHires: 2, hireRate: 0.4 },
        success: true,
        message: 'Partner analytics retrieved successfully',
      };
    }

    return ApiService.get<any>(PARTNERS.ANALYTICS(id));
  }

  /**
   * Get partners by type
   */
  static async getPartnersByType(
    type: Partner['type']
  ): Promise<ApiResponse<Partner[]>> {
    if (this.useMockApi()) {
      return PartnersMockApiService.getPartnersByType(type);
    }

    return ApiService.get<Partner[]>(PARTNERS.BY_TYPE(type));
  }

  /**
   * Get hiring partners
   */
  static async getHiringPartners(): Promise<ApiResponse<Partner[]>> {
    if (this.useMockApi()) {
      return PartnersMockApiService.getHiringPartners();
    }

    return ApiService.get<Partner[]>(PARTNERS.HIRING);
  }

  /**
   * Get partner opportunities
   */
  static async getPartnerOpportunities(
    id: string
  ): Promise<ApiResponse<any[]>> {
    if (this.useMockApi()) {
      // Mock opportunities - this method doesn't exist in the refactored mock API
      return {
        data: [],
        success: true,
        message: 'Partner opportunities retrieved successfully',
      };
    }

    return ApiService.get<any[]>(PARTNERS.OPPORTUNITIES(id));
  }

  /**
   * Search partners
   */
  static async searchPartners(
    query: string,
    filters?: Partial<FilterState>
  ): Promise<ApiResponse<Partner[]>> {
    if (this.useMockApi()) {
      return PartnersMockApiService.getPartners({ search: query, ...filters });
    }

    const params = {
      q: query,
      ...filters,
    };

    return ApiService.get<Partner[]>('/search/partners', params);
  }

  /**
   * Get partner statistics
   */
  static async getPartnerStats(): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      return PartnersMockApiService.getPartnerStats();
    }

    return ApiService.get<any>(`${PARTNERS.BASE}/stats`);
  }

  /**
   * Export partners data
   */
  static async exportPartners(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    filters?: FilterState
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    if (this.useMockApi()) {
      // Mock export - this method doesn't exist in the refactored mock API
      return {
        data: { downloadUrl: `mock-partners-export.${format}` },
        success: true,
        message: 'Partners exported successfully',
      };
    }

    const params = {
      format,
      ...filters,
    };

    return ApiService.get<{ downloadUrl: string }>(
      `${PARTNERS.BASE}/export`,
      params
    );
  }

  /**
   * Import partners data
   */
  static async importPartners(
    file: File,
    options?: { skipDuplicates?: boolean; updateExisting?: boolean }
  ): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      // Mock import - this method doesn't exist in the refactored mock API
      return {
        data: { imported: 0, skipped: 0, errors: [] },
        success: true,
        message: 'Partners imported successfully',
      };
    }

    return ApiService.uploadFile<any>(`${PARTNERS.BASE}/import`, file, options);
  }

  /**
   * Upload partner logo
   */
  static async uploadLogo(
    id: string,
    file: File
  ): Promise<ApiResponse<{ logoUrl: string }>> {
    if (this.useMockApi()) {
      // Mock logo upload - this method doesn't exist in the refactored mock API
      return {
        data: { logoUrl: `https://picsum.photos/200/200?random=${id}` },
        success: true,
        message: 'Logo uploaded successfully',
      };
    }

    return ApiService.uploadFile<{ logoUrl: string }>(
      `/files/partner-logo/${id}`,
      file
    );
  }

  /**
   * Bulk operations on partners
   */
  static async bulkOperation(
    operation: 'activate' | 'deactivate' | 'delete' | 'approve' | 'reject',
    partnerIds: string[]
  ): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      const updates: Partial<Partner> = {};

      switch (operation) {
        case 'activate':
          updates.status = 'active';
          break;
        case 'deactivate':
          updates.status = 'inactive';
          break;
        case 'approve':
          updates.status = 'active';
          break;
        case 'reject':
          updates.status = 'inactive';
          break;
        case 'delete':
          // For delete, we'll use the bulk update but mark as deleted
          updates.status = 'inactive';
          break;
      }

      if (operation === 'delete') {
        // Mock delete operation
        return {
          data: { deleted: partnerIds.length },
          success: true,
          message: `${partnerIds.length} partners deleted successfully`,
        };
      }

      return PartnersMockApiService.bulkUpdatePartners(partnerIds, updates);
    }

    return ApiService.bulkOperation<any>(PARTNERS.BASE, operation, partnerIds);
  }
}

export default PartnersService;
