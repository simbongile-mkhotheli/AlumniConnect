/**
 * Shared Types
 * Common interfaces and types used across all features
 */

// Core API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  error?: {
    code: number;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message: string;
  error?: {
    code: number;
    message: string;
  };
}

// Common Result Types
export interface BulkOperationResult {
  updatedCount: number;
  errors?: string[];
}

export interface ExportResult {
  downloadUrl: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

// Re-export all domain types for convenience (maintains backward compatibility)
export type {
  User,
  Event,
  Sponsor,
  Partner,
  Chapter,
  Opportunity,
  Mentorship,
  QAItem,
  Spotlight,
  DbUser,
  FilterState,
} from '../../../types';

// Re-export spotlight-specific types
export type {
  SpotlightCategory,
  SpotlightNomination,
  SpotlightStats,
  CreateSpotlightRequest,
  UpdateSpotlightRequest,
  SpotlightFilters,
} from '../../../features/spotlights/types';

// Core Entity Base Interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}