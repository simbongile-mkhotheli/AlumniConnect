import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PartnersService } from '@services/partnersService';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import type { Partner } from '@shared/types';

export const PartnerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'opportunities' | 'analytics' | 'collaboration'
  >('overview');

  useEffect(() => {
    if (id) {
      loadPartnerDetails(id);
    }
  }, [id]);

  const loadPartnerDetails = async (partnerId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading partner details for ID:', partnerId);
      const response = await PartnersService.getPartner(partnerId);

      if (response.success && response.data) {
        setPartner(response.data);
        console.log('✅ Partner details loaded:', response.data);
      } else {
        throw new Error(response.message || 'Failed to load partner details');
      }
    } catch (err) {
      console.error('❌ Error loading partner details:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load partner details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/admin/partners');
  };

  const handleEdit = () => {
    if (partner) {
      navigate(`/admin/partners/edit/${partner.id}`);
    }
  };

  const handleAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (!partner) return;

    const confirmMessage =
      action === 'delete'
        ? `Are you sure you want to delete "${partner.name}"? This action cannot be undone.`
        : `Are you sure you want to ${action} "${partner.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      let response;
      switch (action) {
        case 'activate':
          response = await PartnersService.activatePartner(partner.id);
          break;
        case 'deactivate':
          response = await PartnersService.deactivatePartner(partner.id);
          break;
        case 'delete':
          response = await PartnersService.deletePartner(partner.id);
          break;
      }

      if (response.success) {
        if (action === 'delete') {
          navigate('/admin/partners');
        } else {
          // Reload partner details to show updated status
          loadPartnerDetails(partner.id);
        }
      } else {
        setError(response.message || `Failed to ${action} partner`);
      }
    } catch (err) {
      console.error(`Error ${action} partner:`, err);
      setError(`Failed to ${action} partner. Please try again.`);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'pending':
        return 'status-pending';
      case 'archived':
        return 'status-archived';
      default:
        return 'status-unknown';
    }
  };

  const safeCapitalize = (value?: string | null) => {
    if (!value || typeof value !== 'string') return 'Unknown';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'hiring':
        return 'type-hiring';
      case 'technology':
        return 'type-technology';
      case 'education':
        return 'type-education';
      case 'startup':
        return 'type-startup';
      case 'company':
        return 'type-company';
      case 'non_profit':
        return 'type-nonprofit';
      case 'academic':
        return 'type-academic';
      default:
        return 'type-other';
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
      case 'company':
        return 'Company';
      case 'non_profit':
        return 'Non-profit';
      case 'academic':
        return 'Academic';
      case 'other':
        return 'Other';
      default:
        return 'Partner';
    }
  };

  const getPartnerIcon = (type: string) => {
    switch (type) {
      case 'hiring':
        return '👥';
      case 'technology':
        return '💻';
      case 'education':
        return '🎓';
      case 'startup':
        return '🚀';
      case 'company':
        return '🏢';
      case 'non_profit':
        return '🤝';
      case 'academic':
        return '📚';
      default:
        return '🏢';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getSuccessRate = () => {
    if (!partner || partner.jobOpportunities === 0) return 0;
    return Math.round((partner.alumniHired / partner.jobOpportunities) * 100);
  };

  if (loading) {
    return (
      <div className="partner-details-overlay active">
        <div className="partner-details-container">
          <div className="partner-details-header">
            <h2 className="partner-details-title">
              Loading Partner Details...
            </h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="partner-details-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="partner-details-overlay active">
        <div className="partner-details-container">
          <div className="partner-details-header">
            <h2 className="partner-details-title">Partner Details</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="partner-details-body">
            <ErrorMessage
              error={error || 'Partner not found'}
              title="Failed to load partner details"
              showRetry
              onRetry={() => id && loadPartnerDetails(id)}
              variant="card"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="partner-details-overlay active">
      <div className="partner-details-container">
        <div className="partner-details-header">
          <div className="partner-details-title-section">
            <h2 className="partner-details-title">{partner.name}</h2>
            <div className="partner-details-badges">
              <span
                className={`status-badge ${getStatusBadgeClass(partner.status || 'unknown')}`}
              >
                {safeCapitalize(partner.status || 'unknown')}
              </span>
              <span className={`type-badge ${getTypeBadgeClass(partner.type)}`}>
                {getPartnerIcon(partner.type)}{' '}
                {getTypeDisplayName(partner.type)}
              </span>
              {partner.hireRate > 80 && (
                <span className="performance-badge">🏆 Top Performer</span>
              )}
            </div>
          </div>
          <div className="partner-details-actions">
            <button className="btn btn-primary" onClick={handleEdit}>
              ✏️ Edit Partner
            </button>
            {partner.status === 'pending' && (
              <button
                className="btn btn-success"
                onClick={() => handleAction('activate')}
              >
                ✅ Approve
              </button>
            )}
            {partner.status === 'active' && (
              <button
                className="btn btn-warning"
                onClick={() => handleAction('deactivate')}
              >
                ⏸️ Deactivate
              </button>
            )}
            {partner.status === 'inactive' && (
              <button
                className="btn btn-success"
                onClick={() => handleAction('activate')}
              >
                ✅ Activate
              </button>
            )}
            <button
              className="btn btn-danger"
              onClick={() => handleAction('delete')}
            >
              🗑️ Delete
            </button>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
        </div>

        <div className="partner-details-body">
          {/* Tab Navigation */}
          <div className="partner-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📋 Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'opportunities' ? 'active' : ''}`}
              onClick={() => setActiveTab('opportunities')}
            >
              💼 Opportunities
            </button>
            <button
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
            <button
              className={`tab-btn ${activeTab === 'collaboration' ? 'active' : ''}`}
              onClick={() => setActiveTab('collaboration')}
            >
              🤝 Collaboration
            </button>
          </div>

          {/* Tab Content */}
          <div className="partner-tab-content">
            {activeTab === 'overview' && (
              <div className="partner-overview">
                {/* Key Metrics */}
                <div className="partner-metrics">
                  <div className="metric-card">
                    <div className="metric-icon">💼</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {partner.jobOpportunities.toLocaleString()}
                      </div>
                      <div className="metric-label">Job Opportunities</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">👥</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {partner.alumniHired.toLocaleString()}
                      </div>
                      <div className="metric-label">Alumni Hired</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                      <div className="metric-value">{partner.hireRate}%</div>
                      <div className="metric-label">Hire Rate</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">🎯</div>
                    <div className="metric-content">
                      <div className="metric-value">{getSuccessRate()}%</div>
                      <div className="metric-label">Success Rate</div>
                    </div>
                  </div>
                </div>

                {/* Partner Information */}
                <div className="partner-info-grid">
                  <div className="info-section">
                    <h3 className="info-section-title">
                      🏢 Company Information
                    </h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{partner.name}</span>
                      </div>
                      <div className="info-item">
                        <label>Type:</label>
                        <span>{getTypeDisplayName(partner.type)}</span>
                      </div>
                      <div className="info-item">
                        <label>Status:</label>
                        <span className={getStatusBadgeClass(partner.status || 'unknown')}>
                          {safeCapitalize(partner.status || 'unknown')}
                        </span>
                      </div>
                      {partner.website && (
                        <div className="info-item">
                          <label>Website:</label>
                          <span>
                            <a
                              href={partner.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="website-link"
                            >
                              🌐 Visit Website
                            </a>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">
                      📞 Contact Information
                    </h3>
                    <div className="info-content">
                      {partner.contactEmail && (
                        <div className="info-item">
                          <label>Email:</label>
                          <span>
                            <a
                              href={`mailto:${partner.contactEmail}`}
                              className="email-link"
                            >
                              {partner.contactEmail}
                            </a>
                          </span>
                        </div>
                      )}
                      {!partner.contactEmail && (
                        <div className="info-item">
                          <span className="text-muted">
                            No contact information available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">
                      📊 Partnership Metrics
                    </h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Job Opportunities:</label>
                        <span>{partner.jobOpportunities}</span>
                      </div>
                      <div className="info-item">
                        <label>Alumni Hired:</label>
                        <span>{partner.alumniHired}</span>
                      </div>
                      <div className="info-item">
                        <label>Hire Rate:</label>
                        <span
                          className={
                            partner.hireRate > 50
                              ? 'text-success'
                              : 'text-muted'
                          }
                        >
                          {partner.hireRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">
                      📅 Partnership Timeline
                    </h3>
                    <div className="info-content">
                      {partner.partnershipSince && (
                        <div className="info-item">
                          <label>Partnership Since:</label>
                          <span>{formatDate(partner.partnershipSince)}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <label>Created:</label>
                        <span>{formatDateTime(partner.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {partner.description && (
                  <div className="partner-description">
                    <h3 className="info-section-title">📝 Description</h3>
                    <p className="description-text">{partner.description}</p>
                  </div>
                )}

                {/* Tags */}
                {partner.tags && partner.tags.length > 0 && (
                  <div className="partner-tags-section">
                    <h3 className="info-section-title">🏷️ Tags</h3>
                    <div className="partner-tags-display">
                      {partner.tags.map((tag: string, index: number) => (
                        <span key={index} className="partner-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'opportunities' && (
              <div className="partner-opportunities">
                <div className="opportunities-placeholder">
                  <div className="placeholder-icon">💼</div>
                  <h3>Job Opportunities</h3>
                  <p>
                    Job opportunities and position management will be
                    implemented here.
                  </p>
                  <p>
                    This will include active positions, application tracking,
                    and hiring pipeline management.
                  </p>
                  <div className="opportunities-stats">
                    <div className="stat-item">
                      <strong>Total Opportunities:</strong>{' '}
                      {partner.jobOpportunities}
                    </div>
                    <div className="stat-item">
                      <strong>Alumni Hired:</strong> {partner.alumniHired}
                    </div>
                    <div className="stat-item">
                      <strong>Success Rate:</strong> {getSuccessRate()}%
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      console.log('Navigate to opportunities management')
                    }
                  >
                    🚀 Coming Soon
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="partner-analytics">
                <div className="analytics-placeholder">
                  <div className="placeholder-icon">📊</div>
                  <h3>Partnership Analytics</h3>
                  <p>
                    Detailed analytics and performance metrics will be
                    implemented here.
                  </p>
                  <p>
                    This will include hiring trends, application success rates,
                    partnership ROI, and performance insights.
                  </p>
                  <div className="analytics-preview">
                    <div className="metric-row">
                      <span>Total Opportunities:</span>
                      <span>{partner.jobOpportunities.toLocaleString()}</span>
                    </div>
                    <div className="metric-row">
                      <span>Alumni Hired:</span>
                      <span>{partner.alumniHired.toLocaleString()}</span>
                    </div>
                    <div className="metric-row">
                      <span>Hire Rate:</span>
                      <span>{partner.hireRate}%</span>
                    </div>
                    <div className="metric-row">
                      <span>Success Rate:</span>
                      <span>{getSuccessRate()}%</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => console.log('Navigate to partner analytics')}
                  >
                    🚀 Coming Soon
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'collaboration' && (
              <div className="partner-collaboration">
                <div className="collaboration-placeholder">
                  <div className="placeholder-icon">🤝</div>
                  <h3>Collaboration Management</h3>
                  <p>
                    Partnership collaboration tools and communication will be
                    implemented here.
                  </p>
                  <p>
                    This will include project management, communication history,
                    shared resources, and partnership goals.
                  </p>
                  <div className="collaboration-stats">
                    <div className="stat-item">
                      <strong>Partnership Duration:</strong>{' '}
                      {partner.partnershipSince
                        ? `${Math.floor((new Date().getTime() - new Date(partner.partnershipSince).getTime()) / (1000 * 60 * 60 * 24 * 365))} years`
                        : 'N/A'}
                    </div>
                    <div className="stat-item">
                      <strong>Partnership Type:</strong>{' '}
                      {getTypeDisplayName(partner.type)}
                    </div>
                    <div className="stat-item">
                      <strong>Status:</strong>{' '}
                      {safeCapitalize(partner.status || 'unknown')}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      console.log('Navigate to collaboration management')
                    }
                  >
                    🚀 Coming Soon
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailsPage;
