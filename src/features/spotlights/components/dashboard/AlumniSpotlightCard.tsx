import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SpotlightsService } from '@features/spotlights/services';
import type { Spotlight } from '../../types';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';

interface SpotlightItem {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article';
  duration: string;
  actionText: string;
}

interface AlumniSpotlightCardProps {
  onCreateSpotlight?: () => void;
  onClose?: () => void;
}

export function AlumniSpotlightCard({
  onCreateSpotlight,
  onClose,
}: AlumniSpotlightCardProps) {
  const [spotlightItems, setSpotlightItems] = useState<SpotlightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSpotlights, setTotalSpotlights] = useState(0);

  // Fetch spotlights from API
  useEffect(() => {
    const fetchSpotlights = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching spotlights from API...');
        const response = await SpotlightsService.getSpotlights(1, 10); // Get first 10 spotlights

        console.log('📡 Spotlights API Response:', response);

        if (response.success && response.data) {
          // Filter for published spotlights and transform to SpotlightItem format
          const publishedSpotlights = response.data
            .filter(spotlight => spotlight.status === 'published')
            .sort(
              (a, b) =>
                new Date(b.publishedDate || b.createdAt).getTime() -
                new Date(a.publishedDate || a.createdAt).getTime()
            )
            .slice(0, 2) // Show only first 2 published spotlights
            .map(spotlight => ({
              id: spotlight.id,
              title: spotlight.title,
              description: getSpotlightDescription(spotlight),
              type: getSpotlightType(spotlight.type),
              duration: getSpotlightDuration(spotlight),
              actionText:
                getSpotlightType(spotlight.type) === 'video' ? 'Watch' : 'Read',
            }));

          // Count total published spotlights
          const totalPublished = response.data.filter(
            spotlight => spotlight.status === 'published'
          ).length;

          setSpotlightItems(publishedSpotlights);
          setTotalSpotlights(totalPublished);
          console.log(
            '✅ Spotlights loaded successfully:',
            publishedSpotlights.length
          );
        } else {
          throw new Error(response.message || 'Failed to fetch spotlights');
        }
      } catch (err) {
        console.error('❌ Error fetching spotlights:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load spotlights'
        );

        // Set fallback data
        setSpotlightItems([
          {
            id: '1',
            title: 'From Bootcamp to CTO',
            description: "Sarah's journey at TechCorp",
            type: 'video',
            duration: '12 min',
            actionText: 'Watch',
          },
          {
            id: '2',
            title: 'Building a Social Impact Startup',
            description: "James's entrepreneurial story",
            type: 'article',
            duration: '5 min read',
            actionText: 'Read',
          },
        ]);
        setTotalSpotlights(6);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotlights();
  }, []);

  // Helper function to get spotlight description
  const getSpotlightDescription = (spotlight: Spotlight): string => {
    if (spotlight.content && spotlight.content.length > 60) {
      return spotlight.content.substring(0, 60) + '...';
    }
    return (
      spotlight.content || `${spotlight.featuredAlumniName}'s inspiring story`
    );
  };

  // Helper function to determine spotlight type
  const getSpotlightType = (type: string): 'video' | 'article' => {
    if (type === 'video_interview' || type === 'tutorial') {
      return 'video';
    }
    return 'article';
  };

  // Helper function to get spotlight duration
  const getSpotlightDuration = (spotlight: Spotlight): string => {
    const type = getSpotlightType(spotlight.type);

    if (type === 'video') {
      // Simulate video duration based on content length
      const contentLength = spotlight.content?.length || 0;
      const estimatedMinutes = Math.max(
        3,
        Math.min(15, Math.ceil(contentLength / 200))
      );
      return `${estimatedMinutes} min`;
    } else {
      // Simulate reading time based on content length
      const contentLength = spotlight.content?.length || 0;
      const estimatedMinutes = Math.max(
        2,
        Math.min(10, Math.ceil(contentLength / 300))
      );
      return `${estimatedMinutes} min read`;
    }
  };

  const getTypeIcon = (type: 'video' | 'article'): string => {
    return type === 'video' ? '🎥' : '📖';
  };

  const handleCreateSpotlight = () => {
    console.log('➕ Create spotlight clicked');
    if (onCreateSpotlight) {
      onCreateSpotlight();
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
        <div className="admin-card-title">Alumni Spotlight</div>
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
            ➕ Create Spotlight
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
      <div className="admin-card-body" style={{ padding: 0 }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 20px',
            }}
          >
            <LoadingSpinner size="medium" text="Loading spotlights..." />
          </div>
        ) : error ? (
          <div style={{ padding: '20px' }}>
            <ErrorMessage
              error={error}
              title="Failed to load spotlights"
              showRetry={true}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : spotlightItems.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              No spotlights available
            </div>
            <div style={{ fontSize: '14px' }}>
              Alumni stories will appear here when published
            </div>
            {onCreateSpotlight && (
              <button
                onClick={handleCreateSpotlight}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Create Spotlight
              </button>
            )}
          </div>
        ) : (
          spotlightItems.map(item => (
            <div key={item.id} className="admin-list-item">
              <div className="item-info">
                <div className="item-title">{item.title}</div>
                <div className="item-subtitle">
                  {item.description}
                  <span className="status-badge info">
                    {getTypeIcon(item.type)}{' '}
                    {item.type === 'video' ? 'Video' : 'Article'} •{' '}
                    {item.duration}
                  </span>
                </div>
              </div>
              <div className="item-actions">
                <Link to={`/spotlight/${item.id}`} className="item-btn primary">
                  {item.actionText}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
      <div
        style={{
          padding: '16px 24px',
          textAlign: 'right',
          borderTop: '1px solid #f1f3f4',
        }}
      >
        <Link to="/spotlight" className="btn btn-outline">
          View all stories ({totalSpotlights}) →
        </Link>
      </div>
    </div>
  );
}
