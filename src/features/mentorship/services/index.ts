/**
 * Mentorship Services
 * Centralized export for all mentorship-related services
 */

export { MentorshipService } from './mentorshipService';
export { MentorshipMockApiService } from './mockApi';
export { MENTORSHIP_ENDPOINTS } from './endpoints';

// Re-export service as default for convenience
export { MentorshipService as default } from './mentorshipService';
