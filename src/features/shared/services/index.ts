/**
 * Shared Services Index
 * Exports all shared services and utilities
 */

export { ApiService } from './apiService';
export type { ApiClient } from './apiService';
export { shouldUseMockApi, toggleMockApi, setMockApi } from './mockConfig';
export { MockDataLoader } from './mockDataLoader';
export { mutateThenRefresh } from './postMutationRefresh';