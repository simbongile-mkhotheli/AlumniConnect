/**
 * Post Mutation Refresh Service
 * Provides utilities for refreshing data after mutations
 */

export const mutateThenRefresh = async <T>(
  mutationFn: () => Promise<T>,
  refreshFn?: () => Promise<void>
): Promise<T> => {
  const result = await mutationFn();
  
  if (refreshFn) {
    await refreshFn();
  }
  
  return result;
};