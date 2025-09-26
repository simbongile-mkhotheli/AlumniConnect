/**
 * Sponsors API Endpoints Configuration
 */
export const SPONSORS_ENDPOINTS = {
  BASE: '/sponsors',
  BY_ID: (id: string) => `/sponsors/${id}`,
  BY_STATUS: (status: string) => `/sponsors/status/${status}`,
  BY_TIER: (tier: string) => `/sponsors/tier/${tier}`,
  ACTIVATE: (id: string) => `/sponsors/${id}/activate`,
  DEACTIVATE: (id: string) => `/sponsors/${id}/deactivate`,
  ANALYTICS: (id: string) => `/sponsors/${id}/analytics`,
  BULK: '/sponsors/bulk',
} as const;