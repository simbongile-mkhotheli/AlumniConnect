// src/components/spotlights/SpotlightsManagementPage.tsx
// Full, ready-to-paste file with defensive checks and small cleanup.
// Inline comments explain the fixes (especially to avoid runtime errors like `charAt` on undefined).

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFilters,
  useBulkActions,
  useApiData,
  useMutation,
} from '../../hooks';
import { SpotlightsService } from '../../services/spotlightsService';
import { LoadingSpinner, CardSkeleton } from '../common/LoadingSpinner';
import { ErrorMessage, EmptyState } from '../common/ErrorMessage';
import type { Spotlight } from '../../types';

export const SpotlightsManagementPage: React.FC = () => {
  const navigate = useNavigate();

  // Filters hook - default values
  const { filters, updateFilters, updateSearch } = useFilters('spotlights', {
    status: '',
    type: '',
    search: '',
  });

  // Bulk actions hook (returns a Set or similar for selected ids)
  const {
    selectedItems,
    isVisible: isBulkVisible,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelections,
  } = useBulkActions('spotlights');

  // Fetch spotlights (page, limit, filters) using app's useApiData hook
  const {
    data: spotlightsResponse,
    loading,
    error,
    refetch,
  } = useApiData(
    () => SpotlightsService.getSpotlights(1, 50, filters),
    [filters],
    {
      cacheKey: 'spotlights-list',
      cacheDuration: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
    }
  );

  // Bulk mutation (publish / archive / feature)
  const bulkMutation = useMutation(
    ({ operation, ids }: { operation: string; ids: string[] }) =>
      SpotlightsService.bulkOperation(
        operation as 'publish' | 'archive' | 'feature',
        ids
      ),
    {
      onSuccess: () => {
        refetch();
        clearSelections();
      },
      onError: err => {
        console.error('Bulk operation failed:', err);
      },
    }
  );

  // Individual spotlight operations mutation
  const spotlightMutation = useMutation(
    ({
      action,
      spotlightId,
    }: {
      action: string;
      spotlightId: string;
    }): Promise<any> => {
      switch (action) {
        case 'publish':
          return SpotlightsService.publishSpotlight(spotlightId);
        case 'unpublish':
          return SpotlightsService.unpublishSpotlight(spotlightId);
        case 'archive':
          return SpotlightsService.archiveSpotlight(spotlightId);
        case 'feature':
          return SpotlightsService.featureSpotlight(spotlightId);
        case 'unfeature':
          return SpotlightsService.unfeatureSpotlight(spotlightId);
        case 'delete':
          return SpotlightsService.deleteSpotlight(spotlightId);
        default:
          return Promise.reject(new Error(`Unknown action: ${action}`));
      }
    },
    {
      onSuccess: () => {
        refetch();
      },
      onError: err => {
        console.error('Spotlight operation failed:', err);
      },
    }
  );

  // Response/data handling with safe fallbacks
  const spotlights = (
    spotlightsResponse && Array.isArray(spotlightsResponse.data)
      ? spotlightsResponse.data
      : []
  ) as Spotlight[];
  const [filteredSpotlights, setFilteredSpotlights] = useState<Spotlight[]>([]);

  // Defensive: helper to safely read string fields
  const safeString = (input: any) =>
    input === undefined || input === null ? '' : String(input);

  // Client-side filtering (safe guards to avoid runtime errors)
  useEffect(() => {
    let filtered = spotlights.slice();

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(
        spotlight => safeString(spotlight.status) === filters.status
      );
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(
        spotlight => safeString(spotlight.type) === filters.type
      );
    }

    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(spotlight => {
        const title = safeString(spotlight.title).toLowerCase();
        // handle different possible name fields in seed / API
        const name = safeString(
          spotlight.featuredAlumniName || spotlight.person || spotlight.author
        ).toLowerCase();
        const content = safeString(
          spotlight.content || spotlight.shortDescription
        ).toLowerCase();
        const tags = Array.isArray(spotlight.tags) ? spotlight.tags : [];
        const tagsMatch = tags.some(tag =>
          safeString(tag).toLowerCase().includes(searchLower)
        );
        return (
          title.includes(searchLower) ||
          name.includes(searchLower) ||
          content.includes(searchLower) ||
          tagsMatch
        );
      });
    }

    setFilteredSpotlights(filtered);
  }, [filters, spotlights]);

  // Bulk action handler
  const handleBulkAction = async (action: string) => {
    const selectedIds = Array.from(selectedItems) as string[];
    if (!selectedIds || selectedIds.length === 0) return;

    try {
      await bulkMutation.mutate({ operation: action, ids: selectedIds });
    } catch (err) {
      console.error(`Bulk ${action} failed:`, err);
    }
  };

  // Individual spotlight action handler
  const handleSpotlightAction = async (action: string, spotlightId: string) => {
    switch (action) {
      case 'edit':
        navigate(`/admin/spotlights/edit/${spotlightId}`);
        break;
      case 'view':
        navigate(`/admin/spotlights/view/${spotlightId}`);
        break;
      case 'preview':
        // preview behavior - optional
        console.log('Preview spotlight:', spotlightId);
        break;
      case 'publish':
      case 'unpublish':
      case 'archive':
      case 'feature':
      case 'unfeature':
      case 'delete':
        try {
          await spotlightMutation.mutate({ action, spotlightId });
        } catch (err) {
          console.error(`${action} spotlight failed:`, err);
        }
        break;
      default:
        console.log('Unhandled action:', action);
    }
  };

  // Presentational helpers (unchanged)
  const getStatusBadgeClass = (status?: string) => {
    const s = safeString(status);
    switch (s) {
      case 'published':
        return 'published';
      case 'draft':
        return 'draft';
      case 'scheduled':
        return 'scheduled';
      case 'archived':
        return 'archived';
      default:
        return 'draft';
    }
  };

  const getTypeDisplayName = (type?: string) => {
    switch (safeString(type)) {
      case 'success_story':
        return 'Success Story';
      case 'achievement':
        return 'Achievement';
      case 'video_interview':
        return 'Interview';
      case 'tutorial':
        return 'Project';
      default:
        return 'Announcement';
    }
  };

  const getSpotlightIcon = (type?: string) => {
    switch (safeString(type)) {
      case 'success_story':
        return '👤';
      case 'achievement':
        return '🚀';
      case 'video_interview':
        return '🎤';
      case 'tutorial':
        return '📚';
      default:
        return '📢';
    }
  };

  const getCategoryFromType = (type?: string) => {
    switch (safeString(type)) {
      case 'success_story':
        return 'Career';
      case 'achievement':
        return 'Entrepreneurship';
      case 'video_interview':
        return 'Leadership';
      case 'tutorial':
        return 'Technical';
      default:
        return 'General';
    }
  };

  // Format date with safe fallbacks
  const formatDate = (dateString: any, status?: string) => {
    const ds = safeString(dateString);
    if (!ds) return 'Date unknown';

    const date = new Date(ds);
    if (isNaN(date.getTime())) return 'Date unknown';

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (safeString(status) === 'draft') {
      if (diffDays === 1) return 'Draft created 1 day ago';
      if (diffDays < 7) return `Draft created ${diffDays} days ago`;
      if (diffDays < 14) return 'Draft created 1 week ago';
      return `Draft created ${Math.floor(diffDays / 7)} weeks ago`;
    }

    if (diffDays === 1) return 'Published 1 day ago';
    if (diffDays < 7) return `Published ${diffDays} days ago`;
    if (diffDays < 14) return 'Published 1 week ago';
    return `Published ${Math.floor(diffDays / 7)} weeks ago`;
  };

  // Loading state: show skeletons while initial load and no data present
  if (loading && !spotlights.length) {
    return (
      <div className="overlay active">
        <div className="spotlights-manager">
          <div className="spotlights-header">
            <h2 className="spotlights-title">Spotlights Manager</h2>
          </div>
          <div className="spotlights-body">
            <div className="spotlights-summary">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} className="spotlight-summary-card" />
              ))}
            </div>
            <div className="spotlights-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !spotlights.length) {
    return (
      <div className="overlay active">
        <div className="spotlights-manager">
          <div className="spotlights-header">
            <h2 className="spotlights-title">Spotlights Manager</h2>
          </div>
          <div className="spotlights-body">
            <ErrorMessage
              error={error}
              title="Failed to load spotlights"
              showRetry
              onRetry={refetch}
              variant="card"
            />
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no filtered results
  if (!loading && filteredSpotlights.length === 0 && !error) {
    return (
      <div className="overlay active">
        <div className="spotlights-manager">
          <div className="spotlights-header">
            <h2 className="spotlights-title">Spotlights Manager</h2>
          </div>
          <div className="spotlights-body">
            <EmptyState
              title="No spotlights found"
              description="No spotlights match your current filters. Try adjusting your search criteria."
              action={undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  const handleCreateSpotlight = () => {
    navigate('/admin/spotlights/create');
  };

  const handleClose = () => {
    navigate('/admin');
  };

  // Main render
  return (
    <div className="overlay active">
      <div className="spotlights-manager">
        <div className="spotlights-header">
          <h2 className="spotlights-title">Spotlights Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {loading && <LoadingSpinner size="small" />}
            <button
              className="btn btn-primary"
              onClick={handleCreateSpotlight}
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
              ➕ Create Spotlight
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

        <div className="spotlights-body">
          {/* Summary */}
          <div className="spotlights-summary">
            <div className="spotlight-summary-card">
              <div className="spotlight-summary-value">{spotlights.length}</div>
              <div className="spotlight-summary-label">Total Spotlights</div>
            </div>
            <div className="spotlight-summary-card">
              <div className="spotlight-summary-value">
                {
                  spotlights.filter(s => safeString(s.status) === 'published')
                    .length
                }
              </div>
              <div className="spotlight-summary-label">Published</div>
            </div>
            <div className="spotlight-summary-card">
              <div className="spotlight-summary-value">
                {
                  spotlights.filter(s => safeString(s.status) === 'draft')
                    .length
                }
              </div>
              <div className="spotlight-summary-label">Draft</div>
            </div>
            <div className="spotlight-summary-card">
              <div className="spotlight-summary-value">
                {
                  spotlights.filter(s => safeString(s.status) === 'scheduled')
                    .length
                }
              </div>
              <div className="spotlight-summary-label">Scheduled</div>
            </div>
            <div className="spotlight-summary-card">
              <div className="spotlight-summary-value">
                {spotlights.reduce(
                  (sum, s) =>
                    sum + (typeof s.viewCount === 'number' ? s.viewCount : 0),
                  0
                )}
              </div>
              <div className="spotlight-summary-label">Total Views</div>
            </div>
            <div className="spotlight-summary-card">
              <div className="spotlight-summary-value">
                {spotlights.reduce(
                  (sum, s) =>
                    sum + (typeof s.likeCount === 'number' ? s.likeCount : 0),
                  0
                )}
              </div>
              <div className="spotlight-summary-label">Engagements</div>
            </div>
          </div>

          {/* Filters */}
          <div className="spotlight-filters">
            <div className="spotlight-filter-group">
              <label className="spotlight-filter-label">Status:</label>
              <select
                className="spotlight-filter-select"
                value={filters.status}
                onChange={e => updateFilters({ status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="spotlight-filter-group">
              <label className="spotlight-filter-label">Type:</label>
              <select
                className="spotlight-filter-select"
                value={filters.type}
                onChange={e => updateFilters({ type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="success_story">Success Story</option>
                <option value="achievement">Achievement</option>
                <option value="video_interview">Interview</option>
                <option value="tutorial">Project</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
            <input
              type="text"
              className="spotlight-search-input"
              placeholder="Search spotlights..."
              value={filters.search}
              onChange={e => updateSearch(e.target.value)}
            />
          </div>

          {/* Bulk Actions */}
          <div className={`bulk-actions ${isBulkVisible ? '' : 'hidden'}`}>
            <label className="bulk-select-all">
              <input
                type="checkbox"
                checked={
                  selectedCount === filteredSpotlights.length &&
                  filteredSpotlights.length > 0
                }
                onChange={() => selectAll(filteredSpotlights.map(s => s.id))}
              />{' '}
              Select All
            </label>
            <button
              className="bulk-action-btn publish"
              onClick={() => handleBulkAction('publish')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '📢'}{' '}
              Publish Selected
            </button>
            <button
              className="bulk-action-btn draft"
              onClick={() => handleBulkAction('archive')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '📁'}{' '}
              Archive Selected
            </button>
            <button
              className="bulk-action-btn delete"
              onClick={() => handleBulkAction('feature')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '⭐'}{' '}
              Feature Selected
            </button>
          </div>

          {/* Bulk error */}
          {bulkMutation.error && (
            <ErrorMessage
              error={bulkMutation.error}
              title="Bulk operation failed"
              variant="banner"
              size="small"
            />
          )}

          {/* Grid */}
          <div className="spotlights-grid">
            {filteredSpotlights.map(spotlight => {
              // Defensive: ensure spotlight is an object with expected fields
              const s = spotlight || ({} as Spotlight);
              const status = safeString(s.status);
              const title = safeString(s.title);
              const type = safeString(s.type);
              const name = safeString(
                s.featuredAlumniName || s.person || s.author
              );
              const content = safeString(s.content || s.shortDescription);
              const tags = Array.isArray(s.tags) ? s.tags : [];
              const viewCount =
                typeof s.viewCount === 'number' ? s.viewCount : 0;
              const likeCount =
                typeof s.likeCount === 'number' ? s.likeCount : 0;

              return (
                <div
                  key={s.id}
                  className={`spotlight-card ${selectedItems.has(s.id) ? 'selected' : ''}`}
                  data-status={status}
                  data-type={type}
                  data-category={getCategoryFromType(type).toLowerCase()}
                >
                  <input
                    type="checkbox"
                    className="spotlight-checkbox"
                    data-spotlight-id={s.id}
                    checked={selectedItems.has(s.id)}
                    onChange={() => toggleSelection(s.id)}
                  />
                  <div className="spotlight-image">
                    <div className="spotlight-image-placeholder">
                      {getSpotlightIcon(type)}
                    </div>
                    {status === 'published' && likeCount > 20 && (
                      <div className="spotlight-featured-badge">Featured</div>
                    )}
                    <div
                      className={`spotlight-status ${getStatusBadgeClass(status)}`}
                    >
                      {/* Defensive: only use charAt when status is non-empty string */}
                      {status.length > 0
                        ? status.charAt(0).toUpperCase() + status.slice(1)
                        : 'Unknown'}
                    </div>
                  </div>
                  <div className="spotlight-card-content">
                    <div className="spotlight-card-header">
                      <div className="spotlight-title">{title}</div>
                      <div className="spotlight-subtitle">
                        {getTypeDisplayName(type)} • {getCategoryFromType(type)}
                      </div>
                    </div>
                    <div className="spotlight-excerpt">{content}</div>
                    <div className="spotlight-meta">
                      <div className="spotlight-meta-item">
                        📅{' '}
                        {formatDate(
                          s.publishedDate || s.createdAt || s.createdDate || '',
                          status
                        )}
                      </div>
                      <div className="spotlight-meta-item">
                        👤 By {name || 'Unknown'}
                      </div>
                    </div>
                    <div className="spotlight-tags">
                      {tags.map((tag, index) => (
                        <span key={index} className="spotlight-tag">
                          {safeString(tag)}
                        </span>
                      ))}
                    </div>
                    <div className="spotlight-stats">
                      <div className="spotlight-stat">
                        <div className="spotlight-stat-icon" />
                        {status === 'draft' ? '--' : viewCount} Views
                      </div>
                      <div className="spotlight-stat">
                        <div className="spotlight-stat-icon" />
                        {status === 'draft' ? '--' : likeCount} Likes
                      </div>
                    </div>
                    <div className="spotlight-actions">
                      {status === 'published' ? (
                        <>
                          <button
                            className="spotlight-action-btn primary"
                            onClick={() => handleSpotlightAction('edit', s.id)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="spotlight-action-btn secondary"
                            onClick={() => handleSpotlightAction('view', s.id)}
                          >
                            👁️ View
                          </button>
                          <button
                            className="spotlight-action-btn danger"
                            onClick={() =>
                              handleSpotlightAction('delete', s.id)
                            }
                            disabled={spotlightMutation.loading}
                          >
                            {spotlightMutation.loading ? (
                              <LoadingSpinner size="small" />
                            ) : (
                              '🗑️'
                            )}{' '}
                            Delete
                          </button>
                        </>
                      ) : status === 'draft' ? (
                        <>
                          <button
                            className="spotlight-action-btn primary"
                            onClick={() => handleSpotlightAction('edit', s.id)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="spotlight-action-btn secondary"
                            onClick={() =>
                              handleSpotlightAction('preview', s.id)
                            }
                          >
                            👁️ Preview
                          </button>
                          <button
                            className="spotlight-action-btn primary"
                            onClick={() =>
                              handleSpotlightAction('publish', s.id)
                            }
                            disabled={spotlightMutation.loading}
                          >
                            {spotlightMutation.loading ? (
                              <LoadingSpinner size="small" />
                            ) : (
                              '📢'
                            )}{' '}
                            Publish
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="spotlight-action-btn primary"
                            onClick={() => handleSpotlightAction('edit', s.id)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="spotlight-action-btn secondary"
                            onClick={() => handleSpotlightAction('view', s.id)}
                          >
                            👁️ View
                          </button>
                          <button
                            className="spotlight-action-btn danger"
                            onClick={() =>
                              handleSpotlightAction('delete', s.id)
                            }
                            disabled={spotlightMutation.loading}
                          >
                            {spotlightMutation.loading ? (
                              <LoadingSpinner size="small" />
                            ) : (
                              '🗑️'
                            )}{' '}
                            Delete
                          </button>
                        </>
                      )}
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

export default SpotlightsManagementPage;
