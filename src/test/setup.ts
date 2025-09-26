import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
// Vitest-specific matchers from Testing Library
import '@testing-library/jest-dom/vitest';

// Set up environment variables for testing
beforeEach(() => {
  if (import.meta.env.VITE_ENABLE_MOCK_API === undefined) {
    import.meta.env.VITE_ENABLE_MOCK_API = 'true';
  }
  if (typeof window !== 'undefined') {
    // Always stub scrollTo BEFORE any component code executes; never invoke the native impl (jsdom throws/not implemented)
    window.scrollTo = () => {};
  }
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
