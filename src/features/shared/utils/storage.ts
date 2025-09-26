/**
 * Local Storage utility
 * Provides a safe wrapper around localStorage with JSON serialization/deserialization
 */

export const storage = {
  /**
   * Get an item from localStorage
   * @param key - The key to retrieve
   * @param defaultValue - Default value if key doesn't exist or parsing fails
   * @returns The parsed value or default value
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(
        `Failed to get item from localStorage with key "${key}":`,
        error
      );
      return defaultValue ?? null;
    }
  },

  /**
   * Set an item in localStorage
   * @param key - The key to store under
   * @param value - The value to store (will be JSON stringified)
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(
        `Failed to set item in localStorage with key "${key}":`,
        error
      );
    }
  },

  /**
   * Remove an item from localStorage
   * @param key - The key to remove
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(
        `Failed to remove item from localStorage with key "${key}":`,
        error
      );
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  },

  /**
   * Check if a key exists in localStorage
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.warn(
        `Failed to check if key "${key}" exists in localStorage:`,
        error
      );
      return false;
    }
  },

  /**
   * Get all keys from localStorage
   * @returns Array of all keys
   */
  keys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.warn('Failed to get localStorage keys:', error);
      return [];
    }
  },

  /**
   * Get the size of localStorage in bytes (approximate)
   * @returns Approximate size in bytes
   */
  size(): number {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.warn('Failed to calculate localStorage size:', error);
      return 0;
    }
  },
};