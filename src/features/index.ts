// Main features barrel file
// This file provides a centralized export for all feature modules
// Use this for importing multiple features or when you need access to all features

// Feature exports
export * as Events from './events';
export * as Chapters from './chapters';
export * as Sponsors from './sponsors';
export * as Mentorship from './mentorship';
export * as Opportunities from './opportunities';
export * as QA from './qa';
export * as Profiles from './profiles';
export * as Spotlights from './spotlights';

// Direct re-exports for convenience (will be populated during migration)
// Phase 2: Types will be re-exported here
// Phase 3: Services will be re-exported here - IN PROGRESS: Events ✅, Sponsors ✅
// Phase 4: Components will be re-exported here
// Phase 5: Hooks will be re-exported here

// Migration status tracking
export const MIGRATION_STATUS = {
  FOUNDATION_COMPLETE: true,
  TYPES_MIGRATED: true,
  SERVICES_MIGRATED: false, // Partially - Events and Sponsors migrated
  COMPONENTS_MIGRATED: false,
  HOOKS_MIGRATED: false,
  CLEANUP_COMPLETE: false
};