import React from 'react';
import { useNavigate } from 'react-router-dom';

interface InsightItem {
  id: string;
  type: 'opportunity' | 'optimization' | 'alert' | 'recommendation';
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  icon: string;
  actionPath?: string;
}

interface InsightCardProps {
  insight: InsightItem;
  onAction: (insight: InsightItem) => void;
}

function InsightCard({ insight, onAction }: InsightCardProps) {
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '💡';
      case 'optimization': return '⚡';
      case 'alert': return '⚠️';
      case 'recommendation': return '🎯';
      default: return '📊';
    }
  };

  return (
    <div className={`insight-card ${getPriorityClass(insight.priority)}`}>
      <div className="insight-header">
        <div className="insight-icon">{getTypeIcon(insight.type)}</div>
        <div className="insight-meta">
          <h4 className="insight-title">{insight.title}</h4>
          <span className={`priority-badge ${insight.priority}`}>{insight.priority}</span>
        </div>
      </div>
      
      <p className="insight-description">{insight.description}</p>
      
      <div className="insight-actions">
        <button 
          className="insight-action-btn primary"
          onClick={() => onAction(insight)}
        >
          {insight.action}
        </button>
        <button className="insight-action-btn secondary">
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function AIInsightsPanel() {
  const navigate = useNavigate();

  const insights: InsightItem[] = [
    {
      id: '1',
      type: 'alert',
      title: 'High-Value Alumni Engagement Drop',
      description: '23 high-impact alumni haven\'t engaged in 30+ days. Their combined network value is R2.3M. Suggested action: Launch personalized re-engagement campaign.',
      action: 'Create Campaign',
      priority: 'urgent',
      icon: '🚨',
      actionPath: '/admin/campaigns/create'
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Mentorship Matching Opportunity',
      description: '15 mentees are waiting for matches in Tech fields. We have 8 available senior mentors in their domains. Auto-matching could improve satisfaction by 34%.',
      action: 'Auto-Match Now',
      priority: 'high',
      icon: '🤝',
      actionPath: '/admin/mentorship/auto-match'
    },
    {
      id: '3',
      type: 'optimization',
      title: 'Event Performance Insight',
      description: 'Tech meetups show 40% higher attendance vs other categories. Increasing frequency could boost overall engagement by 18%.',
      action: 'Schedule More Events',
      priority: 'medium',
      icon: '📈',
      actionPath: '/admin/events/schedule'
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Revenue Optimization',
      description: 'Corporate partnerships generate 3x more value than individual sponsorships. Focus on B2B relationship building.',
      action: 'View Partners',
      priority: 'medium',
      icon: '💼',
      actionPath: '/admin/partners'
    }
  ];

  const handleInsightAction = (insight: InsightItem) => {
    if (insight.actionPath) {
      navigate(insight.actionPath);
    }
    // In real app, would also track analytics
    console.log(`Action taken on insight: ${insight.id}`);
  };

  return (
    <div className="ai-insights-panel">
      <div className="panel-header">
        <div className="header-content">
          <h3 className="panel-title">
            <span className="title-icon">🤖</span>
            AI Insights & Recommendations
          </h3>
          <div className="panel-badges">
            <span className="live-badge">
              <span className="pulse-dot"></span>
              Live Analysis
            </span>
            <span className="insights-count">{insights.length} insights</span>
          </div>
        </div>
        
        <div className="panel-actions">
          <button className="panel-btn secondary">Configure AI</button>
          <button className="panel-btn primary">View All</button>
        </div>
      </div>

      <div className="insights-container">
        <div className="insights-grid">
          {insights.map(insight => (
            <InsightCard 
              key={insight.id}
              insight={insight}
              onAction={handleInsightAction}
            />
          ))}
        </div>
      </div>

      {/* AI Summary */}
      <div className="ai-summary">
        <div className="summary-content">
          <div className="summary-icon">🎯</div>
          <div className="summary-text">
            <strong>AI Analysis Summary:</strong> Your platform shows strong growth potential. 
            Focus on alumni re-engagement and mentorship matching to maximize ROI.
          </div>
        </div>
        <div className="summary-metrics">
          <div className="metric">
            <span className="metric-value">87%</span>
            <span className="metric-label">Accuracy</span>
          </div>
          <div className="metric">
            <span className="metric-value">4.2x</span>
            <span className="metric-label">ROI Impact</span>
          </div>
        </div>
      </div>
    </div>
  );
}