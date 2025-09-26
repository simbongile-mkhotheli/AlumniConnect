import React, { useState, useMemo, useEffect } from 'react';
import { useFilters, useBulkActions, useFilteredData } from '../../hooks';
import { formatDate, getStatusBadgeClass } from '../../utils';
import { ChaptersService } from '../../services/chaptersService';
import { SponsorsService } from '../../services/sponsorsService';
import type { Chapter as ChapterType, Sponsor } from '../../types';

interface RegionalChaptersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditChapter: (chapterId: string) => void;
  onCreateChapter?: () => void;
}

export function RegionalChaptersModal({
  isOpen,
  onClose,
  onEditChapter,
  onCreateChapter,
}: RegionalChaptersModalProps) {
  const [chapters, setChapters] = useState<ChapterType[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get sponsor name by ID
  const getSponsorName = (sponsorId: string): string => {
    const sponsor = sponsors.find(s => s.id === sponsorId);
    return sponsor?.name || sponsorId; // Fallback to ID if sponsor not found
  };

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // Fetch both chapters and sponsors in parallel
          const [chaptersResponse, sponsorsResponse] = await Promise.all([
            ChaptersService.getChapters(1, 100),
            SponsorsService.getSponsors(1, 100)
          ]);

          if (chaptersResponse.success) {
            setChapters(chaptersResponse.data || []);
          } else {
            setError(typeof chaptersResponse.error === 'string' ? chaptersResponse.error : 'Failed to fetch chapters');
            return;
          }

          if (sponsorsResponse.success) {
            setSponsors(sponsorsResponse.data || []);
          } else {
            console.warn('Failed to fetch sponsors:', sponsorsResponse.error);
            // Don't fail the whole component if sponsors fail to load
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen]);
  const { filters, updateFilters, updateSearch, clearFilters } =
    useFilters('chapters');
  const {
    selectedItems,
    isVisible,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelections,
    performBulkAction,
  } = useBulkActions('chapters');

  const filteredChapters = useFilteredData(chapters, filters, [
    'name',
    'location',
    'leadName',
  ]);

  const summaryStats = useMemo(() => {
    return {
      total: chapters.length,
      active: chapters.filter((c: ChapterType) => c.status === 'active').length,
      pending: chapters.filter((c: ChapterType) => c.status === 'pending').length,
      totalMembers: chapters.reduce((sum: number, c: ChapterType) => sum + (c.memberCount || c.membersCount || 0), 0),
      totalEvents: chapters.reduce((sum: number, c: ChapterType) => sum + (c.eventsCount || 0), 0),
    };
  }, [chapters]);

  const handleSelectAll = () => {
    const allIds = filteredChapters.map(chapter => chapter.id);
    selectAll(allIds);
  };

  const handleBulkAction = (action: string) => {
    performBulkAction(action);
    alert(`Performing ${action} on ${selectedCount} selected chapters`);
  };

  const handleChapterAction = (action: string, chapterId: string) => {
    console.log(`${action} chapter:`, chapterId);

    switch (action) {
      case 'edit':
        onEditChapter(chapterId);
        break;
      case 'view':
        alert(`Viewing chapter ${chapterId}`);
        break;
      case 'activate':
        alert(`Activating chapter ${chapterId}`);
        break;
      case 'suspend':
        alert(`Suspending chapter ${chapterId}`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this chapter?')) {
          alert(`Deleting chapter ${chapterId}`);
        }
        break;
      case 'analytics':
        alert(`Viewing analytics for chapter ${chapterId}`);
        break;
      default:
        alert(`Action ${action} for chapter ${chapterId}`);
    }
  };

  const handleCreateChapter = () => {
    if (onCreateChapter) {
      onCreateChapter();
    }
  };

  const getEngagementIcon = (engagementRate?: number) => {
    if (!engagementRate) return '📊';
    if (engagementRate >= 80) return '🔥';
    if (engagementRate >= 60) return '📈';
    return '�';
  };

  const getEngagementLevel = (engagementRate?: number) => {
    if (!engagementRate) return 'Unknown';
    if (engagementRate >= 80) return 'high';
    if (engagementRate >= 60) return 'medium';
    return 'low';
  };

  const getEngagementDisplayName = (engagementRate?: number) => {
    const level = getEngagementLevel(engagementRate);
    switch (level) {
      case 'high':
        return 'High Engagement';
      case 'medium':
        return 'Medium Engagement';
      case 'low':
        return 'Low Engagement';
      default:
        return 'Unknown';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chapters-overlay active">
      <div className="chapters-manager">
        <div className="chapters-header">
          <h2>Regional Chapters Manager</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="admin-card-action primary"
              onClick={handleCreateChapter}
              title="Create New Chapter"
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
              ➕ Create Chapter
            </button>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="chapters-body">
          {/* Chapters Summary */}
          <div className="chapters-summary">
            <div className="summary-card">
              <div className="summary-value">{summaryStats.total}</div>
              <div className="summary-label">Total Chapters</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.active}</div>
              <div className="summary-label">Active</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.pending}</div>
              <div className="summary-label">Pending</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.totalMembers}</div>
              <div className="summary-label">Total Members</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.totalEvents}</div>
              <div className="summary-label">Total Events</div>
            </div>
          </div>

          {/* Chapter Filters */}
          <div className="chapter-filters">
            <div className="filter-group">
              <select
                value={filters.status || ''}
                onChange={e =>
                  updateFilters({ status: e.target.value || undefined })
                }
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="filter-group">
              <select
                value={filters.location || ''}
                onChange={e =>
                  updateFilters({ location: e.target.value || undefined })
                }
              >
                <option value="">All Locations</option>
                <option value="Cape Town">Cape Town</option>
                <option value="Johannesburg">Johannesburg</option>
                <option value="Durban">Durban</option>
                <option value="Pretoria">Pretoria</option>
              </select>
            </div>
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search chapters..."
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
                  id="selectAllChapters"
                  checked={selectedCount === filteredChapters.length}
                  onChange={handleSelectAll}
                />
                <label htmlFor="selectAllChapters">
                  {selectedCount} of {filteredChapters.length} selected
                </label>
              </div>
              <div className="bulk-buttons">
                <button
                  className="bulk-btn publish"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate Selected
                </button>
                <button
                  className="bulk-btn draft"
                  onClick={() => handleBulkAction('suspend')}
                >
                  Suspend Selected
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

          {/* Chapters Grid */}
          <div className="chapters-grid">
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                Loading chapters...
              </div>
            ) : error ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#dc2626' }}>
                Error: {error}
              </div>
            ) : filteredChapters.length === 0 && chapters.length > 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                No chapters match the current filters.
              </div>
            ) : filteredChapters.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                No chapters found.
              </div>
            ) : (
              filteredChapters.map(chapter => (
              <div
                key={chapter.id}
                className="chapter-card"
                data-status={chapter.status}
              >
                <input
                  type="checkbox"
                  className="chapter-checkbox"
                  checked={selectedItems.has(chapter.id)}
                  onChange={() => toggleSelection(chapter.id)}
                />

                <div className="chapter-card-header">
                  <div className="chapter-card-title">{chapter.name}</div>
                  <div className="chapter-card-location">
                    📍 {chapter.location}
                  </div>
                </div>

                <div className="chapter-card-body">
                  <div className="chapter-card-lead">
                    👤 Lead: {chapter.leadName || 'Not assigned'}
                  </div>

                  <div className="chapter-card-stats">
                    <div className="chapter-stat">
                      <div className="chapter-stat-icon">👥</div>
                      {chapter.memberCount || chapter.membersCount || 0} Members
                    </div>
                    <div className="chapter-stat">
                      <div className="chapter-stat-icon">📅</div>
                      {chapter.eventsThisMonth || 0} Events This Month
                    </div>
                    {chapter.createdAt && (
                      <div className="chapter-stat">
                        <div className="chapter-stat-icon">🏗️</div>
                        Founded {formatDate(chapter.createdAt)}
                      </div>
                    )}
                  </div>

                  <div className="chapter-card-badges">
                    <span
                      className={`status-badge ${getStatusBadgeClass(chapter.status)}`}
                    >
                      {chapter.status.charAt(0).toUpperCase() +
                        chapter.status.slice(1)}
                    </span>
                    {chapter.engagementRate && (
                      <span
                        className={`chapter-badge ${getEngagementLevel(chapter.engagementRate)}-performance`}
                      >
                        {getEngagementIcon(chapter.engagementRate)}{' '}
                        {getEngagementDisplayName(chapter.engagementRate)}
                      </span>
                    )}
                    {chapter.isSponsored && chapter.sponsor && (
                      <span className="chapter-badge sponsored">
                        💰 Sponsored by {getSponsorName(chapter.sponsor)}
                      </span>
                    )}
                  </div>

                  <div className="chapter-excerpt">
                    {chapter.description || 'No description available.'}
                  </div>
                </div>

                <div className="chapter-card-actions">
                  <button
                    className="chapter-action-btn primary"
                    onClick={() => handleChapterAction('edit', chapter.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="chapter-action-btn secondary"
                    onClick={() => handleChapterAction('view', chapter.id)}
                  >
                    👁️ View
                  </button>
                  <button
                    className="chapter-action-btn secondary"
                    onClick={() => handleChapterAction('analytics', chapter.id)}
                  >
                    📊 Analytics
                  </button>
                  {chapter.status === 'pending' && (
                    <button
                      className="chapter-action-btn primary"
                      onClick={() =>
                        handleChapterAction('activate', chapter.id)
                      }
                    >
                      ✅ Activate
                    </button>
                  )}
                  {chapter.status === 'active' && (
                    <button
                      className="chapter-action-btn secondary"
                      onClick={() => handleChapterAction('suspend', chapter.id)}
                    >
                      ⏸️ Suspend
                    </button>
                  )}
                  <button
                    className="chapter-action-btn danger"
                    onClick={() => handleChapterAction('delete', chapter.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
