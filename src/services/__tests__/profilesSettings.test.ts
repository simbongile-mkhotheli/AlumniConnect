import { describe, it, expect, beforeEach } from 'vitest';
import ProfilesService from '../profilesService';

// Phase 4 settings persistence tests

describe('ProfilesService settings persistence', () => {
  const userId = 'test-user-settings-1';
  const key = `profile-settings-v2:${userId}`;

  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults and persists them on first get', async () => {
    const settings = await ProfilesService.getSettings(userId);
    expect(settings.userId).toBe(userId);
    expect(settings.visibility).toBe('public');
    expect(settings.notifications.digestFrequency).toBe('weekly');
    const raw = localStorage.getItem(key);
    expect(raw).toBeTruthy();
  });

  it('merges updates preserving unspecified fields (including nested)', async () => {
    const initial = await ProfilesService.getSettings(userId);
    const updated = await ProfilesService.updateSettings(userId, {
      visibility: 'private',
      notifications: { digestFrequency: 'monthly' } as any,
    });
    expect(updated.visibility).toBe('private');
    // unchanged nested field preserved
    expect(updated.notifications.emailEvents).toBe(initial.notifications.emailEvents);
    expect(updated.notifications.digestFrequency).toBe('monthly');
    // second fetch returns merged version
    const fetched = await ProfilesService.getSettings(userId);
    expect(fetched.visibility).toBe('private');
    expect(fetched.notifications.digestFrequency).toBe('monthly');
  });
});
