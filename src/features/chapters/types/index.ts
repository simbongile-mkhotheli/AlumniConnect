/**
 * Chapters Types
 * All chapter-related TypeScript interfaces and types
 */

export * from './chapter';

// Re-export shared types for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  BulkOperationResult,
  ExportResult,
  ImportResult,
} from '@shared/types';
