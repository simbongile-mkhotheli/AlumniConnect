import { ApiService, shouldUseMockApi } from '@shared/services';
import { PartnersMockApi } from './mockApi';
import { PARTNERS_ENDPOINTS, buildPartnerEndpoint } from './endpoints';
import type { Partner, PaginatedResponse } from '@shared/types';
import type {
  PartnerTier,
  PartnerCategory,
  PartnerStats,
  PartnerContact,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  PartnerFilters
} from '../types';

/**
 * Partners Service
 * Handles all partner-related operations including partnership management,
 * tier management, contact management, and analytics
 */
export class PartnersService {
  private apiService = ApiService;
  private mockApi: PartnersMockApi;
  private useMock: boolean;

  constructor() {
  // ApiService is a singleton instance; no construction needed
    this.mockApi = new PartnersMockApi();
    this.useMock = shouldUseMockApi();
  }

  // Core CRUD Operations
  async getPartners(params?: PartnerFilters): Promise<PaginatedResponse<Partner>> {
    if (this.useMock) {
      return this.mockApi.getPartners(params);
    }
    
    const response = await this.apiService.get<PaginatedResponse<Partner>>(
      PARTNERS_ENDPOINTS.BASE,
      { params }
    );
    return response.data;
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    if (this.useMock) {
      return this.mockApi.getPartnerById(id);
    }

    const response = await this.apiService.get<Partner>(
      buildPartnerEndpoint('BY_ID', { id })
    );
    if (!response.success || !response.data) return null;
    return response.data;
  }

  async createPartner(request: CreatePartnerRequest): Promise<Partner> {
    if (this.useMock) {
      return this.mockApi.createPartner(request);
    }

    const response = await this.apiService.post<Partner>(
      PARTNERS_ENDPOINTS.BASE,
      request
    );
    return response.data;
  }

  async updatePartner(id: string, request: UpdatePartnerRequest): Promise<Partner | null> {
    if (this.useMock) {
      return this.mockApi.updatePartner(id, request);
    }

    const response = await this.apiService.put<Partner>(
      buildPartnerEndpoint('BY_ID', { id }),
      request
    );
    if (!response.success || !response.data) return null;
    return response.data;
  }

  async deletePartner(id: string): Promise<boolean> {
    if (this.useMock) {
      return this.mockApi.deletePartner(id);
    }

    const response = await this.apiService.delete<null>(buildPartnerEndpoint('BY_ID', { id }));
    return response.success;
  }

  // Search and Filtering
  async searchPartners(query: string, filters?: PartnerFilters): Promise<PaginatedResponse<Partner>> {
    if (this.useMock) {
      return this.mockApi.searchPartners(query, filters);
    }

    const response = await this.apiService.get<PaginatedResponse<Partner>>(
      PARTNERS_ENDPOINTS.SEARCH,
      { 
        params: { 
          q: query,
          ...filters
        }
      }
    );
    return response.data;
  }

  async getPartnersByCategory(category: string, params?: PartnerFilters): Promise<PaginatedResponse<Partner>> {
    if (this.useMock) {
      return this.mockApi.getPartners({ ...params, category });
    }

    const response = await this.apiService.get<PaginatedResponse<Partner>>(
      buildPartnerEndpoint('BY_CATEGORY', { category }),
      { params }
    );
    return response.data;
  }

  async getPartnersByTier(tier: string, params?: PartnerFilters): Promise<PaginatedResponse<Partner>> {
    if (this.useMock) {
      return this.mockApi.getPartners({ ...params, tier });
    }

    const response = await this.apiService.get<PaginatedResponse<Partner>>(
      buildPartnerEndpoint('BY_TIER', { tier }),
      { params }
    );
    return response.data;
  }

  async getPartnersByIndustry(industry: string, params?: PartnerFilters): Promise<PaginatedResponse<Partner>> {
    if (this.useMock) {
      return this.mockApi.getPartners({ ...params, industry });
    }

    const response = await this.apiService.get<PaginatedResponse<Partner>>(
      buildPartnerEndpoint('BY_INDUSTRY', { industry }),
      { params }
    );
    return response.data;
  }

  async getPartnersByLocation(location: string, params?: PartnerFilters): Promise<PaginatedResponse<Partner>> {
    if (this.useMock) {
      return this.mockApi.getPartners({ ...params, location });
    }

    const response = await this.apiService.get<PaginatedResponse<Partner>>(
      buildPartnerEndpoint('BY_LOCATION', { location }),
      { params }
    );
    return response.data;
  }

  // Partnership Management
  async getActivePartners(): Promise<Partner[]> {
    if (this.useMock) {
      return this.mockApi.getActivePartners();
    }

    const response = await this.apiService.get<Partner[]>(
      PARTNERS_ENDPOINTS.ACTIVE
    );
    return response.data;
  }

  async getInactivePartners(): Promise<Partner[]> {
    if (this.useMock) {
      return this.mockApi.getInactivePartners();
    }

    const response = await this.apiService.get<Partner[]>(
      PARTNERS_ENDPOINTS.INACTIVE
    );
    return response.data;
  }

  async getFeaturedPartners(): Promise<Partner[]> {
    if (this.useMock) {
      return this.mockApi.getFeaturedPartners();
    }

    const response = await this.apiService.get<Partner[]>(
      PARTNERS_ENDPOINTS.FEATURED
    );
    return response.data;
  }

  async activatePartner(id: string): Promise<boolean> {
    if (this.useMock) {
      const partner = await this.mockApi.updatePartner(id, { isActive: true });
      return partner !== null;
    }

    const response = await this.apiService.patch<null>(
      buildPartnerEndpoint('ACTIVATE', { id })
    );
    return response.success;
  }

  async deactivatePartner(id: string): Promise<boolean> {
    if (this.useMock) {
      const partner = await this.mockApi.updatePartner(id, { isActive: false });
      return partner !== null;
    }

    const response = await this.apiService.patch<null>(
      buildPartnerEndpoint('DEACTIVATE', { id })
    );
    return response.success;
  }

  async suspendPartner(id: string): Promise<boolean> {
    if (this.useMock) {
      // Mock implementation - would set suspended status
      const partner = await this.mockApi.updatePartner(id, { 
        isActive: false,
        // suspended: true 
      });
      return partner !== null;
    }

    const response = await this.apiService.patch<null>(
      buildPartnerEndpoint('SUSPEND', { id })
    );
    return response.success;
  }

  // Tier Management
  async getPartnerTiers(): Promise<PartnerTier[]> {
    if (this.useMock) {
      return this.mockApi.getPartnerTiers();
    }

    const response = await this.apiService.get<PartnerTier[]>(
      PARTNERS_ENDPOINTS.TIERS
    );
    return response.data;
  }

  async getPartnerTierById(tierId: string): Promise<PartnerTier | null> {
    if (this.useMock) {
      const tiers = await this.mockApi.getPartnerTiers();
      return tiers.find(tier => tier.id === tierId) || null;
    }

    const response = await this.apiService.get<PartnerTier>(
      buildPartnerEndpoint('TIER_BY_ID', { tierId })
    );
    if (!response.success || !response.data) return null;
    return response.data;
  }

  async upgradePartnerTier(partnerId: string, newTier: string): Promise<Partner | null> {
    if (this.useMock) {
      return this.mockApi.updatePartnerTier(partnerId, newTier);
    }

    const response = await this.apiService.patch<Partner>(
      buildPartnerEndpoint('UPGRADE_TIER', { id: partnerId }),
      { tier: newTier }
    );
    if (!response.success || !response.data) return null;
    return response.data;
  }

  async downgradePartnerTier(partnerId: string, newTier: string): Promise<Partner | null> {
    if (this.useMock) {
      return this.mockApi.updatePartnerTier(partnerId, newTier);
    }

    const response = await this.apiService.patch<Partner>(
      buildPartnerEndpoint('DOWNGRADE_TIER', { id: partnerId }),
      { tier: newTier }
    );
    if (!response.success || !response.data) return null;
    return response.data;
  }

  // Contact Management
  async getPartnerContacts(partnerId: string): Promise<PartnerContact[]> {
    if (this.useMock) {
      return this.mockApi.getPartnerContacts(partnerId);
    }

    const response = await this.apiService.get<PartnerContact[]>(
      buildPartnerEndpoint('CONTACTS', { id: partnerId })
    );
    return response.data;
  }

  async createPartnerContact(partnerId: string, contact: Omit<PartnerContact, 'id' | 'partnerId' | 'createdAt' | 'updatedAt'>): Promise<PartnerContact> {
    if (this.useMock) {
      // Mock implementation
      const newContact: PartnerContact = {
        id: Date.now().toString(),
        partnerId,
        ...contact,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return newContact;
    }

    const response = await this.apiService.post<PartnerContact>(
      buildPartnerEndpoint('CONTACTS', { id: partnerId }),
      contact
    );
    return response.data;
  }

  async updatePartnerContact(partnerId: string, contactId: string, updates: Partial<PartnerContact>): Promise<PartnerContact | null> {
    if (this.useMock) {
      // Mock implementation
      const contacts = await this.mockApi.getPartnerContacts(partnerId);
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return null;
      
      return {
        ...contact,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }

    const response = await this.apiService.put<PartnerContact>(
      buildPartnerEndpoint('CONTACT_BY_ID', { id: partnerId, contactId }),
      updates
    );
    if (!response.success || !response.data) return null;
    return response.data;
  }

  async deletePartnerContact(partnerId: string, contactId: string): Promise<boolean> {
    if (this.useMock) {
      // Mock implementation
      return true;
    }

    const response = await this.apiService.delete<null>(
      buildPartnerEndpoint('CONTACT_BY_ID', { id: partnerId, contactId })
    );
    return response.success;
  }

  // Categories and Metadata
  async getPartnerCategories(): Promise<PartnerCategory[]> {
    if (this.useMock) {
      return this.mockApi.getPartnerCategories();
    }

    const response = await this.apiService.get<PartnerCategory[]>(
      PARTNERS_ENDPOINTS.CATEGORIES
    );
    return response.data;
  }

  async getPartnerIndustries(): Promise<string[]> {
    if (this.useMock) {
      return this.mockApi.getPartnerIndustries();
    }

    const response = await this.apiService.get<string[]>(
      PARTNERS_ENDPOINTS.INDUSTRIES
    );
    return response.data;
  }

  async getPartnerLocations(): Promise<string[]> {
    if (this.useMock) {
      return this.mockApi.getPartnerLocations();
    }

    const response = await this.apiService.get<string[]>(
      PARTNERS_ENDPOINTS.LOCATIONS
    );
    return response.data;
  }

  // Analytics and Statistics
  async getPartnerStats(partnerId?: string): Promise<PartnerStats> {
    if (this.useMock) {
      return this.mockApi.getPartnerStats(partnerId);
    }

    const endpoint = partnerId 
      ? buildPartnerEndpoint('ANALYTICS', { id: partnerId })
      : PARTNERS_ENDPOINTS.STATS;
      
    const response = await this.apiService.get<PartnerStats>(endpoint);
    return response.data || {
      totalPartners: 0,
      activePartners: 0,
      totalRevenue: 0,
      totalEvents: 0,
      totalJobPostings: 0,
      engagementScore: 0
    };
  }

  async getPartnerPerformance(partnerId: string): Promise<any> {
    if (this.useMock) {
      // Mock performance data
      return {
        eventsHosted: Math.floor(Math.random() * 20),
        jobPostings: Math.floor(Math.random() * 50),
        applicationsReceived: Math.floor(Math.random() * 200),
        engagementRate: Math.random(),
        revenueGenerated: Math.floor(Math.random() * 100000),
        satisfaction: Math.random() * 5
      };
    }

    const response = await this.apiService.get(
      buildPartnerEndpoint('PERFORMANCE', { id: partnerId })
    );
    return response.data;
  }

  async getPartnerROI(partnerId: string): Promise<any> {
    if (this.useMock) {
      // Mock ROI data
      return {
        investment: Math.floor(Math.random() * 50000),
        returns: Math.floor(Math.random() * 150000),
        roi: Math.random() * 3,
        period: '12 months',
        breakdown: {
          eventValue: Math.floor(Math.random() * 50000),
          jobPostingValue: Math.floor(Math.random() * 30000),
          brandingValue: Math.floor(Math.random() * 20000)
        }
      };
    }

    const response = await this.apiService.get(
      buildPartnerEndpoint('ROI', { id: partnerId })
    );
    return response.data;
  }

  // Bulk Operations
  async bulkCreatePartners(partners: CreatePartnerRequest[]): Promise<Partner[]> {
    if (this.useMock) {
      return this.mockApi.bulkCreatePartners(partners);
    }

    const response = await this.apiService.post<Partner[]>(
      PARTNERS_ENDPOINTS.BULK_CREATE,
      { partners }
    );
    return response.data;
  }

  async bulkUpdatePartners(updates: Array<{ id: string; data: UpdatePartnerRequest }>): Promise<Partner[]> {
    if (this.useMock) {
      const updatedPartners: Partner[] = [];
      for (const update of updates) {
        const partner = await this.mockApi.updatePartner(update.id, update.data);
        if (partner) {
          updatedPartners.push(partner);
        }
      }
      return updatedPartners;
    }

    const response = await this.apiService.patch<Partner[]>(
      PARTNERS_ENDPOINTS.BULK_UPDATE,
      { updates }
    );
    return response.data || [];
  }

  async bulkDeletePartners(ids: string[]): Promise<{ deletedCount: number; errors: string[] }> {
    if (this.useMock) {
      let deletedCount = 0;
      const errors: string[] = [];
      
      for (const id of ids) {
        const success = await this.mockApi.deletePartner(id);
        if (success) {
          deletedCount++;
        } else {
          errors.push(`Partner ${id} not found`);
        }
      }
      
      return { deletedCount, errors };
    }

    // ApiService.delete signature only accepts url; fallback to patch for bulk delete
    const response = await this.apiService.patch<{ deletedCount: number; errors: string[] }>(
      PARTNERS_ENDPOINTS.BULK_DELETE,
      { ids }
    );
    return response.data || { deletedCount: 0, errors: ['Bulk delete failed'] };
  }

  async bulkUpdatePartnerStatus(ids: string[], status: 'active' | 'inactive'): Promise<Partner[]> {
    if (this.useMock) {
      const updatedPartners: Partner[] = [];
      for (const id of ids) {
        const partner = await this.mockApi.updatePartner(id, { isActive: status === 'active' });
        if (partner) {
          updatedPartners.push(partner);
        }
      }
      return updatedPartners;
    }

    const response = await this.apiService.patch<Partner[]>(
      PARTNERS_ENDPOINTS.BULK_STATUS_UPDATE,
      { ids, status }
    );
    return response.data || [];
  }

  // Export functionality
  async exportPartners(format: 'csv' | 'json' = 'csv', filters?: PartnerFilters): Promise<Blob> {
    if (this.useMock) {
      const partners = await this.mockApi.getPartners(filters);
      const data = format === 'json' 
        ? JSON.stringify(partners.data, null, 2)
        : this.convertToCSV(partners.data);
      
      return new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
    }

    const response = await this.apiService.get<Blob>(
      PARTNERS_ENDPOINTS.EXPORT,
      { 
        params: { format, ...filters },
        responseType: 'blob'
      }
    );
    return response.data;
  }

  // Helper Methods
  private convertToCSV(partners: Partner[]): string {
    if (partners.length === 0) return '';
    
    const headers = Object.keys(partners[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = partners.map(partner => 
      headers.map(header => {
        const value = partner[header as keyof Partner];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }
}