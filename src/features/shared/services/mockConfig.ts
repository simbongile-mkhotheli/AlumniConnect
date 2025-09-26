/**
 * Mock API Configuration
 * Delegates the actual decision to the central helper in '@services/useMockApi',
 * while honoring a localStorage override for convenient runtime toggling.
 */
import { shouldUseMockApi as coreShouldUseMockApi } from '@services/useMockApi';

export function shouldUseMockApi(): boolean {
  // Highest priority: localStorage override (used by environment debugger/toggles)
  try {
    const override = localStorage.getItem('useMockApi');
    if (override !== null) return override === 'true';
  } catch {
    // Ignore storage access issues (e.g., SSR/tests)
  }

  // Next: new variable VITE_USE_MOCK_API, if explicitly set
  const useMock = (import.meta as any)?.env?.VITE_USE_MOCK_API;
  if (useMock === 'true') return true;
  if (useMock === 'false') return false;

  // Finally: fall back to central logic (checks VITE_ENABLE_MOCK_API and defaults to false)
  return coreShouldUseMockApi();
}

/**
 * Toggle mock API usage (for development/testing)
 */
export function toggleMockApi(): boolean {
  const current = shouldUseMockApi();
  const newValue = !current;
  localStorage.setItem('useMockApi', newValue.toString());
  return newValue;
}

/**
 * Set mock API usage explicitly
 */
export function setMockApi(useMock: boolean): void {
  localStorage.setItem('useMockApi', useMock.toString());
}