import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileSettingsPanel } from '../../settings/ProfileSettingsPanel';

// Simple smoke + persistence test

describe('ProfileSettingsPanel', () => {
  const userId = 'test-user-123';
  const storageKey = `profile-settings-v2:${userId}`;

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders and shows default values', async () => {
    render(<ProfileSettingsPanel userId={userId} />);
    // Wait for async load to finish
    await screen.findByText(/Profile Settings/i);
    const select = await screen.findByLabelText(/Profile Visibility/i) as HTMLSelectElement;
    expect(select.value).toBe('public');
  });

  it('persists a theme change', async () => {
    render(<ProfileSettingsPanel userId={userId} />);
    const themeSelect = await screen.findByLabelText(/Theme/i) as HTMLSelectElement;
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    await waitFor(() => {
      const raw = localStorage.getItem(storageKey);
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.theme).toBe('dark');
    });
  });
});
