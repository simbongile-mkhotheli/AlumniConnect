import React, { useState, useMemo } from 'react';
import { useFilters, useBulkActions, useFilteredData } from '../../../../hooks';
import { formatDate, getStatusBadgeClass } from '../../../../utils';

interface Sponsor {
  id: string;
  name: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  status: 'active' | 'pending' | 'inactive' | 'expired';
  contactName: string;
  contactEmail: string;
  website: string;
  logoUrl?: string;
  description: string;
  sponsorshipAmount: number;
  eventsSponsored: number;
  contractStart: string;
  contractEnd: string;
  benefits: string[];
  tags: string[];
  lastContact: string;
}

interface SponsorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSponsor: (sponsorId: string) => void;
  onCreateSponsor?: () => void;
}

// Mock data - in real app this would come from API
const mockSponsors: Sponsor[] = [
  {
    id: '1',
    name: 'Telkom',
    tier: 'platinum',
    status: 'active',
    contactName: 'John Smith',
    contactEmail: 'john.smith@telkom.co.za',
    website: 'https://telkom.co.za',
    description:
      'Leading telecommunications company providing comprehensive digital solutions and connectivity services.',
    sponsorshipAmount: 500000,
    eventsSponsored: 12,
    contractStart: '2024-01-01T00:00:00Z',
    contractEnd: '2025-12-31T23:59:59Z',
    benefits: [
      'Logo placement',
      'Speaking opportunities',
      'Booth space',
      'Newsletter mentions',
    ],
    tags: ['Telecommunications', 'Technology', 'Enterprise'],
    lastContact: '2025-01-15T14:30:00Z',
  },
  {
    id: '2',
    name: 'CompTIA',
    tier: 'gold',
    status: 'active',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah.johnson@comptia.org',
    website: 'https://comptia.org',
    description:
      'Global leader in IT certifications and workforce development, empowering tech professionals worldwide.',
    sponsorshipAmount: 250000,
    eventsSponsored: 8,
    contractStart: '2024-03-01T00:00:00Z',
    contractEnd: '2025-02-28T23:59:59Z',
    benefits: [
      'Logo placement',
      'Speaking opportunities',
      'Newsletter mentions',
    ],
    tags: ['Certification', 'Education', 'IT Training'],
    lastContact: '2025-01-18T10:15:00Z',
  },
  {
    id: '3',
    name: 'GitHub',
    tier: 'gold',
    status: 'active',
    contactName: 'Michael Chen',
    contactEmail: 'michael.chen@github.com',
    website: 'https://github.com',
    description:
      "World's leading software development platform, fostering collaboration and innovation in open source.",
    sponsorshipAmount: 300000,
    eventsSponsored: 6,
    contractStart: '2024-06-01T00:00:00Z',
    contractEnd: '2025-05-31T23:59:59Z',
    benefits: ['Logo placement', 'Developer workshops', 'Swag distribution'],
    tags: ['Software Development', 'Open Source', 'DevOps'],
    lastContact: '2025-01-20T16:45:00Z',
  },
  {
    id: '4',
    name: 'iWeb',
    tier: 'silver',
    status: 'pending',
    contactName: 'Lisa Patel',
    contactEmail: 'lisa.patel@iweb.com',
    website: 'https://iweb.com',
    description:
      'Digital agency specializing in web development, e-commerce solutions, and digital marketing.',
    sponsorshipAmount: 100000,
    eventsSponsored: 2,
    contractStart: '2025-02-01T00:00:00Z',
    contractEnd: '2026-01-31T23:59:59Z',
    benefits: ['Logo placement', 'Newsletter mentions'],
    tags: ['Web Development', 'E-commerce', 'Digital Marketing'],
    lastContact: '2025-01-10T09:20:00Z',
  },
];

export function SponsorsModal({
  isOpen,
  onClose,
  onEditSponsor,
  onCreateSponsor,
}: SponsorsModalProps) {
  const { filters, updateFilters, updateSearch, clearFilters } =
    useFilters('sponsors');
  const {
    selectedItems,
    isVisible,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelections,
    performBulkAction,
  } = useBulkActions('sponsors');

  const filteredSponsors = useFilteredData(mockSponsors, filters, [
    'name',
    'contactName',
    'description',
  ]);

  const summaryStats = useMemo(() => {
    return {
      total: mockSponsors.length,
      active: mockSponsors.filter(s => s.status === 'active').length,
      pending: mockSponsors.filter(s => s.status === 'pending').length,
      totalAmount: mockSponsors.reduce(
        (sum, s) => sum + s.sponsorshipAmount,
        0
      ),
      totalEvents: mockSponsors.reduce((sum, s) => sum + s.eventsSponsored, 0),
    };
  }, []);

  const handleSelectAll = () => {
    const allIds = filteredSponsors.map(sponsor => sponsor.id);
    selectAll(allIds);
  };

  const handleBulkAction = (action: string) => {
    performBulkAction(action);
    alert(`Performing ${action} on ${selectedCount} selected sponsors`);
  };

  const handleSponsorAction = (action: string, sponsorId: string) => {
    console.log(`${action} sponsor:`, sponsorId);

    switch (action) {
      case 'edit':
        onEditSponsor(sponsorId);
        break;
      case 'view':
        alert(`Viewing sponsor ${sponsorId}`);
        break;
      case 'activate':
        alert(`Activating sponsor ${sponsorId}`);
        break;
      case 'renew':
        alert(`Renewing contract for sponsor ${sponsorId}`);
        break;
      case 'suspend':
        alert(`Suspending sponsor ${sponsorId}`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this sponsor?')) {
          alert(`Deleting sponsor ${sponsorId}`);
        }
        break;
      case 'analytics':
        alert(`Viewing analytics for sponsor ${sponsorId}`);
        break;
      case 'contact':
        alert(`Contacting sponsor ${sponsorId}`);
        break;
      default:
        alert(`Action ${action} for sponsor ${sponsorId}`);
    }
  };

  const handleCreateSponsor = () => {
    if (onCreateSponsor) {
      onCreateSponsor();
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return '💎';
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '🏷️';
    }
  };

  const getTierDisplayName = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="sponsors-overlay active">
      <div className="sponsors-manager">
        <div className="sponsors-header">
          <h2>Sponsors Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="admin-card-action primary"
              onClick={handleCreateSponsor}
              title="Create New Sponsor"
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ➕ Create Sponsor
            </button>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="sponsors-body">
          {/* Sponsors Summary */}
          <div className="sponsors-summary">
            <div className="sponsor-summary-card">
              <div className="sponsor-summary-value">{summaryStats.total}</div>
              <div className="sponsor-summary-label">Total Sponsors</div>
            </div>
            <div className="sponsor-summary-card">
              <div className="sponsor-summary-value">{summaryStats.active}</div>
              <div className="sponsor-summary-label">Active</div>
            </div>
            <div className="sponsor-summary-card">
              <div className="sponsor-summary-value">
                {summaryStats.pending}
              </div>
              <div className="sponsor-summary-label">Pending</div>
            </div>
            <div className="sponsor-summary-card">
              <div className="sponsor-summary-value">
                {formatCurrency(summaryStats.totalAmount)}
              </div>
              <div className="sponsor-summary-label">Total Value</div>
            </div>
            <div className="sponsor-summary-card">
              <div className="sponsor-summary-value">
                {summaryStats.totalEvents}
              </div>
              <div className="sponsor-summary-label">Events Sponsored</div>
            </div>
          </div>

          {/* Sponsor Filters */}
          <div className="sponsor-filters">
            <div className="sponsor-filter-group">
              <select
                className="sponsor-filter-select"
                value={filters.status || ''}
                onChange={e =>
                  updateFilters({ status: e.target.value || undefined })
                }
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="sponsor-filter-group">
              <select
                className="sponsor-filter-select"
                value={filters.tier || ''}
                onChange={e =>
                  updateFilters({ tier: e.target.value || undefined })
                }
              >
                <option value="">All Tiers</option>
                <option value="platinum">Platinum</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
              </select>
            </div>
            <div className="sponsor-filter-group">
              <input
                type="text"
                className="sponsor-search-input"
                placeholder="Search sponsors..."
                value={filters.search || ''}
                onChange={e => updateSearch(e.target.value)}
              />
            </div>
            <button className="filter-clear-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>

          {/* Bulk Actions */}
          {isVisible && (
            <div className="bulk-actions">
              <div className="bulk-selection">
                <input
                  type="checkbox"
                  id="selectAllSponsors"
                  checked={selectedCount === filteredSponsors.length}
                  onChange={handleSelectAll}
                />
                <label htmlFor="selectAllSponsors">
                  {selectedCount} of {filteredSponsors.length} selected
                </label>
              </div>
              <div className="bulk-buttons">
                <button
                  className="bulk-btn publish"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate Selected
                </button>
                <button
                  className="bulk-btn draft"
                  onClick={() => handleBulkAction('contact')}
                >
                  Contact Selected
                </button>
                <button
                  className="bulk-btn delete"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Sponsors Grid */}
          <div className="sponsors-grid">
            {filteredSponsors.map(sponsor => (
              <div
                key={sponsor.id}
                className="sponsor-card"
                data-status={sponsor.status}
              >
                <input
                  type="checkbox"
                  className="sponsor-checkbox"
                  checked={selectedItems.has(sponsor.id)}
                  onChange={() => toggleSelection(sponsor.id)}
                />

                <div className="sponsor-image">
                  <div className="sponsor-image-placeholder">🏢</div>
                  <div className={`sponsor-tier-badge ${sponsor.tier}`}>
                    {getTierIcon(sponsor.tier)}{' '}
                    {getTierDisplayName(sponsor.tier)}
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
                      {sponsor.contactName} •{' '}
                      {formatCurrency(sponsor.sponsorshipAmount)}
                    </div>
                  </div>

                  <div className="sponsor-excerpt">{sponsor.description}</div>

                  <div className="sponsor-meta">
                    <div className="sponsor-meta-item">
                      📅 Contract: {formatDate(sponsor.contractStart)} -{' '}
                      {formatDate(sponsor.contractEnd)}
                    </div>
                    <div className="sponsor-meta-item">
                      📞 Last Contact: {formatDate(sponsor.lastContact)}
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
                      {sponsor.eventsSponsored} Events
                    </div>
                    <div className="sponsor-stat">
                      <div className="sponsor-stat-icon"></div>
                      {sponsor.benefits.length} Benefits
                    </div>
                    <div className="sponsor-stat">
                      <div className="sponsor-stat-icon"></div>
                      {sponsor.website}
                    </div>
                  </div>

                  <div className="sponsor-actions">
                    <button
                      className="sponsor-action-btn primary"
                      onClick={() => handleSponsorAction('edit', sponsor.id)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="sponsor-action-btn secondary"
                      onClick={() => handleSponsorAction('view', sponsor.id)}
                    >
                      👁️ View
                    </button>
                    <button
                      className="sponsor-action-btn secondary"
                      onClick={() => handleSponsorAction('contact', sponsor.id)}
                    >
                      📞 Contact
                    </button>
                    <button
                      className="sponsor-action-btn secondary"
                      onClick={() =>
                        handleSponsorAction('analytics', sponsor.id)
                      }
                    >
                      📊 Analytics
                    </button>
                    {sponsor.status === 'pending' && (
                      <button
                        className="sponsor-action-btn primary"
                        onClick={() =>
                          handleSponsorAction('activate', sponsor.id)
                        }
                      >
                        ✅ Activate
                      </button>
                    )}
                    {sponsor.status === 'active' && (
                      <button
                        className="sponsor-action-btn secondary"
                        onClick={() => handleSponsorAction('renew', sponsor.id)}
                      >
                        🔄 Renew
                      </button>
                    )}
                    <button
                      className="sponsor-action-btn danger"
                      onClick={() => handleSponsorAction('delete', sponsor.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSponsors.length === 0 && (
            <div className="no-sponsors">
              <p>No sponsors found matching your criteria.</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
