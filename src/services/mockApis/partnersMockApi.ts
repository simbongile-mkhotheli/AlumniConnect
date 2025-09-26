// src/services/mockApis/partnersMockApi.ts
import type {
  Partner,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../../types';
import { MockDataLoader } from '../../utils/mockDataLoader';

/**
 * Partners Mock API Service
 * Uses db.json as data source via MockDataLoader
 */

// Utilities
const delay = (ms = 250) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Filter partners based on filters
 */
const filterPartners = (
  partners: Partner[],
  filters: FilterState
): Partner[] => {
  return MockDataLoader.filterItems(partners, {
    status: filters.status,
    type: filters.type,
    name: filters.search, // Search in name
  });
};

/**
 * PartnersMockApiService
 * All methods now use data from db.json via MockDataLoader
 */
export class PartnersMockApiService {
  static async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return Promise.resolve({ data: { status: 'ok' }, success: true, message: 'partners mock healthy' });
  }
  /**
   * Get all partners with optional filtering and pagination
   */
  static async getPartners(
    filters?: FilterState
  ): Promise<PaginatedResponse<Partner>> {
    await delay();

    try {
      let partners = await MockDataLoader.getPartners();

      // Apply filters if provided
      if (filters) {
        partners = filterPartners(partners, filters);
      }

      // Sort by name by default
      partners = MockDataLoader.sortItems(partners, 'name', 'asc');

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const paginatedResult = MockDataLoader.paginateItems(
        partners,
        page,
        limit
      );

      return {
        data: paginatedResult.items,
        pagination: {
          page: paginatedResult.page,
          limit: paginatedResult.limit,
          total: paginatedResult.total,
          totalPages: paginatedResult.totalPages,
        },
        success: true,
        message: 'Partners retrieved successfully',
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
        message: 'Failed to retrieve partners',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async getPartnerById(id: string): Promise<ApiResponse<Partner>> {
    await delay();

    try {
      const partner = await MockDataLoader.findById<Partner>('partners', id);

      if (!partner) {
        return {
          data: null,
          success: false,
          message: 'Partner not found',
          error: {
            code: 404,
            message: 'Partner not found',
          },
        };
      }

      return {
        data: partner,
        success: true,
        message: 'Partner retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve partner',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async createPartner(
    partnerData: Omit<Partner, 'id' | 'createdAt'>
  ): Promise<ApiResponse<Partner>> {
    await delay();

    try {
      const payload: Partner = {
        ...partnerData,
        id: `partner-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Partner;
      const persisted = await MockDataLoader.createItem<Partner>('partners', payload);
      return {
        data: persisted!,
        success: true,
        message: 'Partner created successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to create partner',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async updatePartner(
    id: string,
    partnerData: Partial<Partner>
  ): Promise<ApiResponse<Partner>> {
    await delay();

    try {
      const existingPartner = await MockDataLoader.findById<Partner>(
        'partners',
        id
      );

      if (!existingPartner) {
        return {
          data: null,
          success: false,
          message: 'Partner not found',
          error: {
            code: 404,
            message: 'Partner not found',
          },
        };
      }

      const updatedPartner: Partner = {
        ...existingPartner,
        ...partnerData,
        id,
      };
      const persisted = await MockDataLoader.putItem<Partner>('partners', id, updatedPartner);
      return {
        data: persisted!,
        success: true,
        message: 'Partner updated successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to update partner',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async deletePartner(id: string): Promise<ApiResponse<null>> {
    await delay();

    try {
      const existingPartner = await MockDataLoader.findById<Partner>(
        'partners',
        id
      );

      if (!existingPartner) {
        return {
          data: null,
          success: false,
          message: 'Partner not found',
          error: {
            code: 404,
            message: 'Partner not found',
          },
        };
      }

      await MockDataLoader.deleteItem('partners', id);
      return {
        data: null,
        success: true,
        message: 'Partner deleted successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to delete partner',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async getPartnersByType(
    type: Partner['type']
  ): Promise<ApiResponse<Partner[]>> {
    await delay();

    try {
      const partners = await MockDataLoader.getPartners();
      const filteredPartners = partners.filter(
        partner => partner.type === type
      );

      return {
        data: filteredPartners,
        success: true,
        message: `${type} partners retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve partners by type',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async getPartnersByStatus(
    status: Partner['status']
  ): Promise<ApiResponse<Partner[]>> {
    await delay();

    try {
      const partners = await MockDataLoader.getPartners();
      const filteredPartners = partners.filter(
        partner => partner.status === status
      );

      return {
        data: filteredPartners,
        success: true,
        message: `Partners with status '${status}' retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve partners by status',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async getHiringPartners(): Promise<ApiResponse<Partner[]>> {
    await delay();

    try {
      const partners = await MockDataLoader.getPartners();
      const hiringPartners = partners.filter(
        partner => partner.isHiring && partner.status === 'active'
      );

      return {
        data: hiringPartners,
        success: true,
        message: 'Hiring partners retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve hiring partners',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async activatePartner(id: string): Promise<ApiResponse<Partner>> {
    await delay();

    try {
      const partner = await MockDataLoader.findById<Partner>('partners', id);

      if (!partner) {
        return {
          data: null,
          success: false,
          message: 'Partner not found',
          error: {
            code: 404,
            message: 'Partner not found',
          },
        };
      }

      const activatedPartner: Partner = {
        ...partner,
        status: 'active',
      };

      MockDataLoader.clearCache('partners');

      return {
        data: activatedPartner,
        success: true,
        message: 'Partner activated successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to activate partner',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async deactivatePartner(id: string): Promise<ApiResponse<Partner>> {
    await delay();

    try {
      const partner = await MockDataLoader.findById<Partner>('partners', id);

      if (!partner) {
        return {
          data: null,
          success: false,
          message: 'Partner not found',
          error: {
            code: 404,
            message: 'Partner not found',
          },
        };
      }

      const deactivatedPartner: Partner = {
        ...partner,
        status: 'inactive',
      };

      MockDataLoader.clearCache('partners');

      return {
        data: deactivatedPartner,
        success: true,
        message: 'Partner deactivated successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to deactivate partner',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async getPartnerStats(): Promise<ApiResponse<any>> {
    await delay();

    try {
      const partners = await MockDataLoader.getPartners();

      const stats = {
        totalPartners: partners.length,
        activePartners: partners.filter(p => p.status === 'active').length,
        pendingPartners: partners.filter(p => p.status === 'pending').length,
        inactivePartners: partners.filter(p => p.status === 'inactive').length,
        hiringPartners: partners.filter(p => p.isHiring).length,
        educationPartners: partners.filter(p => p.type === 'education').length,
        technologyPartners: partners.filter(p => p.type === 'technology')
          .length,
        consultingPartners: partners.filter(p => p.type === 'consulting')
          .length,
        totalJobOpportunities: partners.reduce(
          (sum, p) => sum + (p.jobOpportunities || 0),
          0
        ),
        totalAlumniHired: partners.reduce(
          (sum, p) => sum + (p.alumniHired || 0),
          0
        ),
        averageHireRate:
          partners.length > 0
            ? partners.reduce((sum, p) => sum + (p.hireRate || 0), 0) /
              partners.length
            : 0,
      };

      return {
        data: stats,
        success: true,
        message: 'Partner statistics retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve partner statistics',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async bulkUpdatePartners(
    ids: string[],
    updates: Partial<Partner>
  ): Promise<ApiResponse<Partner[]>> {
    await delay();

    try {
      const partners = await MockDataLoader.getPartners();
      const updatedPartners: Partner[] = [];

      for (const id of ids) {
        const partner = partners.find(p => p.id === id);
        if (partner) {
          const updatedPartner = {
            ...partner,
            ...updates,
            id,
          };
          updatedPartners.push(updatedPartner);
        }
      }

      MockDataLoader.clearCache('partners');

      return {
        data: updatedPartners,
        success: true,
        message: `${updatedPartners.length} partners updated successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to bulk update partners',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
