import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useFilters, useBulkActions, useFilteredData } from '../../hooks';
import { formatDate, getStatusBadgeClass } from '../../utils';
import { EventsService } from '../../services/eventsService';
import { SponsorsService } from '../../services/sponsorsService';
import type { Event, Sponsor } from '../../types';

interface UpcomingEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditEvent?: (eventId: string) => void;
}

export function UpcomingEventsModal({
  isOpen,
  onClose,
  onEditEvent,
}: UpcomingEventsModalProps) {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { filters, updateFilters, updateSearch, clearFilters } =
    useFilters('events');

  // Load events and sponsors data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [eventsData, sponsorsData] = await Promise.all([
          EventsService.getEvents(),
          SponsorsService.getSponsors()
        ]);
        setEvents(eventsData.data);
        setSponsors(sponsorsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const {
    selectedItems,
    isVisible,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelections,
    performBulkAction,
  } = useBulkActions('events');

  // Enhanced filtering with featured events support
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by search terms
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    // Filter by sponsor
    if (filters.sponsor) {
      filtered = filtered.filter(event => event.sponsor === filters.sponsor);
    }

    // Filter by featured status using the type field
    if (filters.type === 'featured') {
      filtered = filtered.filter(event => event.isFeatured);
    } else if (filters.type === 'regular') {
      filtered = filtered.filter(event => !event.isFeatured);
    }

    return filtered;
  }, [filters, events]);

  const summaryStats = useMemo(() => {
    return {
      total: events.length,
      published: events.filter((e: Event) => e.status === 'published').length,
      draft: events.filter((e: Event) => e.status === 'draft').length,
      scheduled: events.filter((e: Event) => e.status === 'scheduled').length,
      totalRsvps: events.reduce((sum: number, e: Event) => sum + e.rsvpCount, 0),
    };
  }, [events]);

  const handleSelectAll = () => {
    const allIds = filteredEvents.map(event => event.id);
    selectAll(allIds);
  };

  const handleBulkAction = (action: string) => {
    performBulkAction(action);
    addToast({ type: 'info', message: 'Bulk action queued', description: `${action} on ${selectedCount} events` });
  };

  const handleEventAction = (action: string, eventId: string) => {
    console.log(`${action} event:`, eventId);

    switch (action) {
      case 'edit':
        // Use navigation instead of callback
        if (onEditEvent) {
          onEditEvent(eventId); // For backward compatibility
        } else {
          navigate(`/admin/upcoming-events/edit/${eventId}`);
        }
        break;
      case 'view':
        navigate(`/admin/upcoming-events/view/${eventId}`);
        break;
      case 'preview':
        addToast({ type: 'info', message: 'Preview event', description: `Event ID ${eventId}` });
        break;
      case 'publish':
        addToast({ type: 'success', message: 'Publish requested', description: `Event ${eventId} will be published` });
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this event?')) {
          addToast({ type: 'warning', message: 'Event deleted', description: `Deleted event ${eventId}` });
        }
        break;
      case 'analytics':
        addToast({ type: 'info', message: 'Analytics', description: `Opening analytics for ${eventId}` });
        break;
      default:
        addToast({ type: 'info', message: 'Action executed', description: `${action} for event ${eventId}` });
    }
  };

  const handleCreateEvent = () => {
    console.log('Creating new event - navigating to create page');
    navigate('/admin/upcoming-events/create');
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="upcoming-events-overlay active">
        <div className="upcoming-events-manager">
          <div className="manager-header">
            <h2>📋 Upcoming Events Management</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div>Loading events...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="upcoming-events-overlay active">
        <div className="upcoming-events-manager">
          <div className="manager-header">
            <h2>📋 Upcoming Events Management</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
            <div>Error: {error}</div>
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Retry
            </button>
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
          <div className="header-actions">
            <button
              className="admin-card-action primary"
              onClick={handleCreateEvent}
              title="Create New Event"
            >
              ➕ Create Event
            </button>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>

        <div className="upcoming-events-body">
          {/* Enhanced Events Summary */}
          <div className="events-summary">
            <div className="summary-card">
              <div className="summary-value">{summaryStats.total}</div>
              <div className="summary-label">Total Events</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.published}</div>
              <div className="summary-label">Published Events</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.totalRsvps}</div>
              <div className="summary-label">Total RSVPs</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.draft}</div>
              <div className="summary-label">Draft Events</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.scheduled}</div>
              <div className="summary-label">Scheduled Events</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {events.filter((e: Event) => e.isFeatured).length}
              </div>
              <div className="summary-label">Featured Events</div>
            </div>
          </div>

          {/* Enhanced Event Filters */}
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

              <select
                value={filters.sponsor || ''}
                onChange={e =>
                  updateFilters({ sponsor: e.target.value || undefined })
                }
              >
                <option value="">All Sponsors</option>
                {sponsors.filter(sponsor => sponsor.status === 'active').map(sponsor => (
                  <option key={sponsor.id} value={sponsor.name}>
                    {sponsor.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.type || ''}
                onChange={e =>
                  updateFilters({ type: e.target.value || undefined })
                }
              >
                <option value="">All Events</option>
                <option value="featured">Featured Only</option>
                <option value="regular">Non-Featured</option>
              </select>
            </div>

            <div className="search-section">
              <input
                type="text"
                className="search-input"
                placeholder="Search events..."
                value={filters.search || ''}
                onChange={e => updateSearch(e.target.value)}
              />
            </div>

            {(filters.status ||
              filters.sponsor ||
              filters.type ||
              filters.search) && (
              <button className="filter-clear-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          {/* Enhanced Bulk Actions */}
          {isVisible && (
            <div className="bulk-actions">
              <div className="bulk-selection">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={
                    selectedCount === filteredEvents.length &&
                    filteredEvents.length > 0
                  }
                  onChange={handleSelectAll}
                />
                <label htmlFor="selectAll">
                  {selectedCount} of {filteredEvents.length} selected
                </label>
              </div>
              <div className="bulk-buttons">
                <button
                  className="bulk-action-btn publish"
                  onClick={() => handleBulkAction('publish')}
                >
                  Publish Selected
                </button>
                <button
                  className="bulk-action-btn draft"
                  onClick={() => handleBulkAction('draft')}
                >
                  Move to Draft
                </button>
                <button
                  className="bulk-action-btn delete"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No Events Found</h3>
              <p>No events match your current filters.</p>
              <button className="btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
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
                    <div className="event-card-title">{event.title}</div>
                    <div className="event-date">{formatDate(event.startDate)}</div>
                    <div className="event-location">📍 {event.location}</div>
                  </div>

                  <div className="event-card-body">
                    <div className="event-stats">
                      <div className="event-stat">
                        <div className="stat-value">{event.rsvpCount}</div>
                        <div className="stat-label">RSVPs</div>
                      </div>
                      <div className="event-stat">
                        <div className="stat-value">
                          {event.attendanceCount}
                        </div>
                        <div className="stat-label">Attended</div>
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
                        <span className="status-badge featured">
                          ⭐ Featured
                        </span>
                      )}
                      {event.sponsor && (
                        <span className="sponsor-badge">
                          🏢 {event.sponsor}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="event-card-footer">
                    <div className="event-actions">
                      <button
                        className="event-action-btn primary"
                        onClick={() => handleEventAction('edit', event.id)}
                        title="Edit Event"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="event-action-btn"
                        onClick={() => handleEventAction('view', event.id)}
                        title="View Event"
                      >
                        👁️ View
                      </button>
                      <button
                        className="event-action-btn"
                        onClick={() => handleEventAction('analytics', event.id)}
                        title="View Analytics"
                      >
                        📊 Analytics
                      </button>
                      {event.status === 'draft' && (
                        <button
                          className="event-action-btn primary"
                          onClick={() => handleEventAction('publish', event.id)}
                          title="Publish Event"
                        >
                          🚀 Publish
                        </button>
                      )}
                      <button
                        className="event-action-btn danger"
                        onClick={() => handleEventAction('delete', event.id)}
                        title="Delete Event"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
