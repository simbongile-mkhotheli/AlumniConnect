/**
 * postMutationRefresh
 * Helper to standardize the pattern: perform a mutation, then refresh a base list.
 * Especially useful in mock mode where specialized endpoints may not exist.
 */
import { shouldUseMockApi } from './useMockApi';

export interface MutationResult<T> {
  data: T | null;
  success: boolean;
  message?: string;
  error?: any;
}

type MutationFn<T> = () => Promise<MutationResult<T>> | Promise<any>;
type RefreshFn<L> = () => Promise<L> | Promise<any>;

export async function postMutationRefresh<M, L>(
  mutation: MutationFn<M>,
  refresh: RefreshFn<L>,
  options?: { skipRefreshOnFail?: boolean }
): Promise<{ mutation: MutationResult<M>; list: L | null }> {
  const mutationResult = await mutation();
  const isSuccess = mutationResult?.success !== false; // treat absence as success
  if (!isSuccess && options?.skipRefreshOnFail) {
    return { mutation: mutationResult, list: null };
  }
  try {
    const list = await refresh();
    return { mutation: mutationResult, list };
  } catch (e) {
    console.warn('postMutationRefresh: refresh failed', e);
    return { mutation: mutationResult, list: null };
  }
}

/**
 * Convenience wrapper when you only want the refreshed list if mutation succeeded
 */
export async function mutateThenRefresh<M, L>(
  mutation: MutationFn<M>,
  refresh: RefreshFn<L>
) {
  return postMutationRefresh<M, L>(mutation, refresh, { skipRefreshOnFail: true });
}

/**
 * Utility to pick a base list loader depending on mock mode.
 * If specialized loader provided but in mock mode, fallback to baseListFn.
 */
export function selectiveListLoader<L>(
  baseListFn: RefreshFn<L>,
  specializedFn?: RefreshFn<L>
): RefreshFn<L> {
  if (shouldUseMockApi()) return baseListFn;
  return specializedFn || baseListFn;
}
