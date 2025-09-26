// src/components/pages/PartnersManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFilters,
  useBulkActions,
  useApiData,
  useMutation,
} from '../../hooks';
import { PartnersService } from '@features/partners/services';
import { LoadingSpinner, CardSkeleton } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage, EmptyState } from '../../../../components/common/ErrorMessage';
import type { Partner } from '../../types';

const PartnersManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const { filters, updateFilters } = useFilters('partners', {
    status: '',
    type: '',
    search: '',
  });

  const {
    selectedItems,
    isVisible: isBulkVisible,
    toggleSelection,
    selectAll,
    clearSelections,
  } = useBulkActions('partners');

  // Fetch partners data with API integration
  const {
    data: partnersResponse,
    loading,
    error,
    refetch,
  } = useApiData(() => PartnersService.getPartners(1, 50, filters), [filters], {
    cacheKey: 'partners-list',
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Bulk operations mutation (typed)
  const bulkMutation = useMutation(
    ({
      operation,
      ids,
    }: {
      operation: 'activate' | 'deactivate' | 'delete';
      ids: string[];
    }) => PartnersService.bulkOperation(operation, ids),
    {
      onSuccess: () => {
        refetch(); // Refresh data after successful bulk operation
        clearSelections();
      },
      onError: err => {
        console.error('Bulk operation failed:', err);
      },
    }
  );

  // Individual partner operations
  // NOTE: avoid passing 3 generic params to useMutation (your hook expects different generics).
  // Keep the mutation body typed and return Promise<any> for compatibility.
  const partnerMutation = useMutation(
    async ({
      action,
      partnerId,
    }: {
      action: 'activate' | 'deactivate' | 'delete';
      partnerId: string;
    }) => {
      switch (action) {
        case 'activate':
          return PartnersService.activatePartner(partnerId);
        case 'deactivate':
          return PartnersService.deactivatePartner(partnerId);
        case 'delete':
          return PartnersService.deletePartner(partnerId);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    },
    {
      onSuccess: () => {
        refetch();
      },
      onError: err => {
        console.error('Partner operation failed:', err);
      },
    }
  );

  const partners = partnersResponse?.data ?? [];
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);

  // Filter partners based on current filters (client-side filtering for cached data)
  useEffect(() => {
    let filtered = partners;

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(partner => partner.status === filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(partner => partner.type === filters.type);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        partner =>
          (partner.name ?? '').toLowerCase().includes(searchLower) ||
          (partner.description ?? '').toLowerCase().includes(searchLower) ||
          (partner.tags ?? []).some(tag =>
            tag.toLowerCase().includes(searchLower)
          )
      );
    }

    setFilteredPartners(filtered);
  }, [filters, partners]);

  const handleBulkAction = async (
    action: 'activate' | 'deactivate' | 'delete'
  ) => {
    const selectedIds = Array.from(selectedItems) as string[];
    if (selectedIds.length === 0) return;

    // Show confirmation dialog for destructive actions
    if (action === 'delete') {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete ${selectedIds.length} partner${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    try {
      await bulkMutation.mutate({ operation: action, ids: selectedIds });
    } catch (err) {
      console.error(`Bulk ${action} failed:`, err);
    }
  };

  const handlePartnerAction = async (action: string, partnerId: string) => {
    switch (action) {
      case 'edit':
        navigate(`/admin/partners/edit/${partnerId}`);
        break;
      case 'view':
        navigate(`/admin/partners/view/${partnerId}`);
        break;
      case 'analytics':
        console.log('Opening analytics for partner:', partnerId);
        break;
      case 'activate':
      case 'deactivate':
      case 'delete':
        // Show confirmation dialog for delete action
        const confirmed = window.confirm(
          `Are you sure you want to permanently delete this partner? This action cannot be undone.`
        );
        if (!confirmed) return;
        
        try {
          await partnerMutation.mutate({
            action: action as 'activate' | 'deactivate' | 'delete',
            partnerId,
          });
        } catch (err) {
          console.error(`${action} partner failed:`, err);
        }
        break;
      case 'approve':
        try {
          await partnerMutation.mutate({ action: 'activate', partnerId });
        } catch (err) {
          console.error('Approve partner failed:', err);
        }
        break;
      case 'reject':
        try {
          await partnerMutation.mutate({ action: 'delete', partnerId });
        } catch (err) {
          console.error('Reject partner failed:', err);
        }
        break;
      default:
        console.log(`${action} partner:`, partnerId);
    }
  };

  const handleCreatePartner = () => {
    navigate('/admin/partners/create');
  };

  const handleClose = () => {
    navigate('/admin');
  };

  const getPartnerIcon = (name: string) => {
    switch ((name || '').toLowerCase()) {
      case 'standard bank':
        return '🏦';
      case 'microsoft azure':
        return '☁️';
      case 'edutech innovations':
        return '🚀';
      case 'deloitte digital':
        return '💼';
      default:
        return '🏢';
    }
  };

  const getTypeDisplayName = (type: Partner['type']) => {
    switch (type) {
      case 'hiring':
        return 'Hiring Partner';
      case 'technology':
        return 'Technology Partner';
      case 'education':
        return 'Education Partner';
      case 'startup':
        return 'Startup Partner';
      case 'company':
        return 'Company';
      case 'non_profit':
        return 'Non-profit';
      case 'academic':
        return 'Academic';
      default:
        return 'Partner';
    }
  };

  // Loading / Error / Empty states (same UI as before)
  if (loading && partners.length === 0) {
    return (
      <div className="partners-overlay active">
        <div className="partners-manager">
          <div className="partners-header">
            <h2 className="partners-title">Partners Manager</h2>
          </div>
          <div className="partners-body">
            <div className="partners-summary">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} className="partner-summary-card" />
              ))}
            </div>
            <div className="partners-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && partners.length === 0) {
    return (
      <div className="partners-overlay active">
        <div className="partners-manager">
          <div className="partners-header">
            <h2 className="partners-title">Partners Manager</h2>
          </div>
          <div className="partners-body">
            <ErrorMessage
              error={error}
              title="Failed to load partners"
              showRetry
              onRetry={refetch}
              variant="card"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!loading && filteredPartners.length === 0 && !error) {
    return (
      <div className="partners-overlay active">
        <div className="partners-manager">
          <div className="partners-header">
            <h2 className="partners-title">Partners Manager</h2>
          </div>
          <div className="partners-body">
            <EmptyState
              title="No partners found"
              description="No partners match your current filters. Try adjusting your search criteria."
              action={undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="partners-overlay active">
      <div className="partners-manager">
        <div className="partners-header">
          <h2 className="partners-title">Partners Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {loading && <LoadingSpinner size="small" />}
            <button
              className="btn btn-primary"
              onClick={handleCreatePartner}
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
              ➕ Create Partner
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

        <div className="partners-body">
          <div className="partners-summary">
            <div className="partner-summary-card">
              <div className="partner-summary-value">{partners.length}</div>
              <div className="partner-summary-label">Total Partners</div>
            </div>
            <div className="partner-summary-card">
              <div className="partner-summary-value">
                {partners.filter(p => p.status === 'active').length}
              </div>
              <div className="partner-summary-label">Active</div>
            </div>
            <div className="partner-summary-card">
              <div className="partner-summary-value">
                {partners.filter(p => p.status === 'pending').length}
              </div>
              <div className="partner-summary-label">Pending</div>
            </div>
            <div className="partner-summary-card">
              <div className="partner-summary-value">
                {partners.filter(p => p.status === 'inactive').length}
              </div>
              <div className="partner-summary-label">Inactive</div>
            </div>
            <div className="partner-summary-card">
              <div className="partner-summary-value">
                {partners.reduce(
                  (sum, p) => sum + (p.jobOpportunities ?? 0),
                  0
                )}
              </div>
              <div className="partner-summary-label">Job Opportunities</div>
            </div>
            <div className="partner-summary-card">
              <div className="partner-summary-value">
                {partners.reduce((sum, p) => sum + (p.alumniHired ?? 0), 0)}
              </div>
              <div className="partner-summary-label">Alumni Hired</div>
            </div>
          </div>

          <div className="partner-filters">
            <div className="partner-filter-group">
              <label className="partner-filter-label">Status:</label>
              <select
                className="partner-filter-select"
                value={filters.status || ''}
                onChange={e => updateFilters({ status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="partner-filter-group">
              <label className="partner-filter-label">Type:</label>
              <select
                className="partner-filter-select"
                value={filters.type || ''}
                onChange={e => updateFilters({ type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="hiring">Hiring Partner</option>
                <option value="technology">Technology Partner</option>
                <option value="education">Education Partner</option>
                <option value="startup">Startup Partner</option>
                <option value="company">Company</option>
                <option value="non_profit">Non-profit</option>
                <option value="academic">Academic</option>
              </select>
            </div>
            <input
              type="text"
              className="partner-search-input"
              placeholder="Search partners..."
              value={filters.search || ''}
              onChange={e => updateFilters({ search: e.target.value })}
            />
          </div>

          <div className={`bulk-actions ${isBulkVisible ? '' : 'hidden'}`}>
            <label className="bulk-select-all">
              <input
                type="checkbox"
                checked={
                  selectedItems.size > 0 &&
                  selectedItems.size === filteredPartners.length
                }
                onChange={() => selectAll(filteredPartners.map(p => p.id))}
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

          {bulkMutation.error && (
            <ErrorMessage
              error={bulkMutation.error}
              title="Bulk operation failed"
              variant="banner"
              size="small"
            />
          )}

          <div className="partners-grid">
            {filteredPartners.map(partner => (
              <div
                key={partner.id}
                className={`partner-card ${selectedItems.has(partner.id) ? 'selected' : ''}`}
                data-status={partner.status}
                data-type={partner.type}
              >
                <input
                  type="checkbox"
                  className="partner-checkbox"
                  checked={selectedItems.has(partner.id)}
                  onChange={() => toggleSelection(partner.id)}
                />
                <div className="partner-image">
                  <div className="partner-image-placeholder">
                    {getPartnerIcon(partner.name)}
                  </div>
                  <div className={`partner-type-badge ${partner.type}`}>
                    {getTypeDisplayName(partner.type)}
                  </div>
                  <div className={`partner-status ${partner.status}`}>
                    {partner.status.charAt(0).toUpperCase() +
                      partner.status.slice(1)}
                  </div>
                </div>
                <div className="partner-card-content">
                  <div className="partner-card-header">
                    <div className="partner-title">{partner.name}</div>
                    <div className="partner-subtitle">
                      {(partner.tags && partner.tags[0]) ?? 'partner'} •{' '}
                      {getTypeDisplayName(partner.type)}
                    </div>
                  </div>
                  <div className="partner-excerpt">
                    {partner.description ?? ''}
                  </div>
                  <div className="partner-meta">
                    <div className="partner-meta-item">
                      📅 Partnership since {partner.partnershipSince ?? '—'}
                    </div>
                    <div className="partner-meta-item">
                      {partner.type === 'hiring'
                        ? `👥 ${partner.alumniHired ?? 0} Alumni hired`
                        : partner.type === 'technology'
                          ? `🎓 ${partner.alumniHired ?? 0} Alumni Certified`
                          : `💼 ${partner.jobOpportunities ?? 0} Positions available`}
                    </div>
                  </div>
                  <div className="partner-tags">
                    {(partner.tags ?? []).map((tag, index) => (
                      <span key={index} className="partner-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="partner-stats">
                    <div className="partner-stat">
                      <div className="partner-stat-icon"></div>
                      {partner.type === 'technology'
                        ? `${partner.jobOpportunities ?? 0} Training Programs`
                        : `${partner.jobOpportunities ?? 0} Open Positions`}
                    </div>
                    <div className="partner-stat">
                      <div className="partner-stat-icon"></div>
                      {typeof partner.hireRate === 'number' &&
                      partner.hireRate > 0
                        ? `${partner.hireRate}% Hire Rate`
                        : partner.type === 'technology'
                          ? `${partner.alumniHired ?? 0} Alumni Certified`
                          : '-- Hire Rate'}
                    </div>
                  </div>
                  <div className="partner-actions">
                    {partner.status === 'pending' ? (
                      <>
                        <button
                          className="partner-action-btn primary"
                          onClick={() =>
                            handlePartnerAction('approve', partner.id)
                          }
                          disabled={partnerMutation.loading}
                        >
                          {partnerMutation.loading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            '✅'
                          )}{' '}
                          Approve
                        </button>
                        <button
                          className="partner-action-btn secondary"
                          onClick={() =>
                            handlePartnerAction('view', partner.id)
                          }
                        >
                          👁️ Review
                        </button>
                        <button
                          className="partner-action-btn danger"
                          onClick={() =>
                            handlePartnerAction('reject', partner.id)
                          }
                          disabled={partnerMutation.loading}
                        >
                          {partnerMutation.loading ? (
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
                          className="partner-action-btn primary"
                          onClick={() =>
                            handlePartnerAction('edit', partner.id)
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="partner-action-btn secondary"
                          onClick={() =>
                            handlePartnerAction('view', partner.id)
                          }
                        >
                          👁️ View
                        </button>
                        <button
                          className="partner-action-btn secondary"
                          onClick={() =>
                            handlePartnerAction('analytics', partner.id)
                          }
                        >
                          📊 Analytics
                        </button>
                        <button
                          className="partner-action-btn danger"
                          onClick={() =>
                            handlePartnerAction('delete', partner.id)
                          }
                          disabled={partnerMutation.loading}
                        >
                          {partnerMutation.loading ? (
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
      </div>
    </div>
  );
};

export default PartnersManagementPage;
