/**
 * Events API Endpoints Configuration
 */
export const EVENTS_ENDPOINTS = {
  BASE: '/events',
  BY_ID: (id: string) => `/events/${id}`,
  BY_STATUS: (status: string) => `/events/status/${status}`,
  PUBLISH: (id: string) => `/events/${id}/publish`,
  UNPUBLISH: (id: string) => `/events/${id}/unpublish`,
  CANCEL: (id: string) => `/events/${id}/cancel`,
  RSVP: (id: string) => `/events/${id}/rsvp`,
  ATTENDEES: (id: string) => `/events/${id}/attendees`,
  ANALYTICS: (id: string) => `/events/${id}/analytics`,
  BULK: '/events/bulk',
  FEATURED: '/events/featured',
  UPCOMING: '/events/upcoming',
  PAST: '/events/past',
} as const;