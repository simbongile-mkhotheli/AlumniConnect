// Sponsors domain types
// Contains all sponsor-related TypeScript interfaces and types
// Migrated from src/types/index.ts during Phase 2

/**
 * Sponsor interface - core sponsor entity
 */
export interface Sponsor {
  id: string;
  name: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  status: 'active' | 'pending' | 'inactive' | 'expired';
  logo?: string;
  description: string;
  website?: string;
  contactEmail: string;
  eventsSponsored: number;
  chaptersSponsored: number;
  totalValue: number;
  partnershipSince: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string; // newly added for mutation tracking
}

/**
 * Sponsor tier union type
 */
export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';

/**
 * Sponsor status union type
 */
export type SponsorStatus = 'active' | 'pending' | 'inactive' | 'expired';

/**
 * Sponsor filters interface for UI filtering
 * Used in sponsor management components and API queries
 */
export interface SponsorFilters {
  status?: SponsorStatus;
  tier?: SponsorTier;
  search?: string;
  tags?: string[];
  minValue?: number;
  maxValue?: number;
  partnershipSince?: string;
  page?: number;
  limit?: number;
}

/**
 * Sponsor form data interface
 * Used for create/edit forms
 */
export interface SponsorFormData {
  name: string;
  tier: SponsorTier;
  status: SponsorStatus;
  logo?: string;
  description: string;
  website?: string;
  contactEmail: string;
  totalValue: number;
  partnershipSince: string;
  tags: string[];
}

/**
 * Sponsor summary statistics
 * Used in dashboard and analytics
 */
export interface SponsorSummaryStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  expired: number;
  platinum: number;
  gold: number;
  silver: number;
  bronze: number;
  totalValue: number;
  avgValue: number;
}