/**
 * Mentorship API Endpoints Configuration
 */
export const MENTORSHIP_ENDPOINTS = {
  BASE: '/mentorships',
  BY_ID: (id: string) => `/mentorships/${id}`,
  BY_STATUS: (status: string) => `/mentorships/status/${status}`,
  BY_MENTOR: (mentorId: string) => `/mentorships/mentor/${mentorId}`,
  BY_MENTEE: (menteeId: string) => `/mentorships/mentee/${menteeId}`,
  ACCEPT: (id: string) => `/mentorships/${id}/accept`,
  DECLINE: (id: string) => `/mentorships/${id}/decline`,
  COMPLETE: (id: string) => `/mentorships/${id}/complete`,
  CANCEL: (id: string) => `/mentorships/${id}/cancel`,
  BULK: '/mentorships/bulk',
  ANALYTICS: (id: string) => `/mentorships/${id}/analytics`,
} as const;