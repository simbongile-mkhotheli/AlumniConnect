import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QAService } from '@features/qa/services';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import type { QAItem } from '../../types';

export const QADetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [qaItem, setQAItem] = useState<QAItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'content' | 'answers' | 'analytics'
  >('overview');

  useEffect(() => {
    if (id) {
      loadQADetails(id);
    }
  }, [id]);

  const loadQADetails = async (qaId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading Q&A details for ID:', qaId);
      const response = await QAService.getQAItem(qaId);

      if (response.success && response.data) {
        setQAItem(response.data);
        console.log('✅ Q&A details loaded:', response.data);
      } else {
        throw new Error(response.message || 'Failed to load Q&A details');
      }
    } catch (err) {
      console.error('❌ Error loading Q&A details:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load Q&A details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/admin/qa');
  };

  const handleEdit = () => {
    if (qaItem) {
      navigate(`/admin/qa/edit/${qaItem.id}`);
    }
  };

  const handleAction = async (
    action:
      | 'publish'
      | 'archive'
      | 'flag'
      | 'unflag'
      | 'approve'
      | 'reject'
      | 'feature'
      | 'unfeature'
      | 'sticky'
      | 'unsticky'
      | 'lock'
      | 'unlock'
      | 'delete'
  ) => {
    if (!qaItem) return;

    const confirmMessage =
      action === 'delete'
        ? `Are you sure you want to delete "${qaItem.title}"? This action cannot be undone.`
        : `Are you sure you want to ${action} "${qaItem.title}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      let response;
      switch (action) {
        case 'publish':
          response = await QAService.publishQAItem(qaItem.id);
          break;
        case 'archive':
          response = await QAService.archiveQAItem(qaItem.id);
          break;
        case 'flag':
          response = await QAService.flagQAItem(qaItem.id);
          break;
        case 'unflag':
          response = await QAService.unflagQAItem(qaItem.id);
          break;
        case 'approve':
          response = await QAService.approveQAItem(qaItem.id);
          break;
        case 'reject':
          response = await QAService.rejectQAItem(qaItem.id);
          break;
        case 'feature':
          response = await QAService.featureQAItem(qaItem.id);
          break;
        case 'unfeature':
          response = await QAService.unfeatureQAItem(qaItem.id);
          break;
        case 'sticky':
          response = await QAService.stickyQAItem(qaItem.id);
          break;
        case 'unsticky':
          response = await QAService.unstickyQAItem(qaItem.id);
          break;
        case 'lock':
          response = await QAService.lockQAItem(qaItem.id);
          break;
        case 'unlock':
          response = await QAService.unlockQAItem(qaItem.id);
          break;
        case 'delete':
          response = await QAService.deleteQAItem(qaItem.id);
          break;
      }

      if (response.success) {
        if (action === 'delete') {
          navigate('/admin/qa');
        } else {
          // Reload Q&A details to show updated status
          loadQADetails(qaItem.id);
        }
      } else {
        setError(response.message || `Failed to ${action} Q&A item`);
      }
    } catch (err) {
      console.error(`Error ${action} Q&A item:`, err);
      setError(`Failed to ${action} Q&A item. Please try again.`);
    }
  };

  const handleAnswerAction = async (action: 'accept' | 'unaccept', answerId: string) => {
    if (!qaItem || qaItem.type !== 'question') return;

    const confirmMessage = action === 'accept' 
      ? `Mark this answer as the best answer for "${qaItem.title}"?`
      : `Remove this answer as the best answer for "${qaItem.title}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      let response;
      if (action === 'accept') {
        response = await QAService.acceptAnswer(qaItem.id, answerId);
      } else {
        response = await QAService.unacceptAnswer(qaItem.id, answerId);
      }

      if (response.success) {
        // Reload Q&A details to show updated status
        loadQADetails(qaItem.id);
      } else {
        setError(response.message || `Failed to ${action} answer`);
      }
    } catch (err) {
      console.error(`Error ${action} answer:`, err);
      setError(`Failed to ${action} answer. Please try again.`);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'status-published';
      case 'pending':
        return 'status-pending';
      case 'flagged':
        return 'status-flagged';
      case 'archived':
        return 'status-archived';
      default:
        return 'status-unknown';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'question':
        return 'type-question';
      case 'answer':
        return 'type-answer';
      case 'discussion':
        return 'type-discussion';
      default:
        return 'type-general';
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'technical':
        return 'category-technical';
      case 'career':
        return 'category-career';
      case 'academic':
        return 'category-academic';
      case 'general':
        return 'category-general';
      default:
        return 'category-general';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'question':
        return 'Question';
      case 'answer':
        return 'Answer';
      case 'discussion':
        return 'Discussion';
      default:
        return 'General';
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'technical':
        return 'Technical';
      case 'career':
        return 'Career';
      case 'academic':
        return 'Academic';
      case 'general':
        return 'General';
      default:
        return 'General';
    }
  };

  const getQAIcon = (type: string) => {
    switch (type) {
      case 'question':
        return '❓';
      case 'answer':
        return '💡';
      case 'discussion':
        return '💬';
      default:
        return '📝';
    }
  };

  const getDifficultyDisplayName = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      default:
        return 'Not specified';
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
    if (!qaItem || qaItem.viewCount === 0) return 0;
    const totalEngagements =
      qaItem.voteCount + qaItem.answerCount + (qaItem.commentCount || 0);
    return Math.round((totalEngagements / qaItem.viewCount) * 100);
  };

  const getQualityScore = () => {
    if (!qaItem) return 0;
    return qaItem.qualityScore || Math.round(Math.random() * 100);
  };

  if (loading) {
    return (
      <div className="qa-details-overlay active">
        <div className="qa-details-container">
          <div className="qa-details-header">
            <h2 className="qa-details-title">Loading Q&A Details...</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="qa-details-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !qaItem) {
    return (
      <div className="qa-details-overlay active">
        <div className="qa-details-container">
          <div className="qa-details-header">
            <h2 className="qa-details-title">Q&A Details</h2>
            <button className="close-btn" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="qa-details-body">
            <ErrorMessage
              error={error || 'Q&A item not found'}
              title="Failed to load Q&A details"
              showRetry
              onRetry={() => id && loadQADetails(id)}
              variant="card"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qa-details-overlay active">
      <div className="qa-details-container">
        <div className="qa-details-header">
          <div className="qa-details-title-section">
            <h2 className="qa-details-title">{qaItem.title}</h2>
            <div className="qa-details-badges">
              <span
                className={`status-badge ${getStatusBadgeClass(qaItem.status)}`}
              >
                {qaItem.status.charAt(0).toUpperCase() + qaItem.status.slice(1)}
              </span>
              <span className={`type-badge ${getTypeBadgeClass(qaItem.type)}`}>
                {getQAIcon(qaItem.type)} {getTypeDisplayName(qaItem.type)}
              </span>
              <span
                className={`category-badge ${getCategoryBadgeClass(qaItem.category)}`}
              >
                {getCategoryDisplayName(qaItem.category)}
              </span>
              {qaItem.isFeatured && (
                <span className="featured-badge">⭐ Featured</span>
              )}
              {qaItem.isSticky && (
                <span className="sticky-badge">📌 Sticky</span>
              )}
              {qaItem.hasAcceptedAnswer && (
                <span className="accepted-badge">✅ Solved</span>
              )}
            </div>
          </div>
          <div className="qa-details-actions">
            <button className="btn btn-primary" onClick={handleEdit}>
              ✏️ Edit Q&A
            </button>
            {qaItem.status === 'pending' && (
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
            {qaItem.status === 'published' && (
              <button
                className="btn btn-warning"
                onClick={() => handleAction('archive')}
              >
                📁 Archive
              </button>
            )}
            {qaItem.status === 'flagged' && (
              <button
                className="btn btn-info"
                onClick={() => handleAction('unflag')}
              >
                🚩 Remove Flag
              </button>
            )}
            {!qaItem.isFeatured && qaItem.status === 'published' && (
              <button
                className="btn btn-info"
                onClick={() => handleAction('feature')}
              >
                ⭐ Feature
              </button>
            )}
            {qaItem.isFeatured && (
              <button
                className="btn btn-secondary"
                onClick={() => handleAction('unfeature')}
              >
                ⭐ Unfeature
              </button>
            )}
            {!qaItem.isSticky && qaItem.status === 'published' && (
              <button
                className="btn btn-info"
                onClick={() => handleAction('sticky')}
              >
                📌 Make Sticky
              </button>
            )}
            {qaItem.isSticky && (
              <button
                className="btn btn-secondary"
                onClick={() => handleAction('unsticky')}
              >
                📌 Remove Sticky
              </button>
            )}
            {!qaItem.isLocked && (
              <button
                className="btn btn-warning"
                onClick={() => handleAction('lock')}
              >
                🔒 Lock
              </button>
            )}
            {qaItem.isLocked && (
              <button
                className="btn btn-info"
                onClick={() => handleAction('unlock')}
              >
                🔓 Unlock
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

        <div className="qa-details-body">
          {/* Tab Navigation */}
          <div className="qa-tabs">
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
              className={`tab-btn ${activeTab === 'answers' ? 'active' : ''}`}
              onClick={() => setActiveTab('answers')}
            >
              💬{' '}
              {qaItem.type === 'question'
                ? 'Answers'
                : qaItem.type === 'answer'
                  ? 'Discussion'
                  : 'Replies'}
            </button>
            <button
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="qa-tab-content">
            {activeTab === 'overview' && (
              <div className="qa-overview">
                {/* Key Metrics */}
                <div className="qa-metrics">
                  <div className="metric-card">
                    <div className="metric-icon">👁️</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {qaItem.viewCount.toLocaleString()}
                      </div>
                      <div className="metric-label">Total Views</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">👍</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {qaItem.voteCount.toLocaleString()}
                      </div>
                      <div className="metric-label">Votes</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">💬</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {qaItem.answerCount.toLocaleString()}
                      </div>
                      <div className="metric-label">
                        {qaItem.type === 'question'
                          ? 'Answers'
                          : qaItem.type === 'answer'
                            ? 'Comments'
                            : 'Replies'}
                      </div>
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

                {/* Q&A Information */}
                <div className="qa-info-grid">
                  <div className="info-section">
                    <h3 className="info-section-title">
                      👤 Author Information
                    </h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{qaItem.authorName}</span>
                      </div>
                      <div className="info-item">
                        <label>Author ID:</label>
                        <span>{qaItem.authorId}</span>
                      </div>
                      {qaItem.authorRole && (
                        <div className="info-item">
                          <label>Role:</label>
                          <span className="role-badge">
                            {qaItem.authorRole.charAt(0).toUpperCase() +
                              qaItem.authorRole.slice(1)}
                          </span>
                        </div>
                      )}
                      {qaItem.authorEmail && (
                        <div className="info-item">
                          <label>Email:</label>
                          <span>
                            <a
                              href={`mailto:${qaItem.authorEmail}`}
                              className="email-link"
                            >
                              {qaItem.authorEmail}
                            </a>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">📝 Content Details</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Type:</label>
                        <span>{getTypeDisplayName(qaItem.type)}</span>
                      </div>
                      <div className="info-item">
                        <label>Category:</label>
                        <span>{getCategoryDisplayName(qaItem.category)}</span>
                      </div>
                      <div className="info-item">
                        <label>Status:</label>
                        <span className={getStatusBadgeClass(qaItem.status)}>
                          {qaItem.status.charAt(0).toUpperCase() +
                            qaItem.status.slice(1)}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Difficulty:</label>
                        <span>
                          {getDifficultyDisplayName(qaItem.difficulty)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">
                      🎯 Quality & Features
                    </h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Quality Score:</label>
                        <span className="quality-score">
                          {getQualityScore()}%
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Featured:</label>
                        <span
                          className={
                            qaItem.isFeatured ? 'text-success' : 'text-muted'
                          }
                        >
                          {qaItem.isFeatured ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Sticky:</label>
                        <span
                          className={
                            qaItem.isSticky ? 'text-success' : 'text-muted'
                          }
                        >
                          {qaItem.isSticky ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Locked:</label>
                        <span
                          className={
                            qaItem.isLocked ? 'text-warning' : 'text-muted'
                          }
                        >
                          {qaItem.isLocked ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">📅 Timeline</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Created:</label>
                        <span>{formatDateTime(qaItem.createdAt)}</span>
                      </div>
                      {qaItem.updatedAt && (
                        <div className="info-item">
                          <label>Last Updated:</label>
                          <span>{formatDateTime(qaItem.updatedAt)}</span>
                        </div>
                      )}
                      {qaItem.publishedAt && (
                        <div className="info-item">
                          <label>Published:</label>
                          <span>{formatDateTime(qaItem.publishedAt)}</span>
                        </div>
                      )}
                      {qaItem.lastActivityAt && (
                        <div className="info-item">
                          <label>Last Activity:</label>
                          <span>{formatDateTime(qaItem.lastActivityAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {qaItem.tags && qaItem.tags.length > 0 && (
                  <div className="qa-tags-section">
                    <h3 className="info-section-title">🏷️ Tags</h3>
                    <div className="qa-tags-display">
                      {qaItem.tags.map((tag, index) => (
                        <span key={index} className="qa-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Moderation Info */}
                {(qaItem.flagReason || qaItem.moderatorNotes) && (
                  <div className="qa-moderation-section">
                    <h3 className="info-section-title">
                      🛡️ Moderation Information
                    </h3>
                    <div className="moderation-content">
                      {qaItem.flagReason && (
                        <div className="moderation-item">
                          <label>Flag Reason:</label>
                          <span className="flag-reason">
                            {qaItem.flagReason}
                          </span>
                        </div>
                      )}
                      {qaItem.moderatorNotes && (
                        <div className="moderation-item">
                          <label>Moderator Notes:</label>
                          <span className="moderator-notes">
                            {qaItem.moderatorNotes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div className="qa-content">
                <div className="content-section">
                  <h3 className="info-section-title">📄 Full Content</h3>
                  <div className="content-display">
                    <div className="content-text">
                      <p>{qaItem.content}</p>
                    </div>
                  </div>
                </div>

                {qaItem.excerpt && (
                  <div className="content-section">
                    <h3 className="info-section-title">📝 Excerpt</h3>
                    <div className="content-display">
                      <p>{qaItem.excerpt}</p>
                    </div>
                  </div>
                )}

                {qaItem.relatedTopics && qaItem.relatedTopics.length > 0 && (
                  <div className="content-section">
                    <h3 className="info-section-title">🔗 Related Topics</h3>
                    <div className="related-topics">
                      {qaItem.relatedTopics.map((topic, index) => (
                        <span key={index} className="related-topic">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'answers' && (
              <div className="qa-answers">
                <div className="answers-placeholder">
                  <div className="placeholder-icon">💬</div>
                  <h3>
                    {qaItem.type === 'question'
                      ? 'Answers Management'
                      : qaItem.type === 'answer'
                        ? 'Discussion Management'
                        : 'Replies Management'}
                  </h3>
                  <p>
                    {qaItem.type === 'question'
                      ? 'Answer management and moderation will be implemented here.'
                      : qaItem.type === 'answer'
                        ? 'Discussion thread management will be implemented here.'
                        : 'Reply management will be implemented here.'}
                  </p>
                  <p>
                    This will include viewing, moderating, and managing all
                    responses to this {qaItem.type}.
                  </p>
                  <div className="answers-stats">
                    <div className="stat-item">
                      <strong>
                        {qaItem.type === 'question'
                          ? 'Answers'
                          : qaItem.type === 'answer'
                            ? 'Comments'
                            : 'Replies'}
                        :
                      </strong>{' '}
                      {qaItem.answerCount}
                    </div>
                    <div className="stat-item">
                      <strong>Accepted Answer:</strong>{' '}
                      {qaItem.hasAcceptedAnswer ? 'Yes' : 'No'}
                    </div>
                    {qaItem.bestAnswerId && (
                      <div className="stat-item">
                        <strong>Best Answer ID:</strong> {qaItem.bestAnswerId}
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab('answers')}
                  >
                    � Manage Answers
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="qa-analytics">
                <div className="analytics-placeholder">
                  <div className="placeholder-icon">📊</div>
                  <h3>Q&A Analytics</h3>
                  <p>
                    Detailed analytics and reporting will be implemented here.
                  </p>
                  <p>
                    This will include engagement trends, view patterns, vote
                    analysis, and community interaction metrics.
                  </p>
                  <div className="analytics-preview">
                    <div className="metric-row">
                      <span>Total Views:</span>
                      <span>{qaItem.viewCount.toLocaleString()}</span>
                    </div>
                    <div className="metric-row">
                      <span>Engagement Rate:</span>
                      <span>{getEngagementRate()}%</span>
                    </div>
                    <div className="metric-row">
                      <span>Quality Score:</span>
                      <span>{getQualityScore()}%</span>
                    </div>
                    <div className="metric-row">
                      <span>Total Interactions:</span>
                      <span>
                        {(
                          qaItem.voteCount +
                          qaItem.answerCount +
                          (qaItem.commentCount || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span>Engagement Score:</span>
                      <span>
                        {qaItem.engagementScore ||
                          Math.round(Math.random() * 100)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => console.log('Navigate to Q&A analytics')}
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

export default QADetailsPage;
