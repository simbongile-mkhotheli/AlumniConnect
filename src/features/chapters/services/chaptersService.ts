import { ApiService, shouldUseMockApi } from '@shared/services';
import { ChaptersMockApiService } from './mockApi';
import { CHAPTERS_ENDPOINTS } from './endpoints';
import type {
  Chapter,
  ChapterFormData,
  ChapterFilters,
  ApiResponse,
  PaginatedResponse,
  BulkOperationResult,
  ExportResult,
  ImportResult,
} from '../types';

/**
 * Chapters Service
 * Handles all chapter-related API operations
 */
export class ChaptersService {

  /**
   * Get all chapters with optional filtering and pagination
   */
  static async getChapters(
    page: number = 1,
    limit: number = 20,
    filters?: ChapterFilters
  ): Promise<PaginatedResponse<Chapter>> {
    if (shouldUseMockApi()) {
      return ChaptersMockApiService.getChapters(page, limit, filters);
    }

    const params: Record<string, any> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.region) params.region = filters.region;
    if (filters?.search) params.search = filters.search;

    return ApiService.getPaginated<Chapter>(CHAPTERS_ENDPOINTS.BASE, page, limit, params);
  }

  /**
   * Get chapter by ID
   */
  static async getChapter(id: string): Promise<ApiResponse<Chapter>> {
    if (shouldUseMockApi()) {
      return ChaptersMockApiService.getChapter(id);
    }

    return ApiService.get<Chapter>(CHAPTERS_ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new chapter
   */
  static async createChapter(chapterData: ChapterFormData): Promise<ApiResponse<Chapter>> {
    if (shouldUseMockApi()) {
      return ChaptersMockApiService.createChapter(chapterData);
    }

    return ApiService.post<Chapter>(CHAPTERS_ENDPOINTS.BASE, chapterData);
  }

  /**
   * Update existing chapter
   */
  static async updateChapter(
    id: string,
    chapterData: Partial<ChapterFormData>
  ): Promise<ApiResponse<Chapter>> {
    if (shouldUseMockApi()) {
      return ChaptersMockApiService.updateChapter(id, chapterData);
    }

    return ApiService.put<Chapter>(CHAPTERS_ENDPOINTS.BY_ID(id), chapterData);
  }

  /**
   * Delete chapter
   */
  static async deleteChapter(id: string): Promise<ApiResponse<void>> {
    if (shouldUseMockApi()) {
      return ChaptersMockApiService.deleteChapter(id);
    }

    return ApiService.delete<void>(CHAPTERS_ENDPOINTS.BY_ID(id));
  }

  /**
   * Activate chapter
   */
  static async activateChapter(id: string): Promise<ApiResponse<Chapter>> {
    if (shouldUseMockApi()) {
      return ChaptersMockApiService.activateChapter(id);
    }

    return ApiService.post<Chapter>(CHAPTERS_ENDPOINTS.ACTIVATE(id));
  }

  /**
   * Deactivate chapter
   */
  static async deactivateChapter(id: string): Promise<ApiResponse<Chapter>> {
    if (shouldUseMockApi()) {
      return ChaptersMockApiService.deactivateChapter(id);
    }

    return ApiService.post<Chapter>(CHAPTERS_ENDPOINTS.DEACTIVATE(id));
  }

  /**
   * Get chapters by region
   */
  static async getChaptersByRegion(region: string): Promise<ApiResponse<Chapter[]>> {
    if (shouldUseMockApi()) {
      return ChaptersMockApiService.getChaptersByRegion(region);
    }

    return ApiService.get<Chapter[]>(CHAPTERS_ENDPOINTS.BY_REGION(region));
  }

  /**
   * Get chapter members
   */
  static async getChapterMembers(id: string): Promise<ApiResponse<any[]>> {
    if (shouldUseMockApi()) {
      return ChaptersMockApiService.getChapterMembers(id);
    }

    return ApiService.get<any[]>(CHAPTERS_ENDPOINTS.MEMBERS(id));
  }

  /**
   * Bulk operations on chapters
   */
  static async bulkOperation(
    operation: 'activate' | 'deactivate' | 'delete',
    chapterIds: string[]
  ): Promise<ApiResponse<BulkOperationResult>> {
    if (shouldUseMockApi()) {
      return ChaptersMockApiService.bulkOperation(operation, chapterIds);
    }

    return ApiService.bulkOperation<BulkOperationResult>(CHAPTERS_ENDPOINTS.BASE, operation, chapterIds);
  }
}

export default ChaptersService;