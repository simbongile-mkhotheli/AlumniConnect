import React, { useState, useEffect } from 'react';
import { ChaptersService } from '@features/chapters/services';
import type { Chapter } from '@features/chapters/types';

interface RegionalChaptersCardProps {
  onCreateChapter?: () => void;
  onClose?: () => void;
}

export function RegionalChaptersCard({
  onCreateChapter,
  onClose,
}: RegionalChaptersCardProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        const response = await ChaptersService.getChapters(1, 5); // Get first 5 chapters for dashboard
        if (response.success) {
          setChapters(response.data || []);
        } else {
          setError(typeof response.error === 'string' ? response.error : 'Failed to fetch chapters');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  const getEngagementLevel = (engagementRate: number): string => {
    if (engagementRate >= 80) return 'High engagement';
    if (engagementRate >= 60) return 'Medium engagement';
    return 'Low engagement';
  };

  const getEngagementClass = (engagementRate: number): string => {
    if (engagementRate >= 80) return 'success';
    if (engagementRate >= 60) return 'warning';
    return 'danger';
  };

  const handleCreateChapter = () => {
    console.log('➕ Create chapter clicked');
    if (onCreateChapter) {
      onCreateChapter();
    }
  };

  const handleClose = () => {
    console.log('❌ Close clicked');
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Regional Chapters</div>
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
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ➕ Create Chapter
          </button>
          {onClose && (
            <button
              className="admin-card-action close"
              onClick={handleClose}
              title="Close"
              style={{
                padding: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ❌
            </button>
          )}
        </div>
      </div>
      <div className="admin-card-body">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading chapters...
          </div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626' }}>
            Error: {error}
          </div>
        ) : chapters.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No chapters found
          </div>
        ) : (
          chapters.map((chapter) => (
            <div key={chapter.id} className="admin-list-item">
              <div className="item-info">
                <div className="item-title">{chapter.name}</div>
                <div className="item-subtitle">
                  {chapter.membersCount || chapter.memberCount || 0} members • Lead: {chapter.leadName}
                  {chapter.engagementRate && (
                    <span className={`status-badge ${getEngagementClass(chapter.engagementRate)}`}>
                      {getEngagementLevel(chapter.engagementRate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="item-actions">
                <a href="#" className="item-btn primary">
                  Manage
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
