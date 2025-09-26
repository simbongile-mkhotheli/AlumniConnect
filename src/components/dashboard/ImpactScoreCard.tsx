import React from 'react';
import { useAuth } from '../../contexts/UserContext';

export function ImpactScoreCard() {
  const { user } = useAuth();
  const impactScore = user?.impactScore ?? 0;
  const badges = user?.badges ?? [];

  const getBadgeIcon = (badge: string): string => {
    const badgeIcons: Record<string, string> = {
      Mentor: '🎯',
      Contributor: '🚀',
      Innovator: '💡',
      Leader: '👑',
      Expert: '🌟',
      Helper: '🤝',
    };
    return badgeIcons[badge] || '🏆';
  };

  return (
    <div className="card impact-score-card feature-highlight">
      <div className="card-body">
        <div className="impact-score">{impactScore.toLocaleString()}</div>
        <div className="impact-label">Your Impact Score</div>
        <div className="badges-grid">
          {badges.map((badge: string, index: number) => (
            <div
              key={index}
              className="badge-item"
              data-badge={badge}
              aria-label={`badge-${badge.toLowerCase().replace(/\s+/g,'-')}`}
              role="img"
            >
              <div className="badge-icon">{getBadgeIcon(badge)}</div>
              <div className="badge-name">{badge}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
