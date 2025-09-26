/**
 * Spotlights Service API Endpoints
 * Centralized endpoint definitions for all spotlight operations
 */

export const SPOTLIGHTS_ENDPOINTS = {
  // Core CRUD Operations
  BASE: '/spotlights',
  BY_ID: '/spotlights/:id',
  
  // Search and Filtering
  SEARCH: '/spotlights/search',
  BY_CATEGORY: '/spotlights/category/:category',
  BY_TAG: '/spotlights/tag/:tag',
  BY_AUTHOR: '/spotlights/author/:authorId',
  BY_FEATURED_PERSON: '/spotlights/person/:personId',
  
  // Publication Status
  PUBLISHED: '/spotlights/published',
  DRAFT: '/spotlights/draft',
  ARCHIVED: '/spotlights/archived',
  PUBLISH: '/spotlights/:id/publish',
  UNPUBLISH: '/spotlights/:id/unpublish',
  ARCHIVE: '/spotlights/:id/archive',
  
  // Featured and Trending
  FEATURED: '/spotlights/featured',
  TRENDING: '/spotlights/trending',
  RECENT: '/spotlights/recent',
  POPULAR: '/spotlights/popular',
  
  // Categories and Tags
  CATEGORIES: '/spotlights/categories',
  TAGS: '/spotlights/tags',
  TAG_SUGGESTIONS: '/spotlights/tags/suggestions',
  
  // Engagement
  LIKE: '/spotlights/:id/like',
  UNLIKE: '/spotlights/:id/unlike',
  SHARE: '/spotlights/:id/share',
  COMMENT: '/spotlights/:id/comment',
  COMMENTS: '/spotlights/:id/comments',
  
  // Views and Analytics
  VIEW: '/spotlights/:id/view',
  ANALYTICS: '/spotlights/:id/analytics',
  ENGAGEMENT_STATS: '/spotlights/:id/engagement',
  
  // Nomination and Submission
  NOMINATIONS: '/spotlights/nominations',
  NOMINATE: '/spotlights/nominate',
  NOMINATION_BY_ID: '/spotlights/nominations/:id',
  APPROVE_NOMINATION: '/spotlights/nominations/:id/approve',
  REJECT_NOMINATION: '/spotlights/nominations/:id/reject',
  
  // User Interactions
  MY_SPOTLIGHTS: '/spotlights/my',
  MY_LIKES: '/spotlights/likes/my',
  MY_BOOKMARKS: '/spotlights/bookmarks/my',
  BOOKMARK: '/spotlights/:id/bookmark',
  UNBOOKMARK: '/spotlights/:id/unbookmark',
  
  // Alumni Achievements
  ACHIEVEMENTS: '/spotlights/achievements',
  ACHIEVEMENT_BY_ID: '/spotlights/achievements/:id',
  BY_ACHIEVEMENT_TYPE: '/spotlights/achievements/type/:type',
  
  // Success Stories
  SUCCESS_STORIES: '/spotlights/success-stories',
  CAREER_CHANGES: '/spotlights/career-changes',
  ENTREPRENEURSHIP: '/spotlights/entrepreneurship',
  SOCIAL_IMPACT: '/spotlights/social-impact',
  
  // Bulk Operations
  BULK_CREATE: '/spotlights/bulk',
  BULK_UPDATE: '/spotlights/bulk/update',
  BULK_DELETE: '/spotlights/bulk/delete',
  BULK_PUBLISH: '/spotlights/bulk/publish',
  EXPORT: '/spotlights/export',
  
  // Statistics
  STATS: '/spotlights/stats',
  USER_STATS: '/spotlights/stats/user/:userId',
  MONTHLY_STATS: '/spotlights/stats/monthly',
  
  // Moderation
  REPORT: '/spotlights/:id/report',
  MODERATE: '/spotlights/moderate',
  REVIEW_QUEUE: '/spotlights/review-queue'
} as const;

// Type for endpoint keys to ensure type safety
export type SpotlightEndpoint = keyof typeof SPOTLIGHTS_ENDPOINTS;

// Helper function to build endpoint URLs with parameters
export const buildSpotlightEndpoint = (
  endpoint: SpotlightEndpoint,
  params?: Record<string, string | number>
): string => {
  const base = SPOTLIGHTS_ENDPOINTS[endpoint];
  if (!params) return base;
  // Use a local mutable string (wider type) to avoid assigning back to the const union literal
  let built: string = base;
  for (const [key, value] of Object.entries(params)) {
    built = built.replace(`:${key}`, String(value));
  }
  return built;
};