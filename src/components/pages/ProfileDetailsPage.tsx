import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { AlumniProfile } from '../../types';
import ProfilesService from '../../services/profilesService';

// Phase 1 minimalist read‑only profile details page using unified ProfilesService.
// Rich tabbed UI & actions will return in later phases after write pathways unify.

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};

const ProfileDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (id) void load(id); }, [id]);

  const load = async (profileId: string) => {
    try {
      setLoading(true); setError(null);
      const result = await ProfilesService.getProfileById(profileId);
      if (!result) throw new Error('Profile not found');
      const mapped: AlumniProfile = {
        id: result.id,
        name: result.name,
        email: result.email,
        status: result.status,
        role: result.role === 'mentor' ? 'mentor' : 'none',
        isActive: result.status === 'active',
        employment: 'student', // placeholder valid value
        company: result.company || undefined,
        position: result.jobTitle || undefined,
        description: result.bio || '',
        bio: result.bio || '',
        skills: result.skills || [],
        tags: (result.skills || []).slice(0, 3),
        interests: result.interests || [],
        impactScore: result.impactScore,
        joinDate: result.createdAt,
        lastLogin: result.lastLoginAt,
        lastActive: result.lastLoginAt,
        profileViews: 0,
        connectionCount: 0,
        endorsementCount: 0,
        education: [],
        achievements: [],
        privacy: { profileVisibility: 'public', contactInfoVisible: true, employmentVisible: true, mentorshipVisible: true },
        verificationStatus: result.isVerified ? 'verified' : 'pending',
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      };
      (mapped as any).badges = (result as any).badges;
      setProfile(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally { setLoading(false); }
  };

  const handleBack = () => navigate('/admin/profiles');

  if (loading) return <div className="admin-dashboard"><LoadingSpinner text="Loading profile..." /></div>;
  if (error) return <div className="admin-dashboard"><ErrorMessage error={error} title="Profile Error" variant="card" /></div>;
  if (!profile) return null;

  return (
    <div className="admin-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>{profile.name}</h2>
          <div style={{ color: '#4A5568', fontSize: 14 }}>{profile.email}</div>
          <div style={{ color: '#A0AEC0', fontSize: 12 }}>Joined {formatDate(profile.joinDate)}</div>
        </div>
        <div><button className="btn btn-outline" onClick={handleBack}>Back</button></div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
        <div className="card" style={{ padding: 12 }}><strong>Status:</strong><br />{profile.status}</div>
        <div className="card" style={{ padding: 12 }}><strong>Role:</strong><br />{profile.role}</div>
        <div className="card" style={{ padding: 12 }}><strong>Impact Score:</strong><br />{profile.impactScore}</div>
        <div className="card" style={{ padding: 12 }}><strong>Badges:</strong><br />{(profile as any).badges && (profile as any).badges.length ? (profile as any).badges.join(', ') : '—'}</div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 8px' }}>Profile Summary</h3>
        <p style={{ margin: 0 }}>{profile.bio || 'No bio provided.'}</p>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 8px' }}>Skills</h3>
        {profile.skills.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {profile.skills.map(skill => (
              <span key={skill} className="badge" style={{ background: '#EDF2F7', padding: '4px 8px', borderRadius: 4 }}>{skill}</span>
            ))}
          </div>
        ) : <span style={{ color: '#A0AEC0' }}>None</span>}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 8px' }}>Interests</h3>
        {profile.interests && profile.interests.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {profile.interests.map(int => (
              <span key={int} className="badge" style={{ background: '#FAF5FF', padding: '4px 8px', borderRadius: 4 }}>{int}</span>
            ))}
          </div>
        ) : <span style={{ color: '#A0AEC0' }}>None</span>}
      </div>
    </div>
  );
};

export default ProfileDetailsPage;
