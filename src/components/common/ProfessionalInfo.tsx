import React from 'react';
import type { DbUser } from '../../types';

interface ProfessionalInfoProps {
  profile: Partial<DbUser> & {
    title?: string;
    company?: string;
    location?: string;
    yearsExperience?: number | string;
    degree?: string;
    university?: string;
    graduationYear?: number | string;
  };
  compact?: boolean;
}

const label = (text: string) => <span className="pi-label">{text}</span>;

export const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({ profile, compact = false }) => {
  const rows: Array<{ label: string; value: React.ReactNode }> = [];

  const safe = (v: any) => (v === undefined || v === null || v === '' ? <em className="pi-empty">—</em> : v);

  rows.push({ label: 'Title', value: safe(profile.title) });
  rows.push({ label: 'Company', value: safe(profile.company) });
  rows.push({ label: 'Location', value: safe(profile.location) });
  rows.push({ label: 'Experience', value: safe(profile.yearsExperience ? `${profile.yearsExperience} yrs` : '') });
  rows.push({ label: 'Degree', value: safe(profile.degree) });
  rows.push({ label: 'University', value: safe(profile.university) });
  rows.push({ label: 'Graduation', value: safe(profile.graduationYear) });

  const hasAny = rows.some(r => r.value && r.value !== '—' && (r.value as any)?.props?.className !== 'pi-empty');

  return (
    <div className={`professional-info ${compact ? 'compact' : ''}`}>
      <h3 className="info-section-title">💼 Professional Information</h3>
      {!hasAny && (
        <div className="pi-empty-state">
          <p>No professional details added yet.</p>
          <p className="pi-hint">Use the profile editor to add your job title, company, education and experience.</p>
        </div>
      )}
      <div className="pi-grid">
        {rows.map(r => (
          <div key={r.label} className="pi-row">
            {label(r.label)}
            <span className="pi-value">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessionalInfo;