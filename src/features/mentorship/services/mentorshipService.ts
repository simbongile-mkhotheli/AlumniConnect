import { ApiService, shouldUseMockApi } from '@shared/services';
import { MentorshipMockApiService } from './mockApi';
import { MENTORSHIP_ENDPOINTS } from './endpoints';
import type {
  Mentorship,
  MentorshipFormData,
  MentorshipFilters,
  ApiResponse,
  PaginatedResponse,
  BulkOperationResult,
} from '../types';

/**
 * Mentorship Service
 * Handles all mentorship-related API operations
 */
export class MentorshipService {

  /**
   * Get all mentorships with optional filtering and pagination
   */
  static async getMentorships(
    page: number = 1,
    limit: number = 20,
    filters?: MentorshipFilters
  ): Promise<PaginatedResponse<Mentorship>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.getMentorships(page, limit, filters);
    }

    const params: Record<string, any> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.mentorId) params.mentorId = filters.mentorId;
    if (filters?.menteeId) params.menteeId = filters.menteeId;
    if (filters?.search) params.search = filters.search;

    return ApiService.getPaginated<Mentorship>(MENTORSHIP_ENDPOINTS.BASE, page, limit, params);
  }

  /**
   * Get mentorship by ID
   */
  static async getMentorship(id: string): Promise<ApiResponse<Mentorship>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.getMentorship(id);
    }

    return ApiService.get<Mentorship>(MENTORSHIP_ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new mentorship
   */
  static async createMentorship(mentorshipData: MentorshipFormData): Promise<ApiResponse<Mentorship>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.createMentorship(mentorshipData);
    }

    return ApiService.post<Mentorship>(MENTORSHIP_ENDPOINTS.BASE, mentorshipData);
  }

  /**
   * Update existing mentorship
   */
  static async updateMentorship(
    id: string,
    mentorshipData: Partial<MentorshipFormData>
  ): Promise<ApiResponse<Mentorship>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.updateMentorship(id, mentorshipData);
    }

    return ApiService.put<Mentorship>(MENTORSHIP_ENDPOINTS.BY_ID(id), mentorshipData);
  }

  /**
   * Delete mentorship
   */
  static async deleteMentorship(id: string): Promise<ApiResponse<void>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.deleteMentorship(id);
    }

    return ApiService.delete<void>(MENTORSHIP_ENDPOINTS.BY_ID(id));
  }

  /**
   * Accept mentorship request
   */
  static async acceptMentorship(id: string): Promise<ApiResponse<Mentorship>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.acceptMentorship(id);
    }

    return ApiService.post<Mentorship>(MENTORSHIP_ENDPOINTS.ACCEPT(id));
  }

  /**
   * Decline mentorship request
   */
  static async declineMentorship(id: string): Promise<ApiResponse<Mentorship>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.declineMentorship(id);
    }

    return ApiService.post<Mentorship>(MENTORSHIP_ENDPOINTS.DECLINE(id));
  }

  /**
   * Complete mentorship
   */
  static async completeMentorship(id: string): Promise<ApiResponse<Mentorship>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.completeMentorship(id);
    }

    return ApiService.post<Mentorship>(MENTORSHIP_ENDPOINTS.COMPLETE(id));
  }

  /**
   * Cancel mentorship
   */
  static async cancelMentorship(id: string): Promise<ApiResponse<Mentorship>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.cancelMentorship(id);
    }

    return ApiService.post<Mentorship>(MENTORSHIP_ENDPOINTS.CANCEL(id));
  }

  /**
   * Get mentorships by mentor
   */
  static async getMentorshipsByMentor(mentorId: string): Promise<ApiResponse<Mentorship[]>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.getMentorshipsByMentor(mentorId);
    }

    return ApiService.get<Mentorship[]>(MENTORSHIP_ENDPOINTS.BY_MENTOR(mentorId));
  }

  /**
   * Get mentorships by mentee
   */
  static async getMentorshipsByMentee(menteeId: string): Promise<ApiResponse<Mentorship[]>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.getMentorshipsByMentee(menteeId);
    }

    return ApiService.get<Mentorship[]>(MENTORSHIP_ENDPOINTS.BY_MENTEE(menteeId));
  }

  /**
   * Bulk operations on mentorships
   */
  static async bulkOperation(
    operation: 'accept' | 'decline' | 'complete' | 'cancel' | 'delete',
    mentorshipIds: string[]
  ): Promise<ApiResponse<BulkOperationResult>> {
    if (shouldUseMockApi()) {
      return MentorshipMockApiService.bulkOperation(operation, mentorshipIds);
    }

    return ApiService.bulkOperation<BulkOperationResult>(MENTORSHIP_ENDPOINTS.BASE, operation, mentorshipIds);
  }
}

export default MentorshipService;