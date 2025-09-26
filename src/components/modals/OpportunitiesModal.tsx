import React, { useState, useMemo } from 'react';
import { useFilters, useBulkActions, useFilteredData } from '../../hooks';
import { formatDate, getStatusBadgeClass } from '../../utils';

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  status: 'active' | 'pending' | 'expired' | 'filled' | 'draft';
  location: string;
  remote: boolean;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  tags: string[];
  postedDate: string;
  expiryDate: string;
  applicationsCount: number;
  viewsCount: number;
  contactEmail: string;
  contactName: string;
  featured: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
}

interface OpportunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditOpportunity: (opportunityId: string) => void;
  onCreateOpportunity?: () => void;
}

// Mock data - in real app this would come from API
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Solutions',
    type: 'full-time',
    status: 'active',
    location: 'Cape Town, South Africa',
    remote: true,
    salaryRange: {
      min: 600000,
      max: 800000,
      currency: 'ZAR',
    },
    description:
      'We are looking for an experienced Full Stack Developer to join our dynamic team and work on cutting-edge web applications.',
    requirements: [
      '5+ years experience',
      'React/Node.js',
      'TypeScript',
      'AWS/Azure',
    ],
    benefits: [
      'Medical aid',
      'Retirement fund',
      'Flexible hours',
      'Remote work',
    ],
    tags: ['React', 'Node.js', 'TypeScript', 'AWS', 'Remote'],
    postedDate: '2025-01-15T10:00:00Z',
    expiryDate: '2025-02-15T23:59:59Z',
    applicationsCount: 23,
    viewsCount: 156,
    contactEmail: 'hr@techcorp.com',
    contactName: 'Emma Wilson',
    featured: true,
    experienceLevel: 'senior',
  },
  {
    id: '2',
    title: 'Data Scientist Intern',
    company: 'Innovation Hub',
    type: 'internship',
    status: 'active',
    location: 'Johannesburg, South Africa',
    remote: false,
    salaryRange: {
      min: 8000,
      max: 12000,
      currency: 'ZAR',
    },
    description:
      'Exciting internship opportunity to work with machine learning and data analytics in a startup environment.',
    requirements: [
      'Python/R',
      'Statistics background',
      'Machine learning basics',
      'University student',
    ],
    benefits: [
      'Mentorship',
      'Learning opportunities',
      'Networking',
      'Certificate',
    ],
    tags: ['Python', 'Machine Learning', 'Data Science', 'Internship'],
    postedDate: '2025-01-18T14:30:00Z',
    expiryDate: '2025-03-01T23:59:59Z',
    applicationsCount: 45,
    viewsCount: 234,
    contactEmail: 'internships@innovationhub.co.za',
    contactName: 'David Mthembu',
    featured: false,
    experienceLevel: 'entry',
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'CloudTech Systems',
    type: 'contract',
    status: 'active',
    location: 'Durban, South Africa',
    remote: true,
    salaryRange: {
      min: 450,
      max: 650,
      currency: 'ZAR',
    },
    description:
      '6-month contract position for an experienced DevOps engineer to help with cloud infrastructure migration.',
    requirements: [
      'Docker/Kubernetes',
      'CI/CD pipelines',
      'AWS/GCP',
      '3+ years experience',
    ],
    benefits: ['Competitive hourly rate', 'Remote work', 'Flexible schedule'],
    tags: ['DevOps', 'Docker', 'Kubernetes', 'AWS', 'Contract'],
    postedDate: '2025-01-20T09:15:00Z',
    expiryDate: '2025-02-20T23:59:59Z',
    applicationsCount: 12,
    viewsCount: 89,
    contactEmail: 'contracts@cloudtech.co.za',
    contactName: 'Sarah Patel',
    featured: false,
    experienceLevel: 'mid',
  },
  {
    id: '4',
    title: 'UI/UX Designer',
    company: 'Design Studio Pro',
    type: 'part-time',
    status: 'pending',
    location: 'Pretoria, South Africa',
    remote: true,
    salaryRange: {
      min: 25000,
      max: 35000,
      currency: 'ZAR',
    },
    description:
      'Part-time position for a creative UI/UX designer to work on mobile and web applications.',
    requirements: [
      'Figma/Sketch',
      'User research',
      'Prototyping',
      '2+ years experience',
    ],
    benefits: ['Flexible hours', 'Creative freedom', 'Portfolio building'],
    tags: ['UI/UX', 'Figma', 'Mobile Design', 'Part-time'],
    postedDate: '2025-01-22T11:45:00Z',
    expiryDate: '2025-02-22T23:59:59Z',
    applicationsCount: 8,
    viewsCount: 67,
    contactEmail: 'design@studiopro.co.za',
    contactName: 'Michael Chen',
    featured: false,
    experienceLevel: 'mid',
  },
  {
    id: '5',
    title: 'Freelance Content Writer',
    company: 'Digital Marketing Agency',
    type: 'freelance',
    status: 'filled',
    location: 'Remote',
    remote: true,
    salaryRange: {
      min: 300,
      max: 500,
      currency: 'ZAR',
    },
    description:
      'Freelance opportunity for technical content writing and blog posts for tech companies.',
    requirements: ['Technical writing', 'SEO knowledge', 'Portfolio required'],
    benefits: ['Remote work', 'Flexible schedule', 'Per-article payment'],
    tags: ['Content Writing', 'SEO', 'Technical Writing', 'Freelance'],
    postedDate: '2025-01-10T16:20:00Z',
    expiryDate: '2025-02-10T23:59:59Z',
    applicationsCount: 34,
    viewsCount: 178,
    contactEmail: 'freelance@digitalagency.co.za',
    contactName: 'Aisha Hassan',
    featured: false,
    experienceLevel: 'entry',
  },
];

export function OpportunitiesModal({
  isOpen,
  onClose,
  onEditOpportunity,
  onCreateOpportunity,
}: OpportunitiesModalProps) {
  const { filters, updateFilters, updateSearch, clearFilters } =
    useFilters('opportunities');
  const {
    selectedItems,
    isVisible,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelections,
    performBulkAction,
  } = useBulkActions('opportunities');

  const filteredOpportunities = useFilteredData(mockOpportunities, filters, [
    'title',
    'company',
    'description',
    'location',
  ]);

  const summaryStats = useMemo(() => {
    return {
      total: mockOpportunities.length,
      active: mockOpportunities.filter(o => o.status === 'active').length,
      pending: mockOpportunities.filter(o => o.status === 'pending').length,
      filled: mockOpportunities.filter(o => o.status === 'filled').length,
      totalApplications: mockOpportunities.reduce(
        (sum, o) => sum + o.applicationsCount,
        0
      ),
    };
  }, []);

  const handleSelectAll = () => {
    const allIds = filteredOpportunities.map(opportunity => opportunity.id);
    selectAll(allIds);
  };

  const handleBulkAction = (action: string) => {
    performBulkAction(action);
    alert(`Performing ${action} on ${selectedCount} selected opportunities`);
  };

  const handleOpportunityAction = (action: string, opportunityId: string) => {
    console.log(`${action} opportunity:`, opportunityId);

    switch (action) {
      case 'edit':
        onEditOpportunity(opportunityId);
        break;
      case 'view':
        alert(`Viewing opportunity ${opportunityId}`);
        break;
      case 'publish':
        alert(`Publishing opportunity ${opportunityId}`);
        break;
      case 'feature':
        alert(`Featuring opportunity ${opportunityId}`);
        break;
      case 'expire':
        alert(`Expiring opportunity ${opportunityId}`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this opportunity?')) {
          alert(`Deleting opportunity ${opportunityId}`);
        }
        break;
      case 'analytics':
        alert(`Viewing analytics for opportunity ${opportunityId}`);
        break;
      case 'applications':
        alert(`Viewing applications for opportunity ${opportunityId}`);
        break;
      default:
        alert(`Action ${action} for opportunity ${opportunityId}`);
    }
  };

  const handleCreateOpportunity = () => {
    if (onCreateOpportunity) {
      onCreateOpportunity();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full-time':
        return '💼';
      case 'part-time':
        return '⏰';
      case 'contract':
        return '📋';
      case 'internship':
        return '🎓';
      case 'freelance':
        return '💻';
      default:
        return '💼';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'Full-time';
      case 'part-time':
        return 'Part-time';
      case 'contract':
        return 'Contract';
      case 'internship':
        return 'Internship';
      case 'freelance':
        return 'Freelance';
      default:
        return type;
    }
  };

  const formatSalary = (salaryRange: any) => {
    const formatter = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: salaryRange.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (salaryRange.min === salaryRange.max) {
      return formatter.format(salaryRange.min);
    }

    return `${formatter.format(salaryRange.min)} - ${formatter.format(salaryRange.max)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="opportunities-overlay active">
      <div className="opportunities-manager">
        <div className="opportunities-header">
          <h2>Opportunities Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="admin-card-action primary"
              onClick={handleCreateOpportunity}
              title="Create New Opportunity"
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
              ➕ Create Opportunity
            </button>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="opportunities-body">
          {/* Opportunities Summary */}
          <div className="opportunities-summary">
            <div className="opportunity-summary-card">
              <div className="opportunity-summary-value">
                {summaryStats.total}
              </div>
              <div className="opportunity-summary-label">
                Total Opportunities
              </div>
            </div>
            <div className="opportunity-summary-card">
              <div className="opportunity-summary-value">
                {summaryStats.active}
              </div>
              <div className="opportunity-summary-label">Active</div>
            </div>
            <div className="opportunity-summary-card">
              <div className="opportunity-summary-value">
                {summaryStats.pending}
              </div>
              <div className="opportunity-summary-label">Pending</div>
            </div>
            <div className="opportunity-summary-card">
              <div className="opportunity-summary-value">
                {summaryStats.filled}
              </div>
              <div className="opportunity-summary-label">Filled</div>
            </div>
            <div className="opportunity-summary-card">
              <div className="opportunity-summary-value">
                {summaryStats.totalApplications}
              </div>
              <div className="opportunity-summary-label">Applications</div>
            </div>
          </div>

          {/* Opportunity Filters */}
          <div className="opportunity-filters">
            <div className="opportunity-filter-group">
              <select
                className="opportunity-filter-select"
                value={filters.status || ''}
                onChange={e =>
                  updateFilters({ status: e.target.value || undefined })
                }
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="filled">Filled</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="opportunity-filter-group">
              <select
                className="opportunity-filter-select"
                value={filters.type || ''}
                onChange={e =>
                  updateFilters({ type: e.target.value || undefined })
                }
              >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div className="opportunity-filter-group">
              <select
                className="opportunity-filter-select"
                value={filters.experienceLevel || ''}
                onChange={e =>
                  updateFilters({
                    experienceLevel: e.target.value || undefined,
                  })
                }
              >
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            <div className="opportunity-filter-group">
              <input
                type="text"
                className="opportunity-search-input"
                placeholder="Search opportunities..."
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
                  id="selectAllOpportunities"
                  checked={selectedCount === filteredOpportunities.length}
                  onChange={handleSelectAll}
                />
                <label htmlFor="selectAllOpportunities">
                  {selectedCount} of {filteredOpportunities.length} selected
                </label>
              </div>
              <div className="bulk-buttons">
                <button
                  className="bulk-btn publish"
                  onClick={() => handleBulkAction('publish')}
                >
                  Publish Selected
                </button>
                <button
                  className="bulk-btn draft"
                  onClick={() => handleBulkAction('feature')}
                >
                  Feature Selected
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

          {/* Opportunities Grid */}
          <div className="opportunities-grid">
            {filteredOpportunities.map(opportunity => (
              <div
                key={opportunity.id}
                className="opportunity-card"
                data-status={opportunity.status}
              >
                <input
                  type="checkbox"
                  className="opportunity-checkbox"
                  checked={selectedItems.has(opportunity.id)}
                  onChange={() => toggleSelection(opportunity.id)}
                />

                <div className="opportunity-image">
                  <div className="opportunity-image-placeholder">
                    {getTypeIcon(opportunity.type)}
                  </div>
                  <div className={`opportunity-type-badge ${opportunity.type}`}>
                    {getTypeDisplayName(opportunity.type)}
                  </div>
                  <div className={`opportunity-status ${opportunity.status}`}>
                    {opportunity.status.charAt(0).toUpperCase() +
                      opportunity.status.slice(1)}
                  </div>
                </div>

                <div className="opportunity-card-content">
                  <div className="opportunity-card-header">
                    <div className="opportunity-title">{opportunity.title}</div>
                    <div className="opportunity-subtitle">
                      {opportunity.company} •{' '}
                      {formatSalary(opportunity.salaryRange)}
                    </div>
                  </div>

                  <div className="opportunity-excerpt">
                    {opportunity.description}
                  </div>

                  <div className="opportunity-meta">
                    <div className="opportunity-meta-item">
                      📍 {opportunity.location}{' '}
                      {opportunity.remote && '(Remote)'}
                    </div>
                    <div className="opportunity-meta-item">
                      📅 Posted: {formatDate(opportunity.postedDate)}
                    </div>
                    <div className="opportunity-meta-item">
                      ⏰ Expires: {formatDate(opportunity.expiryDate)}
                    </div>
                  </div>

                  <div className="opportunity-tags">
                    {opportunity.tags.slice(0, 4).map((tag, index) => (
                      <span key={index} className="opportunity-tag">
                        {tag}
                      </span>
                    ))}
                    {opportunity.tags.length > 4 && (
                      <span className="opportunity-tag">
                        +{opportunity.tags.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="opportunity-stats">
                    <div className="opportunity-stat">
                      <div className="opportunity-stat-icon"></div>
                      {opportunity.applicationsCount} Applications
                    </div>
                    <div className="opportunity-stat">
                      <div className="opportunity-stat-icon"></div>
                      {opportunity.viewsCount} Views
                    </div>
                    <div className="opportunity-stat">
                      <div className="opportunity-stat-icon"></div>
                      {opportunity.experienceLevel} Level
                    </div>
                  </div>

                  <div className="opportunity-actions">
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
                        handleOpportunityAction('applications', opportunity.id)
                      }
                    >
                      📋 Applications
                    </button>
                    <button
                      className="opportunity-action-btn secondary"
                      onClick={() =>
                        handleOpportunityAction('analytics', opportunity.id)
                      }
                    >
                      📊 Analytics
                    </button>
                    {opportunity.status === 'pending' && (
                      <button
                        className="opportunity-action-btn primary"
                        onClick={() =>
                          handleOpportunityAction('publish', opportunity.id)
                        }
                      >
                        🚀 Publish
                      </button>
                    )}
                    {opportunity.status === 'active' &&
                      !opportunity.featured && (
                        <button
                          className="opportunity-action-btn secondary"
                          onClick={() =>
                            handleOpportunityAction('feature', opportunity.id)
                          }
                        >
                          ⭐ Feature
                        </button>
                      )}
                    <button
                      className="opportunity-action-btn danger"
                      onClick={() =>
                        handleOpportunityAction('delete', opportunity.id)
                      }
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOpportunities.length === 0 && (
            <div className="no-opportunities">
              <p>No opportunities found matching your criteria.</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
