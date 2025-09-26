import type { User, Event, Sponsor, Partner, Chapter, Opportunity, Mentorship, QAItem, Spotlight, DbUser } from '../types';
import { resolveMockEnabled, quietTestWarning } from '@services/useMockApi';

/**
 * Mock Data Loader
 * Fetches data from db.json via the mock server to ensure consistency
 * across all mock API services
 */
export class MockDataLoader {
  // Compute API base once; if env provides full API URL, use it, else same-origin '/api'
  private static readonly API_BASE =
    (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');
  private static warned = false;
  private static cache: Map<string, any> = new Map();
  private static cacheExpiry: Map<string, number> = new Map();
  private static readonly CACHE_DURATION = 30000; // 30 seconds

  /** Centralized enable check with global overrides & test auto enable. */
  static isEnabled(): boolean { return resolveMockEnabled(); }

  private static ensureEnabled(op: string) {
    if (!this.isEnabled()) {
      // Don't warn for read-only operations; silently no-op to avoid console noise in real-backend mode
      const isRead = /^(fetch|get|find)/i.test(op);
      if (!isRead && !this.warned && !quietTestWarning()) {
        console.warn(`MockDataLoader disabled (mocks off). '${op}' will no-op.`);
        this.warned = true;
      }
      return false;
    }
    return true;
  }

  /**
   * Generic method to fetch data from db.json
   */
  private static async fetchData<T>(endpoint: string): Promise<T[]> {
    if (!this.ensureEnabled(`fetch ${endpoint}`)) return [];
    const cacheKey = endpoint;
    const now = Date.now();

    // Check cache first
    if (this.cache.has(cacheKey) && this.cacheExpiry.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey)!;
      if (now < expiry) {
        return this.cache.get(cacheKey);
      }
    }

    try {
  const response = await fetch(`${this.API_BASE}/${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
      }

      const result = await response.json();
      const data = result.data || result; // Handle both wrapped and unwrapped responses

      // Cache the result
      this.cache.set(cacheKey, data);
      this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);

      return data;
    } catch (error) {
      if (!quietTestWarning()) {
        console.warn(`MockDataLoader: Failed to fetch ${endpoint}, returning empty array:`, error);
      }
      return [];
    }
  }

  /**
   * Generic create helper for any collection. Relies on json-server POST /api/:collection
   * Returns created item (json-server echoes created resource).
   */
  static async createItem<T extends { id?: string }>(
    collection: string,
    payload: T
  ): Promise<T | null> {
    if (!this.ensureEnabled(`create ${collection}`)) return null;
    try {
  const response = await fetch(`${this.API_BASE}/${collection}` , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Failed to create in ${collection}`);
      const result = await response.json();
      this.clearCache(collection);
      return (result.data || result) as T;
    } catch (e) {
      console.error(`MockDataLoader.createItem error for ${collection}`, e);
      return null;
    }
  }

  /**
   * Generic full update (PUT) helper. Use for replacing an item.
   */
  static async putItem<T extends { id: string }>(
    collection: string,
    id: string,
    payload: T
  ): Promise<T | null> {
    if (!this.ensureEnabled(`put ${collection}/${id}`)) return null;
    try {
  const response = await fetch(`${this.API_BASE}/${collection}/${id}` , {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Failed to put ${collection}/${id}`);
      const result = await response.json();
      this.clearCache(collection);
      return (result.data || result) as T;
    } catch (e) {
      console.error(`MockDataLoader.putItem error for ${collection}/${id}`, e);
      return null;
    }
  }

  /**
   * Generic delete helper.
   */
  static async deleteItem(
    collection: string,
    id: string
  ): Promise<boolean> {
    if (!this.ensureEnabled(`delete ${collection}/${id}`)) return false;
    try {
  const response = await fetch(`${this.API_BASE}/${collection}/${id}` , {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`Failed to delete ${collection}/${id}`);
      this.clearCache(collection);
      return true;
    } catch (e) {
      console.error(`MockDataLoader.deleteItem error for ${collection}/${id}`, e);
      return false;
    }
  }

  /**
   * Clear cache for a specific endpoint or all cache
   */
  static clearCache(endpoint?: string): void {
    if (endpoint) {
      this.cache.delete(endpoint);
      this.cacheExpiry.delete(endpoint);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Fetch users from db.json (returns raw db.json structure)
   */
  static async getUsers(): Promise<DbUser[]> {
    return this.fetchData<DbUser>('users');
  }

  /**
   * Persist a partial update to a user (PATCH) and clear cache
   */
  static async updateUser(id: string, patch: Partial<DbUser>): Promise<DbUser | null> {
    if (!this.ensureEnabled(`patch users/${id}`)) return null;
    try {
  const response = await fetch(`${this.API_BASE}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error(`Failed to update user ${id}`);
      const result = await response.json();
      this.clearCache('users');
      return (result.data || result) as DbUser;
    } catch (e) {
      console.error('MockDataLoader.updateUser error', e);
      return null;
    }
  }

  /**
   * Delete a user and clear cache
   */
  static async deleteUser(id: string): Promise<boolean> {
    if (!this.ensureEnabled(`delete users/${id}`)) return false;
    try {
  const response = await fetch(`${this.API_BASE}/users/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`Failed to delete user ${id}`);
      this.clearCache('users');
      return true;
    } catch (e) {
      console.error('MockDataLoader.deleteUser error', e);
      return false;
    }
  }

  /**
   * Create a user and clear cache
   */
  static async createUser(payload: Omit<DbUser,'id'> & { id?: string }): Promise<DbUser | null> {
    if (!this.ensureEnabled('post users')) return null;
    try {
  const response = await fetch(`${this.API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create user');
      const result = await response.json();
      this.clearCache('users');
      return (result.data || result) as DbUser;
    } catch (e) {
      console.error('MockDataLoader.createUser error', e);
      return null;
    }
  }

  /**
   * Fetch users as legacy User interface (for backward compatibility)
   */
  static async getUsersLegacy(): Promise<User[]> {
    return this.fetchData<User>('users');
  }

  /**
   * Fetch events from db.json
   */
  static async getEvents(): Promise<Event[]> {
    return this.fetchData<Event>('events');
  }

  /**
   * Fetch sponsors from db.json
   */
  static async getSponsors(): Promise<Sponsor[]> {
    return this.fetchData<Sponsor>('sponsors');
  }

  /**
   * Fetch partners from db.json
   */
  static async getPartners(): Promise<Partner[]> {
    return this.fetchData<Partner>('partners');
  }

  /**
   * Fetch chapters from db.json
   */
  static async getChapters(): Promise<Chapter[]> {
    return this.fetchData<Chapter>('chapters');
  }

  /**
   * Fetch opportunities from db.json
   */
  static async getOpportunities(): Promise<Opportunity[]> {
    return this.fetchData<Opportunity>('opportunities');
  }

  /**
   * Fetch mentorships from db.json
   */
  static async getMentorships(): Promise<Mentorship[]> {
    return this.fetchData<Mentorship>('mentorships');
  }

  /**
   * Generic PATCH helper for any collection item to persist changes via mock server
   */
  static async patchItem<T extends { id: string }>(
    collection: string,
    id: string,
    patch: Partial<T>
  ): Promise<T | null> {
    if (!this.ensureEnabled(`patch ${collection}/${id}`)) return null;
    try {
  const response = await fetch(`${this.API_BASE}/${collection}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error(`Failed to patch ${collection}/${id}`);
      const result = await response.json();
      this.clearCache(collection);
      return (result.data || result) as T;
    } catch (e) {
      console.error(`MockDataLoader.patchItem error for ${collection}/${id}`, e);
      return null;
    }
  }

  /**
   * Fetch QA items from db.json
   */
  static async getQAItems(): Promise<QAItem[]> {
    return this.fetchData<QAItem>('qa');
  }

  /**
   * Fetch spotlights from db.json
   */
  static async getSpotlights(): Promise<Spotlight[]> {
    return this.fetchData<Spotlight>('spotlights');
  }

  /**
   * Find item by ID in any collection
   */
  static async findById<T extends { id: string }>(
    collection: string,
    id: string
  ): Promise<T | null> {
    const data = await this.fetchData<T>(collection);
    return data.find(item => item.id === id) || null;
  }

  /**
   * Filter items by criteria
   */
  static filterItems<T>(items: T[], filters: Record<string, any>): T[] {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return true;
        }

        const itemValue = (item as any)[key];

        if (Array.isArray(itemValue)) {
          return itemValue.includes(value);
        }

        if (typeof itemValue === 'string' && typeof value === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }

        return itemValue === value;
      });
    });
  }

  /**
   * Paginate items
   */
  static paginateItems<T>(
    items: T[],
    page: number = 1,
    limit: number = 10
  ): {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    };
  }

  /**
   * Sort items by field
   */
  static sortItems<T>(
    items: T[],
    sortBy: keyof T,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): T[] {
    return [...items].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
