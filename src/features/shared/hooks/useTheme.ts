import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils';

/**
 * Hook for managing theme state
 */
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    storage.set('theme', newTheme);

    // Apply theme to document body
    document.body.classList.toggle('dark-theme', newTheme === 'dark');
  }, [theme]);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = storage.get<'light' | 'dark'>('theme', 'light');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    }
  }, []);

  return {
    theme,
    toggleTheme,
  };
}