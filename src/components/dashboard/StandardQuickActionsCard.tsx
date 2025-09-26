import React from 'react';
import { Link } from 'react-router-dom';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  path: string;
}

export function StandardQuickActionsCard() {
  const quickActions: QuickAction[] = [
    {
      id: 'update-profile',
      icon: '👤',
      label: 'Update Profile',
      path: '/profile/edit',
    },
    {
      id: 'find-mentor',
      icon: '🤝',
      label: 'Find Mentor',
      path: '/mentorship',
    },
    {
      id: 'post-project',
      icon: '💼',
      label: 'Post Project',
      path: '/opportunities/create',
    },
    {
      id: 'share-expertise',
      icon: '🎯',
      label: 'Share Expertise',
      path: '/expertise/share',
    },
    {
      id: 'create-event',
      icon: '📅',
      label: 'Create Event',
      path: '/events/create',
    },
    {
      id: 'ask-question',
      icon: '❓',
      label: 'Ask Question',
      path: '/qa/ask',
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Quick Actions</div>
        <div className="card-subtitle">Finish what you started</div>
      </div>
      <div className="card-body">
        <div className="quick-actions">
          {quickActions.map(action => (
            <Link key={action.id} to={action.path} className="quick-action">
              <div className="quick-action-icon">{action.icon}</div>
              <div>{action.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
