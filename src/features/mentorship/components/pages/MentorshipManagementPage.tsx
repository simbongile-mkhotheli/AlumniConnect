import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFilters,
  useBulkActions,
  useApiData,
  useMutation,
} from '../../../../hooks';
import { MentorshipService } from '@features/mentorship/services';
import { LoadingSpinner, CardSkeleton } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage, EmptyState } from '../../../../components/common/ErrorMessage';
import type { MentorshipProgram, ApiResponse } from '@features/mentorship/types';

export const MentorshipManagementPage: React.FC = () => {
  const navigate = useNavigate();

  // IMPORTANT: use plural key 'mentorships' to match AppContext state section.
  // Previously this was 'mentorship' (singular) which prevented the reducer
  // from finding the section and updating filters, so UI controls appeared
  // non-functional. This mismatch is a root cause for filters not working
  // on the Mentorship management page.
  const { filters, updateFilters, updateSearch, clearFilters } = useFilters(
    'mentorships',
    {
      status: '',
      type: '',
      search: '',
    }
  );

  const {
    selectedItems,
    isVisible: isBulkVisible,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelections,
  // Use plural key to align with AppState (mentorships)
  } = useBulkActions('mentorships');

  // Memoize the fetch function to prevent infinite re-renders
  const fetchMentorships = useCallback(() => {
    return MentorshipService.getMentorships(1, 50, filters);
  }, [filters.status, filters.type, filters.search]); // Only depend on actual filter values

  // Fetch mentorships data with API integration
  const {
    data: mentorshipsResponse,
    loading,
    error,
    refetch,
  } = useApiData(
    fetchMentorships,
    [filters.status, filters.type, filters.search], // Use specific filter values instead of entire filters object
    {
      cacheKey: 'mentorships-list',
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    }
  );

  // Bulk operations mutation
  const bulkMutation = useMutation(
    ({ operation, ids }: { operation: string; ids: string[] }) =>
      MentorshipService.bulkOperation(operation as any, ids),
    {
      onSuccess: () => {
        refetch(); // Refresh data after successful bulk operation
        clearSelections();
      },
      onError: error => {
        console.error('Bulk operation failed:', error);
      },
    }
  );

  // Individual mentorship operations
  const mentorshipMutation = useMutation(
    async ({
      action,
      mentorshipId,
    }: {
      action: string;
      mentorshipId: string;
  }): Promise<ApiResponse<MentorshipProgram | null>> => {
      switch (action) {
        case 'approve':
          return MentorshipService.approveMentorship(mentorshipId);
        case 'reject':
          return MentorshipService.rejectMentorship(mentorshipId);
        case 'complete':
          return MentorshipService.completeMentorship(mentorshipId);
        case 'delete':
          return MentorshipService.deleteMentorship(mentorshipId);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    },
    {
      onSuccess: () => {
        refetch(); // Refresh data after successful operation
      },
      onError: error => {
        console.error('Mentorship operation failed:', error);
      },
    }
  );

  const mentorships = mentorshipsResponse?.data || [];

  // Memoize filtered mentorships to prevent unnecessary re-calculations
  const filteredMentorships = useMemo(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[MentorshipManagementPage] Recomputing filtered list', {
        total: mentorships.length,
        filters: { status: filters.status, type: filters.type, search: filters.search }
      });
    }
    let filtered = mentorships;

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(
        mentorship => mentorship.status === filters.status
      );
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(
        mentorship => mentorship.type === filters.type
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        mentorship =>
          mentorship.title.toLowerCase().includes(searchLower) ||
          mentorship.mentorName.toLowerCase().includes(searchLower) ||
          mentorship.menteeName.toLowerCase().includes(searchLower) ||
          mentorship.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [mentorships, filters.status, filters.type, filters.search]);

  // Debug effect to confirm filter state changes propagate
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[MentorshipManagementPage] Filters changed', filters);
    }
  }, [filters.status, filters.type, filters.search]);

  const handleBulkAction = async (action: string) => {
    const selectedIds = Array.from(selectedItems) as string[];
    if (selectedIds.length === 0) return;

    // Show confirmation dialog for destructive actions
    if (action === 'delete') {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete ${selectedIds.length} mentorship${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    try {
      await bulkMutation.mutate({ operation: action, ids: selectedIds });
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    }
  };

  const handleMentorshipAction = async (
    action: string,
    mentorshipId: string
  ) => {
    switch (action) {
      case 'edit':
        navigate(`/admin/mentorship/edit/${mentorshipId}`);
        break;
      case 'view':
        navigate(`/admin/mentorship/view/${mentorshipId}`);
        break;
      case 'schedule':
        // Navigate to scheduling page
        console.log('Opening scheduling for mentorship:', mentorshipId);
        break;
      case 'feedback':
        // Navigate to feedback page
        console.log('Opening feedback for mentorship:', mentorshipId);
        break;
      case 'duplicate':
        // Handle duplication logic
        console.log('Duplicating mentorship:', mentorshipId);
        break;
      case 'approve':
      case 'reject':
      case 'complete':
      case 'delete':
        // Show confirmation dialog for delete action
        const confirmed = window.confirm(
          `Are you sure you want to permanently delete this mentorship? This action cannot be undone.`
        );
        if (!confirmed) return;
        
        try {
          await mentorshipMutation.mutate({ action, mentorshipId });
        } catch (error) {
          console.error(`${action} mentorship failed:`, error);
        }
        break;
      default:
        console.log(`${action} mentorship:`, mentorshipId);
    }
  };

  const handleCreateMentorship = () => {
    navigate('/admin/mentorship/create');
  };

  const handleClose = () => {
    navigate('/admin');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'active';
      case 'pending':
        return 'pending';
      case 'completed':
        return 'completed';
      case 'paused':
        return 'paused';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'technical':
        return 'technical';
      case 'career':
        return 'career';
      case 'leadership':
        return 'leadership';
      case 'entrepreneurship':
        return 'entrepreneurship';
      case 'general':
        return 'general';
      default:
        return 'general';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'technical':
        return 'Technical';
      case 'career':
        return 'Career';
      case 'leadership':
        return 'Leadership';
      case 'entrepreneurship':
        return 'Entrepreneurship';
      case 'general':
        return 'General';
      default:
        return type;
    }
  };

  const getMentorshipIcon = (type: string) => {
    switch (type) {
      case 'technical':
        return '💻';
      case 'career':
        return '👔';
      case 'leadership':
        return '👑';
      case 'entrepreneurship':
        return '🚀';
      case 'general':
        return '💬';
      default:
        return '📚';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `Started ${Math.floor(diffDays / 7)} weeks ago`;
    return `Started ${Math.floor(diffDays / 30)} months ago`;
  };

  const formatNextSession = (dateString?: string) => {
    if (!dateString) return 'Awaiting Approval';
    const date = new Date(dateString);
    return `Next: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Loading state
  if (loading && !mentorships.length) {
    return (
      <div className="overlay active">
        <div className="mentorship-manager">
          <div className="mentorship-header">
            <h2 className="mentorship-title">Mentorship Manager</h2>
          </div>
          <div className="mentorship-body">
            <div className="mentorship-summary">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} className="mentorship-summary-card" />
              ))}
            </div>
            <div className="mentorships-grid">
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
  if (error && !mentorships.length) {
    return (
      <div className="overlay active">
        <div className="mentorship-manager">
          <div className="mentorship-header">
            <h2 className="mentorship-title">Mentorship Manager</h2>
          </div>
          <div className="mentorship-body">
            <ErrorMessage
              error={error}
              title="Failed to load mentorships"
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
  if (!loading && filteredMentorships.length === 0 && !error) {
    return (
      <div className="overlay active">
        <div className="mentorship-manager">
          <div className="mentorship-header">
            <h2 className="mentorship-title">Mentorship Manager</h2>
          </div>
          <div className="mentorship-body">
            <EmptyState
              title="No mentorships found"
              description="No mentorships match your current filters. Try adjusting your search criteria."
              action={undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay active">
      <div className="mentorship-manager">
        <div className="mentorship-header">
          <h2 className="mentorship-title">Mentorship Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {loading && <LoadingSpinner size="small" />}
            <button
              className="btn btn-primary"
              onClick={handleCreateMentorship}
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
              ➕ Create Mentorship
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

        <div className="mentorship-body">
          {/* Mentorship Summary */}
          <div className="mentorship-summary">
            <div className="mentorship-summary-card">
              <div className="mentorship-summary-value">
                {mentorships.length}
              </div>
              <div className="mentorship-summary-label">Total Mentorships</div>
            </div>
            <div className="mentorship-summary-card">
              <div className="mentorship-summary-value">
                {mentorships.filter(m => m.status === 'active').length}
              </div>
              <div className="mentorship-summary-label">Active</div>
            </div>
            <div className="mentorship-summary-card">
              <div className="mentorship-summary-value">
                {mentorships.filter(m => m.status === 'pending').length}
              </div>
              <div className="mentorship-summary-label">Pending</div>
            </div>
            <div className="mentorship-summary-card">
              <div className="mentorship-summary-value">
                {mentorships.filter(m => m.status === 'completed').length}
              </div>
              <div className="mentorship-summary-label">Completed</div>
            </div>
            <div className="mentorship-summary-card">
              <div className="mentorship-summary-value">
                {mentorships.filter(m => m.status === 'paused').length}
              </div>
              <div className="mentorship-summary-label">Paused</div>
            </div>
            <div className="mentorship-summary-card">
              <div className="mentorship-summary-value">
                {mentorships.reduce((sum, m: any) => {
                  const sc = typeof m.sessionCount === 'number'
                    ? m.sessionCount
                    : (typeof m.sessionsCompleted === 'number' ? m.sessionsCompleted : 0);
                  return sum + (isNaN(sc) ? 0 : sc);
                }, 0)}
              </div>
              <div className="mentorship-summary-label">Total Sessions</div>
            </div>
          </div>

          {/* Mentorship Filters */}
          <div className="mentorship-filters">
            <div className="mentorship-filter-group">
              <label className="mentorship-filter-label">Status:</label>
              <select
                className="mentorship-filter-select"
                value={filters.status}
                onChange={e => updateFilters({ status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="mentorship-filter-group">
              <label className="mentorship-filter-label">Type:</label>
              <select
                className="mentorship-filter-select"
                value={filters.type}
                onChange={e => updateFilters({ type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="technical">Technical</option>
                <option value="career">Career</option>
                <option value="leadership">Leadership</option>
                <option value="entrepreneurship">Entrepreneurship</option>
                <option value="general">General</option>
              </select>
            </div>
            <input
              type="text"
              className="mentorship-search-input"
              placeholder="Search mentorships..."
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
                  selectedCount === filteredMentorships.length &&
                  filteredMentorships.length > 0
                }
                onChange={() => selectAll(filteredMentorships.map(m => m.id))}
              />{' '}
              Select All
            </label>
            <button
              className="bulk-action-btn publish"
              onClick={() => handleBulkAction('approve')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '✅'}{' '}
              Approve Selected
            </button>
            <button
              className="bulk-action-btn draft"
              onClick={() => handleBulkAction('pause')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '⏸️'}{' '}
              Pause Selected
            </button>
            <button
              className="bulk-action-btn delete"
              onClick={() => handleBulkAction('cancel')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '❌'}{' '}
              Cancel Selected
            </button>
            <button
              className="bulk-action-btn danger"
              onClick={() => handleBulkAction('delete')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '🗑️'}{' '}
              Delete Selected
            </button>
          </div>

          {/* Error message for bulk operations */}
          {bulkMutation.error && (
            <ErrorMessage
              error={bulkMutation.error}
              title="Bulk operation failed"
              variant="banner"
              size="small"
            />
          )}

          {/* Mentorships Grid */}
          <div className="mentorships-grid">
            {filteredMentorships.map(mentorship => (
              <div
                key={mentorship.id}
                className={`mentorship-card ${selectedItems.has(mentorship.id) ? 'selected' : ''}`}
                data-status={mentorship.status}
                data-type={mentorship.type}
                data-category={mentorship.category}
              >
                <input
                  type="checkbox"
                  className="mentorship-checkbox"
                  data-mentorship-id={mentorship.id}
                  checked={selectedItems.has(mentorship.id)}
                  onChange={() => toggleSelection(mentorship.id)}
                />
                <div className="mentorship-image">
                  <div className="mentorship-image-placeholder">
                    {getMentorshipIcon(mentorship.type)}
                  </div>
                  <div
                    className={`mentorship-type-badge ${getTypeBadgeClass(mentorship.type)}`}
                  >
                    {getTypeDisplayName(mentorship.type)}
                  </div>
                  <div
                    className={`mentorship-status ${getStatusBadgeClass(mentorship.status || 'pending')}`}
                  >
                    {mentorship.status
                      ? mentorship.status.charAt(0).toUpperCase() + mentorship.status.slice(1)
                      : 'Pending'}
                  </div>
                </div>
                <div className="mentorship-card-content">
                  <div className="mentorship-card-header">
                    <div className="mentorship-title">{mentorship.title}</div>
                    <div className="mentorship-subtitle">
                      {getTypeDisplayName(mentorship.type)} •{' '}
                      {mentorship.category
                        ?.replace('-', ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                  <div className="mentorship-excerpt">
                    {mentorship.description}
                  </div>
                  <div className="mentorship-meta">
                    <div className="mentorship-meta-item">
                      📅 {formatDate(mentorship.startDate)}
                    </div>
                    <div className="mentorship-meta-item">
                      👨‍🏫 Mentor: {mentorship.mentorName}
                    </div>
                    <div className="mentorship-meta-item">
                      👨‍🎓 Mentee: {mentorship.menteeName}
                    </div>
                  </div>
                  <div className="mentorship-tags">
                    {(Array.isArray(mentorship.tags) ? mentorship.tags : []).map((tag, index) => (
                      <span key={index} className="mentorship-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mentorship-stats">
                    <div className="mentorship-stat">
                      <div className="mentorship-stat-icon"></div>
                      {mentorship.sessionCount} Sessions
                    </div>
                    <div className="mentorship-stat">
                      <div className="mentorship-stat-icon"></div>
                      {formatNextSession(mentorship.nextSessionDate)}
                    </div>
                  </div>
                  <div className="mentorship-actions">
                    {mentorship.status === 'active' ? (
                      <>
                        <button
                          className="mentorship-action-btn primary"
                          onClick={() =>
                            handleMentorshipAction('edit', mentorship.id)
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="mentorship-action-btn secondary"
                          onClick={() =>
                            handleMentorshipAction('view', mentorship.id)
                          }
                        >
                          👁️ View
                        </button>
                        <button
                          className="mentorship-action-btn secondary"
                          onClick={() =>
                            handleMentorshipAction('schedule', mentorship.id)
                          }
                        >
                          📅 Schedule
                        </button>
                      </>
                    ) : mentorship.status === 'pending' ? (
                      <>
                        <button
                          className="mentorship-action-btn primary"
                          onClick={() =>
                            handleMentorshipAction('approve', mentorship.id)
                          }
                          disabled={mentorshipMutation.loading}
                        >
                          {mentorshipMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '✅'
                          )}{' '}
                          Approve
                        </button>
                        <button
                          className="mentorship-action-btn secondary"
                          onClick={() =>
                            handleMentorshipAction('view', mentorship.id)
                          }
                        >
                          👁️ Review
                        </button>
                        <button
                          className="mentorship-action-btn danger"
                          onClick={() =>
                            handleMentorshipAction('reject', mentorship.id)
                          }
                          disabled={mentorshipMutation.loading}
                        >
                          {mentorshipMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '❌'
                          )}{' '}
                          Reject
                        </button>
                      </>
                    ) : mentorship.status === 'completed' ? (
                      <>
                        <button
                          className="mentorship-action-btn primary"
                          onClick={() =>
                            handleMentorshipAction('view', mentorship.id)
                          }
                        >
                          👁️ View
                        </button>
                        <button
                          className="mentorship-action-btn secondary"
                          onClick={() =>
                            handleMentorshipAction('feedback', mentorship.id)
                          }
                        >
                          💬 Feedback
                        </button>
                        <button
                          className="mentorship-action-btn secondary"
                          onClick={() =>
                            handleMentorshipAction('duplicate', mentorship.id)
                          }
                        >
                          📋 Duplicate
                        </button>
                        <button
                          className="mentorship-action-btn danger"
                          onClick={() =>
                            handleMentorshipAction('delete', mentorship.id)
                          }
                          disabled={mentorshipMutation.loading}
                        >
                          {mentorshipMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '🗑️'
                          )}{' '}
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="mentorship-action-btn primary"
                          onClick={() =>
                            handleMentorshipAction('edit', mentorship.id)
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="mentorship-action-btn secondary"
                          onClick={() =>
                            handleMentorshipAction('view', mentorship.id)
                          }
                        >
                          👁️ View
                        </button>
                        <button
                          className="mentorship-action-btn secondary"
                          onClick={() =>
                            handleMentorshipAction('schedule', mentorship.id)
                          }
                        >
                          📅 Schedule
                        </button>
                        {(mentorship.status === 'cancelled' || mentorship.status === 'paused') && (
                          <button
                            className="mentorship-action-btn danger"
                            onClick={() =>
                              handleMentorshipAction('delete', mentorship.id)
                            }
                            disabled={mentorshipMutation.loading}
                          >
                            {mentorshipMutation.loading ? (
                              <LoadingSpinner size="small" />
                            ) : (
                              '🗑️'
                            )}{' '}
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
