import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { OpportunitiesService } from '@features/opportunities/services';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import type { Opportunity } from '../../types';
import '../../styles/upcoming-events-page.css';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewDetails: (opportunity: Opportunity) => void;
  compact?: boolean;
}

function OpportunityCard({ opportunity, onViewDetails, compact = false }: OpportunityCardProps) {
  // Helper function to get status badge color
  const getStatusBadgeColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'error';
      case 'cancelled': return 'error';
      default: return 'info';
    }
  };

  // Helper function to format salary
  const formatSalary = (salary?: string): string => {
    if (!salary) return 'Not specified';
    if (salary.startsWith('R')) {
      return salary;
    }
    return `R${salary}`;
  };

  // Format posted date
  const formatPostedDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`event-card ${compact ? 'compact' : ''}`}>
      <div className="event-header">
        <div className="event-title-section">
          <h3 className="event-title">{opportunity.title}</h3>
          <div className="event-meta">
            <span className="event-location">🏢 {opportunity.company}</span>
            <span className="event-location">📍 {opportunity.location}</span>
            <span className={`status-badge ${getStatusBadgeColor(opportunity.status)}`}>
              {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="event-stats">
          <div className="stat-item">
            <span className="stat-value">{formatSalary(opportunity.salary)}</span>
            <span className="stat-label">Salary</span>
          </div>
          {opportunity.applicationCount && (
            <div className="stat-item">
              <span className="stat-value">{opportunity.applicationCount}</span>
              <span className="stat-label">Applications</span>
            </div>
          )}
        </div>
      </div>

      <div className="event-body">
        <p className="event-description">{opportunity.description}</p>
        
        <div className="event-details">
          <div className="detail-row">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Level:</span>
            <span className="detail-value">{opportunity.level.charAt(0).toUpperCase() + opportunity.level.slice(1)}</span>
          </div>
          
          {opportunity.isRemote && (
            <div className="detail-row">
              <span className="detail-label">Remote:</span>
              <span className="detail-value">Remote Work</span>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-label">Posted:</span>
            <span className="detail-value">{formatPostedDate(opportunity.postedDate)}</span>
          </div>
        </div>

        {opportunity.requirements && opportunity.requirements.length > 0 && (
          <div className="requirements-section">
            <h4>Requirements:</h4>
            <ul>
              {opportunity.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="event-tags">
          {opportunity.tags && opportunity.tags.length > 0 ? (
            opportunity.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))
          ) : (
            <>
              <span className="tag">Technology</span>
              <span className="tag">Career</span>
            </>
          )}
        </div>
      </div>
      
      <div className="event-footer">
        <button
          className="btn btn-outline"
          onClick={() => onViewDetails(opportunity)}
        >
          View Details
        </button>
        
        {opportunity.status === 'active' && (
          <button className="btn btn-primary">
            Apply Now
          </button>
        )}
        
        <a 
          href={`mailto:${opportunity.contactEmail}`}
          className="btn btn-secondary"
        >
          Contact
        </a>
      </div>
    </div>
  );
}

export function OpportunityBoardPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await OpportunitiesService.getOpportunities();
        console.log('Opportunities data:', data);
        setOpportunities(data.data || data);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError(err instanceof Error ? err.message : 'Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  // Get available filter options
  const availableStatuses = useMemo(() => {
    const statuses = Array.from(new Set(opportunities.map(opportunity => opportunity.status)));
    return statuses.sort();
  }, [opportunities]);

  const availableTypes = useMemo(() => {
    const types = Array.from(new Set(opportunities.map(opportunity => opportunity.type)));
    return types.sort();
  }, [opportunities]);

  const availableLevels = useMemo(() => {
    const levels = Array.from(new Set(opportunities.map(opportunity => opportunity.level)));
    return levels.sort();
  }, [opportunities]);

  const availableLocations = useMemo(() => {
    const locations = Array.from(new Set(opportunities.map(opportunity => {
      return opportunity.location.split(',')[0].trim();
    })));
    return locations.sort();
  }, [opportunities]);

  // Check if filters are active
  const hasActiveFilters = searchTerm || selectedStatus || selectedType || selectedLevel || selectedLocation;

  // Filter opportunities based on search and filters
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opportunity => {
      // Search filter
      const matchesSearch = 
        searchTerm === '' ||
        opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opportunity.tags && opportunity.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      // Status filter
      const matchesStatus = selectedStatus === '' || opportunity.status === selectedStatus;
      
      // Type filter
      const matchesType = selectedType === '' || opportunity.type === selectedType;
      
      // Level filter  
      const matchesLevel = selectedLevel === '' || opportunity.level === selectedLevel;
      
      // Location filter
      const matchesLocation = selectedLocation === '' || 
        opportunity.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesStatus && matchesType && matchesLevel && matchesLocation;
    });
  }, [opportunities, searchTerm, selectedStatus, selectedType, selectedLevel, selectedLocation]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedType('');
    setSelectedLevel('');
    setSelectedLocation('');
  };

  const handleViewDetails = (opportunity: Opportunity) => {
    navigate(`/admin/opportunities/${opportunity.id}`);
  };

  if (loading) {
    return (
      <div className="upcoming-events-page">
        <div className="page-header">
          <div className="page-title-section">
            <h1>Opportunity Board</h1>
            <p>Discover job opportunities, internships, and volunteer positions</p>
          </div>
        </div>
        <div className="page-content-simple">
          <div className="loading-container">
            <LoadingSpinner size="large" text="Loading opportunities..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="upcoming-events-page">
        <div className="page-header">
          <div className="page-title-section">
            <h1>Opportunity Board</h1>
            <p>Discover job opportunities, internships, and volunteer positions</p>
          </div>
        </div>
        <div className="page-content-simple">
          <ErrorMessage 
            error={error}
            title="Failed to load opportunities"
            showRetry={true}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="upcoming-events-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Opportunity Board</h1>
          <p>Discover job opportunities, internships, and volunteer positions from our partner organizations</p>
        </div>

        <div className="page-stats">
          <div className="stat-item">
            <span className="stat-value">{opportunities.length}</span>
            <span className="stat-label">Total Opportunities</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{filteredOpportunities.length}</span>
            <span className="stat-label">Showing</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {opportunities.filter(o => o.status === 'active').length}
            </span>
            <span className="stat-label">Active</span>
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
              placeholder="Search opportunities..."
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
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {availableStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                {availableLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>

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
            </div>

            {hasActiveFilters && (
              <button
                className="clear-filters-btn"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div className={`events-grid ${viewMode}`}>
          {filteredOpportunities.length === 0 ? (
            <div className="empty-state">
              <h3>No opportunities found</h3>
              <p>Try adjusting your filters or search terms to see more results.</p>
              {hasActiveFilters && (
                <button
                  className="btn btn-outline"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredOpportunities.map(opportunity => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onViewDetails={handleViewDetails}
                compact={viewMode === 'list'}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}