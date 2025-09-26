import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OpportunitiesService } from '../../services/opportunitiesService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Opportunity } from '../../types';

export const OpportunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'description' | 'applications' | 'analytics'
  >('overview');

  useEffect(() => {
    if (id) {
      loadOpportunityDetails(id);
    }
  }, [id]);

  const loadOpportunityDetails = async (opportunityId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading opportunity details for ID:', opportunityId);
      const response = await OpportunitiesService.getOpportunity(opportunityId);

      if (response.success && response.data) {
        setOpportunity(response.data);
        console.log('✅ Opportunity details loaded:', response.data);
      } else {
        throw new Error(
          response.message || 'Failed to load opportunity details'
        );
      }
    } catch (err) {
      console.error('❌ Error loading opportunity details:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load opportunity details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/admin/opportunities');
  };

  const handleEdit = () => {
    if (opportunity) {
      navigate(`/admin/opportunities/edit/${opportunity.id}`);
    }
  };

  const handleAction = async (
    action:
      | 'activate'
      | 'deactivate'
      | 'expire'
      | 'renew'
      | 'approve'
      | 'reject'
      | 'delete'
      | 'markFilled'
  ) => {
    if (!opportunity) return;

    const confirmMessage =
      action === 'delete'
        ? `Are you sure you want to delete "${opportunity.title}"? This action cannot be undone.`
        : `Are you sure you want to ${action} "${opportunity.title}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      let response;
      switch (action) {
        case 'activate':
          response = await OpportunitiesService.activateOpportunity(
            opportunity.id
          );
          break;
        case 'deactivate':
          response = await OpportunitiesService.deactivateOpportunity(
            opportunity.id
          );
          break;
        case 'expire':
          response = await OpportunitiesService.expireOpportunity(
            opportunity.id
          );
          break;
        case 'renew':
          response = await OpportunitiesService.renewOpportunity(
            opportunity.id
          );
          break;
        case 'approve':
          response = await OpportunitiesService.approveOpportunity(
            opportunity.id
          );
          break;
        case 'reject':
          response = await OpportunitiesService.rejectOpportunity(
            opportunity.id
          );
          break;
        case 'markFilled':
          response = await OpportunitiesService.markAsFilled(opportunity.id);
          break;
        case 'delete':
          response = await OpportunitiesService.deleteOpportunity(
            opportunity.id
          );
          break;
      }

      if (response.success) {
        if (action === 'delete') {
          navigate('/admin/opportunities');
        } else {
          // Reload opportunity details to show updated status
          loadOpportunityDetails(opportunity.id);
        }
      } else {
        setError(response.message || `Failed to ${action} opportunity`);
      }
    } catch (err) {
      console.error(`Error ${action} opportunity:`, err);
      setError(`Failed to ${action} opportunity. Please try again.`);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'expired':
        return 'status-expired';
      case 'filled':
        return 'status-filled';
      case 'cancelled':
        return 'status-cancelled';
      case 'draft':
        return 'status-draft';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-unknown';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'job':
        return 'type-job';
      case 'freelance':
        return 'type-freelance';
      case 'internship':
        return 'type-internship';
      case 'collaboration':
        return 'type-collaboration';
      case 'volunteer':
        return 'type-volunteer';
      default:
        return 'type-general';
    }
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'entry':
        return 'level-entry';
      case 'mid':
        return 'level-mid';
      case 'senior':
        return 'level-senior';
      case 'executive':
        return 'level-executive';
      default:
        return 'level-general';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'job':
        return 'Full-time Job';
      case 'freelance':
        return 'Freelance';
      case 'internship':
        return 'Internship';
      case 'collaboration':
        return 'Collaboration';
      case 'volunteer':
        return 'Volunteer';
      default:
        return 'General';
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
        return 'Executive Level';
      default:
        return 'All Levels';
    }
  };

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'job':
        return '💼';
      case 'freelance':
        return '💻';
      case 'internship':
        return '🎓';
      case 'collaboration':
        return '🤝';
      case 'volunteer':
        return '❤️';
      default:
        return '📄';
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

  const getDaysUntilExpiry = () => {
    if (!opportunity?.expiryDate) return null;
    const now = new Date();
    const expiry = new Date(opportunity.expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getApplicationRate = () => {
    if (!opportunity || !opportunity.viewCount || opportunity.viewCount === 0)
      return 0;
    return Math.round(
      (opportunity.applicationCount / opportunity.viewCount) * 100
    );
  };

  if (loading) {
    return (
      <div className="opportunity-details-overlay active">
        <div className="opportunity-details-container">
          <div className="opportunity-details-header">
            <h2 className="opportunity-details-title">
              Loading Opportunity Details...
            </h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="opportunity-details-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="opportunity-details-overlay active">
        <div className="opportunity-details-container">
          <div className="opportunity-details-header">
            <h2 className="opportunity-details-title">Opportunity Details</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="opportunity-details-body">
            <ErrorMessage
              error={error || 'Opportunity not found'}
              title="Failed to load opportunity details"
              showRetry
              onRetry={() => id && loadOpportunityDetails(id)}
              variant="card"
            />
          </div>
        </div>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="opportunity-details-overlay active">
      <div className="opportunity-details-container">
        <div className="opportunity-details-header">
          <div className="opportunity-details-title-section">
            <h2 className="opportunity-details-title">{opportunity.title}</h2>
            <div className="opportunity-details-badges">
              <span
                className={`status-badge ${getStatusBadgeClass(opportunity.status)}`}
              >
                {opportunity.status.charAt(0).toUpperCase() +
                  opportunity.status.slice(1)}
              </span>
              <span
                className={`type-badge ${getTypeBadgeClass(opportunity.type)}`}
              >
                {getOpportunityIcon(opportunity.type)}{' '}
                {getTypeDisplayName(opportunity.type)}
              </span>
              <span
                className={`level-badge ${getLevelBadgeClass(opportunity.level)}`}
              >
                {getLevelDisplayName(opportunity.level)}
              </span>
              {opportunity.featured && (
                <span className="featured-badge">⭐ Featured</span>
              )}
              {opportunity.urgent && (
                <span className="urgent-badge">🚨 Urgent</span>
              )}
            </div>
          </div>
          <div className="opportunity-details-actions">
            <button className="btn btn-primary" onClick={handleEdit}>
              ✏️ Edit Opportunity
            </button>
            {opportunity.status === 'pending' && (
              <>
                <button
                  className="btn btn-success"
                  onClick={() => handleAction('approve')}
                >
                  ✅ Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleAction('reject')}
                >
                  ❌ Reject
                </button>
              </>
            )}
            {opportunity.status === 'draft' && (
              <button
                className="btn btn-success"
                onClick={() => handleAction('activate')}
              >
                📢 Publish
              </button>
            )}
            {opportunity.status === 'active' && (
              <>
                <button
                  className="btn btn-warning"
                  onClick={() => handleAction('expire')}
                >
                  ⏰ Expire
                </button>
                <button
                  className="btn btn-info"
                  onClick={() => handleAction('markFilled')}
                >
                  ✅ Mark Filled
                </button>
              </>
            )}
            {opportunity.status === 'expired' && (
              <button
                className="btn btn-success"
                onClick={() => handleAction('renew')}
              >
                🔄 Renew
              </button>
            )}
  {/* Removed 'inactive' status branch since not part of OpportunityStatus union */}
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

        <div className="opportunity-details-body">
          {/* Tab Navigation */}
          <div className="opportunity-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📋 Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              📄 Description
            </button>
            <button
              className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              📋 Applications
            </button>
            <button
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="opportunity-tab-content">
            {activeTab === 'overview' && (
              <div className="opportunity-overview">
                {/* Key Metrics */}
                <div className="opportunity-metrics">
                  <div className="metric-card">
                    <div className="metric-icon">📋</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {opportunity.applicationCount.toLocaleString()}
                      </div>
                      <div className="metric-label">Applications</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">👁️</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {(opportunity.viewCount || 0).toLocaleString()}
                      </div>
                      <div className="metric-label">Views</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {getApplicationRate()}%
                      </div>
                      <div className="metric-label">Application Rate</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">⏰</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {daysUntilExpiry !== null
                          ? daysUntilExpiry > 0
                            ? daysUntilExpiry
                            : 'Expired'
                          : 'No Expiry'}
                      </div>
                      <div className="metric-label">Days Remaining</div>
                    </div>
                  </div>
                </div>

                {/* Opportunity Information */}
                <div className="opportunity-info-grid">
                  <div className="info-section">
                    <h3 className="info-section-title">
                      🏢 Company Information
                    </h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Company:</label>
                        <span>{opportunity.company}</span>
                      </div>
                      <div className="info-item">
                        <label>Contact Email:</label>
                        <span>
                          <a
                            href={`mailto:${opportunity.contactEmail}`}
                            className="email-link"
                          >
                            {opportunity.contactEmail}
                          </a>
                        </span>
                      </div>
                      {opportunity.partnerId && (
                        <div className="info-item">
                          <label>Partner ID:</label>
                          <span>{opportunity.partnerId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">💼 Position Details</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Type:</label>
                        <span>{getTypeDisplayName(opportunity.type)}</span>
                      </div>
                      <div className="info-item">
                        <label>Level:</label>
                        <span>{getLevelDisplayName(opportunity.level)}</span>
                      </div>
                      <div className="info-item">
                        <label>Location:</label>
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="info-item">
                        <label>Remote:</label>
                        <span
                          className={
                            opportunity.isRemote ? 'text-success' : 'text-muted'
                          }
                        >
                          {opportunity.isRemote ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {opportunity.salary && (
                        <div className="info-item">
                          <label>Salary:</label>
                          <span>{opportunity.salary}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">📅 Timeline</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Posted:</label>
                        <span>{formatDate(opportunity.postedDate)}</span>
                      </div>
                      {opportunity.expiryDate && (
                        <div className="info-item">
                          <label>Expires:</label>
                          <span
                            className={
                              daysUntilExpiry !== null && daysUntilExpiry < 7
                                ? 'text-warning'
                                : ''
                            }
                          >
                            {formatDate(opportunity.expiryDate)}
                          </span>
                        </div>
                      )}
                      {opportunity.createdAt && (
                        <div className="info-item">
                          <label>Created:</label>
                          <span>{formatDateTime(opportunity.createdAt)}</span>
                        </div>
                      )}
                      {opportunity.updatedAt && (
                        <div className="info-item">
                          <label>Last Updated:</label>
                          <span>{formatDateTime(opportunity.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">⚙️ Settings</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Status:</label>
                        <span
                          className={getStatusBadgeClass(opportunity.status)}
                        >
                          {opportunity.status.charAt(0).toUpperCase() +
                            opportunity.status.slice(1)}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Featured:</label>
                        <span
                          className={
                            opportunity.featured ? 'text-success' : 'text-muted'
                          }
                        >
                          {opportunity.featured ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Urgent:</label>
                        <span
                          className={
                            opportunity.urgent ? 'text-warning' : 'text-muted'
                          }
                        >
                          {opportunity.urgent ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {opportunity.tags && opportunity.tags.length > 0 && (
                  <div className="opportunity-tags-section">
                    <h3 className="info-section-title">🏷️ Tags</h3>
                    <div className="opportunity-tags-display">
                      {opportunity.tags.map((tag, index) => (
                        <span key={index} className="opportunity-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {opportunity.requirements &&
                  opportunity.requirements.length > 0 && (
                    <div className="opportunity-requirements-section">
                      <h3 className="info-section-title">✅ Requirements</h3>
                      <div className="requirements-list">
                        {opportunity.requirements.map((requirement, index) => (
                          <div key={index} className="requirement-item">
                            <span className="requirement-bullet">•</span>
                            <span className="requirement-text">
                              {requirement}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {activeTab === 'description' && (
              <div className="opportunity-description">
                <div className="description-section">
                  <h3 className="info-section-title">📄 Job Description</h3>
                  <div className="description-content">
                    <p>{opportunity.description}</p>
                  </div>
                </div>

                {opportunity.requirements &&
                  opportunity.requirements.length > 0 && (
                    <div className="description-section">
                      <h3 className="info-section-title">📋 Requirements</h3>
                      <div className="requirements-content">
                        <ul>
                          {opportunity.requirements.map(
                            (requirement, index) => (
                              <li key={index}>{requirement}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                <div className="description-section">
                  <h3 className="info-section-title">💼 Position Summary</h3>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <strong>Company:</strong> {opportunity.company}
                    </div>
                    <div className="summary-item">
                      <strong>Type:</strong>{' '}
                      {getTypeDisplayName(opportunity.type)}
                    </div>
                    <div className="summary-item">
                      <strong>Level:</strong>{' '}
                      {getLevelDisplayName(opportunity.level)}
                    </div>
                    <div className="summary-item">
                      <strong>Location:</strong> {opportunity.location}{' '}
                      {opportunity.isRemote && '(Remote)'}
                    </div>
                    {opportunity.salary && (
                      <div className="summary-item">
                        <strong>Salary:</strong> {opportunity.salary}
                      </div>
                    )}
                    <div className="summary-item">
                      <strong>Posted:</strong>{' '}
                      {formatDate(opportunity.postedDate)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="opportunity-applications">
                <div className="applications-placeholder">
                  <div className="placeholder-icon">📋</div>
                  <h3>Application Management</h3>
                  <p>
                    Application tracking and management will be implemented
                    here.
                  </p>
                  <p>
                    This will include applicant lists, status tracking, and
                    communication tools.
                  </p>
                  <div className="applications-stats">
                    <div className="stat-item">
                      <strong>Total Applications:</strong>{' '}
                      {opportunity.applicationCount}
                    </div>
                    <div className="stat-item">
                      <strong>Application Rate:</strong> {getApplicationRate()}%
                    </div>
                    <div className="stat-item">
                      <strong>Status:</strong> {opportunity.status}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      console.log('Navigate to applications management')
                    }
                  >
                    🚀 Coming Soon
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="opportunity-analytics">
                <div className="analytics-placeholder">
                  <div className="placeholder-icon">📊</div>
                  <h3>Opportunity Analytics</h3>
                  <p>
                    Detailed analytics and reporting will be implemented here.
                  </p>
                  <p>
                    This will include view trends, application metrics, source
                    tracking, and performance data.
                  </p>
                  <div className="analytics-preview">
                    <div className="metric-row">
                      <span>Total Views:</span>
                      <span>
                        {(opportunity.viewCount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span>Total Applications:</span>
                      <span>
                        {opportunity.applicationCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span>Application Rate:</span>
                      <span>{getApplicationRate()}%</span>
                    </div>
                    <div className="metric-row">
                      <span>Days Active:</span>
                      <span>
                        {Math.ceil(
                          (new Date().getTime() -
                            new Date(opportunity.postedDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      console.log('Navigate to opportunity analytics')
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

export default OpportunityDetailsPage;
