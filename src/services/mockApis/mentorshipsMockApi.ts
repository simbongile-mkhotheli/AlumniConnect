import type {
  Mentorship,
  MentorshipSession,
  MentorshipAnalytics,
  Notification,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../../types';
import { MockDataLoader } from '../../utils/mockDataLoader';

/**
 * Enhanced Mentorships Mock API Service
 * Uses db.json as data source via MockDataLoader
 */

// Utilities
const delay = (ms = 250) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Filter mentorships based on filters
 */
const filterMentorships = (
  mentorships: Mentorship[],
  filters: FilterState
): Mentorship[] => {
  return MockDataLoader.filterItems(mentorships, {
    status: filters.status,
    type: filters.type,
    mentorName: filters.search, // Search in mentor name
    menteeName: filters.search, // Search in mentee name
    title: filters.search, // Search in title
  });
};

/**
 * MentorshipsMockApiService
 * All methods now use data from db.json via MockDataLoader
 */
export class MentorshipsMockApiService {
  static async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return Promise.resolve({ data: { status: 'ok' }, success: true, message: 'mentorships mock healthy' });
  }
  /**
   * Get all mentorships with optional filtering and pagination
   */
  static async getMentorships(
    page: number = 1,
    limit: number = 20,
    filters?: FilterState
  ): Promise<PaginatedResponse<Mentorship>> {
    await delay();

    try {
      let mentorships = await MockDataLoader.getMentorships();

      // Apply filters if provided
      if (filters) {
        mentorships = filterMentorships(mentorships, filters);
      }

      // Sort by start date (newest first) by default
      mentorships = MockDataLoader.sortItems(mentorships, 'startDate', 'desc');

      // Apply pagination with the provided page and limit parameters
      const paginatedResult = MockDataLoader.paginateItems(
        mentorships,
        page,
        limit
      );

      return {
        data: paginatedResult.items,
        pagination: {
          page: paginatedResult.page,
          limit: paginatedResult.limit,
          total: paginatedResult.total,
          totalPages: paginatedResult.totalPages,
        },
        success: true,
        message: 'Mentorships retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
        success: false,
        message: 'Failed to retrieve mentorships',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get mentorship by ID
   */
  static async getMentorshipById(id: string): Promise<ApiResponse<Mentorship | null>> {
    await delay();

    try {
      const mentorship = await MockDataLoader.findById<Mentorship>(
        'mentorships',
        id
      );

      if (!mentorship) {
        return {
          data: null,
          success: false,
          message: 'Mentorship not found',
          error: { code: 404, message: 'Mentorship not found' },
        } as any;
      }

      return {
        data: mentorship,
        success: true,
        message: 'Mentorship retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve mentorship',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      } as any;
    }
  }

  // Alias expected by service/tests
  static async getMentorship(id: string): Promise<ApiResponse<Mentorship | null>> {
    return this.getMentorshipById(id);
  }

  /**
   * Create new mentorship
   */
  static async createMentorship(
    mentorshipData: Omit<Mentorship, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Mentorship>> {
    await delay();

    try {
      const newMentorship: Mentorship = {
        ...mentorshipData,
        id: `mentorship-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const persisted = await MockDataLoader.createItem<Mentorship>('mentorships', newMentorship);
      if (!persisted) {
        return { data: null as any, success: false, message: 'Failed to create mentorship (persistence error)', error: { code: 500, message: 'Persistence layer returned null' } };
      }
      return {
        data: persisted,
        success: true,
        message: 'Mentorship created successfully',
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to create mentorship',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Update mentorship
   */
  static async updateMentorship(
    id: string,
    mentorshipData: Partial<Mentorship>
  ): Promise<ApiResponse<Mentorship | null>> {
    await delay();

    try {
      const existingMentorship = await MockDataLoader.findById<Mentorship>(
        'mentorships',
        id
      );

      if (!existingMentorship) {
        return {
          data: null,
          success: false,
          message: 'Mentorship not found',
          error: { code: 404, message: 'Mentorship not found' },
        } as any;
      }

      const patch: Partial<Mentorship> = {
        ...mentorshipData,
        updatedAt: new Date().toISOString(),
      };
      const persisted = await MockDataLoader.patchItem<Mentorship>('mentorships', id, patch);
      if (!persisted) {
        return { data: null, success: false, message: 'Failed to update mentorship (persistence error)', error: { code: 500, message: 'Persistence layer returned null' } } as any;
      }
      return {
        data: persisted,
        success: true,
        message: 'Mentorship updated successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to update mentorship',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      } as any;
    }
  }

  /**
   * Delete mentorship
   */
  static async deleteMentorship(id: string): Promise<ApiResponse<null>> {
    await delay();

    try {
      const existingMentorship = await MockDataLoader.findById<Mentorship>(
        'mentorships',
        id
      );

      if (!existingMentorship) {
        return {
          data: null,
          success: false,
          message: 'Mentorship not found',
          error: { code: 404, message: 'Mentorship not found' },
        } as any;
      }

      const deleted = await MockDataLoader.deleteItem('mentorships', id);
      if (!deleted) {
        return { data: null, success: false, message: 'Failed to delete mentorship (persistence error)', error: { code: 500, message: 'Persistence layer reported failure' } } as any;
      }
      return {
        data: null,
        success: true,
        message: 'Mentorship deleted successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to delete mentorship',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      } as any;
    }
  }

  /**
   * Get mentorships by status
   */
  static async getMentorshipsByStatus(
    status: Mentorship['status']
  ): Promise<ApiResponse<Mentorship[]>> {
    await delay();

    try {
      const mentorships = await MockDataLoader.getMentorships();
      const filteredMentorships = mentorships.filter(
        mentorship => mentorship.status === status
      );

      return {
        data: filteredMentorships,
        success: true,
        message: `Mentorships with status '${status}' retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve mentorships by status',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get mentorships by type
   */
  static async getMentorshipsByType(
    type: Mentorship['type']
  ): Promise<ApiResponse<Mentorship[]>> {
    await delay();

    try {
      const mentorships = await MockDataLoader.getMentorships();
      const filteredMentorships = mentorships.filter(
        mentorship => mentorship.type === type
      );

      return {
        data: filteredMentorships,
        success: true,
        message: `${type} mentorships retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve mentorships by type',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get active mentorships
   */
  static async getActiveMentorships(): Promise<ApiResponse<Mentorship[]>> {
    await delay();

    try {
      const mentorships = await MockDataLoader.getMentorships();
      const activeMentorships = mentorships.filter(
        mentorship => mentorship.status === 'active'
      );

      return {
        data: activeMentorships,
        success: true,
        message: 'Active mentorships retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve active mentorships',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Approve mentorship
   */
  static async approveMentorship(id: string): Promise<ApiResponse<Mentorship | null>> {
    await delay();
    try {
      const updated = await MockDataLoader.patchItem<Mentorship>('mentorships', id, {
        status: 'active',
        updatedAt: new Date().toISOString(),
      });
      if (!updated) {
        return { data: null, success: false, message: 'Mentorship not found', error: { code: 404, message: 'Mentorship not found' } } as any;
      }
      return { data: updated, success: true, message: 'Mentorship approved successfully' };
    } catch (error) {
      return { data: null, success: false, message: 'Failed to approve mentorship', error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' } } as any;
    }
  }

  // Reject mentorship (alias for cancellation with reason)
  static async rejectMentorship(id: string, reason: string = 'Rejected'): Promise<ApiResponse<Mentorship | null>> {
    await delay();
    try {
      const updated = await MockDataLoader.patchItem<Mentorship>('mentorships', id, {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
        rejectionReason: reason,
      });
      if (!updated) {
        return { data: null, success: false, message: 'Mentorship not found', error: { code: 404, message: 'Mentorship not found' } } as any;
      }
      return { data: updated, success: true, message: 'Mentorship rejected successfully' };
    } catch (error) {
      return { data: null, success: false, message: 'Failed to reject mentorship', error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' } } as any;
    }
  }

  /**
   * Complete mentorship
   */
  static async completeMentorship(
    id: string
  ): Promise<ApiResponse<Mentorship | null>> {
    await delay();
    try {
      const updated = await MockDataLoader.patchItem<Mentorship>('mentorships', id, {
        status: 'completed',
        endDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      if (!updated) {
        return { data: null, success: false, message: 'Mentorship not found', error: { code: 404, message: 'Mentorship not found' } } as any;
      }
      return { data: updated, success: true, message: 'Mentorship completed successfully' };
    } catch (error) {
      return { data: null, success: false, message: 'Failed to complete mentorship', error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' } } as any;
    }
  }

  /**
   * Get mentorship statistics
   */
  static async getMentorshipStats(): Promise<ApiResponse<any>> {
    await delay();

    try {
      const mentorships = await MockDataLoader.getMentorships();

      const stats = {
        totalMentorships: mentorships.length,
        activeMentorships: mentorships.filter(m => m.status === 'active')
          .length,
        pendingMentorships: mentorships.filter(m => m.status === 'pending')
          .length,
        completedMentorships: mentorships.filter(m => m.status === 'completed')
          .length,
        cancelledMentorships: mentorships.filter(m => m.status === 'cancelled')
          .length,
        technicalMentorships: mentorships.filter(m => m.type === 'technical')
          .length,
        careerMentorships: mentorships.filter(m => m.type === 'career').length,
        leadershipMentorships: mentorships.filter(m => m.type === 'leadership')
          .length,
        entrepreneurshipMentorships: mentorships.filter(
          m => m.type === 'entrepreneurship'
        ).length,
        totalSessions: mentorships.reduce((sum, m: any) => sum + (m.sessionsCompleted || m.sessionCount || 0), 0),
        averageRating: mentorships.length > 0 ? mentorships.reduce((sum, m: any) => sum + (m.rating || 0), 0) / mentorships.length : 0,
        averageDuration: mentorships.length > 0 ? mentorships.reduce((sum, m: any) => sum + (m.duration || 0), 0) / mentorships.length : 0,
      };

      return {
        data: stats,
        success: true,
        message: 'Mentorship statistics retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve mentorship statistics',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Bulk operations on mentorships
   */
  static async bulkUpdateMentorships(
    ids: string[],
    updates: Partial<Mentorship>
  ): Promise<ApiResponse<Mentorship[]>> {
    await delay();

    try {
      const mentorships = await MockDataLoader.getMentorships();
      const updatedMentorships: Mentorship[] = [];

      for (const id of ids) {
        const mentorship = mentorships.find(m => m.id === id);
        if (mentorship) {
          const updatedMentorship = {
            ...mentorship,
            ...updates,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
          };
          updatedMentorships.push(updatedMentorship);
        }
      }

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('mentorships');

      return {
        data: updatedMentorships,
        success: true,
        message: `${updatedMentorships.length} mentorships updated successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to bulk update mentorships',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Mock session-related methods (these would typically interact with a sessions table)
   */
  static async getMentorshipSessions(
    mentorshipId: string
  ): Promise<ApiResponse<MentorshipSession[]>> {
    await delay();

    // Mock sessions data based on mentorship
    const mockSessions: any[] = [{
      id: `session-${mentorshipId}-1`,
      mentorshipId,
      sessionNumber: 1,
      scheduledDate: new Date().toISOString(),
      duration: 60,
      status: 'completed',
      notes: 'Initial session - goal setting',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }];

    return {
      data: mockSessions,
      success: true,
      message: 'Mentorship sessions retrieved successfully',
    };
  }

  // Schedule new session
  static async scheduleSession(mentorshipId: string, sessionData: Partial<MentorshipSession>): Promise<ApiResponse<MentorshipSession>> {
    await delay();
    const session: MentorshipSession = {
      sessionId: `session-${Date.now()}`,
      mentorshipId,
      title: sessionData.title || 'Session',
      scheduledAt: sessionData.scheduledAt || new Date().toISOString(),
      duration: sessionData.duration || 60,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
    return { data: session, success: true, message: 'Session scheduled (mock)' };
  }

  /**
   * Mock analytics method
   */
  static async getMentorshipAnalytics(
    mentorshipId: string
  ): Promise<ApiResponse<MentorshipAnalytics>> {
    await delay();

    const mockAnalytics: any = {
      mentorshipId,
      totalSessions: 5,
      completedSessions: 3,
      averageSessionDuration: 55,
      progressRate: 75,
      satisfactionRating: 4.5,
      goalsAchieved: 3,
      totalGoals: 5,
      lastActivityDate: new Date().toISOString(),
    };

    return {
      data: mockAnalytics,
      success: true,
      message: 'Mentorship analytics retrieved successfully',
    };
  }

  /**
   * Send notification (mock)
   */
  static async sendNotification(
    mentorshipId: string,
    notificationData: Partial<Notification>
  ): Promise<ApiResponse<Notification>> {
    await delay();
    return {
      data: {
        id: `notif-${Date.now()}`,
        title: notificationData.title || 'Mentorship Update',
        message: notificationData.message || 'Notification sent',
        type: (notificationData as any).type || 'info',
        createdAt: new Date().toISOString(),
        read: false,
        relatedId: mentorshipId,
        userId: 'mock-user',
        status: 'unread',
        priority: 'normal',
      } as any,
      success: true,
      message: 'Notification sent (mock)',
    };
  }

  /**
   * Bulk operation mock implementation
   */
  static async bulkOperation(
    operation: string,
    mentorshipIds: string[],
    options?: { reason?: string; feedback?: any }
  ): Promise<ApiResponse<{ processedIds: string[]; successCount: number; failureCount: number; errors?: Array<{ id: string; error: string }>; }>> {
    await delay();

    try {
      const mentorships = await MockDataLoader.getMentorships();
      const processedIds: string[] = [];
      const errors: Array<{ id: string; error: string }> = [];

      for (const id of mentorshipIds) {
        let patch: any = { updatedAt: new Date().toISOString() };
        switch (operation) {
          case 'approve':
          case 'activate':
            patch.status = 'active';
            break;
          case 'complete':
            patch.status = 'completed';
            patch.endDate = new Date().toISOString();
            break;
          case 'cancel':
            patch.status = 'cancelled';
            break;
            case 'pause':
            patch.status = 'paused';
            break;
          case 'resume':
            patch.status = 'active';
            break;
          case 'reject':
            patch.status = 'cancelled';
            patch.rejectionReason = options?.reason || 'Rejected';
            break;
          case 'delete':
            // Attempt delete and continue
            try {
              const base = (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api';
              await fetch(`${base}/mentorships/${id}`, { method: 'DELETE' });
              processedIds.push(id);
              continue;
            } catch (e) {
              errors.push({ id, error: 'Delete failed' });
              continue;
            }
          default:
            break;
        }
        const result = await MockDataLoader.patchItem<Mentorship>('mentorships', id, patch);
        if (!result) {
          errors.push({ id, error: 'Patch failed' });
        } else {
          processedIds.push(id);
        }
      }

      // Clear cache if any items processed (simulate update)
      if (processedIds.length) {
        MockDataLoader.clearCache('mentorships');
      }

      return {
        data: { processedIds, successCount: processedIds.length, failureCount: errors.length, errors: errors.length ? errors : undefined },
        success: true,
        message: `Bulk operation '${operation}' completed (mock)`,
      };
    } catch (error) {
      return {
        data: {
          processedIds: [],
          successCount: 0,
          failureCount: mentorshipIds.length,
          errors: mentorshipIds.map(id => ({ id, error: 'Unexpected error' })),
        },
        success: false,
        message: 'Bulk operation failed',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  // Pending mentorships helper
  static async getPendingMentorships(): Promise<ApiResponse<Mentorship[]>> {
    await delay();
    const all = await MockDataLoader.getMentorships();
    return { data: all.filter(m => m.status === 'pending'), success: true };
  }
}
