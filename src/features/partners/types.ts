// Partner domain request/auxiliary types (Partner base interface comes from shared types)
import type { Partner } from '@shared/types';

export interface CreatePartnerRequest {
  name: string;
  description: string;
  logo?: string;
  website?: string;
  industry: string;
  category: string;
  tier?: string;
  location: string;
  contactEmail: string;
  contactPhone?: string;
  tags?: string[];
}

export interface UpdatePartnerRequest extends Partial<CreatePartnerRequest> {
  isActive?: boolean;
  isFeatured?: boolean;
  tier?: string;
  category?: string;
  industry?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  tags?: string[];
}

export interface PartnerFilters {
  category?: string;
  tier?: string;
  industry?: string;
  location?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

export interface PartnerTier {
  id: string;          // bronze | silver | gold | platinum
  name: string;
  level: number;       // numeric ranking
  annualFee: number;
  benefits: string[];
  maxEvents: number;        // -1 for unlimited
  maxJobPostings: number;   // -1 for unlimited
  hasDirectoryListing: boolean;
  hasEventSponsorship: boolean;
  hasCustomBranding: boolean;
}

export interface PartnerCategory {
  id: string;
  name: string;
  count: number;
  description?: string;
}

export interface PartnerContact {
  id: string;
  partnerId: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerStats {
  totalPartners: number;
  activePartners: number;
  totalRevenue: number;
  totalEvents: number;
  totalJobPostings: number;
  engagementScore: number; // 0-100 scale used in mock analytics
}
