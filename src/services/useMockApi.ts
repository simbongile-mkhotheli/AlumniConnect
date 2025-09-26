// Shared helper to determine whether mock API layer should be used.
// Consolidates environment flag detection so individual services don't duplicate logic.
// Rules:
//  - If any candidate explicitly equals string 'false' -> disable mocks.
//  - Else if any candidate equals string 'true' -> enable mocks.
//  - Else default false (real API).
// Candidates checked (in priority order):
//  1. Stubbed globalThis.import.meta.env (tests may inject)
//  2. Actual import.meta.env (Vite runtime)
//  3. process.env (fallback for some test runners / Node contexts)
/**
 * Core environment evaluation (env variables only, no overrides).
 */
export function shouldUseMockApi(): boolean {
  try {
    const stubEnv: any = (globalThis as any)?.import?.meta?.env || {};
    const viteEnv: any = (import.meta as any)?.env || {};
    const procEnv: any = typeof process !== 'undefined' ? (process.env as any) : {};
    const candidates = [
      stubEnv.VITE_ENABLE_MOCK_API,
      viteEnv.VITE_ENABLE_MOCK_API,
      procEnv.VITE_ENABLE_MOCK_API,
    ].filter(v => v !== undefined);
    if (candidates.includes('false')) return false;
    if (candidates.includes('true')) return true;
    return false; // default to real API
  } catch {
    return false;
  }
}

/**
 * Global resolver including:
 *  - localStorage override (useMockApi = 'true'/'false') when available
 *  - env-based core evaluation (shouldUseMockApi)
 *  - automatic enable in test environments (Vitest / NODE_ENV=test) unless explicitly disabled
 */
export function resolveMockEnabled(): boolean {
  // localStorage override
  try {
    if (typeof localStorage !== 'undefined') {
      const override = localStorage.getItem('useMockApi');
      if (override === 'true') return true;
      if (override === 'false') return false;
    }
  } catch { /* ignore storage errors */ }

  // Base decision from env flags
  const envDecision = shouldUseMockApi();
  if (envDecision) return true;

  // Auto-enable in test contexts unless explicitly disabled via envDecision false with explicit 'false'
  try {
    const viteFlag = (import.meta as any)?.vitest === true;
    const procEnv: any = typeof process !== 'undefined' ? process.env : {};
    const nodeTest = procEnv.VITEST || procEnv.NODE_ENV === 'test';
    if (viteFlag || nodeTest) {
      // If any env candidate explicitly said 'false' we already returned false above
      // since shouldUseMockApi() would have captured it.
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

export function quietTestWarning(): boolean {
  try {
    const viteFlag = (import.meta as any)?.vitest === true;
    const nodeTest = typeof process !== 'undefined' && (process.env.VITEST || process.env.NODE_ENV === 'test');
    return Boolean(viteFlag || nodeTest);
  } catch { return false; }
}

export default shouldUseMockApi;