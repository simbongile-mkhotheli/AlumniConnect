import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChaptersService } from '@features/chapters/services';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import type { Chapter, FilterState } from '@features/chapters/types';
import '../../../../styles/upcoming-events-page.css';

interface ChapterCardProps {
  chapter: Chapter;
  onViewDetails: (chapter: Chapter) => void;
  compact?: boolean;
}

function ChapterCard({ chapter, onViewDetails, compact = false }: ChapterCardProps) {
  // Helper function to get sponsor display name
  const getSponsorName = (chapter: Chapter): string => {
    if (chapter.sponsor) {
      switch (chapter.sponsor.toLowerCase()) {
        case 'telkom': return 'Telkom';
        case 'comptia': return 'CompTIA';
        case 'iweb': return 'iWeb';
        case 'github': return 'GitHub';
        case 'microsoft': return 'Microsoft';
        default: return chapter.sponsor;
      }
    }
    return 'Community Sponsored';
  };

  // Helper function to get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-badge success';
      case 'inactive': return 'status-badge error';
      case 'pending': return 'status-badge warning';
      default: return 'status-badge info';
    }
  };

  // Helper function to get performance indicator
  const getPerformanceColor = (performance: string) => {
    switch (performance?.toLowerCase()) {
      case 'excellent': return '#10b981';
      case 'good': return '#f59e0b';
      case 'medium': return '#6b7280';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`event-card ${compact ? 'compact' : ''}`}>
      <div className="event-header">
        <div className="event-title-section">
          <h3 className="event-title">{chapter.name}</h3>
          <div className="event-meta">
            <span className="event-location">📍 {chapter.location}</span>
            <span className={getStatusBadgeClass(chapter.status)}>
              {chapter.status}
            </span>
          </div>
        </div>
        <div className="event-stats">
          <div className="stat-item">
            <span className="stat-value">{chapter.membersCount || 0}</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{chapter.eventsCount || 0}</span>
            <span className="stat-label">Events</span>
          </div>
        </div>
      </div>

      <div className="event-body">
        <p className="event-description">
          {chapter.description || `Join the ${chapter.name} community for networking, professional development, and local events.`}
        </p>
        
        <div className="event-details">
          <div className="detail-row">
            <span className="detail-label">Sponsor:</span>
            <span className="detail-value sponsor-name">{getSponsorName(chapter)}</span>
          </div>
          
          {chapter.leadName && (
            <div className="detail-row">
              <span className="detail-label">Chapter Lead:</span>
              <span className="detail-value">{chapter.leadName}</span>
            </div>
          )}
          
          {(chapter as any).performance && (
            <div className="detail-row">
              <span className="detail-label">Performance:</span>
              <span 
                className="detail-value performance-indicator"
                style={{ color: getPerformanceColor((chapter as any).performance) }}
              >
                {(chapter as any).performance}
              </span>
            </div>
          )}

          {(chapter as any).engagementRate && (
            <div className="detail-row">
              <span className="detail-label">Engagement:</span>
              <span className="detail-value">{(chapter as any).engagementRate}%</span>
            </div>
          )}
        </div>

        <div className="event-tags">
          {chapter.tags?.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          )) || (
            <>
              <span className="tag">Networking</span>
              <span className="tag">Community</span>
            </>
          )}
        </div>
      </div>

      <div className="event-footer">
        <button
          className="btn btn-outline"
          onClick={() => onViewDetails(chapter)}
        >
          View Details
        </button>
        
        {chapter.status === 'active' && (
          <button className="btn btn-primary">
            Join Chapter
          </button>
        )}
      </div>
    </div>
  );
}

export function RegionalChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Fetch chapters from API
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching chapters...');
        const response = await ChaptersService.getChapters(1, 100);

        if (response.success && response.data) {
          setChapters(response.data);
          console.log('✅ Chapters loaded:', response.data.length);
        } else {
          throw new Error(response.message || 'Failed to fetch chapters');
        }
      } catch (err) {
        console.error('❌ Error fetching chapters:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chapters');
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  // Filter chapters based on search and filters
  const filteredChapters = useMemo(() => {
    return chapters.filter(chapter => {
      const matchesSearch = 
        searchTerm === '' ||
        chapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === '' || chapter.status === selectedStatus;
      const matchesLocation = selectedLocation === '' || 
        chapter.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [chapters, searchTerm, selectedStatus, selectedLocation]);

  // Get available filter options
  const availableStatuses = useMemo(() => {
    const statuses = Array.from(new Set(chapters.map(chapter => chapter.status)));
    return statuses.sort();
  }, [chapters]);

  const availableLocations = useMemo(() => {
    const locations = Array.from(new Set(chapters.map(chapter => {
      // Extract city from location string
      return chapter.location.split(',')[0].trim();
    })));
    return locations.sort();
  }, [chapters]);

  // Check if filters are active
  const hasActiveFilters = searchTerm || selectedStatus || selectedLocation;

  // Handle view chapter details
  const handleViewDetails = (chapter: Chapter) => {
    console.log('🔍 Opening chapter details for:', chapter.name);
    // Navigate to chapter details page
    navigate(`/dashboard/chapters/${chapter.id}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedLocation('');
  };

  if (loading) {
    return (
      <div className="upcoming-events-page">
        <div className="page-header">
          <div className="page-title-section">
            <h1>Regional Chapters</h1>
            <p>Connect with local alumni communities</p>
          </div>
        </div>
        <div className="page-content-simple">
          <div className="loading-container">
            <LoadingSpinner size="large" text="Loading chapters..." />
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
            <h1>Regional Chapters</h1>
            <p>Connect with local alumni communities</p>
          </div>
        </div>
        <div className="page-content-simple">
          <ErrorMessage 
            error={error}
            title="Failed to load chapters"
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
          <h1>Regional Chapters</h1>
          <p>Connect with local alumni communities and join chapter activities</p>
        </div>

        <div className="page-stats">
          <div className="stat-item">
            <span className="stat-value">{chapters.length}</span>
            <span className="stat-label">Total Chapters</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{filteredChapters.length}</span>
            <span className="stat-label">Showing</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{chapters.filter(c => c.status === 'active').length}</span>
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
              placeholder="Search chapters..."
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

        {/* Chapters Container */}
        <div className={`events-container ${viewMode}`}>
          {filteredChapters.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌍</div>
              <h3>No chapters found</h3>
              <p>
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more chapters.'
                  : 'There are no regional chapters available at the moment.'}
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
            filteredChapters.map(chapter => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
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