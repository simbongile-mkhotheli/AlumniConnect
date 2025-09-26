import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpotlightsService } from '../../services/spotlightsService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Spotlight } from '../../types';

export const SpotlightDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [spotlight, setSpotlight] = useState<Spotlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'content' | 'engagement' | 'analytics'
  >('overview');

  useEffect(() => {
    if (id) {
      loadSpotlightDetails(id);
    }
  }, [id]);

  const loadSpotlightDetails = async (spotlightId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading spotlight details for ID:', spotlightId);
      const response = await SpotlightsService.getSpotlight(spotlightId);

      if (response.success && response.data) {
        setSpotlight(response.data);
        console.log('✅ Spotlight details loaded:', response.data);
      } else {
        throw new Error(response.message || 'Failed to load spotlight details');
      }
    } catch (err) {
      console.error('❌ Error loading spotlight details:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load spotlight details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/admin/spotlights');
  };

  const handleEdit = () => {
    if (spotlight) {
      navigate(`/admin/spotlights/edit/${spotlight.id}`);
    }
  };

  const handleAction = async (
    action:
      | 'publish'
      | 'unpublish'
      | 'feature'
      | 'unfeature'
      | 'archive'
      | 'delete'
  ) => {
    if (!spotlight) return;

    const confirmMessage =
      action === 'delete'
        ? `Are you sure you want to delete "${spotlight.title}"? This action cannot be undone.`
        : `Are you sure you want to ${action} "${spotlight.title}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      let response;
      switch (action) {
        case 'publish':
          response = await SpotlightsService.publishSpotlight(spotlight.id);
          break;
        case 'unpublish':
          response = await SpotlightsService.unpublishSpotlight(spotlight.id);
          break;
        case 'feature':
          response = await SpotlightsService.featureSpotlight(spotlight.id);
          break;
        case 'unfeature':
          response = await SpotlightsService.unfeatureSpotlight(spotlight.id);
          break;
        case 'archive':
          response = await SpotlightsService.archiveSpotlight(spotlight.id);
          break;
        case 'delete':
          response = await SpotlightsService.deleteSpotlight(spotlight.id);
          break;
      }

      if (response.success) {
        if (action === 'delete') {
          navigate('/admin/spotlights');
        } else {
          // Reload spotlight details to show updated status
          loadSpotlightDetails(spotlight.id);
        }
      } else {
        setError(response.message || `Failed to ${action} spotlight`);
      }
    } catch (err) {
      console.error(`Error ${action} spotlight:`, err);
      setError(`Failed to ${action} spotlight. Please try again.`);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'status-published';
      case 'draft':
        return 'status-draft';
      case 'scheduled':
        return 'status-scheduled';
      case 'archived':
        return 'status-archived';
      default:
        return 'status-unknown';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'success_story':
        return 'type-success-story';
      case 'video_interview':
        return 'type-video-interview';
      case 'tutorial':
        return 'type-tutorial';
      case 'achievement':
        return 'type-achievement';
      case 'announcement':
        return 'type-announcement';
      default:
        return 'type-general';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'success_story':
        return 'Success Story';
      case 'video_interview':
        return 'Video Interview';
      case 'tutorial':
        return 'Tutorial';
      case 'achievement':
        return 'Achievement';
      case 'announcement':
        return 'Announcement';
      default:
        return 'General';
    }
  };

  const getSpotlightIcon = (type: string) => {
    switch (type) {
      case 'success_story':
        return '👤';
      case 'video_interview':
        return '🎤';
      case 'tutorial':
        return '📚';
      case 'achievement':
        return '🚀';
      case 'announcement':
        return '📢';
      default:
        return '✨';
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

  const getEngagementRate = () => {
    if (!spotlight || spotlight.viewCount === 0) return 0;
    const totalEngagements =
      spotlight.likeCount +
      spotlight.shareCount +
      (spotlight.commentCount || 0);
    return Math.round((totalEngagements / spotlight.viewCount) * 100);
  };

  if (loading) {
    return (
      <div className="spotlight-details-overlay active">
        <div className="spotlight-details-container">
          <div className="spotlight-details-header">
            <h2 className="spotlight-details-title">
              Loading Spotlight Details...
            </h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="spotlight-details-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !spotlight) {
    return (
      <div className="spotlight-details-overlay active">
        <div className="spotlight-details-container">
          <div className="spotlight-details-header">
            <h2 className="spotlight-details-title">Spotlight Details</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="spotlight-details-body">
            <ErrorMessage
              error={error || 'Spotlight not found'}
              title="Failed to load spotlight details"
              showRetry
              onRetry={() => id && loadSpotlightDetails(id)}
              variant="card"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="spotlight-details-overlay active">
      <div className="spotlight-details-container">
        <div className="spotlight-details-header">
          <div className="spotlight-details-title-section">
            <h2 className="spotlight-details-title">{spotlight.title}</h2>
            <div className="spotlight-details-badges">
              <span
                className={`status-badge ${getStatusBadgeClass(spotlight.status)}`}
              >
                {spotlight.status.charAt(0).toUpperCase() +
                  spotlight.status.slice(1)}
              </span>
              <span
                className={`type-badge ${getTypeBadgeClass(spotlight.type)}`}
              >
                {getSpotlightIcon(spotlight.type)}{' '}
                {getTypeDisplayName(spotlight.type)}
              </span>
              {spotlight.featured && (
                <span className="featured-badge">⭐ Featured</span>
              )}
            </div>
          </div>
          <div className="spotlight-details-actions">
            <button className="btn btn-primary" onClick={handleEdit}>
              ✏️ Edit Spotlight
            </button>
            {spotlight.status === 'draft' && (
              <button
                className="btn btn-success"
                onClick={() => handleAction('publish')}
              >
                📢 Publish
              </button>
            )}
            {spotlight.status === 'published' && (
              <button
                className="btn btn-warning"
                onClick={() => handleAction('unpublish')}
              >
                📝 Unpublish
              </button>
            )}
            {spotlight.status === 'published' && !spotlight.featured && (
              <button
                className="btn btn-info"
                onClick={() => handleAction('feature')}
              >
                ⭐ Feature
              </button>
            )}
            {spotlight.featured && (
              <button
                className="btn btn-secondary"
                onClick={() => handleAction('unfeature')}
              >
                ⭐ Unfeature
              </button>
            )}
            <button
              className="btn btn-warning"
              onClick={() => handleAction('archive')}
            >
              📁 Archive
            </button>
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

        <div className="spotlight-details-body">
          {/* Tab Navigation */}
          <div className="spotlight-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📋 Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              📄 Content
            </button>
            <button
              className={`tab-btn ${activeTab === 'engagement' ? 'active' : ''}`}
              onClick={() => setActiveTab('engagement')}
            >
              💬 Engagement
            </button>
            <button
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="spotlight-tab-content">
            {activeTab === 'overview' && (
              <div className="spotlight-overview">
                {/* Key Metrics */}
                <div className="spotlight-metrics">
                  <div className="metric-card">
                    <div className="metric-icon">👁️</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {spotlight.viewCount.toLocaleString()}
                      </div>
                      <div className="metric-label">Total Views</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">❤️</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {spotlight.likeCount.toLocaleString()}
                      </div>
                      <div className="metric-label">Likes</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">📤</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {spotlight.shareCount.toLocaleString()}
                      </div>
                      <div className="metric-label">Shares</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                      <div className="metric-value">{getEngagementRate()}%</div>
                      <div className="metric-label">Engagement Rate</div>
                    </div>
                  </div>
                </div>

                {/* Spotlight Information */}
                <div className="spotlight-info-grid">
                  <div className="info-section">
                    <h3 className="info-section-title">👤 Featured Alumni</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{spotlight.featuredAlumniName}</span>
                      </div>
                      <div className="info-item">
                        <label>Alumni ID:</label>
                        <span>{spotlight.featuredAlumniId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">📝 Content Details</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Type:</label>
                        <span>{getTypeDisplayName(spotlight.type)}</span>
                      </div>
                      <div className="info-item">
                        <label>Status:</label>
                        <span className={getStatusBadgeClass(spotlight.status)}>
                          {spotlight.status.charAt(0).toUpperCase() +
                            spotlight.status.slice(1)}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Featured:</label>
                        <span
                          className={
                            spotlight.featured ? 'text-success' : 'text-muted'
                          }
                        >
                          {spotlight.featured ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">🎬 Media</h3>
                    <div className="info-content">
                      {spotlight.videoUrl && (
                        <div className="info-item">
                          <label>Video:</label>
                          <span>
                            <a
                              href={spotlight.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="media-link"
                            >
                              🎥 View Video
                            </a>
                          </span>
                        </div>
                      )}
                      {spotlight.imageUrl && (
                        <div className="info-item">
                          <label>Image:</label>
                          <span>
                            <a
                              href={spotlight.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="media-link"
                            >
                              🖼️ View Image
                            </a>
                          </span>
                        </div>
                      )}
                      {!spotlight.videoUrl && !spotlight.imageUrl && (
                        <div className="info-item">
                          <span className="text-muted">No media attached</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">📅 Timeline</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Created:</label>
                        <span>{formatDateTime(spotlight.createdAt)}</span>
                      </div>
                      {spotlight.updatedAt && (
                        <div className="info-item">
                          <label>Last Updated:</label>
                          <span>{formatDateTime(spotlight.updatedAt)}</span>
                        </div>
                      )}
                      {spotlight.publishedDate && (
                        <div className="info-item">
                          <label>Published:</label>
                          <span>{formatDateTime(spotlight.publishedDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {spotlight.tags && spotlight.tags.length > 0 && (
                  <div className="spotlight-tags-section">
                    <h3 className="info-section-title">🏷️ Tags</h3>
                    <div className="spotlight-tags-display">
                      {spotlight.tags.map((tag, index) => (
                        <span key={index} className="spotlight-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div className="spotlight-content">
                <div className="content-section">
                  <h3 className="info-section-title">📄 Full Content</h3>
                  <div className="content-display">
                    {spotlight.imageUrl && (
                      <div className="content-media">
                        <img
                          src={spotlight.imageUrl}
                          alt={spotlight.title}
                          className="content-image"
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {spotlight.videoUrl && (
                      <div className="content-media">
                        <div className="video-placeholder">
                          <div className="video-icon">🎥</div>
                          <p>Video Content</p>
                          <a
                            href={spotlight.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                          >
                            Watch Video
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="content-text">
                      <p>{spotlight.content}</p>
                    </div>
                  </div>
                </div>

                {spotlight.shortDescription && (
                  <div className="content-section">
                    <h3 className="info-section-title">📝 Short Description</h3>
                    <div className="content-display">
                      <p>{spotlight.shortDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'engagement' && (
              <div className="spotlight-engagement">
                <div className="engagement-placeholder">
                  <div className="placeholder-icon">💬</div>
                  <h3>Engagement Management</h3>
                  <p>
                    Engagement tracking and management will be implemented here.
                  </p>
                  <p>
                    This will include comments, likes, shares, and user
                    interactions.
                  </p>
                  <div className="engagement-stats">
                    <div className="stat-item">
                      <strong>Comments:</strong> {spotlight.commentCount || 0}
                    </div>
                    <div className="stat-item">
                      <strong>Likes:</strong> {spotlight.likeCount}
                    </div>
                    <div className="stat-item">
                      <strong>Shares:</strong> {spotlight.shareCount}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      console.log('Navigate to engagement management')
                    }
                  >
                    🚀 Coming Soon
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="spotlight-analytics">
                <div className="analytics-placeholder">
                  <div className="placeholder-icon">📊</div>
                  <h3>Spotlight Analytics</h3>
                  <p>
                    Detailed analytics and reporting will be implemented here.
                  </p>
                  <p>
                    This will include view trends, engagement metrics, audience
                    insights, and performance data.
                  </p>
                  <div className="analytics-preview">
                    <div className="metric-row">
                      <span>Total Views:</span>
                      <span>{spotlight.viewCount.toLocaleString()}</span>
                    </div>
                    <div className="metric-row">
                      <span>Engagement Rate:</span>
                      <span>{getEngagementRate()}%</span>
                    </div>
                    <div className="metric-row">
                      <span>Total Interactions:</span>
                      <span>
                        {(
                          spotlight.likeCount +
                          spotlight.shareCount +
                          (spotlight.commentCount || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      console.log('Navigate to spotlight analytics')
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

export default SpotlightDetailsPage;
