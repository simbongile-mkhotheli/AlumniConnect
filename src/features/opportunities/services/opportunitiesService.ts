import { ApiService, shouldUseMockApi } from '@shared/services';
import { OpportunitiesMockApi } from './mockApi';
import { OPPORTUNITIES_ENDPOINTS, buildOpportunityEndpoint } from './endpoints';
import type { Opportunity, OpportunityFilters } from '../types/opportunity';
import type { PaginatedResponse } from '@shared/types';

/**
 * Opportunities Service
 * Handles all opportunity-related operations including job postings, internships,
 * applications, and career services management
 */
export class OpportunitiesService {
  private apiService = ApiService;
  private mockApi: OpportunitiesMockApi;
  private useMock: boolean;

  constructor() {
    this.mockApi = new OpportunitiesMockApi();
    this.useMock = shouldUseMockApi();
  }

  // Core CRUD Operations
  async getOpportunities(params?: OpportunityFilters): Promise<PaginatedResponse<Opportunity>> {
    if (this.useMock) {
      return this.mockApi.getOpportunities(params);
    }
    
    const response = await this.apiService.get<PaginatedResponse<Opportunity>>(OPPORTUNITIES_ENDPOINTS.BASE, { params });
    return response.data;
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    if (this.useMock) {
      return this.mockApi.getOpportunityById(id);
    }

    try {
      const response = await this.apiService.get<Opportunity>(buildOpportunityEndpoint('BY_ID', { id }));
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createOpportunity(request: any): Promise<Opportunity> {
    if (this.useMock) {
      return this.mockApi.createOpportunity(request);
    }

    const response = await this.apiService.post<Opportunity>(OPPORTUNITIES_ENDPOINTS.BASE, request);
    return response.data;
  }

  async updateOpportunity(id: string, request: any): Promise<Opportunity | null> {
    if (this.useMock) {
      return this.mockApi.updateOpportunity(id, request);
    }

    try {
      const response = await this.apiService.put<Opportunity>(buildOpportunityEndpoint('BY_ID', { id }), request);
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    if (this.useMock) {
      return this.mockApi.deleteOpportunity(id);
    }

    try {
      await this.apiService.delete<null>(buildOpportunityEndpoint('BY_ID', { id }));
      return true;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  // Search and Filtering
  async searchOpportunities(query: string, filters?: OpportunityFilters): Promise<PaginatedResponse<Opportunity>> {
    if (this.useMock) {
      return this.mockApi.searchOpportunities(query, filters);
    }

    const response = await this.apiService.get<PaginatedResponse<Opportunity>>(OPPORTUNITIES_ENDPOINTS.SEARCH, { params: { q: query, ...filters } });
    return response.data;
  }

  async getOpportunitiesByType(type: string, params?: OpportunityFilters) {
    return this.getOpportunities({ ...params, type: type as any });
  }
  async getOpportunitiesByLocation(location: string, params?: OpportunityFilters) {
    return this.getOpportunities({ ...params, location });
  }
  async getOpportunitiesByCompany(company: string, params?: OpportunityFilters) {
    return this.getOpportunities({ ...params, company });
  }

  // Application Management
  // Application methods removed (not supported by current mock API)

  // Featured and Recommended
  async getFeaturedOpportunities(): Promise<Opportunity[]> {
    if (this.useMock) {
      return this.mockApi.getFeaturedOpportunities();
    }

    const response = await this.apiService.get<Opportunity[]>(OPPORTUNITIES_ENDPOINTS.FEATURED);
    return response.data;
  }

  async getRecommendedOpportunities(userId: string): Promise<Opportunity[]> {
    if (this.useMock) {
      // Mock implementation - return random selection
      const allOpportunities = await this.mockApi.getOpportunities();
      return allOpportunities.data.slice(0, 5);
    }

    const response = await this.apiService.get<Opportunity[]>(buildOpportunityEndpoint('RECOMMENDED', { userId }));
    return response.data;
  }

  async getRecentOpportunities(limit: number = 10): Promise<Opportunity[]> {
    if (this.useMock) {
      const allOpportunities = await this.mockApi.getOpportunities({ limit });
      return allOpportunities.data;
    }

    const response = await this.apiService.get<Opportunity[]>(OPPORTUNITIES_ENDPOINTS.RECENT, { params: { limit } });
    return response.data;
  }

  async getTrendingOpportunities(limit: number = 10): Promise<Opportunity[]> {
    if (this.useMock) {
      const allOpportunities = await this.mockApi.getOpportunities({ limit });
      return allOpportunities.data.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    }

    const response = await this.apiService.get<Opportunity[]>(OPPORTUNITIES_ENDPOINTS.TRENDING, { params: { limit } });
    return response.data;
  }

  // Analytics and Statistics
  // Analytics removed (stats type not in domain model now)

  async incrementViewCount(opportunityId: string): Promise<void> {
    if (this.useMock) {
      // Mock implementation - would update view count in storage
      return;
    }

    await this.apiService.post<null>(
      buildOpportunityEndpoint('VIEW_COUNT', { id: opportunityId })
    );
  }

  // Categories and Metadata
  // Category/type helpers removed

  async getOpportunityLocations(): Promise<string[]> {
    if (this.useMock) {
      // Mock implementation
      return [
        'New York, NY',
        'San Francisco, CA',
        'Los Angeles, CA',
        'Chicago, IL',
        'Boston, MA',
        'Seattle, WA',
        'Austin, TX',
        'Remote'
      ];
    }

    const response = await this.apiService.get<string[]>(OPPORTUNITIES_ENDPOINTS.LOCATIONS);
    return response.data;
  }

  async getOpportunityCompanies(): Promise<string[]> {
    if (this.useMock) {
      // Mock implementation
      return [
        'Google',
        'Microsoft',
        'Apple',
        'Amazon',
        'Meta',
        'Netflix',
        'Tesla',
        'Salesforce',
        'Adobe',
        'Oracle'
      ];
    }

    const response = await this.apiService.get<string[]>(OPPORTUNITIES_ENDPOINTS.COMPANIES);
    return response.data;
  }

  // Status Management
  // Legacy status management removed (flags not in domain model)

  // Bulk Operations
  // Bulk operations removed

  // Export functionality
  // Export removed

  // My Opportunities (for employers/creators)
  // My opportunities helper removed

  // Helper Methods
  // CSV conversion helper removed
}