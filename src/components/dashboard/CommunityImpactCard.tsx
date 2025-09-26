import React from 'react';

interface CommunityMetric {
  id: string;
  value: number;
  label: string;
  color: string;
}

export function CommunityImpactCard() {
  const metrics: CommunityMetric[] = [
    {
      id: 'active-alumni',
      value: 2847,
      label: 'Active Alumni',
      color: '#667eea',
    },
    {
      id: 'mentorships',
      value: 156,
      label: 'Mentorships',
      color: '#667eea',
    },
    {
      id: 'projects-completed',
      value: 89,
      label: 'Projects Completed',
      color: '#667eea',
    },
    {
      id: 'career-milestones',
      value: 342,
      label: 'Career Milestones',
      color: '#667eea',
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toLocaleString();
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Community Impact</div>
        <div className="card-subtitle">Growing together</div>
      </div>
      <div className="card-body">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          {metrics.map(metric => (
            <div key={metric.id}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: metric.color,
                }}
              >
                {formatNumber(metric.value)}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#718096',
                }}
              >
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
