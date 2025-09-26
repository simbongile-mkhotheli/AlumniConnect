import React from 'react';

interface MentorshipCardProps {
  onCreateMentorship?: () => void;
  onManageMentorships?: () => void;
  onClose?: () => void;
}

export function MentorshipCard({
  onCreateMentorship,
  onManageMentorships,
  onClose,
}: MentorshipCardProps) {
  const handleCreateMentorship = () => {
    console.log('➕ Create mentorship clicked');
    if (onCreateMentorship) {
      onCreateMentorship();
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
        <div className="admin-card-title">Mentorship Programs</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="admin-card-action primary"
            onClick={handleCreateMentorship}
            title="Create New Mentorship"
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
            ➕ Create Mentorship
          </button>
          {onManageMentorships && (
            <button
              className="admin-card-action secondary"
              onClick={() => onManageMentorships()}
              title="Manage All Mentorships"
              style={{
                padding: '8px 16px',
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                border: '1px solid rgba(102, 126, 234, 0.2)',
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
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
              }}
            >
              📋 Manage All
            </button>
          )}
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
      <div className="admin-card-body">
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Career Development Program</div>
            <div className="item-subtitle">
              15 active pairs • Focus: Career Growth
              <span className="status-badge success">Active</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn primary">
              Manage
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Technical Skills Mentorship</div>
            <div className="item-subtitle">
              23 active pairs • Focus: Technical Skills
              <span className="status-badge success">Active</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn primary">
              Manage
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Entrepreneurship Mentorship</div>
            <div className="item-subtitle">
              8 active pairs • Focus: Business Development
              <span className="status-badge warning">Pending</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn primary">
              Manage
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Leadership Development</div>
            <div className="item-subtitle">
              12 active pairs • Focus: Leadership Skills
              <span className="status-badge success">Active</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn primary">
              Manage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
