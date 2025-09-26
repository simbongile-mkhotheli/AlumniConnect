import { useEffect, useState, useCallback, useMemo } from 'react';
import { QAService } from '@features/qa/services';
import type { QAItem, FilterState } from '../types';
import { useUser } from '../contexts/UserContext';

interface UseQaFeedOptions {
  pageSize?: number;
  initialFilters?: Partial<FilterState>;
  limitQuestions?: number; // for dashboard cards
}

interface UseQaFeedResult {
  items: QAItem[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  filters: Partial<FilterState>;
  setFilters: (f: Partial<FilterState>) => void;
  setPage: (p: number) => void;
  refresh: () => Promise<void>;
  stats: {
    questions: number;
    answers: number;
    discussions: number;
    flagged: number;
    featured: number;
  } | null;
  capabilities: {
    canCreate: boolean;
    canModerate: boolean;
    canFeature: boolean;
    canAnswer: boolean;
  };
}

export function useQaFeed(options: UseQaFeedOptions = {}): UseQaFeedResult {
  const { pageSize = 10, initialFilters = {}, limitQuestions } = options;
  const [items, setItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [filters, setFiltersState] = useState<Partial<FilterState>>(initialFilters);
  const [stats, setStats] = useState<UseQaFeedResult['stats']>(null);
  const { state } = useUser();
  const user = state.user; // align with UserContext shape

  // Role-based capabilities derived from user stories (US055-US063)
  const capabilities = useMemo(() => {
    const role = user?.role || 'alumni';
    return {
      canCreate: role === 'admin', // only admin creates questions in this phase per requirement
      canModerate: role === 'admin',
      canFeature: role === 'admin',
      canAnswer: role === 'admin' || role === 'alumni' || role === 'mentor', // alumni can answer admin-posted questions (US059)
    };
  }, [user]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await QAService.getQAItems(page, pageSize, filters as FilterState);
      // Mock + real may differ; normalize to array
      const raw: any = response.data as any;
      const dataArr: QAItem[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
        ? raw.items
        : [];
      const totalCount: number = typeof raw?.total === 'number' ? raw.total : dataArr.length;
      setTotal(totalCount);

      // Optionally slice for small dashboard card preview
      const sliced = limitQuestions ? dataArr.slice(0, limitQuestions) : dataArr;
      setItems(sliced);

      // Derive lightweight stats locally for quick dashboard usage
  const questions = dataArr.filter((i: QAItem) => i.type === 'question').length;
  const answers = dataArr.filter((i: QAItem) => i.type === 'answer').length;
  const discussions = dataArr.filter((i: QAItem) => i.type === 'discussion').length;
  const flagged = dataArr.filter((i: QAItem) => (i as any).isFlagged).length;
  const featured = dataArr.filter((i: QAItem) => (i as any).isFeatured).length;
      setStats({ questions, answers, discussions, flagged, featured });
    } catch (err: any) {
      setError(err.message || 'Failed to load Q&A feed');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, limitQuestions]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const setFilters = (f: Partial<FilterState>) => {
    setPage(1);
    setFiltersState(prev => ({ ...prev, ...f }));
  };

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    loading,
    error,
    page,
    total,
    filters,
    setFilters,
    setPage,
    refresh,
    stats,
    capabilities,
  };
}

export default useQaFeed;
