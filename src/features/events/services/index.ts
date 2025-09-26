/**
 * Events Services
 * Centralized export for all events-related services
 */

export { EventsService } from './eventsService';
export { EventsMockApiService } from './mockApi';
export { EVENTS_ENDPOINTS } from './endpoints';

// Re-export service as default for convenience
export { EventsService as default } from './eventsService';