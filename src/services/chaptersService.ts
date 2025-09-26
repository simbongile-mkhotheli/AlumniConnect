// src/services/chaptersService.ts
import ApiService from './api';
import { shouldUseMockApi } from './useMockApi';
import { ChaptersMockApiService } from './mockApis/chaptersMockApi';
import { CHAPTERS } from './endpoints';
import type {
  Chapter,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../types';

/**
 * Chapters Service
 * - Uses mock API when VITE_ENABLE_MOCK_API === 'true'
 * - Uses ApiService for real server calls otherwise
 */
export class ChaptersService {
  private static useMockApi(): boolean {
    return shouldUseMockApi();
  }

  static async getChapters(
    page = 1,
    limit = 20,
    filters?: FilterState
  ): Promise<PaginatedResponse<Chapter>> {
    if (this.useMockApi()) {
      return ChaptersMockApiService.getChapters({
        ...filters,
        page,
        limit,
      });
    }

    // For real API, rely on ApiService.getPaginated or build query
    return ApiService.getPaginated<Chapter>(CHAPTERS.BASE, page, limit, {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.search ? { q: filters.search } : {}),
      ...(filters?.location ? { location: filters.location } : {}),
    });
  }

  static async getChapter(id: string): Promise<ApiResponse<Chapter>> {
    if (this.useMockApi()) {
      return ChaptersMockApiService.getChapterById(id);
    }
    return ApiService.get<Chapter>(CHAPTERS.BY_ID(id));
  }

  static async createChapter(
    data: Omit<Chapter, 'id' | 'createdAt' | 'membersCount' | 'eventsCount'>
  ): Promise<ApiResponse<Chapter>> {
    if (this.useMockApi()) {
      return ChaptersMockApiService.createChapter(data as any);
    }
    return ApiService.post<Chapter>(CHAPTERS.BASE, data);
  }

  static async updateChapter(
    id: string,
    data: Partial<Chapter>
  ): Promise<ApiResponse<Chapter>> {
    if (this.useMockApi()) {
      return ChaptersMockApiService.updateChapter(id, data);
    }
    return ApiService.put<Chapter>(CHAPTERS.BY_ID(id), data);
  }

  static async deleteChapter(id: string): Promise<ApiResponse<void>> {
    if (this.useMockApi()) {
      const result = await ChaptersMockApiService.deleteChapter(id);
      return {
        ...result,
        data: undefined,
      } as ApiResponse<void>;
    }
    return ApiService.delete<void>(CHAPTERS.BY_ID(id));
  }

  static async activateChapter(id: string): Promise<ApiResponse<Chapter>> {
    if (this.useMockApi()) {
      // Mock activation by updating status to active
      return ChaptersMockApiService.updateChapter(id, { status: 'active' });
    }
    return ApiService.post<Chapter>(CHAPTERS.ACTIVATE(id));
  }

  static async deactivateChapter(id: string): Promise<ApiResponse<Chapter>> {
    if (this.useMockApi()) {
      // Mock deactivation by updating status to inactive  
      return ChaptersMockApiService.updateChapter(id, { status: 'inactive' });
    }
    return ApiService.post<Chapter>(CHAPTERS.DEACTIVATE(id));
  }

  static async getChaptersByLocation(
    location: string
  ): Promise<ApiResponse<Chapter[]>> {
    if (this.useMockApi()) {
      return ChaptersMockApiService.getChaptersByLocation(location);
    }
    return ApiService.get<Chapter[]>(CHAPTERS.BY_LOCATION(location));
  }

  static async getActiveChapters(): Promise<ApiResponse<Chapter[]>> {
    if (this.useMockApi()) {
      // Get chapters with status filter
      const response = await ChaptersMockApiService.getChapters({ status: 'active' });
      return {
        success: response.success,
        message: response.message,
        data: response.data || [],
        error: response.error,
      };
    }
    return ApiService.get<Chapter[]>(CHAPTERS.ACTIVE);
  }

  static async bulkOperation(
    operation: 'activate' | 'deactivate' | 'delete',
    ids: string[]
  ): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      // Mock bulk operation - process each ID individually
      const results = [];
      for (const id of ids) {
        try {
          let result;
          switch (operation) {
            case 'activate':
              result = await ChaptersMockApiService.updateChapter(id, { status: 'active' });
              break;
            case 'deactivate':
              result = await ChaptersMockApiService.updateChapter(id, { status: 'inactive' });
              break;
            case 'delete':
              result = await ChaptersMockApiService.deleteChapter(id);
              break;
          }
          results.push(result);
        } catch (error) {
          results.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }
      return {
        success: true,
        message: `Bulk ${operation} completed`,
        data: results,
      };
    }
    return ApiService.post(CHAPTERS.BULK, { operation, ids });
  }

  static async getChapterStats(): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      return ChaptersMockApiService.getChapterStats();
    }
    return ApiService.get<any>(`${CHAPTERS.BASE}/stats`);
  }
}

export default ChaptersService;
