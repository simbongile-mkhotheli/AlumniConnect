import React, { useState } from 'react';
import { UserProfileAvatar } from '../common/UserProfileAvatar';
// Dev utility: user switching (renders only in local dev)
import { UserSwitcher } from '../debug/UserSwitcher';

interface StandardHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearch?: (searchTerm: string) => void;
}

export function StandardHeader({
  title,
  subtitle,
  showSearch = true,
  onSearch,
}: StandardHeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleThemeToggle = () => {
    document.body.classList.toggle('dark-theme');
  };

  return (
    <header className="header">
      <div className="header-title">{title || 'AlumniConnect Hub'}</div>

      {showSearch && (
        <div className="header-search">
          <input
            type="text"
            placeholder="Search alumni, events, opportunities..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      )}

      <div className="header-controls" style={{ display:'flex', alignItems:'center', gap:12 }}>
        {/* Dev-only inline user switcher (shows only on localhost) */}
        <div style={{ display:'flex', alignItems:'center' }}>
          <UserSwitcher compact devOnly />
        </div>
        <button className="notification-btn" style={{ position: 'relative' }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118.6 14.6V11a6 6 0 10-12 0v3.6c0 .538-.214 1.055-.595 1.445L4 17h5" />
          </svg>
          <span className="notification-badge">5</span>
        </button>

        <button className="theme-toggle" onClick={handleThemeToggle}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>

        <UserProfileAvatar size="md" />
      </div>
    </header>
  );
}
