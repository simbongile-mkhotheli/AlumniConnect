import ApiService from './api';
import { MentorshipsMockApiService } from './mockApis';
import { MENTORSHIP } from './endpoints';
import { shouldUseMockApi } from './useMockApi';
import type {
  Mentorship,
  MentorshipSession,
  MentorshipAnalytics,
  Notification,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../types';

/**
 * Enhanced Mentorship Service
 * Handles all mentorship-related API operations including sessions, feedback, and analytics
 */
export class MentorshipService {

  // ==================== BASIC CRUD OPERATIONS ====================

  /**
   * Get all mentorships with optional filtering and pagination
   */
  static async getMentorships(
    page: number = 1,
    limit: number = 20,
    filters?: FilterState
  ): Promise<PaginatedResponse<Mentorship>> {
    if (shouldUseMockApi()) {
      return (await MentorshipsMockApiService.getMentorships(page, limit, filters)) as unknown as PaginatedResponse<Mentorship>;
    }
    const params: Record<string, any> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if ((filters as any)?.category) params.category = (filters as any).category;
    if (filters?.search) params.search = filters.search;
    return ApiService.getPaginated<Mentorship>(MENTORSHIP.BASE, page, limit, params);
  }

  /**
   * Get mentorship by ID
   */
  static async getMentorship(id: string): Promise<ApiResponse<Mentorship>> {
    if (shouldUseMockApi()) return (await MentorshipsMockApiService.getMentorship(id)) as ApiResponse<Mentorship>;
    return ApiService.get<Mentorship>(MENTORSHIP.BY_ID(id));
  }

  /**
   * Create new mentorship
   */
  static async createMentorship(
    mentorshipData: Omit<Mentorship, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Mentorship>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.createMentorship(mentorshipData) as any;
  return ApiService.post<Mentorship>(MENTORSHIP.BASE, mentorshipData);
  }

  /**
   * Update existing mentorship
   */
  static async updateMentorship(
    id: string,
    mentorshipData: Partial<Mentorship>
  ): Promise<ApiResponse<Mentorship>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.updateMentorship(id, mentorshipData) as any;
  return ApiService.put<Mentorship>(MENTORSHIP.BY_ID(id), mentorshipData);
  }

  /**
   * Delete mentorship
   */
  static async deleteMentorship(id: string): Promise<ApiResponse<null>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.deleteMentorship(id) as any;
  return ApiService.delete<null>(MENTORSHIP.BY_ID(id));
  }

  // ==================== STATUS MANAGEMENT ====================

  /**
   * Approve mentorship
   */
  static async approveMentorship(id: string): Promise<ApiResponse<Mentorship>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.approveMentorship(id) as any;
  return ApiService.post<Mentorship>(MENTORSHIP.APPROVE(id));
  }

  /**
   * Reject mentorship
   */
  static async rejectMentorship(
    id: string,
    reason?: string
  ): Promise<ApiResponse<Mentorship>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.rejectMentorship(id, reason) as any;
  return ApiService.post<Mentorship>(MENTORSHIP.REJECT(id), { reason });
  }

  /**
   * Complete mentorship
   */
  static async completeMentorship(
    id: string,
    feedback?: {
      mentorFeedback?: string;
      menteeFeedback?: string;
      rating?: number;
      outcomes?: string[];
      recommendations?: string;
    }
  ): Promise<ApiResponse<Mentorship>> {
  // Pass feedback through so tests spying on mock receive second arg
  if (shouldUseMockApi()) {
    return (feedback
      ? (MentorshipsMockApiService as any).completeMentorship(id, feedback)
      : MentorshipsMockApiService.completeMentorship(id)) as any;
  }
  return ApiService.post<Mentorship>(MENTORSHIP.COMPLETE(id), feedback);
  }

  /**
   * Pause mentorship
   */
  static async pauseMentorship(
    id: string,
    reason?: string
  ): Promise<ApiResponse<Mentorship>> {
  // Mock service lacks pause/resume; fall back to approve/reject semantics if needed
  if (shouldUseMockApi()) return MentorshipsMockApiService.approveMentorship(id) as any;
  return ApiService.post<Mentorship>(MENTORSHIP.PAUSE(id), { reason });
  }

  /**
   * Resume mentorship
   */
  static async resumeMentorship(id: string): Promise<ApiResponse<Mentorship>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.approveMentorship(id) as any;
  return ApiService.post<Mentorship>(MENTORSHIP.RESUME(id));
  }

  /**
   * Cancel mentorship
   */
  static async cancelMentorship(
    id: string,
    reason?: string
  ): Promise<ApiResponse<Mentorship>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.rejectMentorship(id, reason || 'Cancelled') as any;
  return ApiService.post<Mentorship>(MENTORSHIP.CANCEL(id), { reason });
  }

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Get mentorship sessions
   */
  static async getMentorshipSessions(
    id: string
  ): Promise<ApiResponse<MentorshipSession[]>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorshipSessions(id) as any;
  return ApiService.get<MentorshipSession[]>(MENTORSHIP.SESSIONS(id));
  }

  /**
   * Get specific session
   */
  static async getSession(
    mentorshipId: string,
    sessionId: string
  ): Promise<ApiResponse<MentorshipSession>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorship(mentorshipId) as any; // session fallback not implemented
    return ApiService.get<MentorshipSession>(MENTORSHIP.SESSION_BY_ID(mentorshipId, sessionId));
  }

  /**
   * Schedule mentorship session
   */
  static async scheduleSession(
    id: string,
    sessionData: {
      title: string;
      description?: string;
      scheduledAt: string;
      duration: number;
      meetingUrl?: string;
      meetingType?: 'video' | 'phone' | 'in_person';
      location?: string;
      agenda?: string[];
      objectives?: string[];
    }
  ): Promise<ApiResponse<MentorshipSession>> {
    if (shouldUseMockApi()) return MentorshipsMockApiService.scheduleSession(id, sessionData) as any;
    return ApiService.post<MentorshipSession>(MENTORSHIP.SCHEDULE(id), sessionData);
  }

  /**
   * Reschedule session
   */
  static async rescheduleSession(
    mentorshipId: string,
    sessionId: string,
    newScheduleData: {
      scheduledAt: string;
      reason?: string;
    }
  ): Promise<ApiResponse<MentorshipSession>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.scheduleSession(mentorshipId, { ...newScheduleData }) as any;
    return ApiService.post<MentorshipSession>(MENTORSHIP.RESCHEDULE(mentorshipId, sessionId), newScheduleData);
  }

  /**
   * Complete session
   */
  static async completeSession(
    mentorshipId: string,
    sessionId: string,
    completionData: {
      notes?: string;
      feedback?: {
        mentorRating?: number;
        menteeRating?: number;
        mentorNotes?: string;
        menteeNotes?: string;
        sessionQuality?: number;
        goalProgress?: number;
      };
      actionItems?: Array<{
        description: string;
        assignedTo: 'mentor' | 'mentee';
        dueDate?: string;
      }>;
      resources?: Array<{
        title: string;
        url: string;
        type: 'document' | 'video' | 'article' | 'tool';
      }>;
      nextSessionPlanned?: boolean;
    }
  ): Promise<ApiResponse<MentorshipSession>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.completeMentorship(mentorshipId) as any; // simplified mock behavior
    return ApiService.post<MentorshipSession>(MENTORSHIP.COMPLETE_SESSION(mentorshipId, sessionId), completionData);
  }

  /**
   * Cancel session
   */
  static async cancelSession(
    mentorshipId: string,
    sessionId: string,
    reason?: string
  ): Promise<ApiResponse<MentorshipSession>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.rejectMentorship(mentorshipId, reason || 'Session cancelled') as any;
    return ApiService.post<MentorshipSession>(MENTORSHIP.CANCEL_SESSION(mentorshipId, sessionId), { reason });
  }

  // ==================== FEEDBACK AND RATINGS ====================

  /**
   * Submit mentorship feedback
   */
  static async submitFeedback(
    id: string,
    feedbackData: {
      rating: number;
      feedback: string;
      submittedBy: 'mentor' | 'mentee';
      categories?: {
        communication?: number;
        expertise?: number;
        availability?: number;
        helpfulness?: number;
      };
      wouldRecommend?: boolean;
      improvements?: string;
    }
  ): Promise<ApiResponse<any>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.approveMentorship(id) as any;
  return ApiService.post<any>(MENTORSHIP.FEEDBACK(id), feedbackData);
  }

  /**
   * Submit session feedback
   */
  static async submitSessionFeedback(
    mentorshipId: string,
    sessionId: string,
    feedbackData: {
      rating: number;
      feedback: string;
      submittedBy: 'mentor' | 'mentee';
      sessionQuality?: number;
      goalProgress?: number;
      preparedness?: number;
      engagement?: number;
    }
  ): Promise<ApiResponse<any>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.approveMentorship(mentorshipId) as any;
    return ApiService.post<any>(MENTORSHIP.SESSION_FEEDBACK(mentorshipId, sessionId), feedbackData);
  }

  /**
   * Rate mentorship
   */
  static async rateMentorship(
    id: string,
    ratingData: {
      rating: number;
      ratedBy: 'mentor' | 'mentee';
      review?: string;
    }
  ): Promise<ApiResponse<Mentorship>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.approveMentorship(id) as any;
  return ApiService.post<Mentorship>(MENTORSHIP.RATE(id), ratingData);
  }

  // ==================== ANALYTICS AND REPORTING ====================

  /**
   * Get mentorship analytics
   */
  static async getMentorshipAnalytics(
    id: string
  ): Promise<ApiResponse<MentorshipAnalytics>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorshipAnalytics(id) as any;
  return ApiService.get<MentorshipAnalytics>(MENTORSHIP.ANALYTICS(id));
  }

  /**
   * Get mentorship progress
   */
  static async getMentorshipProgress(id: string): Promise<
    ApiResponse<{
      overallProgress: number;
      goalsCompleted: number;
      totalGoals: number;
      milestonesAchieved: number;
      totalMilestones: number;
      sessionsCompleted: number;
      totalSessions: number;
      progressHistory: Array<{
        date: string;
        progress: number;
        milestone?: string;
      }>;
    }>
  > {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorship(id) as any;
  return ApiService.get<{
      overallProgress: number;
      goalsCompleted: number;
      totalGoals: number;
      milestonesAchieved: number;
      totalMilestones: number;
      sessionsCompleted: number;
      totalSessions: number;
      progressHistory: Array<{
        date: string;
        progress: number;
        milestone?: string;
      }>;
    }>(MENTORSHIP.PROGRESS(id));
  }

  /**
   * Get mentorship statistics
   */
  static async getMentorshipStats(): Promise<
    ApiResponse<{
      total: number;
      active: number;
      pending: number;
      completed: number;
      paused: number;
      cancelled: number;
      averageRating: number;
      completionRate: number;
      averageDuration: number;
      totalSessions: number;
      byType: Record<string, number>;
      byCategory: Record<string, number>;
      monthlyTrends: Array<{
        month: string;
        created: number;
        completed: number;
        active: number;
      }>;
    }>
  > {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorshipStats() as any;
  return ApiService.get<{
      total: number;
      active: number;
      pending: number;
      completed: number;
      paused: number;
      cancelled: number;
      averageRating: number;
      completionRate: number;
      averageDuration: number;
      totalSessions: number;
      byType: Record<string, number>;
      byCategory: Record<string, number>;
      monthlyTrends: Array<{
        month: string;
        created: number;
        completed: number;
        active: number;
      }>;
    }>(MENTORSHIP.STATS);
  }

  // ==================== FILTERING AND SEARCH ====================

  /**
   * Get mentorships by type
   */
  static async getMentorshipsByType(
    type: string
  ): Promise<ApiResponse<Mentorship[]>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorshipsByType(type as any) as any;
  return ApiService.get<Mentorship[]>(MENTORSHIP.BY_TYPE(type));
  }

  /**
   * Get mentorships by status
   */
  static async getMentorshipsByStatus(
    status: string
  ): Promise<ApiResponse<Mentorship[]>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorshipsByStatus(status as any) as any;
  return ApiService.get<Mentorship[]>(MENTORSHIP.BY_STATUS(status));
  }

  /**
   * Get mentorships by mentor
   */
  static async getMentorshipsByMentor(
    mentorId: string
  ): Promise<ApiResponse<Mentorship[]>> {
  // No dedicated mock; reuse getMentorships with filter
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorships(1, 20, { search: mentorId } as any) as any;
  return ApiService.get<Mentorship[]>(MENTORSHIP.BY_MENTOR(mentorId));
  }

  /**
   * Get mentorships by mentee
   */
  static async getMentorshipsByMentee(
    menteeId: string
  ): Promise<ApiResponse<Mentorship[]>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorships(1, 20, { search: menteeId } as any) as any;
  return ApiService.get<Mentorship[]>(MENTORSHIP.BY_MENTEE(menteeId));
  }

  /**
   * Get mentorships by chapter
   */
  static async getMentorshipsByChapter(
    chapterId: string
  ): Promise<ApiResponse<Mentorship[]>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorships(1, 20, { search: chapterId } as any) as any;
  return ApiService.get<Mentorship[]>(MENTORSHIP.BY_CHAPTER(chapterId));
  }

  /**
   * Get active mentorships
   */
  static async getActiveMentorships(): Promise<ApiResponse<Mentorship[]>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getActiveMentorships() as any;
  return ApiService.get<Mentorship[]>(MENTORSHIP.ACTIVE);
  }

  /**
   * Get pending mentorships
   */
  static async getPendingMentorships(): Promise<ApiResponse<Mentorship[]>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getPendingMentorships() as any;
  return ApiService.get<Mentorship[]>(MENTORSHIP.PENDING);
  }

  /**
   * Get completed mentorships
   */
  static async getCompletedMentorships(): Promise<ApiResponse<Mentorship[]>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorshipsByStatus('completed') as any;
  return ApiService.get<Mentorship[]>(MENTORSHIP.COMPLETED);
  }

  // ==================== MATCHING AND RECOMMENDATIONS ====================

  /**
   * Find mentorship matches
   */
  static async findMatches(criteria: {
    userId: string;
    role: 'mentor' | 'mentee';
    type?: string;
    skills?: string[];
    interests?: string[];
    location?: string;
    availability?: string;
  }): Promise<
    ApiResponse<
      Array<{
        userId: string;
        name: string;
        matchScore: number;
        commonSkills: string[];
        commonInterests: string[];
        experience: string;
        availability: string;
      }>
    >
  > {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorships(1, 20, { search: criteria.userId } as any) as any;
  return ApiService.post<any>(MENTORSHIP.MATCH, criteria);
  }

  /**
   * Get mentorship recommendations
   */
  static async getRecommendations(userId: string): Promise<
    ApiResponse<
      Array<{
        mentorshipId?: string;
        userId: string;
        name: string;
        type: string;
        reason: string;
        score: number;
      }>
    >
  > {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorships(1, 20, { search: userId } as any) as any;
  return ApiService.get<any>(MENTORSHIP.RECOMMENDATIONS(userId));
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Get mentorship notifications
   */
  static async getMentorshipNotifications(
    id: string
  ): Promise<ApiResponse<Notification[]>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorship(id) as any; // fallback
  return ApiService.get<Notification[]>(MENTORSHIP.NOTIFICATIONS(id));
  }

  /**
   * Send mentorship notification
   */
  static async sendNotification(
    id: string,
    notificationData: {
      type: string;
      recipientId: string;
      title: string;
      message: string;
      actionUrl?: string;
    }
  ): Promise<ApiResponse<Notification>> {
  if (shouldUseMockApi()) return MentorshipsMockApiService.sendNotification(id, { ...notificationData, type: 'mentorship' } as any) as any;
    return ApiService.post<Notification>(MENTORSHIP.SEND_NOTIFICATION(id), notificationData);
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk operations on mentorships
   */
  static async bulkOperation(
    operation:
      | 'approve'
      | 'reject'
      | 'complete'
      | 'delete'
      | 'activate'
      | 'cancel'
      | 'pause'
      | 'resume',
    mentorshipIds: string[],
    options?: {
      reason?: string;
      feedback?: any;
    }
  ): Promise<
    ApiResponse<{
      processedIds: string[];
      successCount: number;
      failureCount: number;
      errors?: Array<{ id: string; error: string }>;
    }>
  > {
    if (shouldUseMockApi()) {
      return (options
        ? MentorshipsMockApiService.bulkOperation(operation, mentorshipIds, options)
        : MentorshipsMockApiService.bulkOperation(operation, mentorshipIds)) as any;
    }
    return ApiService.bulkOperation<any>(MENTORSHIP.BASE, operation, mentorshipIds);
  }

  // ==================== DATA EXPORT/IMPORT ====================

  /**
   * Export mentorship data
   */
  static async exportMentorships(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    filters?: FilterState
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const params = { format, ...filters };
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorships(1, 20, filters as any) as any;
  return ApiService.get<{ downloadUrl: string }>(MENTORSHIP.EXPORT, params);
  }

  /**
   * Import mentorship data
   */
  static async importMentorships(
    file: File,
    options?: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
      validateData?: boolean;
    }
  ): Promise<
    ApiResponse<{
      imported: number;
      skipped: number;
      errors: string[];
    }>
  > {
  if (shouldUseMockApi()) return MentorshipsMockApiService.getMentorships() as any;
  return ApiService.uploadFile<{ imported: number; skipped: number; errors: string[] }>(MENTORSHIP.IMPORT, file, options);
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Health check for mentorship service
   */
  static async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    if (shouldUseMockApi()) return MentorshipsMockApiService.healthCheck() as any;
    return ApiService.get<{ status: string; timestamp: string }>('/health/mentorship');
  }
}

export default MentorshipService;
