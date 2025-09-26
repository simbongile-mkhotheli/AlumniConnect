/**
 * API Endpoints Configuration
 * Centralized endpoint definitions for the AlumniConnect API
 */

// Base API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },

  // Users & Profiles
  USERS: {
    BASE: '/users',
    PROFILE: (id: string) => `/users/${id}/profile`,
    AVATAR: (id: string) => `/users/${id}/avatar`,
    BULK: '/users/bulk',
  },

  // Events
  EVENTS: {
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
  },

  // Sponsors
  SPONSORS: {
    BASE: '/sponsors',
    BY_ID: (id: string) => `/sponsors/${id}`,
    BY_STATUS: (status: string) => `/sponsors/status/${status}`,
    ACTIVATE: (id: string) => `/sponsors/${id}/activate`,
    DEACTIVATE: (id: string) => `/sponsors/${id}/deactivate`,
    ANALYTICS: (id: string) => `/sponsors/${id}/analytics`,
    BULK: '/sponsors/bulk',
    BY_TIER: (tier: string) => `/sponsors/tier/${tier}`,
    ACTIVE: '/sponsors/active',
    STATS: '/sponsors/stats',
  },

  // Partners
  PARTNERS: {
    BASE: '/partners',
    BY_ID: (id: string) => `/partners/${id}`,
    ACTIVATE: (id: string) => `/partners/${id}/activate`,
    DEACTIVATE: (id: string) => `/partners/${id}/deactivate`,
    ANALYTICS: (id: string) => `/partners/${id}/analytics`,
    BULK: '/partners/bulk',
    BY_TYPE: (type: string) => `/partners/type/${type}`,
    HIRING: '/partners/hiring',
    OPPORTUNITIES: (id: string) => `/partners/${id}/opportunities`,
  },

  // Regional Chapters
  CHAPTERS: {
    BASE: '/chapters',
    BY_ID: (id: string) => `/chapters/${id}`,
    ACTIVATE: (id: string) => `/chapters/${id}/activate`,
    DEACTIVATE: (id: string) => `/chapters/${id}/deactivate`,
    MEMBERS: (id: string) => `/chapters/${id}/members`,
    EVENTS: (id: string) => `/chapters/${id}/events`,
    ANALYTICS: (id: string) => `/chapters/${id}/analytics`,
    BULK: '/chapters/bulk',
    BY_LOCATION: (location: string) => `/chapters/location/${location}`,
    ACTIVE: '/chapters/active',
  },

  // Opportunities
  OPPORTUNITIES: {
    BASE: '/opportunities',
    BY_ID: (id: string) => `/opportunities/${id}`,
    ACTIVATE: (id: string) => `/opportunities/${id}/activate`,
    DEACTIVATE: (id: string) => `/opportunities/${id}/deactivate`,
    EXPIRE: (id: string) => `/opportunities/${id}/expire`,
    RENEW: (id: string) => `/opportunities/${id}/renew`,
    APPROVE: (id: string) => `/opportunities/${id}/approve`,
    REJECT: (id: string) => `/opportunities/${id}/reject`,
    APPLICATIONS: (id: string) => `/opportunities/${id}/applications`,
    APPLY: (id: string) => `/opportunities/${id}/apply`,
    ANALYTICS: (id: string) => `/opportunities/${id}/analytics`,
    EXPORT: '/opportunities/export',
    IMPORT: '/opportunities/import',
    MARK_FILLED: (id: string) => `/opportunities/${id}/mark-filled`,
    BULK: '/opportunities/bulk',
    BY_TYPE: (type: string) => `/opportunities/type/${type}`,
    BY_LEVEL: (level: string) => `/opportunities/level/${level}`,
    ACTIVE: '/opportunities/active',
    FEATURED: '/opportunities/featured',
  },

  // Enhanced Mentorship endpoints
  MENTORSHIP: {
    BASE: '/mentorships',
    BY_ID: (id: string) => `/mentorships/${id}`,

    // Status management
    APPROVE: (id: string) => `/mentorships/${id}/approve`,
    REJECT: (id: string) => `/mentorships/${id}/reject`,
    COMPLETE: (id: string) => `/mentorships/${id}/complete`,
    PAUSE: (id: string) => `/mentorships/${id}/pause`,
    RESUME: (id: string) => `/mentorships/${id}/resume`,
    CANCEL: (id: string) => `/mentorships/${id}/cancel`,

    // Session management
    SESSIONS: (id: string) => `/mentorships/${id}/sessions`,
    SESSION_BY_ID: (mentorshipId: string, sessionId: string) =>
      `/mentorships/${mentorshipId}/sessions/${sessionId}`,
    SCHEDULE: (id: string) => `/mentorships/${id}/schedule`,
    RESCHEDULE: (mentorshipId: string, sessionId: string) =>
      `/mentorships/${mentorshipId}/sessions/${sessionId}/reschedule`,
    COMPLETE_SESSION: (mentorshipId: string, sessionId: string) =>
      `/mentorships/${mentorshipId}/sessions/${sessionId}/complete`,
    CANCEL_SESSION: (mentorshipId: string, sessionId: string) =>
      `/mentorships/${mentorshipId}/sessions/${sessionId}/cancel`,

    // Feedback and ratings
    FEEDBACK: (id: string) => `/mentorships/${id}/feedback`,
    SESSION_FEEDBACK: (mentorshipId: string, sessionId: string) =>
      `/mentorships/${mentorshipId}/sessions/${sessionId}/feedback`,
    RATE: (id: string) => `/mentorships/${id}/rate`,

    // Analytics and reporting
    ANALYTICS: (id: string) => `/mentorships/${id}/analytics`,
    PROGRESS: (id: string) => `/mentorships/${id}/progress`,
    STATS: '/mentorships/stats',
    EXPORT: '/mentorships/export',
    IMPORT: '/mentorships/import',

    // Filtering and search
    BULK: '/mentorships/bulk',
    BY_TYPE: (type: string) => `/mentorships/type/${type}`,
    BY_STATUS: (status: string) => `/mentorships/status/${status}`,
    BY_MENTOR: (mentorId: string) => `/mentorships/mentor/${mentorId}`,
    BY_MENTEE: (menteeId: string) => `/mentorships/mentee/${menteeId}`,
    BY_CHAPTER: (chapterId: string) => `/mentorships/chapter/${chapterId}`,
    ACTIVE: '/mentorships/active',
    PENDING: '/mentorships/pending',
    COMPLETED: '/mentorships/completed',

    // Matching and recommendations
    MATCH: '/mentorships/match',
    RECOMMENDATIONS: (userId: string) =>
      `/mentorships/recommendations/${userId}`,

    // Notifications
    NOTIFICATIONS: (id: string) => `/mentorships/${id}/notifications`,
    SEND_NOTIFICATION: (id: string) => `/mentorships/${id}/notify`,
  },

  // Enhanced Community Q&A endpoints
  QA: {
    BASE: '/qa',
    BY_ID: (id: string) => `/qa/${id}`,

    // Status management
    PUBLISH: (id: string) => `/qa/${id}/publish`,
    ARCHIVE: (id: string) => `/qa/${id}/archive`,
    FLAG: (id: string) => `/qa/${id}/flag`,
    UNFLAG: (id: string) => `/qa/${id}/unflag`,
    APPROVE: (id: string) => `/qa/${id}/approve`,
    REJECT: (id: string) => `/qa/${id}/reject`,
    LOCK: (id: string) => `/qa/${id}/lock`,
    UNLOCK: (id: string) => `/qa/${id}/unlock`,
    FEATURE: (id: string) => `/qa/${id}/feature`,
    UNFEATURE: (id: string) => `/qa/${id}/unfeature`,
    STICKY: (id: string) => `/qa/${id}/sticky`,
    UNSTICKY: (id: string) => `/qa/${id}/unsticky`,

    // Answer management
    ANSWERS: (id: string) => `/qa/${id}/answers`,
    ANSWER_BY_ID: (questionId: string, answerId: string) =>
      `/qa/${questionId}/answers/${answerId}`,
    ADD_ANSWER: (id: string) => `/qa/${id}/answers`,
    ACCEPT_ANSWER: (questionId: string, answerId: string) =>
      `/qa/${questionId}/answers/${answerId}/accept`,
    UNACCEPT_ANSWER: (questionId: string, answerId: string) =>
      `/qa/${questionId}/answers/${answerId}/unaccept`,
    VERIFY_ANSWER: (questionId: string, answerId: string) =>
      `/qa/${questionId}/answers/${answerId}/verify`,
    UNVERIFY_ANSWER: (questionId: string, answerId: string) =>
      `/qa/${questionId}/answers/${answerId}/unverify`,

    // Comment management
    COMMENTS: (id: string) => `/qa/${id}/comments`,
    COMMENT_BY_ID: (qaId: string, commentId: string) =>
      `/qa/${qaId}/comments/${commentId}`,
    ADD_COMMENT: (id: string) => `/qa/${id}/comments`,
    REPLY_COMMENT: (qaId: string, commentId: string) =>
      `/qa/${qaId}/comments/${commentId}/reply`,

    // Voting system
    VOTE: (id: string) => `/qa/${id}/vote`,
    VOTE_ANSWER: (questionId: string, answerId: string) =>
      `/qa/${questionId}/answers/${answerId}/vote`,
    VOTE_COMMENT: (qaId: string, commentId: string) =>
      `/qa/${qaId}/comments/${commentId}/vote`,

    // Analytics and tracking
    ANALYTICS: (id: string) => `/qa/${id}/analytics`,
    VIEW: (id: string) => `/qa/${id}/view`,
    STATS: '/qa/stats',
    EXPORT: '/qa/export',
    IMPORT: '/qa/import',

    // Filtering and search
    BULK: '/qa/bulk',
    BY_CATEGORY: (category: string) => `/qa/category/${category}`,
    BY_TYPE: (type: string) => `/qa/type/${type}`,
    BY_STATUS: (status: string) => `/qa/status/${status}`,
    BY_AUTHOR: (authorId: string) => `/qa/author/${authorId}`,
    BY_CHAPTER: (chapterId: string) => `/qa/chapter/${chapterId}`,
    BY_DIFFICULTY: (difficulty: string) => `/qa/difficulty/${difficulty}`,

    // Special collections
    TRENDING: '/qa/trending',
    UNANSWERED: '/qa/unanswered',
    FEATURED: '/qa/featured',
    RECENT: '/qa/recent',
    POPULAR: '/qa/popular',
    MY_QUESTIONS: (userId: string) => `/qa/user/${userId}/questions`,
    MY_ANSWERS: (userId: string) => `/qa/user/${userId}/answers`,
    MY_ACTIVITY: (userId: string) => `/qa/user/${userId}/activity`,

    // Moderation
    FLAGGED: '/qa/flagged',
    PENDING_REVIEW: '/qa/pending-review',
    MODERATION_QUEUE: '/qa/moderation-queue',
    MODERATE: (id: string) => `/qa/${id}/moderate`,

    // Related content
    RELATED: (id: string) => `/qa/${id}/related`,
    SIMILAR: (id: string) => `/qa/${id}/similar`,
    TAGS: '/qa/tags',
    TAG_SUGGESTIONS: '/qa/tags/suggestions',
  },

  // Alumni Spotlights
  SPOTLIGHTS: {
    BASE: '/spotlights',
    BY_ID: (id: string) => `/spotlights/${id}`,
    PUBLISH: (id: string) => `/spotlights/${id}/publish`,
    UNPUBLISH: (id: string) => `/spotlights/${id}/unpublish`,
    FEATURE: (id: string) => `/spotlights/${id}/feature`,
    UNFEATURE: (id: string) => `/spotlights/${id}/unfeature`,
    ARCHIVE: (id: string) => `/spotlights/${id}/archive`,
    BULK: '/spotlights/bulk',
    BY_TYPE: (type: string) => `/spotlights/type/${type}`,
    FEATURED: '/spotlights/featured',
    PUBLISHED: '/spotlights/published',
    ANALYTICS: (id: string) => `/spotlights/${id}/analytics`,
  },

  // Enhanced Analytics & Reports
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    KPI: '/analytics/kpi',
    ENGAGEMENT: '/analytics/engagement',
    GROWTH: '/analytics/growth',
    RETENTION: '/analytics/retention',

    // Module-specific analytics
    EVENTS: '/analytics/events',
    MENTORSHIP: '/analytics/mentorship',
    QA: '/analytics/qa',
    CHAPTERS: '/analytics/chapters',
    SPONSORS: '/analytics/sponsors',
    OPPORTUNITIES: '/analytics/opportunities',
    SPOTLIGHTS: '/analytics/spotlights',

    // Advanced analytics
    USER_JOURNEY: '/analytics/user-journey',
    CONVERSION: '/analytics/conversion',
    COHORT: '/analytics/cohort',
    FUNNEL: '/analytics/funnel',

    // Export and reporting
    EXPORT: '/analytics/export',
    REPORTS: '/analytics/reports',
    CUSTOM_REPORT: '/analytics/custom-report',
  },

  // Enhanced Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    UNREAD: '/notifications/unread',
    SEND: '/notifications/send',
    BULK: '/notifications/bulk',

    // Notification types
    BY_TYPE: (type: string) => `/notifications/type/${type}`,
    MENTORSHIP: '/notifications/mentorship',
    QA: '/notifications/qa',
    SESSIONS: '/notifications/sessions',
    SYSTEM: '/notifications/system',

    // User-specific
    BY_USER: (userId: string) => `/notifications/user/${userId}`,
    PREFERENCES: (userId: string) =>
      `/notifications/user/${userId}/preferences`,
    SUBSCRIBE: (userId: string) => `/notifications/user/${userId}/subscribe`,
    UNSUBSCRIBE: (userId: string) =>
      `/notifications/user/${userId}/unsubscribe`,

    // Real-time
    WEBSOCKET: '/notifications/ws',
    SSE: '/notifications/sse',
  },

  // File Management
  FILES: {
    UPLOAD: '/files/upload',
    DELETE: (id: string) => `/files/${id}`,
    AVATAR: '/files/avatar',
    EVENT_COVER: '/files/event-cover',
    SPONSOR_LOGO: '/files/sponsor-logo',
    PARTNER_LOGO: '/files/partner-logo',
    MENTORSHIP_RESOURCES: '/files/mentorship-resources',
    QA_ATTACHMENTS: '/files/qa-attachments',
  },

  // Settings
  SETTINGS: {
    BASE: '/settings',
    PLATFORM: '/settings/platform',
    EMAIL: '/settings/email',
    NOTIFICATIONS: '/settings/notifications',
    INTEGRATIONS: '/settings/integrations',
    BACKUP: '/settings/backup',
    RESTORE: '/settings/restore',
    MENTORSHIP: '/settings/mentorship',
    QA: '/settings/qa',
  },

  // Enhanced Search
  SEARCH: {
    GLOBAL: '/search',
    USERS: '/search/users',
    EVENTS: '/search/events',
    OPPORTUNITIES: '/search/opportunities',
    CHAPTERS: '/search/chapters',
    MENTORSHIP: '/search/mentorship',
    QA: '/search/qa',
    SPOTLIGHTS: '/search/spotlights',
    SUGGESTIONS: '/search/suggestions',
    AUTOCOMPLETE: '/search/autocomplete',
    ADVANCED: '/search/advanced',
  },

  // Integration endpoints
  INTEGRATIONS: {
    CALENDAR: '/integrations/calendar',
    VIDEO_CONFERENCING: '/integrations/video',
    EMAIL: '/integrations/email',
    SLACK: '/integrations/slack',
    DISCORD: '/integrations/discord',
    WEBHOOKS: '/integrations/webhooks',
  },

  // Health and monitoring
  HEALTH: {
    STATUS: '/health/status',
    METRICS: '/health/metrics',
    LOGS: '/health/logs',
    PERFORMANCE: '/health/performance',
  },
} as const;

// Helper function to build query parameters
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Helper function to build endpoint with parameters
export const buildEndpoint = (
  endpoint: string,
  params?: Record<string, any>
): string => {
  if (!params) return endpoint;
  return `${endpoint}${buildQueryParams(params)}`;
};

// Export individual endpoint groups for easier imports
export const {
  AUTH,
  USERS,
  EVENTS,
  SPONSORS,
  PARTNERS,
  CHAPTERS,
  OPPORTUNITIES,
  MENTORSHIP,
  QA,
  SPOTLIGHTS,
  ANALYTICS,
  FILES,
  NOTIFICATIONS,
  SETTINGS,
  SEARCH,
  INTEGRATIONS,
  HEALTH,
} = API_ENDPOINTS;
