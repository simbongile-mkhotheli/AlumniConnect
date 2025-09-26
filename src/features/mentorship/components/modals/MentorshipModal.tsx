import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters, useBulkActions, useFilteredData } from '../../hooks';
import { formatDate, getStatusBadgeClass, filterItems } from '../../utils';
import { MentorshipService } from '@features/mentorship/services';
import type { Mentorship } from '../../types';

interface MentorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditMentorship?: (mentorshipId: string) => void;
}

export function MentorshipModal({
  isOpen,
  onClose,
  onEditMentorship,
}: MentorshipModalProps) {
  const navigate = useNavigate();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Auto dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  
  const { filters, updateFilters, updateSearch, clearFilters } =
    useFilters('mentorships');

  // Debug the hook values
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[MentorshipModal] useFilters values changed:', {
        filters,
        filterKeys: Object.keys(filters),
        filterValues: Object.entries(filters).filter(([, value]) => value != null && value !== '')
      });
    }
  }, [filters]);

  // Load mentorships data
  useEffect(() => {
    const loadMentorships = async () => {
      try {
        setLoading(true);
        const response = await MentorshipService.getMentorships();
        setMentorships(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mentorships');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadMentorships();
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
  } = useBulkActions('mentorships');

  // Removed debugToggle helper (was used for selection debugging)

  // Enrich mentorship records (derive consistent session + category fields)
  const enrichedMentorships = useMemo(() => {
    return mentorships.map(m => {
      const sessionCount = m.sessionCount ?? m.totalSessions ?? 0;
      const completedSessions = m.completedSessions ?? m.sessionsCompleted ?? 0;
      // Derive category if empty: attempt from title first word or type
      let category = m.category;
      if (!category || category.trim() === '') {
        const titleWord = typeof m.title === 'string' ? m.title.split(/\s+/)[0] : '';
        category = titleWord && titleWord.length > 2 ? titleWord : m.type;
      }
      return {
        ...m,
        sessionCount,
        completedSessions,
        category,
      } as Mentorship & { sessionCount: number; completedSessions: number; category?: string };
    });
  }, [mentorships]);

  // Dynamic category list (non-empty unique values)
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    enrichedMentorships.forEach(m => {
      if (m.category && m.category.trim() !== '') set.add(m.category.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [enrichedMentorships]);

  const filteredMentorships = useMemo(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[MentorshipModal] Recalculating filtered mentorships...', {
        enrichedCount: enrichedMentorships.length,
        filtersCount: Object.keys(filters).length,
        timestamp: new Date().toISOString(),
        filterString: JSON.stringify(filters)
      });
    }

    const activeFilters = {
      status: filters.status,
      type: filters.type,
      category: filters.category,
      search: filters.search,
    };
    
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[MentorshipModal] Raw filters from hook:', filters);
      console.debug('[MentorshipModal] Active filters being applied:', activeFilters);
      console.debug('[MentorshipModal] Sample mentorship data for comparison:', enrichedMentorships.slice(0, 3).map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        type: m.type,
        category: m.category
      })));
    }
    
    const result = filterItems(enrichedMentorships, activeFilters, [
      'title',
      'mentorName',
      'menteeName',
      'description',
      'category',
      'type',
      'tags',
    ], { exactKeys: ['status', 'type', 'category'], debug: true });
    
    if (process.env.NODE_ENV !== 'production') {
      // Debug log to help diagnose filter issues
      // eslint-disable-next-line no-console
      console.debug('[MentorshipModal] Filters applied', { 
        activeFilters, 
        before: enrichedMentorships.length, 
        after: result.length,
        sampleEnriched: enrichedMentorships.slice(0, 2).map(m => ({ id: m.id, status: m.status, type: m.type, category: m.category })),
        sampleFiltered: result.slice(0, 2).map(m => ({ id: m.id, status: m.status, type: m.type, category: m.category }))
      });
    }
    return result;
  }, [
    filters.status, 
    filters.type, 
    filters.category, 
    filters.search, 
    enrichedMentorships
  ]); // Changed to individual filter properties instead of the entire filters object

  const summaryStats = useMemo(() => {
    const total = enrichedMentorships.length;
    const active = enrichedMentorships.filter(m => m.status === 'active').length;
    const pending = enrichedMentorships.filter(m => m.status === 'pending').length;
    const completed = enrichedMentorships.filter(m => m.status === 'completed').length;
    const totalSessions = enrichedMentorships.reduce((sum, m) => sum + (m.sessionCount ?? 0), 0);
    const completedSessions = enrichedMentorships.reduce((sum, m) => sum + (m.completedSessions ?? 0), 0);
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    return { total, active, pending, completed, totalSessions, completedSessions, completionRate };
  }, [enrichedMentorships]);

  const handleBulkAction = async (actionType: string, selectedIds: string[]) => {
    const allIds = filteredMentorships.map(mentorship => mentorship.id);
    const targetIds = selectedIds.length > 0 ? selectedIds : allIds;
    // Map action to service call
    const actionExecutors: Record<string, (id: string) => Promise<any>> = {
      approve: (id: string) => MentorshipService.approveMentorship(id),
      complete: (id: string) => MentorshipService.completeMentorship(id),
      pause: async (_id: string) => Promise.resolve(), // placeholder until pause implemented
      delete: (id: string) => MentorshipService.deleteMentorship(id),
    };

    if (!actionExecutors[actionType]) {
      setToast({ type: 'info', message: `Unsupported bulk action: ${actionType}` });
      return;
    }

    if (actionType === 'delete') {
      const confirmed = confirm(`Are you sure you want to delete ${targetIds.length} mentorship(s)?`);
      if (!confirmed) return;
    }

    let processed = 0;
    const failures: string[] = [];
    for (const id of targetIds) {
      try {
        await actionExecutors[actionType](id);
        processed++;
      } catch (e) {
        console.error(`Failed ${actionType} for mentorship ${id}`, e);
        failures.push(id);
      }
    }

    // Reload after operations
    try {
      const response = await MentorshipService.getMentorships();
      setMentorships(response.data);
    } catch (e) {
      console.error('Failed to reload mentorships after bulk action', e);
    }
    clearSelections();

    const verbMap: Record<string, string> = {
      approve: 'Approved',
      complete: 'Completed',
      pause: 'Paused',
      delete: 'Deleted',
    };
    const pastTense = verbMap[actionType] || actionType;
    if (failures.length === 0) {
      setToast({ type: 'success', message: `${pastTense} ${processed} mentorship(s) successfully.` });
    } else {
      setToast({
        type: 'error',
        message: `${pastTense} ${processed} mentorship(s) with ${failures.length} failure(s).` + (failures.length <= 5 ? ` Failed IDs: ${failures.join(', ')}` : '')
      });
    }
  };

  const handleMentorshipAction = async (action: string, mentorshipId: string) => {
    switch (action) {
      case 'edit':
        if (onEditMentorship) {
          onEditMentorship(mentorshipId);
        } else {
          navigate(`/admin/mentorship/edit/${mentorshipId}`);
        }
        break;
      case 'view':
        navigate(`/admin/mentorship/details/${mentorshipId}`);
        break;
      case 'sessions':
        navigate(`/admin/mentorship/${mentorshipId}/sessions`);
        break;
      case 'approve':
        try {
          await MentorshipService.approveMentorship(mentorshipId);
          setToast({ type: 'success', message: 'Mentorship approved successfully' });
          // Reload data
          const response = await MentorshipService.getMentorships();
          setMentorships(response.data);
        } catch (error) {
          setToast({ type: 'error', message: 'Failed to approve mentorship' });
        }
        break;
      case 'complete':
        try {
          await MentorshipService.completeMentorship(mentorshipId);
          setToast({ type: 'success', message: 'Mentorship completed successfully' });
          // Reload data
          const response = await MentorshipService.getMentorships();
          setMentorships(response.data);
        } catch (error) {
          setToast({ type: 'error', message: 'Failed to complete mentorship' });
        }
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this mentorship?')) {
          try {
            await MentorshipService.deleteMentorship(mentorshipId);
            setToast({ type: 'success', message: 'Mentorship deleted successfully' });
            // Reload data
            const response = await MentorshipService.getMentorships();
            setMentorships(response.data);
          } catch (error) {
            setToast({ type: 'error', message: 'Failed to delete mentorship' });
          }
        }
        break;
      default:
        setToast({ type: 'info', message: `Action ${action} for mentorship ${mentorshipId}` });
    }
  };

  const handleCreateMentorship = () => {
    navigate('/admin/mentorship/create');
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="mentorship-overlay active">
        <div className="mentorship-manager">
          <div className="manager-header">
            <h2>🤝 Mentorship Management</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div>Loading mentorships...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mentorship-overlay active">
        <div className="mentorship-manager">
          <div className="manager-header">
            <h2>🤝 Mentorship Management</h2>
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
    <div className="mentorship-overlay active">
      <div className="mentorship-manager">
        {toast && (
          <div
            className={`toast toast-${toast.type}`}
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              background: toast.type === 'success' ? '#2ecc71' : toast.type === 'error' ? '#e74c3c' : '#3498db',
              color: '#fff',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 10,
              maxWidth: '360px'
            }}
          >
            <span style={{flex: 1}}>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '1rem',
                lineHeight: 1,
                padding: 0
              }}
              aria-label="Close notification"
            >×</button>
          </div>
        )}
        <div className="manager-header">
          <h2>🤝 Mentorship Management</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Summary Stats */}
        <div className="manager-stats">
          <div className="stat-item">
            <div className="stat-value">{summaryStats.total}</div>
            <div className="stat-label">Total Programs</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{summaryStats.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{summaryStats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{summaryStats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{summaryStats.completedSessions}/{summaryStats.totalSessions}</div>
            <div className="stat-label">Sessions (Done/Total)</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{summaryStats.completionRate.toFixed(0)}%</div>
            <div className="stat-label">Overall Progress</div>
          </div>
        </div>

        {/* Controls */}
        <div className="manager-controls">
          <div className="search-filters">
            <input
              type="text"
              placeholder="Search mentorships, mentors, mentees..."
              value={filters.search || ''}
              onChange={e => updateSearch(e.target.value)}
            />

            <select
              value={filters.status || ''}
              onChange={e => {
                const newValue = e.target.value || undefined;
                if (process.env.NODE_ENV !== 'production') {
                  console.debug('[MentorshipModal] Status filter changed:', { 
                    oldValue: filters.status, 
                    newValue,
                    targetValue: e.target.value
                  });
                }
                updateFilters({ status: newValue });
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.type || ''}
              onChange={e => {
                const newValue = e.target.value || undefined;
                if (process.env.NODE_ENV !== 'production') {
                  console.debug('[MentorshipModal] Type filter changed:', { 
                    oldValue: filters.type, 
                    newValue,
                    targetValue: e.target.value
                  });
                }
                updateFilters({ type: newValue });
              }}
            >
              <option value="">All Types</option>
              <option value="technical">Technical</option>
              <option value="career">Career</option>
              <option value="leadership">Leadership</option>
              <option value="entrepreneurship">Entrepreneurship</option>
              <option value="general">General</option>
            </select>

            {categoryOptions.length > 0 && (
              <select
                value={filters.category || ''}
                onChange={e => updateFilters({ category: e.target.value || undefined })}
              >
                <option value="">All Categories</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          <div className="action-buttons">
            <button
              className="btn-primary"
              onClick={handleCreateMentorship}
            >
              ➕ New Mentorship
            </button>

            {(filters.search || filters.status || filters.type || filters.category) && (
              <button
                className="btn-secondary"
                onClick={clearFilters}
              >
                🔄 Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {isVisible && (
          <div className="bulk-actions-bar">
            <div className="bulk-selection-info">
              <span>{selectedCount} selected</span>
              <button onClick={() => selectAll(filteredMentorships.map(m => m.id))}>Select All ({filteredMentorships.length})</button>
              <button onClick={clearSelections}>Clear Selection</button>
            </div>
            <div className="bulk-actions">
              <button onClick={() => handleBulkAction('approve', selectedItems)}>
                ✅ Approve
              </button>
              <button onClick={() => handleBulkAction('complete', selectedItems)}>
                🏁 Complete
              </button>
              <button onClick={() => handleBulkAction('pause', selectedItems)}>
                ⏸️ Pause
              </button>
              <button 
                onClick={() => handleBulkAction('delete', selectedItems)}
                className="bulk-action-danger"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        )}

        {/* Mentorships List */}
        <div className="manager-content">
          {filteredMentorships.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🤝</div>
              <div className="empty-state-title">No Mentorships Found</div>
              <div className="empty-state-description">
                {filters.search || filters.status || filters.type
                  ? 'Try adjusting your filters or search terms.'
                  : 'Create your first mentorship program to get started.'}
              </div>
              <button
                className="btn-primary"
                onClick={handleCreateMentorship}
              >
                ➕ Create First Mentorship
              </button>
            </div>
          ) : (
            <div className="mentorships-list">
              {filteredMentorships.map(mentorship => (
                <div key={mentorship.id} className="mentorship-item">
                  <div className="mentorship-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(mentorship.id)}
                      onChange={() => toggleSelection(mentorship.id)}
                    />
                  </div>
                  
                  <div className="mentorship-content">
                    <div className="mentorship-main">
                      <div className="mentorship-header">
                        <h3 className="mentorship-title">{mentorship.title}</h3>
                        <div className="mentorship-badges">
                          <span className={`status-badge ${getStatusBadgeClass(mentorship.status)}`}>
                            {mentorship.status}
                          </span>
                          <span className="type-badge">{mentorship.type}</span>
                          {mentorship.progress !== undefined && (
                            <span className="progress-badge">
                              {mentorship.progress}% Complete
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mentorship-participants">
                        <div className="participant-info">
                          <strong>Mentor:</strong> {mentorship.mentorName}
                          {mentorship.mentorProfileImage && (
                            <img 
                              src={mentorship.mentorProfileImage} 
                              alt="Mentor" 
                              className="participant-avatar"
                            />
                          )}
                        </div>
                        <div className="participant-info">
                          <strong>Mentee:</strong> {mentorship.menteeName}
                          {mentorship.menteeProfileImage && (
                            <img 
                              src={mentorship.menteeProfileImage} 
                              alt="Mentee" 
                              className="participant-avatar"
                            />
                          )}
                        </div>
                      </div>

                      <div className="mentorship-details">
                        <div className="mentorship-description">{mentorship.description}</div>
                        <div className="mentorship-meta">
                          <span className="meta-item">
                            📅 Started: {formatDate(mentorship.startDate)}
                          </span>
                          <span className="meta-item">
                            📊 Sessions: {mentorship.completedSessions}/{mentorship.sessionCount}
                          </span>
                          {(mentorship.overallRating != null || (mentorship as any).rating != null) && (
                            <span className="meta-item">
                              {(() => {
                                const r = mentorship.overallRating ?? (mentorship as any).rating;
                                return `⭐ Rating: ${typeof r === 'number' ? r.toFixed(1) : r}/5`;
                              })()}
                            </span>
                          )}
                          {mentorship.category && (
                            <span className="meta-item">
                              🏷️ {mentorship.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mentorship-actions">
                      <button
                        onClick={() => handleMentorshipAction('view', mentorship.id)}
                        className="action-btn view"
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleMentorshipAction('edit', mentorship.id)}
                        className="action-btn edit"
                        title="Edit Mentorship"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleMentorshipAction('sessions', mentorship.id)}
                        className="action-btn sessions"
                        title="Manage Sessions"
                      >
                        📅
                      </button>
                      {mentorship.status === 'pending' && (
                        <button
                          onClick={() => handleMentorshipAction('approve', mentorship.id)}
                          className="action-btn approve"
                          title="Approve Mentorship"
                        >
                          ✅
                        </button>
                      )}
                      {mentorship.status === 'active' && (
                        <button
                          onClick={() => handleMentorshipAction('complete', mentorship.id)}
                          className="action-btn complete"
                          title="Complete Mentorship"
                        >
                          🏁
                        </button>
                      )}
                      <button
                        onClick={() => handleMentorshipAction('delete', mentorship.id)}
                        className="action-btn delete"
                        title="Delete Mentorship"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with additional stats */}
        <div className="manager-footer">
          <div className="footer-stats">
            Showing {filteredMentorships.length} of {mentorships.length} mentorships
            {(filters.search || filters.status || filters.type || filters.category) && 
              <span> (filtered)</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
}