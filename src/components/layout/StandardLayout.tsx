import React from 'react';
import { Outlet } from 'react-router-dom';
import { StandardSidebar } from './StandardSidebar';
import { StandardHeader } from './StandardHeader';

interface StandardLayoutProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearch?: (searchTerm: string) => void;
}

export function StandardLayout({
  title,
  subtitle,
  showSearch,
  onSearch,
}: StandardLayoutProps) {
  return (
    <div className="wireframe-container">
      <StandardSidebar />

      <main className="main-content">
        <StandardHeader
          title={title}
          subtitle={subtitle}
          showSearch={showSearch}
          onSearch={onSearch}
        />

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
