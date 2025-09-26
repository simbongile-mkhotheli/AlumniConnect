import type {
  Opportunity,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../../types';
import { MockDataLoader } from '../../utils/mockDataLoader';

/**
 * Opportunities Mock API Service
 * Uses db.json as data source via MockDataLoader
 */

// Utilities
const delay = (ms = 250) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Filter opportunities based on filters
 */
const filterOpportunities = (
  opportunities: Opportunity[],
  filters: FilterState
): Opportunity[] => {
  return MockDataLoader.filterItems(opportunities, {
    status: filters.status,
    type: filters.type,
    level: filters.level,
    title: filters.search, // Search in title
    company: filters.search, // Search in company
    location: filters.search, // Search in location
  });
};

/**
 * OpportunitiesMockApiService
 * All methods now use data from db.json via MockDataLoader
 */
export class OpportunitiesMockApiService {
  static async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return Promise.resolve({ data: { status: 'ok' }, success: true, message: 'opportunities mock healthy' });
  }
  /**
   * Get all opportunities with optional filtering and pagination
   */
  static async getOpportunities(
    page = 1,
    limit = 20,
    filters?: FilterState
  ): Promise<PaginatedResponse<Opportunity>> {
    await delay();

    try {
      let opportunities = await MockDataLoader.getOpportunities();

      // Apply filters if provided
      if (filters) {
        opportunities = filterOpportunities(opportunities, filters);
      }

      // Sort by posted date (newest first) by default
      opportunities = MockDataLoader.sortItems(
        opportunities,
        'postedDate',
        'desc'
      );

      // Apply pagination
      const effectivePage = filters?.page || page || 1;
      const effectiveLimit = filters?.limit || limit || 20;
      const paginatedResult = MockDataLoader.paginateItems(
        opportunities,
        effectivePage,
        effectiveLimit
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
        message: 'Opportunities retrieved successfully',
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
        message: 'Failed to retrieve opportunities',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get opportunity by ID
   */
  static async getOpportunityById(
    id: string
  ): Promise<ApiResponse<Opportunity>> {
    await delay();

    try {
      const opportunity = await MockDataLoader.findById<Opportunity>(
        'opportunities',
        id
      );

      if (!opportunity) {
        return {
          data: null,
          success: false,
          message: 'Opportunity not found',
          error: {
            code: 404,
            message: 'Opportunity not found',
          },
        };
      }

      return {
        data: opportunity,
        success: true,
        message: 'Opportunity retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve opportunity',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Create new opportunity
   */
  static async createOpportunity(
    opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Opportunity>> {
    await delay();

    try {
      const newOpportunity: Opportunity = {
        ...opportunityData,
        id: `opportunity-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const persisted = await MockDataLoader.createItem<Opportunity>('opportunities', newOpportunity);
      return {
        data: persisted!,
        success: true,
        message: 'Opportunity created successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to create opportunity',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Update opportunity
   */
  static async updateOpportunity(
    id: string,
    opportunityData: Partial<Opportunity>
  ): Promise<ApiResponse<Opportunity>> {
    await delay();

    try {
      const existingOpportunity = await MockDataLoader.findById<Opportunity>(
        'opportunities',
        id
      );

      if (!existingOpportunity) {
        return {
          data: null,
          success: false,
          message: 'Opportunity not found',
          error: {
            code: 404,
            message: 'Opportunity not found',
          },
        };
      }

      const updatedOpportunity: Opportunity = {
        ...existingOpportunity,
        ...opportunityData,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };
      const persisted = await MockDataLoader.putItem<Opportunity>('opportunities', id, updatedOpportunity);
      return {
        data: persisted!,
        success: true,
        message: 'Opportunity updated successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to update opportunity',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Delete opportunity
   */
  static async deleteOpportunity(id: string): Promise<ApiResponse<void>> {
    await delay();

    try {
      const existingOpportunity = await MockDataLoader.findById<Opportunity>(
        'opportunities',
        id
      );

      if (!existingOpportunity) {
        return {
          data: null,
          success: false,
          message: 'Opportunity not found',
          error: {
            code: 404,
            message: 'Opportunity not found',
          },
        };
      }
      await MockDataLoader.deleteItem('opportunities', id);
      return {
        data: null,
        success: true,
        message: 'Opportunity deleted successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to delete opportunity',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get opportunities by status
   */
  static async getOpportunitiesByStatus(
    status: Opportunity['status']
  ): Promise<ApiResponse<Opportunity[]>> {
    await delay();

    try {
      const opportunities = await MockDataLoader.getOpportunities();
      const filteredOpportunities = opportunities.filter(
        opportunity => opportunity.status === status
      );

      return {
        data: filteredOpportunities,
        success: true,
        message: `Opportunities with status '${status}' retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve opportunities by status',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get opportunities by type
   */
  static async getOpportunitiesByType(
    type: Opportunity['type']
  ): Promise<ApiResponse<Opportunity[]>> {
    await delay();

    try {
      const opportunities = await MockDataLoader.getOpportunities();
      const filteredOpportunities = opportunities.filter(
        opportunity => opportunity.type === type
      );

      return {
        data: filteredOpportunities,
        success: true,
        message: `${type} opportunities retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve opportunities by type',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get active opportunities
   */
  static async getActiveOpportunities(): Promise<ApiResponse<Opportunity[]>> {
    await delay();

    try {
      const opportunities = await MockDataLoader.getOpportunities();
      const now = new Date();

      const activeOpportunities = opportunities.filter(
        opportunity =>
          opportunity.status === 'active' &&
          (!!opportunity.expiryDate ? new Date(opportunity.expiryDate) > now : true)
      );

      return {
        data: activeOpportunities,
        success: true,
        message: 'Active opportunities retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve active opportunities',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get featured opportunities
   */
  static async getFeaturedOpportunities(): Promise<ApiResponse<Opportunity[]>> {
    await delay();

    try {
      const opportunities = await MockDataLoader.getOpportunities();
      const featuredOpportunities = opportunities.filter(
        opportunity => opportunity.featured
      );

      return {
        data: featuredOpportunities,
        success: true,
        message: 'Featured opportunities retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve featured opportunities',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get urgent opportunities
   */
  static async getUrgentOpportunities(): Promise<ApiResponse<Opportunity[]>> {
    await delay();

    try {
      const opportunities = await MockDataLoader.getOpportunities();
      const urgentOpportunities = opportunities.filter(
        opportunity => opportunity.urgent
      );

      return {
        data: urgentOpportunities,
        success: true,
        message: 'Urgent opportunities retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve urgent opportunities',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get opportunity statistics
   */
  static async getOpportunityStats(opportunityId?: string): Promise<ApiResponse<any>> {
    await delay();

    try {
      const opportunities = await MockDataLoader.getOpportunities();
      const now = new Date();

      const stats = {
        totalOpportunities: opportunities.length,
        activeOpportunities: opportunities.filter(o => o.status === 'active')
          .length,
        expiredOpportunities: opportunities.filter(
          o =>
            o.status === 'expired' ||
            (!!o.expiryDate && new Date(o.expiryDate) < now)
        ).length,
        filledOpportunities: opportunities.filter(o => o.status === 'filled')
          .length,
        jobOpportunities: opportunities.filter(o => o.type === 'job').length,
        internshipOpportunities: opportunities.filter(
          o => o.type === 'internship'
        ).length,
        freelanceOpportunities: opportunities.filter(
          o => o.type === 'freelance'
        ).length,
        volunteerOpportunities: opportunities.filter(
          o => o.type === 'volunteer'
        ).length,
        featuredOpportunities: opportunities.filter(o => o.featured).length,
        urgentOpportunities: opportunities.filter(o => o.urgent).length,
        totalApplications: opportunities.reduce(
          (sum, o) => sum + (o.applicationCount || 0),
          0
        ),
        totalViews: opportunities.reduce(
          (sum, o) => sum + (o.viewCount || 0),
          0
        ),
      };

      return {
        data: stats,
        success: true,
        message: 'Opportunity statistics retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve opportunity statistics',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Bulk operations on opportunities
   */
  static async bulkUpdateOpportunities(
    ids: string[],
    updates: Partial<Opportunity>
  ): Promise<ApiResponse<Opportunity[]>> {
    await delay();

    try {
      const opportunities = await MockDataLoader.getOpportunities();
      const updatedOpportunities: Opportunity[] = [];

      for (const id of ids) {
        const opportunity = opportunities.find(o => o.id === id);
        if (opportunity) {
          const updatedOpportunity = {
            ...opportunity,
            ...updates,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
          };
          updatedOpportunities.push(updatedOpportunity);
        }
      }

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('opportunities');

      return {
        data: updatedOpportunities,
        success: true,
        message: `${updatedOpportunities.length} opportunities updated successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to bulk update opportunities',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  // Alias method expected by service
  static async getOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    return this.getOpportunityById(id);
  }

  // Activate
  static async activateOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    return this.updateOpportunity(id, { status: 'active' });
  }
  // Deactivate
  static async deactivateOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    return this.updateOpportunity(id, { status: 'pending' });
  }
  // Expire
  static async expireOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    return this.updateOpportunity(id, { status: 'expired' });
  }
  // Renew (set active & push expiry in future)
  static async renewOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    return this.updateOpportunity(id, { status: 'active', expiryDate: new Date(Date.now() + 1000*60*60*24*30).toISOString() });
  }
  // Approve
  static async approveOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    return this.updateOpportunity(id, { status: 'active' });
  }
  // Reject
  static async rejectOpportunity(id: string): Promise<ApiResponse<Opportunity>> {
    return this.updateOpportunity(id, { status: 'cancelled' });
  }
  // Mark filled
  static async markAsFilled(id: string): Promise<ApiResponse<Opportunity>> {
    return this.updateOpportunity(id, { status: 'filled' });
  }
  // Bulk operation wrapper expected by service
  static async bulkOperation(operation: 'activate' | 'expire' | 'delete', ids: string[]): Promise<ApiResponse<any>> {
    if (operation === 'delete') {
      // Perform deletes sequentially (mock)
      for (const id of ids) {
        await this.deleteOpportunity(id);
      }
      return { data: { deleted: ids.length }, success: true };
    }
    if (operation === 'activate') {
      return this.bulkUpdateOpportunities(ids, { status: 'active' });
    }
    if (operation === 'expire') {
      return this.bulkUpdateOpportunities(ids, { status: 'expired' });
    }
    return { data: null, success: false, message: 'Unsupported bulk operation' };
  }
  // Level filter
  static async getOpportunitiesByLevel(level: Opportunity['level']): Promise<ApiResponse<Opportunity[]>> {
    const all = await MockDataLoader.getOpportunities();
    return { data: all.filter(o => o.level === level), success: true };
  }
  // Applications list
  static async getOpportunityApplications(opportunityId: string): Promise<ApiResponse<any[]>> {
    // Mock simple empty list
    return { data: [], success: true };
  }
  // Apply
  static async applyToOpportunity(opportunityId: string, application: any): Promise<ApiResponse<any>> {
    return { data: { id: `application-${Date.now()}`, opportunityId, ...application }, success: true };
  }
  // Search
  static async searchOpportunities(query: string, filters?: Partial<FilterState>): Promise<ApiResponse<Opportunity[]>> {
    const all = await MockDataLoader.getOpportunities();
    const lower = query.toLowerCase();
    const results = all.filter(o =>
      o.title.toLowerCase().includes(lower) ||
      o.company.toLowerCase().includes(lower) ||
      o.location.toLowerCase().includes(lower)
    );
    // Reuse filtering logic for filters param
    const filtered = filters ? filterOpportunities(results, filters as FilterState) : results;
    return { data: filtered, success: true };
  }
  // Export
  static async exportOpportunities(format: 'csv' | 'xlsx' | 'json', filters?: FilterState): Promise<ApiResponse<{ downloadUrl: string }>> {
    return { data: { downloadUrl: `/mock/opportunities/export.${format}` }, success: true };
  }
  // Import
  static async importOpportunities(file: File, options?: { skipDuplicates?: boolean; updateExisting?: boolean; }): Promise<ApiResponse<{ imported: number; skipped: number; errors: string[] }>> {
    return { data: { imported: 1, skipped: 0, errors: [] }, success: true };
  }
  // Analytics by id alias (reuse stats for now)
  static async getOpportunityAnalytics(id: string): Promise<ApiResponse<Record<string, any>>> {
    const stats = await this.getOpportunityStats();
    return { data: stats.data, success: true };
  }
}
