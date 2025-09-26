import React, { useState, useEffect } from 'react';
import { SponsorsService } from '../../services/sponsorsService';
import type { Sponsor } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface SponsorManagementCardProps {
  onCreateSponsor?: () => void;
  onClose?: () => void;
}

export function SponsorManagementCard({
  onCreateSponsor,
  onClose,
}: SponsorManagementCardProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sponsors from API
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching sponsors from API...');
        const response = await SponsorsService.getSponsors(1, 5); // Get first 5 sponsors

        console.log('📡 Sponsors API Response:', response);

        if (response.success && response.data) {
          // Filter for active sponsors and sort by tier
          const tierOrder = { platinum: 1, gold: 2, silver: 3, bronze: 4 };
          const activeSponsors = response.data
            .filter(sponsor => sponsor.status === 'active')
            .sort((a, b) => (tierOrder[a.tier] || 5) - (tierOrder[b.tier] || 5))
            .slice(0, 4); // Show only first 4 active sponsors

          setSponsors(activeSponsors);
          console.log(
            '✅ Sponsors loaded successfully:',
            activeSponsors.length
          );
        } else {
          throw new Error(response.message || 'Failed to fetch sponsors');
        }
      } catch (err) {
        console.error('❌ Error fetching sponsors:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load sponsors'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  // Get tier badge info
  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return { class: 'platinum', label: 'Platinum', color: '#e5e7eb' };
      case 'gold':
        return { class: 'gold', label: 'Gold', color: '#fbbf24' };
      case 'silver':
        return { class: 'silver', label: 'Silver', color: '#9ca3af' };
      case 'bronze':
        return { class: 'bronze', label: 'Bronze', color: '#d97706' };
      default:
        return { class: 'info', label: tier, color: '#6b7280' };
    }
  };

  // Get status badge info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { class: 'success', label: 'Active' };
      case 'pending':
        return { class: 'warning', label: 'Pending' };
      case 'inactive':
        return { class: 'error', label: 'Inactive' };
      case 'expired':
        return { class: 'error', label: 'Expired' };
      default:
        return { class: 'info', label: status };
    }
  };

  const handleCreateSponsor = () => {
    console.log('➕ Create sponsor clicked');
    if (onCreateSponsor) {
      onCreateSponsor();
    }
  };

  const handleClose = () => {
    console.log('❌ Close clicked');
    if (onClose) {
      onClose();
    }
  };

  const handleEditSponsor = (sponsorId: string) => {
    console.log('🔧 Edit sponsor clicked:', sponsorId);
    // TODO: Implement edit functionality
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Active Sponsors</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="admin-card-action primary"
            onClick={handleCreateSponsor}
            title="Create New Sponsor"
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
            ➕ Create Sponsor
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 20px',
            }}
          >
            <LoadingSpinner size="medium" text="Loading sponsors..." />
          </div>
        ) : error ? (
          <div style={{ padding: '20px' }}>
            <ErrorMessage
              error={error}
              title="Failed to load sponsors"
              showRetry={true}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : sponsors.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤝</div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              No active sponsors
            </div>
            <div style={{ fontSize: '14px' }}>
              Add your first sponsor to get started
            </div>
            <button
              onClick={handleCreateSponsor}
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
              Create Sponsor
            </button>
          </div>
        ) : (
          sponsors.map(sponsor => {
            const tierInfo = getTierInfo(sponsor.tier);
            const statusInfo = getStatusInfo(sponsor.status);
            return (
              <div key={sponsor.id} className="admin-list-item">
                <div className="item-info">
                  <div className="item-title">{sponsor.name}</div>
                  <div className="item-subtitle">
                    <span
                      className="status-badge"
                      style={{
                        background: tierInfo.color,
                        color: '#374151',
                        fontWeight: '600',
                      }}
                    >
                      {tierInfo.label} Sponsor
                    </span>
                    • {sponsor.eventsSponsored || 0} events sponsored
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                <div className="item-actions">
                  <button
                    className="item-btn primary"
                    onClick={() => handleEditSponsor(sponsor.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {sponsors.length > 0 && (
        <div
          style={{
            padding: '16px 24px',
            textAlign: 'center',
            borderTop: '1px solid #f1f3f4',
            background: 'rgba(248, 250, 252, 0.5)',
          }}
        >
          <button
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#667eea',
              border: '1px solid #667eea',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#667eea';
            }}
          >
            Manage All Sponsors
          </button>
        </div>
      )}
    </div>
  );
}
