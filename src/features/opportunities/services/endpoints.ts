/**
 * Opportunities Service API Endpoints
 * Centralized endpoint definitions for all opportunity operations
 */

export const OPPORTUNITIES_ENDPOINTS = {
  // Core CRUD Operations
  BASE: '/opportunities',
  BY_ID: '/opportunities/:id',
  
  // Search and Filtering
  SEARCH: '/opportunities/search',
  BY_CATEGORY: '/opportunities/category/:category',
  BY_LOCATION: '/opportunities/location/:location',
  BY_COMPANY: '/opportunities/company/:company',
  BY_TYPE: '/opportunities/type/:type',
  
  // Application Management
  APPLY: '/opportunities/:id/apply',
  APPLICATIONS: '/opportunities/:id/applications',
  APPLICATION_STATUS: '/opportunities/:id/applications/:applicationId/status',
  MY_APPLICATIONS: '/opportunities/applications/my',
  
  // Featured and Recommended
  FEATURED: '/opportunities/featured',
  RECOMMENDED: '/opportunities/recommended/:userId',
  RECENT: '/opportunities/recent',
  TRENDING: '/opportunities/trending',
  
  // Analytics and Statistics
  STATS: '/opportunities/stats',
  ANALYTICS: '/opportunities/:id/analytics',
  VIEW_COUNT: '/opportunities/:id/view',
  
  // Categories and Metadata
  CATEGORIES: '/opportunities/categories',
  LOCATIONS: '/opportunities/locations',
  COMPANIES: '/opportunities/companies',
  TYPES: '/opportunities/types',
  
  // Bulk Operations
  BULK_CREATE: '/opportunities/bulk',
  BULK_UPDATE: '/opportunities/bulk/update',
  BULK_DELETE: '/opportunities/bulk/delete',
  EXPORT: '/opportunities/export',
  
  // Status Management
  ACTIVATE: '/opportunities/:id/activate',
  DEACTIVATE: '/opportunities/:id/deactivate',
  ARCHIVE: '/opportunities/:id/archive',
  
  // Employer/Admin Operations
  MY_OPPORTUNITIES: '/opportunities/my',
  MODERATE: '/opportunities/:id/moderate',
  REVIEW: '/opportunities/:id/review'
} as const;

// Type for endpoint keys to ensure type safety
export type OpportunityEndpoint = keyof typeof OPPORTUNITIES_ENDPOINTS;

// Helper function to build endpoint URLs with parameters
export const buildOpportunityEndpoint = (
  endpoint: OpportunityEndpoint,
  params?: Record<string, string | number>
): string => {
  let url = OPPORTUNITIES_ENDPOINTS[endpoint];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  return url;
};