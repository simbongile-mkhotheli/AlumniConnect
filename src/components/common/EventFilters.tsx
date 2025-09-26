import React from 'react';
import type { FilterState } from '../../types';

interface EventFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  availableSponsors?: string[];
  availableLocations?: string[];
  showAdvancedFilters?: boolean;
}

export function EventFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  availableSponsors = [],
  availableLocations = [],
  showAdvancedFilters = true,
}: EventFiltersProps) {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({ [key]: value || undefined });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value || undefined });
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value && value !== ''
  );

  return (
    <div className="event-filters">
      <div className="filters-header">
        <h3>Filter Events</h3>
        {hasActiveFilters && (
          <button className="btn btn-outline btn-sm" onClick={onClearFilters}>
            Clear All
          </button>
        )}
      </div>

      <div className="filters-grid">
        {/* Search */}
        <div className="filter-group">
          <label className="filter-label">Search Events</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search by title, description..."
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            value={filters.status || ''}
            onChange={e => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="filter-group">
          <label className="filter-label">Location</label>
          <select
            className="filter-select"
            value={filters.location || ''}
            onChange={e => handleFilterChange('location', e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="Online">Online</option>
            <option value="Cape Town">Cape Town</option>
            <option value="Johannesburg">Johannesburg</option>
            <option value="Durban">Durban</option>
            <option value="Pretoria">Pretoria</option>
            {availableLocations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Sponsor Filter */}
        <div className="filter-group">
          <label className="filter-label">Sponsor</label>
          <select
            className="filter-select"
            value={filters.sponsor || ''}
            onChange={e => handleFilterChange('sponsor', e.target.value)}
          >
            <option value="">All Sponsors</option>
            {availableSponsors.map(sponsor => (
              <option key={sponsor} value={sponsor}>
                {sponsor}
              </option>
            ))}
          </select>
        </div>

        {showAdvancedFilters && (
          <>
            {/* Event Type Filter */}
            <div className="filter-group">
              <label className="filter-label">Event Type</label>
              <select
                className="filter-select"
                value={filters.type || ''}
                onChange={e => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="networking">Networking</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="conference">Conference</option>
                <option value="social">Social</option>
                <option value="career">Career</option>
                <option value="technical">Technical</option>
                <option value="mentorship">Mentorship</option>
              </select>
            </div>

            {/* Featured Events Filter */}
            <div className="filter-group">
              <label className="filter-label">Featured</label>
              <select
                className="filter-select"
                value={filters.featured || ''}
                onChange={e => handleFilterChange('featured', e.target.value)}
              >
                <option value="">All Events</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters">
          <div className="active-filters-label">Active Filters:</div>
          <div className="active-filters-list">
            {filters.search && (
              <span className="active-filter">
                Search: "{filters.search}"
                <button
                  className="remove-filter"
                  onClick={() => onFiltersChange({ search: undefined })}
                >
                  ×
                </button>
              </span>
            )}
            {filters.status && (
              <span className="active-filter">
                Status: {filters.status}
                <button
                  className="remove-filter"
                  onClick={() => onFiltersChange({ status: undefined })}
                >
                  ×
                </button>
              </span>
            )}
            {filters.location && (
              <span className="active-filter">
                Location: {filters.location}
                <button
                  className="remove-filter"
                  onClick={() => onFiltersChange({ location: undefined })}
                >
                  ×
                </button>
              </span>
            )}
            {filters.sponsor && (
              <span className="active-filter">
                Sponsor: {filters.sponsor}
                <button
                  className="remove-filter"
                  onClick={() => onFiltersChange({ sponsor: undefined })}
                >
                  ×
                </button>
              </span>
            )}
            {filters.type && (
              <span className="active-filter">
                Type: {filters.type}
                <button
                  className="remove-filter"
                  onClick={() => onFiltersChange({ type: undefined })}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
