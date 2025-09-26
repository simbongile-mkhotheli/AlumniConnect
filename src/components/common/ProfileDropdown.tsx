import React, { forwardRef, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/UserContext';
import type { UserProfile } from '../../contexts/UserContext';
import { ProfileSettingsModal } from '../modals/ProfileSettingsModal';
// TODO: Update the path above if ProfileSettingsModal exists elsewhere
// Example: import { ProfileSettingsModal } from '../settings/ProfileSettingsModal';

interface ProfileDropdownProps {
  user: UserProfile;
  onClose: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const ProfileDropdown = forwardRef<HTMLDivElement, ProfileDropdownProps>(
  ({ user, onClose, position = 'bottom-right' }, ref) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleProfileClick = () => {
      navigate('/dashboard/profile');
      onClose();
    };

    const handleSettingsClick = () => {
      setIsSettingsOpen(true);
      onClose();
    };

    const handleLogout = async () => {
      setIsLoggingOut(true);
      try {
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
        setIsLoggingOut(false);
      }
    };

    const handleAdminDashboard = () => {
      navigate('/admin');
      onClose();
    };

    const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        action();
      }
    };

    const getRoleDisplayName = (role: string) => {
      switch (role) {
        case 'admin':
          return 'Administrator';
        case 'mentor':
          return 'Mentor';
        case 'mentee':
          return 'Mentee';
        case 'alumni':
          return 'Alumni';
        default:
          return 'Member';
      }
    };

    const getRoleBadgeClass = (role: string) => {
      switch (role) {
        case 'admin':
          return 'role-badge-admin';
        case 'mentor':
          return 'role-badge-mentor';
        case 'mentee':
          return 'role-badge-mentee';
        case 'alumni':
          return 'role-badge-alumni';
        default:
          return 'role-badge-default';
      }
    };

    return (
      <>
        <div
          ref={ref}
          className={`profile-dropdown ${position}`}
          role="menu"
          aria-label="User profile menu"
        >
          {/* User Info Header */}
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} />
              ) : (
                <div className="avatar-initials">{user.initials}</div>
              )}
            </div>
            <div className="profile-dropdown-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
              <div
                className={`user-role-badge ${getRoleBadgeClass(user.role)}`}
              >
                {getRoleDisplayName(user.role)}
              </div>
            </div>
          </div>

          {/* Impact Score */}
          <div className="profile-dropdown-stats">
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-value">
                  {user.impactScore.toLocaleString()}
                </div>
                <div className="stat-label">Impact Score</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-value">{user.badges.length}</div>
                <div className="stat-label">Badges</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="profile-dropdown-menu">
            <button
              className="dropdown-menu-item"
              onClick={handleProfileClick}
              onKeyDown={e => handleKeyDown(e, handleProfileClick)}
              role="menuitem"
            >
              <div className="menu-item-icon">👤</div>
              <div className="menu-item-content">
                <div className="menu-item-title">My Profile</div>
                <div className="menu-item-subtitle">
                  View and edit your profile
                </div>
              </div>
            </button>

            <button
              className="dropdown-menu-item"
              onClick={handleSettingsClick}
              onKeyDown={e => handleKeyDown(e, handleSettingsClick)}
              role="menuitem"
            >
              <div className="menu-item-icon">⚙️</div>
              <div className="menu-item-content">
                <div className="menu-item-title">Settings</div>
                <div className="menu-item-subtitle">
                  Preferences and privacy
                </div>
              </div>
            </button>

            {/* Admin Dashboard Link (only for admin users) */}
            {user.role === 'admin' && (
              <>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-menu-item admin-item"
                  onClick={handleAdminDashboard}
                  onKeyDown={e => handleKeyDown(e, handleAdminDashboard)}
                  role="menuitem"
                >
                  <div className="menu-item-icon">🔧</div>
                  <div className="menu-item-content">
                    <div className="menu-item-title">Admin Dashboard</div>
                    <div className="menu-item-subtitle">Manage platform</div>
                  </div>
                </button>
              </>
            )}

            <div className="dropdown-divider"></div>

            {/* Quick Actions */}
            <button
              className="dropdown-menu-item"
              onClick={() => {
                navigate('/dashboard/help');
                onClose();
              }}
              onKeyDown={e =>
                handleKeyDown(e, () => {
                  navigate('/dashboard/help');
                  onClose();
                })
              }
              role="menuitem"
            >
              <div className="menu-item-icon">❓</div>
              <div className="menu-item-content">
                <div className="menu-item-title">Help & Support</div>
                <div className="menu-item-subtitle">Get help and feedback</div>
              </div>
            </button>

            <div className="dropdown-divider"></div>

            {/* Logout */}
            <button
              className="dropdown-menu-item logout-item"
              onClick={handleLogout}
              onKeyDown={e => handleKeyDown(e, handleLogout)}
              disabled={isLoggingOut}
              role="menuitem"
            >
              <div className="menu-item-icon">{isLoggingOut ? '⏳' : '🚪'}</div>
              <div className="menu-item-content">
                <div className="menu-item-title">
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </div>
                <div className="menu-item-subtitle">
                  {isLoggingOut ? 'Please wait' : 'Sign out of your account'}
                </div>
              </div>
            </button>
          </div>

        {/* Dev-only UserSwitcher (for local development) */}
        <div style={{ marginTop: 12 }}>
          {(() => {
            const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            if (!isDev) return null;
            const LazyUserSwitcher = lazy(() => import('../debug/UserSwitcher').then(m => ({ default: m.UserSwitcher })));
            return (
              <Suspense fallback={null}>
                <LazyUserSwitcher compact devOnly />
              </Suspense>
            );
          })()}
        </div>

        {/* Settings Modal */}
        {isSettingsOpen && (
          <ProfileSettingsModal
            user={user}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </div>
    </>
    );
  }
);

ProfileDropdown.displayName = 'ProfileDropdown';
