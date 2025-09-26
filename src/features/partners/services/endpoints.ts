/**
 * Partners Service API Endpoints
 * Centralized endpoint definitions for all partner operations
 */

export const PARTNERS_ENDPOINTS = {
  // Core CRUD Operations
  BASE: '/partners',
  BY_ID: '/partners/:id',
  
  // Search and Filtering
  SEARCH: '/partners/search',
  BY_CATEGORY: '/partners/category/:category',
  BY_TIER: '/partners/tier/:tier',
  BY_INDUSTRY: '/partners/industry/:industry',
  BY_LOCATION: '/partners/location/:location',
  
  // Partner Types and Tiers
  CORPORATE: '/partners/corporate',
  ACADEMIC: '/partners/academic',
  NON_PROFIT: '/partners/non-profit',
  STARTUP: '/partners/startup',
  
  // Tier Management
  TIERS: '/partners/tiers',
  TIER_BY_ID: '/partners/tiers/:tierId',
  UPGRADE_TIER: '/partners/:id/tier/upgrade',
  DOWNGRADE_TIER: '/partners/:id/tier/downgrade',
  
  // Partnership Management
  ACTIVE: '/partners/active',
  INACTIVE: '/partners/inactive',
  PENDING: '/partners/pending',
  ACTIVATE: '/partners/:id/activate',
  DEACTIVATE: '/partners/:id/deactivate',
  SUSPEND: '/partners/:id/suspend',
  
  // Benefits and Services
  BENEFITS: '/partners/:id/benefits',
  SERVICES: '/partners/:id/services',
  OFFERINGS: '/partners/:id/offerings',
  
  // Contact and Communication
  CONTACTS: '/partners/:id/contacts',
  CONTACT_BY_ID: '/partners/:id/contacts/:contactId',
  COMMUNICATIONS: '/partners/:id/communications',
  
  // Events and Collaborations
  EVENTS: '/partners/:id/events',
  COLLABORATIONS: '/partners/:id/collaborations',
  JOINT_EVENTS: '/partners/events/joint',
  
  // Contracts and Agreements
  CONTRACTS: '/partners/:id/contracts',
  CONTRACT_BY_ID: '/partners/:id/contracts/:contractId',
  RENEWALS: '/partners/contracts/renewals',
  EXPIRING: '/partners/contracts/expiring',
  
  // Analytics and Reporting
  STATS: '/partners/stats',
  ANALYTICS: '/partners/:id/analytics',
  PERFORMANCE: '/partners/:id/performance',
  ROI: '/partners/:id/roi',
  
  // Categories and Industries
  CATEGORIES: '/partners/categories',
  INDUSTRIES: '/partners/industries',
  LOCATIONS: '/partners/locations',
  
  // Bulk Operations
  BULK_CREATE: '/partners/bulk',
  BULK_UPDATE: '/partners/bulk/update',
  BULK_DELETE: '/partners/bulk/delete',
  BULK_STATUS_UPDATE: '/partners/bulk/status',
  EXPORT: '/partners/export',
  
  // Featured and Highlighted
  FEATURED: '/partners/featured',
  SPOTLIGHT: '/partners/spotlight',
  SUCCESS_STORIES: '/partners/success-stories',
  
  // Integration and API
  INTEGRATION_STATUS: '/partners/:id/integration',
  API_ACCESS: '/partners/:id/api',
  WEBHOOKS: '/partners/:id/webhooks'
} as const;

// Type for endpoint keys to ensure type safety
export type PartnerEndpoint = keyof typeof PARTNERS_ENDPOINTS;

// Helper function to build endpoint URLs with parameters
export const buildPartnerEndpoint = (
  endpoint: PartnerEndpoint,
  params?: Record<string, string | number>
): string => {
  let url = PARTNERS_ENDPOINTS[endpoint];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  return url;
};