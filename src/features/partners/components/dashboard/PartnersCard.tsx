import React from 'react';

interface PartnersCardProps {
  onCreatePartner?: () => void;
  onClose?: () => void;
}

export function PartnersCard({ onCreatePartner, onClose }: PartnersCardProps) {
  const handleCreatePartner = () => {
    console.log('➕ Create partner clicked');
    if (onCreatePartner) {
      onCreatePartner();
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
        <div className="admin-card-title">Active Partners</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="admin-card-action primary"
            onClick={handleCreatePartner}
            title="Create New Partner"
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
            ➕ Create Partner
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
      <div className="admin-card-body">
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Microsoft Azure</div>
            <div className="item-subtitle">
              Technology Partner • Cloud Services
              <span className="status-badge success">Active</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn primary">
              Edit
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">AWS Education</div>
            <div className="item-subtitle">
              Education Partner • Training Resources
              <span className="status-badge success">Active</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn primary">
              Edit
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">Google for Startups</div>
            <div className="item-subtitle">
              Startup Partner • Mentorship & Resources
              <span className="status-badge success">Active</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn primary">
              Edit
            </a>
          </div>
        </div>
        <div className="admin-list-item">
          <div className="item-info">
            <div className="item-title">LinkedIn Learning</div>
            <div className="item-subtitle">
              Learning Partner • Course Access
              <span className="status-badge success">Active</span>
            </div>
          </div>
          <div className="item-actions">
            <a href="#" className="item-btn primary">
              Edit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
