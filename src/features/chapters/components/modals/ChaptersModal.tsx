import React, { useState, useMemo } from 'react';
import { useFilters, useBulkActions, useFilteredData } from '../../../../hooks';
import { formatDate, getStatusBadgeClass } from '../../../../utils';

interface Chapter {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'pending';
  performance: 'high' | 'medium' | 'low';
  leadName: string;
  memberCount: number;
  engagementRate: number;
  eventsThisMonth: number;
  sponsor?: string;
  isSponsored: boolean;
  createdAt: string;
}

interface ChaptersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditChapter: (chapterId: string) => void;
  onCreateChapter?: () => void;
}

// Mock data - in real app this would come from API
const mockChapters: Chapter[] = [
  {
    id: '1',
    name: 'Cape Town Chapter',
    location: 'Cape Town, Western Cape',
    status: 'active',
    performance: 'high',
    leadName: 'Sarah Mthembu',
    memberCount: 247,
    engagementRate: 78,
    eventsThisMonth: 4,
    sponsor: 'Telkom',
    isSponsored: true,
    createdAt: '2023-03-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Johannesburg Chapter',
    location: 'Johannesburg, Gauteng',
    status: 'active',
    performance: 'high',
    leadName: 'Michael Chen',
    memberCount: 189,
    engagementRate: 82,
    eventsThisMonth: 3,
    sponsor: 'CompTIA',
    isSponsored: true,
    createdAt: '2023-01-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Durban Chapter',
    location: 'Durban, KwaZulu-Natal',
    status: 'active',
    performance: 'medium',
    leadName: 'Aisha Hassan',
    memberCount: 156,
    engagementRate: 65,
    eventsThisMonth: 2,
    isSponsored: false,
    createdAt: '2023-06-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'Pretoria Chapter',
    location: 'Pretoria, Gauteng',
    status: 'pending',
    performance: 'low',
    leadName: 'James Wilson',
    memberCount: 89,
    engagementRate: 45,
    eventsThisMonth: 1,
    isSponsored: false,
    createdAt: '2024-01-05T16:45:00Z',
  },
];

export function ChaptersModal({
  isOpen,
  onClose,
  onEditChapter,
  onCreateChapter,
}: ChaptersModalProps) {
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

  const filteredChapters = useFilteredData(mockChapters, filters, [
    'name',
    'location',
    'leadName',
  ]);

  const summaryStats = useMemo(() => {
    return {
      total: mockChapters.length,
      active: mockChapters.filter(c => c.status === 'active').length,
      pending: mockChapters.filter(c => c.status === 'pending').length,
      sponsored: mockChapters.filter(c => c.isSponsored).length,
      totalMembers: mockChapters.reduce((sum, c) => sum + c.memberCount, 0),
    };
  }, []);

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
      case 'deactivate':
        alert(`Deactivating chapter ${chapterId}`);
        break;
      case 'analytics':
        alert(`Viewing analytics for chapter ${chapterId}`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this chapter?')) {
          alert(`Deleting chapter ${chapterId}`);
        }
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

  const getPerformanceBadgeClass = (performance: string) => {
    switch (performance) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'danger';
      default:
        return 'secondary';
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
              <div className="summary-value">{summaryStats.sponsored}</div>
              <div className="summary-label">Sponsored</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{summaryStats.totalMembers}</div>
              <div className="summary-label">Total Members</div>
            </div>
          </div>

          {/* Chapter Filters */}
          <div className="chapter-filters">
            <div className="filter-group">
              <select
                className="filter-select"
                value={filters.status || ''}
                onChange={e =>
                  updateFilters({ status: e.target.value || undefined })
                }
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="filter-group">
              <select
                className="filter-select"
                value={filters.performance || ''}
                onChange={e =>
                  updateFilters({ performance: e.target.value || undefined })
                }
              >
                <option value="">All Performance</option>
                <option value="high">High Performance</option>
                <option value="medium">Medium Performance</option>
                <option value="low">Low Performance</option>
              </select>
            </div>
            <div className="filter-group">
              <input
                type="text"
                className="search-input"
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
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate Selected
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
            {filteredChapters.map(chapter => (
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
                    👤 Led by {chapter.leadName}
                  </div>

                  <div className="chapter-card-stats">
                    <div className="chapter-stat">
                      <div className="chapter-stat-icon"></div>
                      {chapter.memberCount} Members
                    </div>
                    <div className="chapter-stat">
                      <div className="chapter-stat-icon"></div>
                      {chapter.engagementRate}% Engagement
                    </div>
                    <div className="chapter-stat">
                      <div className="chapter-stat-icon"></div>
                      {chapter.eventsThisMonth} Events This Month
                    </div>
                  </div>

                  <div className="chapter-card-badges">
                    <span className={`chapter-badge ${chapter.status}`}>
                      {chapter.status.charAt(0).toUpperCase() +
                        chapter.status.slice(1)}
                    </span>
                    <span
                      className={`chapter-badge ${getPerformanceBadgeClass(chapter.performance)}`}
                    >
                      {chapter.performance.charAt(0).toUpperCase() +
                        chapter.performance.slice(1)}{' '}
                      Performance
                    </span>
                    {chapter.isSponsored && (
                      <span className="chapter-badge sponsored">
                        Sponsored {chapter.sponsor && `by ${chapter.sponsor}`}
                      </span>
                    )}
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
                      onClick={() =>
                        handleChapterAction('analytics', chapter.id)
                      }
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
                        onClick={() =>
                          handleChapterAction('deactivate', chapter.id)
                        }
                      >
                        ⏸️ Deactivate
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
              </div>
            ))}
          </div>

          {filteredChapters.length === 0 && (
            <div className="no-chapters">
              <p>No chapters found matching your criteria.</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
