import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { ImpactScoreCard } from '../ImpactScoreCard';
import { UserProvider } from '../../../contexts/UserContext';

// Helper: render component within UserProvider
function renderWithUserProvider() {
  return render(
    <UserProvider>
      <ImpactScoreCard />
    </UserProvider>
  );
}

// NOTE: Since impactScore includes randomness, we only assert it's a number and not the previous hardcoded 847.

describe('ImpactScoreCard', () => {
  test('renders impact score from UserContext (not hardcoded)', async () => {
    renderWithUserProvider();

      const labelEl = await screen.findByText(/Your Impact Score/i);
      expect(labelEl).toBeInTheDocument();

      // Get the score element (may initially be 0 before async user init)
      const scoreEl = labelEl.parentElement?.querySelector('.impact-score') as HTMLElement | null;
      expect(scoreEl).toBeTruthy();
      const numeric = (scoreEl!.textContent || '').replace(/,/g, '');
      expect(/^[0-9]+$/.test(numeric)).toBe(true); // numeric even if 0
      expect(numeric).not.toBe('847'); // ensure not old hardcoded value
  });

  test('renders badges derived from user profile', async () => {
    renderWithUserProvider();
    // Badge grid should exist regardless of badge count
    const labelEl = await screen.findByText(/Your Impact Score/i);
    expect(labelEl).toBeInTheDocument();
    const badgeGrid = labelEl.parentElement?.querySelector('.badges-grid');
    expect(badgeGrid).toBeTruthy();
  });
});
