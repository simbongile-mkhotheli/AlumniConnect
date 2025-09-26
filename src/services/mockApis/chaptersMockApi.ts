// src/services/mockApis/chaptersMockApi.ts
import type {
  Chapter,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../../types';
import { MockDataLoader } from '../../utils/mockDataLoader';

/**
 * ChaptersMockApiService
 * - Uses db.json as data source via MockDataLoader
 * - Returns ApiResponse<T> and PaginatedResponse<T>
 */

// Utilities
const delay = (ms = 250) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Filter chapters based on filters
 */
const filterChapters = (
  chapters: Chapter[],
  filters: FilterState
): Chapter[] => {
  return MockDataLoader.filterItems(chapters, {
    status: filters.status,
    location: filters.search, // Search in location
    name: filters.search, // Search in name
  });
};

/**
 * ChaptersMockApiService
 * All methods now use data from db.json via MockDataLoader
 */
export class ChaptersMockApiService {
  static async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return Promise.resolve({ data: { status: 'ok' }, success: true, message: 'chapters mock healthy' });
  }
  /**
   * Get all chapters with optional filtering and pagination
   */
  static async getChapters(
    filters?: FilterState
  ): Promise<PaginatedResponse<Chapter>> {
    await delay();

    try {
      let chapters = await MockDataLoader.getChapters();

      // Apply filters if provided
      if (filters) {
        chapters = filterChapters(chapters, filters);
      }

      // Sort by name by default
      chapters = MockDataLoader.sortItems(chapters, 'name', 'asc');

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const paginatedResult = MockDataLoader.paginateItems(
        chapters,
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
        message: 'Chapters retrieved successfully',
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
        message: 'Failed to retrieve chapters',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get chapter by ID
   */
  static async getChapterById(id: string): Promise<ApiResponse<Chapter>> {
    await delay();

    try {
      const chapter = await MockDataLoader.findById<Chapter>('chapters', id);

      if (!chapter) {
        return {
          data: null,
          success: false,
          message: 'Chapter not found',
          error: {
            code: 404,
            message: 'Chapter not found',
          },
        };
      }

      return {
        data: chapter,
        success: true,
        message: 'Chapter retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve chapter',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Create new chapter
   */
  static async createChapter(
    chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Chapter>> {
    await delay();

    try {
      const newChapter: Chapter = {
        // Required fields with sensible defaults if missing
        name: chapterData.name || 'Untitled Chapter',
        location: chapterData.location || 'Unknown',
        status: chapterData.status || 'active',
        membersCount: chapterData.membersCount ?? 0,
        eventsCount: chapterData.eventsCount ?? 0,
        ...chapterData,
        id: `chapter-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('chapters');

      return {
        data: newChapter,
        success: true,
        message: 'Chapter created successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to create chapter',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Update chapter
   */
  static async updateChapter(
    id: string,
    chapterData: Partial<Chapter>
  ): Promise<ApiResponse<Chapter>> {
    await delay();

    try {
      const existingChapter = await MockDataLoader.findById<Chapter>(
        'chapters',
        id
      );

      if (!existingChapter) {
        return {
          data: null,
          success: false,
          message: 'Chapter not found',
          error: {
            code: 404,
            message: 'Chapter not found',
          },
        };
      }

      const updatedChapter: Chapter = {
        ...existingChapter,
        ...chapterData,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('chapters');

      return {
        data: updatedChapter,
        success: true,
        message: 'Chapter updated successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to update chapter',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Delete chapter
   */
  static async deleteChapter(id: string): Promise<ApiResponse<null>> {
    await delay();

    try {
      const existingChapter = await MockDataLoader.findById<Chapter>(
        'chapters',
        id
      );

      if (!existingChapter) {
        return {
          data: null,
          success: false,
          message: 'Chapter not found',
          error: {
            code: 404,
            message: 'Chapter not found',
          },
        };
      }

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('chapters');

      return {
        data: null,
        success: true,
        message: 'Chapter deleted successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to delete chapter',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get chapters by status
   */
  static async getChaptersByStatus(
    status: Chapter['status']
  ): Promise<ApiResponse<Chapter[]>> {
    await delay();

    try {
      const chapters = await MockDataLoader.getChapters();
      const filteredChapters = chapters.filter(
        chapter => chapter.status === status
      );

      return {
        data: filteredChapters,
        success: true,
        message: `Chapters with status '${status}' retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve chapters by status',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get chapters by location/region
   */
  static async getChaptersByLocation(
    location: string
  ): Promise<ApiResponse<Chapter[]>> {
    await delay();

    try {
      const chapters = await MockDataLoader.getChapters();
      const filteredChapters = chapters.filter(
        chapter =>
          chapter.location?.toLowerCase().includes(location.toLowerCase()) ||
          chapter.province?.toLowerCase().includes(location.toLowerCase())
      );

      return {
        data: filteredChapters,
        success: true,
        message: `Chapters in '${location}' retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve chapters by location',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get chapter statistics
   */
  static async getChapterStats(): Promise<ApiResponse<any>> {
    await delay();

    try {
      const chapters = await MockDataLoader.getChapters();

      const stats = {
        totalChapters: chapters.length,
        activeChapters: chapters.filter(c => c.status === 'active').length,
        pendingChapters: chapters.filter(c => c.status === 'pending').length,
        inactiveChapters: chapters.filter(c => c.status === 'inactive').length,
        totalMembers: chapters.reduce(
          (sum, c) => sum + (c.memberCount || 0),
          0
        ),
        averageEngagement:
          chapters.length > 0
            ? chapters.reduce((sum, c) => sum + (c.engagementRate || 0), 0) /
              chapters.length
            : 0,
        totalEvents: chapters.reduce(
          (sum, c) => sum + (c.eventsThisMonth || 0),
          0
        ),
      };

      return {
        data: stats,
        success: true,
        message: 'Chapter statistics retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve chapter statistics',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Bulk operations on chapters
   */
  static async bulkUpdateChapters(
    ids: string[],
    updates: Partial<Chapter>
  ): Promise<ApiResponse<Chapter[]>> {
    await delay();

    try {
      const chapters = await MockDataLoader.getChapters();
      const updatedChapters: Chapter[] = [];

      for (const id of ids) {
        const chapter = chapters.find(c => c.id === id);
        if (chapter) {
          const updatedChapter = {
            ...chapter,
            ...updates,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
          };
          updatedChapters.push(updatedChapter);
        }
      }

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('chapters');

      return {
        data: updatedChapters,
        success: true,
        message: `${updatedChapters.length} chapters updated successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to bulk update chapters',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
