import ApiService from './api';
import { shouldUseMockApi } from './useMockApi';
import { SpotlightsMockApiService } from './mockApis';
import { SPOTLIGHTS } from './endpoints';
import type {
  Spotlight,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../types';

/**
 * Spotlights Service
 * Handles all spotlight-related API operations
 */
export class SpotlightsService {
  /**
   * Check if mock API should be used
   */
  private static useMockApi(): boolean {
    return shouldUseMockApi();
  }

  /**
   * Get all spotlights with optional filtering and pagination
   */
  static async getSpotlights(
    page: number = 1,
    limit: number = 20,
    filters?: FilterState
  ): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.getSpotlights({
        page,
        limit,
        ...filters,
      });
    }

    const params: Record<string, any> = {};

    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if (filters?.search) params.search = filters.search;

    return ApiService.getPaginated<Spotlight>(
      SPOTLIGHTS.BASE,
      page,
      limit,
      params
    );
  }

  /**
   * Get spotlight by ID
   */
  static async getSpotlight(
    id: string
  ): Promise<ApiResponse<Spotlight | null>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.getSpotlightById(id);
    }

    return ApiService.get<Spotlight>(SPOTLIGHTS.BY_ID(id));
  }

  /**
   * Create new spotlight
   */
  static async createSpotlight(
    spotlightData: Omit<Spotlight, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Spotlight | null>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.createSpotlight(spotlightData);
    }

    return ApiService.post<Spotlight>(SPOTLIGHTS.BASE, spotlightData);
  }

  /**
   * Update existing spotlight
   */
  static async updateSpotlight(
    id: string,
    spotlightData: Partial<Spotlight>
  ): Promise<ApiResponse<Spotlight | null>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.updateSpotlight(id, spotlightData);
    }

    return ApiService.put<Spotlight>(SPOTLIGHTS.BY_ID(id), spotlightData);
  }

  /**
   * Delete spotlight
   */
  static async deleteSpotlight(id: string): Promise<ApiResponse<null>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.deleteSpotlight(id);
    }

    return ApiService.delete<null>(SPOTLIGHTS.BY_ID(id));
  }

  /**
   * Publish spotlight
   */
  static async publishSpotlight(
    id: string
  ): Promise<ApiResponse<Spotlight | null>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.publishSpotlight(id);
    }

    return ApiService.post<Spotlight>(SPOTLIGHTS.PUBLISH(id));
  }

  /**
   * Unpublish spotlight
   */
  static async unpublishSpotlight(
    id: string
  ): Promise<ApiResponse<Spotlight | null>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.unpublishSpotlight(id);
    }

    return ApiService.post<Spotlight>(SPOTLIGHTS.UNPUBLISH(id));
  }

  /**
   * Feature spotlight
   */
  static async featureSpotlight(
    id: string
  ): Promise<ApiResponse<Spotlight | null>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.featureSpotlight(id);
    }

    return ApiService.post<Spotlight>(SPOTLIGHTS.FEATURE(id));
  }

  /**
   * Unfeature spotlight
   */
  static async unfeatureSpotlight(
    id: string
  ): Promise<ApiResponse<Spotlight | null>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.unfeatureSpotlight(id);
    }

    return ApiService.post<Spotlight>(SPOTLIGHTS.UNFEATURE(id));
  }

  /**
   * Archive spotlight (mock implementation)
   */
  static async archiveSpotlight(
    id: string
  ): Promise<ApiResponse<Spotlight | null>> {
    if (this.useMockApi()) {
      // Mock archive by updating status
      return SpotlightsMockApiService.updateSpotlight(id, {
        status: 'archived',
      });
    }

    return ApiService.post<Spotlight>(SPOTLIGHTS.ARCHIVE(id));
  }

  /**
   * Get spotlights by type
   */
  static async getSpotlightsByType(
    type: Spotlight['type']
  ): Promise<ApiResponse<Spotlight[]>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.getSpotlightsByType(type);
    }

    return ApiService.get<Spotlight[]>(SPOTLIGHTS.BY_TYPE(type));
  }

  /**
   * Get featured spotlights
   */
  static async getFeaturedSpotlights(): Promise<ApiResponse<Spotlight[]>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.getFeaturedSpotlights();
    }

    return ApiService.get<Spotlight[]>(SPOTLIGHTS.FEATURED);
  }

  /**
   * Get published spotlights
   */
  static async getPublishedSpotlights(): Promise<ApiResponse<Spotlight[]>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.getPublishedSpotlights();
    }

    return ApiService.get<Spotlight[]>(SPOTLIGHTS.PUBLISHED);
  }

  /**
   * Get spotlight analytics
   */
  static async getSpotlightAnalytics(id: string): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      // Mock analytics data
      return {
        data: {
          views: 1250,
          likes: 89,
          shares: 23,
          comments: 15,
          engagementRate: 0.12,
          viewTrend: [],
          demographicBreakdown: {},
          socialMetrics: {
            facebook: { shares: 10, likes: 45 },
            twitter: { retweets: 8, likes: 34 },
            linkedin: { shares: 5, likes: 10 },
          },
          referralSources: {},
        },
        success: true,
        message: 'Spotlight analytics retrieved successfully',
      };
    }

    return ApiService.get<any>(SPOTLIGHTS.ANALYTICS(id));
  }

  /**
   * Search spotlights
   */
  static async searchSpotlights(
    query: string,
    filters?: Partial<FilterState>
  ): Promise<ApiResponse<Spotlight[]>> {
    if (this.useMockApi()) {
      const result = await SpotlightsMockApiService.getSpotlights({
        search: query,
        ...filters,
      });
      return {
        data: result.data,
        success: result.success,
        message: result.message,
      };
    }

    const params = {
      q: query,
      ...filters,
    };

    return ApiService.get<Spotlight[]>('/search/spotlights', params);
  }

  /**
   * Get spotlight statistics
   */
  static async getSpotlightStats(): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      return SpotlightsMockApiService.getSpotlightStats();
    }

    return ApiService.get<any>(`${SPOTLIGHTS.BASE}/stats`);
  }

  /**
   * Export spotlights data
   */
  static async exportSpotlights(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    filters?: FilterState
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    if (this.useMockApi()) {
      // Mock export
      return {
        data: { downloadUrl: `mock-spotlights-export.${format}` },
        success: true,
        message: 'Spotlights exported successfully',
      };
    }

    const params = {
      format,
      ...filters,
    };

    return ApiService.get<{ downloadUrl: string }>(
      `${SPOTLIGHTS.BASE}/export`,
      params
    );
  }

  /**
   * Import spotlights data
   */
  static async importSpotlights(
    file: File,
    options?: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
    }
  ): Promise<
    ApiResponse<{
      imported: number;
      skipped: number;
      errors: string[];
    }>
  > {
    if (this.useMockApi()) {
      // Mock import
      return {
        data: { imported: 0, skipped: 0, errors: [] },
        success: true,
        message: 'Spotlights imported successfully',
      };
    }

    return ApiService.uploadFile<{
      imported: number;
      skipped: number;
      errors: string[];
    }>(`${SPOTLIGHTS.BASE}/import`, file, options);
  }

  /**
   * Upload spotlight media
   */
  static async uploadMedia(
    id: string,
    mediaFile: File,
    mediaType: 'image' | 'video'
  ): Promise<ApiResponse<{ mediaUrl: string }>> {
    if (this.useMockApi()) {
      // Mock media upload
      return {
        data: { mediaUrl: `https://picsum.photos/800/600?random=${id}` },
        success: true,
        message: 'Media uploaded successfully',
      };
    }

    return ApiService.uploadFile<{ mediaUrl: string }>(
      `/files/spotlight-${mediaType}/${id}`,
      mediaFile
    );
  }

  /**
   * Like spotlight
   */
  static async likeSpotlight(
    id: string,
    userId: string
  ): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
    if (this.useMockApi()) {
      // Mock like functionality
      return {
        data: { liked: true, likeCount: 90 },
        success: true,
        message: 'Spotlight liked successfully',
      };
    }

    return ApiService.post<{ liked: boolean; likeCount: number }>(
      `${SPOTLIGHTS.BY_ID(id)}/like`,
      { userId }
    );
  }

  /**
   * Share spotlight
   */
  static async shareSpotlight(
    id: string,
    shareData: {
      userId: string;
      platform: 'facebook' | 'twitter' | 'linkedin' | 'email' | 'copy';
      message?: string;
    }
  ): Promise<ApiResponse<{ shareCount: number }>> {
    if (this.useMockApi()) {
      // Mock share functionality
      return {
        data: { shareCount: 24 },
        success: true,
        message: 'Spotlight shared successfully',
      };
    }

    return ApiService.post<{ shareCount: number }>(
      `${SPOTLIGHTS.BY_ID(id)}/share`,
      shareData
    );
  }

  /**
   * Add comment to spotlight
   */
  static async addComment(
    id: string,
    commentData: {
      userId: string;
      content: string;
      parentCommentId?: string;
    }
  ): Promise<
    ApiResponse<{
      commentId: string;
      content: string;
      authorName: string;
      createdAt: string;
    }>
  > {
    if (this.useMockApi()) {
      // Mock comment functionality
      return {
        data: {
          commentId: `comment-${Date.now()}`,
          content: commentData.content,
          authorName: 'Mock User',
          createdAt: new Date().toISOString(),
        },
        success: true,
        message: 'Comment added successfully',
      };
    }

    return ApiService.post<any>(
      `${SPOTLIGHTS.BY_ID(id)}/comments`,
      commentData
    );
  }

  /**
   * Get spotlight comments
   */
  static async getSpotlightComments(id: string): Promise<
    ApiResponse<
      Array<{
        commentId: string;
        content: string;
        authorId: string;
        authorName: string;
        createdAt: string;
        parentCommentId?: string;
        replies?: any[];
      }>
    >
  > {
    if (this.useMockApi()) {
      // Mock comments
      return {
        data: [],
        success: true,
        message: 'Comments retrieved successfully',
      };
    }

    return ApiService.get<any[]>(`${SPOTLIGHTS.BY_ID(id)}/comments`);
  }

  /**
   * Schedule spotlight publication
   */
  static async schedulePublication(
    id: string,
    scheduleData: {
      publishedDate: string;
      autoFeature?: boolean;
      socialMediaPosts?: Array<{
        platform: string;
        message: string;
        scheduledTime: string;
      }>;
    }
  ): Promise<ApiResponse<Spotlight | null>> {
    if (this.useMockApi()) {
      // Mock schedule functionality - use publishedDate instead of scheduledFor
      return SpotlightsMockApiService.updateSpotlight(id, {
        status: 'scheduled',
        publishedDate: scheduleData.publishedDate,
      });
    }

    return ApiService.post<Spotlight>(
      `${SPOTLIGHTS.BY_ID(id)}/schedule`,
      scheduleData
    );
  }

  /**
   * Bulk operations on spotlights
   */
  static async bulkOperation(
    operation:
      | 'publish'
      | 'unpublish'
      | 'feature'
      | 'unfeature'
      | 'archive'
      | 'delete',
    spotlightIds: string[]
  ): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      const updates: Partial<Spotlight> = {};

      switch (operation) {
        case 'publish':
          updates.status = 'published';
          break;
        case 'unpublish':
          updates.status = 'draft';
          break;
        case 'feature':
          updates.featured = true;
          break;
        case 'unfeature':
          updates.featured = false;
          break;
        case 'archive':
          updates.status = 'archived';
          break;
        case 'delete':
          // Mock delete operation
          return {
            data: { deleted: spotlightIds.length },
            success: true,
            message: `${spotlightIds.length} spotlights deleted successfully`,
          };
      }

      return SpotlightsMockApiService.bulkUpdateSpotlights(
        spotlightIds,
        updates
      );
    }

    return ApiService.bulkOperation<any>(
      SPOTLIGHTS.BASE,
      operation,
      spotlightIds
    );
  }
}

export default SpotlightsService;
