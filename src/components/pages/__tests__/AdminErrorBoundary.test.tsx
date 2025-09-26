import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../common/ErrorBoundary';

const ThrowingChild: React.FC = () => {
  throw new Error('Boom');
};

describe('Admin Error Boundary integration', () => {
  it('renders fallback when a child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <ErrorBoundary fallback={<div data-testid="error-fallback">Custom Boundary Fallback</div>}>
          <ThrowingChild />
        </ErrorBoundary>
      </MemoryRouter>
    );

    // Very generic assertion: boundary should suppress raw throw & show some UI
    // Adjust selector/text once real fallback markup known
  const fallback = screen.getByTestId('error-fallback');
  expect(fallback).toBeTruthy();

    consoleSpy.mockRestore();
  });
});
