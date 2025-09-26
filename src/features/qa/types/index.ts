// QA types
// This file exports all Q&A-related TypeScript interfaces and types

export * from './qa';

// Re-export shared FilterState so feature-local imports can access it
export type { FilterState } from '@shared/types';
