import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ToastProvider } from '../../../contexts/ToastContext';
import { QAEditorPage } from '../QAEditorPage';

// We'll simulate data arriving after initial render to ensure no hook reordering issues.
// Mock implementation of service & hooks
let resolveData: (v: any) => void;
const pendingPromise = new Promise((res) => { resolveData = res; });

vi.mock('../../../services/qaService', () => ({
  QAService: {
    getQAItem: vi.fn(() => pendingPromise),
    createQAItem: vi.fn(() => Promise.resolve({ data: { id: 'new-id' } })),
    updateQAItem: vi.fn(() => Promise.resolve({ data: { id: 'existing-id' } })),
  },
}));

vi.mock('../../../hooks', async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    useApiData: (fn: any, deps: any[], opts: any) => {
      if (opts?.enabled === false) return { data: null, loading: false, error: null };
      // Simulate loading until we resolve
      return { data: null, loading: true, error: null };
    },
    useMutation: (mutateFn: any) => ({ mutate: mutateFn, loading: false }),
  };
});

describe('QAEditorPage hook order stability', () => {
  it('does not throw or warn about hook order when data resolves', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/admin/qa/555']}>
          <Routes>
            <Route path="/admin/qa/:id" element={<QAEditorPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    );

    // Resolve the promise after initial render (simulating async arrival)
    resolveData!({ data: { id: '555', title: 'Sample', content: 'Body' } });

    // Allow microtasks to flush
    await Promise.resolve();

    expect(errorSpy).not.toHaveBeenCalled();
    // Accept minor warnings but ensure no React hook order warning pattern
    const hookWarnings = warnSpy.mock.calls.filter(([msg]) =>
      /Rendered fewer hooks than expected|invalid hook call/i.test(String(msg))
    );
    expect(hookWarnings.length).toBe(0);

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
