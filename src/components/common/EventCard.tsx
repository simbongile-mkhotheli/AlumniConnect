import React from 'react';
import type { Event } from '../../types';

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
  onRSVP: (eventId: string) => void;
  userRsvpStatus?: 'none' | 'registered' | 'pending_sync';
  rsvpLoading?: boolean;
  showFullDescription?: boolean;
  compact?: boolean;
}

export function EventCard({
  event,
  onViewDetails,
  onRSVP,
  userRsvpStatus = 'none',
  rsvpLoading = false,
  showFullDescription = false,
  compact = false,
}: EventCardProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time range for display
  const formatTime = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const startTime = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (endDate) {
      const end = new Date(endDate);
      const endTime = end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${startTime} - ${endTime}`;
    }

    return startTime;
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
        return 'status-badge info';
    }
  };

  // Get RSVP button properties
  const getRsvpButtonProps = () => {
    if (rsvpLoading) {
      return {
        text: 'Loading...',
        className: 'btn btn-primary',
        disabled: true,
      };
    }

    switch (userRsvpStatus) {
      case 'registered':
        return {
          text: 'Cancel RSVP',
          className: 'btn btn-outline btn-danger',
          disabled: false,
        };
      case 'pending_sync':
        return {
          text: 'Pending Sync',
          className: 'btn btn-warning',
          disabled: false,
        };
      default:
        return { text: 'RSVP', className: 'btn btn-primary', disabled: false };
    }
  };

  // Handle external signup
  const handleExternalSignup = () => {
    if (event.signupUrl) {
      window.open(event.signupUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const rsvpProps = getRsvpButtonProps();

  if (compact) {
    return (
      <div className="event-card compact">
        <div className="event-card-header">
          <div className="event-title-with-hashtag">
            <div className="event-title">{event.title}</div>
            {event.hashtag && (
              <div className="event-hashtag">{event.hashtag}</div>
            )}
          </div>
          <div className="event-badges">
            <div className={getStatusBadgeClass(event.status)}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </div>
            {event.isFeatured && (
              <div className="status-badge featured">⭐ Featured</div>
            )}
          </div>
        </div>

        <div className="event-card-content">
          <div className="event-meta">
            <div className="event-date-time">
              📅 {formatDate(event.startDate)} at{' '}
              {formatTime(event.startDate, event.endDate)}
            </div>
            <div className="event-location-venue">
              📍 <strong>{event.location}</strong>
              {event.venue && event.venue !== event.location && (
                <span className="venue-detail"> • {event.venue}</span>
              )}
            </div>
            {event.sponsor && (
              <div className="event-sponsor-section">
                {event.sponsorLogo ? (
                  <div className="sponsor-with-logo">
                    <img
                      src={event.sponsorLogo}
                      alt={`${event.sponsor} logo`}
                      className="sponsor-logo"
                    />
                    <span>Sponsored by {event.sponsor}</span>
                  </div>
                ) : (
                  <div className="sponsor-text">
                    🏢 Sponsored by {event.sponsor}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="event-excerpt">
            {event.excerpt || event.description.substring(0, 120) + '...'}
          </div>
        </div>

        <div className="event-card-footer">
          <div className="event-stats">
            <span className="rsvp-count">{event.rsvpCount} going</span>
            {userRsvpStatus === 'registered' && (
              <span className="user-status registered">✓ You're going</span>
            )}
            {userRsvpStatus === 'pending_sync' && (
              <span className="user-status pending">⏳ Sync pending</span>
            )}
          </div>

          <div className="event-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onViewDetails(event)}
            >
              View Details
            </button>
            {event.signupUrl ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleExternalSignup}
              >
                Sign Up
              </button>
            ) : (
              <button
                className={`${rsvpProps.className} btn-sm`}
                onClick={() => onRSVP(event.id)}
                disabled={rsvpProps.disabled}
              >
                {rsvpProps.text}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-card">
      {event.coverUrl && (
        <div className="event-card-image">
          <img src={event.coverUrl} alt={event.title} />
          {event.isFeatured && (
            <div className="featured-badge">⭐ Featured</div>
          )}
          {event.hashtag && (
            <div className="hashtag-overlay">{event.hashtag}</div>
          )}
        </div>
      )}

      <div className="event-card-header">
        <div className="event-title-section">
          <div className="event-title-with-hashtag">
            <h3 className="event-title">{event.title}</h3>
            {event.hashtag && !event.coverUrl && (
              <div className="event-hashtag">{event.hashtag}</div>
            )}
          </div>
          <div className="event-badges">
            <div className={getStatusBadgeClass(event.status)}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </div>
            {event.isFeatured && !event.coverUrl && (
              <div className="status-badge featured">⭐ Featured</div>
            )}
          </div>
        </div>
      </div>

      <div className="event-card-content">
        <div className="event-meta">
          <div className="event-date-time">
            <strong>📅 {formatDate(event.startDate)}</strong>
            <span className="event-time">
              {formatTime(event.startDate, event.endDate)}
            </span>
          </div>

          <div className="event-location-venue">
            <strong>📍 Location:</strong> {event.location}
            {event.venue && event.venue !== event.location && (
              <div className="venue-detail">
                <strong>🏢 Venue:</strong> {event.venue}
              </div>
            )}
          </div>

          {event.organizer && (
            <div className="event-organizer">
              <strong>👤 Organizer:</strong> {event.organizer}
            </div>
          )}

          {event.sponsor && (
            <div className="event-sponsor-section">
              <strong>🏢 Sponsor:</strong>
              {event.sponsorLogo ? (
                <div className="sponsor-with-logo">
                  <img
                    src={event.sponsorLogo}
                    alt={`${event.sponsor} logo`}
                    className="sponsor-logo"
                  />
                  <span>{event.sponsor}</span>
                </div>
              ) : (
                <span> {event.sponsor}</span>
              )}
            </div>
          )}
        </div>

        <div className="event-description">
          {showFullDescription ? (
            <div
              dangerouslySetInnerHTML={{
                __html: event.description.replace(/\n/g, '<br>'),
              }}
            />
          ) : (
            <p>
              {event.excerpt || event.description.substring(0, 200) + '...'}
            </p>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="event-tags">
            {event.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="event-card-footer">
        <div className="event-stats">
          <div className="rsvp-info">
            <span className="rsvp-count">
              <strong>{event.rsvpCount}</strong> going
            </span>
            {event.attendanceCount > 0 && (
              <span className="attendance-count">
                {event.attendanceCount} attended
              </span>
            )}
          </div>

          <div className="user-status-info">
            {userRsvpStatus === 'registered' && (
              <div className="user-status registered">✓ You're going</div>
            )}
            {userRsvpStatus === 'pending_sync' && (
              <div className="user-status pending">⏳ Sync pending</div>
            )}
          </div>
        </div>

        <div className="event-actions">
          <button
            className="btn btn-outline"
            onClick={() => onViewDetails(event)}
          >
            View Details
          </button>
          {event.signupUrl ? (
            <button className="btn btn-primary" onClick={handleExternalSignup}>
              Sign Up
            </button>
          ) : (
            <button
              className={rsvpProps.className}
              onClick={() => onRSVP(event.id)}
              disabled={rsvpProps.disabled}
            >
              {rsvpProps.text}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
