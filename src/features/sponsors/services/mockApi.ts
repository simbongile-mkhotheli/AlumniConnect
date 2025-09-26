import type {
  Sponsor,
  SponsorFormData,
  SponsorFilters,
  ApiResponse,
  PaginatedResponse,
  BulkOperationResult,
} from '../types';
import { MockDataLoader } from '@shared/utils/mockDataLoader';

const delay = (ms = 250) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Sponsors Mock API Service
 * Uses db.json as data source via MockDataLoader
 */
export class SponsorsMockApiService {
  static async getSponsors(
    page: number = 1,
    limit: number = 20,
    filters?: SponsorFilters
  ): Promise<PaginatedResponse<Sponsor>> {
    await delay();
    try {
      let sponsors = await MockDataLoader.getSponsors();
      
      // Apply filters if provided
      if (filters) {
        sponsors = MockDataLoader.filterItems(sponsors, filters);
      }

      const paginatedResult = MockDataLoader.paginateItems(sponsors, page, limit);

      return {
        data: paginatedResult.items,
        pagination: {
          page: paginatedResult.page,
          limit: paginatedResult.limit,
          total: paginatedResult.total,
          totalPages: paginatedResult.totalPages,
        },
        success: true,
        message: 'Sponsors retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        success: false,
        message: 'Failed to retrieve sponsors',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async getSponsor(id: string): Promise<ApiResponse<Sponsor>> {
    await delay();
    try {
      const sponsor = await MockDataLoader.findById<Sponsor>('sponsors', id);
      if (!sponsor) {
        return {
          data: null as any,
          success: false,
          message: 'Sponsor not found',
          error: { code: 404, message: 'Sponsor not found' },
        };
      }
      return { data: sponsor, success: true, message: 'Sponsor retrieved successfully' };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to retrieve sponsor',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async createSponsor(sponsorData: SponsorFormData): Promise<ApiResponse<Sponsor>> {
    await delay();
    try {
      const newSponsor: Sponsor = {
        ...sponsorData,
        id: `sponsor-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Ensure required numeric relationship fields exist even if not provided in form
        eventsSponsored: 0,
        chaptersSponsored: 0,
      };
      const persisted = await MockDataLoader.createItem<Sponsor>('sponsors', newSponsor);
      return { data: persisted!, success: true, message: 'Sponsor created successfully' };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to create sponsor',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async updateSponsor(
    id: string,
    sponsorData: Partial<SponsorFormData>
  ): Promise<ApiResponse<Sponsor>> {
    await delay();
    try {
      const existing = await MockDataLoader.findById<Sponsor>('sponsors', id);
      if (!existing) {
        return {
          data: null as any,
          success: false,
          message: 'Sponsor not found',
          error: { code: 404, message: 'Sponsor not found' },
        };
      }
      const updated: Sponsor = {
        ...existing,
        ...sponsorData,
        id,
        updatedAt: new Date().toISOString(),
        // Preserve required counters (default to previous or zero)
        eventsSponsored: existing.eventsSponsored ?? 0,
        chaptersSponsored: existing.chaptersSponsored ?? 0,
      };
      const persisted = await MockDataLoader.putItem<Sponsor>('sponsors', id, updated);
      return { data: persisted!, success: true, message: 'Sponsor updated successfully' };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to update sponsor',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async deleteSponsor(id: string): Promise<ApiResponse<void>> {
    await delay();
    try {
      const existing = await MockDataLoader.findById<Sponsor>('sponsors', id);
      if (!existing) {
        return {
          data: undefined as any,
          success: false,
          message: 'Sponsor not found',
          error: { code: 404, message: 'Sponsor not found' },
        };
      }
      await MockDataLoader.deleteItem('sponsors', id);
      return { data: undefined as any, success: true, message: 'Sponsor deleted successfully' };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to delete sponsor',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async activateSponsor(id: string): Promise<ApiResponse<Sponsor>> {
    return this.updateSponsor(id, { status: 'active' });
  }

  static async deactivateSponsor(id: string): Promise<ApiResponse<Sponsor>> {
    return this.updateSponsor(id, { status: 'inactive' });
  }

  static async getSponsorsByTier(tier: string): Promise<ApiResponse<Sponsor[]>> {
    await delay();
    try {
      const sponsors = await MockDataLoader.getSponsors();
      const filtered = sponsors.filter(sponsor => sponsor.tier === tier);
      return { data: filtered, success: true, message: `Sponsors with tier '${tier}' retrieved successfully` };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve sponsors by tier',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async bulkOperation(
    operation: 'activate' | 'deactivate' | 'delete',
    sponsorIds: string[]
  ): Promise<ApiResponse<BulkOperationResult>> {
    await delay();
    try {
      let updatedCount = 0;
      for (const id of sponsorIds) {
        const sponsor = await MockDataLoader.findById<Sponsor>('sponsors', id);
        if (sponsor) {
          updatedCount++;
        }
      }
      MockDataLoader.clearCache('sponsors');
      return {
        data: { updatedCount },
        success: true,
        message: `Bulk ${operation} completed on ${updatedCount} sponsors`,
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: `Failed to perform bulk ${operation}`,
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
}