import React from 'react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  label: string;
  path: string;
  isPrimary?: boolean;
}

const quickActions: QuickAction[] = [
  {
    id: 'manage-spotlights',
    label: '📝 Manage Spotlights',
    path: '/admin/spotlights',
    isPrimary: true,
  },
  {
    id: 'manage-sponsors',
    label: '💰 Manage Sponsors',
    path: '/admin/sponsors',
  },
  {
    id: 'track-mentorships',
    label: '🤝 Track Mentorships',
    path: '/admin/mentorship',
  },
  {
    id: 'manage-opportunities',
    label: '💼 Manage Opportunities',
    path: '/admin/opportunities',
  },
  {
    id: 'view-analytics',
    label: '📊 View Analytics',
    path: '/admin/analytics',
  },
  {
    id: 'award-badges',
    label: '🏆 Award Badges',
    path: '/admin/badges',
  },
];

export function QuickActionsCard() {
  const navigate = useNavigate();

  const handleActionClick = (action: QuickAction) => {
    navigate(action.path);
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Quick Actions</div>
      </div>
      <div className="admin-card-body" style={{ padding: 0 }}>
        <div className="quick-actions">
          {quickActions.map(action => (
            <button
              key={action.id}
              className={`quick-action-btn ${action.isPrimary ? 'primary' : ''}`}
              onClick={() => handleActionClick(action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
