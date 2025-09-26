import type { Sponsor, ApiResponse, PaginatedResponse, FilterState } from '../../types';
import { MockDataLoader } from '../../utils/mockDataLoader';

/**
 * Sponsors Mock API Service
 * Uses db.json as data source via MockDataLoader
 */

// Utilities
const delay = (ms = 250) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Filter sponsors based on filters
 */
const filterSponsors = (
  sponsors: Sponsor[],
  filters: FilterState
): Sponsor[] => {
  return MockDataLoader.filterItems(sponsors, {
    status: filters.status,
    tier: filters.tier,
    name: filters.search, // Search in name
  });
};

/**
 * SponsorsMockApiService
 * All methods now use data from db.json via MockDataLoader
 */
export class SponsorsMockApiService {
  static async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return Promise.resolve({ data: { status: 'ok' }, success: true, message: 'sponsors mock healthy' });
  }
  /**
   * Get all sponsors with optional filtering and pagination
   */
  static async getSponsors(
    pageOrFilters?: number | FilterState,
    maybeLimit?: number,
    filters?: FilterState
  ): Promise<PaginatedResponse<Sponsor>> {
    await delay();

    try {
      let sponsors = await MockDataLoader.getSponsors();
      let page = 1;
      let limit = 10;
      let effectiveFilters: FilterState | undefined;

      if (typeof pageOrFilters === 'number') {
        page = pageOrFilters;
        if (typeof maybeLimit === 'number') limit = maybeLimit;
        effectiveFilters = filters;
      } else {
        effectiveFilters = pageOrFilters;
      }

      if (effectiveFilters) {
        sponsors = filterSponsors(sponsors, effectiveFilters);
        if ((effectiveFilters as any).page) page = (effectiveFilters as any).page;
        if ((effectiveFilters as any).limit) limit = (effectiveFilters as any).limit;
      }

      sponsors = MockDataLoader.sortItems(sponsors, 'name', 'asc');
      const paginatedResult = MockDataLoader.paginateItems(
        sponsors,
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
        message: 'Sponsors retrieved successfully',
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
        message: 'Failed to retrieve sponsors',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get sponsor by ID
   */
  static async getSponsorById(id: string): Promise<ApiResponse<Sponsor | null>> {
    await delay();

    try {
      const sponsor = await MockDataLoader.findById<Sponsor>('sponsors', id);

      if (!sponsor) {
        return {
          data: null,
          success: false,
          message: 'Sponsor not found',
          error: {
            code: 404,
            message: 'Sponsor not found',
          },
        };
      }

      return {
        data: sponsor,
        success: true,
        message: 'Sponsor retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve sponsor',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Backwards compatibility alias: tests and service layer previously called getSponsor
   * Provide wrapper that maps to getSponsorById
   */
  static async getSponsor(id: string): Promise<ApiResponse<Sponsor | null>> {
    return this.getSponsorById(id);
  }

  /**
   * Create new sponsor
   */
  static async createSponsor(
    sponsorData: Omit<Sponsor, 'id' | 'createdAt'>
  ): Promise<ApiResponse<Sponsor | null>> {
    await delay();

    try {
      const payload: Sponsor = {
        ...sponsorData,
        id: `sponsor-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Sponsor;
      const persisted = await MockDataLoader.createItem<Sponsor>('sponsors', payload);
      return {
        data: persisted,
        success: true,
        message: 'Sponsor created successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to create sponsor',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Update sponsor
   */
  static async updateSponsor(
    id: string,
    sponsorData: Partial<Sponsor>
  ): Promise<ApiResponse<Sponsor | null>> {
    await delay();

    try {
      const existingSponsor = await MockDataLoader.findById<Sponsor>(
        'sponsors',
        id
      );

      if (!existingSponsor) {
        return {
          data: null,
          success: false,
          message: 'Sponsor not found',
          error: {
            code: 404,
            message: 'Sponsor not found',
          },
        };
      }

      const updatedSponsor: Sponsor = {
        ...existingSponsor,
        ...sponsorData,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };
      const persisted = await MockDataLoader.putItem<Sponsor>('sponsors', id, updatedSponsor);
      return {
        data: persisted,
        success: true,
        message: 'Sponsor updated successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to update sponsor',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Delete sponsor
   */
  static async deleteSponsor(id: string): Promise<ApiResponse<null>> {
    await delay();

    try {
      const existingSponsor = await MockDataLoader.findById<Sponsor>(
        'sponsors',
        id
      );

      if (!existingSponsor) {
        return {
          data: null,
          success: false,
          message: 'Sponsor not found',
          error: {
            code: 404,
            message: 'Sponsor not found',
          },
        };
      }
      await MockDataLoader.deleteItem('sponsors', id);
      return {
        data: null,
        success: true,
        message: 'Sponsor deleted successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to delete sponsor',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get sponsors by tier
   */
  static async getSponsorsByTier(
    tier: Sponsor['tier']
  ): Promise<ApiResponse<Sponsor[]>> {
    await delay();

    try {
      const sponsors = await MockDataLoader.getSponsors();
      const filteredSponsors = sponsors.filter(
        sponsor => sponsor.tier === tier
      );

      return {
        data: filteredSponsors,
        success: true,
        message: `${tier} sponsors retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve sponsors by tier',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get sponsors by status
   */
  static async getSponsorsByStatus(
    status: Sponsor['status']
  ): Promise<ApiResponse<Sponsor[]>> {
    await delay();

    try {
      const sponsors = await MockDataLoader.getSponsors();
      const filteredSponsors = sponsors.filter(
        sponsor => sponsor.status === status
      );

      return {
        data: filteredSponsors,
        success: true,
        message: `Sponsors with status '${status}' retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve sponsors by status',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get active sponsors
   */
  static async getActiveSponsors(): Promise<ApiResponse<Sponsor[]>> {
    await delay();

    try {
      const sponsors = await MockDataLoader.getSponsors();
      const activeSponsors = sponsors.filter(
        sponsor => sponsor.status === 'active'
      );

      return {
        data: activeSponsors,
        success: true,
        message: 'Active sponsors retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve active sponsors',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Activate sponsor
   */
  static async activateSponsor(id: string): Promise<ApiResponse<Sponsor | null>> {
    await delay();

    try {
      const sponsor = await MockDataLoader.findById<Sponsor>('sponsors', id);

      if (!sponsor) {
        return {
          data: null,
          success: false,
          message: 'Sponsor not found',
          error: {
            code: 404,
            message: 'Sponsor not found',
          },
        };
      }

      const activatedSponsor: Sponsor = {
        ...sponsor,
        status: 'active',
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('sponsors');

      return {
        data: activatedSponsor,
        success: true,
        message: 'Sponsor activated successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to activate sponsor',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Deactivate sponsor
   */
  static async deactivateSponsor(id: string): Promise<ApiResponse<Sponsor | null>> {
    await delay();

    try {
      const sponsor = await MockDataLoader.findById<Sponsor>('sponsors', id);

      if (!sponsor) {
        return {
          data: null,
          success: false,
          message: 'Sponsor not found',
          error: {
            code: 404,
            message: 'Sponsor not found',
          },
        };
      }

      const deactivatedSponsor: Sponsor = {
        ...sponsor,
        status: 'inactive',
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('sponsors');

      return {
        data: deactivatedSponsor,
        success: true,
        message: 'Sponsor deactivated successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to deactivate sponsor',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get sponsor analytics (simplified mock)
   */
  static async getSponsorAnalytics(id: string): Promise<ApiResponse<any>> {
    await delay();
    try {
      const sponsor = await MockDataLoader.findById<Sponsor>('sponsors', id);
      if (!sponsor) {
        return {
          data: null,
          success: false,
          message: 'Sponsor not found',
          error: { code: 404, message: 'Sponsor not found' },
        };
      }
      const analytics = {
        eventsSponsored: sponsor.eventsSponsored || 0,
        chaptersSponsored: sponsor.chaptersSponsored || 0,
        totalValue: sponsor.totalValue || 0,
        roi: 1.25,
        engagement: {
          eventAttendance: Math.round(Math.random() * 1000),
          brandMentions: Math.round(Math.random() * 500),
          socialReach: Math.round(Math.random() * 10000),
        },
        performance: {
          leadGeneration: Math.round(Math.random() * 1000),
            conversionRate: Math.round(Math.random() * 100) / 100,
          brandAwareness: Math.round(Math.random() * 100),
        },
        timeline: Array.from({ length: 6 }).map((_, i) => ({
          date: new Date(Date.now() - i * 30 * 86400000).toISOString(),
          events: Math.floor(Math.random() * 5),
          value: Math.floor(Math.random() * 10000),
          attendance: Math.floor(Math.random() * 1000),
        })),
      };
      return { data: analytics, success: true, message: 'Sponsor analytics retrieved successfully' };
    } catch (error) {
      return { data: null, success: false, message: 'Failed to retrieve sponsor analytics', error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  }

  /**
   * Search sponsors
   */
  static async searchSponsors(query: string, filters?: Partial<FilterState>): Promise<ApiResponse<Sponsor[]>> {
    await delay();
    try {
      const sponsors = await MockDataLoader.getSponsors();
      const q = query.toLowerCase();
      let results = sponsors.filter(s => s.name.toLowerCase().includes(q));
      if (filters?.status) results = results.filter(s => s.status === filters.status);
      if (filters?.tier) results = results.filter(s => s.tier === filters.tier);
      return { data: results, success: true, message: 'Sponsors search successful' };
    } catch (error) {
      return { data: [], success: false, message: 'Failed to search sponsors', error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  }

  /**
   * Export sponsors
   */
  static async exportSponsors(format: 'csv' | 'xlsx' | 'json', filters?: FilterState): Promise<ApiResponse<{ downloadUrl: string }>> {
    await delay();
    return { data: { downloadUrl: `/mock-exports/sponsors.${format}` }, success: true, message: 'Export generated' };
  }

  /**
   * Import sponsors
   */
  static async importSponsors(file: File, options?: { skipDuplicates?: boolean; updateExisting?: boolean }): Promise<ApiResponse<{ imported: number; skipped: number; errors: string[] }>> {
    await delay();
    // Mock parse counts lines
    const imported = 5; // static number
    return { data: { imported, skipped: 0, errors: [] }, success: true, message: 'Import completed' };
  }

  /**
   * Upload sponsor logo
   */
  static async uploadLogo(id: string, logoFile: File): Promise<ApiResponse<{ logoUrl: string }>> {
    await delay();
    return { data: { logoUrl: `/mock-uploads/logos/${id}.png` }, success: true, message: 'Logo uploaded' };
  }

  /**
   * Get sponsor events
   */
  static async getSponsorEvents(id: string): Promise<ApiResponse<any[]>> {
    await delay();
    const events = Array.from({ length: 3 }).map((_, i) => ({
      eventId: `${id}-event-${i}`,
      eventTitle: `Event ${i + 1}`,
      eventDate: new Date(Date.now() - i * 7 * 86400000).toISOString(),
      eventLocation: 'Virtual',
      sponsorshipValue: Math.floor(Math.random() * 10000),
      attendanceCount: Math.floor(Math.random() * 1000),
      status: 'completed',
    }));
    return { data: events, success: true, message: 'Sponsor events retrieved' };
  }

  /**
   * Get sponsor chapters
   */
  static async getSponsorChapters(id: string): Promise<ApiResponse<any[]>> {
    await delay();
    const chapters = Array.from({ length: 2 }).map((_, i) => ({
      chapterId: `${id}-chapter-${i}`,
      chapterName: `Chapter ${i + 1}`,
      chapterLocation: 'City',
      sponsorshipValue: Math.floor(Math.random() * 5000),
      memberCount: Math.floor(Math.random() * 300),
      status: 'active',
    }));
    return { data: chapters, success: true, message: 'Sponsor chapters retrieved' };
  }

  /**
   * Renew partnership
   */
  static async renewPartnership(id: string, renewalData: { tier?: string; duration: number; value: number; benefits?: string[] }): Promise<ApiResponse<Sponsor | null>> {
    await delay();
    try {
      const sponsor = await MockDataLoader.findById<Sponsor>('sponsors', id);
      if (!sponsor) {
        return { data: null, success: false, message: 'Sponsor not found', error: { code: 404, message: 'Sponsor not found' } };
      }
      const renewed: Sponsor = { ...sponsor, tier: (renewalData.tier as any) || sponsor.tier, totalValue: (sponsor.totalValue || 0) + renewalData.value };
      MockDataLoader.clearCache('sponsors');
      return { data: renewed, success: true, message: 'Partnership renewed successfully' };
    } catch (error) {
      return { data: null, success: false, message: 'Failed to renew partnership', error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  }

  /**
   * Get sponsor statistics
   */
  static async getSponsorStats(): Promise<ApiResponse<any>> {
    await delay();

    try {
      const sponsors = await MockDataLoader.getSponsors();

      const stats = {
        totalSponsors: sponsors.length,
        activeSponsors: sponsors.filter(s => s.status === 'active').length,
        pendingSponsors: sponsors.filter(s => s.status === 'pending').length,
        inactiveSponsors: sponsors.filter(s => s.status === 'inactive').length,
        platinumSponsors: sponsors.filter(s => s.tier === 'platinum').length,
        goldSponsors: sponsors.filter(s => s.tier === 'gold').length,
        silverSponsors: sponsors.filter(s => s.tier === 'silver').length,
        bronzeSponsors: sponsors.filter(s => s.tier === 'bronze').length,
        totalValue: sponsors.reduce((sum, s) => sum + (s.totalValue || 0), 0),
        totalEventsSponsored: sponsors.reduce(
          (sum, s) => sum + (s.eventsSponsored || 0),
          0
        ),
        totalChaptersSponsored: sponsors.reduce(
          (sum, s) => sum + (s.chaptersSponsored || 0),
          0
        ),
      };

      return {
        data: stats,
        success: true,
        message: 'Sponsor statistics retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve sponsor statistics',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Bulk operations on sponsors
   */
  static async bulkUpdateSponsors(
    ids: string[],
    updates: Partial<Sponsor>
  ): Promise<ApiResponse<Sponsor[]>> {
    await delay();

    try {
      const sponsors = await MockDataLoader.getSponsors();
      const updatedSponsors: Sponsor[] = [];

      for (const id of ids) {
        const sponsor = sponsors.find(s => s.id === id);
        if (sponsor) {
          const updatedSponsor = {
            ...sponsor,
            ...updates,
            id, // Ensure ID doesn't change
          };
          updatedSponsors.push(updatedSponsor);
        }
      }

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('sponsors');

      return {
        data: updatedSponsors,
        success: true,
        message: `${updatedSponsors.length} sponsors updated successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to bulk update sponsors',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Generic bulk operation handler to satisfy existing tests expecting bulkOperation.
   * Supported operations: activate, deactivate, delete, renew, upgrade, downgrade.
   * For unsupported or no-op operations we return success with empty data by default.
   */
  static async bulkOperation(
    operation: 'activate' | 'deactivate' | 'delete' | 'renew' | 'upgrade' | 'downgrade',
    sponsorIds: string[]
  ): Promise<ApiResponse<any>> {
    await delay();
    try {
      const sponsors = await MockDataLoader.getSponsors();
      const affected: Sponsor[] = [];
      for (const id of sponsorIds) {
        const sponsor = sponsors.find(s => s.id === id);
        if (!sponsor) continue;
        let updated: Sponsor | null = null;
        switch (operation) {
          case 'activate':
            updated = { ...sponsor, status: 'active' };
            break;
          case 'deactivate':
            updated = { ...sponsor, status: 'inactive' };
            break;
          case 'delete':
            // We simply omit from affected list to simulate deletion.
            updated = null;
            break;
          case 'renew':
            updated = { ...sponsor, sponsorshipEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString() } as any;
            break;
          case 'upgrade':
            updated = { ...sponsor, tier: 'platinum' };
            break;
          case 'downgrade':
            updated = { ...sponsor, tier: 'silver' };
            break;
        }
        if (updated) affected.push(updated);
      }
      MockDataLoader.clearCache('sponsors');
      return {
        data: { operation, count: affected.length, items: affected },
        success: true,
        message: `Bulk operation '${operation}' applied to ${affected.length} sponsor(s)`,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to perform bulk operation',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
