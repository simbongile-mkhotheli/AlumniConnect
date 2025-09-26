import React from 'react';
import type { Event } from '@features/events/types';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';

interface StandardEventDetailsModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onRSVP: (eventId: string) => void;
  userRsvpStatus: 'none' | 'registered' | 'pending_sync';
  rsvpLoading: boolean;
}

export function StandardEventDetailsModal({
  event,
  isOpen,
  onClose,
  onRSVP,
  userRsvpStatus,
  rsvpLoading,
}: StandardEventDetailsModalProps) {
  if (!isOpen) return null;

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateTime = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const startTime = formatTime(startDate);

    if (endDate) {
      const end = new Date(endDate);
      const endTime = formatTime(endDate);

      // Check if same day
      if (start.toDateString() === end.toDateString()) {
        return `${formatDate(startDate)} • ${startTime} - ${endTime}`;
      } else {
        return `${formatDate(startDate)} ${startTime} - ${formatDate(endDate)} ${endTime}`;
      }
    }

    return `${formatDate(startDate)} • ${startTime}`;
  };

  // Calculate event duration
  const getEventDuration = () => {
    if (!event.endDate) return null;

    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      return `${diffMinutes} minutes`;
    } else if (diffHours === 1) {
      return '1 hour';
    } else if (diffHours < 24) {
      return `${diffHours} hours`;
    } else {
      const diffDays = Math.round(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'status-badge success';
      case 'draft':
        return 'status-badge warning';
      case 'scheduled':
        return 'status-badge info';
      case 'cancelled':
        return 'status-badge error';
      default:
        return 'status-badge';
    }
  };

  // Get sponsor display name
  const getSponsorDisplayName = (sponsor?: string) => {
    const sponsorMap: Record<string, string> = {
      telkom: 'Telkom',
      comptia: 'CompTIA',
      github: 'GitHub',
      iweb: 'iWeb',
      microsoft: 'Microsoft',
    };

    if (!sponsor) return 'Community Sponsored';
    return sponsorMap[sponsor.toLowerCase()] || sponsor;
  };

  // Get RSVP button props
  const getRsvpButtonProps = () => {
    if (rsvpLoading) {
      return {
        text: 'Loading...',
        className: 'btn-primary',
        disabled: true,
      };
    }

    switch (userRsvpStatus) {
      case 'registered':
        return {
          text: 'Cancel RSVP',
          className: 'event-action-btn danger',
          disabled: false,
        };
      case 'pending_sync':
        return {
          text: 'Pending Sync',
          className: 'event-action-btn secondary',
          disabled: false,
        };
      default:
        return {
          text: 'RSVP Now',
          className: 'event-action-btn primary',
          disabled: false,
        };
    }
  };

  const rsvpProps = getRsvpButtonProps();
  const duration = getEventDuration();

  return (
    <div className="upcoming-events-overlay active">
      <div className="upcoming-events-manager">
        {/* Header - matching admin modal structure */}
        <div className="upcoming-events-header">
          <h2 className="upcoming-events-title">{event.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="event-meta">
              <span className={getStatusBadgeClass(event.status)}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
              {event.isFeatured && (
                <span className="status-badge featured">⭐ Featured</span>
              )}
            </div>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {/* Body - matching admin modal structure */}
        <div className="upcoming-events-body">
          {/* Event Cover Image */}
          {event.coverUrl && (
            <div
              className="event-cover"
              style={{
                width: '100%',
                height: '200px',
                overflow: 'hidden',
                background: '#f7fafc',
                borderRadius: '12px',
                marginBottom: '24px',
              }}
            >
              <img
                src={event.coverUrl}
                alt={event.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {/* Key Information Grid */}
          <div className="events-summary">
            <div className="summary-card">
              <div className="summary-value">📅</div>
              <div className="summary-label">Date & Time</div>
              <div
                style={{ fontSize: '14px', color: '#4a5568', marginTop: '8px' }}
              >
                {formatDateTime(event.startDate, event.endDate)}
                {duration && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#718096',
                      marginTop: '4px',
                    }}
                  >
                    Duration: {duration}
                  </div>
                )}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-value">📍</div>
              <div className="summary-label">Location</div>
              <div
                style={{ fontSize: '14px', color: '#4a5568', marginTop: '8px' }}
              >
                {event.venue || event.location}
                {event.address && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#718096',
                      marginTop: '4px',
                    }}
                  >
                    {event.address}
                  </div>
                )}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-value">👤</div>
              <div className="summary-label">Organizer</div>
              <div
                style={{ fontSize: '14px', color: '#4a5568', marginTop: '8px' }}
              >
                {event.organizer}
              </div>
            </div>

            {event.sponsor && (
              <div className="summary-card">
                <div className="summary-value">🏢</div>
                <div className="summary-label">Sponsor</div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#4a5568',
                    marginTop: '8px',
                  }}
                >
                  {getSponsorDisplayName(event.sponsor)}
                </div>
              </div>
            )}

            <div className="summary-card">
              <div className="summary-value">{event.rsvpCount}</div>
              <div className="summary-label">People Going</div>
              {event.attendanceCount > 0 && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#718096',
                    marginTop: '4px',
                  }}
                >
                  {event.attendanceCount} attended
                </div>
              )}
            </div>
          </div>

          {/* RSVP Section */}
          <div
            className="event-rsvp-section"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '20px',
                  fontWeight: '600',
                }}
              >
                Join This Event
              </h3>
              <p style={{ margin: '0', opacity: '0.9', fontSize: '14px' }}>
                RSVP to secure your spot and receive event updates
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <button
                className={rsvpProps.className}
                onClick={() => onRSVP(event.id)}
                disabled={rsvpProps.disabled}
                style={{
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  minWidth: '160px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: rsvpProps.disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  background: rsvpProps.className.includes('primary')
                    ? 'rgba(255, 255, 255, 0.2)'
                    : rsvpProps.className.includes('danger')
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                }}
              >
                {rsvpLoading && <LoadingSpinner size="small" />}
                {rsvpProps.text}
              </button>
            </div>

            {userRsvpStatus === 'registered' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  opacity: '0.9',
                }}
              >
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                  }}
                >
                  ✓
                </span>
                You're registered for this event
              </div>
            )}

            {userRsvpStatus === 'pending_sync' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  opacity: '0.9',
                }}
              >
                <span
                  style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                  }}
                >
                  ⏳
                </span>
                RSVP will sync when online
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '16px',
              }}
            >
              About This Event
            </h3>
            {event.excerpt && (
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#4a5568',
                  marginBottom: '16px',
                  padding: '16px',
                  background: '#f7fafc',
                  borderRadius: '8px',
                  borderLeft: '4px solid #667eea',
                }}
              >
                {event.excerpt}
              </div>
            )}
            <div
              style={{ fontSize: '14px', lineHeight: '1.6', color: '#4a5568' }}
            >
              {event.description.split('\n').map((paragraph, index) => (
                <p key={index} style={{ marginBottom: '12px' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h4
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '12px',
                }}
              >
                Tags
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#edf2f7',
                      color: '#4a5568',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External RSVP Link */}
          {event.rsvpUrl && (
            <div
              style={{
                background: '#fff5f5',
                border: '1px solid #fed7d7',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '32px',
              }}
            >
              <h4
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#c53030',
                  marginBottom: '8px',
                }}
              >
                External Registration
              </h4>
              <p
                style={{
                  fontSize: '14px',
                  color: '#4a5568',
                  marginBottom: '12px',
                }}
              >
                This event uses an external registration system.
              </p>
              <a
                href={event.rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="event-action-btn secondary"
                style={{ textDecoration: 'none' }}
              >
                Register Externally
              </a>
            </div>
          )}

          {/* Footer Actions */}
          <div
            style={{
              padding: '16px 0',
              borderTop: '1px solid #f1f3f4',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                color: '#718096',
              }}
            >
              <span>Share this event:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="event-action-btn secondary"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: event.title,
                        text: event.excerpt || event.description,
                        url: window.location.href,
                      });
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(window.location.href);
                      alert('Event link copied to clipboard!');
                    }
                  }}
                >
                  📤 Share
                </button>
                <button
                  className="event-action-btn secondary"
                  onClick={() => {
                    // Add to calendar functionality
                    const startDate = new Date(event.startDate);
                    const endDate = event.endDate
                      ? new Date(event.endDate)
                      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

                    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.address || event.location)}`;

                    window.open(calendarUrl, '_blank');
                  }}
                >
                  📅 Add to Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
