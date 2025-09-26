import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICards } from './KPICards';
import { AdminEventsCard } from './AdminEventsCard';
import { QuickActionsCard } from './QuickActionsCard';
import { AlumniOutcomeCard } from './AlumniOutcomeCard';
import { RegionalChaptersCard } from './RegionalChaptersCard';
import { SponsorManagementCard } from './SponsorManagementCard';
import { PartnersCard } from './PartnersCard';
import { MentorshipCard } from './MentorshipCard';
import { CommunityHealthCard } from './CommunityHealthCard';
import { PlatformStatusCard } from './PlatformStatusCard';
import { AlumniSpotlightCard } from './AlumniSpotlightCard';
import { OpportunityBoardCard } from './OpportunityBoardCard';
import { CommunityQACard } from './CommunityQACard';
import { UpcomingEventsModal } from '../modals/UpcomingEventsModal';
import { MentorshipModal } from '../modals/MentorshipModal';
import { LoadingSpinner, LoadingOverlay } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { useModal } from '../../hooks';

interface DashboardStats {
  totalAlumni: number;
  activeEvents: number;
  totalSponsors: number;
  regionalChapters: number;
  lastUpdated: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const upcomingEventsModal = useModal();
  const mentorshipModal = useModal();

  // State management for better UX
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);

  // Simulate data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Mock dashboard stats
        setDashboardStats({
          totalAlumni: 2847,
          activeEvents: 8,
          totalSponsors: 8,
          regionalChapters: 15,
          lastUpdated: new Date().toLocaleString(),
        });
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Refresh dashboard data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 800));
      setDashboardStats(prev =>
        prev
          ? {
              ...prev,
              lastUpdated: new Date().toLocaleString(),
            }
          : null
      );
    } catch (err) {
      setError('Failed to refresh dashboard data.');
    } finally {
      setRefreshing(false);
    }
  };

  // Event handlers - Updated to use navigation instead of modals
  const handleCreateEvent = () => {
    console.log('handleCreateEvent called - navigating to create page');
    navigate('/admin/upcoming-events/create');
  };

  const handleEditEvent = (eventId: string) => {
    console.log(
      'AdminDashboard handleEditEvent called with ID:',
      eventId,
      '- navigating to edit page'
    );
    navigate(`/admin/upcoming-events/edit/${eventId}`);
  };

  const handleViewEvent = (eventId: string) => {
    console.log(
      'AdminDashboard handleViewEvent called with ID:',
      eventId,
      '- navigating to view page'
    );
    navigate(`/admin/upcoming-events/view/${eventId}`);
  };

  const handleManageEvents = () => {
    console.log('handleManageEvents called - opening modal');
    upcomingEventsModal.openModal();
  };

  // Create handlers for all content types
  const handleCreateSpotlight = () => {
    console.log('handleCreateSpotlight called');
    navigate('/admin/spotlights/create');
  };

  const handleCreateChapter = () => {
    console.log('handleCreateChapter called');
    navigate('/admin/chapters/create');
  };

  const handleCreateSponsor = () => {
    console.log('handleCreateSponsor called');
    navigate('/admin/sponsors/create');
  };

  const handleCreatePartner = () => {
    console.log('handleCreatePartner called');
    navigate('/admin/partners/create');
  };

  const handleCreateOpportunity = () => {
    console.log('handleCreateOpportunity called');
    navigate('/admin/opportunities/create');
  };

  const handleCreateMentorship = () => {
    console.log('handleCreateMentorship called');
    navigate('/admin/mentorship/create');
  };

  const handleManageMentorships = () => {
    console.log('handleManageMentorships called - opening modal');
    mentorshipModal.openModal();
  };

  const handleCreateQA = () => {
    console.log('handleCreateQA called');
    navigate('/admin/qa/create');
  };

  // Error retry handler
  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="presentation-note">
          <LoadingSpinner size="medium" text="Loading dashboard..." />
        </div>
        <div className="kpi-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="kpi-card animate-pulse">
              <div className="kpi-header">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="presentation-note">
          <ErrorMessage
            error={error}
            title="Dashboard Error"
            showRetry={true}
            onRetry={handleRetry}
            variant="card"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Enhanced Header with Stats and Refresh */}
      <div
        className="presentation-note"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <strong>AlumniConnect Admin Dashboard:</strong> This comprehensive
          admin interface manages all aspects of the AlumniConnect platform,
          from events and sponsorships to mentorship programs and community
          engagement. Built with React for optimal performance and
          maintainability.
          {dashboardStats && (
            <div
              style={{
                fontSize: '12px',
                color: '#718096',
                marginTop: '8px',
              }}
            >
              Last updated: {dashboardStats.lastUpdated}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {refreshing ? (
              <>
                <LoadingSpinner size="small" />
                Refreshing...
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
                Refresh
              </>
            )}
          </button>
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#667eea',
              fontWeight: '500',
            }}
          >
            🟢 System Healthy
          </div>
        </div>
      </div>

      {/* KPI Cards with Loading Overlay */}
      <LoadingOverlay isLoading={refreshing}>
        <KPICards />
      </LoadingOverlay>

      {/* Main Content Grid */}
      <div className="admin-content-grid">
        {/* Left Column */}
        <div className="left-column">
          <LoadingOverlay isLoading={refreshing}>
            <AdminEventsCard
              onEditEvent={handleEditEvent}
              onViewEvent={handleViewEvent}
              onManageEvents={handleManageEvents}
              onCreateEvent={handleCreateEvent}
            />
          </LoadingOverlay>

          <LoadingOverlay isLoading={refreshing}>
            <AlumniOutcomeCard />
          </LoadingOverlay>

          <LoadingOverlay isLoading={refreshing}>
            <RegionalChaptersCard onCreateChapter={handleCreateChapter} />
          </LoadingOverlay>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <QuickActionsCard />

          <LoadingOverlay isLoading={refreshing}>
            <SponsorManagementCard onCreateSponsor={handleCreateSponsor} />
          </LoadingOverlay>

          <LoadingOverlay isLoading={refreshing}>
            <CommunityHealthCard />
          </LoadingOverlay>

          <LoadingOverlay isLoading={refreshing}>
            <PlatformStatusCard />
          </LoadingOverlay>
        </div>
      </div>

      {/* Additional Cards Row 1 */}
      <div className="admin-content-grid" style={{ paddingTop: 0 }}>
        {/* Left Column */}
        <div className="left-column">
          <LoadingOverlay isLoading={refreshing}>
            <AlumniSpotlightCard onCreateSpotlight={handleCreateSpotlight} />
          </LoadingOverlay>

          <LoadingOverlay isLoading={refreshing}>
            <OpportunityBoardCard
              onCreateOpportunity={handleCreateOpportunity}
            />
          </LoadingOverlay>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <LoadingOverlay isLoading={refreshing}>
            <CommunityQACard onCreateQA={handleCreateQA} />
          </LoadingOverlay>

          <LoadingOverlay isLoading={refreshing}>
            <PartnersCard onCreatePartner={handleCreatePartner} />
          </LoadingOverlay>
        </div>
      </div>

      {/* Additional Cards Row 2 */}
      <div className="admin-content-grid" style={{ paddingTop: 0 }}>
        {/* Left Column */}
        <div className="left-column">
          <LoadingOverlay isLoading={refreshing}>
            <MentorshipCard 
              onCreateMentorship={handleCreateMentorship} 
              onManageMentorships={handleManageMentorships}
            />
          </LoadingOverlay>
        </div>

        {/* Right Column */}
        <div className="right-column">{/* Empty space for future cards */}</div>
      </div>

      {/* Enhanced Key Features Summary */}
      <div
        className="presentation-note"
        style={{
          marginTop: '32px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '1px solid #cbd5e1',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}
        >
          <strong>Key AlumniConnect Admin Features:</strong>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              fontSize: '12px',
            }}
          >
            <span
              style={{
                padding: '4px 8px',
                background: '#c6f6d5',
                color: '#22543d',
                borderRadius: '6px',
                fontWeight: '500',
              }}
            >
              ✅ All Systems Operational
            </span>
            <span
              style={{
                padding: '4px 8px',
                background: '#bee3f8',
                color: '#2a4365',
                borderRadius: '6px',
                fontWeight: '500',
              }}
            >
              📊 Real-time Data
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            margin: '16px 0',
          }}
        >
          <div>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>
                <strong>Admin Events Management:</strong> Create, edit, and
                manage events with RSVP tracking
              </li>
              <li>
                <strong>Sponsor Management:</strong> Manage sponsor
                relationships, tiers, and contributions
              </li>
              <li>
                <strong>Partner Management:</strong> Oversee technology and
                education partnerships
              </li>
              <li>
                <strong>Alumni Outcome Tracking:</strong> Monitor career
                progression and success metrics
              </li>
              <li>
                <strong>Community Health Monitoring:</strong> Track engagement,
                retention, and platform activity
              </li>
            </ul>
          </div>
          <div>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>
                <strong>RSVP & Offline Sync Management:</strong> Handle
                online/offline event participation
              </li>
              <li>
                <strong>Regional Chapter Analytics:</strong> Oversee local
                alumni communities and their performance
              </li>
              <li>
                <strong>Spotlight Content Management:</strong> Curate and
                publish alumni success stories
              </li>
              <li>
                <strong>Mentorship Program Management:</strong> Coordinate
                mentor-mentee relationships and programs
              </li>
              <li>
                <strong>Community Q&A Management:</strong> Moderate and manage
                community discussions
              </li>
              <li>
                <strong>Opportunity Board Management:</strong> Oversee job
                postings and collaboration opportunities
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Stats Footer */}
        {dashboardStats && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#4a5568',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#2d3748',
                }}
              >
                {dashboardStats.totalAlumni.toLocaleString()}
              </div>
              <div>Total Alumni</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#2d3748',
                }}
              >
                {dashboardStats.activeEvents}
              </div>
              <div>Active Events</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#2d3748',
                }}
              >
                {dashboardStats.totalSponsors}
              </div>
              <div>Active Sponsors</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#2d3748',
                }}
              >
                {dashboardStats.regionalChapters}
              </div>
              <div>Regional Chapters</div>
            </div>
          </div>
        )}
      </div>

      {/* Modals - UpcomingEventsModal */}
      <UpcomingEventsModal
        isOpen={upcomingEventsModal.isOpen}
        onClose={upcomingEventsModal.closeModal}
        onEditEvent={handleEditEvent}
      />

      {/* Mentorship Management Modal */}
      <MentorshipModal
        isOpen={mentorshipModal.isOpen}
        onClose={mentorshipModal.closeModal}
        onEditMentorship={(mentorshipId) => navigate(`/admin/mentorship/edit/${mentorshipId}`)}
      />
    </div>
  );
}
