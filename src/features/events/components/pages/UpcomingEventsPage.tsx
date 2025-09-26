import React, { useState, useEffect, useMemo } from 'react';
import { EventsService } from '@features/events/services';
import { EventCard } from '../../../../components/common/EventCard';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import { StandardEventDetailsModal } from '../modals/StandardEventDetailsModal';
import type { Event, FilterState } from '@features/events/types';

interface RSVPState {
  [eventId: string]: {
    status: 'none' | 'registered' | 'pending_sync';
    loading: boolean;
  };
}

export function UpcomingEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpStates, setRsvpStates] = useState<RSVPState>({});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock user ID - in real app this would come from auth context
  const currentUserId = 'user-123';

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching all upcoming events...');
        const response = await EventsService.getEvents(1, 100); // Get more events for filtering

        if (response.success && response.data) {
          const now = new Date();

          // Filter for upcoming events only
          const upcomingEvents = response.data
            .filter(event => {
              const eventDate = new Date(event.startDate);
              return eventDate >= now;
            })
            .sort(
              (a, b) =>
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
            );

          setEvents(upcomingEvents);

          // Initialize RSVP states
          const initialRsvpStates: RSVPState = {};
          upcomingEvents.forEach(event => {
            initialRsvpStates[event.id] = {
              status: getUserRsvpStatus(event.id),
              loading: false,
            };
          });
          setRsvpStates(initialRsvpStates);

          console.log('✅ Upcoming events loaded:', upcomingEvents.length);
        } else {
          throw new Error(response.message || 'Failed to fetch events');
        }
      } catch (err) {
        console.error('❌ Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');

        // Set fallback data
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get user RSVP status
  const getUserRsvpStatus = (
    eventId: string
  ): 'none' | 'registered' | 'pending_sync' => {
    // Check pending operations first
    const pendingRsvps = JSON.parse(
      localStorage.getItem('pendingRsvps') || '[]'
    );
    const hasPendingRsvp = pendingRsvps.some(
      (rsvp: any) => rsvp.eventId === eventId && rsvp.userId === currentUserId
    );

    if (hasPendingRsvp) {
      return 'pending_sync';
    }

    // Check stored RSVPs
    const storedRsvps = localStorage.getItem('userRsvps');
    if (storedRsvps) {
      const userRsvps = JSON.parse(storedRsvps);
      const userEventRsvps = userRsvps[currentUserId] || [];
      return userEventRsvps.includes(eventId) ? 'registered' : 'none';
    }

    return 'none';
  };

  // Handle RSVP action
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

        // Try API first when online
        if (navigator.onLine) {
          try {
            const response = await EventsService.rsvpToEvent(eventId, {
              userId: currentUserId,
              ticketType: 'general',
            });

            if (response.success) {
              // API call succeeded
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
                    ? { ...event, rsvpCount: (event.rsvpCount ?? 0) + 1 }
                    : event
                )
              );

              // Store in localStorage
              const storedRsvps = JSON.parse(
                localStorage.getItem('userRsvps') || '{}'
              );
              const userRsvps = storedRsvps[currentUserId] || [];
              if (!userRsvps.includes(eventId)) {
                userRsvps.push(eventId);
                storedRsvps[currentUserId] = userRsvps;
                localStorage.setItem('userRsvps', JSON.stringify(storedRsvps));
              }

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
          }
        }

        // Store for offline sync
        handleOfflineRSVP(eventId, 'register');
      } else if (currentStatus === 'registered') {
        // Cancel RSVP
        console.log(`❌ Canceling RSVP for event ${eventId}`);

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
              ? { ...event, rsvpCount: Math.max(0, (event.rsvpCount ?? 0) - 1) }
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

  // Handle offline RSVP
  const handleOfflineRSVP = (
    eventId: string,
    action: 'register' | 'cancel'
  ) => {
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
                  ? (event.rsvpCount ?? 0) + 1
                  : Math.max(0, (event.rsvpCount ?? 0) - 1),
            }
          : event
      )
    );

    console.log(`📱 Offline RSVP stored for sync: ${action} event ${eventId}`);
  };

  // Handle view event details
  const handleViewDetails = (event: Event) => {
    console.log('🔍 Opening event details for:', event.title);
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedSponsor('');
  };

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          (event.sponsor && event.sponsor.toLowerCase().includes(searchLower))
      );
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(
        event =>
          event.location.includes(selectedLocation) ||
          event.venue?.includes(selectedLocation)
      );
    }

    // Apply sponsor filter
    if (selectedSponsor) {
      filtered = filtered.filter(event => event.sponsor === selectedSponsor);
    }

    // Sort by date (earliest first)
    filtered.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return filtered;
  }, [events, searchTerm, selectedLocation, selectedSponsor]);

  // Get unique values for filter options
  const availableLocations = useMemo(() => {
    const locations = events
      .map(event => event.location)
      .filter((location, index, arr) => arr.indexOf(location) === index)
      .sort();
    return locations;
  }, [events]);

  const availableSponsors = useMemo(() => {
    const sponsors = events
      .map(event => event.sponsor)
      .filter((sponsor): sponsor is string => Boolean(sponsor))
      .filter((sponsor, index, arr) => arr.indexOf(sponsor) === index)
      .sort();
    return sponsors;
  }, [events]);

  const hasActiveFilters = searchTerm || selectedLocation || selectedSponsor;

  if (loading) {
    return (
      <div className="upcoming-events-page">
        <div className="page-header">
          <h1>Upcoming Events</h1>
          <p>Loading events...</p>
        </div>
        <div className="loading-container">
          <LoadingSpinner size="large" text="Loading upcoming events..." />
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="upcoming-events-page">
        <div className="page-header">
          <h1>Upcoming Events</h1>
          <p>Failed to load events</p>
        </div>
        <div className="error-container">
          <ErrorMessage
            error={error}
            title="Failed to load events"
            showRetry
            onRetry={() => window.location.reload()}
            variant="banner"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="upcoming-events-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Upcoming Events</h1>
          <p>Discover and RSVP to upcoming alumni events</p>
        </div>

        <div className="page-stats">
          <div className="stat-item">
            <span className="stat-value">{events.length}</span>
            <span className="stat-label">Total Events</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{filteredEvents.length}</span>
            <span className="stat-label">Showing</span>
          </div>
        </div>
      </div>

      <div className="page-content-simple">
        {/* Simple Filter Bar */}
        <div className="simple-filters">
          <div className="search-section">
            <input
              type="text"
              className="search-input"
              placeholder="Search events..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-toggles">
            <button
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters{' '}
              {hasActiveFilters && <span className="filter-count">•</span>}
            </button>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                ⊞
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="expanded-filters">
            <div className="filter-row">
              <select
                className="filter-select"
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {availableLocations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={selectedSponsor}
                onChange={e => setSelectedSponsor(e.target.value)}
              >
                <option value="">All Sponsors</option>
                {availableSponsors.map(sponsor => (
                  <option key={sponsor} value={sponsor}>
                    {sponsor}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  className="clear-filters-btn"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Events Container */}
        <div className={`events-container ${viewMode}`}>
          {filteredEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No events found</h3>
              <p>
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more events.'
                  : 'There are no upcoming events at the moment. Check back soon!'}
              </p>
              {hasActiveFilters && (
                <button
                  className="btn btn-primary"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={handleViewDetails}
                onRSVP={handleRSVP}
                userRsvpStatus={rsvpStates[event.id]?.status || 'none'}
                rsvpLoading={rsvpStates[event.id]?.loading || false}
                compact={viewMode === 'list'}
              />
            ))
          )}
        </div>
      </div>

      {/* Event Details Modal */}
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
    </div>
  );
}
