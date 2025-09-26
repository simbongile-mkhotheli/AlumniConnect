import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventsService } from '../../services/eventsService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Event } from '../../types';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'rsvps' | 'promotion' | 'analytics'
  >('overview');

  useEffect(() => {
    if (id) {
      loadEventDetails(id);
    }
  }, [id]);

  const loadEventDetails = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading event details for ID:', eventId);
      const response = await EventsService.getEvent(eventId);

      if (response.success && response.data) {
        setEvent(response.data);
        console.log('✅ Event details loaded:', response.data);
      } else {
        throw new Error(response.message || 'Failed to load event details');
      }
    } catch (err) {
      console.error('❌ Error loading event details:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load event details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/admin/upcoming-events');
  };

  const handleEdit = () => {
    if (event) {
      navigate(`/admin/events/edit/${event.id}`);
    }
  };

  const handleAction = async (
    action: 'publish' | 'unpublish' | 'cancel' | 'delete'
  ) => {
    if (!event) return;

    try {
      setError(null);
      console.log(`🔄 ${action} event:`, event.id);

      let response;
      switch (action) {
        case 'publish':
          response = await EventsService.updateEvent(event.id, {
            ...event,
            status: 'published',
          });
          break;
        case 'unpublish':
          response = await EventsService.updateEvent(event.id, {
            ...event,
            status: 'draft',
          });
          break;
        case 'cancel':
          response = await EventsService.updateEvent(event.id, {
            ...event,
            status: 'cancelled',
          });
          break;
        case 'delete':
          if (
            confirm(
              'Are you sure you want to delete this event? This action cannot be undone.'
            )
          ) {
            response = await EventsService.deleteEvent(event.id);
            if (response.success) {
              navigate('/admin/upcoming-events');
              return;
            }
          } else {
            return;
          }
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      if (response.success) {
        console.log(`✅ Event ${action} successful`);
        // Reload event details to get updated data
        await loadEventDetails(event.id);
      } else {
        throw new Error(response.message || `Failed to ${action} event`);
      }
    } catch (err) {
      console.error(`Error ${action} event:`, err);
      setError(`Failed to ${action} event. Please try again.`);
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
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
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

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Invalid Time';
    }
  };

  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
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

  const getEventDuration = () => {
    if (!event?.startDate || !event?.endDate) return null;

    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      return `${diffMinutes} minutes`;
    } else if (diffHours < 24) {
      return `${diffHours} hours`;
    } else {
      const diffDays = Math.round(diffHours / 24);
      return `${diffDays} days`;
    }
  };

  if (loading) {
    return (
      <div className="chapter-details-overlay active">
        <div className="chapter-details-container">
          <div className="chapter-details-header">
            <div className="chapter-details-title-section">
              <h2 className="chapter-details-title">
                Loading Event Details...
              </h2>
            </div>
            <div className="chapter-details-actions">
              <button className="close-btn" onClick={handleClose}>
                &times;
              </button>
            </div>
          </div>
          <div className="chapter-details-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="chapter-details-overlay active">
        <div className="chapter-details-container">
          <div className="chapter-details-header">
            <div className="chapter-details-title-section">
              <h2 className="chapter-details-title">Event Details</h2>
            </div>
            <div className="chapter-details-actions">
              <button className="close-btn" onClick={handleClose}>
                &times;
              </button>
            </div>
          </div>
          <div className="chapter-details-body">
            <ErrorMessage
              error={error || 'Event not found'}
              title="Failed to load event details"
              showRetry
              onRetry={() => id && loadEventDetails(id)}
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
            <h2 className="chapter-details-title">{event.title}</h2>
            <div className="chapter-details-badges">
              <span
                className={`status-badge ${getStatusBadgeClass(event.status)}`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
              {event.isFeatured && (
                <span className="featured-badge">⭐ Featured</span>
              )}
              {event.sponsor && (
                <span className="sponsor-badge">
                  Sponsored by {getSponsorDisplayName(event.sponsor)}
                </span>
              )}
            </div>
          </div>
          <div className="chapter-details-actions">
            <button className="btn btn-primary" onClick={handleEdit}>
              ✏️ Edit Event
            </button>
            {event.status === 'draft' && (
              <button
                className="btn btn-success"
                onClick={() => handleAction('publish')}
              >
                📢 Publish
              </button>
            )}
            {event.status === 'published' && (
              <button
                className="btn btn-warning"
                onClick={() => handleAction('unpublish')}
              >
                📝 Unpublish
              </button>
            )}
            {event.status !== 'cancelled' && (
              <button
                className="btn btn-danger"
                onClick={() => handleAction('cancel')}
              >
                ❌ Cancel Event
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
              className={`tab-btn ${activeTab === 'rsvps' ? 'active' : ''}`}
              onClick={() => setActiveTab('rsvps')}
            >
              👥 RSVPs
            </button>
            <button
              className={`tab-btn ${activeTab === 'promotion' ? 'active' : ''}`}
              onClick={() => setActiveTab('promotion')}
            >
              📢 Promotion
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
                      <div className="metric-value">{event.rsvpCount || 0}</div>
                      <div className="metric-label">Total RSVPs</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">🎟️</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {event.attendanceCount || 0}
                      </div>
                      <div className="metric-label">Attendees</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {event.rsvpCount > 0
                          ? Math.round(
                              ((event.attendanceCount || 0) / event.rsvpCount) *
                                100
                            )
                          : 0}
                        %
                      </div>
                      <div className="metric-label">Attendance Rate</div>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">⏱️</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {getEventDuration() || 'TBD'}
                      </div>
                      <div className="metric-label">Duration</div>
                    </div>
                  </div>
                </div>

                {/* Event Information */}
                <div className="chapter-info-grid">
                  <div className="info-section">
                    <h3 className="info-section-title">📅 Event Details</h3>
                    <div className="info-content">
                      <div className="info-item">
                        <label>Start Date & Time:</label>
                        <span>{formatDateTime(event.startDate)}</span>
                      </div>
                      {event.endDate && (
                        <div className="info-item">
                          <label>End Date & Time:</label>
                          <span>{formatDateTime(event.endDate)}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <label>Location:</label>
                        <span>{event.location}</span>
                      </div>
                      {event.venue && (
                        <div className="info-item">
                          <label>Venue:</label>
                          <span>{event.venue}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <label>Organizer:</label>
                        <span>{event.organizer}</span>
                      </div>
                      <div className="info-item">
                        <label>Status:</label>
                        <span
                          className={`status-badge ${getStatusBadgeClass(event.status)}`}
                        >
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="info-section-title">📝 Description</h3>
                    <div className="info-content">
                      {event.excerpt && (
                        <div className="info-item">
                          <label>Excerpt:</label>
                          <span>{event.excerpt}</span>
                        </div>
                      )}
                      <div style={{ color: '#4a5568', lineHeight: '1.6' }}>
                        {event.description
                          .split('\n')
                          .map((paragraph, index) => (
                            <p
                              key={index}
                              style={{
                                marginBottom: paragraph.trim() ? '12px' : '6px',
                              }}
                            >
                              {paragraph.trim() || '\u00A0'}
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="info-section">
                      <h3 className="info-section-title">🏷️ Tags</h3>
                      <div className="info-content">
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >
                          {event.tags.map((tag, index) => (
                            <span key={index} className="event-tag">
                              {tag.charAt(0).toUpperCase() + tag.slice(1)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {(event.rsvpUrl || event.signupUrl) && (
                    <div className="info-section">
                      <h3 className="info-section-title">🔗 Links</h3>
                      <div className="info-content">
                        {event.rsvpUrl && (
                          <div className="info-item">
                            <label>RSVP Link:</label>
                            <a
                              href={event.rsvpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {event.rsvpUrl}
                            </a>
                          </div>
                        )}
                        {event.signupUrl && (
                          <div className="info-item">
                            <label>Signup URL:</label>
                            <a
                              href={event.signupUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {event.signupUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'rsvps' && (
              <div className="chapter-tab-content">
                <div className="info-section">
                  <h3 className="info-section-title">👥 RSVP Management</h3>
                  <div className="info-content">
                    <p>
                      RSVP management functionality will be implemented here.
                    </p>
                    <div className="metric-summary">
                      <div className="metric-item">
                        <strong>Total RSVPs:</strong> {event.rsvpCount || 0}
                      </div>
                      <div className="metric-item">
                        <strong>Confirmed Attendees:</strong>{' '}
                        {event.attendanceCount || 0}
                      </div>
                      <div className="metric-item">
                        <strong>Attendance Rate:</strong>{' '}
                        {event.rsvpCount > 0
                          ? Math.round(
                              ((event.attendanceCount || 0) / event.rsvpCount) *
                                100
                            )
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'promotion' && (
              <div className="chapter-tab-content">
                <div className="info-section">
                  <h3 className="info-section-title">📢 Event Promotion</h3>
                  <div className="info-content">
                    <p>
                      Event promotion tools and analytics will be implemented
                      here.
                    </p>
                    <div className="promotion-actions">
                      {event.signupUrl && (
                        <div className="action-item">
                          <strong>Signup URL:</strong>
                          <a
                            href={event.signupUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {event.signupUrl}
                          </a>
                        </div>
                      )}
                      {event.rsvpUrl && (
                        <div className="action-item">
                          <strong>RSVP Link:</strong>
                          <a
                            href={event.rsvpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {event.rsvpUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="chapter-tab-content">
                <div className="info-section">
                  <h3 className="info-section-title">📊 Event Analytics</h3>
                  <div className="info-content">
                    <p>
                      Detailed event analytics and reporting will be implemented
                      here.
                    </p>
                    <div className="analytics-summary">
                      <div className="analytics-metric">
                        <strong>Event Status:</strong> {event.status}
                      </div>
                      <div className="analytics-metric">
                        <strong>Featured Event:</strong>{' '}
                        {event.isFeatured ? 'Yes' : 'No'}
                      </div>
                      <div className="analytics-metric">
                        <strong>Sponsor:</strong>{' '}
                        {event.sponsor
                          ? getSponsorDisplayName(event.sponsor)
                          : 'None'}
                      </div>
                      <div className="analytics-metric">
                        <strong>Duration:</strong> {getEventDuration() || 'TBD'}
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
