import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFilters,
  useBulkActions,
  useApiData,
  useMutation,
} from '../../../../hooks';
import { SponsorsService } from '@features/sponsors/services';
import { LoadingSpinner, CardSkeleton } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage, EmptyState } from '../../../../components/common/ErrorMessage';
import type { Sponsor, ApiResponse } from '@features/sponsors/types';

export const SponsorsManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const { filters, updateFilters } = useFilters('sponsors', {
    status: '',
    tier: '',
    search: '',
  });

  const {
    selectedItems,
    isVisible: isBulkVisible,
    toggleSelection,
    selectAll,
    clearSelections,
  } = useBulkActions('sponsors');

  // Fetch sponsors data with API integration
  const {
    data: sponsorsResponse,
    loading,
    error,
    refetch,
  } = useApiData(() => SponsorsService.getSponsors(1, 50, filters), [filters], {
    cacheKey: 'sponsors-list',
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Bulk operations mutation
  const bulkMutation = useMutation(
    ({ operation, ids }: { operation: string; ids: string[] }) =>
      SponsorsService.bulkOperation(
        operation as 'activate' | 'deactivate' | 'delete',
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

  // Individual sponsor operations
  const sponsorMutation = useMutation<
    ApiResponse<any>,
    { action: string; sponsorId: string }
  >(
    ({ action, sponsorId }: { action: string; sponsorId: string }) => {
      switch (action) {
        case 'activate':
          return SponsorsService.activateSponsor(sponsorId);
        case 'deactivate':
          return SponsorsService.deactivateSponsor(sponsorId);
        case 'delete':
          return SponsorsService.deleteSponsor(sponsorId);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    },
    {
      onSuccess: () => {
        refetch(); // Refresh data after successful operation
      },
      onError: error => {
        console.error('Sponsor operation failed:', error);
      },
    }
  );

  const handleCreateSponsor = () => {
    navigate('/admin/sponsors/create');
  };

  const handleClose = () => {
    navigate('/admin');
  };

  const sponsors = sponsorsResponse?.data || [];
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);

  // Filter sponsors based on current filters (client-side filtering for cached data)
  useEffect(() => {
    let filtered = sponsors;

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(sponsor => sponsor.status === filters.status);
    }

    if (filters.tier && filters.tier !== 'all') {
      filtered = filtered.filter(sponsor => sponsor.tier === filters.tier);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        sponsor =>
          sponsor.name.toLowerCase().includes(searchLower) ||
          sponsor.description.toLowerCase().includes(searchLower) ||
          sponsor.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredSponsors(filtered);
  }, [filters, sponsors]);

  const handleBulkAction = async (action: string) => {
    const selectedIds = Array.from(selectedItems) as string[];
    if (selectedIds.length === 0) return;

    // Show confirmation dialog for destructive actions
    if (action === 'delete') {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete ${selectedIds.length} sponsor${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    try {
      await bulkMutation.mutate({ operation: action, ids: selectedIds });
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    }
  };

  const handleSponsorAction = async (action: string, sponsorId: string) => {
    switch (action) {
      case 'edit':
        navigate(`/admin/sponsors/edit/${sponsorId}`);
        break;
      case 'view':
        navigate(`/admin/sponsors/view/${sponsorId}`);
        break;
      case 'analytics':
        // Navigate to analytics page or open analytics modal
        console.log('Opening analytics for sponsor:', sponsorId);
        break;
      case 'activate':
      case 'deactivate':
      case 'delete':
        // Show confirmation dialog for delete action
        const confirmed = window.confirm(
          `Are you sure you want to permanently delete this sponsor? This action cannot be undone.`
        );
        if (!confirmed) return;
        
        try {
          await sponsorMutation.mutate({ action, sponsorId });
        } catch (error) {
          console.error(`${action} sponsor failed:`, error);
        }
        break;
      default:
        console.log(`${action} sponsor:`, sponsorId);
    }
  };

  const getSponsorIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'telkom':
        return '🏢';
      case 'comptia':
        return '🎓';
      case 'iweb':
        return '☁️';
      case 'github':
        return '💻';
      default:
        return '🏢';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  // Loading state
  if (loading && !sponsors.length) {
    return (
      <div className="sponsors-overlay active">
        <div className="sponsors-manager">
          <div className="sponsors-header">
            <h2 className="sponsors-title">Sponsors Manager</h2>
          </div>
          <div className="sponsors-body">
            <div className="sponsors-summary">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} className="sponsor-summary-card" />
              ))}
            </div>
            <div className="sponsors-grid">
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
  if (error && !sponsors.length) {
    return (
      <div className="sponsors-overlay active">
        <div className="sponsors-manager">
          <div className="sponsors-header">
            <h2 className="sponsors-title">Sponsors Manager</h2>
          </div>
          <div className="sponsors-body">
            <ErrorMessage
              error={error}
              title="Failed to load sponsors"
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
  if (!loading && filteredSponsors.length === 0 && !error) {
    return (
      <div className="sponsors-overlay active">
        <div className="sponsors-manager">
          <div className="sponsors-header">
            <h2 className="sponsors-title">Sponsors Manager</h2>
          </div>
          <div className="sponsors-body">
            <EmptyState
              title="No sponsors found"
              description="No sponsors match your current filters. Try adjusting your search criteria."
              action={undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sponsors-overlay active">
      <div className="sponsors-manager">
        <div className="sponsors-header">
          <h2 className="sponsors-title">Sponsors Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {loading && <LoadingSpinner size="small" />}
            <button
              className="btn btn-primary"
              onClick={handleCreateSponsor}
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
              ➕ Create Sponsor
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

        <div className="sponsors-body">
          {/* Sponsors Summary */}
          <div className="sponsors-summary">
            <div className="sponsor-summary-card">
              <div className="sponsor-summary-value">{sponsors.length}</div>
              <div className="sponsor-summary-label">Total Sponsors</div>
            </div>
            <div className="sponsor-summary-card">
              <div className="sponsor-summary-value">
                {sponsors.filter(s => s.status === 'active').length}
              </div>
              <div className="sponsor-summary-label">Active</div>
            </div>
            <div className="sponsor-summary-card">
              <div className="sponsor-summary-value">
                {sponsors.filter(s => s.status === 'pending').length}
              </div>
              <div className="sponsor-summary-label">Pending</div>
            </div>
            <div className="sponsor-summary-card">
              <div className="sponsor-summary-value">
                {formatCurrency(
                  sponsors.reduce((sum, s) => sum + s.totalValue, 0)
                )}
              </div>
              <div className="sponsor-summary-label">Total Value</div>
            </div>
            <div className="sponsor-summary-card">
              <div className="sponsor-summary-value">
                {sponsors.reduce((sum, s) => sum + s.eventsSponsored, 0)}
              </div>
              <div className="sponsor-summary-label">Events Sponsored</div>
            </div>
            <div className="sponsor-summary-card">
              <div className="sponsor-summary-value">
                {sponsors.reduce((sum, s) => sum + s.chaptersSponsored, 0)}
              </div>
              <div className="sponsor-summary-label">Chapters Sponsored</div>
            </div>
          </div>

          {/* Sponsor Filters */}
          <div className="sponsor-filters">
            <div className="sponsor-filter-group">
              <label className="sponsor-filter-label">Status:</label>
              <select
                className="sponsor-filter-select"
                value={filters.status || ''}
                onChange={e => updateFilters({ status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="sponsor-filter-group">
              <label className="sponsor-filter-label">Tier:</label>
              <select
                className="sponsor-filter-select"
                value={filters.tier || ''}
                onChange={e => updateFilters({ tier: e.target.value })}
              >
                <option value="">All Tiers</option>
                <option value="platinum">Platinum</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
              </select>
            </div>
            <input
              type="text"
              className="sponsor-search-input"
              placeholder="Search sponsors..."
              value={filters.search || ''}
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
                  selectedItems.size === filteredSponsors.length
                }
                onChange={() => selectAll(filteredSponsors.map(s => s.id))}
              />
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

          {/* Error message for bulk operations */}
          {bulkMutation.error && (
            <ErrorMessage
              error={bulkMutation.error}
              title="Bulk operation failed"
              variant="banner"
              size="small"
            />
          )}

          {/* Sponsors Grid */}
          <div className="sponsors-grid">
            {filteredSponsors.map(sponsor => (
              <div
                key={sponsor.id}
                className={`sponsor-card ${selectedItems.has(sponsor.id) ? 'selected' : ''}`}
                data-status={sponsor.status}
                data-tier={sponsor.tier}
              >
                <input
                  type="checkbox"
                  className="sponsor-checkbox"
                  checked={selectedItems.has(sponsor.id)}
                  onChange={() => toggleSelection(sponsor.id)}
                />
                <div className="sponsor-image">
                  <div className="sponsor-image-placeholder">
                    {getSponsorIcon(sponsor.name)}
                  </div>
                  <div className={`sponsor-tier-badge ${sponsor.tier}`}>
                    {sponsor.tier.charAt(0).toUpperCase() +
                      sponsor.tier.slice(1)}
                  </div>
                  <div className={`sponsor-status ${sponsor.status}`}>
                    {sponsor.status.charAt(0).toUpperCase() +
                      sponsor.status.slice(1)}
                  </div>
                </div>
                <div className="sponsor-card-content">
                  <div className="sponsor-card-header">
                    <div className="sponsor-title">{sponsor.name}</div>
                    <div className="sponsor-subtitle">
                      {sponsor.tags[0]} •{' '}
                      {sponsor.tier.charAt(0).toUpperCase() +
                        sponsor.tier.slice(1)}{' '}
                      Sponsor
                    </div>
                  </div>
                  <div className="sponsor-excerpt">{sponsor.description}</div>
                  <div className="sponsor-meta">
                    <div className="sponsor-meta-item">
                      📅 Partnership since {sponsor.partnershipSince}
                    </div>
                    <div className="sponsor-meta-item">
                      💰 {formatCurrency(sponsor.totalValue)} annual value
                    </div>
                  </div>
                  <div className="sponsor-tags">
                    {sponsor.tags.map((tag, index) => (
                      <span key={index} className="sponsor-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="sponsor-stats">
                    <div className="sponsor-stat">
                      <div className="sponsor-stat-icon"></div>
                      {sponsor.eventsSponsored} Events Sponsored
                    </div>
                    <div className="sponsor-stat">
                      <div className="sponsor-stat-icon"></div>
                      {sponsor.chaptersSponsored} Chapters Supported
                    </div>
                  </div>
                  <div className="sponsor-actions">
                    {sponsor.status === 'pending' ? (
                      <>
                        <button
                          className="sponsor-action-btn primary"
                          onClick={() =>
                            handleSponsorAction('activate', sponsor.id)
                          }
                          disabled={sponsorMutation.loading}
                        >
                          {sponsorMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '✅'
                          )}{' '}
                          Approve
                        </button>
                        <button
                          className="sponsor-action-btn secondary"
                          onClick={() =>
                            handleSponsorAction('view', sponsor.id)
                          }
                        >
                          👁️ Review
                        </button>
                        <button
                          className="sponsor-action-btn danger"
                          onClick={() =>
                            handleSponsorAction('delete', sponsor.id)
                          }
                          disabled={sponsorMutation.loading}
                        >
                          {sponsorMutation.loading ? (
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
                          className="sponsor-action-btn primary"
                          onClick={() =>
                            handleSponsorAction('edit', sponsor.id)
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="sponsor-action-btn secondary"
                          onClick={() =>
                            handleSponsorAction('view', sponsor.id)
                          }
                        >
                          👁️ View
                        </button>
                        <button
                          className="sponsor-action-btn secondary"
                          onClick={() =>
                            handleSponsorAction('analytics', sponsor.id)
                          }
                        >
                          📊 Analytics
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
    </div>
  );
};
