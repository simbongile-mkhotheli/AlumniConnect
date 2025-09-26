import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUpcomingEventsCount } from '../../hooks/useUpcomingEventsCount';

export function StandardSidebar() {
  const location = useLocation();
  const { count: upcomingEventsCount, loading: eventsCountLoading } =
    useUpcomingEventsCount();

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="icon"></div>
        <h5>AlumniConnect</h5>
      </div>

      <nav>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') && location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <div className="nav-icon"></div>
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/network"
              className={`nav-link ${isActive('/network') ? 'active' : ''}`}
            >
              <div className="nav-icon"></div>
              Alumni Network
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/dashboard/upcoming-events"
              className={`nav-link ${isActive('/dashboard/upcoming-events') ? 'active' : ''}`}
            >
              <div className="nav-icon"></div>
              Upcoming Events
              {!eventsCountLoading && upcomingEventsCount > 0 && (
                <span className="nav-count">{upcomingEventsCount}</span>
              )}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/dashboard/mentorship"
              className={`nav-link ${isActive('/dashboard/mentorship') ? 'active' : ''}`}
            >
              <div className="nav-icon"></div>
              Mentorship
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/dashboard/opportunities"
              className={`nav-link ${isActive('/dashboard/opportunities') ? 'active' : ''}`}
            >
              <div className="nav-icon"></div>
              Opportunities
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/dashboard/chapters"
              className={`nav-link ${isActive('/dashboard/chapters') ? 'active' : ''}`}
            >
              <div className="nav-icon"></div>
              Regional Chapters
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/dashboard/spotlights"
              className={`nav-link ${isActive('/dashboard/spotlights') ? 'active' : ''}`}
            >
              <div className="nav-icon"></div>
              Alumni Spotlights
            </Link>
          </li>

          {/* Admin Dashboard Link */}
          <li
            className="nav-item"
            style={{
              marginTop: '20px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '20px',
            }}
          >
            <Link
              to="/admin"
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              style={{ color: '#667eea', fontWeight: '500' }}
            >
              <div className="nav-icon"></div>
              🔧 Admin Dashboard
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-tip">
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>💡 Pro tip</div>
        <div>
          Your RSVPs sync automatically when you reconnect. Keep engaging even
          offline!
        </div>
      </div>
    </aside>
  );
}
