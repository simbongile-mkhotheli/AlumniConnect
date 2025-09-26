import ApiService from './api';
import { SponsorsMockApiService } from './mockApis';
import { SPONSORS } from './endpoints';
import { shouldUseMockApi } from './useMockApi';
import type {
  Sponsor,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../types';

/**
 * Sponsors Service
 * Handles all sponsor-related API operations
 */
export class SponsorsService {
  /**
   * Check if mock API should be used
   */
  private static useMockApi(): boolean { return shouldUseMockApi(); }

  /**
   * Get all sponsors with optional filtering and pagination
   */
  static async getSponsors(
    page: number = 1,
    limit: number = 20,
    filters?: FilterState
  ): Promise<PaginatedResponse<Sponsor>> {
    if (this.useMockApi()) {
  return SponsorsMockApiService.getSponsors(page, limit, filters) as unknown as PaginatedResponse<Sponsor>;
    }

    const params: Record<string, any> = {};

    if (filters?.status) params.status = filters.status;
    if (filters?.tier) params.tier = filters.tier;
    if (filters?.search) params.search = filters.search;

    return ApiService.getPaginated<Sponsor>(SPONSORS.BASE, page, limit, params);
  }

  /**
   * Get sponsor by ID
   */
  static async getSponsor(id: string): Promise<ApiResponse<Sponsor>> {
    if (this.useMockApi()) {
  return (await SponsorsMockApiService.getSponsor(id)) as ApiResponse<Sponsor>;
    }

    return ApiService.get<Sponsor>(SPONSORS.BY_ID(id));
  }

  /**
   * Create new sponsor
   */
  static async createSponsor(
    sponsorData: Omit<Sponsor, 'id' | 'createdAt'>
  ): Promise<ApiResponse<Sponsor>> {
    if (this.useMockApi()) {
  return (await SponsorsMockApiService.createSponsor(sponsorData)) as ApiResponse<Sponsor>;
    }

    return ApiService.post<Sponsor>(SPONSORS.BASE, sponsorData);
  }

  /**
   * Update existing sponsor
   */
  static async updateSponsor(
    id: string,
    sponsorData: Partial<Sponsor>
  ): Promise<ApiResponse<Sponsor>> {
    if (this.useMockApi()) {
  return (await SponsorsMockApiService.updateSponsor(id, sponsorData)) as ApiResponse<Sponsor>;
    }

    return ApiService.put<Sponsor>(SPONSORS.BY_ID(id), sponsorData);
  }

  /**
   * Delete sponsor
   */
  static async deleteSponsor(id: string): Promise<ApiResponse<null>> {
    if (this.useMockApi()) {
      return await SponsorsMockApiService.deleteSponsor(id) as ApiResponse<null>;
    }

    return ApiService.delete<null>(SPONSORS.BY_ID(id));
  }

  /**
   * Activate sponsor
   */
  static async activateSponsor(id: string): Promise<ApiResponse<Sponsor>> {
    if (this.useMockApi()) {
  return (await SponsorsMockApiService.activateSponsor(id)) as ApiResponse<Sponsor>;
    }

    return ApiService.post<Sponsor>(SPONSORS.ACTIVATE(id));
  }

  /**
   * Deactivate sponsor
   */
  static async deactivateSponsor(id: string): Promise<ApiResponse<Sponsor>> {
    if (this.useMockApi()) {
  return (await SponsorsMockApiService.deactivateSponsor(id)) as ApiResponse<Sponsor>;
    }

    return ApiService.post<Sponsor>(SPONSORS.DEACTIVATE(id));
  }

  /**
   * Get sponsor analytics
   */
  static async getSponsorAnalytics(id: string): Promise<
    ApiResponse<{
      eventsSponsored: number;
      chaptersSponsored: number;
      totalValue: number;
      roi: number;
      engagement: {
        eventAttendance: number;
        brandMentions: number;
        socialReach: number;
      };
      performance: {
        leadGeneration: number;
        conversionRate: number;
        brandAwareness: number;
      };
      timeline: Array<{
        date: string;
        events: number;
        value: number;
        attendance: number;
      }>[];
    }>
  > {
    if (this.useMockApi()) {
      return SponsorsMockApiService.getSponsorAnalytics(id);
    }

    return ApiService.get<any>(SPONSORS.ANALYTICS(id));
  }

  /**
   * Get sponsors by tier
   */
  static async getSponsorsByTier(
    tier: Sponsor['tier']
  ): Promise<ApiResponse<Sponsor[]>> {
    if (this.useMockApi()) {
      return SponsorsMockApiService.getSponsorsByTier(tier);
    }

    return ApiService.get<Sponsor[]>(SPONSORS.BY_TIER(tier));
  }

  /**
   * Get sponsors by status
   */
  static async getSponsorsByStatus(
    status: string
  ): Promise<ApiResponse<Sponsor[]>> {
    if (this.useMockApi()) {
      return SponsorsMockApiService.getSponsorsByStatus(status as any);
    }

    // If a dedicated endpoint exists use it; fallback to query param filtering
    if ((SPONSORS as any).BY_STATUS) {
      return ApiService.get<Sponsor[]>((SPONSORS as any).BY_STATUS(status));
    }
    return ApiService.get<Sponsor[]>(SPONSORS.BASE, { status });
  }

  /**
   * Get active sponsors
   */
  static async getActiveSponsors(): Promise<ApiResponse<Sponsor[]>> {
    if (this.useMockApi()) {
      return SponsorsMockApiService.getActiveSponsors();
    }

    return ApiService.get<Sponsor[]>(SPONSORS.ACTIVE);
  }

  /**
   * Search sponsors
   */
  static async searchSponsors(
    query: string,
    filters?: Partial<FilterState>
  ): Promise<ApiResponse<Sponsor[]>> {
    if (this.useMockApi()) {
      return SponsorsMockApiService.searchSponsors(query, filters);
    }

    const params = {
      q: query,
      ...filters,
    };

    return ApiService.get<Sponsor[]>('/search/sponsors', params);
  }

  /**
   * Get sponsor statistics
   */
  static async getSponsorStats(): Promise<
    ApiResponse<{
      totalSponsors: number;
      activeSponsors: number;
      pendingSponsors: number;
      inactiveSponsors: number;
      expiredSponsors: number;
      totalValue: number;
      averageValue: number;
      tierBreakdown: Record<string, number>;
      monthlyTrend: Array<{
        month: string;
        sponsors: number;
        value: number;
        events: number;
      }>;
      topSponsors: Array<{
        id: string;
        name: string;
        tier: string;
        value: number;
        events: number;
      }>;
    }>
  > {
    if (this.useMockApi()) {
      return SponsorsMockApiService.getSponsorStats();
    }

    return ApiService.get<any>(`${SPONSORS.BASE}/stats`);
  }

  /**
   * Export sponsors data
   */
  static async exportSponsors(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    filters?: FilterState
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    if (this.useMockApi()) {
      return SponsorsMockApiService.exportSponsors(format, filters);
    }

    const params = {
      format,
      ...filters,
    };

    return ApiService.get<{ downloadUrl: string }>(
      `${SPONSORS.BASE}/export`,
      params
    );
  }

  /**
   * Import sponsors data
   */
  static async importSponsors(
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
      return SponsorsMockApiService.importSponsors(file, options);
    }

    return ApiService.uploadFile<{
      imported: number;
      skipped: number;
      errors: string[];
    }>(`${SPONSORS.BASE}/import`, file, options);
  }

  /**
   * Upload sponsor logo
   */
  static async uploadLogo(
    id: string,
    logoFile: File
  ): Promise<ApiResponse<{ logoUrl: string }>> {
    if (this.useMockApi()) {
      return SponsorsMockApiService.uploadLogo(id, logoFile);
    }

    return ApiService.uploadFile<{ logoUrl: string }>(
      `/files/sponsor-logo/${id}`,
      logoFile
    );
  }

  /**
   * Get sponsor events
   */
  static async getSponsorEvents(id: string): Promise<
    ApiResponse<
      Array<{
        eventId: string;
        eventTitle: string;
        eventDate: string;
        eventLocation: string;
        sponsorshipValue: number;
        attendanceCount: number;
        status: string;
      }>
    >
  > {
    if (this.useMockApi()) {
      return SponsorsMockApiService.getSponsorEvents(id);
    }

    return ApiService.get<any[]>(`${SPONSORS.BY_ID(id)}/events`);
  }

  /**
   * Get sponsor chapters
   */
  static async getSponsorChapters(id: string): Promise<
    ApiResponse<
      Array<{
        chapterId: string;
        chapterName: string;
        chapterLocation: string;
        sponsorshipValue: number;
        memberCount: number;
        status: string;
      }>
    >
  > {
    if (this.useMockApi()) {
      return SponsorsMockApiService.getSponsorChapters(id);
    }

    return ApiService.get<any[]>(`${SPONSORS.BY_ID(id)}/chapters`);
  }

  /**
   * Renew sponsor partnership
   */
  static async renewPartnership(
    id: string,
    renewalData: {
      tier?: string;
      duration: number;
      value: number;
      benefits?: string[];
    }
  ): Promise<ApiResponse<Sponsor>> {
    if (this.useMockApi()) {
  return (await SponsorsMockApiService.renewPartnership(id, renewalData)) as ApiResponse<Sponsor>;
    }

    return ApiService.post<Sponsor>(`${SPONSORS.BY_ID(id)}/renew`, renewalData);
  }

  /**
   * Bulk operations on sponsors
   */
  static async bulkOperation(
    operation:
      | 'activate'
      | 'deactivate'
      | 'delete'
      | 'renew'
      | 'upgrade'
      | 'downgrade',
    sponsorIds: string[]
  ): Promise<ApiResponse<any>> {
    if (this.useMockApi()) {
      return SponsorsMockApiService.bulkOperation(operation, sponsorIds);
    }

    return ApiService.bulkOperation<any>(SPONSORS.BASE, operation, sponsorIds);
  }
}

export default SponsorsService;
