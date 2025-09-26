import type {
  Chapter,
  ChapterFormData,
  ChapterFilters,
  ApiResponse,
  PaginatedResponse,
  BulkOperationResult,
} from '../types';
import { MockDataLoader } from '@shared/utils/mockDataLoader';

const delay = (ms = 250) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Chapters Mock API Service
 */
export class ChaptersMockApiService {
  static async getChapters(
    page: number = 1,
    limit: number = 20,
    filters?: ChapterFilters
  ): Promise<PaginatedResponse<Chapter>> {
    await delay();
    try {
      let chapters = await MockDataLoader.getChapters();
      
      if (filters) {
        chapters = MockDataLoader.filterItems(chapters, filters);
      }

      const paginatedResult = MockDataLoader.paginateItems(chapters, page, limit);

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
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        success: false,
        message: 'Failed to retrieve chapters',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async getChapter(id: string): Promise<ApiResponse<Chapter>> {
    await delay();
    try {
      const chapter = await MockDataLoader.findById<Chapter>('chapters', id);
      if (!chapter) {
        return {
          data: null as any,
          success: false,
          message: 'Chapter not found',
          error: { code: 404, message: 'Chapter not found' },
        };
      }
      return { data: chapter, success: true, message: 'Chapter retrieved successfully' };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to retrieve chapter',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async createChapter(chapterData: ChapterFormData): Promise<ApiResponse<Chapter>> {
    await delay();
    try {
      const newChapter: Chapter = {
        ...chapterData,
        id: `chapter-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Ensure required numeric stats exist on creation
        membersCount: (chapterData as any).membersCount ?? (chapterData as any).memberCount ?? 0,
        eventsCount: (chapterData as any).eventsCount ?? 0,
        // Normalize leaders (ChapterFormData.leaders is flat array; Chapter expects array of arrays)
        leaders: chapterData.leaders ? [chapterData.leaders] : undefined,
      };
      const persisted = await MockDataLoader.createItem<Chapter>('chapters', newChapter);
      return { data: persisted!, success: true, message: 'Chapter created successfully' };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to create chapter',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async updateChapter(
    id: string,
    chapterData: Partial<ChapterFormData>
  ): Promise<ApiResponse<Chapter>> {
    await delay();
    try {
      const existing = await MockDataLoader.findById<Chapter>('chapters', id);
      if (!existing) {
        return {
          data: null as any,
          success: false,
          message: 'Chapter not found',
          error: { code: 404, message: 'Chapter not found' },
        };
      }
      const updated: Chapter = {
        ...existing,
        ...chapterData,
        id,
        updatedAt: new Date().toISOString(),
        // Preserve existing counts or fall back to provided partials
        membersCount: (chapterData as any).membersCount ?? (chapterData as any).memberCount ?? existing.membersCount ?? (existing as any).memberCount ?? 0,
        eventsCount: (chapterData as any).eventsCount ?? (existing as any).eventsCount ?? 0,
        // Normalize leaders shape if a flat array was provided
        leaders: chapterData.leaders
          ? [chapterData.leaders]
          : existing.leaders && Array.isArray(existing.leaders)
            ? existing.leaders
            : undefined,
      };
      const persisted = await MockDataLoader.putItem<Chapter>('chapters', id, updated);
      return { data: persisted!, success: true, message: 'Chapter updated successfully' };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to update chapter',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async deleteChapter(id: string): Promise<ApiResponse<void>> {
    await delay();
    try {
      const existing = await MockDataLoader.findById<Chapter>('chapters', id);
      if (!existing) {
        return {
          data: undefined as any,
          success: false,
          message: 'Chapter not found',
          error: { code: 404, message: 'Chapter not found' },
        };
      }
      await MockDataLoader.deleteItem('chapters', id);
      return { data: undefined as any, success: true, message: 'Chapter deleted successfully' };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to delete chapter',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async activateChapter(id: string): Promise<ApiResponse<Chapter>> {
    return this.updateChapter(id, { status: 'active' });
  }

  static async deactivateChapter(id: string): Promise<ApiResponse<Chapter>> {
    return this.updateChapter(id, { status: 'inactive' });
  }

  static async getChaptersByRegion(region: string): Promise<ApiResponse<Chapter[]>> {
    await delay();
    try {
      const chapters = await MockDataLoader.getChapters();
      const filtered = chapters.filter(chapter => chapter.region === region);
      return { data: filtered, success: true, message: `Chapters in '${region}' retrieved successfully` };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve chapters by region',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async getChapterMembers(id: string): Promise<ApiResponse<any[]>> {
    await delay();
    try {
      const chapter = await MockDataLoader.findById<Chapter>('chapters', id);
      if (!chapter) {
        return {
          data: [],
          success: false,
          message: 'Chapter not found',
          error: { code: 404, message: 'Chapter not found' },
        };
      }
      // Mock members data
      const members = Array.from({ length: (chapter as any).membersCount || (chapter as any).memberCount || 0 }, (_, i) => ({
        id: `member-${i + 1}`,
        name: `Member ${i + 1}`,
        email: `member${i + 1}@example.com`,
        joinDate: new Date().toISOString(),
      }));
      return { data: members, success: true, message: 'Chapter members retrieved successfully' };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve chapter members',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async bulkOperation(
    operation: 'activate' | 'deactivate' | 'delete',
    chapterIds: string[]
  ): Promise<ApiResponse<BulkOperationResult>> {
    await delay();
    try {
      let updatedCount = 0;
      for (const id of chapterIds) {
        const chapter = await MockDataLoader.findById<Chapter>('chapters', id);
        if (chapter) {
          updatedCount++;
        }
      }
      MockDataLoader.clearCache('chapters');
      return {
        data: { updatedCount },
        success: true,
        message: `Bulk ${operation} completed on ${updatedCount} chapters`,
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