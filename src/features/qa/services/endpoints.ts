/**
 * QA Service API Endpoints
 * Centralized endpoint definitions for all Q&A operations
 */

export const QA_ENDPOINTS = {
  // Core CRUD Operations
  BASE: '/qa',
  BY_ID: '/qa/:id',
  
  // Question Management
  QUESTIONS: '/qa/questions',
  QUESTION_BY_ID: '/qa/questions/:id',
  MY_QUESTIONS: '/qa/questions/my',
  
  // Answer Management
  ANSWERS: '/qa/questions/:questionId/answers',
  ANSWER_BY_ID: '/qa/questions/:questionId/answers/:answerId',
  MY_ANSWERS: '/qa/answers/my',
  
  // Search and Filtering
  SEARCH: '/qa/search',
  BY_CATEGORY: '/qa/category/:category',
  BY_TAG: '/qa/tag/:tag',
  BY_USER: '/qa/user/:userId',
  
  // Voting System
  VOTE_QUESTION: '/qa/questions/:id/vote',
  VOTE_ANSWER: '/qa/questions/:questionId/answers/:answerId/vote',
  MY_VOTES: '/qa/votes/my',
  
  // Popular and Trending
  POPULAR: '/qa/popular',
  TRENDING: '/qa/trending',
  RECENT: '/qa/recent',
  UNANSWERED: '/qa/unanswered',
  
  // Moderation
  REPORT_QUESTION: '/qa/questions/:id/report',
  REPORT_ANSWER: '/qa/questions/:questionId/answers/:answerId/report',
  MODERATE: '/qa/moderate',
  
  // Categories and Tags
  CATEGORIES: '/qa/categories',
  TAGS: '/qa/tags',
  TAG_SUGGESTIONS: '/qa/tags/suggestions',
  
  // User Interactions
  BOOKMARK_QUESTION: '/qa/questions/:id/bookmark',
  MY_BOOKMARKS: '/qa/bookmarks/my',
  FOLLOW_QUESTION: '/qa/questions/:id/follow',
  MY_FOLLOWED: '/qa/followed/my',
  
  // Analytics and Statistics
  STATS: '/qa/stats',
  USER_STATS: '/qa/stats/user/:userId',
  QUESTION_ANALYTICS: '/qa/questions/:id/analytics',
  
  // Bulk Operations
  BULK_CREATE_QUESTIONS: '/qa/questions/bulk',
  BULK_UPDATE_QUESTIONS: '/qa/questions/bulk/update',
  BULK_DELETE_QUESTIONS: '/qa/questions/bulk/delete',
  EXPORT: '/qa/export',
  
  // Accept/Best Answer
  ACCEPT_ANSWER: '/qa/questions/:questionId/answers/:answerId/accept',
  BEST_ANSWERS: '/qa/answers/best'
} as const;

// Type for endpoint keys to ensure type safety
export type QAEndpoint = keyof typeof QA_ENDPOINTS;

// Helper function to build endpoint URLs with parameters
export const buildQAEndpoint = (
  endpoint: QAEndpoint,
  params?: Record<string, string | number>
): string => {
  let url = QA_ENDPOINTS[endpoint];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  return url;
};