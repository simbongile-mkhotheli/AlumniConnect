import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SponsorsService } from '../../services/sponsorsService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Sponsor } from '../../types';

export const SponsorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'events' | 'analytics' | 'contract'
  >('overview');

  useEffect(() => {
    if (id) {
      loadSponsorDetails(id);
    }
  }, [id]);

  const loadSponsorDetails = async (sponsorId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading sponsor details for ID:', sponsorId);
      const response = await SponsorsService.getSponsor(sponsorId);

      if (response.success && response.data) {
        setSponsor(response.data);
        console.log('✅ Sponsor details loaded:', response.data);
      } else {
        throw new Error(response.message || 'Failed to load sponsor details');
      }
    } catch (err) {
      console.error('❌ Error loading sponsor details:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load sponsor details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/admin/sponsors');
  };

  const handleEdit = () => {
    if (sponsor) {
      navigate(`/admin/sponsors/edit/${sponsor.id}`);
    }
  };

  const handleAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (!sponsor) return;

    const confirmMessage =
      action === 'delete'
        ? `Are you sure you want to delete "${sponsor.name}"? This action cannot be undone.`
        : `Are you sure you want to ${action} "${sponsor.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      let response;
      switch (action) {
        case 'activate':
          response = await SponsorsService.activateSponsor(sponsor.id);
          break;
        case 'deactivate':
          response = await SponsorsService.deactivateSponsor(sponsor.id);
          break;
        case 'delete':
          response = await SponsorsService.deleteSponsor(sponsor.id);
          break;
      }

      if (response.success) {
        if (action === 'delete') {
          navigate('/admin/sponsors');
        } else {
          // Reload sponsor details to show updated status
          loadSponsorDetails(sponsor.id);
        }
      } else {
        setError(response.message || `Failed to ${action} sponsor`);
      }
    } catch (err) {
      console.error(`Error ${action} sponsor:`, err);
      setError(`Failed to ${action} sponsor. Please try again.`);
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
      case 'expired':
        return 'status-expired';
      default:
        return 'status-unknown';
    }
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'tier-platinum';
      case 'gold':
        return 'tier-gold';
      case 'silver':
        return 'tier-silver';
      case 'bronze':
        return 'tier-bronze';
      default:
        return 'tier-bronze';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  const calculatePartnershipDuration = (partnershipSince: string) => {
    try {
      const startDate = new Date(partnershipSince);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);

      if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
      } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''}`;
      } else {
        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      }
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="sponsor-details-overlay active">
        <div className="sponsor-details-container">
          <div className="sponsor-details-header">
            <h2 className="sponsor-details-title">
              Loading Sponsor Details...
            </h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="sponsor-details-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !sponsor) {
    return (
      <div className="sponsor-details-overlay active">
        <div className="sponsor-details-container">
          <div className="sponsor-details-header">
            <h2 className="sponsor-details-title">Sponsor Details</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="sponsor-details-body">
            <ErrorMessage
              error={error || 'Sponsor not found'}
              title="Failed to load sponsor details"
              showRetry
              onRetry={() => id && loadSponsorDetails(id)}
              variant="card"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sponsor-details-overlay active">
      <div className="sponsor-details-container">
        <div className="sponsor-details-header">
          <div className="sponsor-details-title-section">
            <div className="sponsor-details-logo">
              {sponsor.logo ? (
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="sponsor-logo-image"
                />
              ) : (
                <div className="sponsor-logo-placeholder">
                  {getSponsorIcon(sponsor.name)}
                </div>
              )}
            </div>
            <div className="sponsor-details-info">
              <h2 className="sponsor-details-title">{sponsor.name}</h2>
              <div className="sponsor-details-badges">
                <span
                  className={`status-badge ${getStatusBadgeClass(sponsor.status)}`}
                >
                  {sponsor.status.charAt(0).toUpperCase() +
                    sponsor.status.slice(1)}
                </span>
                <span
                  className={`tier-badge ${getTierBadgeClass(sponsor.tier)}`}
                >
                  {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)}{' '}
                  Sponsor
                </span>
                <span className="partnership-badge">
                  Partner since {formatDate(sponsor.partnershipSince)}
                </span>
              </div>
            </div>
          </div>
          <div className="sponsor-details-actions">
            <button className="btn btn-primary" onClick={handleEdit}>
              ✏️ Edit Sponsor
            </button>
            {sponsor.status === 'pending' && (
              <button
                className="btn btn-success"
                onClick={() => handleAction('activate')}
              >
                ✅ Approve
              </button>
            )}
            {sponsor.status === 'active' && (
              <button
                className="btn btn-warning"
                onClick={() => handleAction('deactivate')}
              >
                ⏸️ Deactivate
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

        <div className="sponsor-details-body">
          {/* Tab Navigation */}
          <div className="sponsor-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📋 Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              📅 Events
            </button>
            <button
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
            <button
              className={`tab-btn ${activeTab === 'contract' ? 'active' : ''}`}
              onClick={() => setActiveTab('contract')}
            >
              📄 Contract
            </button>
          </div>

          {/* Tab Content */}
          <div className="sponsor-tab-content">
            {activeTab === 'overview' && (
              <div className="sponsor-overview">
                {/* Key Metrics */}
                <div className="sponsor-metrics">
                  <div className="metric-card">
                    <div className="metric-icon">💰</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {formatCurrency(sponsor.totalValue)}
                      </div>
                      <div className="metric-label">Total Value</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">📅</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {sponsor.eventsSponsored}
                      </div>
                      <div className="metric-label">Events Sponsored</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">🏢</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {sponsor.chaptersSponsored}
                      </div>
                      <div className="metric-label">Chapters Supported</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">⏱️</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {calculatePartnershipDuration(sponsor.partnershipSince)}
                      </div>
                      <div className="metric-label">Partnership Duration</div>
                    </div>
                  </div>
                </div>

                {/* Sponsor Information */}
                <div className="sponsor-info-grid">
                  <div className="info-section">
                    <h3 className="info-section-title">
                      📞 Contact Information
                    </h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Email:</label>
                        <span>
                          <a
                            href={`mailto:${sponsor.contactEmail}`}
                            className="email-link"
                          >
                            {sponsor.contactEmail}
                          </a>
                        </span>
                      </div>
                      {sponsor.website && (
                        <div className="info-item">
                          <label>Website:</label>
                          <span>
                            <a
                              href={sponsor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="website-link"
                            >
                              {sponsor.website}
                            </a>
                          </span>
                        </div>
                      )}
                      <div className="info-item">
                        <label>Tier:</label>
                        <span className={`tier-text ${sponsor.tier}`}>
                          {sponsor.tier.charAt(0).toUpperCase() +
                            sponsor.tier.slice(1)}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Status:</label>
                        <span className={`status-text ${sponsor.status}`}>
                          {sponsor.status.charAt(0).toUpperCase() +
                            sponsor.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">
                      📊 Partnership Metrics
                    </h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Partnership Since:</label>
                        <span>{formatDate(sponsor.partnershipSince)}</span>
                      </div>
                      <div className="info-item">
                        <label>Total Investment:</label>
                        <span className="investment-amount">
                          {formatCurrency(sponsor.totalValue)}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Events Sponsored:</label>
                        <span>{sponsor.eventsSponsored} events</span>
                      </div>
                      <div className="info-item">
                        <label>Chapters Supported:</label>
                        <span>{sponsor.chaptersSponsored} chapters</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">
                      📈 Performance Indicators
                    </h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>ROI Score:</label>
                        <span className="performance-score high">
                          Excellent
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Engagement Level:</label>
                        <span className="performance-score high">High</span>
                      </div>
                      <div className="info-item">
                        <label>Brand Visibility:</label>
                        <span className="performance-score medium">Good</span>
                      </div>
                      <div className="info-item">
                        <label>Community Impact:</label>
                        <span className="performance-score high">Strong</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">📅 Timeline</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Account Created:</label>
                        <span>{formatDate(sponsor.createdAt)}</span>
                      </div>
                      <div className="info-item">
                        <label>Last Activity:</label>
                        <span>2 days ago</span>
                      </div>
                      <div className="info-item">
                        <label>Next Review:</label>
                        <span>March 2025</span>
                      </div>
                      <div className="info-item">
                        <label>Contract Renewal:</label>
                        <span>December 2025</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {sponsor.description && (
                  <div className="sponsor-description">
                    <h3 className="info-section-title">
                      📝 About {sponsor.name}
                    </h3>
                    <p className="description-text">{sponsor.description}</p>
                  </div>
                )}

                {/* Tags */}
                {sponsor.tags && sponsor.tags.length > 0 && (
                  <div className="sponsor-tags-section">
                    <h3 className="info-section-title">🏷️ Categories</h3>
                    <div className="sponsor-tags">
                      {sponsor.tags.map((tag, index) => (
                        <span key={index} className="sponsor-tag">
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="sponsor-events">
                <div className="events-placeholder">
                  <div className="placeholder-icon">📅</div>
                  <h3>Sponsored Events</h3>
                  <p>Event sponsorship management will be implemented here.</p>
                  <p>
                    This will include sponsored event history, upcoming events,
                    ROI tracking, and event performance metrics.
                  </p>
                  <div className="placeholder-stats">
                    <div className="placeholder-stat">
                      <div className="stat-value">
                        {sponsor.eventsSponsored}
                      </div>
                      <div className="stat-label">Total Events Sponsored</div>
                    </div>
                    <div className="placeholder-stat">
                      <div className="stat-value">12</div>
                      <div className="stat-label">Upcoming Events</div>
                    </div>
                    <div className="placeholder-stat">
                      <div className="stat-value">89%</div>
                      <div className="stat-label">Success Rate</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => console.log('Navigate to sponsored events')}
                  >
                    🚀 Coming Soon
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="sponsor-analytics">
                <div className="analytics-placeholder">
                  <div className="placeholder-icon">📊</div>
                  <h3>Sponsor Analytics</h3>
                  <p>
                    Comprehensive analytics and reporting will be implemented
                    here.
                  </p>
                  <p>
                    This will include ROI analysis, brand visibility metrics,
                    engagement tracking, and performance dashboards.
                  </p>
                  <div className="placeholder-stats">
                    <div className="placeholder-stat">
                      <div className="stat-value">
                        {formatCurrency(sponsor.totalValue)}
                      </div>
                      <div className="stat-label">Total Investment</div>
                    </div>
                    <div className="placeholder-stat">
                      <div className="stat-value">4.2x</div>
                      <div className="stat-label">ROI Multiplier</div>
                    </div>
                    <div className="placeholder-stat">
                      <div className="stat-value">95%</div>
                      <div className="stat-label">Brand Recognition</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => console.log('Navigate to sponsor analytics')}
                  >
                    🚀 Coming Soon
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'contract' && (
              <div className="sponsor-contract">
                <div className="contract-placeholder">
                  <div className="placeholder-icon">📄</div>
                  <h3>Contract Management</h3>
                  <p>
                    Contract and legal document management will be implemented
                    here.
                  </p>
                  <p>
                    This will include contract terms, renewal dates, payment
                    schedules, and legal documentation.
                  </p>
                  <div className="placeholder-stats">
                    <div className="placeholder-stat">
                      <div className="stat-value">
                        {sponsor.tier.charAt(0).toUpperCase() +
                          sponsor.tier.slice(1)}
                      </div>
                      <div className="stat-label">Sponsorship Tier</div>
                    </div>
                    <div className="placeholder-stat">
                      <div className="stat-value">12 months</div>
                      <div className="stat-label">Contract Duration</div>
                    </div>
                    <div className="placeholder-stat">
                      <div className="stat-value">Active</div>
                      <div className="stat-label">Contract Status</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      console.log('Navigate to contract management')
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

export default SponsorDetailsPage;
