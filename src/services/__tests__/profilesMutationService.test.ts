import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilesMutationService from '../profilesMutationService';
import { MockDataLoader } from '../../utils/mockDataLoader';

vi.mock('../../utils/mockDataLoader', async () => {
  const actual = await vi.importActual<any>('../../utils/mockDataLoader');
  return {
    ...actual,
    MockDataLoader: {
      ...actual.MockDataLoader,
      getUsers: vi.fn(async () => ([
        { id: '1', name: 'Test User', email: 't@example.com', role: 'alumni', status: 'pending', impactScore: 100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), skills: [], interests: [] }
      ])),
      updateUser: vi.fn(async (_id: string, patch: any) => ({ id: '1', name: 'Test User', email: 't@example.com', role: 'alumni', status: patch.status || 'pending', impactScore: 100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), skills: [], interests: [] })),
      deleteUser: vi.fn(async () => true)
    }
  };
});

describe('ProfilesMutationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('approves a profile', async () => {
    const result = await ProfilesMutationService.approveProfile('1');
    expect(result?.status).toBe('active');
  });

  it('suspends a profile', async () => {
    const result = await ProfilesMutationService.suspendProfile('1');
    expect(result?.status).toBe('suspended');
  });

  it('reactivates a profile', async () => {
    const result = await ProfilesMutationService.reactivateProfile('1');
    expect(result?.status).toBe('active');
  });

  it('deletes a profile', async () => {
    const ok = await ProfilesMutationService.deleteProfile('1');
    expect(ok).toBe(true);
  });
});
