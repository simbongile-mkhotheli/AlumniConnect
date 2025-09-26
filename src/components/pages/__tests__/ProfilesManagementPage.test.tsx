import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilesManagementPage from '../ProfilesManagementPage';

// Placeholder smoke test validating the simplified "Coming Soon" page.
describe('ProfilesManagementPage Placeholder', () => {
  it('renders coming soon messaging without legacy grid', () => {
    render(
      <MemoryRouter>
        <ProfilesManagementPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Alumni Profiles \(Coming Soon\)/i)).toBeInTheDocument();
    expect(screen.getByText(/legacy management interface has been removed/i)).toBeInTheDocument();

    // Ensure legacy elements no longer appear
    expect(screen.queryByText(/Create Profile/i)).toBeNull();
    expect(screen.queryByText(/Loading profiles/i)).toBeNull();
  });
});
