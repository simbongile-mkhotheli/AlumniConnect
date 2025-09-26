import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditProfessionalInfoForm } from '../EditProfessionalInfoForm';
import type { DbUser } from '../../../types';

const baseProfile: DbUser = {
  id: 'test-user',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  role: 'alumni',
  status: 'active',
  avatar: '/vite.svg',
  bio: 'Initial bio',
  location: 'Remote',
  company: 'InitCorp',
  jobTitle: 'Engineer',
  graduationYear: 2024,
  skills: ['React', 'TypeScript'],
  interests: ['AI'],
  chapterId: 'chapter-1',
  isVerified: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('EditProfessionalInfoForm', () => {
  it('updates fields when profile prop changes', async () => {
    const initialProfile = { ...baseProfile, company: 'InitCorp', jobTitle: 'Engineer', skills: ['React'] };
    const updatedProfile = { ...baseProfile, company: 'NewCorp', jobTitle: 'Lead', skills: ['React', 'TypeScript'], updatedAt: new Date().toISOString() };
    const { rerender } = render(<EditProfessionalInfoForm profile={initialProfile} onCancel={() => {}} onSaved={() => {}} />);
    expect(screen.getByLabelText('Company')).toHaveValue('InitCorp');
    expect(screen.getByLabelText('Job Title')).toHaveValue('Engineer');
  expect(screen.getByRole('list', { name: 'Skills' })).toHaveTextContent('React');
    rerender(<EditProfessionalInfoForm profile={updatedProfile} onCancel={() => {}} onSaved={() => {}} />);
    expect(screen.getByLabelText('Company')).toHaveValue('NewCorp');
    expect(screen.getByLabelText('Job Title')).toHaveValue('Lead');
  const list = screen.getByRole('list', { name: 'Skills' });
    expect(list).toHaveTextContent('React');
    expect(list).toHaveTextContent('TypeScript');
  });
  it('renders with initial profile values (accessible labels)', () => {
    render(<EditProfessionalInfoForm profile={baseProfile} onCancel={() => {}} onSaved={() => {}} />);
    expect(screen.getByLabelText('Company')).toHaveValue('InitCorp');
    expect(screen.getByLabelText('Job Title')).toHaveValue('Engineer');
    expect(screen.getByLabelText('Location')).toHaveValue('Remote');
  });

  it('submits updates and calls saveUpdates then onSaved', async () => {
    const saveUpdates = vi.fn().mockResolvedValue({ success: true });
    const onSaved = vi.fn();
    render(<EditProfessionalInfoForm profile={baseProfile} onCancel={() => {}} onSaved={onSaved} saveUpdates={saveUpdates} />);

  fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'NewCorp' } });
    // Submit via the form element by id or fallback to clicking Save
    const form = document.getElementById('edit-professional-form');
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(screen.getByText('Save'));
    }

    await waitFor(() => expect(saveUpdates).toHaveBeenCalled());
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ company: 'NewCorp' }));
  });

  it('shows error when saveUpdates fails', async () => {
    const saveUpdates = vi.fn().mockResolvedValue({ success: false, error: 'Boom' });
    render(<EditProfessionalInfoForm profile={baseProfile} onCancel={() => {}} onSaved={() => {}} saveUpdates={saveUpdates} />);

  fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'BrokenCorp' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Boom'));
  });

  it('renders success feedback after successful save', async () => {
    const saveUpdates = vi.fn().mockResolvedValue({ success: true });
    render(<EditProfessionalInfoForm profile={baseProfile} onCancel={() => {}} onSaved={() => {}} saveUpdates={saveUpdates} />);
  fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'SuccessCorp' } });
    const form = document.getElementById('edit-professional-form');
    if (form) fireEvent.submit(form);
    await waitFor(() => expect(saveUpdates).toHaveBeenCalled());
    // Success message exists
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });

  it('allows adding and removing skills via TagInput', async () => {
    const onSaved = vi.fn();
    render(<EditProfessionalInfoForm profile={baseProfile} onCancel={() => {}} onSaved={onSaved} />);
  const list = screen.getByRole('list', { name: 'Skills' });
    const input = list.querySelector('input');
    expect(input).toBeTruthy();
    if (!input) return;
    // Add new tag
  fireEvent.change(input, { target: { value: 'Node.js' } });
  fireEvent.keyDown(input, { key: 'Enter' });
    expect(list).toHaveTextContent('Node.js');
    // Remove existing tag (React)
    const removeButton = screen.getByLabelText('Remove tag React');
    fireEvent.click(removeButton);
    expect(list).not.toHaveTextContent('React');
  });
});
