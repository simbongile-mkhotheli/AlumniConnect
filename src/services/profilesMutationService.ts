import { MockDataLoader } from '../utils/mockDataLoader';
import { mapDbUserToProfile } from './profileMapping';
import type { DbUser } from '../types';

/**
 * ProfilesMutationService
 * Central write layer for profile state mutations with persistence via json-server (db.json)
 * Provides optimistic-friendly methods returning mapped profile objects.
 */
export class ProfilesMutationService {
  private static ensureMockEnabled(op: string) {
    const mdl: any = MockDataLoader as any;
    const hasIsEnabled = typeof mdl.isEnabled === 'function';
    const isVitest = (import.meta as any)?.vitest === true;
    const isNodeTest = typeof process !== 'undefined' && (
      (process as any).env?.VITEST || (process as any).env?.NODE_ENV === 'test'
    );
    const testMode = Boolean(isVitest || isNodeTest);
    const enabled = hasIsEnabled ? Boolean(mdl.isEnabled()) : testMode;
    if (!enabled) {
      console.warn(`ProfilesMutationService: Mock mode disabled; '${op}' is a no-op in real backend mode.`);
      return false;
    }
    return true;
  }
  /** Generic helper to fetch current raw user */
  private static async loadRaw(id: string): Promise<DbUser | null> {
    if (!this.ensureMockEnabled('loadRaw')) return null;
    const users = await MockDataLoader.getUsers();
    return users.find(u => u.id === id) || null;
  }

  static async updateProfile(id: string, patch: Partial<DbUser>) {
    if (!this.ensureMockEnabled('updateProfile')) return null;
    const updated = await MockDataLoader.updateUser(id, { ...patch, updatedAt: new Date().toISOString() });
    return updated ? mapDbUserToProfile(updated) : null;
  }

  static async approveProfile(id: string) {
    if (!this.ensureMockEnabled('approveProfile')) return null;
    // status -> active
    return this.updateProfile(id, { status: 'active' as any });
  }

  static async suspendProfile(id: string) {
    if (!this.ensureMockEnabled('suspendProfile')) return null;
    return this.updateProfile(id, { status: 'suspended' as any });
  }

  static async reactivateProfile(id: string) {
    if (!this.ensureMockEnabled('reactivateProfile')) return null;
    return this.updateProfile(id, { status: 'active' as any });
  }

  static async deleteProfile(id: string) {
    if (!this.ensureMockEnabled('deleteProfile')) return false;
    return await MockDataLoader.deleteUser(id);
  }
}

export default ProfilesMutationService;
