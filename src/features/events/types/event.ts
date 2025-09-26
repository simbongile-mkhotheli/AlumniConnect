// Events domain types
// Contains all event-related TypeScript interfaces and types
// Migrated from src/types/index.ts during Phase 2

/**
 * Event interface - core event entity
 */
export interface Event {
  id: string;
  title: string;
  slug?: string; // Made optional to match form data
  excerpt: string;
  description: string;
  coverUrl?: string;
  organizer: string;
  location: string;
  venue: string;
  address: string;
  startDate: string;
  endDate?: string;
  sponsor?: string;
  sponsorLogo?: string; // New: Sponsor logo URL
  status: 'draft' | 'scheduled' | 'published' | 'cancelled';
  isFeatured: boolean;
  tags: string[];
  hashtag?: string; // New: Event hashtag (e.g., "#AlumniConnect2024")
  rsvpUrl?: string;
  signupUrl?: string; // New: Optional external signup URL
  rsvpCount?: number;
  attendanceCount?: number;
  createdAt?: string; // Made optional to match db.json data
  updatedAt?: string; // Made optional to match db.json data
}

/**
 * Event status union type
 */
export type EventStatus = 'draft' | 'scheduled' | 'published' | 'cancelled';

/**
 * Event filters interface for UI filtering
 * Used in event management components and API queries
 */
export interface EventFilters {
  status?: EventStatus;
  type?: string;
  search?: string;
  location?: string;
  sponsor?: string;
  featured?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

/**
 * Event form data interface
 * Used for create/edit forms
 */
export interface EventFormData {
  title: string;
  slug?: string;
  excerpt: string;
  description: string;
  coverUrl?: string;
  organizer: string;
  location: string;
  venue: string;
  address: string;
  startDate: string;
  endDate?: string;
  sponsor?: string;
  sponsorLogo?: string;
  status: EventStatus;
  isFeatured: boolean;
  tags: string[];
  hashtag?: string;
  rsvpUrl?: string;
  signupUrl?: string;
}

/**
 * Event summary statistics
 * Used in dashboard and analytics
 */
export interface EventSummaryStats {
  total: number;
  published: number;
  scheduled: number;
  draft: number;
  cancelled: number;
  featured: number;
  thisMonth: number;
  upcoming: number;
}