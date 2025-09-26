import React from 'react';
import type { DbUser } from '../../types';

export interface ProfessionalInfoSectionProps {
  profile: DbUser;
  onEdit?: () => void;
  compact?: boolean;
}

// Displays professional information in a consistent card layout.
export const ProfessionalInfoSection: React.FC<ProfessionalInfoSectionProps> = ({ profile, onEdit, compact }) => {
  const hasSkills = (profile.skills || []).length > 0;
  const hasInterests = (profile.interests || []).length > 0;

  return (
    <div className={`card professional-info-card ${compact ? 'compact' : ''}`.trim()}>
      <div className="card-header">
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>Professional Information</h3>
          <div className="card-subtitle">Your current role and profile details</div>
        </div>
        {onEdit && (
          <div className="card-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={onEdit}>Edit</button>
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="professional-grid" style={{ display: 'grid', gap: '24px' }}>
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-secondary)' }}>Role & Company</h4>
            <div style={{ lineHeight: 1.5 }}>
              <div><strong>Company:</strong> {profile.company || <span style={{ opacity: .6 }}>Not specified</span>}</div>
              <div><strong>Job Title:</strong> {profile.jobTitle || <span style={{ opacity: .6 }}>Not specified</span>}</div>
              <div><strong>Location:</strong> {profile.location || <span style={{ opacity: .6 }}>Not specified</span>}</div>
              <div><strong>Graduation Year:</strong> {profile.graduationYear || <span style={{ opacity: .6 }}>—</span>}</div>
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-secondary)' }}>Bio</h4>
            <p style={{ margin: 0 }}>{profile.bio || <span style={{ opacity: .6 }}>No bio provided.</span>}</p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-secondary)' }}>Skills</h4>
            {hasSkills ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profile.skills.map((s, i) => (
                  <span key={i} className="skill-tag">{s}</span>
                ))}
              </div>
            ) : <span style={{ opacity: .6 }}>No skills added.</span>}
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-secondary)' }}>Interests</h4>
            {hasInterests ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profile.interests.map((s, i) => (
                  <span key={i} className="interest-tag">{s}</span>
                ))}
              </div>
            ) : <span style={{ opacity: .6 }}>No interests added.</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInfoSection;