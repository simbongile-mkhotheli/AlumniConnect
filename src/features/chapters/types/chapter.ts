// Chapters domain types
// Contains all chapter-related TypeScript interfaces and types
// Migrated from src/types/index.ts during Phase 2

/**
 * Chapter interface - core chapter entity
 */
export interface Chapter {
  id: string;
  name: string;
  slug?: string; // friendly url
  location: string; // e.g. "Cape Town, ZA"
  region?: string; // optional region e.g. "Western Cape"
  description?: string;
  contactEmail?: string;
  phone?: string;
  website?: string;
  status: 'active' | 'inactive' | 'pending';
  membersCount: number;
  eventsCount: number;
  leaders?: Array<{
    id: string;
    name: string;
    role?: string;
    email?: string;
  }>[];
  createdAt: string;
  updatedAt?: string;

  // optional metadata / tags
  tags?: string[];

  // permit small extras without breaking types (optional)
  [key: string]: any;
}

/**
 * Chapter status union type
 */
export type ChapterStatus = 'active' | 'inactive' | 'pending';

/**
 * Chapter leader interface
 */
export interface ChapterLeader {
  id: string;
  name: string;
  role?: string;
  email?: string;
}

/**
 * Chapter filters interface for UI filtering
 * Used in chapter management components and API queries
 */
export interface ChapterFilters {
  status?: ChapterStatus;
  search?: string;
  location?: string;
  region?: string;
  minMembers?: number;
  maxMembers?: number;
  tags?: string[];
  hasLeaders?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Chapter form data interface
 * Used for create/edit forms
 */
export interface ChapterFormData {
  name: string;
  slug?: string;
  location: string;
  region?: string;
  description?: string;
  contactEmail?: string;
  phone?: string;
  website?: string;
  status: ChapterStatus;
  leaders?: ChapterLeader[];
  tags?: string[];
}

/**
 * Chapter summary statistics
 * Used in dashboard and analytics
 */
export interface ChapterSummaryStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  totalMembers: number;
  avgMembersPerChapter: number;
  totalEvents: number;
  avgEventsPerChapter: number;
  withLeaders: number;
}

/**
 * Chapter analytics interface
 * Used for chapter performance tracking
 */
export interface ChapterAnalytics {
  chapterId: string;
  
  // Membership metrics
  membershipGrowth: number; // percentage growth
  memberRetention: number; // percentage
  newMembersThisMonth: number;
  
  // Event metrics
  eventsHosted: number;
  averageAttendance: number;
  eventSuccessRate: number;
  
  // Engagement metrics
  engagementScore: number; // 0-100
  participationRate: number; // percentage
  communityActivity: number;
  
  // Time-series data
  monthlyStats: Array<{
    month: string;
    members: number;
    events: number;
    attendance: number;
  }>;
  
  // Metadata
  calculatedAt: string;
  periodStart: string;
  periodEnd: string;
}