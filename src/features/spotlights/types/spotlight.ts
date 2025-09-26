// Spotlights domain types
// Contains all spotlight-related TypeScript interfaces and types
// Migrated from src/types/index.ts during Phase 2

/**
 * Spotlight type union
 */
export type SpotlightType = 'success_story' | 'video_interview' | 'tutorial' | 'achievement' | 'announcement';

/**
 * Spotlight status union
 */
export type SpotlightStatus = 'published' | 'draft' | 'scheduled' | 'archived';

/**
 * Spotlight interface - core spotlight entity
 */
export interface Spotlight {
  id: string;
  title: string;
  type: SpotlightType;
  status: SpotlightStatus;
  featuredAlumniId: string;
  featuredAlumniName: string;
  content: string;
  videoUrl?: string;
  imageUrl?: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  shareCount: number;
  publishedDate?: string;
  createdAt: string;
  updatedAt?: string;

  // Additional fields that may be used in mock data or components
  person?: string; // alias for featuredAlumniName
  author?: string; // alias for alumni name or content creator
  shortDescription?: string; // excerpt / summary used in lists
  createdDate?: string; // alias for createdAt (UI may reference)
  featured?: boolean; // whether the spotlight is featured
  commentCount?: number; // number of comments (used in stats)
}

/**
 * Spotlight filters interface for UI filtering
 * Used in spotlight management components and API queries
 */
export interface SpotlightFilters {
  status?: SpotlightStatus;
  type?: SpotlightType;
  search?: string;
  featuredAlumniId?: string;
  tags?: string[];
  featured?: boolean;
  hasVideo?: boolean;
  hasImage?: boolean;
  publishedSince?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'publishedDate' | 'viewCount' | 'likeCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Spotlight form data interface
 * Used for create/edit forms
 */
export interface SpotlightFormData {
  title: string;
  type: SpotlightType;
  status: SpotlightStatus;
  featuredAlumniId: string;
  featuredAlumniName: string;
  content: string;
  videoUrl?: string;
  imageUrl?: string;
  tags: string[];
  publishedDate?: string;
  featured?: boolean;
  shortDescription?: string;
}

/**
 * Spotlight summary statistics
 * Used in dashboard and analytics
 */
export interface SpotlightSummaryStats {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
  featured: number;
  withVideo: number;
  withImage: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  byType: {
    success_story: number;
    video_interview: number;
    tutorial: number;
    achievement: number;
    announcement: number;
  };
}

/**
 * Spotlight category - for filtering and organization
 */
export interface SpotlightCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  count?: number; // optional usage in mock responses for UI display
}

/**
 * Spotlight nomination - for community-driven spotlight creation
 */
export interface SpotlightNomination {
  id: string;
  spotlightId?: string;
  nomineeName: string;
  nomineeId?: string;
  nominatorId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

/**
 * Spotlight statistics - detailed analytics
 */
export interface SpotlightStats {
  spotlightId: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
  averageViewTime?: number;
  conversionRate?: number;
  lastUpdated: string;
}

/**
 * Create spotlight request
 */
export interface CreateSpotlightRequest {
  title: string;
  type: SpotlightType;
  featuredAlumniId: string;
  featuredAlumniName: string;
  content: string;
  videoUrl?: string;
  imageUrl?: string;
  tags: string[];
  status?: SpotlightStatus;
  featured?: boolean;
  shortDescription?: string;
  publishedDate?: string;
}

/**
 * Update spotlight request
 */
export interface UpdateSpotlightRequest {
  title?: string;
  type?: SpotlightType;
  featuredAlumniId?: string;
  featuredAlumniName?: string;
  content?: string;
  videoUrl?: string;
  imageUrl?: string;
  tags?: string[];
  status?: SpotlightStatus;
  featured?: boolean;
  shortDescription?: string;
  publishedDate?: string;
}