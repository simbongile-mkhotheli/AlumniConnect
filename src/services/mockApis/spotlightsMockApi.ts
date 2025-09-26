import type {
  Spotlight,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../../types';
import { MockDataLoader } from '../../utils/mockDataLoader';

/**
 * Spotlights Mock API Service
 * Uses db.json as data source via MockDataLoader
 */

// Utilities
const delay = (ms = 250) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Filter spotlights based on filters
 */
const filterSpotlights = (
  spotlights: Spotlight[],
  filters: FilterState
): Spotlight[] => {
  return MockDataLoader.filterItems(spotlights, {
    status: filters.status,
    type: filters.type,
    title: filters.search, // Search in title
    featuredAlumniName: filters.search, // Search in featured alumni name
    content: filters.search, // Search in content
  });
};

/**
 * SpotlightsMockApiService
 * All methods now use data from db.json via MockDataLoader
 */
export class SpotlightsMockApiService {
  static async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return Promise.resolve({ data: { status: 'ok' }, success: true, message: 'spotlights mock healthy' });
  }
  /**
   * Get all spotlights with optional filtering and pagination
   */
  static async getSpotlights(
    filters?: FilterState
  ): Promise<PaginatedResponse<Spotlight>> {
    await delay();

    try {
      let spotlights = await MockDataLoader.getSpotlights();

      // Apply filters if provided
      if (filters) {
        spotlights = filterSpotlights(spotlights, filters);
      }

      // Sort by published date (newest first) by default
      spotlights = MockDataLoader.sortItems(
        spotlights,
        'publishedDate',
        'desc'
      );

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const paginatedResult = MockDataLoader.paginateItems(
        spotlights,
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
        message: 'Spotlights retrieved successfully',
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
        message: 'Failed to retrieve spotlights',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get spotlight by ID
   */
  static async getSpotlightById(
    id: string
  ): Promise<ApiResponse<Spotlight | null>> {
    await delay();

    try {
      const spotlight = await MockDataLoader.findById<Spotlight>(
        'spotlights',
        id
      );

      if (!spotlight) {
        return {
          data: null,
          success: false,
          message: 'Spotlight not found',
          error: {
            code: 404,
            message: 'Spotlight not found',
          },
        };
      }

      return {
        data: spotlight,
        success: true,
        message: 'Spotlight retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve spotlight',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Create new spotlight
   */
  static async createSpotlight(
    spotlightData: Omit<Spotlight, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Spotlight | null>> {
    await delay();

    try {
      const newSpotlight: Spotlight = {
        ...spotlightData,
        id: `spotlight-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('spotlights');

      return {
        data: newSpotlight,
        success: true,
        message: 'Spotlight created successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to create spotlight',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Update spotlight
   */
  static async updateSpotlight(
    id: string,
    spotlightData: Partial<Spotlight>
  ): Promise<ApiResponse<Spotlight | null>> {
    await delay();

    try {
      const existingSpotlight = await MockDataLoader.findById<Spotlight>(
        'spotlights',
        id
      );

      if (!existingSpotlight) {
        return {
          data: null,
          success: false,
          message: 'Spotlight not found',
          error: {
            code: 404,
            message: 'Spotlight not found',
          },
        };
      }

      const updatedSpotlight: Spotlight = {
        ...existingSpotlight,
        ...spotlightData,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('spotlights');

      return {
        data: updatedSpotlight,
        success: true,
        message: 'Spotlight updated successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to update spotlight',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Delete spotlight
   */
  static async deleteSpotlight(id: string): Promise<ApiResponse<null>> {
    await delay();

    try {
      const existingSpotlight = await MockDataLoader.findById<Spotlight>(
        'spotlights',
        id
      );

      if (!existingSpotlight) {
        return {
          data: null,
          success: false,
          message: 'Spotlight not found',
          error: {
            code: 404,
            message: 'Spotlight not found',
          },
        };
      }

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('spotlights');

      return {
        data: null,
        success: true,
        message: 'Spotlight deleted successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to delete spotlight',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get spotlights by status
   */
  static async getSpotlightsByStatus(
    status: Spotlight['status']
  ): Promise<ApiResponse<Spotlight[]>> {
    await delay();

    try {
      const spotlights = await MockDataLoader.getSpotlights();
      const filteredSpotlights = spotlights.filter(
        spotlight => spotlight.status === status
      );

      return {
        data: filteredSpotlights,
        success: true,
        message: `Spotlights with status '${status}' retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve spotlights by status',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get spotlights by type
   */
  static async getSpotlightsByType(
    type: Spotlight['type']
  ): Promise<ApiResponse<Spotlight[]>> {
    await delay();

    try {
      const spotlights = await MockDataLoader.getSpotlights();
      const filteredSpotlights = spotlights.filter(
        spotlight => spotlight.type === type
      );

      return {
        data: filteredSpotlights,
        success: true,
        message: `${type} spotlights retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve spotlights by type',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get published spotlights
   */
  static async getPublishedSpotlights(): Promise<ApiResponse<Spotlight[]>> {
    await delay();

    try {
      const spotlights = await MockDataLoader.getSpotlights();
      const publishedSpotlights = spotlights.filter(
        spotlight => spotlight.status === 'published'
      );

      return {
        data: publishedSpotlights,
        success: true,
        message: 'Published spotlights retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve published spotlights',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get featured spotlights
   */
  static async getFeaturedSpotlights(): Promise<ApiResponse<Spotlight[]>> {
    await delay();

    try {
      const spotlights = await MockDataLoader.getSpotlights();
      const featuredSpotlights = spotlights.filter(
        spotlight => spotlight.featured === true
      );

      return {
        data: featuredSpotlights,
        success: true,
        message: 'Featured spotlights retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve featured spotlights',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Publish spotlight
   */
  static async publishSpotlight(
    id: string
  ): Promise<ApiResponse<Spotlight | null>> {
    await delay();

    try {
      const spotlight = await MockDataLoader.findById<Spotlight>(
        'spotlights',
        id
      );

      if (!spotlight) {
        return {
          data: null,
          success: false,
          message: 'Spotlight not found',
          error: {
            code: 404,
            message: 'Spotlight not found',
          },
        };
      }

      const publishedSpotlight: Spotlight = {
        ...spotlight,
        status: 'published',
        publishedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('spotlights');

      return {
        data: publishedSpotlight,
        success: true,
        message: 'Spotlight published successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to publish spotlight',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Unpublish spotlight
   */
  static async unpublishSpotlight(
    id: string
  ): Promise<ApiResponse<Spotlight | null>> {
    await delay();

    try {
      const spotlight = await MockDataLoader.findById<Spotlight>(
        'spotlights',
        id
      );

      if (!spotlight) {
        return {
          data: null,
          success: false,
          message: 'Spotlight not found',
          error: {
            code: 404,
            message: 'Spotlight not found',
          },
        };
      }

      const unpublishedSpotlight: Spotlight = {
        ...spotlight,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('spotlights');

      return {
        data: unpublishedSpotlight,
        success: true,
        message: 'Spotlight unpublished successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to unpublish spotlight',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Feature spotlight
   */
  static async featureSpotlight(
    id: string
  ): Promise<ApiResponse<Spotlight | null>> {
    await delay();

    try {
      const spotlight = await MockDataLoader.findById<Spotlight>(
        'spotlights',
        id
      );

      if (!spotlight) {
        return {
          data: null,
          success: false,
          message: 'Spotlight not found',
          error: {
            code: 404,
            message: 'Spotlight not found',
          },
        };
      }

      const featuredSpotlight: Spotlight = {
        ...spotlight,
        featured: true,
        updatedAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('spotlights');

      return {
        data: featuredSpotlight,
        success: true,
        message: 'Spotlight featured successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to feature spotlight',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Unfeature spotlight
   */
  static async unfeatureSpotlight(
    id: string
  ): Promise<ApiResponse<Spotlight | null>> {
    await delay();

    try {
      const spotlight = await MockDataLoader.findById<Spotlight>(
        'spotlights',
        id
      );

      if (!spotlight) {
        return {
          data: null,
          success: false,
          message: 'Spotlight not found',
          error: {
            code: 404,
            message: 'Spotlight not found',
          },
        };
      }

      const unfeaturedSpotlight: Spotlight = {
        ...spotlight,
        featured: false,
        updatedAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('spotlights');

      return {
        data: unfeaturedSpotlight,
        success: true,
        message: 'Spotlight unfeatured successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to unfeature spotlight',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get spotlight statistics
   */
  static async getSpotlightStats(): Promise<ApiResponse<any>> {
    await delay();

    try {
      const spotlights = await MockDataLoader.getSpotlights();

      const stats = {
        totalSpotlights: spotlights.length,
        publishedSpotlights: spotlights.filter(s => s.status === 'published')
          .length,
        draftSpotlights: spotlights.filter(s => s.status === 'draft').length,
        scheduledSpotlights: spotlights.filter(s => s.status === 'scheduled')
          .length,
        featuredSpotlights: spotlights.filter(s => s.featured === true).length,
        achievementSpotlights: spotlights.filter(s => s.type === 'achievement')
          .length,
        successStorySpotlights: spotlights.filter(
          s => s.type === 'success_story'
        ).length,
        videoInterviewSpotlights: spotlights.filter(
          s => s.type === 'video_interview'
        ).length,
        totalViews: spotlights.reduce((sum, s) => sum + (s.viewCount || 0), 0),
        totalLikes: spotlights.reduce((sum, s) => sum + (s.likeCount || 0), 0),
        totalShares: spotlights.reduce(
          (sum, s) => sum + (s.shareCount || 0),
          0
        ),
        totalComments: spotlights.reduce(
          (sum, s) => sum + (s.commentCount || 0),
          0
        ),
      };

      return {
        data: stats,
        success: true,
        message: 'Spotlight statistics retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve spotlight statistics',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Bulk operations on spotlights
   */
  static async bulkUpdateSpotlights(
    ids: string[],
    updates: Partial<Spotlight>
  ): Promise<ApiResponse<Spotlight[]>> {
    await delay();

    try {
      const spotlights = await MockDataLoader.getSpotlights();
      const updatedSpotlights: Spotlight[] = [];

      for (const id of ids) {
        const spotlight = spotlights.find(s => s.id === id);
        if (spotlight) {
          const updatedSpotlight = {
            ...spotlight,
            ...updates,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
          };
          updatedSpotlights.push(updatedSpotlight);
        }
      }

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('spotlights');

      return {
        data: updatedSpotlights,
        success: true,
        message: `${updatedSpotlights.length} spotlights updated successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to bulk update spotlights',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
