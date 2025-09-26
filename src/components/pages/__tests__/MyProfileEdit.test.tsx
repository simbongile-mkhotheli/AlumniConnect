import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { UserProvider } from '../../../contexts/UserContext';
import { MyProfilePage } from '../MyProfilePage';

// Basic mock for react-router-dom navigate
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock data loader to provide a single user
vi.mock('../../../utils/mockDataLoader', async () => {
  const actual = await vi.importActual<any>('../../../utils/mockDataLoader');
  return {
    ...actual,
    MockDataLoader: {
      ...actual.MockDataLoader,
      getUsers: vi.fn().mockResolvedValue([
        {
          id: 'u-test',
          email: 'test@example.com',
          firstName: 'Test',
            lastName: 'User',
          fullName: 'Test User',
          role: 'alumni',
          status: 'active',
          avatar: 'https://example.com/avatar.png',
          bio: 'Initial bio',
          location: 'City',
          company: 'InitialCo',
          jobTitle: 'Engineer',
          graduationYear: 2020,
          skills: ['React','TypeScript'],
          interests: ['Open Source'],
          chapterId: 'chap-1',
          isVerified: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]),
      clearCache: vi.fn(),
    }
  };
});

describe('MyProfilePage Editing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows editing bio and saving', async () => {
    const initialUser = {
      id: 'u-test',
      name: 'Test User',
      email: 'test@example.com',
      role: 'alumni' as const,
      profileImage: 'https://example.com/avatar.png',
      initials: 'TU',
      isActive: true,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString(),
      impactScore: 100,
      badges: ['Verified'],
      company: 'InitialCo',
      jobTitle: 'Engineer',
      location: 'City',
      bio: 'Initial bio',
      skills: ['React','TypeScript'],
      interests: ['Open Source'],
  preferences: { theme: 'light' as const, notifications: { email: true, push: true, events: true, mentorship: false, opportunities: true }, privacy: { profileVisible: true, contactVisible: true, activityVisible: true } }
    };

    render(<UserProvider initialUser={initialUser}><MyProfilePage /></UserProvider>);

    // Wait for loading
  const heading = await screen.findByRole('heading', { name: /my profile/i });
  expect(heading).toBeInTheDocument();

    // Enter edit mode
  const editButton = screen.getByRole('button', { name: /edit profile/i });
  await userEvent.click(editButton);

  const bioField = await screen.findByLabelText(/bio/i);
  await userEvent.clear(bioField);
  await userEvent.type(bioField, 'Updated professional bio');

  const saveBtn = screen.getByRole('button', { name: /save changes/i });
  await userEvent.click(saveBtn);

    // Wait until edit mode exits and updated bio is visible in overview
    await waitFor(() => {
      expect(screen.getByText('Updated professional bio')).toBeInTheDocument();
    });
  });
});
