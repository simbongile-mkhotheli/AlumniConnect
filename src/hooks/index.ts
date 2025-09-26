import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAppContext, type FilterState } from '../contexts/AppContext';
import { debounce, filterItems, storage } from '../utils';

/**
 * Hook for managing theme state
 */
export function useTheme() {
  const { state, dispatch } = useAppContext();

  const toggleTheme = useCallback(() => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
    storage.set('theme', newTheme);

    // Apply theme to document body
    document.body.classList.toggle('dark-theme', newTheme === 'dark');
  }, [state.theme, dispatch]);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = storage.get<'light' | 'dark'>('theme', 'light');
    if (savedTheme && savedTheme !== state.theme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
      document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    }
  }, []); // Remove dependencies to prevent infinite loop

  return {
    theme: state.theme,
    toggleTheme,
  };
}

/**
 * Hook for managing modal state
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [itemId, setItemId] = useState<string | undefined>();

  const openModal = useCallback(
    (modalMode: 'create' | 'edit' | 'view' = 'create', id?: string) => {
      console.log('useModal openModal called with:', { modalMode, id });
      console.log('Current state before update:', { isOpen, mode, itemId });

      setMode(modalMode);
      setItemId(id);
      setIsOpen(true);

      console.log('State should be updated to:', {
        isOpen: true,
        mode: modalMode,
        itemId: id,
      });

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    },
    [isOpen, mode, itemId]
  );
  const closeModal = useCallback(() => {
    console.log('useModal closeModal called');
    setIsOpen(false);
    setItemId(undefined);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  }, []);

  // Cleanup on unmount just in case modal left open
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Debug log state changes (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[useModal] state changed', { isOpen, mode, itemId });
    }
  }, [isOpen, mode, itemId]);

  return {
    isOpen,
    mode,
    itemId,
    openModal,
    closeModal,
    setMode,
    setItemId,
  };
}

/**
 * Hook for managing filters with alias support (qa -> qaItems)
 */
export function useFilters(section: string, initialFilters: FilterState = {}) {
  const resolvedSection = section === 'qa' ? 'qaItems' : section;
  const { state, dispatch } = useAppContext();
  const sectionState = state[resolvedSection as keyof typeof state] as any;

  const filters: FilterState = sectionState?.filters || initialFilters;
  const filtersRef = useRef<FilterState>(filters);

  // Keep ref in sync
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Debug logging for filter state
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[useFilters:${resolvedSection}] State updated:`, {
        sectionExists: !!sectionState,
        filters,
        sectionState: sectionState ? { ...sectionState } : null,
      });
    }
  }, [resolvedSection, filters, sectionState]);

  const updateFilters = useCallback(
    (newFilters: Partial<FilterState>) => {
      const updatedFilters = { ...filtersRef.current, ...newFilters };
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[useFilters:${resolvedSection}] Updating filters:`, {
          current: filtersRef.current,
          new: newFilters,
          updated: updatedFilters,
        });
      }
      dispatch({
        type: 'UPDATE_FILTERS',
        payload: { section: resolvedSection, filters: updatedFilters },
      });
    },
    [resolvedSection, dispatch]
  );

  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        updateFilters({ search: searchTerm });
      }, 300),
    [updateFilters]
  );

  const clearFilters = useCallback(() => {
    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { section: resolvedSection, filters: {} },
    });
  }, [resolvedSection, dispatch]);

  return {
    filters,
    updateFilters,
    updateSearch: debouncedUpdateSearch,
    clearFilters,
  };
}

/**
 * Hook for managing bulk actions with alias support (qa -> qaItems)
 */
export function useBulkActions(section: string) {
  const resolvedSection = section === 'qa' ? 'qaItems' : section;
  const { state, dispatch } = useAppContext();
  const sectionState = state[resolvedSection as keyof typeof state] as any;
  const bulkActions = sectionState?.bulkActions || {
    selectedItems: new Set<string>(),
    isVisible: false,
  };

  if (!sectionState) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[useBulkActions] Section key not found in state:', resolvedSection);
    }
  } else if (!sectionState.bulkActions) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[useBulkActions] bulkActions missing for section, providing fallback:', resolvedSection);
    }
  }

  const toggleSelection = useCallback(
    (itemId: string) => {
      dispatch({
        type: 'TOGGLE_ITEM_SELECTION',
        payload: { section: resolvedSection, itemId },
      });
    },
    [resolvedSection, dispatch]
  );

  const selectAll = useCallback(
    (itemIds: string[]) => {
      dispatch({
        type: 'SELECT_ALL_ITEMS',
        payload: { section: resolvedSection, itemIds },
      });
    },
    [resolvedSection, dispatch]
  );

  const clearSelections = useCallback(() => {
    dispatch({
      type: 'CLEAR_SELECTIONS',
      payload: { section: resolvedSection },
    });
  }, [resolvedSection, dispatch]);

  const performBulkAction = useCallback(
    (action: string) => {
      const selectedIds = Array.from(bulkActions.selectedItems);
      console.log(`Performing ${action} on items:`, selectedIds);
      // Action-specific logic would go here. For now, just clear.
      clearSelections();
    },
    [bulkActions.selectedItems, clearSelections]
  );

  return {
    selectedItems: bulkActions.selectedItems,
    isVisible: bulkActions.isVisible,
    selectedCount: bulkActions.selectedItems.size,
    toggleSelection,
    selectAll,
    clearSelections,
    performBulkAction,
  };
}

/**
 * Hook for managing filtered and sorted data
 */
export function useFilteredData<T extends Record<string, any>>(
  data: T[],
  filters: FilterState,
  searchFields: string[] = ['title', 'name'],
  sortField: string = 'createdAt',
  sortDirection: 'asc' | 'desc' = 'desc'
) {
  return useMemo(() => {
    // Convert FilterState to Record<string, string | undefined> for filterItems
    const filterRecord: Record<string, string | undefined> = {
      status: filters.status,
      type: filters.type,
      category: filters.category,
      location: filters.location,
      sponsor: filters.sponsor,
      search: filters.search,
      tier: filters.tier,
      level: filters.level,
      performance: filters.performance,
      employment: filters.employment,
      role: filters.role,
    };

    let filteredData = filterItems(data, filterRecord, searchFields);

    // Sort data
    filteredData = filteredData.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filteredData;
  }, [data, filters, searchFields, sortField, sortDirection]);
}

/**
 * Hook for managing form state
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []); // Remove errors dependency

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback(
    (field: keyof T, value: any) => {
      if (validationRules && validationRules[field]) {
        const error = validationRules[field]!(value);
        setErrors(prev => ({ ...prev, [field]: error || undefined }));
        return !error;
      }
      return true;
    },
    [validationRules]
  );

  const validateForm = useCallback(() => {
    if (!validationRules) return true;

    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    Object.keys(validationRules).forEach(field => {
      const fieldKey = field as keyof T;
      const error = validationRules[fieldKey]!(values[fieldKey]);
      if (error) {
        newErrors[fieldKey] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isFieldInvalid = useCallback(
    (field: keyof T) => {
      return touched[field] && !!errors[field];
    },
    [touched, errors]
  );

  return {
    values,
    errors,
    touched,
    setValue,
    setValues,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    isFieldInvalid,
    isValid: Object.keys(errors).length === 0,
  };
}

/**
 * Hook for managing local storage state
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = storage.get(key, defaultValue);
    return stored !== null ? stored : defaultValue;
  });

  const setStoredValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue(prevValue => {
        const valueToStore =
          newValue instanceof Function ? newValue(prevValue) : newValue;
        storage.set(key, valueToStore);
        return valueToStore;
      });
    },
    [key]
  ); // Remove value dependency

  return [value, setStoredValue] as const;
}

/**
 * Hook for handling click outside element
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler, enabled]);
}

/**
 * Hook for managing async operations
 */
export function useAsync<T, E = Error>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err as E);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    error,
    loading,
    execute,
    reset,
  };
}

/**
 * Enhanced hook for API data fetching with caching and loading states
 */
export function useApiData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    enabled?: boolean;
    cacheKey?: string;
    cacheDuration?: number; // in milliseconds
    refetchOnWindowFocus?: boolean;
    retryCount?: number;
    retryDelay?: number;
  } = {}
) {
  const {
    enabled = true,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    refetchOnWindowFocus = false,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const retryCountRef = useRef(0);
  const fetchFunctionRef = useRef(fetchFunction);

  // Update the ref when fetchFunction changes
  fetchFunctionRef.current = fetchFunction;

  // Check cache first
  const getCachedData = useCallback(() => {
    if (!cacheKey) return null;

    const cached = storage.get<{ data: T; timestamp: number }>(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data;
    }
    return null;
  }, [cacheKey, cacheDuration]);

  // Cache data
  const setCachedData = useCallback(
    (newData: T) => {
      if (cacheKey) {
        storage.set(cacheKey, {
          data: newData,
          timestamp: Date.now(),
        });
      }
    },
    [cacheKey]
  );

  // Fetch data with retry logic
  const fetchData = useCallback(
    async (isRetry = false) => {
      if (!enabled) return;

      // Check cache first
      const cachedData = getCachedData();
      if (cachedData && !isRetry) {
        setData(cachedData);
        setLastFetch(Date.now());
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchFunctionRef.current();
        setData(result);
        setCachedData(result);
        setLastFetch(Date.now());
        retryCountRef.current = 0;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error('Unknown error');

        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          setTimeout(() => {
            fetchData(true);
          }, retryDelay * retryCountRef.current);
        } else {
          setError(errorObj);
          retryCountRef.current = 0;
        }
      } finally {
        setLoading(false);
      }
    },
    [enabled, getCachedData, setCachedData, retryCount, retryDelay]
  );

  // Refetch function
  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Initial fetch - use a ref to track if we've already fetched
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
  }, []); // Empty dependency array for initial fetch only

  // Handle dependencies changes
  useEffect(() => {
    if (hasFetchedRef.current) {
      fetchData();
    }
  }, dependencies);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (lastFetch && Date.now() - lastFetch > 30000) {
        // 30 seconds
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, lastFetch, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    lastFetch,
  };
}

/**
 * Hook for API mutations (create, update, delete)
 */
export function useMutation<TData, TVariables = void>(
  mutationFunction: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (
      data: TData | null,
      error: Error | null,
      variables: TVariables
    ) => void;
  } = {}
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to store the latest values without causing re-renders
  const dataRef = useRef<TData | null>(null);
  const errorRef = useRef<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setLoading(true);
      setError(null);
      errorRef.current = null;

      try {
        const result = await mutationFunction(variables);
        setData(result);
        dataRef.current = result;
        options.onSuccess?.(result, variables);
        return result;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error('Unknown error');
        setError(errorObj);
        errorRef.current = errorObj;
        options.onError?.(errorObj, variables);
        throw errorObj;
      } finally {
        setLoading(false);
        options.onSettled?.(dataRef.current, errorRef.current, variables);
      }
    },
    [mutationFunction, options.onSuccess, options.onError, options.onSettled]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    dataRef.current = null;
    errorRef.current = null;
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}

/**
 * Hook for infinite/paginated queries
 */
export function useInfiniteQuery<T>(
  fetchFunction: (
    page: number,
    limit: number
  ) => Promise<{ data: T[]; hasNext: boolean; total: number }>,
  options: {
    limit?: number;
    enabled?: boolean;
    cacheKey?: string;
  } = {}
) {
  const { limit = 20, enabled = true, cacheKey } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasNext, setHasNext] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchFunctionRef = useRef(fetchFunction);
  fetchFunctionRef.current = fetchFunction;

  const fetchPage = useCallback(
    async (pageNum: number, append = false) => {
      if (!enabled) return;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setData([]);
      }

      setError(null);

      try {
        const result = await fetchFunctionRef.current(pageNum, limit);

        if (append) {
          setData(prev => [...prev, ...result.data]);
        } else {
          setData(result.data);
        }

        setHasNext(result.hasNext);
        setTotal(result.total);
        setPage(pageNum);

        // Cache if key provided
        if (cacheKey && !append) {
          storage.set(`${cacheKey}_page_${pageNum}`, {
            data: result.data,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [enabled, limit, cacheKey]
  );

  const fetchNextPage = useCallback(() => {
    if (hasNext && !loadingMore) {
      fetchPage(page + 1, true);
    }
  }, [hasNext, loadingMore, page, fetchPage]);

  const refetch = useCallback(() => {
    setPage(1);
    fetchPage(1, false);
  }, [fetchPage]);

  // Initial fetch
  useEffect(() => {
    fetchPage(1, false);
  }, [enabled]); // Only depend on enabled

  return {
    data,
    loading,
    loadingMore,
    error,
    hasNext,
    page,
    total,
    fetchNextPage,
    refetch,
  };
}
