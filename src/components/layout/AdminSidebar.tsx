import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../hooks';

interface NavItem {
  id: string;
  label: string;
  path: string;
  badge?: number;
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin',
  },
  {
    id: 'profiles',
    label: 'Alumni Profiles',
    path: '/admin/profiles',
    badge: 247,
  },
  {
    id: 'upcoming',
    label: 'Upcoming Events',
    path: '/admin/upcoming-events',
    badge: 8,
  },
  {
    id: 'spotlights',
    label: 'Spotlights',
    path: '/admin/spotlights',
    badge: 12,
  },
  {
    id: 'chapters',
    label: 'Regional Chapters',
    path: '/admin/chapters',
    badge: 15,
  },
  {
    id: 'sponsors',
    label: 'Sponsors',
    path: '/admin/sponsors',
    badge: 8,
  },
  {
    id: 'partners',
    label: 'Partners',
    path: '/admin/partners',
    badge: 12,
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    path: '/admin/opportunities',
    badge: 24,
  },
  {
    id: 'mentorship',
    label: 'Mentorship',
    path: '/admin/mentorship',
    badge: 89,
  },
  {
    id: 'qa',
    label: 'Community Q&A',
    path: '/admin/qa',
    badge: 43,
  },
];

export function AdminSidebar() {
  const { toggleTheme } = useTheme();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <h4>AlumniConnect Admin</h4>
        <button className="theme-toggle" onClick={toggleTheme}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>

      <nav>
        <ul className="admin-nav-menu">
          {navigationItems.map(item => (
            <li key={item.id} className="admin-nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="admin-nav-icon"></div>
                  {item.label}
                </div>
                {item.badge && (
                  <span
                    className={`nav-badge ${item.id === 'upcoming' ? 'active' : ''}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}

          {/* Standard Dashboard Link */}
          <li
            className="admin-nav-item"
            style={{
              marginTop: '20px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '20px',
            }}
          >
            <NavLink
              to="/dashboard"
              className="admin-nav-link"
              style={{ color: '#48bb78', fontWeight: '500' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="admin-nav-icon"></div>
                👤 User Dashboard
              </div>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
