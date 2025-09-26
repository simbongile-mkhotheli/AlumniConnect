import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MentorshipService } from '../../services/mentorshipService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Mentorship } from '../../types';

export const MentorshipDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sessions' | 'progress' | 'analytics'
  >('overview');

  useEffect(() => {
    if (id) {
      loadMentorshipDetails(id);
    }
  }, [id]);

  const loadMentorshipDetails = async (mentorshipId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading mentorship details for ID:', mentorshipId);
      const response = await MentorshipService.getMentorship(mentorshipId);

      if (response.success && response.data) {
        setMentorship(response.data);
        console.log('✅ Mentorship details loaded:', response.data);
      } else {
        throw new Error(
          response.message || 'Failed to load mentorship details'
        );
      }
    } catch (err) {
      console.error('❌ Error loading mentorship details:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load mentorship details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/admin/mentorship');
  };

  const handleEdit = () => {
    if (mentorship) {
      navigate(`/admin/mentorship/edit/${mentorship.id}`);
    }
  };

  const handleAction = async (
    action:
      | 'approve'
      | 'reject'
      | 'complete'
      | 'pause'
      | 'resume'
      | 'cancel'
      | 'delete'
  ) => {
    if (!mentorship) return;

    const confirmMessage =
      action === 'delete'
        ? `Are you sure you want to delete "${mentorship.title}"? This action cannot be undone.`
        : `Are you sure you want to ${action} "${mentorship.title}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      let response;
      switch (action) {
        case 'approve':
          response = await MentorshipService.approveMentorship(mentorship.id);
          break;
        case 'reject':
          response = await MentorshipService.rejectMentorship(mentorship.id);
          break;
        case 'complete':
          response = await MentorshipService.completeMentorship(mentorship.id);
          break;
        case 'pause':
          response = await MentorshipService.pauseMentorship(mentorship.id);
          break;
        case 'resume':
          response = await MentorshipService.resumeMentorship(mentorship.id);
          break;
        case 'cancel':
          response = await MentorshipService.cancelMentorship(mentorship.id);
          break;
        case 'delete':
          response = await MentorshipService.deleteMentorship(mentorship.id);
          break;
      }

      if (response.success) {
        if (action === 'delete') {
          navigate('/admin/mentorship');
        } else {
          // Reload mentorship details to show updated status
          loadMentorshipDetails(mentorship.id);
        }
      } else {
        setError(response.message || `Failed to ${action} mentorship`);
      }
    } catch (err) {
      console.error(`Error ${action} mentorship:`, err);
      setError(`Failed to ${action} mentorship. Please try again.`);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'paused':
        return 'status-paused';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'technical':
        return 'type-technical';
      case 'career':
        return 'type-career';
      case 'leadership':
        return 'type-leadership';
      case 'entrepreneurship':
        return 'type-entrepreneurship';
      case 'general':
        return 'type-general';
      default:
        return 'type-general';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'technical':
        return 'Technical';
      case 'career':
        return 'Career';
      case 'leadership':
        return 'Leadership';
      case 'entrepreneurship':
        return 'Entrepreneurship';
      case 'general':
        return 'General';
      default:
        return 'General';
    }
  };

  const getMentorshipIcon = (type: string) => {
    switch (type) {
      case 'technical':
        return '💻';
      case 'career':
        return '👔';
      case 'leadership':
        return '👑';
      case 'entrepreneurship':
        return '🚀';
      case 'general':
        return '💬';
      default:
        return '📚';
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

  const getProgressPercentage = () => {
    if (!mentorship || mentorship.sessionCount === 0) return 0;
    return Math.round(
      ((mentorship.completedSessions ?? 0) / mentorship.sessionCount) * 100
    );
  };

  const getDurationInWeeks = () => {
    if (!mentorship || !mentorship.startDate) return 0;
    const start = new Date(mentorship.startDate);
    const end = mentorship.endDate ? new Date(mentorship.endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  };

  if (loading) {
    return (
      <div className="mentorship-details-overlay active">
        <div className="mentorship-details-container">
          <div className="mentorship-details-header">
            <h2 className="mentorship-details-title">
              Loading Mentorship Details...
            </h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="mentorship-details-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !mentorship) {
    return (
      <div className="mentorship-details-overlay active">
        <div className="mentorship-details-container">
          <div className="mentorship-details-header">
            <h2 className="mentorship-details-title">Mentorship Details</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="mentorship-details-body">
            <ErrorMessage
              error={error || 'Mentorship not found'}
              title="Failed to load mentorship details"
              showRetry
              onRetry={() => id && loadMentorshipDetails(id)}
              variant="card"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mentorship-details-overlay active">
      <div className="mentorship-details-container">
        <div className="mentorship-details-header">
          <div className="mentorship-details-title-section">
            <h2 className="mentorship-details-title">{mentorship.title}</h2>
            <div className="mentorship-details-badges">
              <span
                className={`status-badge ${getStatusBadgeClass(mentorship.status)}`}
              >
                {mentorship.status.charAt(0).toUpperCase() +
                  mentorship.status.slice(1)}
              </span>
              <span
                className={`type-badge ${getTypeBadgeClass(mentorship.type)}`}
              >
                {getMentorshipIcon(mentorship.type)}{' '}
                {getTypeDisplayName(mentorship.type)}
              </span>
              {mentorship.progress && mentorship.progress >= 75 && (
                <span className="progress-badge">🎯 High Progress</span>
              )}
            </div>
          </div>
          <div className="mentorship-details-actions">
            <button className="btn btn-primary" onClick={handleEdit}>
              ✏️ Edit Mentorship
            </button>
            {mentorship.status === 'pending' && (
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
            {mentorship.status === 'active' && (
              <>
                <button
                  className="btn btn-warning"
                  onClick={() => handleAction('pause')}
                >
                  ⏸️ Pause
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleAction('complete')}
                >
                  ✅ Complete
                </button>
              </>
            )}
            {mentorship.status === 'paused' && (
              <button
                className="btn btn-info"
                onClick={() => handleAction('resume')}
              >
                ▶️ Resume
              </button>
            )}
            {mentorship.status !== 'completed' && (
              <button
                className="btn btn-warning"
                onClick={() => handleAction('cancel')}
              >
                🚫 Cancel
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

        <div className="mentorship-details-body">
          {/* Tab Navigation */}
          <div className="mentorship-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📋 Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              📅 Sessions
            </button>
            <button
              className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              📈 Progress
            </button>
            <button
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="mentorship-tab-content">
            {activeTab === 'overview' && (
              <div className="mentorship-overview">
                {/* Key Metrics */}
                <div className="mentorship-metrics">
                  <div className="metric-card">
                    <div className="metric-icon">📅</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {mentorship.sessionCount}
                      </div>
                      <div className="metric-label">Total Sessions</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">✅</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {mentorship.completedSessions ?? 0}
                      </div>
                      <div className="metric-label">Completed</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {getProgressPercentage()}%
                      </div>
                      <div className="metric-label">Progress</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">⏱️</div>
                    <div className="metric-content">
                      <div className="metric-value">{getDurationInWeeks()}</div>
                      <div className="metric-label">Weeks Duration</div>
                    </div>
                  </div>
                </div>

                {/* Mentorship Information */}
                <div className="mentorship-info-grid">
                  <div className="info-section">
                    <h3 className="info-section-title">
                      👨‍🏫 Mentor Information
                    </h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{mentorship.mentorName}</span>
                      </div>
                      <div className="info-item">
                        <label>ID:</label>
                        <span>{mentorship.mentorId}</span>
                      </div>
                      {mentorship.mentorEmail && (
                        <div className="info-item">
                          <label>Email:</label>
                          <span>
                            <a
                              href={`mailto:${mentorship.mentorEmail}`}
                              className="email-link"
                            >
                              {mentorship.mentorEmail}
                            </a>
                          </span>
                        </div>
                      )}
                      {mentorship.mentorRating && (
                        <div className="info-item">
                          <label>Rating:</label>
                          <span>⭐ {mentorship.mentorRating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">
                      👨‍🎓 Mentee Information
                    </h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{mentorship.menteeName}</span>
                      </div>
                      <div className="info-item">
                        <label>ID:</label>
                        <span>{mentorship.menteeId}</span>
                      </div>
                      {mentorship.menteeEmail && (
                        <div className="info-item">
                          <label>Email:</label>
                          <span>
                            <a
                              href={`mailto:${mentorship.menteeEmail}`}
                              className="email-link"
                            >
                              {mentorship.menteeEmail}
                            </a>
                          </span>
                        </div>
                      )}
                      {mentorship.menteeRating && (
                        <div className="info-item">
                          <label>Rating:</label>
                          <span>⭐ {mentorship.menteeRating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">📝 Program Details</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Type:</label>
                        <span>{getTypeDisplayName(mentorship.type)}</span>
                      </div>
                      <div className="info-item">
                        <label>Category:</label>
                        <span>{mentorship.category}</span>
                      </div>
                      <div className="info-item">
                        <label>Status:</label>
                        <span
                          className={getStatusBadgeClass(mentorship.status)}
                        >
                          {mentorship.status.charAt(0).toUpperCase() +
                            mentorship.status.slice(1)}
                        </span>
                      </div>
                      {mentorship.meetingFrequency && (
                        <div className="info-item">
                          <label>Frequency:</label>
                          <span>
                            {mentorship.meetingFrequency
                              .charAt(0)
                              .toUpperCase() +
                              mentorship.meetingFrequency.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">📅 Timeline</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Start Date:</label>
                        <span>{formatDate(mentorship.startDate)}</span>
                      </div>
                      {mentorship.endDate && (
                        <div className="info-item">
                          <label>End Date:</label>
                          <span>{formatDate(mentorship.endDate)}</span>
                        </div>
                      )}
                      {mentorship.nextSessionDate && (
                        <div className="info-item">
                          <label>Next Session:</label>
                          <span>
                            {formatDateTime(mentorship.nextSessionDate)}
                          </span>
                        </div>
                      )}
                      {mentorship.lastSessionDate && (
                        <div className="info-item">
                          <label>Last Session:</label>
                          <span>
                            {formatDateTime(mentorship.lastSessionDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {mentorship.description && (
                  <div className="mentorship-description">
                    <h3 className="info-section-title">📝 Description</h3>
                    <p className="description-text">{mentorship.description}</p>
                  </div>
                )}

                {/* Objectives */}
                {mentorship.objectives && mentorship.objectives.length > 0 && (
                  <div className="mentorship-objectives">
                    <h3 className="info-section-title">🎯 Objectives</h3>
                    <ul className="objectives-list">
                      {mentorship.objectives.map((objective, index) => (
                        <li key={index} className="objective-item">
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {mentorship.tags && mentorship.tags.length > 0 && (
                  <div className="mentorship-tags-section">
                    <h3 className="info-section-title">🏷️ Tags</h3>
                    <div className="mentorship-tags-display">
                      {mentorship.tags.map((tag, index) => (
                        <span key={index} className="mentorship-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="mentorship-sessions">
                <div className="sessions-placeholder">
                  <div className="placeholder-icon">📅</div>
                  <h3>Session Management</h3>
                  <p>
                    Session scheduling and management will be implemented here.
                  </p>
                  <p>
                    This will include session history, upcoming sessions,
                    attendance tracking, and session notes.
                  </p>
                  <div className="sessions-stats">
                    <div className="stat-item">
                      <strong>Total Sessions:</strong> {mentorship.sessionCount}
                    </div>
                    <div className="stat-item">
                      <strong>Completed:</strong> {mentorship.completedSessions ?? 0}
                    </div>
                    <div className="stat-item">
                      <strong>Remaining:</strong>{' '}
                      {mentorship.sessionCount - (mentorship.completedSessions ?? 0)}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      console.log('Navigate to session management')
                    }
                  >
                    🚀 Coming Soon
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="mentorship-progress">
                <div className="progress-placeholder">
                  <div className="placeholder-icon">📈</div>
                  <h3>Progress Tracking</h3>
                  <p>
                    Detailed progress tracking and milestone management will be
                    implemented here.
                  </p>
                  <p>
                    This will include goal completion, skill development
                    tracking, and progress visualization.
                  </p>
                  <div className="progress-stats">
                    <div className="stat-item">
                      <strong>Overall Progress:</strong>{' '}
                      {mentorship.progress || 0}%
                    </div>
                    <div className="stat-item">
                      <strong>Session Completion:</strong>{' '}
                      {getProgressPercentage()}%
                    </div>
                    {mentorship.overallRating && (
                      <div className="stat-item">
                        <strong>Overall Rating:</strong> ⭐{' '}
                        {mentorship.overallRating}/5
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => console.log('Navigate to progress tracking')}
                  >
                    🚀 Coming Soon
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="mentorship-analytics">
                <div className="analytics-placeholder">
                  <div className="placeholder-icon">📊</div>
                  <h3>Mentorship Analytics</h3>
                  <p>
                    Detailed analytics and reporting will be implemented here.
                  </p>
                  <p>
                    This will include engagement metrics, success rates,
                    feedback analysis, and performance insights.
                  </p>
                  <div className="analytics-preview">
                    <div className="metric-row">
                      <span>Total Sessions:</span>
                      <span>{mentorship.sessionCount}</span>
                    </div>
                    <div className="metric-row">
                      <span>Completion Rate:</span>
                      <span>{getProgressPercentage()}%</span>
                    </div>
                    <div className="metric-row">
                      <span>Duration (weeks):</span>
                      <span>{getDurationInWeeks()}</span>
                    </div>
                    {mentorship.engagementScore && (
                      <div className="metric-row">
                        <span>Engagement Score:</span>
                        <span>{mentorship.engagementScore}/100</span>
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      console.log('Navigate to mentorship analytics')
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

export default MentorshipDetailsPage;
