import { MockDataLoader } from '@shared/utils/mockDataLoader';
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
 * Mock API implementation for Partners
 * Provides realistic data simulation for development and testing
 */
export class PartnersMockApi {
  // Using static helper methods from MockDataLoader for consistency with other feature mocks
  constructor() {}

  // Core CRUD Operations
  async getPartners(params?: PartnerFilters): Promise<PaginatedResponse<Partner>> {
  let partners: Partner[] = await MockDataLoader.getPartners();

    // Apply filters
    if (params) {
      partners = this.applyFilters(partners, params);
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const total = partners.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = partners.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      success: true,
      message: 'Partners retrieved'
    };
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    const partner = await MockDataLoader.findById<Partner>('partners', id);
    return partner;
  }

  async createPartner(request: CreatePartnerRequest): Promise<Partner> {
    const newPartner: Partner = {
      id: Date.now().toString(),
      name: request.name,
      description: request.description,
      logo: request.logo,
      website: request.website,
      industry: request.industry,
      category: request.category,
      tier: request.tier || 'bronze',
      location: request.location,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone,
      isActive: true,
      isFeatured: false,
      joinedDate: new Date().toISOString(),
      lastContact: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      benefits: [],
      tags: request.tags || [],
      // Required Partner core fields (not supplied by CreatePartnerRequest)
  type: 'company',
      status: 'active',
      jobOpportunities: 0,
      alumniHired: 0,
      hireRate: 0
    };

    const persisted = await MockDataLoader.createItem<Partner>('partners', newPartner);
    return persisted || newPartner;
  }

  async updatePartner(id: string, request: UpdatePartnerRequest): Promise<Partner | null> {
    const existing = await MockDataLoader.findById<Partner>('partners', id);
    if (!existing) return null;
    const updated: Partner = {
      ...existing,
      ...request,
      type: existing.type || 'company',
      status: existing.status || 'active',
      jobOpportunities: existing.jobOpportunities ?? 0,
      alumniHired: existing.alumniHired ?? 0,
      hireRate: existing.hireRate ?? 0,
      updatedAt: new Date().toISOString()
    };
    const persisted = await MockDataLoader.putItem<Partner>('partners', id, updated);
    return persisted || updated;
  }

  async deletePartner(id: string): Promise<boolean> {
    return MockDataLoader.deleteItem('partners', id);
  }

  // Search and Filtering
  async searchPartners(query: string, filters?: PartnerFilters): Promise<PaginatedResponse<Partner>> {
  let partners: Partner[] = await MockDataLoader.getPartners();
    
    // Apply text search
    if (query) {
      partners = partners.filter(partner =>
        partner.name.toLowerCase().includes(query.toLowerCase()) ||
        partner.description.toLowerCase().includes(query.toLowerCase()) ||
        (partner.industry || '').toLowerCase().includes(query.toLowerCase()) ||
        (partner.location || '').toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply additional filters
    if (filters) {
      partners = this.applyFilters(partners, filters);
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const total = partners.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = partners.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      success: true,
      message: 'Partners search results'
    };
  }

  // Partnership Management
  async getActivePartners(): Promise<Partner[]> {
    const partners = await MockDataLoader.getPartners();
    return partners.filter((partner: Partner) => partner.isActive);
  }

  async getInactivePartners(): Promise<Partner[]> {
    const partners = await MockDataLoader.getPartners();
    return partners.filter((partner: Partner) => !partner.isActive);
  }

  async getFeaturedPartners(): Promise<Partner[]> {
    const partners = await MockDataLoader.getPartners();
    return partners.filter((partner: Partner) => partner.isFeatured && partner.isActive);
  }

  // Tier Management
  async getPartnerTiers(): Promise<PartnerTier[]> {
    return [
      {
        id: 'bronze',
        name: 'Bronze Partner',
        level: 1,
        annualFee: 5000,
        benefits: [
          'Logo placement on website',
          'Event listing privileges',
          'Quarterly newsletter mention'
        ],
        maxEvents: 2,
        maxJobPostings: 5,
        hasDirectoryListing: true,
        hasEventSponsorship: false,
        hasCustomBranding: false
      },
      {
        id: 'silver',
        name: 'Silver Partner',
        level: 2,
        annualFee: 15000,
        benefits: [
          'All Bronze benefits',
          'Featured directory listing',
          'Event co-sponsorship opportunities',
          'Monthly newsletter feature'
        ],
        maxEvents: 5,
        maxJobPostings: 15,
        hasDirectoryListing: true,
        hasEventSponsorship: true,
        hasCustomBranding: false
      },
      {
        id: 'gold',
        name: 'Gold Partner',
        level: 3,
        annualFee: 35000,
        benefits: [
          'All Silver benefits',
          'Premium directory placement',
          'Exclusive event sponsorship',
          'Custom branded content',
          'Dedicated account manager'
        ],
        maxEvents: 12,
        maxJobPostings: 50,
        hasDirectoryListing: true,
        hasEventSponsorship: true,
        hasCustomBranding: true
      },
      {
        id: 'platinum',
        name: 'Platinum Partner',
        level: 4,
        annualFee: 75000,
        benefits: [
          'All Gold benefits',
          'Homepage featured placement',
          'Unlimited event sponsorship',
          'Full custom integration',
          'Priority support'
        ],
        maxEvents: -1, // Unlimited
        maxJobPostings: -1, // Unlimited
        hasDirectoryListing: true,
        hasEventSponsorship: true,
        hasCustomBranding: true
      }
    ];
  }

  async updatePartnerTier(partnerId: string, newTier: string): Promise<Partner | null> {
    const partner = await this.updatePartner(partnerId, { tier: newTier });
    return partner;
  }

  // Categories and Industries
  async getPartnerCategories(): Promise<PartnerCategory[]> {
    return [
      { id: 'corporate', name: 'Corporate Partners', count: 25, description: 'Large corporations and enterprises' },
      { id: 'academic', name: 'Academic Institutions', count: 15, description: 'Universities and research institutions' },
      { id: 'non-profit', name: 'Non-Profit Organizations', count: 12, description: 'NGOs and charitable organizations' },
      { id: 'startup', name: 'Startups & Scale-ups', count: 18, description: 'Early-stage and growing companies' },
      { id: 'government', name: 'Government Agencies', count: 8, description: 'Public sector organizations' },
      { id: 'technology', name: 'Technology Partners', count: 22, description: 'Tech companies and service providers' },
      { id: 'media', name: 'Media & Publishing', count: 10, description: 'Media companies and publishers' },
      { id: 'consulting', name: 'Consulting Firms', count: 14, description: 'Professional services and consulting' }
    ];
  }

  async getPartnerIndustries(): Promise<string[]> {
    return [
      'Technology',
      'Finance & Banking',
      'Healthcare & Life Sciences',
      'Manufacturing',
      'Retail & E-commerce',
      'Education',
      'Energy & Utilities',
      'Real Estate',
      'Media & Entertainment',
      'Transportation & Logistics',
      'Consulting',
      'Non-Profit',
      'Government',
      'Telecommunications',
      'Automotive'
    ];
  }

  async getPartnerLocations(): Promise<string[]> {
    return [
      'New York, NY',
      'San Francisco, CA',
      'Los Angeles, CA',
      'Chicago, IL',
      'Boston, MA',
      'Seattle, WA',
      'Austin, TX',
      'Denver, CO',
      'Miami, FL',
      'Atlanta, GA',
      'International',
      'Remote/Virtual'
    ];
  }

  // Contact Management
  async getPartnerContacts(partnerId: string): Promise<PartnerContact[]> {
    // Mock implementation - would return contacts for the partner
    return [
      {
        id: '1',
        partnerId,
        name: 'John Smith',
        title: 'Partnership Manager',
        email: 'john.smith@partner.com',
        phone: '+1-555-0123',
        isPrimary: true,
        department: 'Partnerships',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Statistics
  async getPartnerStats(partnerId?: string): Promise<PartnerStats> {
  const partners = await MockDataLoader.getPartners();
    
    if (partnerId) {
      const partner = partners.find(p => p.id === partnerId);
      if (!partner) {
        throw new Error('Partner not found');
      }
      
      return {
        totalPartners: 1,
        activePartners: partner.isActive ? 1 : 0,
        totalRevenue: this.calculatePartnerRevenue(partner),
        totalEvents: Math.floor(Math.random() * 10),
        totalJobPostings: Math.floor(Math.random() * 20),
        engagementScore: Math.random() * 100
      };
    }
    
  const activePartners = partners.filter((p: Partner) => p.isActive);
  const totalRevenue = partners.reduce((sum: number, partner: Partner) => sum + this.calculatePartnerRevenue(partner), 0);
    
    return {
      totalPartners: partners.length,
      activePartners: activePartners.length,
      totalRevenue,
      totalEvents: Math.floor(Math.random() * 100),
      totalJobPostings: Math.floor(Math.random() * 200),
      engagementScore: Math.random() * 100
    };
  }

  // Bulk Operations
  async bulkCreatePartners(partners: CreatePartnerRequest[]): Promise<Partner[]> {
    const existingPartners = await MockDataLoader.getPartners();
    const newPartners = partners.map((req, index) => ({
      id: (Date.now() + index).toString(),
      name: req.name,
      description: req.description,
      logo: req.logo,
      website: req.website,
      industry: req.industry,
      category: req.category,
      tier: req.tier || 'bronze',
      location: req.location,
      contactEmail: req.contactEmail,
      contactPhone: req.contactPhone,
      isActive: true,
      isFeatured: false,
      joinedDate: new Date().toISOString(),
      lastContact: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      benefits: [],
      tags: req.tags || [],
  type: 'company',
      status: 'active',
      jobOpportunities: 0,
      alumniHired: 0,
      hireRate: 0
    }));
    
    // Persist each new partner (best-effort)
    const persisted: Partner[] = [];
    for (const np of newPartners) {
      const created = await MockDataLoader.createItem<Partner>('partners', np as Partner);
      persisted.push((created || np) as Partner);
    }
    return persisted;
  }

  // Helper Methods
  private applyFilters(partners: Partner[], filters: PartnerFilters): Partner[] {
    let filtered = [...partners];

    if (filters.category) {
      filtered = filtered.filter(partner => partner.category === filters.category);
    }

    if (filters.tier) {
      filtered = filtered.filter(partner => partner.tier === filters.tier);
    }

    if (filters.industry) {
      filtered = filtered.filter(partner => partner.industry === filters.industry);
    }

    if (filters.location) {
      filtered = filtered.filter(partner => 
        (partner.location || '').toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(partner => partner.isActive === filters.isActive);
    }

    if (filters.isFeatured !== undefined) {
      filtered = filtered.filter(partner => partner.isFeatured === filters.isFeatured);
    }

    return filtered;
  }

  private calculatePartnerRevenue(partner: Partner): number {
    const tierRevenue = {
      'bronze': 5000,
      'silver': 15000,
      'gold': 35000,
      'platinum': 75000
    };
    
    return tierRevenue[partner.tier as keyof typeof tierRevenue] || 0;
  }
}