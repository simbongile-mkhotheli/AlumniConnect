import React from 'react';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearch?: (term: string) => void;
}

export function AdminHeader({
  title = 'Alumni Engagement Dashboard',
  subtitle,
  showSearch,
  onSearch,
}: AdminHeaderProps) {
  return (
    <div className="admin-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <div className="admin-subtitle">{subtitle}</div>}
      </div>
      {showSearch && (
        <div className="admin-header-search">
          <input
            type="text"
            placeholder="Search..."
            onChange={e => onSearch?.(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
