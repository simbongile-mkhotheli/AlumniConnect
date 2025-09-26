import type {
  Mentorship,
  MentorshipFormData,
  MentorshipFilters,
  ApiResponse,
  PaginatedResponse,
  BulkOperationResult,
} from '../types';
import { MockDataLoader } from '@shared/utils/mockDataLoader';

const delay = (ms = 250) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Mentorship Mock API Service
 */
export class MentorshipMockApiService {
  static async getMentorships(
    page: number = 1,
    limit: number = 20,
    filters?: MentorshipFilters
  ): Promise<PaginatedResponse<Mentorship>> {
    await delay();
    try {
      let mentorships = await MockDataLoader.getMentorships();
      
      if (filters) {
        mentorships = MockDataLoader.filterItems(mentorships, filters);
      }

      const paginatedResult = MockDataLoader.paginateItems(mentorships, page, limit);

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
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        success: false,
        message: 'Failed to retrieve mentorships',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async getMentorship(id: string): Promise<ApiResponse<Mentorship>> {
    await delay();
    try {
      const mentorship = await MockDataLoader.findById<Mentorship>('mentorships', id);
      if (!mentorship) {
        return {
          data: null as any,
          success: false,
          message: 'Mentorship not found',
          error: { code: 404, message: 'Mentorship not found' },
        };
      }
      return { data: mentorship, success: true, message: 'Mentorship retrieved successfully' };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to retrieve mentorship',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async createMentorship(mentorshipData: MentorshipFormData): Promise<ApiResponse<Mentorship>> {
    await delay();
    try {
      const newMentorship: Mentorship = {
        ...mentorshipData,
        id: `mentorship-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Provide required participant/display & tracking fields absent from form
        mentorName: mentorshipData.mentorId ? `Mentor ${mentorshipData.mentorId}` : 'Mentor',
        menteeName: mentorshipData.menteeId ? `Mentee ${mentorshipData.menteeId}` : 'Mentee',
        sessionCount: 0,
      };
      const persisted = await MockDataLoader.createItem<Mentorship>('mentorships', newMentorship);
      return { data: persisted!, success: true, message: 'Mentorship created successfully' };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to create mentorship',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async updateMentorship(
    id: string,
    mentorshipData: Partial<MentorshipFormData>
  ): Promise<ApiResponse<Mentorship>> {
    await delay();
    try {
      const existing = await MockDataLoader.findById<Mentorship>('mentorships', id);
      if (!existing) {
        return {
          data: null as any,
          success: false,
          message: 'Mentorship not found',
          error: { code: 404, message: 'Mentorship not found' },
        };
      }
      const updated: Mentorship = {
        ...existing,
        ...mentorshipData,
        id,
        updatedAt: new Date().toISOString(),
        mentorName: existing.mentorName || `Mentor ${existing.mentorId}`,
        menteeName: existing.menteeName || `Mentee ${existing.menteeId}`,
        sessionCount: typeof existing.sessionCount === 'number' ? existing.sessionCount : (existing.totalSessions ?? 0),
      };
      const persisted = await MockDataLoader.putItem<Mentorship>('mentorships', id, updated);
      return { data: persisted!, success: true, message: 'Mentorship updated successfully' };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: 'Failed to update mentorship',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async deleteMentorship(id: string): Promise<ApiResponse<void>> {
    await delay();
    try {
      const existing = await MockDataLoader.findById<Mentorship>('mentorships', id);
      if (!existing) {
        return {
          data: undefined as any,
          success: false,
          message: 'Mentorship not found',
          error: { code: 404, message: 'Mentorship not found' },
        };
      }
      await MockDataLoader.deleteItem('mentorships', id);
      return { data: undefined as any, success: true, message: 'Mentorship deleted successfully' };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to delete mentorship',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async acceptMentorship(id: string): Promise<ApiResponse<Mentorship>> {
    return this.updateMentorship(id, { status: 'active' });
  }

  static async declineMentorship(id: string): Promise<ApiResponse<Mentorship>> {
    // 'declined' not part of MentorshipStatus union; map to 'cancelled'
    return this.updateMentorship(id, { status: 'cancelled' });
  }

  static async completeMentorship(id: string): Promise<ApiResponse<Mentorship>> {
    return this.updateMentorship(id, { status: 'completed' });
  }

  static async cancelMentorship(id: string): Promise<ApiResponse<Mentorship>> {
    return this.updateMentorship(id, { status: 'cancelled' });
  }

  static async getMentorshipsByMentor(mentorId: string): Promise<ApiResponse<Mentorship[]>> {
    await delay();
    try {
      const mentorships = await MockDataLoader.getMentorships();
      const filtered = mentorships.filter(mentorship => mentorship.mentorId === mentorId);
      return { data: filtered, success: true, message: `Mentorships for mentor '${mentorId}' retrieved successfully` };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve mentorships by mentor',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async getMentorshipsByMentee(menteeId: string): Promise<ApiResponse<Mentorship[]>> {
    await delay();
    try {
      const mentorships = await MockDataLoader.getMentorships();
      const filtered = mentorships.filter(mentorship => mentorship.menteeId === menteeId);
      return { data: filtered, success: true, message: `Mentorships for mentee '${menteeId}' retrieved successfully` };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve mentorships by mentee',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  static async bulkOperation(
    operation: 'accept' | 'decline' | 'complete' | 'cancel' | 'delete',
    mentorshipIds: string[]
  ): Promise<ApiResponse<BulkOperationResult>> {
    await delay();
    try {
      let updatedCount = 0;
      for (const id of mentorshipIds) {
        const mentorship = await MockDataLoader.findById<Mentorship>('mentorships', id);
        if (mentorship) {
          updatedCount++;
        }
      }
      MockDataLoader.clearCache('mentorships');
      return {
        data: { updatedCount },
        success: true,
        message: `Bulk ${operation} completed on ${updatedCount} mentorships`,
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: `Failed to perform bulk ${operation}`,
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
}