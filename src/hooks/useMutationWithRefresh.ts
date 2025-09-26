import { useState, useCallback } from 'react';
import { mutateThenRefresh } from '../services/postMutationRefresh';

interface MutationState<M, L> {
  isLoading: boolean;
  error: string | null;
  mutationResult: M | null;
  list: L | null;
}

interface UseMutationWithRefreshOptions<M, L> {
  onSuccess?(ctx: { mutation: M | null; list: L | null }): void;
  onError?(error: any): void;
  autoRefresh?: boolean; // default true
}

export function useMutationWithRefresh<M, L = any>(
  mutationFn: () => Promise<any>,
  refreshFn: () => Promise<any>,
  options?: UseMutationWithRefreshOptions<M, L>
) {
  const { onSuccess, onError, autoRefresh = true } = options || {};
  const [state, setState] = useState<MutationState<M, L>>({
    isLoading: false,
    error: null,
    mutationResult: null,
    list: null,
  });

  const run = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      if (autoRefresh) {
        const { mutation, list } = await mutateThenRefresh<M, L>(mutationFn, refreshFn);
        // IMPORTANT: Do NOT unwrap .data here. Several editor pages rely on the ApiResponse shape
        // (expecting a `success` boolean). Unwrapping caused them to treat successful saves as failures
        // because the domain object lacks a `success` flag, triggering repeated "Failed to save" toasts.
        setState({
          isLoading: false,
            error: null,
            mutationResult: mutation as M,
            list: list as L,
        });
        onSuccess?.({ mutation: mutation as M, list: list as L });
        return { mutation, list };
      } else {
        const mutation = await mutationFn();
        setState({ isLoading: false, error: null, mutationResult: (mutation as any), list: null });
        onSuccess?.({ mutation: (mutation as any), list: null });
        return { mutation, list: null };
      }
    } catch (e: any) {
      setState(s => ({ ...s, isLoading: false, error: e?.message || 'Mutation failed' }));
      onError?.(e);
      return { mutation: null, list: null };
    }
  }, [mutationFn, refreshFn, autoRefresh, onSuccess, onError]);

  return { ...state, run };
}