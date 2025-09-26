import { ApiService, shouldUseMockApi } from '@shared/services';
import { SpotlightsMockApi } from './mockApi';
import { SPOTLIGHTS_ENDPOINTS, buildSpotlightEndpoint } from './endpoints';
import type {
  Spotlight,
  SpotlightCategory,
  SpotlightNomination,
  SpotlightStats,
  CreateSpotlightRequest,
  UpdateSpotlightRequest,
  SpotlightFilters
} from '../types/spotlight';
import type { PaginatedResponse } from '@shared/types';

/**
 * Spotlights Service
 * Handles all spotlight-related operations including alumni achievements,
 * success stories, nominations, and engagement features
 */
export class SpotlightsService {
  private apiService = ApiService; // singleton instance
  private mockApi: SpotlightsMockApi;
  private useMock: boolean;

  constructor() {
  // ApiService is a singleton; no instantiation needed
    this.mockApi = new SpotlightsMockApi();
    this.useMock = shouldUseMockApi();
  }

  // Core CRUD Operations
  // Support both signatures:
  // - getSpotlights(page?: number, limit?: number, filters?: SpotlightFilters)
  // - getSpotlights(filters?: SpotlightFilters)
  async getSpotlights(
    pageOrParams?: number | SpotlightFilters,
    limit?: number,
    filters?: SpotlightFilters
  ): Promise<PaginatedResponse<Spotlight>> {
    // Normalize arguments
    let page = 1;
    let perPage = 20;
    let params: SpotlightFilters | undefined = undefined;

    if (typeof pageOrParams === 'number') {
      page = pageOrParams ?? 1;
      perPage = limit ?? 20;
      params = filters;
    } else {
      const p = pageOrParams || {};
      page = (p as SpotlightFilters).page ?? 1;
      perPage = (p as SpotlightFilters).limit ?? 20;
      // Exclude page/limit from params to avoid duplication in query
      const { page: _pg, limit: _lim, ...rest } = p as SpotlightFilters;
      params = rest;
    }

    if (this.useMock) {
      return this.mockApi.getSpotlights({ page, limit: perPage, ...(params || {}) });
    }

    // Use paginated API to preserve envelope { data, pagination, success, message }
    return this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.BASE,
      page,
      perPage,
      params
    );
  }

  async getSpotlightById(id: string): Promise<Spotlight | null> {
    if (this.useMock) {
      return this.mockApi.getSpotlightById(id);
    }

    try {
      const response = await this.apiService.get<Spotlight>(
        buildSpotlightEndpoint('BY_ID', { id })
      );
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) return null;
      throw error;
    }
  }

  async createSpotlight(request: CreateSpotlightRequest): Promise<Spotlight> {
    if (this.useMock) {
      return this.mockApi.createSpotlight(request);
    }

    const response = await this.apiService.post<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.BASE,
      request
    );
    return response.data;
  }

  async updateSpotlight(id: string, request: UpdateSpotlightRequest): Promise<Spotlight | null> {
    if (this.useMock) {
      return this.mockApi.updateSpotlight(id, request);
    }

    try {
      const response = await this.apiService.put<Spotlight>(
        buildSpotlightEndpoint('BY_ID', { id }),
        request
      );
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) return null;
      throw error;
    }
  }

  async deleteSpotlight(id: string): Promise<boolean> {
    if (this.useMock) {
      return this.mockApi.deleteSpotlight(id);
    }

    try {
      await this.apiService.delete(buildSpotlightEndpoint('BY_ID', { id }));
      return true;
    } catch (error) {
      if ((error as any)?.response?.status === 404) return false;
      throw error;
    }
  }

  // Search and Filtering
  async searchSpotlights(query: string, filters?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.searchSpotlights(query, filters);
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.SEARCH,
      (filters?.page ?? 1),
      (filters?.limit ?? 20),
      { q: query, ...filters }
    );
    return response;
  }

  async getSpotlightsByCategory(category: string, params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      // Category concept not encoded directly; rely on generic filtering (no-op here)
      return this.mockApi.getSpotlights(params);
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      buildSpotlightEndpoint('BY_CATEGORY', { category }),
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  async getSpotlightsByTag(tag: string, params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.getSpotlights({ ...params, tags: [tag] });
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      buildSpotlightEndpoint('BY_TAG', { tag }),
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  async getSpotlightsByAuthor(authorId: string, params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      // authorId not part of SpotlightFilters; treat as generic fetch
      return this.mockApi.getSpotlights(params);
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      buildSpotlightEndpoint('BY_AUTHOR', { authorId }),
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  async getSpotlightsByFeaturedPerson(personId: string, params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      // featuredPersonId not part of SpotlightFilters; treat as generic fetch
      return this.mockApi.getSpotlights(params);
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      buildSpotlightEndpoint('BY_FEATURED_PERSON', { personId }),
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  // Publication Status
  async getPublishedSpotlights(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.getPublishedSpotlights(params);
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.PUBLISHED,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  async getDraftSpotlights(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.getDraftSpotlights(params);
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.DRAFT,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  async publishSpotlight(id: string): Promise<Spotlight | null> {
    if (this.useMock) {
      return this.mockApi.publishSpotlight(id);
    }

    try {
      const response = await this.apiService.patch<Spotlight>(
        buildSpotlightEndpoint('PUBLISH', { id })
      );
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) return null;
      throw error;
    }
  }

  async unpublishSpotlight(id: string): Promise<Spotlight | null> {
    if (this.useMock) {
      return this.mockApi.unpublishSpotlight(id);
    }

    try {
      const response = await this.apiService.patch<Spotlight>(
        buildSpotlightEndpoint('UNPUBLISH', { id })
      );
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) return null;
      throw error;
    }
  }

  async archiveSpotlight(id: string): Promise<Spotlight | null> {
    if (this.useMock) {
      return this.mockApi.updateSpotlight(id, { status: 'archived' });
    }

    try {
      const response = await this.apiService.patch<Spotlight>(
        buildSpotlightEndpoint('ARCHIVE', { id })
      );
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) return null;
      throw error;
    }
  }

  // Featured and Trending
  async getFeaturedSpotlights(): Promise<Spotlight[]> {
    if (this.useMock) {
      return this.mockApi.getFeaturedSpotlights();
    }

    const response = await this.apiService.get<Spotlight[]>(
      SPOTLIGHTS_ENDPOINTS.FEATURED
    );
    return response.data;
  }

  async getTrendingSpotlights(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.getSpotlights({ ...params, sortBy: 'viewCount' });
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.TRENDING,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  async getRecentSpotlights(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.getSpotlights({ ...params, sortBy: 'publishedDate' });
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.RECENT,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  async getPopularSpotlights(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.getSpotlights({ ...params, sortBy: 'likeCount' });
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.POPULAR,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  // Engagement
  async likeSpotlight(spotlightId: string, userId: string): Promise<boolean> {
    if (this.useMock) {
      return this.mockApi.likeSpotlight(spotlightId, userId);
    }

    try {
      await this.apiService.post(
        buildSpotlightEndpoint('LIKE', { id: spotlightId }),
        { userId }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async unlikeSpotlight(spotlightId: string, userId: string): Promise<boolean> {
    if (this.useMock) {
      return this.mockApi.unlikeSpotlight(spotlightId, userId);
    }

    try {
      await this.apiService.post(
        buildSpotlightEndpoint('UNLIKE', { id: spotlightId }),
        { userId }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async shareSpotlight(spotlightId: string, userId: string): Promise<boolean> {
    if (this.useMock) {
      await this.mockApi.incrementShareCount(spotlightId);
      return true;
    }

    try {
      await this.apiService.post(
        buildSpotlightEndpoint('SHARE', { id: spotlightId }),
        { userId }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async incrementViewCount(spotlightId: string): Promise<void> {
    if (this.useMock) {
      await this.mockApi.incrementViewCount(spotlightId);
      return;
    }

    await this.apiService.post(
      buildSpotlightEndpoint('VIEW', { id: spotlightId })
    );
  }

  async bookmarkSpotlight(spotlightId: string, userId: string): Promise<boolean> {
    if (this.useMock) {
      // Mock implementation
      return true;
    }

    try {
      await this.apiService.post(
        buildSpotlightEndpoint('BOOKMARK', { id: spotlightId }),
        { userId }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async unbookmarkSpotlight(spotlightId: string, userId: string): Promise<boolean> {
    if (this.useMock) {
      // Mock implementation
      return true;
    }

    try {
      await this.apiService.post(
        buildSpotlightEndpoint('UNBOOKMARK', { id: spotlightId }),
        { userId }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  // Nominations
  async getNominations(): Promise<SpotlightNomination[]> {
    if (this.useMock) {
      return this.mockApi.getNominations();
    }

    const response = await this.apiService.get<SpotlightNomination[]>(
      SPOTLIGHTS_ENDPOINTS.NOMINATIONS
    );
    return response.data;
  }

  async createNomination(nomination: Omit<SpotlightNomination, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpotlightNomination> {
    if (this.useMock) {
      return this.mockApi.createNomination(nomination);
    }

    const response = await this.apiService.post<SpotlightNomination>(
      SPOTLIGHTS_ENDPOINTS.NOMINATE,
      nomination
    );
    return response.data;
  }

  async getNominationById(id: string): Promise<SpotlightNomination | null> {
    if (this.useMock) {
      const nominations = await this.mockApi.getNominations();
      return nominations.find(n => n.id === id) || null;
    }

    try {
      const response = await this.apiService.get<SpotlightNomination>(
        buildSpotlightEndpoint('NOMINATION_BY_ID', { id })
      );
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) return null;
      throw error;
    }
  }

  async approveNomination(nominationId: string): Promise<SpotlightNomination | null> {
    if (this.useMock) {
      return this.mockApi.approveNomination(nominationId);
    }

    try {
      const response = await this.apiService.patch<SpotlightNomination>(
        buildSpotlightEndpoint('APPROVE_NOMINATION', { id: nominationId })
      );
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) return null;
      throw error;
    }
  }

  async rejectNomination(nominationId: string, reason?: string): Promise<SpotlightNomination | null> {
    if (this.useMock) {
      return this.mockApi.rejectNomination(nominationId, reason);
    }

    try {
      const response = await this.apiService.patch<SpotlightNomination>(
        buildSpotlightEndpoint('REJECT_NOMINATION', { id: nominationId }),
        { reason }
      );
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) return null;
      throw error;
    }
  }

  // Categories and Tags
  async getSpotlightCategories(): Promise<SpotlightCategory[]> {
    if (this.useMock) {
      return this.mockApi.getSpotlightCategories();
    }

    const response = await this.apiService.get<SpotlightCategory[]>(
      SPOTLIGHTS_ENDPOINTS.CATEGORIES
    );
    return response.data;
  }

  async getTags(): Promise<Array<{ tag: string; count: number }>> {
    if (this.useMock) {
      return this.mockApi.getPopularTags();
    }

    const response = await this.apiService.get<Array<{ tag: string; count: number }>>(
      SPOTLIGHTS_ENDPOINTS.TAGS
    );
    return response.data;
  }

  async getTagSuggestions(query: string): Promise<string[]> {
    if (this.useMock) {
      const popularTags = await this.mockApi.getPopularTags();
      return popularTags
        .filter(t => t.tag.toLowerCase().includes(query.toLowerCase()))
        .map(t => t.tag)
        .slice(0, 10);
    }

    const response = await this.apiService.get<string[]>(
      SPOTLIGHTS_ENDPOINTS.TAG_SUGGESTIONS,
      { q: query }
    );
    return response.data;
  }

  // User Interactions
  async getMySpotlights(userId: string, params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.getSpotlights(params);
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.MY_SPOTLIGHTS,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      { userId, ...params }
    );
    return response;
  }

  async getMyLikes(userId: string, params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        success: true,
        message: 'Mock liked spotlights'
      };
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.MY_LIKES,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      { userId, ...params }
    );
    return response;
  }

  async getMyBookmarks(userId: string, params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        success: true,
        message: 'Mock bookmarked spotlights'
      };
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.MY_BOOKMARKS,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      { userId, ...params }
    );
    return response;
  }

  // Success Stories
  async getSuccessStories(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.getSpotlights(params);
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.SUCCESS_STORIES,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  async getCareerChangeStories(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.getSpotlights({ ...params, tags: ['career-change'] });
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.CAREER_CHANGES,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  async getEntrepreneurshipStories(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.getSpotlights(params);
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.ENTREPRENEURSHIP,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  async getSocialImpactStories(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    if (this.useMock) {
      return this.mockApi.getSpotlights(params);
    }

    const response = await this.apiService.getPaginated<Spotlight>(
      SPOTLIGHTS_ENDPOINTS.SOCIAL_IMPACT,
      (params?.page ?? 1),
      (params?.limit ?? 20),
      params
    );
    return response;
  }

  // Analytics and Statistics
  async getSpotlightStats(spotlightId?: string): Promise<SpotlightStats> {
    if (this.useMock) {
      return this.mockApi.getSpotlightStats(spotlightId);
    }

    const endpoint = spotlightId 
      ? buildSpotlightEndpoint('ANALYTICS', { id: spotlightId })
      : SPOTLIGHTS_ENDPOINTS.STATS;
      
    const response = await this.apiService.get<SpotlightStats>(endpoint);
    return response.data;
  }

  async getUserStats(userId: string): Promise<any> {
    if (this.useMock) {
      // Mock user stats
      return {
        spotlightsCreated: Math.floor(Math.random() * 10),
        totalViews: Math.floor(Math.random() * 1000),
        totalLikes: Math.floor(Math.random() * 100),
        avgEngagement: Math.random() * 100
      };
    }

    const response = await this.apiService.get(
      buildSpotlightEndpoint('USER_STATS', { userId })
    );
    return response.data;
  }

  async getMonthlyStats(): Promise<any> {
    if (this.useMock) {
      // Mock monthly stats
      return {
        thisMonth: {
          published: Math.floor(Math.random() * 20),
          views: Math.floor(Math.random() * 5000),
          likes: Math.floor(Math.random() * 500)
        },
        lastMonth: {
          published: Math.floor(Math.random() * 25),
          views: Math.floor(Math.random() * 4500),
          likes: Math.floor(Math.random() * 450)
        },
        growth: {
          published: Math.random() * 0.2 - 0.1,
          views: Math.random() * 0.3 - 0.1,
          likes: Math.random() * 0.4 - 0.1
        }
      };
    }

    const response = await this.apiService.get(
      SPOTLIGHTS_ENDPOINTS.MONTHLY_STATS
    );
    return response.data;
  }

  // Bulk Operations
  async bulkCreateSpotlights(spotlights: CreateSpotlightRequest[]): Promise<Spotlight[]> {
    if (this.useMock) {
      return this.mockApi.bulkCreateSpotlights(spotlights);
    }

    const response = await this.apiService.post<Spotlight[]>(
      SPOTLIGHTS_ENDPOINTS.BULK_CREATE,
      { spotlights }
    );
    return response.data;
  }

  async bulkUpdateSpotlights(updates: Array<{ id: string; data: UpdateSpotlightRequest }>): Promise<Spotlight[]> {
    if (this.useMock) {
      const updatedSpotlights: Spotlight[] = [];
      for (const update of updates) {
        const spotlight = await this.mockApi.updateSpotlight(update.id, update.data);
        if (spotlight) {
          updatedSpotlights.push(spotlight);
        }
      }
      return updatedSpotlights;
    }

    const response = await this.apiService.patch<Spotlight[]>(
      SPOTLIGHTS_ENDPOINTS.BULK_UPDATE,
      { updates }
    );
    return response.data;
  }

  async bulkDeleteSpotlights(ids: string[]): Promise<{ deletedCount: number; errors: string[] }> {
    if (this.useMock) {
      let deletedCount = 0;
      const errors: string[] = [];
      
      for (const id of ids) {
        const success = await this.mockApi.deleteSpotlight(id);
        if (success) {
          deletedCount++;
        } else {
          errors.push(`Spotlight ${id} not found`);
        }
      }
      
      return { deletedCount, errors };
    }

    // ApiService.delete currently only takes (url); simulate bulk by sequential deletes
    let deletedCount = 0;
    const errors: string[] = [];
    for (const id of ids) {
      const res = await this.apiService.delete<any>(buildSpotlightEndpoint('BY_ID', { id }));
      if (res.success) deletedCount++; else errors.push(`Failed to delete ${id}`);
    }
    const response: { deletedCount: number; errors: string[] } = { deletedCount, errors };
    return response;
  }

  async bulkPublishSpotlights(ids: string[]): Promise<Spotlight[]> {
    if (this.useMock) {
      const publishedSpotlights: Spotlight[] = [];
      for (const id of ids) {
        const spotlight = await this.mockApi.publishSpotlight(id);
        if (spotlight) {
          publishedSpotlights.push(spotlight);
        }
      }
      return publishedSpotlights;
    }

    const response = await this.apiService.patch<Spotlight[]>(
      SPOTLIGHTS_ENDPOINTS.BULK_PUBLISH,
      { ids }
    );
    return response.data;
  }

  // Export functionality
  async exportSpotlights(format: 'csv' | 'json' = 'csv', filters?: SpotlightFilters): Promise<Blob> {
    if (this.useMock) {
      const spotlights = await this.mockApi.getSpotlights(filters);
      const data = format === 'json' 
        ? JSON.stringify(spotlights.data, null, 2)
        : this.convertToCSV(spotlights.data);
      
      return new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
    }

    // Note: ApiService.get doesn't support responseType currently; this endpoint may need a dedicated method.
    const response = await this.apiService.get<Blob>(
      SPOTLIGHTS_ENDPOINTS.EXPORT,
      { format, ...filters }
    );
    return response.data;
  }

  // Moderation
  async reportSpotlight(spotlightId: string, userId: string, reason: string): Promise<boolean> {
    if (this.useMock) {
      // Mock implementation
      return true;
    }

    try {
      await this.apiService.post(
        buildSpotlightEndpoint('REPORT', { id: spotlightId }),
        { userId, reason }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper Methods
  private convertToCSV(spotlights: Spotlight[]): string {
    if (spotlights.length === 0) return '';
    
    const headers = Object.keys(spotlights[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = spotlights.map(spotlight => 
      headers.map(header => {
        const value = spotlight[header as keyof Spotlight];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }
}