// Opportunities domain types
// Contains all opportunity-related TypeScript interfaces and types
// Migrated from src/types/index.ts during Phase 2

/**
 * Opportunity type union
 */
export type OpportunityType = 'job' | 'freelance' | 'internship' | 'collaboration' | 'volunteer';

/**
 * Opportunity status union
 */
export type OpportunityStatus = 'active' | 'pending' | 'draft' | 'cancelled' | 'expired' | 'filled';

/**
 * Opportunity level union
 */
export type OpportunityLevel = 'entry' | 'mid' | 'senior' | 'executive';

/**
 * Opportunity interface - core opportunity entity
 */
export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: OpportunityType;
  level: OpportunityLevel;
  location: string;
  isRemote: boolean;
  salary?: string;
  description: string;
  requirements: string[];
  tags: string[];
  status: OpportunityStatus; // required to simplify UI guards
  applicationCount: number; // make counts required with 0 default in mocks
  viewCount: number;
  postedDate: string; // required for date formatting utilities
  expiryDate?: string; // can still be optional
  contactEmail: string;
  partnerId?: string;
  featured?: boolean;
  urgent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Opportunity filters interface for UI filtering
 * Used in opportunity management components and API queries
 */
export interface OpportunityFilters {
  status?: OpportunityStatus;
  type?: OpportunityType;
  level?: OpportunityLevel;
  search?: string;
  location?: string;
  isRemote?: boolean;
  company?: string;
  partnerId?: string;
  tags?: string[];
  featured?: boolean;
  urgent?: boolean;
  minSalary?: number;
  maxSalary?: number;
  postedSince?: string;
  page?: number;
  limit?: number;
}

/**
 * Opportunity form data interface
 * Used for create/edit forms
 */
export interface OpportunityFormData {
  title: string;
  company: string;
  type: OpportunityType;
  level: OpportunityLevel;
  location: string;
  isRemote: boolean;
  salary?: string;
  description: string;
  requirements: string[];
  tags: string[];
  status: OpportunityStatus;
  contactEmail: string;
  partnerId?: string;
  featured?: boolean;
  urgent?: boolean;
  expiryDate?: string;
}

/**
 * Opportunity summary statistics
 * Used in dashboard and analytics
 */
export interface OpportunitySummaryStats {
  total: number;
  active: number;
  pending: number;
  draft: number;
  cancelled: number;
  expired: number;
  filled: number;
  featured: number;
  urgent: number;
  remote: number;
  byType: {
    job: number;
    freelance: number;
    internship: number;
    collaboration: number;
    volunteer: number;
  };
  byLevel: {
    entry: number;
    mid: number;
    senior: number;
    executive: number;
  };
  totalApplications: number;
  totalViews: number;
}