import { MockDataLoader } from '@shared/utils/mockDataLoader';
import type { PaginatedResponse } from '@shared/types';
import type {
  Spotlight,
  SpotlightCategory,
  SpotlightNomination,
  SpotlightStats,
  CreateSpotlightRequest,
  UpdateSpotlightRequest,
  SpotlightFilters
} from '../types/spotlight';

/**
 * Mock API implementation for Spotlights
 * Provides realistic data simulation for development and testing
 */
export class SpotlightsMockApi {
  constructor() {}

  // Core CRUD Operations
  async getSpotlights(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
  let spotlights = await MockDataLoader.getSpotlights();

    // Apply filters
    if (params) {
      spotlights = this.applyFilters(spotlights, params);
    }

    // Apply sorting
    if (params?.sortBy) {
      spotlights = this.applySorting(spotlights, params.sortBy, params.sortOrder);
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const total = spotlights.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = spotlights.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      success: true,
      message: 'Spotlights retrieved'
    };
  }

  async getSpotlightById(id: string): Promise<Spotlight | null> {
    return await MockDataLoader.findById<Spotlight>('spotlights', id);
  }

  async createSpotlight(request: CreateSpotlightRequest): Promise<Spotlight> {
    const newSpotlight: Spotlight = {
      id: Date.now().toString(),
      title: request.title,
      type: request.type,
      status: request.status || 'draft',
      featuredAlumniId: request.featuredAlumniId,
      featuredAlumniName: request.featuredAlumniName,
      content: request.content,
      videoUrl: request.videoUrl,
      imageUrl: request.imageUrl,
      tags: request.tags || [],
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,
      commentCount: 0,
      featured: request.featured || false,
      publishedDate: request.status === 'published' ? (request.publishedDate || new Date().toISOString()) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shortDescription: request.shortDescription
    };
    const persisted = await MockDataLoader.createItem<Spotlight>('spotlights', newSpotlight);
    return persisted || newSpotlight;
  }

  async updateSpotlight(id: string, request: UpdateSpotlightRequest): Promise<Spotlight | null> {
    const existing = await MockDataLoader.findById<Spotlight>('spotlights', id);
    if (!existing) return null;
    const willBePublished = request.status === 'published';
    const becamePublished = existing.status !== 'published' && willBePublished;
    const updated: Spotlight = {
      ...existing,
      ...request,
      status: request.status || existing.status,
      updatedAt: new Date().toISOString(),
      publishedDate: becamePublished
        ? (request.publishedDate || new Date().toISOString())
        : existing.publishedDate
    };
    const persisted = await MockDataLoader.putItem<Spotlight>('spotlights', id, updated);
    return persisted || updated;
  }

  async deleteSpotlight(id: string): Promise<boolean> {
    return MockDataLoader.deleteItem('spotlights', id);
  }

  // Search and Filtering
  async searchSpotlights(query: string, filters?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    let spotlights = await MockDataLoader.getSpotlights();

    if (query) {
      const q = query.toLowerCase();
      spotlights = spotlights.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q) ||
        (s.shortDescription?.toLowerCase().includes(q) ?? false) ||
        s.featuredAlumniName.toLowerCase().includes(q) ||
        s.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Apply additional filters
    if (filters) {
      spotlights = this.applyFilters(spotlights, filters);
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const total = spotlights.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = spotlights.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      success: true,
      message: 'Spotlight search results'
    };
  }

  // Publication Status
  async getPublishedSpotlights(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    return this.getSpotlights({ ...params, status: 'published' });
  }

  async getDraftSpotlights(params?: SpotlightFilters): Promise<PaginatedResponse<Spotlight>> {
    return this.getSpotlights({ ...params, status: 'draft' });
  }

  async getFeaturedSpotlights(): Promise<Spotlight[]> {
    const spotlights = await MockDataLoader.getSpotlights();
    return spotlights.filter(s => s.featured && s.status === 'published');
  }

  async publishSpotlight(id: string): Promise<Spotlight | null> {
    return this.updateSpotlight(id, { status: 'published', publishedDate: new Date().toISOString() });
  }

  async unpublishSpotlight(id: string): Promise<Spotlight | null> {
    return this.updateSpotlight(id, { status: 'draft' });
  }

  // Engagement
  async likeSpotlight(spotlightId: string, userId: string): Promise<boolean> {
    const spotlight = await MockDataLoader.findById<Spotlight>('spotlights', spotlightId);
    if (!spotlight) return false;
    const likeCount = (spotlight.likeCount || 0) + 1;
    await MockDataLoader.patchItem<Spotlight>('spotlights', spotlightId, { likeCount });
    return true;
  }

  async unlikeSpotlight(spotlightId: string, userId: string): Promise<boolean> {
    const spotlight = await MockDataLoader.findById<Spotlight>('spotlights', spotlightId);
    if (!spotlight) return false;
    const likeCount = Math.max((spotlight.likeCount || 0) - 1, 0);
    await MockDataLoader.patchItem<Spotlight>('spotlights', spotlightId, { likeCount });
    return true;
  }

  async incrementViewCount(spotlightId: string): Promise<void> {
    const spotlight = await MockDataLoader.findById<Spotlight>('spotlights', spotlightId);
    if (!spotlight) return;
    const viewCount = (spotlight.viewCount || 0) + 1;
    await MockDataLoader.patchItem<Spotlight>('spotlights', spotlightId, { viewCount });
  }

  async incrementShareCount(spotlightId: string): Promise<void> {
    const spotlight = await MockDataLoader.findById<Spotlight>('spotlights', spotlightId);
    if (!spotlight) return;
    const shareCount = (spotlight.shareCount || 0) + 1;
    await MockDataLoader.patchItem<Spotlight>('spotlights', spotlightId, { shareCount });
  }

  // Nominations
  private static nominations: SpotlightNomination[] = [];
  async getNominations(): Promise<SpotlightNomination[]> {
    return SpotlightsMockApi.nominations;
  }

  async createNomination(nomination: Omit<SpotlightNomination, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpotlightNomination> {
    const newNomination: SpotlightNomination = {
      id: Date.now().toString(),
      ...nomination,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    SpotlightsMockApi.nominations.push(newNomination);
    return newNomination;
  }

  async approveNomination(nominationId: string): Promise<SpotlightNomination | null> {
    const idx = SpotlightsMockApi.nominations.findIndex(n => n.id === nominationId);
    if (idx === -1) return null;
    SpotlightsMockApi.nominations[idx].status = 'approved';
    SpotlightsMockApi.nominations[idx].updatedAt = new Date().toISOString();
    return SpotlightsMockApi.nominations[idx];
  }

  async rejectNomination(nominationId: string, reason?: string): Promise<SpotlightNomination | null> {
    const idx = SpotlightsMockApi.nominations.findIndex(n => n.id === nominationId);
    if (idx === -1) return null;
    SpotlightsMockApi.nominations[idx].status = 'rejected';
    (SpotlightsMockApi.nominations[idx] as any).rejectionReason = reason;
    SpotlightsMockApi.nominations[idx].updatedAt = new Date().toISOString();
    return SpotlightsMockApi.nominations[idx];
  }

  // Categories and Tags
  async getSpotlightCategories(): Promise<SpotlightCategory[]> {
    return [
      { id: 'alumni-achievement', name: 'Alumni Achievement', count: 45, description: 'Outstanding achievements by alumni' },
      { id: 'career-success', name: 'Career Success', count: 38, description: 'Career milestones and professional success stories' },
      { id: 'entrepreneurship', name: 'Entrepreneurship', count: 32, description: 'Alumni who started their own businesses' },
      { id: 'social-impact', name: 'Social Impact', count: 28, description: 'Alumni making a difference in society' },
      { id: 'innovation', name: 'Innovation', count: 25, description: 'Innovative work and breakthrough achievements' },
      { id: 'leadership', name: 'Leadership', count: 22, description: 'Leadership roles and community involvement' },
      { id: 'research', name: 'Research & Academia', count: 18, description: 'Academic and research accomplishments' },
      { id: 'arts-culture', name: 'Arts & Culture', count: 15, description: 'Creative and cultural contributions' },
      { id: 'sports', name: 'Sports & Athletics', count: 12, description: 'Athletic achievements and sports leadership' },
      { id: 'community', name: 'Community Service', count: 20, description: 'Community involvement and volunteer work' }
    ];
  }

  async getPopularTags(): Promise<Array<{ tag: string; count: number }>> {
    return [
      { tag: 'startup-founder', count: 28 },
      { tag: 'tech-leader', count: 25 },
      { tag: 'social-entrepreneur', count: 22 },
      { tag: 'award-winner', count: 20 },
      { tag: 'industry-expert', count: 18 },
      { tag: 'community-leader', count: 16 },
      { tag: 'mentor', count: 15 },
      { tag: 'researcher', count: 14 },
      { tag: 'innovator', count: 12 },
      { tag: 'change-maker', count: 10 },
      { tag: 'thought-leader', count: 9 },
      { tag: 'philanthropist', count: 8 }
    ];
  }

  // Statistics
  async getSpotlightStats(spotlightId?: string): Promise<SpotlightStats> {
    const spotlights = await MockDataLoader.getSpotlights();
    if (spotlightId) {
      const spotlight = spotlights.find(s => s.id === spotlightId);
      if (!spotlight) throw new Error('Spotlight not found');
      return {
        spotlightId: spotlight.id,
        views: spotlight.viewCount || 0,
        likes: spotlight.likeCount || 0,
        shares: spotlight.shareCount || 0,
        comments: spotlight.commentCount || 0,
        engagementRate: this.calculateEngagementRate(spotlight),
        lastUpdated: new Date().toISOString()
      };
    }
    const totalViews = spotlights.reduce((sum, s) => sum + (s.viewCount || 0), 0);
    const totalLikes = spotlights.reduce((sum, s) => sum + (s.likeCount || 0), 0);
    const totalShares = spotlights.reduce((sum, s) => sum + (s.shareCount || 0), 0);
    const totalComments = spotlights.reduce((sum, s) => sum + (s.commentCount || 0), 0);
    const engagementRate = totalViews === 0 ? 0 : ((totalLikes + totalShares + totalComments) / totalViews) * 100;
    return {
      spotlightId: 'all',
      views: totalViews,
      likes: totalLikes,
      shares: totalShares,
      comments: totalComments,
      engagementRate,
      lastUpdated: new Date().toISOString()
    };
  }

  // Bulk Operations
  async bulkCreateSpotlights(spotlights: CreateSpotlightRequest[]): Promise<Spotlight[]> {
    const newSpotlights = spotlights.map((req, index) => ({
      id: (Date.now() + index).toString(),
      title: req.title,
      type: req.type,
      status: req.status || 'draft',
      featuredAlumniId: req.featuredAlumniId,
      featuredAlumniName: req.featuredAlumniName,
      content: req.content,
      videoUrl: req.videoUrl,
      imageUrl: req.imageUrl,
      tags: req.tags || [],
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,
      commentCount: 0,
      featured: false,
      publishedDate: req.status === 'published' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shortDescription: req.shortDescription
    }));
    const persisted: Spotlight[] = [];
    for (const sp of newSpotlights) {
      const created = await MockDataLoader.createItem<Spotlight>('spotlights', sp);
      persisted.push(created || sp);
    }
    return persisted;
  }

  // Helper Methods
  private applyFilters(spotlights: Spotlight[], filters: SpotlightFilters): Spotlight[] {
    let filtered = [...spotlights];

    if (filters.status) filtered = filtered.filter(s => s.status === filters.status);
    if (filters.type) filtered = filtered.filter(s => s.type === filters.type);
    if (filters.featuredAlumniId) filtered = filtered.filter(s => s.featuredAlumniId === filters.featuredAlumniId);

    if (filters.featured !== undefined) filtered = filtered.filter(s => !!s.featured === filters.featured);
    if (filters.tags?.length) filtered = filtered.filter(s => filters.tags!.some(tag => s.tags.includes(tag)));

    return filtered;
  }

  private applySorting(spotlights: Spotlight[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): Spotlight[] {
    return spotlights.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'publishedDate':
          const aDate = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
          const bDate = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
          comparison = aDate - bDate;
          break;
        case 'viewCount':
          comparison = (a.viewCount || 0) - (b.viewCount || 0);
          break;
        case 'likeCount':
          comparison = (a.likeCount || 0) - (b.likeCount || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private calculateEngagementRate(spotlight: Spotlight): number {
  const views = spotlight.viewCount || 0;
    if (views === 0) return 0;
    
    const engagements = (spotlight.likeCount || 0) + (spotlight.shareCount || 0) + (spotlight.commentCount || 0);
    return (engagements / views) * 100;
  }
}