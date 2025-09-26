import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpotlightsService } from '../../services/spotlightsService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Spotlight, FilterState } from '../../types';
import '../../styles/upcoming-events-page.css';

interface SpotlightCardProps {
  spotlight: Spotlight;
  onViewDetails: (spotlight: Spotlight) => void;
  compact?: boolean;
}

function SpotlightCard({ spotlight, onViewDetails, compact = false }: SpotlightCardProps) {
  // Helper function to get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published': return 'status-badge success';
      case 'draft': return 'status-badge warning';
      case 'scheduled': return 'status-badge info';
      case 'archived': return 'status-badge error';
      default: return 'status-badge info';
    }
  };

  // Helper function to get type display name
  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'success_story': return 'Success Story';
      case 'achievement': return 'Achievement';
      case 'interview': return 'Interview';
      case 'career_milestone': return 'Career Milestone';
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Format view count
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className={`event-card ${compact ? 'compact' : ''}`}>
      <div className="event-header">
        <div className="event-title-section">
          <h3 className="event-title">{spotlight.title}</h3>
          <div className="event-meta">
            <span className="event-location">👤 {spotlight.featuredAlumniName}</span>
            <span className={getStatusBadgeClass(spotlight.status)}>
              {spotlight.status}
            </span>
          </div>
        </div>
        <div className="event-stats">
          <div className="stat-item">
            <span className="stat-value">{formatCount(spotlight.viewCount || 0)}</span>
            <span className="stat-label">Views</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{spotlight.likeCount || 0}</span>
            <span className="stat-label">Likes</span>
          </div>
        </div>
      </div>

      <div className="event-body">
        <p className="event-description">
          {spotlight.content?.substring(0, 200)}...
        </p>
        
        <div className="event-details">
          <div className="detail-row">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{getTypeDisplayName(spotlight.type)}</span>
          </div>
          
          {(spotlight as any).featuredAlumniTitle && (
            <div className="detail-row">
              <span className="detail-label">Position:</span>
              <span className="detail-value">{(spotlight as any).featuredAlumniTitle}</span>
            </div>
          )}
          
          <div className="detail-row">
            <span className="detail-label">Engagement:</span>
            <span className="detail-value">
              {spotlight.shareCount || 0} shares • {spotlight.commentCount || 0} comments
            </span>
          </div>

          {spotlight.publishedDate && (
            <div className="detail-row">
              <span className="detail-label">Published:</span>
              <span className="detail-value">
                {new Date(spotlight.publishedDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="event-tags">
          {spotlight.tags?.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          )) || (
            <>
              <span className="tag">Alumni</span>
              <span className="tag">Success</span>
            </>
          )}
        </div>
      </div>

      <div className="event-footer">
        <button
          className="btn btn-outline"
          onClick={() => onViewDetails(spotlight)}
        >
          Read More
        </button>
        
        {spotlight.status === 'published' && (
          <button className="btn btn-primary">
            Share Story
          </button>
        )}
      </div>
    </div>
  );
}

export function AlumniSpotlightsPage() {
  const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Fetch spotlights from API
  useEffect(() => {
    const fetchSpotlights = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching spotlights...');
        const response = await SpotlightsService.getSpotlights(1, 100);

        if (response.success && response.data) {
          setSpotlights(response.data);
          console.log('✅ Spotlights loaded:', response.data.length);
        } else {
          throw new Error(response.message || 'Failed to fetch spotlights');
        }
      } catch (err) {
        console.error('❌ Error fetching spotlights:', err);
        setError(err instanceof Error ? err.message : 'Failed to load spotlights');
      } finally {
        setLoading(false);
      }
    };

    fetchSpotlights();
  }, []);

  // Filter spotlights based on search and filters
  const filteredSpotlights = useMemo(() => {
    return spotlights.filter(spotlight => {
      const matchesSearch = 
        searchTerm === '' ||
        spotlight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spotlight.featuredAlumniName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spotlight.content?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === '' || spotlight.status === selectedStatus;
      const matchesType = selectedType === '' || spotlight.type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [spotlights, searchTerm, selectedStatus, selectedType]);

  // Get available filter options
  const availableStatuses = useMemo(() => {
    const statuses = Array.from(new Set(spotlights.map(spotlight => spotlight.status)));
    return statuses.sort();
  }, [spotlights]);

  const availableTypes = useMemo(() => {
    const types = Array.from(new Set(spotlights.map(spotlight => spotlight.type)));
    return types.sort();
  }, [spotlights]);

  // Check if filters are active
  const hasActiveFilters = searchTerm || selectedStatus || selectedType;

  // Handle view spotlight details
  const handleViewDetails = (spotlight: Spotlight) => {
    console.log('🔍 Opening spotlight details for:', spotlight.title);
    // Navigate to spotlight details page (if exists)
    navigate(`/dashboard/spotlights/${spotlight.id}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedType('');
  };

  if (loading) {
    return (
      <div className="upcoming-events-page">
        <div className="page-header">
          <div className="page-title-section">
            <h1>Alumni Spotlights</h1>
            <p>Discover inspiring alumni success stories</p>
          </div>
        </div>
        <div className="page-content-simple">
          <div className="loading-container">
            <LoadingSpinner size="large" text="Loading spotlights..." />
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
            <h1>Alumni Spotlights</h1>
            <p>Discover inspiring alumni success stories</p>
          </div>
        </div>
        <div className="page-content-simple">
          <ErrorMessage 
            error={error}
            title="Failed to load spotlights"
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
          <h1>Alumni Spotlights</h1>
          <p>Inspiring stories of alumni achievements and career journeys</p>
        </div>

        <div className="page-stats">
          <div className="stat-item">
            <span className="stat-value">{spotlights.length}</span>
            <span className="stat-label">Total Stories</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{filteredSpotlights.length}</span>
            <span className="stat-label">Showing</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{spotlights.filter(s => s.status === 'published').length}</span>
            <span className="stat-label">Published</span>
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
              placeholder="Search spotlights..."
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
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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

        {/* Spotlights Container */}
        <div className={`events-container ${viewMode}`}>
          {filteredSpotlights.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <h3>No spotlights found</h3>
              <p>
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more spotlights.'
                  : 'There are no alumni spotlights available at the moment.'}
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
            filteredSpotlights.map(spotlight => (
              <SpotlightCard
                key={spotlight.id}
                spotlight={spotlight}
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