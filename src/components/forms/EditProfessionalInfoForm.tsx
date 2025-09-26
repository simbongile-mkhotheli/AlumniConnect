import React, { useState, useEffect } from 'react';
import type { DbUser } from '../../types';
import { FormField } from '../common/forms/FormField';
import { TagInput } from '../common/forms/TagInput';

export interface EditProfessionalInfoFormProps {
  profile: DbUser;
  onCancel: () => void;
  onSaved: (updates: Partial<DbUser>) => void;
  saveUpdates?: (updates: Partial<{ company: string; jobTitle: string; location: string; bio: string; skills: string[]; interests: string[] }>) => Promise<{ success: boolean; error?: string }>;
}

// Extracted reusable professional info editing form.
// Responsibilities:
// - Local state management for editable professional profile fields
// - Submit via optional saveUpdates function (optimistic already handled upstream)
// - Emit sanitized updates through onSaved
// - Provide basic success & error inline feedback
export const EditProfessionalInfoForm: React.FC<EditProfessionalInfoFormProps> = ({ profile, onCancel, onSaved, saveUpdates }) => {
  const [company, setCompany] = useState(profile.company || '');
  const [jobTitle, setJobTitle] = useState(profile.jobTitle || '');
  const [location, setLocation] = useState(profile.location || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [interests, setInterests] = useState<string[]>(profile.interests || []);
  // Sync local state with profile prop changes (id or updatedAt)
  useEffect(() => {
    setCompany(profile.company || '');
    setJobTitle(profile.jobTitle || '');
    setLocation(profile.location || '');
    setBio(profile.bio || '');
    setSkills(profile.skills || []);
    setInterests(profile.interests || []);
  }, [profile.id, profile.updatedAt]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    const updates = {
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      location: location.trim(),
      bio: bio.trim(),
      skills: skills.map(s => s.trim()).filter(Boolean),
      interests: interests.map(s => s.trim()).filter(Boolean),
    };

    try {
      if (saveUpdates) {
        const result = await saveUpdates(updates);
        if (!result.success) {
          throw new Error(result.error || 'Failed to save');
        }
      }
      onSaved(updates);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card profile-edit-card" aria-label="Edit Professional Information">
      <div className="card-header">
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>Edit Professional Information</h3>
          <div className="card-subtitle">Update your professional profile details. Use Enter or comma to add skills & interests.</div>
        </div>
        <div className="card-actions" style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={saving}>Cancel</button>
          <button form="edit-professional-form" type="submit" className="btn btn-primary" aria-label="Save Changes" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
      <div className="card-body">
        {error && <div className="form-error" role="alert">{error}</div>}
  {success && <div className="form-success" role="status">Saved</div>}
        <form id="edit-professional-form" onSubmit={handleSubmit} className="profile-edit-form" style={{ display: 'grid', gap: '20px' }}>
          <div className="form-grid">
            <FormField id="company" label="Company" helpText="Your current employer">
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" onBlur={() => setCompany(c => c.trim())} />
            </FormField>
            <FormField id="jobTitle" label="Job Title" helpText="Your current role or position">
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Job Title" onBlur={() => setJobTitle(t => t.trim())} />
            </FormField>
            <FormField id="location" label="Location" helpText="City, Country">
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" onBlur={() => setLocation(l => l.trim())} />
            </FormField>
            <FormField id="bio" label="Bio" helpText="Short professional summary">
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Short professional bio" onBlur={() => setBio(b => b.trim())} />
            </FormField>
            <FormField id="skills" label="Skills" helpText="Add a skill and press Enter">
              <TagInput id="skills-input" values={skills} onChange={setSkills} ariaLabel="Skills" placeholder="Add skill" />
            </FormField>
            <FormField id="interests" label="Interests" helpText="Add an interest and press Enter">
              <TagInput id="interests-input" values={interests} onChange={setInterests} ariaLabel="Interests" placeholder="Add interest" />
            </FormField>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfessionalInfoForm;
