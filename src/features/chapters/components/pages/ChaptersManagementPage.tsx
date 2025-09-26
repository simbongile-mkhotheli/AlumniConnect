// src/components/pages/ChaptersManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFilters,
  useBulkActions,
  useApiData,
  useMutation,
} from '../../../../hooks';
import { ChaptersService } from '@features/chapters/services';
import { LoadingSpinner, CardSkeleton } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage, EmptyState } from '../../../../components/common/ErrorMessage';
import type { Chapter, ApiResponse } from '@features/chapters/types';

/**
 * ChaptersManagementPage
 * - Defensive property access to avoid runtime errors
 * - Normalizes differing chapter field names via helper getters
 * - Fixed TypeScript typing for mutation that may return void (delete)
 */

export const ChaptersManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const { filters, updateFilters } = useFilters('chapters', {
    status: '',
    location: '',
    performance: '',
    search: '',
  });

  const {
    selectedItems,
    isVisible: isBulkVisible,
    toggleSelection,
    selectAll,
    clearSelections,
  } = useBulkActions('chapters');

  const {
    data: chaptersResponse,
    loading,
    error,
    refetch,
  } = useApiData(() => ChaptersService.getChapters(1, 50, filters), [filters], {
    cacheKey: 'chapters-list',
    cacheDuration: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Bulk operations mutation
  const bulkMutation = useMutation(
    ({ operation, ids }: { operation: string; ids: string[] }) =>
      ChaptersService.bulkOperation(
        operation as 'activate' | 'deactivate' | 'delete',
        ids
      ),
    {
      onSuccess: () => {
        refetch();
        clearSelections();
      },
      onError: err => console.error('Bulk operation failed:', err),
    }
  );

  // Individual chapter operations
  // Ensure the mutation always returns ApiResponse<any> (consistent return type for TS)
  const chapterMutation = useMutation(
    async ({
      action,
      chapterId,
    }: {
      action: string;
      chapterId: string;
    }): Promise<ApiResponse<any>> => {
      switch (action) {
        case 'activate':
          return (await ChaptersService.activateChapter(
            chapterId
          )) as ApiResponse<any>;
        case 'deactivate':
          return (await ChaptersService.deactivateChapter(
            chapterId
          )) as ApiResponse<any>;
        case 'delete':
          return (await ChaptersService.deleteChapter(
            chapterId
          )) as ApiResponse<any>;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    },
    {
      onSuccess: () => {
        refetch();
      },
      onError: err => console.error('Chapter operation failed:', err),
    }
  );

  const handleCreateChapter = () => {
    navigate('/admin/chapters/create');
  };

  const handleClose = () => {
    navigate('/admin');
  };

  const chapters = chaptersResponse?.data ?? [];
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);

  // Helper normalizers & safe getters
  const normalizeText = (v?: string) => (v ?? '').toString();
  const normalizeRegionSlug = (regionOrLocation?: string) =>
    normalizeText(regionOrLocation).toLowerCase().replace(/\s+/g, '-');

  const getLeadName = (chapter: Chapter) =>
    // Try common shapes: leaders array, leadName property, fallback to dash
    (
      (chapter as any).leaders?.[0]?.name ??
      (chapter as any).leadName ??
      '—'
    ).toString();

  const getMembersCount = (chapter: Chapter) =>
    typeof (chapter as any).membersCount === 'number'
      ? (chapter as any).membersCount
      : typeof (chapter as any).memberCount === 'number'
        ? (chapter as any).memberCount
        : 0;

  const getEventsCount = (chapter: Chapter) =>
    typeof (chapter as any).eventsCount === 'number'
      ? (chapter as any).eventsCount
      : typeof (chapter as any).eventsThisMonth === 'number'
        ? (chapter as any).eventsThisMonth
        : 0;

  const getPerformance = (chapter: Chapter) =>
    (chapter as any).performance ?? 'medium';
  const getEngagementRate = (chapter: Chapter) =>
    typeof (chapter as any).engagementRate === 'number'
      ? (chapter as any).engagementRate
      : 0;

  // Client-side filters applied to cached data
  useEffect(() => {
    let filtered = [...chapters];

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(
        ch => (ch.status ?? '').toString() === filters.status
      );
    }

    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(ch => {
        const regionOrLocation =
          (ch as any).region ?? (ch as any).location ?? '';
        return normalizeRegionSlug(regionOrLocation) === filters.location;
      });
    }

    if (filters.performance && filters.performance !== 'all') {
      filtered = filtered.filter(
        ch => getPerformance(ch) === filters.performance
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(ch => {
        const name = (ch.name ?? '').toString().toLowerCase();
        const location = ((ch as any).location ?? (ch as any).region ?? '')
          .toString()
          .toLowerCase();
        const lead = getLeadName(ch).toLowerCase();
        const description = ((ch as any).description ?? '')
          .toString()
          .toLowerCase();
        const tags = (ch as any).tags ?? [];
        const tagsMatch =
          Array.isArray(tags) &&
          tags.some((t: any) => t?.toString().toLowerCase().includes(q));

        return (
          name.includes(q) ||
          location.includes(q) ||
          lead.includes(q) ||
          description.includes(q) ||
          tagsMatch
        );
      });
    }

    setFilteredChapters(filtered);
  }, [filters, chapters]);

  // Actions
  const handleBulkAction = async (action: string) => {
    const selectedIds = Array.from(selectedItems) as string[];
    if (selectedIds.length === 0) return;
    
    // Show confirmation dialog for destructive actions
    if (action === 'delete') {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete ${selectedIds.length} chapter${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`
      );
      if (!confirmed) return;
    }
    
    try {
      await bulkMutation.mutate({ operation: action, ids: selectedIds });
    } catch (err) {
      console.error(`Bulk ${action} failed:`, err);
    }
  };

  const handleChapterAction = async (action: string, chapterId: string) => {
    switch (action) {
      case 'edit':
        navigate(`/admin/chapters/edit/${chapterId}`);
        break;
      case 'view':
        navigate(`/admin/chapters/view/${chapterId}`);
        break;
      case 'analytics':
        console.log('Opening analytics for chapter:', chapterId);
        break;
      case 'members':
        console.log('Opening members for chapter:', chapterId);
        break;
      case 'activate':
      case 'deactivate':
      case 'delete':
        // Show confirmation dialog for delete action
        const confirmed = window.confirm(
          `Are you sure you want to permanently delete this chapter? This action cannot be undone.`
        );
        if (!confirmed) return;
        
        try {
          await chapterMutation.mutate({ action, chapterId });
        } catch (err) {
          console.error(`${action} chapter failed:`, err);
        }
        break;
      default:
        console.log(`${action} chapter:`, chapterId);
    }
  };

  // Badge helpers
  const getPerformanceBadgeClass = (performance: string) => {
    switch (performance) {
      case 'high':
        return 'high-performance';
      case 'medium':
        return 'medium-performance';
      case 'low':
        return 'low-performance';
      default:
        return 'medium-performance';
    }
  };

  const getPerformanceLabel = (performance: string) => {
    switch (performance) {
      case 'high':
        return 'High Performance';
      case 'medium':
        return 'Medium Performance';
      case 'low':
        return 'Low Performance';
      default:
        return 'Medium Performance';
    }
  };

  // Summary helpers
  const calculateTotalMembers = () =>
    chapters.reduce((sum, c) => sum + getMembersCount(c), 0);
  const calculateTotalEvents = () =>
    chapters.reduce((sum, c) => sum + getEventsCount(c), 0);
  const calculateAvgEngagement = () => {
    if (!chapters.length) return 0;
    const total = chapters.reduce((sum, c) => sum + getEngagementRate(c), 0);
    return Math.round(total / chapters.length);
  };

  // Loading UI
  if (loading && !chapters.length) {
    return (
      <div className="chapters-overlay active">
        <div className="chapters-manager">
          <div className="chapters-header">
            <h2 className="chapters-title">Regional Chapters Manager</h2>
          </div>
          <div className="chapters-body">
            <div className="chapters-summary">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} className="summary-card" />
              ))}
            </div>
            <div className="chapters-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error UI
  if (error && !chapters.length) {
    return (
      <div className="chapters-overlay active">
        <div className="chapters-manager">
          <div className="chapters-header">
            <h2 className="chapters-title">Regional Chapters Manager</h2>
          </div>
          <div className="chapters-body">
            <ErrorMessage
              error={error}
              title="Failed to load chapters"
              showRetry
              onRetry={refetch}
              variant="card"
            />
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && filteredChapters.length === 0 && !error) {
    return (
      <div className="chapters-overlay active">
        <div className="chapters-manager">
          <div className="chapters-header">
            <h2 className="chapters-title">Regional Chapters Manager</h2>
          </div>
          <div className="chapters-body">
            <EmptyState
              title="No chapters found"
              description="No chapters match your current filters. Try adjusting your search criteria."
              action={undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="chapters-overlay active">
      <div className="chapters-manager">
        <div className="chapters-header">
          <h2 className="chapters-title">Regional Chapters Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {loading && <LoadingSpinner size="small" />}
            <button
              className="btn btn-primary"
              onClick={handleCreateChapter}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ➕ Create Chapter
            </button>
            <button
              className="close-btn"
              onClick={handleClose}
              style={{
                padding: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ❌
            </button>
          </div>
        </div>

        <div className="chapters-body">
          {/* Summary */}
          <div className="chapters-summary">
            <div className="summary-card">
              <div className="summary-value">{chapters.length}</div>
              <div className="summary-label">Total Chapters</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{calculateTotalMembers()}</div>
              <div className="summary-label">Active Members</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{calculateTotalEvents()}</div>
              <div className="summary-label">Monthly Events</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{calculateAvgEngagement()}%</div>
              <div className="summary-label">Avg Engagement</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {/* Use 'pending' as the "new" indicator (your Chapter type doesn't contain 'new') */}
                {chapters.filter(c => (c.status ?? '') === 'pending').length}
              </div>
              <div className="summary-label">New This Quarter</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">94%</div>
              <div className="summary-label">Retention Rate</div>
            </div>
          </div>

          {/* Filters */}
          <div className="chapter-filters">
            <div className="filter-group">
              <label className="filter-label">Status:</label>
              <select
                className="filter-select"
                value={filters.status ?? ''}
                onChange={e => updateFilters({ status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Location:</label>
              <select
                className="filter-select"
                value={filters.location ?? ''}
                onChange={e => updateFilters({ location: e.target.value })}
              >
                <option value="">All Locations</option>
                <option value="western-cape">Western Cape</option>
                <option value="gauteng">Gauteng</option>
                <option value="kwazulu-natal">KwaZulu-Natal</option>
                <option value="eastern-cape">Eastern Cape</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Performance:</label>
              <select
                className="filter-select"
                value={filters.performance ?? ''}
                onChange={e => updateFilters({ performance: e.target.value })}
              >
                <option value="">All Performance</option>
                <option value="high">High Engagement (80%+)</option>
                <option value="medium">Medium Engagement (60-79%)</option>
                <option value="low">Low Engagement (&lt;60%)</option>
              </select>
            </div>

            <input
              type="text"
              className="search-input"
              placeholder="Search chapters..."
              value={filters.search ?? ''}
              onChange={e => updateFilters({ search: e.target.value })}
            />
          </div>

          {/* Bulk Actions */}
          <div className={`bulk-actions ${isBulkVisible ? '' : 'hidden'}`}>
            <label className="bulk-select-all">
              <input
                type="checkbox"
                checked={
                  selectedItems.size > 0 &&
                  selectedItems.size === filteredChapters.length &&
                  filteredChapters.length > 0
                }
                onChange={() => selectAll(filteredChapters.map(c => c.id))}
              />{' '}
              Select All
            </label>

            <button
              className="bulk-action-btn publish"
              onClick={() => handleBulkAction('activate')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '✅'}{' '}
              Activate Selected
            </button>

            <button
              className="bulk-action-btn draft"
              onClick={() => handleBulkAction('deactivate')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '⏸️'}{' '}
              Deactivate Selected
            </button>

            <button
              className="bulk-action-btn delete"
              onClick={() => handleBulkAction('delete')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '🗑️'}{' '}
              Delete Selected
            </button>
          </div>

          {bulkMutation.error && (
            <ErrorMessage
              error={bulkMutation.error}
              title="Bulk operation failed"
              variant="banner"
              size="small"
            />
          )}

          {/* Chapters Grid */}
          <div className="chapters-grid">
            {filteredChapters.map(chapter => {
              const regionSlug = normalizeRegionSlug(
                (chapter as any).region ?? (chapter as any).location
              );
              const performance = getPerformance(chapter);

              return (
                <div
                  key={chapter.id}
                  className={`chapter-card ${selectedItems.has(chapter.id) ? 'selected' : ''}`}
                  data-status={(chapter.status ?? '').toString()}
                  data-location={regionSlug}
                  data-performance={performance}
                >
                  <input
                    type="checkbox"
                    className="chapter-checkbox"
                    checked={selectedItems.has(chapter.id)}
                    onChange={() => toggleSelection(chapter.id)}
                  />

                  <div className="chapter-card-header">
                    <div className="chapter-card-title">
                      {chapter.name ?? '—'}
                    </div>
                    <div className="chapter-card-location">
                      📍{' '}
                      {(chapter as any).location ??
                        (chapter as any).region ??
                        '—'}
                    </div>
                  </div>

                  <div className="chapter-card-body">
                    <div className="chapter-card-lead">
                      👤 Lead: {getLeadName(chapter)}
                    </div>

                    <div className="chapter-card-stats">
                      <div className="chapter-stat">
                        <div className="chapter-stat-icon" />
                        {getMembersCount(chapter)} Members
                      </div>
                      <div className="chapter-stat">
                        <div className="chapter-stat-icon" />
                        {getEngagementRate(chapter)}% Engagement
                      </div>
                      <div className="chapter-stat">
                        <div className="chapter-stat-icon" />
                        {getEventsCount(chapter)} Events/Month
                      </div>
                    </div>

                    <div className="chapter-card-badges">
                      <span
                        className={`chapter-badge ${(chapter.status ?? '').toString()}`}
                      >
                        {(chapter.status ?? 'Unknown')
                          .toString()
                          .charAt(0)
                          .toUpperCase() +
                          (chapter.status ?? 'Unknown').toString().slice(1)}
                      </span>

                      {(chapter as any).isSponsored &&
                        (chapter as any).sponsor && (
                          <span className="chapter-badge sponsored">
                            Sponsored by {(chapter as any).sponsor}
                          </span>
                        )}

                      <span
                        className={`chapter-badge ${getPerformanceBadgeClass(performance)}`}
                      >
                        {getPerformanceLabel(performance)}
                      </span>
                    </div>

                    <div className="chapter-card-actions">
                      <button
                        className="chapter-action-btn primary"
                        onClick={() => handleChapterAction('edit', chapter.id)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="chapter-action-btn secondary"
                        onClick={() => handleChapterAction('view', chapter.id)}
                      >
                        👁️ View
                      </button>
                      <button
                        className="chapter-action-btn secondary"
                        onClick={() =>
                          handleChapterAction('analytics', chapter.id)
                        }
                      >
                        📊 Analytics
                      </button>
                      <button
                        className="chapter-action-btn secondary"
                        onClick={() =>
                          handleChapterAction('members', chapter.id)
                        }
                      >
                        👥 Members
                      </button>
                      <button
                        className="chapter-action-btn danger"
                        onClick={() =>
                          handleChapterAction('delete', chapter.id)
                        }
                        disabled={chapterMutation.loading}
                      >
                        {chapterMutation.loading ? (
                          <LoadingSpinner size="small" />
                        ) : (
                          '🗑️'
                        )}{' '}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChaptersManagementPage;
