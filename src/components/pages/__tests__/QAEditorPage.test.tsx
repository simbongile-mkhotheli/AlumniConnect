import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from '../../../contexts/ToastContext';
import { QAEditorPage } from '../QAEditorPage';

// Mock hooks & services selectively
vi.mock('../../../services/qaService', () => ({
  QAService: {
    getQAItem: vi.fn(),
    createQAItem: vi.fn(() => Promise.resolve({ data: { id: 'new-id' } })),
    updateQAItem: vi.fn(() => Promise.resolve({ data: { id: 'existing-id' } })),
  },
}));

vi.mock('../../../hooks', async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    useApiData: (fn: any, deps: any[], opts: any) => {
      // Simple emulation: call provider only when enabled
      if (opts?.enabled === false) return { data: null, loading: false, error: null };
      return { data: null, loading: false, error: null };
    },
    useMutation: (mutateFn: any) => ({ mutate: mutateFn, loading: false }),
  };
});

// Utility to render with router and optional id param
const renderWithRoute = (initialPath: string) => {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/admin/qa/new" element={<QAEditorPage />} />
          <Route path="/admin/qa/:id" element={<QAEditorPage />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );
};

describe('QAEditorPage basic modes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create mode form fields with empty defaults', () => {
    renderWithRoute('/admin/qa/new');
    expect(screen.getByLabelText(/Title/i)).toHaveValue('');
    expect(screen.getByLabelText(/Content/i)).toHaveValue('');
    expect(screen.getByLabelText(/Author Name/i)).toHaveValue('');
  });

  it('renders edit mode title correctly (no data yet)', () => {
    renderWithRoute('/admin/qa/123');
    expect(screen.getByText(/Edit Q&A Item/i)).toBeInTheDocument();
  });
});
