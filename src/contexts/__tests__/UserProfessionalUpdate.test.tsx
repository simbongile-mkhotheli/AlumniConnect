import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { UserProvider, useAuth } from '../UserContext';
import api from '../../services/api';

// Spy will replace patch method for each test; avoids fragile path-based vi.mock
let patchSpy: any;

vi.mock('../../utils/mockDataLoader', async () => {
  const actual = await vi.importActual<any>('../../utils/mockDataLoader');
  return {
    ...actual,
    MockDataLoader: {
      ...actual.MockDataLoader,
      clearCache: vi.fn(),
    }
  };
});

const baseUser = {
  id: 'u-test',
  name: 'Test User',
  email: 'test@example.com',
  role: 'alumni' as const,
  profileImage: '',
  initials: 'TU',
  isActive: true,
  joinDate: new Date().toISOString().split('T')[0],
  lastLogin: new Date().toISOString(),
  impactScore: 123,
  badges: ['Verified'],
  company: 'InitCo',
  jobTitle: 'Engineer',
  location: 'City',
  bio: 'Bio',
  skills: ['React'],
  interests: ['Open Source'],
  preferences: { theme: 'light' as const, notifications: { email: true, push: true, events: true, mentorship: false, opportunities: true }, privacy: { profileVisible: true, contactVisible: true, activityVisible: true } }
};

describe('UserContext professional updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Fresh spy each test
    patchSpy = vi.spyOn(api as any, 'patch').mockResolvedValue({ data: {} });
  });

  it('recomputes badges when skills are updated', async () => {
    const wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => <UserProvider initialUser={baseUser}>{children}</UserProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.updateProfessionalInfo({ skills: ['React','TypeScript','Node','Testing'] });
    });

    expect(result.current.user?.badges).toContain('Skilled Professional');
    expect(patchSpy).toHaveBeenCalledTimes(1);
  });

  it('rolls back on patch failure', async () => {
    patchSpy.mockRejectedValueOnce(new Error('Network'));
    const wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => <UserProvider initialUser={baseUser}>{children}</UserProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const res = await result.current.updateProfessionalInfo({ bio: 'New Bio Value' });
      expect(res.success).toBe(false);
    });

    expect(result.current.user?.bio).toBe('Bio');
    expect(patchSpy).toHaveBeenCalledTimes(1);
  });
});
