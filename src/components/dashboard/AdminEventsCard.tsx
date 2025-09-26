import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventsService } from '../../services/eventsService';
import type { Event } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface AdminEventsCardProps {
  onEditEvent?: (eventId: string) => void;
  onViewEvent?: (eventId: string) => void;
  onManageEvents?: () => void;
  onCreateEvent?: () => void;
  onClose?: () => void;
}

export function AdminEventsCard({
  onEditEvent,
  onViewEvent,
  onManageEvents,
  onCreateEvent,
  onClose,
}: AdminEventsCardProps) {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching events from API...');
        const response = await EventsService.getEvents(1, 5); // Get first 5 events

        console.log('📡 API Response:', response);

        if (response.success && response.data) {
          // Filter for upcoming events and sort by date
          const upcomingEvents = response.data
            .filter(event => {
              const eventDate = new Date(event.startDate);
              const now = new Date();
              return eventDate >= now;
            })
            .sort(
              (a, b) =>
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
            )
            .slice(0, 3); // Show only first 3 upcoming events

          setEvents(upcomingEvents);
          console.log('✅ Events loaded successfully:', upcomingEvents.length);
        } else {
          throw new Error(response.message || 'Failed to fetch events');
        }
      } catch (err) {
        console.error('❌ Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get status badge info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'published':
        return { class: 'success', label: 'Published' };
      case 'draft':
        return { class: 'warning', label: 'Draft' };
      case 'scheduled':
        return { class: 'info', label: 'Scheduled' };
      case 'cancelled':
        return { class: 'error', label: 'Cancelled' };
      default:
        return { class: 'info', label: status };
    }
  };

  const handleEditEvent = (eventId: string) => {
    console.log(
      '🔥 EDIT BUTTON CLICKED! Event ID:',
      eventId,
      '- navigating to edit page'
    );
    if (onEditEvent) {
      onEditEvent(eventId); // For backward compatibility
    } else {
      navigate(`/admin/upcoming-events/edit/${eventId}`);
    }
  };

  const handleViewEvent = (eventId: string) => {
    console.log(
      '👁️ View event clicked with ID:',
      eventId,
      '- navigating to view page'
    );
    if (onViewEvent) {
      onViewEvent(eventId); // For backward compatibility
    } else {
      navigate(`/admin/upcoming-events/view/${eventId}`);
    }
  };

  const handleManageEvents = () => {
    console.log('📋 Manage events clicked - navigating to events management');
    if (onManageEvents) {
      onManageEvents(); // For backward compatibility
    } else {
      navigate('/admin/upcoming-events');
    }
  };

  const handleCreateEvent = () => {
    console.log('➕ Create event clicked - navigating to create page');
    if (onCreateEvent) {
      onCreateEvent(); // For backward compatibility
    } else {
      navigate('/admin/upcoming-events/create');
    }
  };

  const handleClose = () => {
    console.log('❌ Close clicked');
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Admin Events Manager</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="admin-card-action primary"
            onClick={handleCreateEvent}
            title="Create New Event"
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ➕ Create Event
          </button>
          <button
            className="admin-card-action"
            onClick={handleManageEvents}
            title="Manage All Events"
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#4a5568',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📋 Manage All
          </button>
          {onClose && (
            <button
              className="admin-card-action close"
              onClick={handleClose}
              title="Close"
              style={{
                padding: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ❌
            </button>
          )}
        </div>
      </div>
      <div className="admin-card-body">
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 20px',
            }}
          >
            <LoadingSpinner size="medium" text="Loading events..." />
          </div>
        ) : error ? (
          <div style={{ padding: '20px' }}>
            <ErrorMessage
              error={error}
              title="Failed to load events"
              showRetry={true}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : events.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              No upcoming events
            </div>
            <div style={{ fontSize: '14px' }}>
              Create your first event to get started
            </div>
            <button
              onClick={handleCreateEvent}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Create Event
            </button>
          </div>
        ) : (
          events.map(event => {
            const statusInfo = getStatusInfo(event.status);
            return (
              <div key={event.id} className="admin-list-item">
                <div className="item-info">
                  <div className="item-title">{event.title}</div>
                  <div className="item-subtitle">
                    {formatDate(event.startDate)} at{' '}
                    {formatTime(event.startDate)} • {event.location}
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                    <span className="status-badge info">
                      {event.rsvpCount || 0} RSVPs
                    </span>
                    {event.sponsor && (
                      <span className="sponsor-badge">
                        Sponsored by {event.sponsor}
                      </span>
                    )}
                  </div>
                </div>
                <div className="item-actions">
                  <button
                    className="item-btn primary"
                    onClick={() => handleEditEvent(event.id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: '1px solid #007bff',
                      padding: '5px 10px',
                      borderRadius: '3px',
                    }}
                  >
                    🔧 Edit
                  </button>
                  <button
                    className="item-btn"
                    onClick={() => handleViewEvent(event.id)}
                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {events.length > 0 && (
        <div
          style={{
            padding: '16px 24px',
            textAlign: 'center',
            borderTop: '1px solid #f1f3f4',
            background: 'rgba(248, 250, 252, 0.5)',
          }}
        >
          <button
            onClick={handleManageEvents}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#667eea',
              border: '1px solid #667eea',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#667eea';
            }}
          >
            View All Events ({events.length}+)
          </button>
        </div>
      )}
    </div>
  );
}
