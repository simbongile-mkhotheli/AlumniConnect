/**
 * Chapters API Endpoints Configuration
 */
export const CHAPTERS_ENDPOINTS = {
  BASE: '/chapters',
  BY_ID: (id: string) => `/chapters/${id}`,
  BY_STATUS: (status: string) => `/chapters/status/${status}`,
  BY_REGION: (region: string) => `/chapters/region/${region}`,
  ACTIVATE: (id: string) => `/chapters/${id}/activate`,
  DEACTIVATE: (id: string) => `/chapters/${id}/deactivate`,
  ANALYTICS: (id: string) => `/chapters/${id}/analytics`,
  BULK: '/chapters/bulk',
  MEMBERS: (id: string) => `/chapters/${id}/members`,
} as const;