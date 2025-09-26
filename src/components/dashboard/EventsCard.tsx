import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventsService } from '../../services/eventsService';
import type { Event } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { StandardEventDetailsModal } from '../modals/StandardEventDetailsModal';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  sponsor: string;
  rsvpCount: number;
  isSynced: boolean;
  userRsvpStatus?: 'none' | 'registered' | 'pending_sync';
  fullEvent: Event;
}

interface RSVPState {
  [eventId: string]: {
    status: 'none' | 'registered' | 'pending_sync';
    loading: boolean;
  };
}

export function EventsCard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUpcomingEvents, setTotalUpcomingEvents] = useState(0);
  const [rsvpStates, setRsvpStates] = useState<RSVPState>({});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  // Mock user ID - in real app this would come from auth context
  const currentUserId = 'user-123';

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching events from API...');
        const response = await EventsService.getEvents(1, 20); // Get first 20 events

        console.log('📡 Events API Response:', response);

        if (response.success && response.data) {
          const now = new Date();

          // Filter for upcoming events and transform to EventItem format
          const upcomingEvents = response.data
            .filter(event => {
              const eventDate = new Date(event.startDate);
              return eventDate >= now;
            })
            .sort(
              (a, b) =>
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
            )
            .slice(0, 3) // Show only first 3 upcoming events
            .map(event => ({
              id: event.id,
              title: event.title,
              date: formatDate(event.startDate),
              time: formatTime(event.startDate, event.endDate),
              location: event.location || event.venue || 'TBD',
              sponsor: event.sponsor || getEventSponsor(event),
              rsvpCount: event.rsvpCount || 0,
              isSynced: true, // Always synced when loaded from API
              userRsvpStatus: getUserRsvpStatus(event.id),
              fullEvent: event,
            }));

          // Count total upcoming events
          const totalUpcoming = response.data.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= now;
          }).length;

          setEvents(upcomingEvents);
          setTotalUpcomingEvents(totalUpcoming);

          // Initialize RSVP states
          const initialRsvpStates: RSVPState = {};
          upcomingEvents.forEach(event => {
            initialRsvpStates[event.id] = {
              status: event.userRsvpStatus || 'none',
              loading: false,
            };
          });
          setRsvpStates(initialRsvpStates);

          console.log('✅ Events loaded successfully:', upcomingEvents.length);
        } else {
          throw new Error(response.message || 'Failed to fetch events');
        }
      } catch (err) {
        console.error('❌ Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');

        // Set fallback data
        const fallbackEvents = [
          {
            id: '1',
            title: 'Alumni Networking Mixer',
            date: 'Feb 25, 2025',
            time: '6:00 PM - 9:00 PM',
            location: 'Downtown Convention Center',
            sponsor: 'Telkom',
            rsvpCount: 47,
            isSynced: true,
            userRsvpStatus: 'none' as const,
            fullEvent: {
              id: '1',
              title: 'Alumni Networking Mixer',
              slug: 'alumni-networking-mixer',
              excerpt:
                'Connect with fellow alumni in a relaxed networking environment',
              description:
                'Join us for an evening of networking, refreshments, and reconnecting with your fellow alumni. This event will feature:\n\n• Welcome reception with light refreshments\n• Structured networking activities\n• Industry breakout sessions\n• Alumni success story presentations\n• Closing remarks and next steps\n\nDress code: Business casual\nParking: Available on-site\nContact: events@alumniconnect.com for questions',
              organizer: 'AlumniConnect Team',
              location: 'Downtown Convention Center',
              venue: 'Downtown Convention Center',
              address: '123 Main St, Downtown',
              startDate: '2025-02-25T18:00:00Z',
              endDate: '2025-02-25T21:00:00Z',
              sponsor: 'Telkom',
              status: 'published' as const,
              isFeatured: false,
              tags: ['networking', 'social', 'professional'],
              rsvpCount: 47,
              attendanceCount: 0,
            },
          },
          {
            id: '2',
            title: 'Career Development Workshop',
            date: 'Mar 2, 2025',
            time: '2:00 PM - 5:00 PM',
            location: 'Tech Hub Johannesburg',
            sponsor: 'CompTIA',
            rsvpCount: 23,
            isSynced: true,
            userRsvpStatus: 'none' as const,
            fullEvent: {
              id: '2',
              title: 'Career Development Workshop',
              slug: 'career-development-workshop',
              excerpt: 'Learn essential skills for career advancement',
              description:
                'A comprehensive workshop covering resume building, interview skills, and career planning. This interactive session includes:\n\n• Resume writing best practices\n• Interview preparation and mock interviews\n• Career planning and goal setting\n• Networking strategies\n• Personal branding workshop\n• Q&A with industry professionals\n\nMaterials provided. Bring your current resume for personalized feedback.',
              organizer: 'Career Services',
              location: 'Tech Hub Johannesburg',
              venue: 'Tech Hub Johannesburg',
              address: '456 Tech St, Johannesburg',
              startDate: '2025-03-02T14:00:00Z',
              endDate: '2025-03-02T17:00:00Z',
              sponsor: 'CompTIA',
              status: 'published' as const,
              isFeatured: true,
              tags: ['career', 'workshop', 'professional-development'],
              rsvpCount: 23,
              attendanceCount: 0,
            },
          },
          {
            id: '3',
            title: 'Innovation Summit 2025',
            date: 'Mar 15, 2025',
            time: '9:00 AM - 6:00 PM',
            location: 'Grand Convention Hall',
            sponsor: 'GitHub',
            rsvpCount: 89,
            isSynced: true,
            userRsvpStatus: 'none' as const,
            fullEvent: {
              id: '3',
              title: 'Innovation Summit 2025',
              slug: 'innovation-summit-2025',
              excerpt: 'Explore the latest in technology and innovation',
              description:
                'A full-day summit featuring keynote speakers, workshops, and networking opportunities. Join us for an inspiring day of:\n\n• Keynote presentations from industry leaders\n• Interactive workshops on emerging technologies\n• Startup pitch competitions\n• Innovation showcase and demos\n• Panel discussions on future trends\n• Networking lunch and coffee breaks\n• Awards ceremony\n\nThis premier event brings together innovators, entrepreneurs, and thought leaders to explore the future of technology.',
              organizer: 'Innovation Team',
              location: 'Grand Convention Hall',
              venue: 'Grand Convention Hall',
              address: '789 Innovation Ave, City Center',
              startDate: '2025-03-15T09:00:00Z',
              endDate: '2025-03-15T18:00:00Z',
              sponsor: 'GitHub',
              status: 'published' as const,
              isFeatured: true,
              tags: ['innovation', 'technology', 'summit', 'networking'],
              rsvpCount: 89,
              attendanceCount: 0,
            },
          },
        ];

        setEvents(fallbackEvents);
        setTotalUpcomingEvents(8);

        // Initialize fallback RSVP states
        const fallbackRsvpStates: RSVPState = {};
        fallbackEvents.forEach(event => {
          fallbackRsvpStates[event.id] = {
            status: event.userRsvpStatus || 'none',
            loading: false,
          };
        });
        setRsvpStates(fallbackRsvpStates);
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

  // Helper function to get event sponsor
  const getEventSponsor = (event: Event): string => {
    // Default sponsors based on location for fallback
    const locationSponsors: Record<string, string> = {
      'Cape Town': 'iWeb',
      Johannesburg: 'Telkom',
      Durban: 'CompTIA',
      Pretoria: 'GitHub',
      Online: 'Microsoft',
      Downtown: 'Standard Bank',
    };

    const location = event.location || event.venue || '';
    const city = location.split(',')[0].trim();
    return locationSponsors[city] || 'Community Sponsored';
  };

  // Get user RSVP status (improved implementation)
  const getUserRsvpStatus = (
    eventId: string
  ): 'none' | 'registered' | 'pending_sync' => {
    // First check if there's a pending operation
    const pendingRsvps = JSON.parse(
      localStorage.getItem('pendingRsvps') || '[]'
    );
    const hasPendingRsvp = pendingRsvps.some(
      (rsvp: any) => rsvp.eventId === eventId && rsvp.userId === currentUserId
    );

    if (hasPendingRsvp) {
      return 'pending_sync';
    }

    // Then check stored RSVPs
    const storedRsvps = localStorage.getItem('userRsvps');
    if (storedRsvps) {
      const userRsvps = JSON.parse(storedRsvps);
      const userEventRsvps = userRsvps[currentUserId] || [];
      return userEventRsvps.includes(eventId) ? 'registered' : 'none';
    }

    return 'none';
  };

  // Handle RSVP action (improved with better online detection)
  const handleRSVP = async (eventId: string) => {
    const currentStatus = rsvpStates[eventId]?.status || 'none';

    // If already registered, show confirmation to cancel
    if (currentStatus === 'registered') {
      const confirmCancel = window.confirm(
        'Are you sure you want to cancel your RSVP?'
      );
      if (!confirmCancel) return;
    }

    // Update loading state
    setRsvpStates(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        loading: true,
      },
    }));

    try {
      if (currentStatus === 'none' || currentStatus === 'pending_sync') {
        // RSVP to event
        console.log(`🎯 RSVPing to event ${eventId}`);

        // Always try API first when online
        if (navigator.onLine) {
          try {
            const response = await EventsService.rsvpToEvent(eventId, {
              userId: currentUserId,
              ticketType: 'general',
            });

            if (response.success) {
              // API call succeeded - update to registered
              setRsvpStates(prev => ({
                ...prev,
                [eventId]: {
                  status: 'registered',
                  loading: false,
                },
              }));

              // Update event RSVP count
              setEvents(prev =>
                prev.map(event =>
                  event.id === eventId
                    ? {
                        ...event,
                        rsvpCount: event.rsvpCount + 1,
                        isSynced: true,
                      }
                    : event
                )
              );

              // Store in localStorage as registered
              const storedRsvps = JSON.parse(
                localStorage.getItem('userRsvps') || '{}'
              );
              const userRsvps = storedRsvps[currentUserId] || [];
              if (!userRsvps.includes(eventId)) {
                userRsvps.push(eventId);
                storedRsvps[currentUserId] = userRsvps;
                localStorage.setItem('userRsvps', JSON.stringify(storedRsvps));
              }

              // Remove any pending RSVP for this event
              const pendingRsvps = JSON.parse(
                localStorage.getItem('pendingRsvps') || '[]'
              );
              const filteredPending = pendingRsvps.filter(
                (rsvp: any) =>
                  !(rsvp.eventId === eventId && rsvp.userId === currentUserId)
              );
              localStorage.setItem(
                'pendingRsvps',
                JSON.stringify(filteredPending)
              );

              console.log('✅ RSVP successful via API');
              return;
            } else {
              throw new Error(response.message || 'RSVP failed');
            }
          } catch (apiError) {
            console.warn(
              '⚠️ API RSVP failed, storing for offline sync:',
              apiError
            );
            // Fall through to offline handling
          }
        }

        // Store for offline sync (either offline or API failed)
        handleOfflineRSVP(eventId, 'register');
      } else if (currentStatus === 'registered') {
        // Cancel RSVP
        console.log(`❌ Canceling RSVP for event ${eventId}`);

        // Update state to none immediately for better UX
        setRsvpStates(prev => ({
          ...prev,
          [eventId]: {
            status: 'none',
            loading: false,
          },
        }));

        // Update event RSVP count
        setEvents(prev =>
          prev.map(event =>
            event.id === eventId
              ? {
                  ...event,
                  rsvpCount: Math.max(0, event.rsvpCount - 1),
                  isSynced: true,
                }
              : event
          )
        );

        // Remove from localStorage
        const storedRsvps = JSON.parse(
          localStorage.getItem('userRsvps') || '{}'
        );
        const userRsvps = storedRsvps[currentUserId] || [];
        const updatedUserRsvps = userRsvps.filter(
          (id: string) => id !== eventId
        );
        storedRsvps[currentUserId] = updatedUserRsvps;
        localStorage.setItem('userRsvps', JSON.stringify(storedRsvps));

        console.log('✅ RSVP cancelled');
      }
    } catch (error) {
      console.error('❌ RSVP error:', error);
      // Reset loading state
      setRsvpStates(prev => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          loading: false,
        },
      }));
    }
  };

  // Handle offline RSVP (simplified)
  const handleOfflineRSVP = (
    eventId: string,
    action: 'register' | 'cancel'
  ) => {
    // Store in pending sync queue
    const pendingRsvps = JSON.parse(
      localStorage.getItem('pendingRsvps') || '[]'
    );

    // Remove any existing pending operation for this event/user
    const filteredPending = pendingRsvps.filter(
      (rsvp: any) =>
        !(rsvp.eventId === eventId && rsvp.userId === currentUserId)
    );

    // Add new pending operation
    filteredPending.push({
      eventId,
      action,
      userId: currentUserId,
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem('pendingRsvps', JSON.stringify(filteredPending));

    // Update state to pending_sync
    setRsvpStates(prev => ({
      ...prev,
      [eventId]: {
        status: 'pending_sync',
        loading: false,
      },
    }));

    // Update event display (optimistic update)
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              rsvpCount:
                action === 'register'
                  ? event.rsvpCount + 1
                  : Math.max(0, event.rsvpCount - 1),
              isSynced: false,
            }
          : event
      )
    );

    console.log(`📱 Offline RSVP stored for sync: ${action} event ${eventId}`);
  };

  // Handle view event details
  const handleViewDetails = (event: EventItem) => {
    console.log('🔍 Opening event details for:', event.title);
    setSelectedEvent(event.fullEvent);
    setShowEventDetails(true);
  };

  // Handle view all events
  const handleViewAllEvents = () => {
    console.log('📋 Navigating to upcoming events page');
    navigate('/dashboard/upcoming-events');
  };

  // Get RSVP button text and style
  const getRsvpButtonProps = (eventId: string) => {
    const rsvpState = rsvpStates[eventId];
    if (!rsvpState)
      return { text: 'RSVP', className: 'btn btn-primary', disabled: false };

    if (rsvpState.loading) {
      return {
        text: 'Loading...',
        className: 'btn btn-primary',
        disabled: true,
      };
    }

    switch (rsvpState.status) {
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

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Upcoming Events</div>
          <div className="card-subtitle">
            RSVP online, sync when reconnected
          </div>
          <div
            style={{ marginLeft: 'auto', fontSize: '12px', color: '#6c757d' }}
          >
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              `${totalUpcomingEvents} events upcoming`
            )}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
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
                Check back soon for new events
              </div>
            </div>
          ) : (
            events.map(event => {
              const rsvpProps = getRsvpButtonProps(event.id);
              return (
                <div key={event.id} className="event-item">
                  <div className="event-image"></div>
                  <div className="event-content">
                    <div className="event-title">{event.title}</div>
                    <div className="event-details">
                      📅 {event.date} at {event.time}
                      <br />
                      📍 {event.location}
                      <span className="sponsor-badge">
                        Sponsored by {event.sponsor}
                      </span>
                    </div>
                    <div className="event-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => handleViewDetails(event)}
                      >
                        View Details
                      </button>
                      <button
                        className={rsvpProps.className}
                        onClick={() => handleRSVP(event.id)}
                        disabled={rsvpProps.disabled}
                      >
                        {rsvpProps.text}
                      </button>
                    </div>
                  </div>
                  <div className="rsvp-status">
                    <div
                      className={`sync-indicator ${event.isSynced ? '' : 'offline'}`}
                      title={event.isSynced ? 'Synced' : 'Pending sync'}
                    ></div>
                    <span style={{ fontSize: '12px', color: '#718096' }}>
                      {event.rsvpCount} going
                    </span>
                    {rsvpStates[event.id]?.status === 'registered' && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#10b981',
                          fontWeight: '500',
                        }}
                      >
                        ✓ You're going
                      </div>
                    )}
                    {rsvpStates[event.id]?.status === 'pending_sync' && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#f59e0b',
                          fontWeight: '500',
                        }}
                      >
                        ⏳ Sync pending
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div
          style={{
            padding: '16px 24px',
            textAlign: 'center',
            borderTop: '1px solid #f1f3f4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {totalUpcomingEvents > 3
              ? `Showing 3 of ${totalUpcomingEvents} upcoming events`
              : `${totalUpcomingEvents} upcoming events`}
          </div>
          {totalUpcomingEvents > 3 && (
            <button
              className="btn btn-outline btn-sm"
              onClick={handleViewAllEvents}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              View All Events
            </button>
          )}
        </div>
      </div>

      {/* Event Details Modal - Render at root level */}
      {showEventDetails && selectedEvent && (
        <StandardEventDetailsModal
          event={selectedEvent}
          isOpen={showEventDetails}
          onClose={() => {
            console.log('🔒 Closing event details modal');
            setShowEventDetails(false);
            setSelectedEvent(null);
          }}
          onRSVP={handleRSVP}
          userRsvpStatus={rsvpStates[selectedEvent.id]?.status || 'none'}
          rsvpLoading={rsvpStates[selectedEvent.id]?.loading || false}
        />
      )}
    </>
  );
}
