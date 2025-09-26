import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFilters,
  useBulkActions,
  useApiData,
  useMutation,
} from '../../hooks';
import { OpportunitiesService } from '../../services/opportunitiesService';
import { LoadingSpinner, CardSkeleton } from '../common/LoadingSpinner';
import { ErrorMessage, EmptyState } from '../common/ErrorMessage';
import type { Opportunity, ApiResponse } from '../../types';
import { FilterDebugger } from '../debug/FilterDebugger';
import { MasterDebugger } from '../debug/MasterDebugger';
import { ManagementPagesDebugger } from '../debug/ManagementPagesDebugger';

export const OpportunitiesManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const { filters, updateFilters, updateSearch } = useFilters('opportunities', {
    status: '',
    type: '',
    level: '',
    search: '',
  });

  const {
    selectedItems,
    isVisible: isBulkVisible,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelections,
  } = useBulkActions('opportunities');

  // Memoize the fetch function to prevent infinite re-renders
  const fetchOpportunities = useCallback(() => {
    return OpportunitiesService.getOpportunities(1, 50, filters);
  }, [filters.status, filters.type, filters.level, filters.search]); // Only depend on actual filter values

  // Fetch opportunities data with API integration
  const {
    data: opportunitiesResponse,
    loading,
    error,
    refetch,
  } = useApiData(
    fetchOpportunities,
    [filters.status, filters.type, filters.level, filters.search], // Use specific filter values instead of entire filters object
    {
      cacheKey: 'opportunities-list',
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    }
  );

  // Bulk operations mutation
  const bulkMutation = useMutation(
    ({ operation, ids }: { operation: string; ids: string[] }) =>
      OpportunitiesService.bulkOperation(
        operation as 'activate' | 'expire' | 'delete',
        ids
      ),
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

  // Individual opportunity operations
  const opportunityMutation = useMutation(
    ({
      action,
      opportunityId,
    }: {
      action: string;
      opportunityId: string;
    }): Promise<ApiResponse<Opportunity | null | void>> => {
      switch (action) {
        case 'activate':
          return OpportunitiesService.activateOpportunity(opportunityId);
        case 'expire':
          return OpportunitiesService.expireOpportunity(opportunityId);
        case 'delete':
          // deleteOpportunity returns ApiResponse<void>; widen to Opportunity | null for union compatibility
          return OpportunitiesService.deleteOpportunity(opportunityId);
        case 'renew':
          return OpportunitiesService.renewOpportunity(opportunityId);
        case 'approve':
          return OpportunitiesService.approveOpportunity(opportunityId);
        case 'reject':
          return OpportunitiesService.rejectOpportunity(opportunityId);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    },
    {
      onSuccess: () => {
        refetch(); // Refresh data after successful operation
      },
      onError: error => {
        console.error('Opportunity operation failed:', error);
      },
    }
  );

  // Extract opportunities array from the response structure
  const opportunities = opportunitiesResponse?.data || [];

  // Memoize filtered opportunities to prevent unnecessary re-calculations
  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(
        (opportunity: Opportunity) => opportunity.status === filters.status
      );
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(
        (opportunity: Opportunity) => opportunity.type === filters.type
      );
    }

    if (filters.level && filters.level !== 'all') {
      filtered = filtered.filter(
        (opportunity: Opportunity) => opportunity.level === filters.level
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (opportunity: Opportunity) =>
          opportunity.title.toLowerCase().includes(searchLower) ||
          opportunity.company.toLowerCase().includes(searchLower) ||
          opportunity.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchLower)
          )
      );
    }

    return filtered;
  }, [
    opportunities,
    filters.status,
    filters.type,
    filters.level,
    filters.search,
  ]);

  const handleBulkAction = async (action: string) => {
    const selectedIds = Array.from(selectedItems) as string[];
    if (selectedIds.length === 0) return;

    // Show confirmation dialog for destructive actions
    if (action === 'delete') {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete ${selectedIds.length} opportunit${selectedIds.length > 1 ? 'ies' : 'y'}? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    try {
      await bulkMutation.mutate({ operation: action, ids: selectedIds });
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    }
  };

  const handleOpportunityAction = async (
    action: string,
    opportunityId: string
  ) => {
    switch (action) {
      case 'edit':
        navigate(`/admin/opportunities/edit/${opportunityId}`);
        break;
      case 'view':
        navigate(`/admin/opportunities/view/${opportunityId}`);
        break;
      case 'applications':
        // Navigate to applications page
        console.log('Opening applications for opportunity:', opportunityId);
        break;
      case 'activate':
      case 'expire':
      case 'renew':
      case 'approve':
      case 'reject':
        try {
          await opportunityMutation.mutate({ action, opportunityId });
        } catch (error) {
          console.error(`${action} opportunity failed:`, error);
        }
        break;
      case 'delete':
        // Show confirmation dialog for delete action
        const confirmed = window.confirm(
          `Are you sure you want to permanently delete this opportunity? This action cannot be undone.`
        );
        if (!confirmed) return;
        
        try {
          await opportunityMutation.mutate({ action, opportunityId });
        } catch (error) {
          console.error(`${action} opportunity failed:`, error);
        }
        break;
      default:
        console.log(`${action} opportunity:`, opportunityId);
    }
  };

  const handleCreateOpportunity = () => {
    navigate('/admin/opportunities/create');
  };

  const handleClose = () => {
    navigate('/admin');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'active';
      case 'expired':
        return 'expired';
      case 'filled':
        return 'filled';
      case 'cancelled':
        return 'cancelled';
      case 'draft':
        return 'draft';
      default:
        return 'pending';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'job':
        return 'full-time';
      case 'internship':
        return 'internship';
      case 'freelance':
        return 'freelance';
      case 'collaboration':
        return 'part-time';
      case 'volunteer':
        return 'volunteer';
      default:
        return 'contract';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'job':
        return 'Full-time';
      case 'internship':
        return 'Internship';
      case 'freelance':
        return 'Freelance';
      case 'collaboration':
        return 'Part-time';
      case 'volunteer':
        return 'Volunteer';
      default:
        return 'Contract';
    }
  };

  const getLevelDisplayName = (level: string) => {
    switch (level) {
      case 'entry':
        return 'Entry Level';
      case 'mid':
        return 'Mid Level';
      case 'senior':
        return 'Senior Level';
      case 'executive':
        return 'Lead/Manager';
      default:
        return level;
    }
  };

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'job':
        return '💼';
      case 'internship':
        return '🎓';
      case 'freelance':
        return '💻';
      case 'collaboration':
        return '⏰';
      case 'volunteer':
        return '🤝';
      default:
        return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Posted 1 day ago';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 14) return 'Posted 1 week ago';
    if (diffDays < 21) return 'Posted 2 weeks ago';
    return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
  };

  // Loading state
  if (loading && !opportunities.length) {
    return (
      <div className="overlay active">
        <div className="opportunities-manager">
          <div className="opportunities-header">
            <h2 className="opportunities-title">Opportunities Manager</h2>
          </div>
          <div className="opportunities-body">
            <div className="opportunities-summary">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton
                  key={index}
                  className="opportunity-summary-card"
                />
              ))}
            </div>
            <div className="opportunities-grid">
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
  if (error && !opportunities.length) {
    return (
      <div className="overlay active">
        <div className="opportunities-manager">
          <div className="opportunities-header">
            <h2 className="opportunities-title">Opportunities Manager</h2>
          </div>
          <div className="opportunities-body">
            <ErrorMessage
              error={error}
              title="Failed to load opportunities"
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
  if (!loading && filteredOpportunities.length === 0 && !error) {
    return (
      <div className="overlay active">
        <div className="opportunities-manager">
          <div className="opportunities-header">
            <h2 className="opportunities-title">Opportunities Manager</h2>
          </div>
          <div className="opportunities-body">
            <EmptyState
              title="No opportunities found"
              description="No opportunities match your current filters. Try adjusting your search criteria."
              action={undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay active">
      <ManagementPagesDebugger />
      <div className="opportunities-manager">
        <div className="opportunities-header">
          <h2 className="opportunities-title">Opportunities Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {loading && <LoadingSpinner size="small" />}
            <button
              className="btn btn-primary"
              onClick={handleCreateOpportunity}
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
              ➕ Create Opportunity
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

        <div className="opportunities-body">
          {/* Opportunities Summary */}
          <div className="opportunities-summary">
            <div className="opportunity-summary-card">
              <div className="opportunity-summary-value">
                {opportunities.length}
              </div>
              <div className="opportunity-summary-label">
                Total Opportunities
              </div>
            </div>
            <div className="opportunity-summary-card">
              <div className="opportunity-summary-value">
                {
                  opportunities.filter(
                    (o: Opportunity) => o.status === 'active'
                  ).length
                }
              </div>
              <div className="opportunity-summary-label">Active</div>
            </div>
            <div className="opportunity-summary-card">
              <div className="opportunity-summary-value">
                {
                  opportunities.filter(
                    (o: Opportunity) => o.status === 'pending'
                  ).length
                }
              </div>
              <div className="opportunity-summary-label">Pending Review</div>
            </div>
            <div className="opportunity-summary-card">
              <div className="opportunity-summary-value">
                {
                  opportunities.filter(
                    (o: Opportunity) => o.status === 'expired'
                  ).length
                }
              </div>
              <div className="opportunity-summary-label">Expired</div>
            </div>
            <div className="opportunity-summary-card">
              <div className="opportunity-summary-value">
                {opportunities.reduce(
                  (sum: number, o: Opportunity) => sum + o.applicationCount,
                  0
                )}
              </div>
              <div className="opportunity-summary-label">Applications</div>
            </div>
            <div className="opportunity-summary-card">
              <div className="opportunity-summary-value">89</div>
              <div className="opportunity-summary-label">Successful Hires</div>
            </div>
          </div>

          {/* Opportunity Filters */}
          <div className="opportunity-filters">
            <div className="opportunity-filter-group">
              <label className="opportunity-filter-label">Status:</label>
              <select
                className="opportunity-filter-select"
                value={filters.status}
                onChange={e => updateFilters({ status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending Review</option>
                <option value="expired">Expired</option>
                <option value="filled">Filled</option>
                <option value="cancelled">Cancelled</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="opportunity-filter-group">
              <label className="opportunity-filter-label">Type:</label>
              <select
                className="opportunity-filter-select"
                value={filters.type}
                onChange={e => updateFilters({ type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="job">Full-time</option>
                <option value="collaboration">Part-time</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            <div className="opportunity-filter-group">
              <label className="opportunity-filter-label">Level:</label>
              <select
                className="opportunity-filter-select"
                value={filters.level}
                onChange={e => updateFilters({ level: e.target.value })}
              >
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Lead/Manager</option>
              </select>
            </div>
            <input
              type="text"
              className="opportunity-search-input"
              placeholder="Search opportunities..."
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
                  selectedCount === filteredOpportunities.length &&
                  filteredOpportunities.length > 0
                }
                onChange={() =>
                  selectAll(filteredOpportunities.map((o: Opportunity) => o.id))
                }
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
              onClick={() => handleBulkAction('expire')}
              disabled={bulkMutation.loading}
            >
              {bulkMutation.loading ? <LoadingSpinner size="small" /> : '⏰'}{' '}
              Expire Selected
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

          {/* Error message for bulk operations */}
          {bulkMutation.error && (
            <ErrorMessage
              error={bulkMutation.error}
              title="Bulk operation failed"
              variant="banner"
              size="small"
            />
          )}

          {/* Opportunities Grid */}
          <div className="opportunities-grid">
            {filteredOpportunities.map(opportunity => (
              <div
                key={opportunity.id}
                className={`opportunity-card ${selectedItems.has(opportunity.id) ? 'selected' : ''}`}
                data-status={opportunity.status}
                data-type={opportunity.type}
                data-level={opportunity.level}
              >
                <input
                  type="checkbox"
                  className="opportunity-checkbox"
                  data-opportunity-id={opportunity.id}
                  checked={selectedItems.has(opportunity.id)}
                  onChange={() => toggleSelection(opportunity.id)}
                />
                <div className="opportunity-image">
                  <div className="opportunity-image-placeholder">
                    {getOpportunityIcon(opportunity.type)}
                  </div>
                  <div
                    className={`opportunity-type-badge ${getTypeBadgeClass(opportunity.type)}`}
                  >
                    {getTypeDisplayName(opportunity.type)}
                  </div>
                  <div
                    className={`opportunity-status ${getStatusBadgeClass(opportunity.status)}`}
                  >
                    {opportunity.status.charAt(0).toUpperCase() +
                      opportunity.status.slice(1)}
                  </div>
                </div>
                <div className="opportunity-card-content">
                  <div className="opportunity-card-header">
                    <div className="opportunity-title">{opportunity.title}</div>
                    <div className="opportunity-subtitle">
                      {opportunity.company} •{' '}
                      {getLevelDisplayName(opportunity.level)}
                    </div>
                  </div>
                  <div className="opportunity-excerpt">
                    {opportunity.description}
                  </div>
                  <div className="opportunity-meta">
                    <div className="opportunity-meta-item">
                      📅 {formatDate(opportunity.postedDate)}
                    </div>
                    <div className="opportunity-meta-item">
                      💰 {opportunity.salary}
                    </div>
                  </div>
                  <div className="opportunity-tags">
                    {opportunity.tags.map((tag, index) => (
                      <span key={index} className="opportunity-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="opportunity-stats">
                    <div className="opportunity-stat">
                      <div className="opportunity-stat-icon"></div>
                      {opportunity.applicationCount} Applications
                    </div>
                    <div className="opportunity-stat">
                      <div className="opportunity-stat-icon"></div>
                      {opportunity.location}
                    </div>
                  </div>
                  <div className="opportunity-actions">
                    {opportunity.status === 'active' ? (
                      <>
                        <button
                          className="opportunity-action-btn primary"
                          onClick={() =>
                            handleOpportunityAction('edit', opportunity.id)
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="opportunity-action-btn secondary"
                          onClick={() =>
                            handleOpportunityAction('view', opportunity.id)
                          }
                        >
                          👁️ View
                        </button>
                        <button
                          className="opportunity-action-btn secondary"
                          onClick={() =>
                            handleOpportunityAction(
                              'applications',
                              opportunity.id
                            )
                          }
                        >
                          📋 Applications
                        </button>
                      </>
                    ) : opportunity.status === 'expired' ? (
                      <>
                        <button
                          className="opportunity-action-btn primary"
                          onClick={() =>
                            handleOpportunityAction('renew', opportunity.id)
                          }
                          disabled={opportunityMutation.loading}
                        >
                          {opportunityMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '🔄'
                          )}{' '}
                          Renew
                        </button>
                        <button
                          className="opportunity-action-btn secondary"
                          onClick={() =>
                            handleOpportunityAction('view', opportunity.id)
                          }
                        >
                          👁️ View
                        </button>
                        <button
                          className="opportunity-action-btn danger"
                          onClick={() =>
                            handleOpportunityAction('delete', opportunity.id)
                          }
                          disabled={opportunityMutation.loading}
                        >
                          {opportunityMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '🗑️'
                          )}{' '}
                          Delete
                        </button>
                      </>
                    ) : opportunity.status === 'pending' ? (
                      <>
                        <button
                          className="opportunity-action-btn primary"
                          onClick={() =>
                            handleOpportunityAction('approve', opportunity.id)
                          }
                          disabled={opportunityMutation.loading}
                        >
                          {opportunityMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '✅'
                          )}{' '}
                          Approve
                        </button>
                        <button
                          className="opportunity-action-btn secondary"
                          onClick={() =>
                            handleOpportunityAction('view', opportunity.id)
                          }
                        >
                          👁️ Review
                        </button>
                        <button
                          className="opportunity-action-btn danger"
                          onClick={() =>
                            handleOpportunityAction('reject', opportunity.id)
                          }
                          disabled={opportunityMutation.loading}
                        >
                          {opportunityMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '❌'
                          )}{' '}
                          Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="opportunity-action-btn primary"
                          onClick={() =>
                            handleOpportunityAction('edit', opportunity.id)
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="opportunity-action-btn secondary"
                          onClick={() =>
                            handleOpportunityAction('view', opportunity.id)
                          }
                        >
                          👁️ View
                        </button>
                        <button
                          className="opportunity-action-btn secondary"
                          onClick={() =>
                            handleOpportunityAction(
                              'applications',
                              opportunity.id
                            )
                          }
                        >
                          📋 Applications
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FilterDebugger
        filters={filters}
        data={opportunities}
        filteredData={filteredOpportunities}
        title="Opportunities"
      />
      <MasterDebugger />
    </div>
  );
};
