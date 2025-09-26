import { describe, it, expect } from 'vitest';
import ProfilesService from '../profilesService';

// Basic tests to validate Phase 1 mapping logic.

describe('ProfilesService', () => {
  it('returns all profiles with computed impactScore & badges', async () => {
    const profiles = await ProfilesService.getAllProfiles();
    expect(Array.isArray(profiles)).toBe(true);
    expect(profiles.length).toBeGreaterThan(0);
    for (const p of profiles) {
      expect(typeof p.impactScore).toBe('number');
      // badges added by mapping layer
      expect(Array.isArray((p as any).badges)).toBe(true);
    }
  });

  it('returns single profile by id with expected fields', async () => {
    const all = await ProfilesService.getAllProfiles();
    const first = all[0];
    const fetched = await ProfilesService.getProfileById(first.id);
    expect(fetched).toBeTruthy();
    expect(fetched?.id).toBe(first.id);
    expect(fetched?.name).toBe(first.name);
    expect(typeof fetched?.impactScore).toBe('number');
    expect(Array.isArray((fetched as any).badges)).toBe(true);
  });
});
