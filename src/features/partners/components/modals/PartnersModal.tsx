import React, { useState, useMemo } from 'react';
import { useFilters, useBulkActions, useFilteredData } from '../../../../hooks';
import { formatDate, getStatusBadgeClass } from '../../../../utils';

interface Partner {
  id: string;
  name: string;
  type: 'hiring' | 'technology' | 'education' | 'startup' | 'nonprofit';
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  contactName: string;
  contactEmail: string;
  website: string;
  logoUrl?: string;
  description: string;
  partnershipStart: string;
  lastCollaboration: string;
  collaborationsCount: number;
  benefits: string[];
  tags: string[];
  location: string;
  industry: string;
}

interface PartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditPartner: (partnerId: string) => void;
  onCreatePartner?: () => void;
}

// Mock data - in real app this would come from API
const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    type: 'hiring',
    status: 'active',
    contactName: 'Emma Wilson',
    contactEmail: 'emma.wilson@techcorp.com',
    website: 'https://techcorp.com',
    description:
      'Leading technology company specializing in cloud solutions and enterprise software development.',
    partnershipStart: '2023-06-15T00:00:00Z',
    lastCollaboration: '2025-01-18T14:30:00Z',
    collaborationsCount: 15,
    benefits: [
      'Job postings',
      'Internship programs',
      'Tech talks',
      'Mentorship',
    ],
    tags: ['Cloud Computing', 'Enterprise Software', 'Remote Work'],
    location: 'Cape Town, South Africa',
    industry: 'Technology',
  },
  {
    id: '2',
    name: 'Innovation Hub',
    type: 'startup',
    status: 'active',
    contactName: 'David Mthembu',
    contactEmail: 'david@innovationhub.co.za',
    website: 'https://innovationhub.co.za',
    description:
      'Startup incubator and accelerator program supporting early-stage technology companies.',
    partnershipStart: '2024-01-10T00:00:00Z',
    lastCollaboration: '2025-01-20T10:15:00Z',
    collaborationsCount: 8,
    benefits: [
      'Startup mentorship',
      'Funding opportunities',
      'Networking events',
    ],
    tags: ['Startups', 'Entrepreneurship', 'Funding', 'Incubation'],
    location: 'Johannesburg, South Africa',
    industry: 'Startup Ecosystem',
  },
  {
    id: '3',
    name: 'EduTech Academy',
    type: 'education',
    status: 'active',
    contactName: 'Sarah Patel',
    contactEmail: 'sarah@edutech.academy',
    website: 'https://edutech.academy',
    description:
      'Online education platform offering professional development courses and certifications.',
    partnershipStart: '2023-09-20T00:00:00Z',
    lastCollaboration: '2025-01-15T16:45:00Z',
    collaborationsCount: 12,
    benefits: [
      'Course discounts',
      'Certification programs',
      'Webinars',
      'Career guidance',
    ],
    tags: ['Online Learning', 'Certifications', 'Professional Development'],
    location: 'Durban, South Africa',
    industry: 'Education Technology',
  },
  {
    id: '4',
    name: 'GreenTech Innovations',
    type: 'technology',
    status: 'pending',
    contactName: 'Michael Chen',
    contactEmail: 'michael@greentech.co.za',
    website: 'https://greentech.co.za',
    description:
      'Sustainable technology company focused on renewable energy solutions and environmental impact.',
    partnershipStart: '2025-01-01T00:00:00Z',
    lastCollaboration: '2025-01-10T09:20:00Z',
    collaborationsCount: 2,
    benefits: [
      'Sustainability projects',
      'Green tech workshops',
      'Research collaboration',
    ],
    tags: ['Sustainability', 'Renewable Energy', 'Environmental Tech'],
    location: 'Pretoria, South Africa',
    industry: 'Clean Technology',
  },
  {
    id: '5',
    name: 'Community Impact Foundation',
    type: 'nonprofit',
    status: 'active',
    contactName: 'Aisha Hassan',
    contactEmail: 'aisha@communityimpact.org',
    website: 'https://communityimpact.org',
    description:
      'Non-profit organization focused on community development and social impact initiatives.',
    partnershipStart: '2023-03-12T00:00:00Z',
    lastCollaboration: '2025-01-12T11:30:00Z',
    collaborationsCount: 20,
    benefits: [
      'Volunteer opportunities',
      'Social impact projects',
      'Community outreach',
    ],
    tags: ['Social Impact', 'Community Development', 'Volunteering'],
    location: 'Port Elizabeth, South Africa',
    industry: 'Non-profit',
  },
];

export function PartnersModal({
  isOpen,
  onClose,
  onEditPartner,
  onCreatePartner,
}: PartnersModalProps) {
  const { filters, updateFilters, updateSearch, clearFilters } =
    useFilters('partners');
  const {
    selectedItems,
    isVisible,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelections,
    performBulkAction,
  } = useBulkActions('partners');

  const filteredPartners = useFilteredData(mockPartners, filters, [
    'name',
    'contactName',
    'description',
    'industry',
  ]);

  const summaryStats = useMemo(() => {
    return {
      total: mockPartners.length,
      active: mockPartners.filter(p => p.status === 'active').length,
      pending: mockPartners.filter(p => p.status === 'pending').length,
      totalCollaborations: mockPartners.reduce(
        (sum, p) => sum + p.collaborationsCount,
        0
      ),
      industries: new Set(mockPartners.map(p => p.industry)).size,
    };
  }, []);

  const handleSelectAll = () => {
    const allIds = filteredPartners.map(partner => partner.id);
    selectAll(allIds);
  };

  const handleBulkAction = (action: string) => {
    performBulkAction(action);
    alert(`Performing ${action} on ${selectedCount} selected partners`);
  };

  const handlePartnerAction = (action: string, partnerId: string) => {
    console.log(`${action} partner:`, partnerId);

    switch (action) {
      case 'edit':
        onEditPartner(partnerId);
        break;
      case 'view':
        alert(`Viewing partner ${partnerId}`);
        break;
      case 'activate':
        alert(`Activating partner ${partnerId}`);
        break;
      case 'collaborate':
        alert(`Starting collaboration with partner ${partnerId}`);
        break;
      case 'suspend':
        alert(`Suspending partner ${partnerId}`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this partner?')) {
          alert(`Deleting partner ${partnerId}`);
        }
        break;
      case 'analytics':
        alert(`Viewing analytics for partner ${partnerId}`);
        break;
      case 'contact':
        alert(`Contacting partner ${partnerId}`);
        break;
      default:
        alert(`Action ${action} for partner ${partnerId}`);
    }
  };

  const handleCreatePartner = () => {
    if (onCreatePartner) {
      onCreatePartner();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hiring':
        return '💼';
      case 'technology':
        return '💻';
      case 'education':
        return '🎓';
      case 'startup':
        return '🚀';
      case 'nonprofit':
        return '🤝';
      default:
        return '🏢';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'hiring':
        return 'Hiring Partner';
      case 'technology':
        return 'Technology Partner';
      case 'education':
        return 'Education Partner';
      case 'startup':
        return 'Startup Partner';
      case 'nonprofit':
        return 'Non-profit Partner';
      default:
        return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="partners-overlay active">
      <div className="partners-manager">
        <div className="partners-header">
          <h2>Partners Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="admin-card-action primary"
              onClick={handleCreatePartner}
              title="Create New Partner"
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
              ➕ Create Partner
            </button>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="partners-body">
          {/* Partners Summary */}
          <div className="partners-summary">
            <div className="partner-summary-card">
              <div className="partner-summary-value">{summaryStats.total}</div>
              <div className="partner-summary-label">Total Partners</div>
            </div>
            <div className="partner-summary-card">
              <div className="partner-summary-value">{summaryStats.active}</div>
              <div className="partner-summary-label">Active</div>
            </div>
            <div className="partner-summary-card">
              <div className="partner-summary-value">
                {summaryStats.pending}
              </div>
              <div className="partner-summary-label">Pending</div>
            </div>
            <div className="partner-summary-card">
              <div className="partner-summary-value">
                {summaryStats.totalCollaborations}
              </div>
              <div className="partner-summary-label">Collaborations</div>
            </div>
            <div className="partner-summary-card">
              <div className="partner-summary-value">
                {summaryStats.industries}
              </div>
              <div className="partner-summary-label">Industries</div>
            </div>
          </div>

          {/* Partner Filters */}
          <div className="partner-filters">
            <div className="partner-filter-group">
              <select
                className="partner-filter-select"
                value={filters.status || ''}
                onChange={e =>
                  updateFilters({ status: e.target.value || undefined })
                }
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="partner-filter-group">
              <select
                className="partner-filter-select"
                value={filters.type || ''}
                onChange={e =>
                  updateFilters({ type: e.target.value || undefined })
                }
              >
                <option value="">All Types</option>
                <option value="hiring">Hiring Partner</option>
                <option value="technology">Technology Partner</option>
                <option value="education">Education Partner</option>
                <option value="startup">Startup Partner</option>
                <option value="nonprofit">Non-profit Partner</option>
              </select>
            </div>
            <div className="partner-filter-group">
              <select
                className="partner-filter-select"
                value={filters.industry || ''}
                onChange={e =>
                  updateFilters({ industry: e.target.value || undefined })
                }
              >
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Education Technology">
                  Education Technology
                </option>
                <option value="Startup Ecosystem">Startup Ecosystem</option>
                <option value="Clean Technology">Clean Technology</option>
                <option value="Non-profit">Non-profit</option>
              </select>
            </div>
            <div className="partner-filter-group">
              <input
                type="text"
                className="partner-search-input"
                placeholder="Search partners..."
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
                  id="selectAllPartners"
                  checked={selectedCount === filteredPartners.length}
                  onChange={handleSelectAll}
                />
                <label htmlFor="selectAllPartners">
                  {selectedCount} of {filteredPartners.length} selected
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

          {/* Partners Grid */}
          <div className="partners-grid">
            {filteredPartners.map(partner => (
              <div
                key={partner.id}
                className="partner-card"
                data-status={partner.status}
              >
                <input
                  type="checkbox"
                  className="partner-checkbox"
                  checked={selectedItems.has(partner.id)}
                  onChange={() => toggleSelection(partner.id)}
                />

                <div className="partner-image">
                  <div className="partner-image-placeholder">
                    {getTypeIcon(partner.type)}
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
                      {partner.contactName} • {partner.industry}
                    </div>
                  </div>

                  <div className="partner-excerpt">{partner.description}</div>

                  <div className="partner-meta">
                    <div className="partner-meta-item">
                      📍 {partner.location}
                    </div>
                    <div className="partner-meta-item">
                      📅 Partnership since{' '}
                      {formatDate(partner.partnershipStart)}
                    </div>
                    <div className="partner-meta-item">
                      🤝 Last collaboration:{' '}
                      {formatDate(partner.lastCollaboration)}
                    </div>
                  </div>

                  <div className="partner-tags">
                    {partner.tags.map((tag, index) => (
                      <span key={index} className="partner-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="partner-stats">
                    <div className="partner-stat">
                      <div className="partner-stat-icon"></div>
                      {partner.collaborationsCount} Collaborations
                    </div>
                    <div className="partner-stat">
                      <div className="partner-stat-icon"></div>
                      {partner.benefits.length} Benefits
                    </div>
                    <div className="partner-stat">
                      <div className="partner-stat-icon"></div>
                      {partner.website}
                    </div>
                  </div>

                  <div className="partner-actions">
                    <button
                      className="partner-action-btn primary"
                      onClick={() => handlePartnerAction('edit', partner.id)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="partner-action-btn secondary"
                      onClick={() => handlePartnerAction('view', partner.id)}
                    >
                      👁️ View
                    </button>
                    <button
                      className="partner-action-btn secondary"
                      onClick={() => handlePartnerAction('contact', partner.id)}
                    >
                      📞 Contact
                    </button>
                    <button
                      className="partner-action-btn secondary"
                      onClick={() =>
                        handlePartnerAction('collaborate', partner.id)
                      }
                    >
                      🤝 Collaborate
                    </button>
                    <button
                      className="partner-action-btn secondary"
                      onClick={() =>
                        handlePartnerAction('analytics', partner.id)
                      }
                    >
                      📊 Analytics
                    </button>
                    {partner.status === 'pending' && (
                      <button
                        className="partner-action-btn primary"
                        onClick={() =>
                          handlePartnerAction('activate', partner.id)
                        }
                      >
                        ✅ Activate
                      </button>
                    )}
                    <button
                      className="partner-action-btn danger"
                      onClick={() => handlePartnerAction('delete', partner.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPartners.length === 0 && (
            <div className="no-partners">
              <p>No partners found matching your criteria.</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
