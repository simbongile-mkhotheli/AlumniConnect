import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventsService } from '@features/events/services';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import type { Event, FilterState } from '@features/events/types';

export function EventsManagementPage() {
  const navigate = useNavigate();

  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load events from API
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading events from API...');
      const response = await EventsService.getEvents(1, 100, filters); // Get more events for management

      if (response.success && response.data) {
        setEvents(response.data);
        console.log('✅ Events loaded successfully:', response.data.length);
      } else {
        throw new Error(response.message || 'Failed to load events');
      }
    } catch (err) {
      console.error('❌ Error loading events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filters.status && event.status !== filters.status) return false;
      if (filters.sponsor && event.sponsor !== filters.sponsor) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          event.title.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm) ||
          event.organizer.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });
  }, [events, filters]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    return {
      total: events.length,
      published: events.filter(e => e.status === 'published').length,
      draft: events.filter(e => e.status === 'draft').length,
      scheduled: events.filter(e => e.status === 'scheduled').length,
      cancelled: events.filter(e => e.status === 'cancelled').length,
      totalRsvps: events.reduce((sum, e) => sum + (e.rsvpCount || 0), 0),
    };
  }, [events]);

  // Get unique sponsors for filter dropdown
  const availableSponsors = useMemo(() => {
    const sponsors = new Set(events.map(e => e.sponsor).filter(Boolean));
    return Array.from(sponsors);
  }, [events]);

  // Handle filter updates
  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Handle bulk selection
  const toggleSelection = (eventId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (selectedItems.size === filteredEvents.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredEvents.map(e => e.id)));
    }
  };

  // Handle individual event actions
  const handleEventAction = async (action: string, eventId: string) => {
    switch (action) {
      case 'edit':
        navigate(`/admin/upcoming-events/edit/${eventId}`);
        break;
      case 'view':
        navigate(`/admin/upcoming-events/view/${eventId}`);
        break;
      case 'publish':
      case 'unpublish':
      case 'cancel':
      case 'delete':
        await performEventAction(action, eventId);
        break;
      default:
        console.log(`${action} event:`, eventId);
    }
  };

  const performEventAction = async (action: string, eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const confirmMessage =
      action === 'delete'
        ? `Are you sure you want to delete "${event.title}"? This action cannot be undone.`
        : `Are you sure you want to ${action} "${event.title}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      setActionLoading(`${action}-${eventId}`);
      let response;

      switch (action) {
        case 'publish':
          response = await EventsService.publishEvent(eventId);
          break;
        case 'unpublish':
          response = await EventsService.unpublishEvent(eventId);
          break;
        case 'cancel':
          response = await EventsService.cancelEvent(eventId);
          break;
        case 'delete':
          response = await EventsService.deleteEvent(eventId);
          break;
      }

      if (response?.success) {
        // Reload events to reflect changes
        await loadEvents();
        setSelectedItems(new Set()); // Clear selections
      } else {
        throw new Error(response?.message || `Failed to ${action} event`);
      }
    } catch (err) {
      console.error(`Error ${action} event:`, err);
      setError(`Failed to ${action} event. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedItems.size === 0) return;

    const selectedEventTitles =
      events
        .filter(e => selectedItems.has(e.id))
        .map(e => e.title)
        .slice(0, 3)
        .join(', ') + (selectedItems.size > 3 ? '...' : '');

    const confirmMessage =
      action === 'delete'
        ? `Are you sure you want to delete ${selectedItems.size} events (${selectedEventTitles})? This action cannot be undone.`
        : `Are you sure you want to ${action} ${selectedItems.size} events (${selectedEventTitles})?`;

    if (!confirm(confirmMessage)) return;

    try {
      setActionLoading(`bulk-${action}`);
      const selectedIds = Array.from(selectedItems);

  const allowed = ['cancel','delete','publish','unpublish','feature','unfeature'] as const;
  const safeAction = allowed.includes(action as any) ? (action as typeof allowed[number]) : 'publish';
  const response = await EventsService.bulkOperation(safeAction, selectedIds);

      if (response.success) {
        await loadEvents();
        setSelectedItems(new Set());
      } else {
        throw new Error(response.message || `Failed to ${action} events`);
      }
    } catch (err) {
      console.error(`Bulk ${action} failed:`, err);
      setError(`Failed to ${action} selected events. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateEvent = () => {
    navigate('/admin/upcoming-events/create');
  };

  const handleClose = () => {
    navigate('/admin');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
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

  const calculateAttendanceRate = (
    rsvpCount: number,
    attendanceCount: number
  ) => {
    if (rsvpCount === 0) return 0;
    return Math.round((attendanceCount / rsvpCount) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="upcoming-events-overlay active">
        <div className="upcoming-events-manager">
          <div className="upcoming-events-header">
            <h2>Upcoming Events Manager</h2>
            <button className="close-btn" onClick={handleClose}>
              ×
            </button>
          </div>
          <div className="upcoming-events-body">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && events.length === 0) {
    return (
      <div className="upcoming-events-overlay active">
        <div className="upcoming-events-manager">
          <div className="upcoming-events-header">
            <h2>Upcoming Events Manager</h2>
            <button className="close-btn" onClick={handleClose}>
              ×
            </button>
          </div>
          <div className="upcoming-events-body">
            <ErrorMessage
              error={error}
              title="Failed to load events"
              showRetry
              onRetry={loadEvents}
              variant="card"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upcoming-events-overlay active">
      <div className="upcoming-events-manager">
        <div className="upcoming-events-header">
          <h2>Upcoming Events Manager</h2>
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
            >
              ➕ Create Event
            </button>
            <button className="close-btn" onClick={handleClose}>
              ×
            </button>
          </div>
        </div>

        <div className="upcoming-events-body">
          {/* Show error message if there's an error but we have cached data */}
          {error && events.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <ErrorMessage
                error={error}
                title="Warning"
                showRetry
                onRetry={loadEvents}
                variant="inline"
              />
            </div>
          )}

          {/* Events Summary */}
          <div className="events-summary">
            <div className="summary-card">
              <div className="summary-value">{summaryStats.total}</div>
              <div className="summary-label">Total Events</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.published}</div>
              <div className="summary-label">Published</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.draft}</div>
              <div className="summary-label">Draft</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.scheduled}</div>
              <div className="summary-label">Scheduled</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.cancelled}</div>
              <div className="summary-label">Cancelled</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.totalRsvps}</div>
              <div className="summary-label">Total RSVPs</div>
            </div>
          </div>

          {/* Event Filters */}
          <div className="event-filters">
            <div className="filter-group">
              <select
                value={filters.status || ''}
                onChange={e =>
                  updateFilters({ status: e.target.value || undefined })
                }
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="filter-group">
              <select
                value={filters.sponsor || ''}
                onChange={e =>
                  updateFilters({ sponsor: e.target.value || undefined })
                }
              >
                <option value="">All Sponsors</option>
                {availableSponsors.map(sponsor => (
                  <option key={sponsor} value={sponsor}>
                    {sponsor}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search || ''}
                onChange={e => updateFilters({ search: e.target.value })}
              />
            </div>
            <button className="filter-clear-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="bulk-actions">
              <div className="bulk-selection">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectedItems.size === filteredEvents.length}
                  onChange={selectAll}
                />
                <label htmlFor="selectAll">
                  {selectedItems.size} of {filteredEvents.length} selected
                </label>
              </div>
              <div className="bulk-buttons">
                <button
                  className="bulk-btn publish"
                  onClick={() => handleBulkAction('publish')}
                  disabled={actionLoading === 'bulk-publish'}
                >
                  {actionLoading === 'bulk-publish'
                    ? 'Publishing...'
                    : 'Publish Selected'}
                </button>
                <button
                  className="bulk-btn unpublish"
                  onClick={() => handleBulkAction('unpublish')}
                  disabled={actionLoading === 'bulk-unpublish'}
                >
                  {actionLoading === 'bulk-unpublish'
                    ? 'Unpublishing...'
                    : 'Unpublish Selected'}
                </button>
                <button
                  className="bulk-btn delete"
                  onClick={() => handleBulkAction('delete')}
                  disabled={actionLoading === 'bulk-delete'}
                >
                  {actionLoading === 'bulk-delete'
                    ? 'Deleting...'
                    : 'Delete Selected'}
                </button>
              </div>
            </div>
          )}

          {/* Events Grid */}
          <div className="events-grid">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className="event-card"
                data-status={event.status}
              >
                <input
                  type="checkbox"
                  className="event-checkbox"
                  checked={selectedItems.has(event.id)}
                  onChange={() => toggleSelection(event.id)}
                />

                <div className="event-card-header">
                  <div className="event-title">{event.title}</div>
                  <div className="event-date-time">
                    {formatDate(event.startDate)}
                  </div>
                </div>

                <div className="event-card-content">
                  <div className="event-location">{event.location}</div>
                  <div className="event-organizer">
                    Organized by {event.organizer}
                  </div>

                  <div className="event-stats">
                    <div className="event-stat">
                      <div className="stat-value">{event.rsvpCount || 0}</div>
                      <div className="stat-label">RSVPs</div>
                    </div>
                    <div className="event-stat">
                      <div className="stat-value">
                        {event.attendanceCount || 0}
                      </div>
                      <div className="stat-label">Attended</div>
                    </div>
                    <div className="event-stat">
                      <div className="stat-value">
                        {calculateAttendanceRate(
                          event.rsvpCount || 0,
                          event.attendanceCount || 0
                        )}
                        %
                      </div>
                      <div className="stat-label">Rate</div>
                    </div>
                  </div>

                  <div className="event-badges">
                    <span
                      className={`status-badge ${getStatusBadgeClass(event.status)}`}
                    >
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </span>
                    {event.isFeatured && (
                      <span className="status-badge featured">Featured</span>
                    )}
                    {event.sponsor && (
                      <span className="sponsor-badge">
                        Sponsored by {event.sponsor}
                      </span>
                    )}
                  </div>
                </div>

                <div className="event-actions">
                  <button
                    className="event-action-btn primary"
                    onClick={() => handleEventAction('edit', event.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="event-action-btn secondary"
                    onClick={() => handleEventAction('view', event.id)}
                  >
                    👁️ View
                  </button>
                  {event.status === 'draft' && (
                    <button
                      className="event-action-btn success"
                      onClick={() => handleEventAction('publish', event.id)}
                      disabled={actionLoading === `publish-${event.id}`}
                    >
                      {actionLoading === `publish-${event.id}` ? '⏳' : '🚀'}{' '}
                      Publish
                    </button>
                  )}
                  {event.status === 'published' && (
                    <button
                      className="event-action-btn warning"
                      onClick={() => handleEventAction('unpublish', event.id)}
                      disabled={actionLoading === `unpublish-${event.id}`}
                    >
                      {actionLoading === `unpublish-${event.id}` ? '⏳' : '📝'}{' '}
                      Unpublish
                    </button>
                  )}
                  {event.status !== 'cancelled' && (
                    <button
                      className="event-action-btn warning"
                      onClick={() => handleEventAction('cancel', event.id)}
                      disabled={actionLoading === `cancel-${event.id}`}
                    >
                      {actionLoading === `cancel-${event.id}` ? '⏳' : '❌'}{' '}
                      Cancel
                    </button>
                  )}
                  <button
                    className="event-action-btn danger"
                    onClick={() => handleEventAction('delete', event.id)}
                    disabled={actionLoading === `delete-${event.id}`}
                    style={{ marginLeft: 'auto' }}
                  >
                    {actionLoading === `delete-${event.id}` ? '⏳' : '🗑️'}{' '}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && !loading && (
            <div className="no-events">
              <div
                style={{ textAlign: 'center', padding: '40px', color: '#666' }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <h3>No events found</h3>
                <p>No events match your current filters.</p>
                <div
                  style={{
                    marginTop: '16px',
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                  }}
                >
                  <button
                    className="admin-card-action secondary"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                  <button
                    className="admin-card-action primary"
                    onClick={handleCreateEvent}
                  >
                    Create Event
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventsManagementPage;
