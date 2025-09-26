import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFilters,
  useBulkActions,
  useApiData,
  useMutation,
} from '../../hooks';
import { QAService } from '../../services/qaService';
import { LoadingSpinner, CardSkeleton } from '../common/LoadingSpinner';
import { ErrorMessage, EmptyState } from '../common/ErrorMessage';
import type { QAItem } from '../../types';

export const QAManagementPage: React.FC = () => {
  const navigate = useNavigate();

  // Confirmation dialogs state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'bulk-delete';
    itemId?: string;
    itemTitle?: string;
    selectedCount?: number;
  }>({ isOpen: false, type: 'delete' });

  const { filters, updateFilters, updateSearch } = useFilters('qaItems', {
    status: '',
    type: '',
    category: '',
    search: '',
  });

  const {
    selectedItems,
    isVisible: isBulkVisible,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelections,
  } = useBulkActions('qaItems');

  // Fetch Q&A items data with API integration
  const {
    data: qaResponse,
    loading,
    error,
    refetch,
  } = useApiData(() => QAService.getQAItems(1, 50, filters), [filters], {
    cacheKey: 'qa-list',
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Bulk operations mutation
  const bulkMutation = useMutation(
    ({ operation, ids }: { operation: string; ids: string[] }) => {
      if (operation === 'delete') {
        return QAService.bulkOperation('delete' as any, ids);
      }
      return QAService.bulkOperation(operation as 'publish' | 'archive' | 'flag', ids);
    },
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

  // Individual delete mutation
  const deleteMutation = useMutation(
    (qaId: string) => QAService.deleteQAItem(qaId),
    {
      onSuccess: () => {
        refetch();
        setConfirmDialog({ isOpen: false, type: 'delete' });
      },
      onError: error => {
        console.error('Delete Q&A failed:', error);
      },
    }
  );

  // Individual Q&A operations
  const qaMutation = useMutation(
    ({ action, qaId }: { action: string; qaId: string }): Promise<any> => {
      switch (action) {
        case 'publish':
          return QAService.publishQAItem(qaId);
        case 'archive':
          return QAService.archiveQAItem(qaId);
        case 'flag':
          return QAService.flagQAItem(qaId);
        case 'unflag':
          return QAService.unflagQAItem(qaId);
        case 'approve':
          return QAService.approveQAItem(qaId);
        case 'reject':
          return QAService.rejectQAItem(qaId);
        case 'feature':
          return QAService.featureQAItem(qaId);
        case 'unfeature':
          return QAService.unfeatureQAItem(qaId);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    },
    {
      onSuccess: () => {
        refetch(); // Refresh data after successful operation
      },
      onError: error => {
        console.error('Q&A operation failed:', error);
      },
    }
  );

  const qaItems = qaResponse?.data || [];
  const [filteredQAItems, setFilteredQAItems] = useState<QAItem[]>([]);

  // Debug instrumentation (temporary) to help diagnose blank page issue
  if (typeof window !== 'undefined') {
    // Avoid spamming every render when unchanged
    (window as any).__qaDebugLastCount !== qaItems.length &&
      console.log('[QAManagementPage][debug] render, items:', qaItems.length, {
        loading,
        error,
        filters,
        sample: qaItems[0],
      });
    (window as any).__qaDebugLastCount = qaItems.length;
  }

  // Filter Q&A items based on current filters (client-side filtering for cached data)
  useEffect(() => {
    let filtered = qaItems;

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(searchLower) ||
          item.content.toLowerCase().includes(searchLower) ||
          item.authorName.toLowerCase().includes(searchLower) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredQAItems(filtered);
  }, [filters, qaItems]);

  const handleCreateQA = () => {
    console.log('[QAManagementPage] Navigating to create QA editor');
    navigate('/admin/qa/create');
  };

  const handleClose = () => {
    navigate('/admin');
  };

  const handleBulkAction = async (action: string) => {
    const selectedIds = Array.from(selectedItems) as string[];
    if (selectedIds.length === 0) return;

    // Show confirmation for delete operations
    if (action === 'delete') {
      setConfirmDialog({
        isOpen: true,
        type: 'bulk-delete',
        selectedCount: selectedIds.length,
      });
      return;
    }

    try {
      await bulkMutation.mutate({ operation: action, ids: selectedIds });
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    }
  };

  const handleQAAction = async (action: string, qaId: string) => {
    switch (action) {
      case 'edit':
        navigate(`/admin/qa/edit/${qaId}`);
        break;
      case 'view':
        navigate(`/admin/qa/view/${qaId}`);
        break;
      case 'delete':
        const qaItem = qaItems.find(item => item.id === qaId);
        setConfirmDialog({
          isOpen: true,
          type: 'delete',
          itemId: qaId,
          itemTitle: qaItem?.title,
        });
        break;
      case 'answers':
      case 'discussion':
        // Navigate to Q&A details page to view answers/discussion
        navigate(`/admin/qa/view/${qaId}`);
        break;
      case 'publish':
      case 'archive':
      case 'flag':
      case 'unflag':
      case 'approve':
      case 'reject':
      case 'feature':
      case 'unfeature':
        try {
          await qaMutation.mutate({ action, qaId });
        } catch (error) {
          console.error(`${action} Q&A failed:`, error);
        }
        break;
      case 'review':
        // Navigate to Q&A details page for review
        navigate(`/admin/qa/view/${qaId}`);
        break;
      case 'remove-flag':
        try {
          await qaMutation.mutate({ action: 'unflag', qaId });
        } catch (error) {
          console.error('Remove flag failed:', error);
        }
        break;
      default:
        // Navigate to view page for unknown actions
        navigate(`/admin/qa/view/${qaId}`);
        break;
    }
  };

  // Confirmation dialog handlers
  const handleConfirmDelete = async () => {
    if (confirmDialog.type === 'delete' && confirmDialog.itemId) {
      await deleteMutation.mutate(confirmDialog.itemId);
    } else if (confirmDialog.type === 'bulk-delete') {
      const selectedIds = Array.from(selectedItems) as string[];
      try {
        await bulkMutation.mutate({ operation: 'delete', ids: selectedIds });
        setConfirmDialog({ isOpen: false, type: 'delete' });
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, type: 'delete' });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'published';
      case 'pending':
        return 'pending';
      case 'flagged':
        return 'flagged';
      case 'archived':
        return 'archived';
      default:
        return 'pending';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'question':
        return 'question';
      case 'answer':
        return 'answer';
      case 'discussion':
        return 'discussion';
      default:
        return 'question';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'question':
        return 'Question';
      case 'answer':
        return 'Answer';
      case 'discussion':
        return 'Discussion';
      default:
        return type;
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'technical':
        return 'Technical';
      case 'career':
        return 'Career';
      case 'academic':
        return 'Academic';
      case 'general':
        return 'General';
      default:
        return category;
    }
  };

  const getQAIcon = (type: string) => {
    switch (type) {
      case 'question':
        return '❓';
      case 'answer':
        return '💼';
      case 'discussion':
        return '💬';
      default:
        return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Asked 1 day ago';
    if (diffDays < 7) return `Asked ${diffDays} days ago`;
    if (diffDays < 14) return 'Asked 1 week ago';
    return `Asked ${Math.floor(diffDays / 7)} weeks ago`;
  };

  const formatDateForAnswer = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Answered 1 day ago';
    if (diffDays < 7) return `Answered ${diffDays} days ago`;
    if (diffDays < 14) return 'Answered 1 week ago';
    return `Answered ${Math.floor(diffDays / 7)} weeks ago`;
  };

  const formatDateForDiscussion = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Started 1 day ago';
    if (diffDays < 7) return `Started ${diffDays} days ago`;
    if (diffDays < 14) return 'Started 1 week ago';
    return `Started ${Math.floor(diffDays / 7)} weeks ago`;
  };

  const getFormattedDate = (item: QAItem) => {
    switch (item.type) {
      case 'answer':
        return formatDateForAnswer(item.createdAt);
      case 'discussion':
        return formatDateForDiscussion(item.createdAt);
      default:
        return formatDate(item.createdAt);
    }
  };

  // Loading state
  if (loading && !qaItems.length) {
    return (
      <div className="overlay active">
        <div className="qa-manager">
          <div className="qa-header">
            <h2 className="qa-title">Community Q&A Manager</h2>
          </div>
          <div className="qa-body">
            <div className="qa-summary">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} className="qa-summary-card" />
              ))}
            </div>
            <div className="qa-grid">
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
  if (error && !qaItems.length) {
    return (
      <div className="overlay active">
        <div className="qa-manager">
          <div className="qa-header">
            <h2 className="qa-title">Community Q&A Manager</h2>
          </div>
          <div className="qa-body">
            <ErrorMessage
              error={error}
              title="Failed to load Q&A items"
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
  if (!loading && filteredQAItems.length === 0 && !error) {
    return (
      <div className="overlay active">
        <div className="qa-manager">
          <div className="qa-header">
            <h2 className="qa-title">Community Q&A Manager</h2>
          </div>
          <div className="qa-body">
            <EmptyState
              title="No Q&A items found"
              description="No Q&A items match your current filters. Try adjusting your search criteria."
              action={undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay active" data-qa-page-root>
      {import.meta.env.DEV && (
        <div style={{background:'#fffbeb',border:'1px solid #fcd34d',padding:'8px 12px',margin:'8px 0',borderRadius:6,fontSize:12,color:'#92400e'}}>
          Q&A Management (debug) – items: {qaItems.length} filtered: {filteredQAItems.length} {loading ? 'loading…' : ''} {error ? `error: ${String(error)}` : ''}
        </div>
      )}
      <div className="qa-manager">
        <div className="qa-header">
          <h2 className="qa-title">Community Q&A Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {loading && <LoadingSpinner size="small" />}
            <button
              className="btn btn-primary"
              onClick={handleCreateQA}
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
              ➕ Create Q&A
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

        <div className="qa-body">
          {/* Q&A Summary */}
          <div className="qa-summary">
            <div className="qa-summary-card">
              <div className="qa-summary-value">
                {qaItems.filter(item => item.type === 'question').length}
              </div>
              <div className="qa-summary-label">Total Questions</div>
            </div>
            <div className="qa-summary-card">
              <div className="qa-summary-value">
                {qaItems.filter(item => item.type === 'answer').length}
              </div>
              <div className="qa-summary-label">Total Answers</div>
            </div>
            <div className="qa-summary-card">
              <div className="qa-summary-value">
                {qaItems.filter(item => item.status === 'pending').length}
              </div>
              <div className="qa-summary-label">Pending Review</div>
            </div>
            <div className="qa-summary-card">
              <div className="qa-summary-value">
                {qaItems.filter(item => item.status === 'flagged').length}
              </div>
              <div className="qa-summary-label">Flagged Items</div>
            </div>
            <div className="qa-summary-card">
              <div className="qa-summary-value">
                {qaItems.reduce((sum, item) => sum + item.viewCount, 0)}
              </div>
              <div className="qa-summary-label">Total Views</div>
            </div>
            <div className="qa-summary-card">
              <div className="qa-summary-value">
                {qaItems.reduce((sum, item) => sum + item.voteCount, 0)}
              </div>
              <div className="qa-summary-label">Engagements</div>
            </div>
          </div>

          {/* Q&A Filters */}
          <div className="qa-filters">
            <div className="qa-filter-group">
              <label className="qa-filter-label">Status:</label>
              <select
                className="qa-filter-select"
                value={filters.status}
                onChange={e => updateFilters({ status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="pending">Pending Review</option>
                <option value="flagged">Flagged</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="qa-filter-group">
              <label className="qa-filter-label">Type:</label>
              <select
                className="qa-filter-select"
                value={filters.type}
                onChange={e => updateFilters({ type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="question">Questions</option>
                <option value="answer">Answers</option>
                <option value="discussion">Discussions</option>
              </select>
            </div>
            <div className="qa-filter-group">
              <label className="qa-filter-label">Category:</label>
              <select
                className="qa-filter-select"
                value={filters.category}
                onChange={e => updateFilters({ category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="technical">Technical</option>
                <option value="career">Career</option>
                <option value="academic">Academic</option>
                <option value="general">General</option>
              </select>
            </div>
            <input
              type="text"
              className="qa-search-input"
              placeholder="Search Q&A..."
              value={filters.search}
              onChange={e => updateSearch(e.target.value)}
            />
          </div>

          {/* Bulk Actions */}
          <div className={`qa-bulk-actions ${isBulkVisible ? '' : 'hidden'}`}>
            <label className="qa-bulk-select-all">
              <input
                type="checkbox"
                checked={
                  selectedCount === filteredQAItems.length &&
                  filteredQAItems.length > 0
                }
                onChange={() => selectAll(filteredQAItems.map(item => item.id))}
              />{' '}
              Select All
            </label>
            <button
              className="qa-bulk-action-btn publish"
              onClick={() => handleBulkAction('publish')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '✅'}{' '}
              Publish Selected
            </button>
            <button
              className="qa-bulk-action-btn archive"
              onClick={() => handleBulkAction('archive')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '📁'}{' '}
              Archive Selected
            </button>
            <button
              className="qa-bulk-action-btn flag"
              onClick={() => handleBulkAction('flag')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '🚩'}{' '}
              Flag Selected
            </button>
            <button
              className="qa-bulk-action-btn danger"
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

          {/* Q&A Grid */}
          <div className="qa-grid">
            {filteredQAItems.map(item => (
              <div
                key={item.id}
                className={`qa-card ${selectedItems.has(item.id) ? 'selected' : ''}`}
                data-status={item.status}
                data-type={item.type}
                data-category={item.category}
              >
                <input
                  type="checkbox"
                  className="qa-checkbox"
                  data-qa-id={item.id}
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelection(item.id)}
                />
                <div className="qa-image">
                  <div className="qa-image-placeholder">
                    {getQAIcon(item.type)}
                  </div>
                  <div
                    className={`qa-type-badge ${getTypeBadgeClass(item.type)}`}
                  >
                    {getTypeDisplayName(item.type)}
                  </div>
                  <div
                    className={`qa-status ${getStatusBadgeClass(item.status || 'pending')}`}
                  >
                    {(item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'Pending')}
                  </div>
                </div>
                <div className="qa-card-content">
                  <div className="qa-card-header">
                    <div className="qa-title">{item.title}</div>
                    <div className="qa-subtitle">
                      {getCategoryDisplayName(item.category)} •{' '}
                      {item.type === 'answer'
                        ? 'Professional Development'
                        : item.type === 'discussion'
                          ? 'Remote Work'
                          : 'React Development'}
                    </div>
                  </div>
                  <div className="qa-excerpt">{item.content}</div>
                  <div className="qa-meta">
                    <div className="qa-meta-item">
                      📅 {getFormattedDate(item)}
                    </div>
                    <div className="qa-meta-item">👤 By {item.authorName}</div>
                  </div>
                  <div className="qa-tags">
                    {(Array.isArray(item.tags) ? item.tags : []).map((tag, index) => (
                      <span key={index} className="qa-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="qa-stats">
                    {item.type === 'question' ? (
                      <>
                        <div className="qa-stat">
                          <div className="qa-stat-icon"></div>
                          {item.answerCount} Answers
                        </div>
                        <div className="qa-stat">
                          <div className="qa-stat-icon"></div>
                          {item.viewCount} Views
                        </div>
                        <div className="qa-stat">
                          <div className="qa-stat-icon"></div>
                          {item.voteCount} Votes
                        </div>
                      </>
                    ) : item.type === 'answer' ? (
                      <>
                        <div className="qa-stat">
                          <div className="qa-stat-icon"></div>
                          {item.voteCount} Votes
                        </div>
                        <div className="qa-stat">
                          <div className="qa-stat-icon"></div>
                          {item.viewCount} Views
                        </div>
                        <div className="qa-stat">
                          <div className="qa-stat-icon"></div>
                          {item.commentCount || 0} Comments
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="qa-stat">
                          <div className="qa-stat-icon"></div>
                          {item.answerCount} Replies
                        </div>
                        <div className="qa-stat">
                          <div className="qa-stat-icon"></div>
                          {item.viewCount} Views
                        </div>
                        <div className="qa-stat">
                          <div className="qa-stat-icon"></div>
                          {item.participantCount || 0} Participants
                        </div>
                      </>
                    )}
                  </div>
                  <div className="qa-actions">
                    {item.status === 'published' ? (
                      <>
                        <button
                          className="qa-action-btn primary"
                          onClick={() => handleQAAction('edit', item.id)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="qa-action-btn secondary"
                          onClick={() => handleQAAction('view', item.id)}
                        >
                          👁️ View
                        </button>
                        <button
                          className="qa-action-btn secondary"
                          onClick={() =>
                            handleQAAction(
                              item.type === 'question'
                                ? 'answers'
                                : item.type === 'answer'
                                  ? 'discussion'
                                  : 'discussion',
                              item.id
                            )
                          }
                        >
                          {item.type === 'question'
                            ? '💬 Answers'
                            : item.type === 'answer'
                              ? '💬 Discussion'
                              : '💬 Discussion'}
                        </button>
                        {item.type === 'question' && (
                          <button
                            className={`qa-action-btn ${item.isFeatured ? 'warning' : 'info'}`}
                            onClick={() => handleQAAction(item.isFeatured ? 'unfeature' : 'feature', item.id)}
                            disabled={qaMutation.loading}
                          >
                            {qaMutation.loading ? (
                              <LoadingSpinner size="small" />
                            ) : item.isFeatured ? (
                              '🌟'
                            ) : (
                              '⭐'
                            )}{' '}
                            {item.isFeatured ? 'Unfeature' : 'Feature'}
                          </button>
                        )}
                        <button
                          className="qa-action-btn danger"
                          onClick={() => handleQAAction('delete', item.id)}
                          disabled={deleteMutation.loading}
                        >
                          {deleteMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '🗑️'
                          )}{' '}
                          Delete
                        </button>
                      </>
                    ) : item.status === 'pending' ? (
                      <>
                        <button
                          className="qa-action-btn primary"
                          onClick={() => handleQAAction('approve', item.id)}
                          disabled={qaMutation.loading}
                        >
                          {qaMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '✅'
                          )}{' '}
                          Approve
                        </button>
                        <button
                          className="qa-action-btn secondary"
                          onClick={() => handleQAAction('view', item.id)}
                        >
                          👁️ Review
                        </button>
                        <button
                          className="qa-action-btn danger"
                          onClick={() => handleQAAction('reject', item.id)}
                          disabled={qaMutation.loading}
                        >
                          {qaMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '❌'
                          )}{' '}
                          Reject
                        </button>
                        <button
                          className="qa-action-btn danger"
                          onClick={() => handleQAAction('delete', item.id)}
                          disabled={deleteMutation.loading}
                        >
                          {deleteMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '🗑️'
                          )}{' '}
                          Delete
                        </button>
                      </>
                    ) : item.status === 'flagged' ? (
                      <>
                        <button
                          className="qa-action-btn primary"
                          onClick={() => handleQAAction('review', item.id)}
                        >
                          🔍 Review Flag
                        </button>
                        <button
                          className="qa-action-btn secondary"
                          onClick={() => handleQAAction('view', item.id)}
                        >
                          👁️ View
                        </button>
                        <button
                          className="qa-action-btn danger"
                          onClick={() => handleQAAction('remove-flag', item.id)}
                          disabled={qaMutation.loading}
                        >
                          {qaMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '🚩'
                          )}{' '}
                          Remove Flag
                        </button>
                        <button
                          className="qa-action-btn danger"
                          onClick={() => handleQAAction('delete', item.id)}
                          disabled={deleteMutation.loading}
                        >
                          {deleteMutation.loading ? (
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
                          className="qa-action-btn primary"
                          onClick={() => handleQAAction('edit', item.id)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="qa-action-btn secondary"
                          onClick={() => handleQAAction('view', item.id)}
                        >
                          👁️ View
                        </button>
                        <button
                          className="qa-action-btn secondary"
                          onClick={() => handleQAAction('discussion', item.id)}
                        >
                          💬 Discussion
                        </button>
                        <button
                          className="qa-action-btn danger"
                          onClick={() => handleQAAction('delete', item.id)}
                          disabled={deleteMutation.loading}
                        >
                          {deleteMutation.loading ? (
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
            ))}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {confirmDialog.isOpen && (
          <div className="confirmation-overlay">
            <div className="confirmation-dialog">
              <h3 className="confirmation-title">
                {confirmDialog.type === 'bulk-delete'
                  ? 'Confirm Bulk Delete'
                  : 'Confirm Delete'}
              </h3>
              <p className="confirmation-message">
                {confirmDialog.type === 'bulk-delete'
                  ? `Are you sure you want to delete ${confirmDialog.selectedCount} selected Q&A item${confirmDialog.selectedCount === 1 ? '' : 's'}? This action cannot be undone.`
                  : `Are you sure you want to delete "${confirmDialog.itemTitle}"? This action cannot be undone.`}
              </p>
              <div className="confirmation-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelDelete}
                  disabled={deleteMutation.loading || bulkMutation.loading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={deleteMutation.loading || bulkMutation.loading}
                >
                  {(deleteMutation.loading || bulkMutation.loading) ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
