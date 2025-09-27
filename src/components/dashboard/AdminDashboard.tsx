import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UpcomingEventsModal } from '../modals/UpcomingEventsModal';
import { MentorshipModal } from '../modals/MentorshipModal';
import { LoadingSpinner, LoadingOverlay } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { useModal } from '../../hooks';
// import { EnhancedAdminHeader } from './EnhancedAdminHeader';
// import { AIInsightsPanel } from './AIInsightsPanel';
// import { LiveActivityFeed } from './LiveActivityFeed';
import { useAuth } from '../../contexts/UserContext';
import '../../styles/enhanced-admin-dashboard.css';

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

  const { user } = useAuth() as any;

  return (
    <div className="admin-dashboard enhanced">
      {/* Enhanced Admin Header - Inline Version */}
      <div className="enhanced-admin-header">
        <div className="admin-header-content">
          <div className="admin-profile-section">
            <div className="admin-avatar-container">
              <div className="avatar-placeholder">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="status-indicator online"></div>
            </div>
            
            <div className="admin-info">
              <h1 className="admin-welcome">
                Welcome back, <span className="admin-name">{user?.name || 'Administrator'}</span>
              </h1>
              <p className="admin-subtitle">
                <span className="role-badge">System Administrator</span>
                <span className="separator">•</span>
                <span className="last-login">Last login: 2h ago</span>
              </p>
            </div>

            <div className="admin-quick-actions">
              <button 
                className="btn-gradient primary"
                onClick={() => navigate('/admin/profile')}
              >
                <span className="btn-icon">👤</span>
                View Profile
              </button>
              <button 
                className="btn-outline secondary"
                onClick={() => navigate('/admin/settings')}
              >
                <span className="btn-icon">⚙️</span>
                Settings
              </button>
            </div>
          </div>

          <div className="system-status-section">
            <div className="status-grid">
              <div className="status-item primary">
                <div className="status-icon">🟢</div>
                <div className="status-content">
                  <div className="status-label">System Status</div>
                  <div className="status-value">All Systems Operational</div>
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-icon">👥</div>
                <div className="status-content">
                  <div className="status-label">Active Users</div>
                  <div className="status-value">247</div>
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-icon">🔄</div>
                <div className="status-content">
                  <div className="status-label">Last Updated</div>
                  <div className="status-value">2m ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="performance-banner">
          <div className="banner-content">
            <div className="banner-stats">
              <div className="stat">
                <span className="stat-value">2,847</span>
                <span className="stat-label">Total Alumni</span>
              </div>
              <div className="stat">
                <span className="stat-value">15</span>
                <span className="stat-label">Active Chapters</span>
              </div>
              <div className="stat">
                <span className="stat-value">8</span>
                <span className="stat-label">Upcoming Events</span>
              </div>
              <div className="stat">
                <span className="stat-value">94%</span>
                <span className="stat-label">Satisfaction Rate</span>
              </div>
            </div>
            <div className="banner-actions">
              <button className="banner-btn" onClick={() => navigate('/admin/analytics')}>
                📊 View Analytics
              </button>
              <button className="banner-btn" onClick={() => navigate('/admin/reports')}>
                📈 Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legacy presentation note removed */}

      {/* KPICards removed */}

      {/* AI Insights Panel - Inline Version */}
      <div className="ai-insights-panel">
        <div className="panel-header">
          <div className="header-content">
            <h3 className="panel-title">
              <span className="title-icon">🤖</span>
              AI Insights & Recommendations
            </h3>
            <div className="panel-badges">
              <span className="live-badge">
                <span className="pulse-dot"></span>
                Live Analysis
              </span>
              <span className="insights-count">4 insights</span>
            </div>
          </div>
        </div>

        <div className="insights-container">
          <div className="insights-grid">
            <div className="insight-card priority-urgent">
              <div className="insight-header">
                <div className="insight-icon">⚠️</div>
                <div className="insight-meta">
                  <h4 className="insight-title">High-Value Alumni Engagement Drop</h4>
                  <span className="priority-badge urgent">urgent</span>
                </div>
              </div>
              <p className="insight-description">
                23 high-impact alumni haven't engaged in 30+ days. Their combined network value is R2.3M.
              </p>
              <div className="insight-actions">
                <button className="insight-action-btn primary">Create Campaign</button>
                <button className="insight-action-btn secondary">Dismiss</button>
              </div>
            </div>

            <div className="insight-card priority-high">
              <div className="insight-header">
                <div className="insight-icon">🤝</div>
                <div className="insight-meta">
                  <h4 className="insight-title">Mentorship Matching Opportunity</h4>
                  <span className="priority-badge high">high</span>
                </div>
              </div>
              <p className="insight-description">
                15 mentees are waiting for matches in Tech fields. We have 8 available senior mentors.
              </p>
              <div className="insight-actions">
                <button className="insight-action-btn primary">Auto-Match Now</button>
                <button className="insight-action-btn secondary">Review</button>
              </div>
            </div>
          </div>
        </div>

        <div className="ai-summary">
          <div className="summary-content">
            <div className="summary-icon">🎯</div>
            <div className="summary-text">
              <strong>AI Analysis:</strong> Your platform shows strong growth potential. 
              Focus on alumni re-engagement and mentorship matching to maximize ROI.
            </div>
          </div>
          <div className="summary-metrics">
            <div className="metric">
              <span className="metric-value">87%</span>
              <span className="metric-label">Accuracy</span>
            </div>
            <div className="metric">
              <span className="metric-value">4.2x</span>
              <span className="metric-label">ROI Impact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content section removed */}

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
