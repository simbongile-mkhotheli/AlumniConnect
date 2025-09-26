// Core data types for AlumniConnect platform
// ⚠️ MIGRATION NOTICE: This file is being migrated to feature-based architecture
// New imports should use @features/[domain] instead

// Shared types (cross-feature)
export * from './shared';

// Re-exports for backward compatibility (Phase 2: All Domains)
export type { 
  Event, 
  EventStatus, 
  EventFilters, 
  EventFormData, 
  EventSummaryStats 
} from '../features/events/types';
export type { 
  Sponsor, 
  SponsorTier, 
  SponsorStatus, 
  SponsorFilters, 
  SponsorFormData, 
  SponsorSummaryStats 
} from '../features/sponsors/types';
export type { 
  Chapter, 
  ChapterStatus, 
  ChapterLeader, 
  ChapterFilters, 
  ChapterFormData, 
  ChapterSummaryStats, 
  ChapterAnalytics 
} from '../features/chapters/types';
export type { 
  Opportunity, 
  OpportunityType, 
  OpportunityStatus, 
  OpportunityLevel, 
  OpportunityFilters, 
  OpportunityFormData, 
  OpportunitySummaryStats 
} from '../features/opportunities/types';
export type { 
  Spotlight, 
  SpotlightType, 
  SpotlightStatus, 
  SpotlightFilters, 
  SpotlightFormData, 
  SpotlightSummaryStats 
} from '../features/spotlights/types';
export type { 
  QAItem, 
  QAAnswer, 
  QAComment, 
  QAItemType, 
  QAStatus, 
  QACategory, 
  QADifficulty, 
  QAFilters, 
  QAFormData, 
  QASummaryStats, 
  QAAnalytics 
} from '../features/qa/types';
export type { 
  Mentorship, 
  MentorshipSession, 
  MentorshipType, 
  MentorshipStatus, 
  MeetingFrequency, 
  SessionStatus, 
  MeetingType, 
  MentorshipFilters, 
  MentorshipFormData, 
  MentorshipSummaryStats, 
  MentorshipAnalytics 
} from '../features/mentorship/types';
export type { 
  User, 
  DbUser, 
  AlumniProfile, 
  ProfileRole, 
  ExtendedProfileRole, 
  ProfileStatus, 
  Badge, 
  ProfileAnalytics, 
  ProfileAnalyticsTimelineEntry, 
  ProfileSettings, 
  ProfileFilters, 
  ProfileFormData, 
  ProfileSummaryStats 
} from '../features/profiles/types';
