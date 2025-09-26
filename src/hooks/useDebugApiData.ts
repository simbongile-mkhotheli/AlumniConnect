import { useCallback, useEffect, useState, useRef } from 'react';
import { ApiResponseValidator } from '../utils/api-response-validator';

interface UseDebugApiDataOptions {
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  debugName?: string;
}

export const useDebugApiData = <T>(
  fetchFunction: () => Promise<any>,
  dependencies: any[] = [],
  options: UseDebugApiDataOptions = {}
) => {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = true,
    debugName = 'API Data',
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchCountRef = useRef(0);
  const mountedRef = useRef(true);

  // Debug dependency changes
  const prevDependenciesRef = useRef(dependencies);
  useEffect(() => {
    const prevDeps = prevDependenciesRef.current;
    const currentDeps = dependencies;

    const depsChanged =
      prevDeps.length !== currentDeps.length ||
      prevDeps.some((dep, index) => dep !== currentDeps[index]);

    if (depsChanged) {
      console.log(`🔄 ${debugName}: Dependencies changed`, {
        previous: prevDeps,
        current: currentDeps,
        changed: depsChanged,
      });
    }

    prevDependenciesRef.current = dependencies;
  }, dependencies);

  const fetchData = useCallback(
    async (force = false) => {
      const fetchId = ++fetchCountRef.current;
      console.log(`🚀 ${debugName}: Starting fetch #${fetchId}`, {
        force,
        dependencies,
        lastFetch: new Date(lastFetch).toISOString(),
      });

      // Check cache
      const now = Date.now();
      if (!force && lastFetch && now - lastFetch < cacheTime) {
        console.log(
          `📦 ${debugName}: Using cached data (${Math.round((now - lastFetch) / 1000)}s old)`
        );
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const startTime = Date.now();
        const response = await fetchFunction();
        const endTime = Date.now();

        // Check if component is still mounted
        if (!mountedRef.current) {
          console.log(
            `⚠️ ${debugName}: Component unmounted, ignoring response`
          );
          return;
        }

        // Check if this is the latest fetch
        if (fetchId !== fetchCountRef.current) {
          console.log(
            `⚠️ ${debugName}: Fetch #${fetchId} superseded by #${fetchCountRef.current}`
          );
          return;
        }

        console.log(
          `⏱️ ${debugName}: Fetch completed in ${endTime - startTime}ms`
        );

        // Validate response
        ApiResponseValidator.logResponseDetails(response, debugName);

        if (ApiResponseValidator.validateArrayResponse(response, debugName)) {
          setData((response.data || []) as unknown as T[]);
          setLastFetch(now);
          console.log(
            `✅ ${debugName}: Data updated successfully (${response.data.length} items)`
          );
        } else {
          console.error(`❌ ${debugName}: Invalid response format`);
          setError('Invalid response format');
          setData([]);
        }
      } catch (err) {
        console.error(`❌ ${debugName}: Fetch failed:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData([]);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [...dependencies, lastFetch, cacheTime]
  );

  // Initial fetch and dependency-triggered refetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      console.log(`👁️ ${debugName}: Window focused, checking for refetch`);
      const now = Date.now();
      if (lastFetch && now - lastFetch > cacheTime) {
        console.log(`🔄 ${debugName}: Cache expired, refetching`);
        fetchData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, lastFetch, cacheTime, refetchOnWindowFocus, debugName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      console.log(`🧹 ${debugName}: Hook cleanup`);
    };
  }, [debugName]);

  // Debug state changes
  useEffect(() => {
    console.log(`📊 ${debugName}: State update`, {
      dataCount: data.length,
      loading,
      error,
      lastFetch: lastFetch ? new Date(lastFetch).toISOString() : 'never',
    });
  }, [data.length, loading, error, lastFetch, debugName]);

  const refetch = useCallback(() => {
    console.log(`🔄 ${debugName}: Manual refetch triggered`);
    return fetchData(true);
  }, [fetchData, debugName]);

  return {
    data,
    loading,
    error,
    refetch,
    lastFetch: lastFetch ? new Date(lastFetch) : null,
    fetchCount: fetchCountRef.current,
  };
};

export default useDebugApiData;
