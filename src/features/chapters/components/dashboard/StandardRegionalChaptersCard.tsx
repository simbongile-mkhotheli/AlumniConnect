import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChaptersService } from '@features/chapters/services';
import type { Chapter } from '@features/chapters/types';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';

interface ChapterItem {
  id: string;
  name: string;
  members: number;
  events: number;
  location: string;
  sponsor: string;
}

export function StandardRegionalChaptersCard() {
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalActiveChapters, setTotalActiveChapters] = useState(0);

  // Fetch chapters from API
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching chapters from API...');
        const response = await ChaptersService.getChapters(1, 10); // Get first 10 chapters

        console.log('📡 Chapters API Response:', response);

        if (response.success && response.data) {
          // Filter for active chapters and transform to ChapterItem format
          const activeChapters = response.data
            .filter(chapter => chapter.status === 'active')
            .slice(0, 3) // Show only first 3 active chapters
            .map(chapter => ({
              id: chapter.id,
              name: chapter.name,
              members: chapter.membersCount || 0,
              events: chapter.eventsCount || 0,
              location: chapter.location,
              sponsor: getChapterSponsor(chapter),
            }));

          // Count total active chapters
          const totalActive = response.data.filter(
            chapter => chapter.status === 'active'
          ).length;

          setChapters(activeChapters);
          setTotalActiveChapters(totalActive);
          console.log(
            '✅ Chapters loaded successfully:',
            activeChapters.length
          );
        } else {
          throw new Error(response.message || 'Failed to fetch chapters');
        }
      } catch (err) {
        console.error('❌ Error fetching chapters:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load chapters'
        );

        // No fallback data - keep empty array to show real error state
        setChapters([]);
        setTotalActiveChapters(0);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  // Helper function to get chapter sponsor
  const getChapterSponsor = (chapter: Chapter): string => {
    // Check various possible sponsor fields
    if (chapter.sponsor) return chapter.sponsor;
    if ((chapter as any).sponsorName) return (chapter as any).sponsorName;
    if (chapter.isSponsored) return 'Sponsored';

    // Default sponsors based on location for fallback
    const locationSponsors: Record<string, string> = {
      'Cape Town': 'iWeb',
      Johannesburg: 'Telkom',
      Durban: 'CompTIA',
      Pretoria: 'GitHub',
      'Port Elizabeth': 'Microsoft',
      Bloemfontein: 'Standard Bank',
    };

    const city = chapter.location.split(',')[0].trim();
    return locationSponsors[city] || 'Community Sponsored';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Regional Chapters</div>
        <div className="card-subtitle">Local communities & forums</div>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#6c757d' }}>
          {loading ? (
            <LoadingSpinner size="small" />
          ) : (
            `${totalActiveChapters} active chapters`
          )}
        </div>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 20px',
            }}
          >
            <LoadingSpinner size="medium" text="Loading chapters..." />
          </div>
        ) : error ? (
          <div style={{ padding: '20px' }}>
            <ErrorMessage
              error={error}
              title="Failed to load chapters"
              showRetry={true}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : chapters.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              No active chapters
            </div>
            <div style={{ fontSize: '14px' }}>
              Regional chapters will appear here when available
            </div>
          </div>
        ) : (
          chapters.map(chapter => (
            <div key={chapter.id} className="opportunity-item">
              <div className="opportunity-content">
                <div className="opportunity-title">{chapter.name}</div>
                <div className="opportunity-company">
                  {chapter.members} members • {chapter.events} events this month
                </div>
                <div className="opportunity-location">
                  📍 {chapter.location}
                  <span className="sponsor-badge">
                    Sponsored by {chapter.sponsor}
                  </span>
                </div>
              </div>
              <Link
                to={`/dashboard/chapters/${chapter.id}`}
                className="btn btn-primary"
              >
                Join
              </Link>
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
        <Link to="/dashboard/chapters" className="btn btn-outline">
          View all chapters →
        </Link>
      </div>
    </div>
  );
}
