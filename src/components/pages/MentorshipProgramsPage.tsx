import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MentorshipService } from '../../services/mentorshipService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Mentorship } from '../../types';
import '../../styles/upcoming-events-page.css';

interface MentorshipCardProps {
  mentorship: Mentorship;
  onViewDetails: (mentorship: Mentorship) => void;
  compact?: boolean;
}

function MentorshipCard({ mentorship, onViewDetails, compact = false }: MentorshipCardProps) {
  // Helper function to get status badge color
  const getStatusBadgeColor = (status: string | undefined): string => {
    if (!status) return 'info';
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'paused': return 'warning';
      case 'cancelled': return 'error';
      default: return 'info';
    }
  };

  // Helper function to get type icon
  const getTypeIcon = (type: string | undefined): string => {
    if (!type) return '🤝'; // Default icon for undefined type
    switch (type.toLowerCase()) {
      case 'technical': return '💻';
      case 'career': return '📈';
      case 'leadership': return '👑';
      case 'entrepreneurship': return '🚀';
      case 'general': return '🤝';
      default: return '🎯';
    }
  };

  // Format date
  const formatDate = (dateStr: string): string => {
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

  // Calculate progress percentage
  const getProgressPercentage = (): number => {
    if (!mentorship.sessionCount || mentorship.sessionCount === 0) return 0;
  return Math.round(((mentorship.completedSessions ?? 0) / mentorship.sessionCount) * 100);
  };

  return (
    <div className={`event-card ${compact ? 'compact' : ''}`}>
      <div className="event-header">
        <div className="event-title-section">
          <h3 className="event-title">{mentorship.title}</h3>
          <div className="event-meta">
            <span className="event-location">{getTypeIcon(mentorship.type)} {mentorship.type ? mentorship.type.charAt(0).toUpperCase() + mentorship.type.slice(1) : 'General'}</span>
            <span className="event-location">👤 {mentorship.mentorName}</span>
            <span className={`status-badge ${getStatusBadgeColor(mentorship.status)}`}>
              {mentorship.status ? mentorship.status.charAt(0).toUpperCase() + mentorship.status.slice(1) : 'Pending'}
            </span>
          </div>
        </div>
        <div className="event-stats">
          <div className="stat-item">
            <span className="stat-value">{mentorship.completedSessions ?? 0}/{mentorship.sessionCount}</span>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{getProgressPercentage()}%</span>
            <span className="stat-label">Progress</span>
          </div>
        </div>
      </div>

      <div className="event-body">
        <p className="event-description">{mentorship.description}</p>
        
        <div className="event-details">
          <div className="detail-row">
            <span className="detail-label">Mentor:</span>
            <span className="detail-value">{mentorship.mentorName}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Mentee:</span>
            <span className="detail-value">{mentorship.menteeName}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Started:</span>
            <span className="detail-value">{formatDate(mentorship.startDate)}</span>
          </div>

          {mentorship.nextSessionDate && (
            <div className="detail-row">
              <span className="detail-label">Next Session:</span>
              <span className="detail-value">{formatDate(mentorship.nextSessionDate)}</span>
            </div>
          )}

          {mentorship.meetingFrequency && (
            <div className="detail-row">
              <span className="detail-label">Frequency:</span>
              <span className="detail-value">{mentorship.meetingFrequency.charAt(0).toUpperCase() + mentorship.meetingFrequency.slice(1).replace('_', ' ')}</span>
            </div>
          )}
        </div>

        {mentorship.objectives && mentorship.objectives.length > 0 && (
          <div className="requirements-section">
            <h4>Objectives:</h4>
            <ul>
              {mentorship.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="event-tags">
          {mentorship.tags && mentorship.tags.length > 0 ? (
            mentorship.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))
          ) : (
            <>
              <span className="tag">Mentorship</span>
              <span className="tag">Professional Growth</span>
            </>
          )}
        </div>

        {/* Progress bar */}
        {mentorship.sessionCount > 0 && (
          <div className="progress-section" style={{ marginTop: '12px' }}>
            <div className="progress-bar-container" style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '4px', 
              overflow: 'hidden' 
            }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  height: '100%', 
                  backgroundColor: getStatusBadgeColor(mentorship.status) === 'success' ? '#10b981' : '#6366f1',
                  width: `${getProgressPercentage()}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="event-footer">
        <button
          className="btn btn-outline"
          onClick={() => onViewDetails(mentorship)}
        >
          View Details
        </button>
        
        {mentorship.status === 'active' && (
          <button className="btn btn-primary">
            Join Session
          </button>
        )}
        
        {mentorship.status === 'pending' && (
          <button className="btn btn-secondary">
            Accept Mentorship
          </button>
        )}

        {mentorship.mentorEmail && (
          <a 
            href={`mailto:${mentorship.mentorEmail}`}
            className="btn btn-secondary"
          >
            Contact Mentor
          </a>
        )}
      </div>
    </div>
  );
}

export function MentorshipProgramsPage() {
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentorships = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await MentorshipService.getMentorships();
        console.log('Mentorships data:', data);
        setMentorships(data.data || data);
      } catch (err) {
        console.error('Error fetching mentorships:', err);
        setError(err instanceof Error ? err.message : 'Failed to load mentorship programs');
      } finally {
        setLoading(false);
      }
    };

    fetchMentorships();
  }, []);

  // Get available filter options
  const availableStatuses = useMemo(() => {
    const statuses = Array.from(new Set(mentorships.map(mentorship => mentorship.status)));
    return statuses.sort();
  }, [mentorships]);

  const availableTypes = useMemo(() => {
    const types = Array.from(new Set(mentorships.map(mentorship => mentorship.type)));
    return types.sort();
  }, [mentorships]);

  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(mentorships.map(mentorship => mentorship.category).filter(Boolean)));
    return categories.sort();
  }, [mentorships]);

  // Check if filters are active
  const hasActiveFilters = searchTerm || selectedStatus || selectedType || selectedCategory;

  // Filter mentorships based on search and filters
  const filteredMentorships = useMemo(() => {
    return mentorships.filter(mentorship => {
      // Search filter
      const matchesSearch = 
        searchTerm === '' ||
        mentorship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentorship.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentorship.menteeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentorship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mentorship.tags && mentorship.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      // Status filter
      const matchesStatus = selectedStatus === '' || mentorship.status === selectedStatus;
      
      // Type filter
      const matchesType = selectedType === '' || mentorship.type === selectedType;
      
      // Category filter  
      const matchesCategory = selectedCategory === '' || mentorship.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });
  }, [mentorships, searchTerm, selectedStatus, selectedType, selectedCategory]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedType('');
    setSelectedCategory('');
  };

  const handleViewDetails = (mentorship: Mentorship) => {
    navigate(`/admin/mentorships/${mentorship.id}`);
  };

  if (loading) {
    return (
      <div className="upcoming-events-page">
        <div className="page-header">
          <div className="page-title-section">
            <h1>Mentorship Programs</h1>
            <p>Connect with experienced professionals through our mentorship platform</p>
          </div>
        </div>
        <div className="page-content-simple">
          <div className="loading-container">
            <LoadingSpinner size="large" text="Loading mentorship programs..." />
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
            <h1>Mentorship Programs</h1>
            <p>Connect with experienced professionals through our mentorship platform</p>
          </div>
        </div>
        <div className="page-content-simple">
          <ErrorMessage 
            error={error}
            title="Failed to load mentorship programs"
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
          <h1>Mentorship Programs</h1>
          <p>Connect with experienced professionals and grow your career through our comprehensive mentorship platform</p>
        </div>

        <div className="page-stats">
          <div className="stat-item">
            <span className="stat-value">{mentorships.length}</span>
            <span className="stat-label">Total Programs</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{filteredMentorships.length}</span>
            <span className="stat-label">Showing</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {mentorships.filter(m => m.status === 'active').length}
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
              placeholder="Search mentorship programs..."
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

              {availableCategories.length > 0 && (
                <select
                  className="filter-select"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              )}
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
          {filteredMentorships.length === 0 ? (
            <div className="empty-state">
              <h3>No mentorship programs found</h3>
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
            filteredMentorships.map(mentorship => (
              <MentorshipCard
                key={mentorship.id}
                mentorship={mentorship}
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