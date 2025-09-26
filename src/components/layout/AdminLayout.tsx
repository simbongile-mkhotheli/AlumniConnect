import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearch?: (searchTerm: string) => void;
}

export function AdminLayout({
  title,
  subtitle,
  showSearch,
  onSearch,
}: AdminLayoutProps) {
  return (
    <div className="wireframe-container">
      <AdminSidebar />

      <main className="admin-main-content">
        <AdminHeader
          title={title}
          subtitle={subtitle}
          showSearch={showSearch}
          onSearch={onSearch}
        />

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
