import React from 'react';

export function PlatformStatusCard() {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Platform Status</div>
      </div>
      <div className="admin-card-body">
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Platform Health</div>
            <div className="item-subtitle">
              All systems operational
              <span className="status-badge success">Online</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn">
              Monitor
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Offline Sync</div>
            <div className="item-subtitle">
              3 pending sync operations
              <span className="status-badge warning">Syncing</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn">
              Sync Now
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Database</div>
            <div className="item-subtitle">
              Connected and healthy
              <span className="status-badge success">Active</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn">
              Status
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
