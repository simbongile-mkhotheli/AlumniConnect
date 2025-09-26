import React from 'react';

export function CommunityHealthCard() {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Community Health</div>
      </div>
      <div className="admin-card-body">
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Alumni Retention</div>
            <div className="item-subtitle">
              94% active participation
              <span className="status-badge success">Excellent</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn">
              Details
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Mentorship Activity</div>
            <div className="item-subtitle">
              67% engagement rate
              <span className="status-badge warning">Good</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn">
              Track
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Chapter Participation</div>
            <div className="item-subtitle">
              78% active members
              <span className="status-badge success">Strong</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn">
              Monitor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
