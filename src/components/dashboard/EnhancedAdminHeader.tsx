import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../contexts/UserContext';

interface AdminStats {
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

export function EnhancedAdminHeader() {
  const navigate = useNavigate();
  const { user } = useAuth() as any;
  
  // Mock admin stats - in real app, this would come from API
  const adminStats: AdminStats = {
    activeUsers: 247,
    systemHealth: 'healthy',
    lastUpdated: new Date()
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutes
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const getSystemStatusIcon = (health: string) => {
    switch (health) {
      case 'healthy': return '🟢';
      case 'warning': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="enhanced-admin-header">
      <div className="admin-header-content">
        {/* Admin Profile Section */}
        <div className="admin-profile-section">
          <div className="admin-avatar-container">
            <Avatar 
              src={user?.profileImage || '/vite.svg'}
              alt={user?.name || 'Admin'}
              size={64}
            />
            <div className="status-indicator online"></div>
          </div>
          
          <div className="admin-info">
            <h1 className="admin-welcome">
              Welcome back, <span className="admin-name">{user?.name || 'Administrator'}</span>
            </h1>
            <p className="admin-subtitle">
              <span className="role-badge">System Administrator</span>
              <span className="separator">•</span>
              <span className="last-login">Last login: {formatTimeAgo(new Date(Date.now() - 1800000))}</span>
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

        {/* System Status Section */}
        <div className="system-status-section">
          <div className="status-grid">
            <div className="status-item primary">
              <div className="status-icon">
                {getSystemStatusIcon(adminStats.systemHealth)}
              </div>
              <div className="status-content">
                <div className="status-label">System Status</div>
                <div className="status-value">All Systems Operational</div>
              </div>
            </div>
            
            <div className="status-item">
              <div className="status-icon">👥</div>
              <div className="status-content">
                <div className="status-label">Active Users</div>
                <div className="status-value">{adminStats.activeUsers.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="status-item">
              <div className="status-icon">🔄</div>
              <div className="status-content">
                <div className="status-label">Last Updated</div>
                <div className="status-value">{formatTimeAgo(adminStats.lastUpdated)}</div>
              </div>
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="live-metrics">
            <div className="metric-item">
              <span className="metric-pulse"></span>
              <span className="metric-text">Live Activity</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">94.2%</span>
              <span className="metric-text">Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Banner */}
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
  );
}