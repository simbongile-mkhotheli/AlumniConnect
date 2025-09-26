import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfessionalInfoSection } from '../ProfessionalInfoSection';
import type { DbUser } from '../../../types';

const profile: DbUser = {
  id: 'u1',
  email: 'user@example.com',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  role: 'alumni',
  status: 'active',
  avatar: '/vite.svg',
  bio: 'Engineer passionate about open source.',
  location: 'Remote',
  company: 'Acme Corp',
  jobTitle: 'Senior Engineer',
  graduationYear: 2023,
  skills: ['React', 'TypeScript'],
  interests: ['AI', 'Startups'],
  chapterId: 'chapter-1',
  isVerified: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ProfessionalInfoSection', () => {
  it('renders professional info fields', () => {
    render(<ProfessionalInfoSection profile={profile} />);
    expect(screen.getByText('Professional Information')).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
    expect(screen.getByText(/Senior Engineer/)).toBeInTheDocument();
    expect(screen.getByText(/Engineer passionate/)).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('shows placeholders when data missing', () => {
    const minimal: DbUser = { ...profile, company: '', jobTitle: '', bio: '', skills: [], interests: [] };
    render(<ProfessionalInfoSection profile={minimal} />);
    expect(screen.getAllByText('Not specified').length).toBeGreaterThan(0);
    expect(screen.getByText('No bio provided.')).toBeInTheDocument();
    expect(screen.getByText('No skills added.')).toBeInTheDocument();
    expect(screen.getByText('No interests added.')).toBeInTheDocument();
  });
});
