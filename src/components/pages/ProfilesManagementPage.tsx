import React from 'react';
import { useEffect, useState } from 'react';
import ProfilesService from '../../services/profilesService';
import type { MappedUserProfile } from '../../services/profileMapping';

// Canonical placeholder for Alumni Profiles Manager (admin) until rebuild.
// Legacy implementation removed intentionally. Do not reintroduce complex logic here.
export const ProfilesManagementPage: React.FC = () => {
  /**
   * DATA CONSISTENCY CONTRACT (Profiles Domain)
   * ------------------------------------------------------------
   * This placeholder page intentionally replaces the legacy admin UI.
   * While the UI is deferred, we still enforce a consistent data model
   * across any consumer (dashboard KPIs, profile details, settings, etc.).
   *
   * Regional Chapters Manager acts as the reference pattern for:
   *  - Service abstraction (read/write segregation)
   *  - Normalized API shapes (PaginatedResponse, ApiResponse)
   *  - Consistent loading & error surface (isLoading, error message)
   *  - Filter pipeline (status, search, location) -> Profiles will mirror (status, search, role, employment)
   *
   * Canonical Profile Shape (mapped, not raw DbUser):
   *  interface Profile {
   *    id: string;
   *    name: string;              // display name (from fullName or composed)
   *    email: string;
   *    role: 'admin' | 'alumni' | 'mentor' | 'mentee' | 'student';
   *    status: 'active' | 'inactive' | 'pending' | 'suspended';
   *    employment?: string;       // normalized employment category
   *    company?: string;
   *    jobTitle?: string;
   *    location?: string;
   *    impactScore: number;       // derived metric (stable, deterministic in mocks)
   *    badges: string[];          // sorted semantic badge tokens
   *    profileImage?: string;     // avatar URL
   *    isVerified: boolean;
   *    createdAt: string;         // ISO
   *    updatedAt: string;         // ISO
   *  }
   *
   * Required Consistency Rules:
   *  1. All reads MUST go through ProfilesService (never use MockDataLoader directly in admin list rebuild).
   *  2. All writes MUST go through ProfilesMutationService (approve, suspend, reactivate, updateProfile, deleteProfile).
   *  3. After any mutation, invalidate cached users: MockDataLoader.clearCache('users').
   *  4. Pagination contract (planned): { items, total, page, pageSize }.
   *  5. Error normalization: service methods return throws or { success:false, message } (to be harmonized with Chapters pattern in Phase 2).
   *  6. Loading flags: use isLoading / isSaving naming (avoid mixed verbs) for parity with future shared hooks.
   *  7. Deterministic derived fields (impactScore, badges ordering) must be computed in a single mapping layer.
   *
   * Forthcoming Phases (Profiles Rebuild):
   *  Phase 1: Extract shared domain gateway interface (see README plan) and adapt ProfilesService.
   *  Phase 2: Introduce useProfilesList / useProfileItem hooks matching Chapters generics.
   *  Phase 3: Implement pagination + filter harmonization (status, role, employment, search) with debounced search.
   *  Phase 4: Add optimistic mutation helpers (approve/suspend) with rollback parity to Chapters bulk operations style.
   *  Phase 5: Contract tests ensuring stable shape & error behavior.
   *
   * Dev-only Diagnostics Panel (temporary): Controlled by localStorage flag `ac_dev_profiles_diag = 'true'`.
   */
  const showDiagnostics = typeof window !== 'undefined' && localStorage.getItem('ac_dev_profiles_diag') === 'true';
  const [diagUsers, setDiagUsers] = useState<MappedUserProfile[] | null>(null);
  const [diagError, setDiagError] = useState<string | null>(null);

  useEffect(() => {
    if (!showDiagnostics) return;
    let cancelled = false;
    (async () => {
      try {
        const profiles = await ProfilesService.getAllProfiles();
        if (!cancelled) setDiagUsers(profiles);
      } catch (e: any) {
        if (!cancelled) setDiagError(e?.message || 'Failed to load profiles');
      }
    })();
    return () => { cancelled = true; };
  }, [showDiagnostics]);

  return (
    <div style={{
      padding: '80px 32px',
      maxWidth: 900,
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '2.75rem',
        margin: 0,
        background: 'linear-gradient(90deg,#667eea,#764ba2)',
        WebkitBackgroundClip: 'text',
        color: 'transparent'
      }}>Alumni Profiles (Coming Soon)</h1>
      <p style={{
        marginTop: 18,
        fontSize: 18,
        lineHeight: 1.55,
        color: '#4a5568'
      }}>
        The legacy management interface has been removed. A redesigned experience focusing on
        performance, unified detail/list views, and robust moderation workflows will arrive soon.
      </p>
      <div style={{
        marginTop: 40,
        display: 'grid',
        gap: 20,
        gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))'
      }}>
        {[
          'Unified list & detail layout',
          'Virtualized large datasets',
          'Bulk status & verification actions',
          'Impact metrics & badge insights',
          'Consistent role/status badges'
        ].map(item => (
          <div key={item} style={{
            padding: '18px 16px',
            borderRadius: 14,
            background: 'linear-gradient(135deg,#ffffff,#f5f8ff)',
            border: '1px solid rgba(102,126,234,0.18)',
            textAlign: 'left',
            boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
              fontSize: 14,
              color: '#2d3748'
            }}>
              <span role="img" aria-label="rocket">🚀</span> {item}
            </div>
          </div>
        ))}
      </div>
      <p style={{
        marginTop: 48,
        fontSize: 13,
        color: '#718096'
      }}>
        Placeholder ID: <strong>PROFILES-PLACEHOLDER-CORE</strong>. Open an issue titled
        "Profiles Manager Rebuild" to propose requirements.
      </p>
      {showDiagnostics && (
        <div style={{
          marginTop: 48,
          padding: '24px 28px',
          background: '#1a202c',
          color: '#e2e8f0',
          textAlign: 'left',
          borderRadius: 12,
          fontSize: 13,
          lineHeight: 1.5
        }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.15rem', color: '#63b3ed' }}>Dev Diagnostics: Profiles Data Contract</h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>All reads via ProfilesService (mapped profiles)</li>
            <li>All writes via ProfilesMutationService (cache invalidate)</li>
            <li>Planned pagination wrapper aligning with Chapters list</li>
            <li>Consistent status & role enums (see contract JSDoc)</li>
            <li>Deterministic impactScore & ordered badges</li>
            <li>Hooks consolidation (useProfilesList/useProfileItem) pending</li>
          </ul>
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#90cdf4', fontWeight: 600, marginBottom: 8 }}>Live Users Preview</div>
            {diagError && <div style={{ color: '#feb2b2' }}>Error: {diagError}</div>}
            {!diagUsers && !diagError && <div style={{ opacity: 0.8 }}>Loading users…</div>}
            {diagUsers && (
              <div>
                <div style={{ marginBottom: 8 }}>Fetched: <strong>{diagUsers.length}</strong> profiles</div>
                <ol style={{ margin: 0, paddingLeft: 18 }}>
                  {diagUsers.slice(0, 10).map(u => (
                    <li key={u.id}>
                      <span style={{ color: '#e2e8f0' }}>{u.name}</span>
                      <span style={{ color: '#a0aec0' }}> • {u.email}</span>
                      <span style={{ color: '#cbd5e0' }}> • {u.role}</span>
                      <span style={{ color: u.status === 'active' ? '#9ae6b4' : '#fbd38d' }}> • {u.status}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
          <p style={{ marginTop: 12, opacity: 0.8 }}>Disable this panel by removing localStorage key: ac_dev_profiles_diag</p>
        </div>
      )}
    </div>
  );
};

export default ProfilesManagementPage;