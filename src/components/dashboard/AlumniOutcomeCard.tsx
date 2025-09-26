import React from 'react';

export function AlumniOutcomeCard() {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Alumni Outcome Tracking</div>
      </div>
      <div className="admin-card-body">
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Job Placements This Month</div>
            <div className="item-subtitle">
              89 alumni placed in new positions
              <span className="status-badge success">+12% increase</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn primary">
              View Details
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Average Starting Salary</div>
            <div className="item-subtitle">
              R45,000 per month
              <span className="status-badge info">Market competitive</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn">
              Analytics
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Employment Rate</div>
            <div className="item-subtitle">
              73% within 6 months
              <span className="status-badge success">Above target</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn">
              Track
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
