import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChaptersService } from '@features/chapters/services';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import type { Chapter } from '@features/chapters/types';

export const ChapterDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'events' | 'analytics'
  >('overview');

  useEffect(() => {
    if (id) {
      loadChapterDetails(id);
    }
  }, [id]);

  const loadChapterDetails = async (chapterId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading chapter details for ID:', chapterId);
      const response = await ChaptersService.getChapter(chapterId);

      if (response.success && response.data) {
        setChapter(response.data);
        console.log('✅ Chapter details loaded:', response.data);
      } else {
        throw new Error(response.message || 'Failed to load chapter details');
      }
    } catch (err) {
      console.error('❌ Error loading chapter details:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load chapter details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/admin/chapters');
  };

  const handleEdit = () => {
    if (chapter) {
      navigate(`/admin/chapters/edit/${chapter.id}`);
    }
  };

  const handleAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (!chapter) return;

    const confirmMessage =
      action === 'delete'
        ? `Are you sure you want to delete "${chapter.name}"? This action cannot be undone.`
        : `Are you sure you want to ${action} "${chapter.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      let response;
      switch (action) {
        case 'activate':
          response = await ChaptersService.activateChapter(chapter.id);
          break;
        case 'deactivate':
          response = await ChaptersService.deactivateChapter(chapter.id);
          break;
        case 'delete':
          response = await ChaptersService.deleteChapter(chapter.id);
          break;
      }

      if (response.success) {
        if (action === 'delete') {
          navigate('/admin/chapters');
        } else {
          // Reload chapter details to show updated status
          loadChapterDetails(chapter.id);
        }
      } else {
        setError(response.message || `Failed to ${action} chapter`);
      }
    } catch (err) {
      console.error(`Error ${action} chapter:`, err);
      setError(`Failed to ${action} chapter. Please try again.`);
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
      default:
        return 'status-unknown';
    }
  };

  const getPerformanceBadgeClass = (performance: string) => {
    switch (performance) {
      case 'high':
        return 'performance-high';
      case 'excellent':
        return 'performance-excellent';
      case 'medium':
        return 'performance-medium';
      case 'low':
        return 'performance-low';
      default:
        return 'performance-medium';
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

  const getSponsorDisplayName = (sponsor: string) => {
    const sponsorMap: { [key: string]: string } = {
      telkom: 'Telkom',
      comptia: 'CompTIA',
      iweb: 'iWeb',
      github: 'GitHub',
    };
    return sponsorMap[sponsor] || sponsor;
  };

  if (loading) {
    return (
      <div className="chapter-details-overlay active">
        <div className="chapter-details-container">
          <div className="chapter-details-header">
            <h2 className="chapter-details-title">
              Loading Chapter Details...
            </h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="chapter-details-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="chapter-details-overlay active">
        <div className="chapter-details-container">
          <div className="chapter-details-header">
            <h2 className="chapter-details-title">Chapter Details</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="chapter-details-body">
            <ErrorMessage
              error={error || 'Chapter not found'}
              title="Failed to load chapter details"
              showRetry
              onRetry={() => id && loadChapterDetails(id)}
              variant="card"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-details-overlay active">
      <div className="chapter-details-container">
        <div className="chapter-details-header">
          <div className="chapter-details-title-section">
            <h2 className="chapter-details-title">{chapter.name}</h2>
            <div className="chapter-details-badges">
              <span
                className={`status-badge ${getStatusBadgeClass(chapter.status)}`}
              >
                {chapter.status.charAt(0).toUpperCase() +
                  chapter.status.slice(1)}
              </span>
              {(chapter as any).performance && (
                <span
                  className={`performance-badge ${getPerformanceBadgeClass((chapter as any).performance)}`}
                >
                  {(chapter as any).performance.charAt(0).toUpperCase() +
                    (chapter as any).performance.slice(1)}{' '}
                  Performance
                </span>
              )}
              {(chapter as any).isSponsored && (
                <span className="sponsor-badge">Sponsored</span>
              )}
            </div>
          </div>
          <div className="chapter-details-actions">
            <button className="btn btn-primary" onClick={handleEdit}>
              ✏️ Edit Chapter
            </button>
            {chapter.status === 'pending' && (
              <button
                className="btn btn-success"
                onClick={() => handleAction('activate')}
              >
                ✅ Activate
              </button>
            )}
            {chapter.status === 'active' && (
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

        <div className="chapter-details-body">
          {/* Tab Navigation */}
          <div className="chapter-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📋 Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              👥 Members
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
          </div>

          {/* Tab Content */}
          <div className="chapter-tab-content">
            {activeTab === 'overview' && (
              <div className="chapter-overview">
                {/* Key Metrics */}
                <div className="chapter-metrics">
                  <div className="metric-card">
                    <div className="metric-icon">👥</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {(chapter as any).memberCount ||
                          chapter.membersCount ||
                          0}
                      </div>
                      <div className="metric-label">Total Members</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {(chapter as any).engagementRate || 0}%
                      </div>
                      <div className="metric-label">Engagement Rate</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">📅</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {(chapter as any).eventsThisMonth ||
                          (chapter as any).eventsCount ||
                          0}
                      </div>
                      <div className="metric-label">Events This Month</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">🏆</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {(chapter as any).eventsThisYear || 0}
                      </div>
                      <div className="metric-label">Events This Year</div>
                    </div>
                  </div>
                </div>

                {/* Chapter Information */}
                <div className="chapter-info-grid">
                  <div className="info-section">
                    <h3 className="info-section-title">
                      📍 Location & Contact
                    </h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Location:</label>
                        <span>{chapter.location}</span>
                      </div>
                      {(chapter as any).province && (
                        <div className="info-item">
                          <label>Province:</label>
                          <span>
                            {(chapter as any).province
                              .replace('-', ' ')
                              .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </span>
                        </div>
                      )}
                      <div className="info-item">
                        <label>Chapter Lead:</label>
                        <span>
                          {(chapter as any).leadName || 'Not assigned'}
                        </span>
                      </div>
                      {(chapter as any).leadEmail && (
                        <div className="info-item">
                          <label>Lead Email:</label>
                          <span>
                            <a
                              href={`mailto:${(chapter as any).leadEmail}`}
                              className="email-link"
                            >
                              {(chapter as any).leadEmail}
                            </a>
                          </span>
                        </div>
                      )}
                      {(chapter as any).leadPhone && (
                        <div className="info-item">
                          <label>Lead Phone:</label>
                          <span>
                            <a
                              href={`tel:${(chapter as any).leadPhone}`}
                              className="phone-link"
                            >
                              {(chapter as any).leadPhone}
                            </a>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">
                      🏢 Meeting Information
                    </h3>
                    <div className="info-content">
                      {(chapter as any).meetingVenue && (
                        <div className="info-item">
                          <label>Venue:</label>
                          <span>{(chapter as any).meetingVenue}</span>
                        </div>
                      )}
                      {(chapter as any).meetingFrequency && (
                        <div className="info-item">
                          <label>Frequency:</label>
                          <span>
                            {(chapter as any).meetingFrequency
                              .charAt(0)
                              .toUpperCase() +
                              (chapter as any).meetingFrequency.slice(1)}
                          </span>
                        </div>
                      )}
                      {(chapter as any).nextMeeting && (
                        <div className="info-item">
                          <label>Next Meeting:</label>
                          <span>
                            {formatDate((chapter as any).nextMeeting)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">💰 Sponsorship</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Sponsored:</label>
                        <span
                          className={
                            (chapter as any).isSponsored
                              ? 'text-success'
                              : 'text-muted'
                          }
                        >
                          {(chapter as any).isSponsored ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {(chapter as any).sponsor && (
                        <div className="info-item">
                          <label>Sponsor:</label>
                          <span>
                            {getSponsorDisplayName((chapter as any).sponsor)}
                          </span>
                        </div>
                      )}
                      {(chapter as any).sponsorshipValue && (
                        <div className="info-item">
                          <label>Sponsorship Value:</label>
                          <span>
                            R
                            {(chapter as any).sponsorshipValue.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">📊 Chapter Stats</h3>
                    <div className="info-content">
                      {(chapter as any).activeMembers && (
                        <div className="info-item">
                          <label>Active Members:</label>
                          <span>{(chapter as any).activeMembers}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <label>Created:</label>
                        <span>
                          {(chapter as any).createdAt
                            ? formatDate((chapter as any).createdAt)
                            : 'Unknown'}
                        </span>
                      </div>
                      {(chapter as any).updatedAt && (
                        <div className="info-item">
                          <label>Last Updated:</label>
                          <span>{formatDate((chapter as any).updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {(chapter as any).description && (
                  <div className="chapter-description">
                    <h3 className="info-section-title">📝 Description</h3>
                    <p className="description-text">
                      {(chapter as any).description}
                    </p>
                  </div>
                )}

                {/* Focus Areas */}
                {(chapter as any).focusAreas &&
                  Array.isArray((chapter as any).focusAreas) &&
                  (chapter as any).focusAreas.length > 0 && (
                    <div className="chapter-focus-areas">
                      <h3 className="info-section-title">🎯 Focus Areas</h3>
                      <div className="focus-areas-tags">
                        {(chapter as any).focusAreas.map(
                          (area: string, index: number) => (
                            <span key={index} className="focus-area-tag">
                              {area.charAt(0).toUpperCase() + area.slice(1)}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Social Media */}
                {(chapter as any).socialMedia && (
                  <div className="chapter-social">
                    <h3 className="info-section-title">🌐 Social Media</h3>
                    <div className="social-links">
                      {(chapter as any).socialMedia.facebook && (
                        <a
                          href={(chapter as any).socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link facebook"
                        >
                          📘 Facebook
                        </a>
                      )}
                      {(chapter as any).socialMedia.twitter && (
                        <a
                          href={(chapter as any).socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link twitter"
                        >
                          🐦 Twitter
                        </a>
                      )}
                      {(chapter as any).socialMedia.linkedin && (
                        <a
                          href={(chapter as any).socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link linkedin"
                        >
                          💼 LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="chapter-members">
                <div className="members-header">
                  <h3>👥 Member Management & Analytics</h3>
                  <div className="members-controls">
                    <div className="search-box">
                      <input
                        type="text"
                        placeholder="Search members..."
                        className="search-input"
                      />
                      <span className="search-icon">🔍</span>
                    </div>
                    <select className="filter-selector">
                      <option value="all">All Members</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                      <option value="new">New Members</option>
                    </select>
                    <button className="btn btn-primary">
                      👤 Add Member
                    </button>
                    <button className="btn btn-secondary">
                      📊 Export List
                    </button>
                  </div>
                </div>

                {/* Member Statistics Dashboard */}
                <div className="members-stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <div className="stat-value">{chapter.memberCount || 0}</div>
                      <div className="stat-label">Total Members</div>
                      <div className="stat-change positive">+5 this month</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {Math.round((chapter.memberCount || 0) * 0.78)}
                      </div>
                      <div className="stat-label">Active Members</div>
                      <div className="stat-change positive">+3% this month</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">🆕</div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {Math.round((chapter.memberCount || 0) * 0.12)}
                      </div>
                      <div className="stat-label">New This Month</div>
                      <div className="stat-change positive">+2 from last month</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {((chapter as any).engagementRate || 65)}%
                      </div>
                      <div className="stat-label">Engagement Rate</div>
                      <div className="stat-change positive">+7% improvement</div>
                    </div>
                  </div>
                </div>

                {/* Member Categories Overview */}
                <div className="members-categories-section">
                  <div className="category-container">
                    <div className="category-header">
                      <h4>Member Categories & Distribution</h4>
                      <button className="btn btn-outline">Manage Roles</button>
                    </div>
                    <div className="categories-grid">
                      <div className="category-card">
                        <div className="category-info">
                          <div className="category-icon">🎓</div>
                          <div className="category-details">
                            <strong>Recent Graduates</strong>
                            <span>2020-2024 • Alumni</span>
                          </div>
                        </div>
                        <div className="category-stats">
                          <div className="category-count">{Math.round((chapter.memberCount || 0) * 0.35)}</div>
                          <div className="category-percentage">35%</div>
                        </div>
                      </div>

                      <div className="category-card">
                        <div className="category-info">
                          <div className="category-icon">💼</div>
                          <div className="category-details">
                            <strong>Mid-Career Professionals</strong>
                            <span>2010-2019 • Professionals</span>
                          </div>
                        </div>
                        <div className="category-stats">
                          <div className="category-count">{Math.round((chapter.memberCount || 0) * 0.45)}</div>
                          <div className="category-percentage">45%</div>
                        </div>
                      </div>

                      <div className="category-card">
                        <div className="category-info">
                          <div className="category-icon">🏆</div>
                          <div className="category-details">
                            <strong>Senior Alumni</strong>
                            <span>Before 2010 • Leaders</span>
                          </div>
                        </div>
                        <div className="category-stats">
                          <div className="category-count">{Math.round((chapter.memberCount || 0) * 0.20)}</div>
                          <div className="category-percentage">20%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member List Table */}
                <div className="members-table-section">
                  <div className="table-header">
                    <h4>Member Directory</h4>
                    <div className="table-actions">
                      <button className="btn btn-outline">Bulk Actions</button>
                      <button className="btn btn-outline">Import Members</button>
                    </div>
                  </div>
                  <div className="members-table">
                    <div className="table-header-row">
                      <input type="checkbox" className="select-all" />
                      <span>Member</span>
                      <span>Status</span>
                      <span>Joined</span>
                      <span>Engagement</span>
                      <span>Role</span>
                      <span>Actions</span>
                    </div>
                    
                    {/* Sample Member Rows */}
                    {[
                      { name: 'Sarah Mthembu', email: 'sarah.m@example.com', status: 'Active', joined: '2024-01-15', engagement: 92, role: 'Chapter Lead' },
                      { name: 'Thabo Nkomo', email: 'thabo.n@example.com', status: 'Active', joined: '2024-03-22', engagement: 78, role: 'Member' },
                      { name: 'Priya Patel', email: 'priya.p@example.com', status: 'Active', joined: '2024-02-10', engagement: 85, role: 'Volunteer' },
                      { name: 'James Wilson', email: 'james.w@example.com', status: 'Inactive', joined: '2023-11-08', engagement: 23, role: 'Member' },
                      { name: 'Nomsa Dlamini', email: 'nomsa.d@example.com', status: 'Active', joined: '2024-04-03', engagement: 67, role: 'Event Coordinator' },
                    ].map((member, index) => (
                      <div key={index} className="table-row">
                        <input type="checkbox" />
                        <div className="member-info">
                          <div className="member-avatar">
                            <span>{member.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div className="member-details">
                            <strong>{member.name}</strong>
                            <span>{member.email}</span>
                          </div>
                        </div>
                        <span className={`status-badge ${member.status.toLowerCase()}`}>
                          {member.status}
                        </span>
                        <span className="join-date">{member.joined}</span>
                        <div className="engagement-meter">
                          <div 
                            className="engagement-bar"
                            style={{ width: `${member.engagement}%` }}
                          ></div>
                          <span>{member.engagement}%</span>
                        </div>
                        <span className="member-role">{member.role}</span>
                        <div className="member-actions">
                          <button className="action-btn view">👁️</button>
                          <button className="action-btn edit">✏️</button>
                          <button className="action-btn message">💬</button>
                          <button className="action-btn more">⋯</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Member Activity & Engagement */}
                <div className="member-activity-section">
                  <div className="activity-container">
                    <h4>🎯 Member Engagement & Activity</h4>
                    <div className="activity-grid">
                      <div className="activity-card">
                        <div className="activity-header">
                          <h5>Event Participation</h5>
                          <span className="activity-trend up">↗️ +15%</span>
                        </div>
                        <div className="activity-chart">
                          <div className="participation-bars">
                            {[85, 92, 78, 88, 94].map((height, index) => (
                              <div
                                key={index}
                                className="participation-bar"
                                style={{ height: `${height}%` }}
                              ></div>
                            ))}
                          </div>
                          <div className="chart-labels">
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                            <span>May</span>
                          </div>
                        </div>
                      </div>

                      <div className="activity-card">
                        <div className="activity-header">
                          <h5>Communication Activity</h5>
                          <span className="activity-trend stable">→ Stable</span>
                        </div>
                        <div className="communication-metrics">
                          <div className="comm-metric">
                            <div className="metric-icon">📧</div>
                            <div className="metric-data">
                              <strong>Email Open Rate</strong>
                              <span>78%</span>
                            </div>
                          </div>
                          <div className="comm-metric">
                            <div className="metric-icon">💬</div>
                            <div className="metric-data">
                              <strong>Forum Posts</strong>
                              <span>142 this month</span>
                            </div>
                          </div>
                          <div className="comm-metric">
                            <div className="metric-icon">📱</div>
                            <div className="metric-data">
                              <strong>App Usage</strong>
                              <span>65% weekly active</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="activity-card">
                        <div className="activity-header">
                          <h5>Member Retention</h5>
                          <span className="activity-trend up">↗️ +8%</span>
                        </div>
                        <div className="retention-overview">
                          <div className="retention-circle">
                            <div className="retention-percentage">89%</div>
                            <div className="retention-label">12-Month Retention</div>
                          </div>
                          <div className="retention-details">
                            <div className="retention-stat">
                              <strong>New Member Onboarding</strong>
                              <span>94% completion rate</span>
                            </div>
                            <div className="retention-stat">
                              <strong>At-Risk Members</strong>
                              <span>7 members need attention</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Insights & Actions */}
                <div className="member-insights-section">
                  <div className="insights-header">
                    <h4>💡 Member Insights & Recommendations</h4>
                  </div>
                  <div className="member-insights-grid">
                    <div className="insight-card positive">
                      <div className="insight-icon">✅</div>
                      <div className="insight-content">
                        <h5>Strong Engagement Levels</h5>
                        <p>Member participation is 23% above chapter average with consistent event attendance.</p>
                        <span className="insight-action">Continue current engagement strategies</span>
                      </div>
                    </div>

                    <div className="insight-card warning">
                      <div className="insight-icon">⚠️</div>
                      <div className="insight-content">
                        <h5>7 Members At Risk</h5>
                        <p>Members showing declining engagement patterns over the past 3 months.</p>
                        <span className="insight-action">Schedule one-on-one check-ins</span>
                      </div>
                    </div>

                    <div className="insight-card info">
                      <div className="insight-icon">🎯</div>
                      <div className="insight-content">
                        <h5>Mentorship Opportunity</h5>
                        <p>15 recent graduates could benefit from pairing with senior alumni members.</p>
                        <span className="insight-action">Launch mentorship matching program</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="member-quick-actions">
                  <div className="actions-header">
                    <h4>🚀 Quick Member Actions</h4>
                  </div>
                  <div className="quick-actions-grid">
                    <button className="quick-action-btn">
                      <div className="action-icon">📧</div>
                      <div className="action-text">
                        <strong>Send Newsletter</strong>
                        <span>Broadcast to all members</span>
                      </div>
                    </button>

                    <button className="quick-action-btn">
                      <div className="action-icon">🎉</div>
                      <div className="action-text">
                        <strong>Welcome New Members</strong>
                        <span>Onboarding sequence</span>
                      </div>
                    </button>

                    <button className="quick-action-btn">
                      <div className="action-icon">📊</div>
                      <div className="action-text">
                        <strong>Member Survey</strong>
                        <span>Satisfaction & feedback</span>
                      </div>
                    </button>

                    <button className="quick-action-btn">
                      <div className="action-icon">👥</div>
                      <div className="action-text">
                        <strong>Engagement Campaign</strong>
                        <span>Re-activate inactive members</span>
                      </div>
                    </button>

                    <button className="quick-action-btn">
                      <div className="action-icon">🏆</div>
                      <div className="action-text">
                        <strong>Member Recognition</strong>
                        <span>Celebrate achievements</span>
                      </div>
                    </button>

                    <button className="quick-action-btn">
                      <div className="action-icon">📈</div>
                      <div className="action-text">
                        <strong>Growth Report</strong>
                        <span>Member acquisition analysis</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="chapter-events">
                <div className="events-header">
                  <h3>📅 Event Management & Analytics</h3>
                  <div className="events-controls">
                    <div className="events-search-box">
                      <input
                        type="text"
                        placeholder="Search events..."
                        className="search-input"
                      />
                      <span className="search-icon">🔍</span>
                    </div>
                    <select className="events-filter-selector">
                      <option value="all">All Events</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past Events</option>
                      <option value="featured">Featured</option>
                    </select>
                    <button className="btn btn-primary">
                      ➕ Create Event
                    </button>
                    <button className="btn btn-secondary">
                      📊 Export Events
                    </button>
                  </div>
                </div>

                {/* Event Statistics Dashboard */}
                <div className="events-stats-grid">
                  <div className="event-stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                      <div className="stat-value">{(chapter as any).eventsThisMonth || Math.round(Math.random() * 15 + 5)}</div>
                      <div className="stat-label">Events This Month</div>
                      <div className="stat-change positive">+2 from last month</div>
                    </div>
                  </div>
                  
                  <div className="event-stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {Math.round(((chapter as any).eventsThisMonth || 8) * 45)}
                      </div>
                      <div className="stat-label">Total Attendees</div>
                      <div className="stat-change positive">+18% growth</div>
                    </div>
                  </div>

                  <div className="event-stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {(4.2 + Math.random() * 0.6).toFixed(1)}
                      </div>
                      <div className="stat-label">Avg. Rating</div>
                      <div className="stat-change positive">+0.3 improvement</div>
                    </div>
                  </div>

                  <div className="event-stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                      <div className="stat-value">87%</div>
                      <div className="stat-label">Success Rate</div>
                      <div className="stat-change positive">+5% this quarter</div>
                    </div>
                  </div>
                </div>

                {/* Event Calendar Overview */}
                <div className="events-calendar-section">
                  <div className="calendar-container">
                    <div className="calendar-header">
                      <h4>📆 Event Calendar Overview</h4>
                      <div className="calendar-controls">
                        <button className="calendar-nav">← Prev</button>
                        <span className="current-month">September 2025</span>
                        <button className="calendar-nav">Next →</button>
                      </div>
                    </div>
                    <div className="calendar-grid">
                      <div className="calendar-weekdays">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="weekday">{day}</div>
                        ))}
                      </div>
                      <div className="calendar-days">
                        {Array.from({length: 30}, (_, i) => i + 1).map(day => (
                          <div key={day} className={`calendar-day ${[5, 12, 18, 25].includes(day) ? 'has-event' : ''}`}>
                            <span className="day-number">{day}</span>
                            {[5, 12, 18, 25].includes(day) && (
                              <div className="event-dots">
                                <div className="event-dot networking"></div>
                                {day === 18 && <div className="event-dot workshop"></div>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="calendar-legend">
                      <div className="legend-item">
                        <div className="legend-dot networking"></div>
                        <span>Networking Events</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-dot workshop"></div>
                        <span>Workshops</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-dot social"></div>
                        <span>Social Events</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Events List */}
                <div className="events-list-section">
                  <div className="events-list-header">
                    <h4>🚀 Upcoming Events</h4>
                    <div className="list-view-controls">
                      <button className="view-toggle active">List</button>
                      <button className="view-toggle">Card</button>
                    </div>
                  </div>
                  <div className="events-list">
                    {[
                      {
                        id: 1,
                        title: 'Professional Networking Mixer',
                        date: '2025-09-25',
                        time: '18:00',
                        type: 'Networking',
                        venue: 'Sandton Convention Centre',
                        attendees: 45,
                        capacity: 60,
                        status: 'confirmed',
                        featured: true
                      },
                      {
                        id: 2,
                        title: 'Career Development Workshop',
                        date: '2025-10-05',
                        time: '09:00',
                        type: 'Workshop',
                        venue: 'Chapter Office',
                        attendees: 28,
                        capacity: 35,
                        status: 'confirmed',
                        featured: false
                      },
                      {
                        id: 3,
                        title: 'Alumni Success Stories Panel',
                        date: '2025-10-12',
                        time: '19:00',
                        type: 'Panel Discussion',
                        venue: 'Virtual Event',
                        attendees: 67,
                        capacity: 100,
                        status: 'confirmed',
                        featured: true
                      },
                      {
                        id: 4,
                        title: 'Monthly Social Gathering',
                        date: '2025-10-18',
                        time: '17:30',
                        type: 'Social',
                        venue: 'Local Restaurant',
                        attendees: 22,
                        capacity: 40,
                        status: 'planning',
                        featured: false
                      }
                    ].map(event => (
                      <div key={event.id} className="event-item">
                        <div className="event-date">
                          <div className="date-day">{new Date(event.date).getDate()}</div>
                          <div className="date-month">{new Date(event.date).toLocaleDateString('en', {month: 'short'})}</div>
                        </div>
                        <div className="event-details">
                          <div className="event-title-row">
                            <h5 className="event-title">{event.title}</h5>
                            {event.featured && <span className="featured-badge">⭐ Featured</span>}
                            <span className={`event-status ${event.status}`}>{event.status}</span>
                          </div>
                          <div className="event-meta">
                            <span className="event-type">{event.type}</span>
                            <span className="event-time">⏰ {event.time}</span>
                            <span className="event-venue">📍 {event.venue}</span>
                          </div>
                          <div className="event-attendance">
                            <div className="attendance-bar">
                              <div 
                                className="attendance-fill"
                                style={{width: `${(event.attendees / event.capacity) * 100}%`}}
                              ></div>
                            </div>
                            <span className="attendance-text">
                              {event.attendees}/{event.capacity} registered
                            </span>
                          </div>
                        </div>
                        <div className="event-actions">
                          <button className="event-action-btn view">👁️ View</button>
                          <button className="event-action-btn edit">✏️ Edit</button>
                          <button className="event-action-btn attendees">👥 RSVPs</button>
                          <button className="event-action-btn more">⋯</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Performance Analytics */}
                <div className="event-performance-section">
                  <div className="performance-container">
                    <h4>📊 Event Performance Analytics</h4>
                    <div className="performance-grid">
                      <div className="performance-chart">
                        <div className="chart-header">
                          <h5>Monthly Event Attendance</h5>
                          <span className="trend-indicator up">↗️ +23%</span>
                        </div>
                        <div className="attendance-chart">
                          <div className="chart-bars">
                            {[65, 78, 82, 75, 89, 94].map((height, index) => (
                              <div
                                key={index}
                                className="attendance-bar"
                                style={{height: `${height}%`}}
                                title={`${height}% attendance`}
                              ></div>
                            ))}
                          </div>
                          <div className="chart-labels">
                            <span>Apr</span>
                            <span>May</span>
                            <span>Jun</span>
                            <span>Jul</span>
                            <span>Aug</span>
                            <span>Sep</span>
                          </div>
                        </div>
                      </div>

                      <div className="performance-metrics">
                        <div className="metric-header">
                          <h5>Event Type Performance</h5>
                        </div>
                        <div className="type-metrics">
                          <div className="type-metric">
                            <div className="type-info">
                              <div className="type-icon">🤝</div>
                              <div className="type-details">
                                <strong>Networking Events</strong>
                                <span>8 events • 92% success rate</span>
                              </div>
                            </div>
                            <div className="type-score excellent">A+</div>
                          </div>
                          
                          <div className="type-metric">
                            <div className="type-info">
                              <div className="type-icon">🎓</div>
                              <div className="type-details">
                                <strong>Workshops</strong>
                                <span>5 events • 87% success rate</span>
                              </div>
                            </div>
                            <div className="type-score good">A</div>
                          </div>

                          <div className="type-metric">
                            <div className="type-info">
                              <div className="type-icon">🎉</div>
                              <div className="type-details">
                                <strong>Social Events</strong>
                                <span>12 events • 81% success rate</span>
                              </div>
                            </div>
                            <div className="type-score good">B+</div>
                          </div>

                          <div className="type-metric">
                            <div className="type-info">
                              <div className="type-icon">🎤</div>
                              <div className="type-details">
                                <strong>Panel Discussions</strong>
                                <span>3 events • 95% success rate</span>
                              </div>
                            </div>
                            <div className="type-score excellent">A+</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Insights & Recommendations */}
                <div className="event-insights-section">
                  <div className="insights-header">
                    <h4>💡 Event Insights & Recommendations</h4>
                  </div>
                  <div className="event-insights-grid">
                    <div className="event-insight-card positive">
                      <div className="insight-icon">🎉</div>
                      <div className="insight-content">
                        <h5>Outstanding Event Success</h5>
                        <p>Your events have a 87% success rate, significantly above the 65% national average.</p>
                        <span className="insight-action">Continue current event planning strategies</span>
                      </div>
                    </div>

                    <div className="event-insight-card info">
                      <div className="insight-icon">🎯</div>
                      <div className="insight-content">
                        <h5>Panel Discussions Opportunity</h5>
                        <p>Panel discussions show highest engagement (95% success rate) but are underutilized.</p>
                        <span className="insight-action">Schedule 2 more panel events this quarter</span>
                      </div>
                    </div>

                    <div className="event-insight-card warning">
                      <div className="insight-icon">⚠️</div>
                      <div className="insight-content">
                        <h5>Venue Capacity Optimization</h5>
                        <p>3 upcoming events are at 75%+ capacity. Consider larger venues or additional sessions.</p>
                        <span className="insight-action">Review venue capacity for high-demand events</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Event Actions */}
                <div className="event-quick-actions">
                  <div className="quick-actions-header">
                    <h4>⚡ Quick Event Actions</h4>
                  </div>
                  <div className="event-actions-grid">
                    <button className="quick-event-action-btn">
                      <div className="action-icon">📝</div>
                      <div className="action-text">
                        <strong>Create New Event</strong>
                        <span>Plan your next chapter event</span>
                      </div>
                    </button>

                    <button className="quick-event-action-btn">
                      <div className="action-icon">📧</div>
                      <div className="action-text">
                        <strong>Send Invitations</strong>
                        <span>Notify members about upcoming events</span>
                      </div>
                    </button>

                    <button className="quick-event-action-btn">
                      <div className="action-icon">📊</div>
                      <div className="action-text">
                        <strong>Event Analytics</strong>
                        <span>Deep dive into event performance</span>
                      </div>
                    </button>

                    <button className="quick-event-action-btn">
                      <div className="action-icon">🎫</div>
                      <div className="action-text">
                        <strong>Manage RSVPs</strong>
                        <span>Track and manage event registrations</span>
                      </div>
                    </button>

                    <button className="quick-event-action-btn">
                      <div className="action-icon">📋</div>
                      <div className="action-text">
                        <strong>Event Templates</strong>
                        <span>Use pre-built event templates</span>
                      </div>
                    </button>

                    <button className="quick-event-action-btn">
                      <div className="action-icon">📈</div>
                      <div className="action-text">
                        <strong>Performance Report</strong>
                        <span>Generate detailed event reports</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="chapter-analytics">
                <div className="analytics-header">
                  <h3>📊 Chapter Analytics & Reporting</h3>
                  <div className="analytics-controls">
                    <select className="period-selector">
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                      <option value="1y">Last Year</option>
                    </select>
                    <button className="btn btn-secondary">
                      📊 Export Report
                    </button>
                  </div>
                </div>

                {/* Key Metrics Dashboard */}
                <div className="analytics-metrics-grid">
                  <div className="metric-card">
                    <div className="metric-icon">👥</div>
                    <div className="metric-content">
                      <div className="metric-value">{chapter.memberCount || 0}</div>
                      <div className="metric-label">Total Members</div>
                      <div className="metric-change positive">+12% this month</div>
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {Math.round((chapter.memberCount || 0) * 0.73)}
                      </div>
                      <div className="metric-label">Active Members</div>
                      <div className="metric-change positive">+8% this month</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">📅</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {(chapter as any).eventsThisMonth || Math.round(Math.random() * 15 + 5)}
                      </div>
                      <div className="metric-label">Events Hosted</div>
                      <div className="metric-change neutral">Same as last month</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">⭐</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {((chapter as any).engagementRate ? (chapter as any).engagementRate / 20 + 2 : 4.2 + Math.random() * 0.6).toFixed(1)}
                      </div>
                      <div className="metric-label">Engagement Score</div>
                      <div className="metric-change positive">+0.3 this month</div>
                    </div>
                  </div>
                </div>

                {/* Analytics Charts Section */}
                <div className="analytics-charts-section">
                  <div className="chart-container">
                    <div className="chart-header">
                      <h4>Member Growth Trend</h4>
                      <div className="chart-legend">
                        <span className="legend-item">
                          <div className="legend-color growth"></div>
                          New Members
                        </span>
                        <span className="legend-item">
                          <div className="legend-color total"></div>
                          Total Members
                        </span>
                      </div>
                    </div>
                    <div className="chart-placeholder">
                      <div className="chart-visual">
                        <div className="chart-bars">
                          {[8, 12, 6, 15, 9, 18, 14].map((height, index) => (
                            <div
                              key={index}
                              className="chart-bar"
                              style={{ height: `${height * 3}px` }}
                            ></div>
                          ))}
                        </div>
                        <div className="chart-labels">
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                          <span>Sat</span>
                          <span>Sun</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chart-container">
                    <div className="chart-header">
                      <h4>Engagement Metrics</h4>
                    </div>
                    <div className="engagement-breakdown">
                      <div className="engagement-item">
                        <div className="engagement-circle high">
                          <span>73%</span>
                        </div>
                        <div className="engagement-label">
                          <strong>Event Attendance</strong>
                          <span>Above average participation</span>
                        </div>
                      </div>
                      <div className="engagement-item">
                        <div className="engagement-circle medium">
                          <span>58%</span>
                        </div>
                        <div className="engagement-label">
                          <strong>Forum Activity</strong>
                          <span>Active discussions</span>
                        </div>
                      </div>
                      <div className="engagement-item">
                        <div className="engagement-circle low">
                          <span>31%</span>
                        </div>
                        <div className="engagement-label">
                          <strong>Monthly Surveys</strong>
                          <span>Room for improvement</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Analytics Tables */}
                <div className="analytics-tables-section">
                  <div className="table-container">
                    <div className="table-header">
                      <h4>Member Demographics</h4>
                      <button className="btn btn-outline">View Details</button>
                    </div>
                    <div className="analytics-table">
                      <div className="table-row header">
                        <span>Category</span>
                        <span>Count</span>
                        <span>Percentage</span>
                        <span>Trend</span>
                      </div>
                      <div className="table-row">
                        <span>Recent Graduates (2020-2024)</span>
                        <span>{Math.round((chapter.memberCount || 0) * 0.35)}</span>
                        <span>35%</span>
                        <span className="trend up">↗️ +5%</span>
                      </div>
                      <div className="table-row">
                        <span>Mid-Career (2010-2019)</span>
                        <span>{Math.round((chapter.memberCount || 0) * 0.45)}</span>
                        <span>45%</span>
                        <span className="trend stable">→ 0%</span>
                      </div>
                      <div className="table-row">
                        <span>Senior Alumni (Before 2010)</span>
                        <span>{Math.round((chapter.memberCount || 0) * 0.20)}</span>
                        <span>20%</span>
                        <span className="trend down">↘️ -2%</span>
                      </div>
                    </div>
                  </div>

                  <div className="table-container">
                    <div className="table-header">
                      <h4>Event Performance</h4>
                      <button className="btn btn-outline">View All Events</button>
                    </div>
                    <div className="analytics-table">
                      <div className="table-row header">
                        <span>Event Type</span>
                        <span>Total Hosted</span>
                        <span>Avg. Attendance</span>
                        <span>Success Rate</span>
                      </div>
                      <div className="table-row">
                        <span>Networking Events</span>
                        <span>8</span>
                        <span>45</span>
                        <span className="success-rate high">89%</span>
                      </div>
                      <div className="table-row">
                        <span>Professional Development</span>
                        <span>5</span>
                        <span>32</span>
                        <span className="success-rate medium">76%</span>
                      </div>
                      <div className="table-row">
                        <span>Social Gatherings</span>
                        <span>12</span>
                        <span>28</span>
                        <span className="success-rate high">82%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insights and Recommendations */}
                <div className="analytics-insights">
                  <div className="insights-container">
                    <h4>📋 Key Insights & Recommendations</h4>
                    <div className="insights-grid">
                      <div className="insight-card positive">
                        <div className="insight-icon">✅</div>
                        <div className="insight-content">
                          <h5>Strong Event Attendance</h5>
                          <p>Your chapter has 15% higher event attendance than the national average.</p>
                          <span className="insight-action">Continue current engagement strategies</span>
                        </div>
                      </div>

                      <div className="insight-card warning">
                        <div className="insight-icon">⚠️</div>
                        <div className="insight-content">
                          <h5>Survey Response Rate</h5>
                          <p>Member survey participation is below optimal levels.</p>
                          <span className="insight-action">Consider incentivizing feedback collection</span>
                        </div>
                      </div>

                      <div className="insight-card info">
                        <div className="insight-icon">💡</div>
                        <div className="insight-content">
                          <h5>Growth Opportunity</h5>
                          <p>Recent graduate segment is growing rapidly.</p>
                          <span className="insight-action">Develop targeted programming for new alumni</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div className="analytics-actions">
                  <div className="actions-container">
                    <h4>🎯 Recommended Actions</h4>
                    <div className="action-items">
                      <div className="action-item high-priority">
                        <div className="action-priority">High</div>
                        <div className="action-content">
                          <strong>Improve Survey Engagement</strong>
                          <p>Implement gamification or incentives to boost survey participation by 20%</p>
                          <span className="action-due">Due: Next 2 weeks</span>
                        </div>
                        <button className="btn btn-sm btn-primary">Assign Task</button>
                      </div>

                      <div className="action-item medium-priority">
                        <div className="action-priority">Medium</div>
                        <div className="action-content">
                          <strong>Expand Professional Development</strong>
                          <p>Add 2 more professional development events based on member interest</p>
                          <span className="action-due">Due: Next month</span>
                        </div>
                        <button className="btn btn-sm btn-secondary">Plan Event</button>
                      </div>

                      <div className="action-item low-priority">
                        <div className="action-priority">Low</div>
                        <div className="action-content">
                          <strong>Senior Alumni Outreach</strong>
                          <p>Create targeted outreach program to re-engage senior alumni members</p>
                          <span className="action-due">Due: Next quarter</span>
                        </div>
                        <button className="btn btn-sm btn-outline">Schedule</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterDetailsPage;
