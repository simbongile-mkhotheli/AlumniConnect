import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import type { UserProfile } from '../../contexts/UserContext';

interface ProfileSettingsModalProps {
  user: UserProfile;
  onClose: () => void;
}

export function ProfileSettingsModal({
  user,
  onClose,
}: ProfileSettingsModalProps) {
  const { updatePreferences } = useUser();
  const [activeTab, setActiveTab] = useState<
    'general' | 'notifications' | 'privacy'
  >('general');
  const [preferences, setPreferences] = useState(user.preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const hasChanged =
      JSON.stringify(preferences) !== JSON.stringify(user.preferences);
    setHasChanges(hasChanged);
  }, [preferences, user.preferences]);

  // Handle theme change
  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    setPreferences(prev => ({
      ...prev,
      theme,
    }));

    // Apply theme immediately
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
      document.body.classList.remove('dark-theme');
    } else {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      if (prefersDark) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  };

  // Handle notification preferences
  const handleNotificationChange = (
    key: keyof typeof preferences.notifications,
    value: boolean
  ) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  // Handle privacy preferences
  const handlePrivacyChange = (
    key: keyof typeof preferences.privacy,
    value: boolean
  ) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  // Save preferences
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences(preferences);
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset preferences
  const handleReset = () => {
    setPreferences(user.preferences);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="profile-settings-overlay" onKeyDown={handleKeyDown}>
      <div className="profile-settings-modal">
        {/* Header */}
        <div className="settings-header">
          <h2>Settings</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <span className="tab-icon">⚙️</span>
            General
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className="tab-icon">🔔</span>
            Notifications
          </button>
          <button
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <span className="tab-icon">🔒</span>
            Privacy
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Preferences</h3>

              {/* Theme Selection */}
              <div className="setting-group">
                <label className="setting-label">Theme</label>
                <div className="theme-options">
                  <button
                    className={`theme-option ${preferences.theme === 'light' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <div className="theme-preview light"></div>
                    <span>Light</span>
                  </button>
                  <button
                    className={`theme-option ${preferences.theme === 'dark' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <div className="theme-preview dark"></div>
                    <span>Dark</span>
                  </button>
                  <button
                    className={`theme-option ${preferences.theme === 'auto' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('auto')}
                  >
                    <div className="theme-preview auto"></div>
                    <span>Auto</span>
                  </button>
                </div>
              </div>

              {/* Language (Future Feature) */}
              <div className="setting-group">
                <label className="setting-label">Language</label>
                <select className="setting-select" disabled>
                  <option>English (US)</option>
                </select>
                <p className="setting-description">
                  More languages coming soon
                </p>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Preferences</h3>

              <div className="setting-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">Email Notifications</label>
                    <p className="setting-description">
                      Receive notifications via email
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.email}
                      onChange={e =>
                        handleNotificationChange('email', e.target.checked)
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">Push Notifications</label>
                    <p className="setting-description">
                      Receive browser push notifications
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.push}
                      onChange={e =>
                        handleNotificationChange('push', e.target.checked)
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">Event Notifications</label>
                    <p className="setting-description">
                      Get notified about upcoming events
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.events}
                      onChange={e =>
                        handleNotificationChange('events', e.target.checked)
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">
                      Mentorship Notifications
                    </label>
                    <p className="setting-description">
                      Notifications about mentorship activities
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.mentorship}
                      onChange={e =>
                        handleNotificationChange('mentorship', e.target.checked)
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">
                      Opportunity Notifications
                    </label>
                    <p className="setting-description">
                      Get notified about new job opportunities
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.opportunities}
                      onChange={e =>
                        handleNotificationChange(
                          'opportunities',
                          e.target.checked
                        )
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h3>Privacy Settings</h3>

              <div className="setting-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">Profile Visibility</label>
                    <p className="setting-description">
                      Make your profile visible to other alumni
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.profileVisible}
                      onChange={e =>
                        handlePrivacyChange('profileVisible', e.target.checked)
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">Contact Information</label>
                    <p className="setting-description">
                      Allow others to see your contact details
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.contactVisible}
                      onChange={e =>
                        handlePrivacyChange('contactVisible', e.target.checked)
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">Activity Visibility</label>
                    <p className="setting-description">
                      Show your activity and achievements
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.activityVisible}
                      onChange={e =>
                        handlePrivacyChange('activityVisible', e.target.checked)
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <div className="settings-actions">
            <button
              className="btn btn-outline"
              onClick={handleReset}
              disabled={!hasChanges || isSaving}
            >
              Reset
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
