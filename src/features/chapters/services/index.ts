/**
 * Chapters Services
 * Centralized export for all chapters-related services
 */

export { ChaptersService } from './chaptersService';
export { ChaptersMockApiService } from './mockApi';
export { CHAPTERS_ENDPOINTS } from './endpoints';

// Re-export service as default for convenience
export { ChaptersService as default } from './chaptersService';
