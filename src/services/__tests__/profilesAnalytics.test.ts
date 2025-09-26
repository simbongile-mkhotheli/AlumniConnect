import { describe, it, expect } from 'vitest';
import ProfilesService from '../profilesService';

// Phase 3 analytics placeholder tests
// Ensures deterministic structure & reasonable value ranges without snapshot fragility.

describe('ProfilesService.getAnalytics', () => {
  it('returns null for unknown user', async () => {
    const analytics = await ProfilesService.getAnalytics('non-existent-user');
    expect(analytics).toBeNull();
  });

  it('returns deterministic analytics shape for a real user', async () => {
    const all = await ProfilesService.getAllProfiles();
    const target = all[0];
    const a1 = await ProfilesService.getAnalytics(target.id);
    const a2 = await ProfilesService.getAnalytics(target.id);
    expect(a1).toBeTruthy();
    expect(a2).toBeTruthy();
    // Deterministic (excluding generatedAt timestamp which will differ)
    const { generatedAt: g1, ...rest1 } = a1!;
    const { generatedAt: g2, ...rest2 } = a2!;
    expect(rest1).toEqual(rest2);
    expect(a1!.mentorship.activeMentorships).toBeGreaterThanOrEqual(0);
    expect(a1!.mentorship.averageSessionCompletionRate).toBeGreaterThanOrEqual(0);
    expect(a1!.mentorship.averageSessionCompletionRate).toBeLessThanOrEqual(1);
    expect(a1!.achievements.total).toBeGreaterThanOrEqual(0);
    expect(a1!.engagement.profileViews).toBeGreaterThanOrEqual(50);
    expect(a1!.meta.deterministic).toBe(true);
  });

  it('timeline entries span 7 days and only contain allowed event types', async () => {
    const first = (await ProfilesService.getAllProfiles())[0];
    const analytics = await ProfilesService.getAnalytics(first.id);
    expect(analytics!.timeline.length).toBe(7);
    const allowed = new Set(['mentorship_start','mentorship_session','achievement','login','profile_update']);
    for (const day of analytics!.timeline) {
      for (const ev of day.events) {
        expect(allowed.has(ev.type)).toBe(true);
      }
    }
  });
});
