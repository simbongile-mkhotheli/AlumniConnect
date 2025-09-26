import React, { useState, useMemo } from 'react';
import { useFilters, useBulkActions, useFilteredData } from '../../hooks';
import { formatDate, getStatusBadgeClass } from '../../utils';

interface Spotlight {
  id: string;
  title: string;
  type:
    | 'success_story'
    | 'video_interview'
    | 'tutorial'
    | 'achievement'
    | 'announcement';
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  featuredAlumniName: string;
  content: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  shareCount: number;
  publishedDate?: string;
  createdAt: string;
}

interface SpotlightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSpotlight: (spotlightId: string) => void;
  onCreateSpotlight?: () => void;
}

// Mock data - in real app this would come from API
const mockSpotlights: Spotlight[] = [
  {
    id: '1',
    title: "From Student to Tech Leader: Sarah's Journey",
    type: 'success_story',
    status: 'published',
    featuredAlumniName: 'Sarah Mthembu',
    content:
      'Sarah shares her inspiring journey from computer science student to leading a team of 20+ developers at a major tech company.',
    tags: ['Leadership', 'Career Growth', 'Technology'],
    viewCount: 1247,
    likeCount: 89,
    shareCount: 34,
    publishedDate: '2025-01-15T10:00:00Z',
    createdAt: '2025-01-10T14:30:00Z',
  },
  {
    id: '2',
    title: 'Building a Fintech Startup: Lessons Learned',
    type: 'video_interview',
    status: 'published',
    featuredAlumniName: 'James Wilson',
    content:
      'In this 30-minute interview, James discusses the challenges and triumphs of building his fintech startup from the ground up.',
    tags: ['Entrepreneurship', 'FinTech', 'Startup'],
    viewCount: 892,
    likeCount: 67,
    shareCount: 28,
    publishedDate: '2025-01-12T16:00:00Z',
    createdAt: '2025-01-08T11:15:00Z',
  },
  {
    id: '3',
    title: 'Mastering React Performance Optimization',
    type: 'tutorial',
    status: 'draft',
    featuredAlumniName: 'Michael Chen',
    content:
      'A comprehensive guide to optimizing React applications for better performance and user experience.',
    tags: ['React', 'Performance', 'Tutorial'],
    viewCount: 0,
    likeCount: 0,
    shareCount: 0,
    createdAt: '2025-01-18T09:45:00Z',
  },
  {
    id: '4',
    title: 'Alumni Achievement: Patent Granted for AI Innovation',
    type: 'achievement',
    status: 'scheduled',
    featuredAlumniName: 'Dr. Aisha Hassan',
    content:
      'Dr. Hassan has been granted a patent for her groundbreaking work in AI-powered medical diagnostics.',
    tags: ['AI', 'Healthcare', 'Innovation', 'Patent'],
    viewCount: 0,
    likeCount: 0,
    shareCount: 0,
    createdAt: '2025-01-20T13:20:00Z',
  },
];

export function SpotlightsModal({
  isOpen,
  onClose,
  onEditSpotlight,
  onCreateSpotlight,
}: SpotlightsModalProps) {
  const { filters, updateFilters, updateSearch, clearFilters } =
    useFilters('spotlights');
  const {
    selectedItems,
    isVisible,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelections,
    performBulkAction,
  } = useBulkActions('spotlights');

  const filteredSpotlights = useFilteredData(mockSpotlights, filters, [
    'title',
    'featuredAlumniName',
    'content',
  ]);

  const summaryStats = useMemo(() => {
    return {
      total: mockSpotlights.length,
      published: mockSpotlights.filter(s => s.status === 'published').length,
      draft: mockSpotlights.filter(s => s.status === 'draft').length,
      scheduled: mockSpotlights.filter(s => s.status === 'scheduled').length,
      totalViews: mockSpotlights.reduce((sum, s) => sum + s.viewCount, 0),
    };
  }, []);

  const handleSelectAll = () => {
    const allIds = filteredSpotlights.map(spotlight => spotlight.id);
    selectAll(allIds);
  };

  const handleBulkAction = (action: string) => {
    performBulkAction(action);
    alert(`Performing ${action} on ${selectedCount} selected spotlights`);
  };

  const handleSpotlightAction = (action: string, spotlightId: string) => {
    console.log(`${action} spotlight:`, spotlightId);

    switch (action) {
      case 'edit':
        onEditSpotlight(spotlightId);
        break;
      case 'view':
        alert(`Viewing spotlight ${spotlightId}`);
        break;
      case 'publish':
        alert(`Publishing spotlight ${spotlightId}`);
        break;
      case 'feature':
        alert(`Featuring spotlight ${spotlightId}`);
        break;
      case 'archive':
        alert(`Archiving spotlight ${spotlightId}`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this spotlight?')) {
          alert(`Deleting spotlight ${spotlightId}`);
        }
        break;
      case 'analytics':
        alert(`Viewing analytics for spotlight ${spotlightId}`);
        break;
      default:
        alert(`Action ${action} for spotlight ${spotlightId}`);
    }
  };

  const handleCreateSpotlight = () => {
    if (onCreateSpotlight) {
      onCreateSpotlight();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success_story':
        return '👤';
      case 'video_interview':
        return '🎤';
      case 'tutorial':
        return '📚';
      case 'achievement':
        return '🏆';
      case 'announcement':
        return '📢';
      default:
        return '📄';
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'success_story':
        return 'Success Story';
      case 'video_interview':
        return 'Video Interview';
      case 'tutorial':
        return 'Tutorial';
      case 'achievement':
        return 'Achievement';
      case 'announcement':
        return 'Announcement';
      default:
        return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="spotlights-overlay active">
      <div className="spotlights-manager">
        <div className="spotlights-header">
          <h2>Spotlights Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="admin-card-action primary"
              onClick={handleCreateSpotlight}
              title="Create New Spotlight"
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
              ➕ Create Spotlight
            </button>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="spotlights-body">
          {/* Spotlights Summary */}
          <div className="spotlights-summary">
            <div className="spotlight-summary-card">
              <div className="spotlight-summary-value">
                {summaryStats.total}
              </div>
              <div className="spotlight-summary-label">Total Spotlights</div>
            </div>
            <div className="spotlight-summary-card">
              <div className="spotlight-summary-value">
                {summaryStats.published}
              </div>
              <div className="spotlight-summary-label">Published</div>
            </div>
            <div className="spotlight-summary-card">
              <div className="spotlight-summary-value">
                {summaryStats.draft}
              </div>
              <div className="spotlight-summary-label">Draft</div>
            </div>
            <div className="spotlight-summary-card">
              <div className="spotlight-summary-value">
                {summaryStats.scheduled}
              </div>
              <div className="spotlight-summary-label">Scheduled</div>
            </div>
            <div className="spotlight-summary-card">
              <div className="spotlight-summary-value">
                {summaryStats.totalViews}
              </div>
              <div className="spotlight-summary-label">Total Views</div>
            </div>
          </div>

          {/* Spotlight Filters */}
          <div className="spotlight-filters">
            <div className="spotlight-filter-group">
              <select
                className="spotlight-filter-select"
                value={filters.status || ''}
                onChange={e =>
                  updateFilters({ status: e.target.value || undefined })
                }
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="spotlight-filter-group">
              <select
                className="spotlight-filter-select"
                value={filters.type || ''}
                onChange={e =>
                  updateFilters({ type: e.target.value || undefined })
                }
              >
                <option value="">All Types</option>
                <option value="success_story">Success Story</option>
                <option value="video_interview">Video Interview</option>
                <option value="tutorial">Tutorial</option>
                <option value="achievement">Achievement</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
            <div className="spotlight-filter-group">
              <input
                type="text"
                className="spotlight-search-input"
                placeholder="Search spotlights..."
                value={filters.search || ''}
                onChange={e => updateSearch(e.target.value)}
              />
            </div>
            <button className="filter-clear-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>

          {/* Bulk Actions */}
          {isVisible && (
            <div className="bulk-actions">
              <div className="bulk-selection">
                <input
                  type="checkbox"
                  id="selectAllSpotlights"
                  checked={selectedCount === filteredSpotlights.length}
                  onChange={handleSelectAll}
                />
                <label htmlFor="selectAllSpotlights">
                  {selectedCount} of {filteredSpotlights.length} selected
                </label>
              </div>
              <div className="bulk-buttons">
                <button
                  className="bulk-btn publish"
                  onClick={() => handleBulkAction('publish')}
                >
                  Publish Selected
                </button>
                <button
                  className="bulk-btn draft"
                  onClick={() => handleBulkAction('feature')}
                >
                  Feature Selected
                </button>
                <button
                  className="bulk-btn delete"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Spotlights Grid */}
          <div className="spotlights-grid">
            {filteredSpotlights.map(spotlight => (
              <div
                key={spotlight.id}
                className="spotlight-card"
                data-status={spotlight.status}
              >
                <input
                  type="checkbox"
                  className="spotlight-checkbox"
                  checked={selectedItems.has(spotlight.id)}
                  onChange={() => toggleSelection(spotlight.id)}
                />

                <div className="spotlight-image">
                  <div className="spotlight-image-placeholder">
                    {getTypeIcon(spotlight.type)}
                  </div>
                  <div className={`spotlight-status ${spotlight.status}`}>
                    {spotlight.status.charAt(0).toUpperCase() +
                      spotlight.status.slice(1)}
                  </div>
                </div>

                <div className="spotlight-card-content">
                  <div className="spotlight-card-header">
                    <div className="spotlight-title">{spotlight.title}</div>
                    <div className="spotlight-subtitle">
                      {getTypeDisplayName(spotlight.type)} •{' '}
                      {spotlight.featuredAlumniName}
                    </div>
                  </div>

                  <div className="spotlight-excerpt">{spotlight.content}</div>

                  <div className="spotlight-meta">
                    <div className="spotlight-meta-item">
                      📅 {formatDate(spotlight.createdAt)}
                    </div>
                    {spotlight.publishedDate && (
                      <div className="spotlight-meta-item">
                        🚀 Published {formatDate(spotlight.publishedDate)}
                      </div>
                    )}
                  </div>

                  <div className="spotlight-tags">
                    {spotlight.tags.map((tag, index) => (
                      <span key={index} className="spotlight-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="spotlight-stats">
                    <div className="spotlight-stat">
                      <div className="spotlight-stat-icon"></div>
                      {spotlight.viewCount} Views
                    </div>
                    <div className="spotlight-stat">
                      <div className="spotlight-stat-icon"></div>
                      {spotlight.likeCount} Likes
                    </div>
                    <div className="spotlight-stat">
                      <div className="spotlight-stat-icon"></div>
                      {spotlight.shareCount} Shares
                    </div>
                  </div>

                  <div className="spotlight-actions">
                    <button
                      className="spotlight-action-btn primary"
                      onClick={() =>
                        handleSpotlightAction('edit', spotlight.id)
                      }
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="spotlight-action-btn secondary"
                      onClick={() =>
                        handleSpotlightAction('view', spotlight.id)
                      }
                    >
                      👁️ View
                    </button>
                    <button
                      className="spotlight-action-btn secondary"
                      onClick={() =>
                        handleSpotlightAction('analytics', spotlight.id)
                      }
                    >
                      📊 Analytics
                    </button>
                    {spotlight.status === 'draft' && (
                      <button
                        className="spotlight-action-btn primary"
                        onClick={() =>
                          handleSpotlightAction('publish', spotlight.id)
                        }
                      >
                        🚀 Publish
                      </button>
                    )}
                    {spotlight.status === 'published' && (
                      <button
                        className="spotlight-action-btn secondary"
                        onClick={() =>
                          handleSpotlightAction('feature', spotlight.id)
                        }
                      >
                        ⭐ Feature
                      </button>
                    )}
                    <button
                      className="spotlight-action-btn danger"
                      onClick={() =>
                        handleSpotlightAction('delete', spotlight.id)
                      }
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSpotlights.length === 0 && (
            <div className="no-spotlights">
              <p>No spotlights found matching your criteria.</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
