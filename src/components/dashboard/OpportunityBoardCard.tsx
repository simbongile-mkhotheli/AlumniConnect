import React from 'react';
import { Link } from 'react-router-dom';

interface OpportunityItem {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'hiring' | 'collaboration';
  actionText: string;
}

interface OpportunityBoardCardProps {
  onCreateOpportunity?: () => void;
  onClose?: () => void;
}

export function OpportunityBoardCard({
  onCreateOpportunity,
  onClose,
}: OpportunityBoardCardProps) {
  const opportunities: OpportunityItem[] = [
    {
      id: '1',
      title: 'Data Analyst – Sanlam Group',
      company: 'Sanlam Group',
      location: 'Johannesburg, Gauteng',
      type: 'hiring',
      actionText: 'Apply',
    },
    {
      id: '2',
      title: 'Frontend Developer – Takealot',
      company: 'Takealot Group',
      location: 'Cape Town, Western Cape',
      type: 'hiring',
      actionText: 'Apply',
    },
    {
      id: '3',
      title: 'Collaboration: FinTech Startup',
      company: 'Posted by Alumni Network',
      location: 'Remote',
      type: 'collaboration',
      actionText: 'Join',
    },
  ];

  const handleApply = (opportunityId: string) => {
    // TODO: Implement apply functionality
    console.log(`Apply for opportunity ${opportunityId}`);
  };

  const handleCreateOpportunity = () => {
    console.log('➕ Create opportunity clicked');
    if (onCreateOpportunity) {
      onCreateOpportunity();
    }
  };

  const handleClose = () => {
    console.log('❌ Close clicked');
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">Opportunity Board</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="admin-card-action primary"
            onClick={handleCreateOpportunity}
            title="Create New Opportunity"
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ➕ Create Opportunity
          </button>
          {onClose && (
            <button
              className="admin-card-action close"
              onClick={handleClose}
              title="Close"
              style={{
                padding: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ❌
            </button>
          )}
        </div>
      </div>
      <div className="admin-card-body" style={{ padding: 0 }}>
        {opportunities.map(opportunity => (
          <div key={opportunity.id} className="admin-list-item">
            <div className="item-info">
              <div className="item-title">{opportunity.title}</div>
              <div className="item-subtitle">
                {opportunity.company} • 📍 {opportunity.location}
                <span
                  className="status-badge info"
                  style={
                    opportunity.type === 'collaboration'
                      ? { background: '#667eea', color: 'white' }
                      : {}
                  }
                >
                  {opportunity.type === 'hiring' ? 'Hiring' : 'Collaboration'}
                </span>
              </div>
            </div>
            <div className="item-actions">
              <button
                className="item-btn primary"
                onClick={() => handleApply(opportunity.id)}
              >
                {opportunity.actionText}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: '16px 24px',
          textAlign: 'right',
          borderTop: '1px solid #f1f3f4',
        }}
      >
        <Link to="/opportunities" className="btn btn-outline">
          View all opportunities →
        </Link>
      </div>
    </div>
  );
}
