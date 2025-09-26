import React, { useState, useRef, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserContext';
import { ProfileDropdown } from './ProfileDropdown';

interface UserProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showDropdown?: boolean;
  className?: string;
}

export function UserProfileAvatar({
  size = 'md',
  showDropdown = true,
  className = '',
}: UserProfileAvatarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = useUserProfile();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        avatarRef.current &&
        dropdownRef.current &&
        !avatarRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    } else if (event.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    if (showDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  if (!user) {
    return (
      <div className={`user-avatar-skeleton ${size} ${className}`}>
        <div className="skeleton-circle"></div>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'user-avatar-sm',
    md: 'user-avatar-md',
    lg: 'user-avatar-lg',
  };

  return (
    <div className="user-avatar-container">
      <button
        ref={avatarRef}
        className={`user-avatar-button ${sizeClasses[size]} ${className} ${isDropdownOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        aria-label={`${user.name} profile menu`}
        aria-expanded={isDropdownOpen}
        aria-haspopup="menu"
        type="button"
      >
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={`${user.name} profile`}
            className="user-avatar-image"
          />
        ) : (
          <div className="user-avatar-initials">{user.initials}</div>
        )}

        {/* Online status indicator */}
        <div className="user-status-indicator online" title="Online"></div>

        {/* Dropdown arrow (only for medium and large sizes) */}
        {size !== 'sm' && showDropdown && (
          <div className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && isDropdownOpen && (
        <ProfileDropdown
          ref={dropdownRef}
          user={user}
          onClose={() => setIsDropdownOpen(false)}
          position="bottom-right"
        />
      )}
    </div>
  );
}
