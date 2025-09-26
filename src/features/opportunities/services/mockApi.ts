import { MockDataLoader } from '@shared/utils/mockDataLoader';
import type {
  Opportunity,
  OpportunityType,
  OpportunityLevel,
  OpportunityStatus,
  OpportunityFilters
} from '../types/opportunity';
import type { PaginatedResponse } from '@shared/types';

/**
 * Mock API implementation for Opportunities
 * Provides realistic data simulation for development and testing
 */
export class OpportunitiesMockApi {

  // Core CRUD Operations
  async getOpportunities(params?: OpportunityFilters): Promise<PaginatedResponse<Opportunity>> {
    let opportunities: Opportunity[] = await MockDataLoader.getOpportunities();
    if (params) opportunities = this.applyFilters(opportunities, params);
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const total = opportunities.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = opportunities.slice(startIndex, startIndex + limit);
    return {
      data: paginatedData,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      success: true,
      message: 'Opportunities retrieved'
    };
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    return MockDataLoader.findById<Opportunity>('opportunities', id);
  }

  async createOpportunity(request: any): Promise<Opportunity> {
    const newOpportunity: Opportunity = {
      id: Date.now().toString(),
      title: request.title,
      company: request.company,
      type: request.type,
      level: request.level || 'entry',
      location: request.location,
      isRemote: request.isRemote || false,
      salary: request.salary,
      description: request.description,
      requirements: request.requirements,
      tags: request.tags || [],
      status: request.status || 'active',
      applicationCount: 0,
      viewCount: 0,
      postedDate: new Date().toISOString(),
      expiryDate: request.expiryDate,
      contactEmail: request.contactEmail,
      partnerId: request.partnerId,
      featured: request.featured || false,
      urgent: request.urgent || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return (await MockDataLoader.createItem<Opportunity>('opportunities', newOpportunity)) || newOpportunity;
  }

  async updateOpportunity(id: string, request: any): Promise<Opportunity | null> {
    const existing = await MockDataLoader.findById<Opportunity>('opportunities', id);
    if (!existing) return null;
    const updated: Opportunity = {
      ...existing,
      ...request,
      updatedAt: new Date().toISOString()
    };
    return (await MockDataLoader.putItem<Opportunity>('opportunities', id, updated)) || updated;
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    return MockDataLoader.deleteItem('opportunities', id);
  }

  // Search and Filtering
  async searchOpportunities(query: string, filters?: OpportunityFilters): Promise<PaginatedResponse<Opportunity>> {
    let opportunities: Opportunity[] = await MockDataLoader.getOpportunities();
    if (query) {
      const q = query.toLowerCase();
      opportunities = opportunities.filter((opp: Opportunity) =>
        opp.title.toLowerCase().includes(q) ||
        opp.company.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        opp.location.toLowerCase().includes(q)
      );
    }
    if (filters) opportunities = this.applyFilters(opportunities, filters);
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const total = opportunities.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = opportunities.slice(startIndex, startIndex + limit);
    return {
      data: paginatedData,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      success: true,
      message: 'Opportunity search results'
    };
  }

  // Application Management
  // Removed: applyToOpportunity (mockLoader and OpportunityApplication not available)

  // Removed: getOpportunityApplications (mockLoader and OpportunityApplication not available)

  // Removed: getUserApplications (mockLoader and OpportunityApplication not available)

  // Featured and Analytics
  async getFeaturedOpportunities(): Promise<Opportunity[]> {
    const opportunities: Opportunity[] = await MockDataLoader.getOpportunities();
    return opportunities.filter((opp: Opportunity) => !!opp.featured && opp.status === 'active');
  }

  // Removed: getOpportunityStats (mockLoader and OpportunityStats not available)

  // Categories and Metadata
  // Removed: getOpportunityCategories (OpportunityCategory not available)

  // Removed: getOpportunityTypes (OpportunityType shape mismatch)

  async bulkCreateOpportunities(opportunities: any[]): Promise<Opportunity[]> {
    // Not implemented: bulkCreate (no static method available)
    return [];
  }

  // Helper Methods
  private applyFilters(opportunities: Opportunity[], filters: OpportunityFilters): Opportunity[] {
    let filtered = [...opportunities];
    if (filters.status) filtered = filtered.filter((opp: Opportunity) => opp.status === filters.status);
    if (filters.type) filtered = filtered.filter((opp: Opportunity) => opp.type === filters.type);
    if (filters.level) filtered = filtered.filter((opp: Opportunity) => opp.level === filters.level);
    if (filters.location) filtered = filtered.filter((opp: Opportunity) => opp.location && opp.location.toLowerCase().includes(filters.location!.toLowerCase()));
    if (filters.isRemote !== undefined) filtered = filtered.filter((opp: Opportunity) => opp.isRemote === filters.isRemote);
    if (filters.company) filtered = filtered.filter((opp: Opportunity) => opp.company && opp.company.toLowerCase().includes(filters.company!.toLowerCase()));
    if (filters.partnerId) filtered = filtered.filter((opp: Opportunity) => opp.partnerId === filters.partnerId);
    if (filters.tags?.length) filtered = filtered.filter((opp: Opportunity) => filters.tags!.some(tag => opp.tags && opp.tags.includes(tag)));
    if (filters.featured !== undefined) filtered = filtered.filter((opp: Opportunity) => !!opp.featured === filters.featured);
    if (filters.urgent !== undefined) filtered = filtered.filter((opp: Opportunity) => !!opp.urgent === filters.urgent);
    return filtered;
  }
}