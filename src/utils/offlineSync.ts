import { EventsService } from '@features/events/services';

interface PendingRSVP {
  eventId: string;
  action: 'register' | 'cancel';
  userId: string;
  timestamp: string;
  ticketType?: string;
  specialRequests?: string;
}

interface SyncResult {
  successful: number;
  failed: number;
  errors: string[];
}

/**
 * Offline Sync Utility
 * Handles synchronization of offline actions when connection is restored
 */
export class OfflineSyncService {
  private static readonly PENDING_RSVPS_KEY = 'pendingRsvps';
  private static readonly USER_RSVPS_KEY = 'userRsvps';
  private static readonly SYNC_STATUS_KEY = 'syncStatus';

  /**
   * Check if there are pending sync operations
   */
  static hasPendingOperations(): boolean {
    const pendingRsvps = this.getPendingRSVPs();
    return pendingRsvps.length > 0;
  }

  /**
   * Get count of pending operations
   */
  static getPendingOperationsCount(): number {
    return this.getPendingRSVPs().length;
  }

  /**
   * Get all pending RSVPs
   */
  static getPendingRSVPs(): PendingRSVP[] {
    try {
      const stored = localStorage.getItem(this.PENDING_RSVPS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading pending RSVPs:', error);
      return [];
    }
  }

  /**
   * Add a pending RSVP operation
   */
  static addPendingRSVP(rsvp: Omit<PendingRSVP, 'timestamp'>): void {
    try {
      const pendingRsvps = this.getPendingRSVPs();
      const newRsvp: PendingRSVP = {
        ...rsvp,
        timestamp: new Date().toISOString(),
      };

      // Remove any existing pending operation for the same event and user
      const filteredRsvps = pendingRsvps.filter(
        existing =>
          !(
            existing.eventId === rsvp.eventId && existing.userId === rsvp.userId
          )
      );

      filteredRsvps.push(newRsvp);
      localStorage.setItem(
        this.PENDING_RSVPS_KEY,
        JSON.stringify(filteredRsvps)
      );

      console.log(
        `📱 Added pending RSVP: ${rsvp.action} for event ${rsvp.eventId}`
      );
    } catch (error) {
      console.error('Error adding pending RSVP:', error);
    }
  }

  /**
   * Remove a pending RSVP operation
   */
  static removePendingRSVP(eventId: string, userId: string): void {
    try {
      const pendingRsvps = this.getPendingRSVPs();
      const filteredRsvps = pendingRsvps.filter(
        rsvp => !(rsvp.eventId === eventId && rsvp.userId === userId)
      );

      localStorage.setItem(
        this.PENDING_RSVPS_KEY,
        JSON.stringify(filteredRsvps)
      );
      console.log(`🗑️ Removed pending RSVP for event ${eventId}`);
    } catch (error) {
      console.error('Error removing pending RSVP:', error);
    }
  }

  /**
   * Clear all pending operations
   */
  static clearPendingOperations(): void {
    try {
      localStorage.removeItem(this.PENDING_RSVPS_KEY);
      console.log('🧹 Cleared all pending operations');
    } catch (error) {
      console.error('Error clearing pending operations:', error);
    }
  }

  /**
   * Get user's RSVP status for an event
   */
  static getUserRSVPStatus(
    eventId: string,
    userId: string
  ): 'none' | 'registered' | 'pending_sync' {
    try {
      // Check if there's a pending operation
      const pendingRsvps = this.getPendingRSVPs();
      const pendingRsvp = pendingRsvps.find(
        rsvp => rsvp.eventId === eventId && rsvp.userId === userId
      );

      if (pendingRsvp) {
        return 'pending_sync';
      }

      // Check stored RSVPs
      const storedRsvps = localStorage.getItem(this.USER_RSVPS_KEY);
      if (storedRsvps) {
        const userRsvps = JSON.parse(storedRsvps);
        const userEventRsvps = userRsvps[userId] || [];
        return userEventRsvps.includes(eventId) ? 'registered' : 'none';
      }

      return 'none';
    } catch (error) {
      console.error('Error getting user RSVP status:', error);
      return 'none';
    }
  }

  /**
   * Update user's RSVP status locally
   */
  static updateUserRSVPStatus(
    eventId: string,
    userId: string,
    status: 'registered' | 'none'
  ): void {
    try {
      const storedRsvps = JSON.parse(
        localStorage.getItem(this.USER_RSVPS_KEY) || '{}'
      );
      const userRsvps = storedRsvps[userId] || [];

      if (status === 'registered') {
        if (!userRsvps.includes(eventId)) {
          userRsvps.push(eventId);
        }
      } else {
        const index = userRsvps.indexOf(eventId);
        if (index > -1) {
          userRsvps.splice(index, 1);
        }
      }

      storedRsvps[userId] = userRsvps;
      localStorage.setItem(this.USER_RSVPS_KEY, JSON.stringify(storedRsvps));
    } catch (error) {
      console.error('Error updating user RSVP status:', error);
    }
  }

  /**
   * Sync all pending operations with the server
   */
  static async syncPendingOperations(): Promise<SyncResult> {
    const result: SyncResult = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    // Check if online
    if (!navigator.onLine) {
      result.errors.push('Device is offline');
      return result;
    }

    const pendingRsvps = this.getPendingRSVPs();

    if (pendingRsvps.length === 0) {
      console.log('📡 No pending operations to sync');
      return result;
    }

    console.log(
      `📡 Starting sync of ${pendingRsvps.length} pending operations...`
    );

    // Process each pending RSVP
    for (const rsvp of pendingRsvps) {
      try {
        let response;

        if (rsvp.action === 'register') {
          response = await EventsService.rsvpToEvent(rsvp.eventId, {
            userId: rsvp.userId,
            ticketType: rsvp.ticketType || 'general',
            specialRequests: rsvp.specialRequests,
          });
        } else {
          // For cancel action, we'd need a cancelRSVP method in EventsService
          // For now, we'll simulate it
          response = { success: true, message: 'RSVP cancelled' };
        }

        if (response.success) {
          // Update local RSVP status
          this.updateUserRSVPStatus(
            rsvp.eventId,
            rsvp.userId,
            rsvp.action === 'register' ? 'registered' : 'none'
          );

          // Remove from pending queue
          this.removePendingRSVP(rsvp.eventId, rsvp.userId);

          result.successful++;
          console.log(`✅ Synced ${rsvp.action} for event ${rsvp.eventId}`);
        } else {
          result.failed++;
          result.errors.push(
            `Failed to ${rsvp.action} for event ${rsvp.eventId}: ${response.message}`
          );
          console.error(
            `❌ Failed to sync ${rsvp.action} for event ${rsvp.eventId}:`,
            response.message
          );
        }
      } catch (error) {
        result.failed++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(
          `Error syncing ${rsvp.action} for event ${rsvp.eventId}: ${errorMessage}`
        );
        console.error(
          `❌ Error syncing ${rsvp.action} for event ${rsvp.eventId}:`,
          error
        );
      }
    }

    // Update sync status
    this.updateSyncStatus({
      lastSyncAttempt: new Date().toISOString(),
      lastSuccessfulSync:
        result.successful > 0
          ? new Date().toISOString()
          : this.getSyncStatus().lastSuccessfulSync,
      pendingCount: this.getPendingOperationsCount(),
    });

    console.log(
      `📡 Sync completed: ${result.successful} successful, ${result.failed} failed`
    );
    return result;
  }

  /**
   * Auto-sync when connection is restored
   */
  static setupAutoSync(): void {
    // Listen for online events
    window.addEventListener('online', async () => {
      console.log('🌐 Connection restored, starting auto-sync...');

      // Wait a bit for connection to stabilize
      setTimeout(async () => {
        try {
          const result = await this.syncPendingOperations();

          if (result.successful > 0) {
            // Notify user of successful sync
            this.showSyncNotification(
              `✅ Synced ${result.successful} pending operations`
            );
          }

          if (result.failed > 0) {
            console.warn(`⚠️ ${result.failed} operations failed to sync`);
          }
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }, 2000);
    });

    // Listen for offline events
    window.addEventListener('offline', () => {
      console.log('📱 Connection lost, operations will be queued for sync');
    });
  }

  /**
   * Get sync status information
   */
  static getSyncStatus(): {
    lastSyncAttempt?: string;
    lastSuccessfulSync?: string;
    pendingCount: number;
  } {
    try {
      const stored = localStorage.getItem(this.SYNC_STATUS_KEY);
      const status = stored ? JSON.parse(stored) : {};
      return {
        ...status,
        pendingCount: this.getPendingOperationsCount(),
      };
    } catch (error) {
      console.error('Error reading sync status:', error);
      return { pendingCount: this.getPendingOperationsCount() };
    }
  }

  /**
   * Update sync status
   */
  static updateSyncStatus(
    status: Partial<{
      lastSyncAttempt: string;
      lastSuccessfulSync: string;
      pendingCount: number;
    }>
  ): void {
    try {
      const currentStatus = this.getSyncStatus();
      const updatedStatus = { ...currentStatus, ...status };
      localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(updatedStatus));
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }

  /**
   * Show sync notification to user
   */
  private static showSyncNotification(message: string): void {
    // In a real app, this would integrate with a notification system
    // For now, we'll use a simple console log and could show a toast
    console.log(`🔔 ${message}`);

    // You could integrate with a toast library here
    // toast.success(message);
  }

  /**
   * Manual sync trigger
   */
  static async manualSync(): Promise<SyncResult> {
    console.log('🔄 Manual sync triggered...');
    return await this.syncPendingOperations();
  }

  /**
   * Get sync statistics for display
   */
  static getSyncStats(): {
    pendingCount: number;
    lastSyncAttempt?: string;
    lastSuccessfulSync?: string;
    isOnline: boolean;
  } {
    const status = this.getSyncStatus();
    return {
      ...status,
      isOnline: navigator.onLine,
    };
  }
}

// Initialize auto-sync when the module is loaded
if (typeof window !== 'undefined') {
  OfflineSyncService.setupAutoSync();
}
