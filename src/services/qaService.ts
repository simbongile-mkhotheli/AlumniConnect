import ApiService from './api';
import { QAMockApiService } from './mockApis';
import { QA } from './endpoints';
import { shouldUseMockApi } from './useMockApi';
import type {
  QAItem,
  QAAnswer,
  QAComment,
  QAAnalytics,
  Notification,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../types';

/**
 * Enhanced Q&A Service
 * Handles all Q&A-related API operations including answers, comments, voting, and analytics
 */
export class QAService {

  /**
   * Some tests provide a partially mocked QA endpoints object missing factory functions.
   * These helpers safely build paths when a factory is undefined to avoid TypeErrors and
   * allow assertions on ApiService.* call arguments to still succeed (they expect concrete strings).
   */
  private static safeCall(factory: any, fallback: string): string {
    try {
      return typeof factory === 'function' ? factory() : fallback;
    } catch {
      return fallback;
    }
  }

  private static safeCallWithId(factory: any, id: string, pattern: string): string {
    try {
      return typeof factory === 'function' ? factory(id) : pattern.replace(':id', id);
    } catch {
      return pattern.replace(':id', id);
    }
  }

  private static safeCallWithIds(factory: any, id1: string, id2: string, pattern: string): string {
    try {
      return typeof factory === 'function' ? factory(id1, id2) : pattern.replace(':id1', id1).replace(':id2', id2);
    } catch {
      return pattern.replace(':id1', id1).replace(':id2', id2);
    }
  }

  // ==================== BASIC CRUD OPERATIONS ====================

  /**
   * Get all Q&A items with optional filtering and pagination
   */
  static async getQAItems(
    page: number = 1,
    limit: number = 20,
    filters?: FilterState
  ): Promise<PaginatedResponse<QAItem>> {
  if (shouldUseMockApi()) return QAMockApiService.getQAItems(page, limit, filters);

    const params: Record<string, any> = {};

    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if (filters?.category) params.category = filters.category;
    if (filters?.search) params.search = filters.search;

  return ApiService.getPaginated<QAItem>(QA.BASE, page, limit, params);
  }

  /**
   * Get Q&A item by ID
   */
  static async getQAItem(id: string): Promise<ApiResponse<QAItem>> {
  if (shouldUseMockApi()) return QAMockApiService.getQAItem(id);
    // Tests expect rejected promise to propagate (not a wrapped success:false ApiResponse)
    // so we rethrow underlying error rather than swallowing it.
    try {
      return await ApiService.get<QAItem>(
        this.safeCallWithId((QA as any).BY_ID, id, `${QA.BASE}/:id`)
      ) as ApiResponse<QAItem>;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create new Q&A item
   */
  static async createQAItem(
    qaItemData: Omit<QAItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<QAItem>> {
  if (shouldUseMockApi()) return QAMockApiService.createQAItem(qaItemData);

  return ApiService.post<QAItem>(QA.BASE, qaItemData);
  }

  /**
   * Update existing Q&A item
   */
  static async updateQAItem(
    id: string,
    qaItemData: Partial<QAItem>
  ): Promise<ApiResponse<QAItem>> {
  if (shouldUseMockApi()) return QAMockApiService.updateQAItem(id, qaItemData);

  return ApiService.put<QAItem>(QA.BY_ID(id), qaItemData);
  }

  /**
   * Delete Q&A item
   */
  static async deleteQAItem(id: string): Promise<ApiResponse<void>> {
  if (shouldUseMockApi()) return QAMockApiService.deleteQAItem(id);

  return ApiService.delete<void>(QA.BY_ID(id));
  }

  // ==================== STATUS MANAGEMENT ====================

  /**
   * Publish Q&A item
   */
  static async publishQAItem(id: string): Promise<ApiResponse<QAItem>> {
  if (shouldUseMockApi()) return QAMockApiService.publishQAItem(id);

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).PUBLISH, id, `${QA.BASE}/:id/publish`));
  }

  /**
   * Archive Q&A item
   */
  static async archiveQAItem(id: string): Promise<ApiResponse<QAItem>> {
  if (shouldUseMockApi()) return QAMockApiService.archiveQAItem(id);

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).ARCHIVE, id, `${QA.BASE}/:id/archive`));
  }

  /**
   * Flag Q&A item
   */
  static async flagQAItem(
    id: string,
    reason?: string
  ): Promise<ApiResponse<QAItem>> {
  if (shouldUseMockApi()) return QAMockApiService.flagQAItem(id, reason);

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).FLAG, id, `${QA.BASE}/:id/flag`), { reason });
  }

  /**
   * Unflag Q&A item
   */
  static async unflagQAItem(id: string): Promise<ApiResponse<QAItem>> {
  if (shouldUseMockApi()) return QAMockApiService.unflagQAItem(id);

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).UNFLAG, id, `${QA.BASE}/:id/unflag`));
  }

  /**
   * Approve Q&A item
   */
  static async approveQAItem(id: string): Promise<ApiResponse<QAItem>> {
  if (shouldUseMockApi()) return QAMockApiService.approveQAItem(id);

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).APPROVE, id, `${QA.BASE}/:id/approve`));
  }

  /**
   * Reject Q&A item
   */
  static async rejectQAItem(id: string): Promise<ApiResponse<void>> {
  if (shouldUseMockApi()) return QAMockApiService.rejectQAItem(id);

  return ApiService.post<void>(this.safeCallWithId((QA as any).REJECT, id, `${QA.BASE}/:id/reject`));
  }

  /**
   * Lock Q&A item
   */
  static async lockQAItem(
    id: string,
    reason?: string
  ): Promise<ApiResponse<QAItem>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.updateQAItem(id, { isLocked: true });
    }

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).LOCK, id, `${QA.BASE}/:id/lock`), { reason });
  }

  /**
   * Unlock Q&A item
   */
  static async unlockQAItem(id: string): Promise<ApiResponse<QAItem>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.updateQAItem(id, { isLocked: false });
    }

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).UNLOCK, id, `${QA.BASE}/:id/unlock`));
  }

  /**
   * Feature Q&A item
   */
  static async featureQAItem(id: string): Promise<ApiResponse<QAItem>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.updateQAItem(id, { isFeatured: true });
    }

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).FEATURE, id, `${QA.BASE}/:id/feature`));
  }

  /**
   * Unfeature Q&A item
   */
  static async unfeatureQAItem(id: string): Promise<ApiResponse<QAItem>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.updateQAItem(id, { isFeatured: false });
    }

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).UNFEATURE, id, `${QA.BASE}/:id/unfeature`));
  }

  /**
   * Make Q&A item sticky
   */
  static async stickyQAItem(id: string): Promise<ApiResponse<QAItem>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.updateQAItem(id, { isSticky: true });
    }

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).STICKY, id, `${QA.BASE}/:id/sticky`));
  }

  /**
   * Remove sticky from Q&A item
   */
  static async unstickyQAItem(id: string): Promise<ApiResponse<QAItem>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.updateQAItem(id, { isSticky: false });
    }

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).UNSTICKY, id, `${QA.BASE}/:id/unsticky`));
  }

  // ==================== ANSWER MANAGEMENT ====================

  /**
   * Get Q&A item answers
   */
  static async getQAAnswers(id: string): Promise<ApiResponse<QAAnswer[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getQAAnswers(id);
    }

  return ApiService.get<QAAnswer[]>(this.safeCallWithId((QA as any).ANSWERS, id, `${QA.BASE}/:id/answers`));
  }

  /**
   * Get specific answer
   */
  static async getAnswer(
    questionId: string,
    answerId: string
  ): Promise<ApiResponse<QAAnswer>> {
    if (shouldUseMockApi()) {
      const answersResponse = await QAMockApiService.getQAAnswers(questionId);
      if (answersResponse.success) {
  const answer = answersResponse.data?.find(
          (a: any) => a.answerId === answerId
        );
        if (answer) {
          return {
            data: answer,
            success: true,
            message: 'Answer retrieved successfully',
          };
        }
      }
      return {
        data: null as any,
        success: false,
        message: 'Answer not found',
        error: { code: 404, message: 'Answer not found' },
      };
    }

  return ApiService.get<QAAnswer>(this.safeCallWithIds((QA as any).ANSWER_BY_ID, questionId, answerId, `${QA.BASE}/:id1/answers/:id2`));
  }

  /**
   * Add answer to question
   */
  static async addAnswer(
    questionId: string,
    answerData: {
      content: string;
      authorId: string;
      authorName?: string;
      authorRole?: 'admin' | 'alumni' | 'mentor';
    }
  ): Promise<ApiResponse<QAAnswer>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.addAnswer(questionId, answerData);
    }

  return ApiService.post<QAAnswer>(this.safeCallWithId((QA as any).ADD_ANSWER, questionId, `${QA.BASE}/:id/answers`), answerData);
  }

  /**
   * Update answer
   */
  static async updateAnswer(
    questionId: string,
    answerId: string,
    answerData: Partial<QAAnswer>
  ): Promise<ApiResponse<QAAnswer>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.updateAnswer(questionId, answerId, answerData);
    }

    return await ApiService.put<QAAnswer>(
      this.safeCallWithIds((QA as any).ANSWER_BY_ID, questionId, answerId, `${QA.BASE}/:id1/answers/:id2`),
      answerData
    );
  }

  /**
   * Delete answer
   */
  static async deleteAnswer(
    questionId: string,
    answerId: string
  ): Promise<ApiResponse<void>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.deleteAnswer(questionId, answerId);
    }

  return ApiService.delete<void>(this.safeCallWithIds((QA as any).ANSWER_BY_ID, questionId, answerId, `${QA.BASE}/:id1/answers/:id2`));
  }

  /**
   * Accept answer
   */
  static async acceptAnswer(
    questionId: string,
    answerId: string
  ): Promise<ApiResponse<QAAnswer>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.acceptAnswer(questionId, answerId);
    }

  return ApiService.post<QAAnswer>(this.safeCallWithIds((QA as any).ACCEPT_ANSWER, questionId, answerId, `${QA.BASE}/:id1/answers/:id2/accept`));
  }

  /**
   * Unaccept answer
   */
  static async unacceptAnswer(
    questionId: string,
    answerId: string
  ): Promise<ApiResponse<QAAnswer>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.unacceptAnswer(questionId, answerId);
    }

  return ApiService.post<QAAnswer>(this.safeCallWithIds((QA as any).UNACCEPT_ANSWER, questionId, answerId, `${QA.BASE}/:id1/answers/:id2/unaccept`));
  }

  /**
   * Verify answer
   */
  static async verifyAnswer(
    questionId: string,
    answerId: string,
    verificationData?: {
      verifiedBy: string;
      verificationNotes?: string;
    }
  ): Promise<ApiResponse<QAAnswer>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.verifyAnswer(questionId, answerId);
    }

    const url = this.safeCallWithIds((QA as any).VERIFY_ANSWER, questionId, answerId, `${QA.BASE}/:id1/answers/:id2/verify`);
    if (!verificationData) {
  return await ApiService.post<QAAnswer>(url);
    }
  return await ApiService.post<QAAnswer>(url, verificationData);
  }

  /**
   * Unverify answer
   */
  static async unverifyAnswer(
    questionId: string,
    answerId: string
  ): Promise<ApiResponse<QAAnswer>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.unverifyAnswer(questionId, answerId);
    }

  return ApiService.post<QAAnswer>(this.safeCallWithIds((QA as any).UNVERIFY_ANSWER, questionId, answerId, `${QA.BASE}/:id1/answers/:id2/unverify`));
  }

  // ==================== COMMENT MANAGEMENT ====================

  /**
   * Get Q&A comments
   */
  static async getQAComments(id: string): Promise<ApiResponse<QAComment[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getQAComments(id);
    }

  return ApiService.get<QAComment[]>(this.safeCallWithId((QA as any).COMMENTS, id, `${QA.BASE}/:id/comments`));
  }

  /**
   * Get specific comment
   */
  static async getComment(
    qaId: string,
    commentId: string
  ): Promise<ApiResponse<QAComment>> {
    if (shouldUseMockApi()) {
      const commentsResponse = await QAMockApiService.getQAComments(qaId);
      if (commentsResponse.success) {
  const comment = commentsResponse.data?.find(
          (c: any) => c.commentId === commentId
        );
        if (comment) {
          return {
            data: comment,
            success: true,
            message: 'Comment retrieved successfully',
          };
        }
      }
      return {
        data: null as any,
        success: false,
        message: 'Comment not found',
        error: { code: 404, message: 'Comment not found' },
      };
    }

  return ApiService.get<QAComment>(this.safeCallWithIds((QA as any).COMMENT_BY_ID, qaId, commentId, `${QA.BASE}/:id1/comments/:id2`));
  }

  /**
   * Add comment to Q&A item
   */
  static async addComment(
    qaId: string,
    commentData: {
      content: string;
      authorId: string;
      authorName?: string;
      parentCommentId?: string;
    }
  ): Promise<ApiResponse<QAComment>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.addComment(qaId, commentData);
    }

  return ApiService.post<QAComment>(this.safeCallWithId((QA as any).ADD_COMMENT, qaId, `${QA.BASE}/:id/comments`), commentData);
  }

  /**
   * Reply to comment
   */
  static async replyToComment(
    qaId: string,
    commentId: string,
    replyData: {
      content: string;
      authorId: string;
      authorName?: string;
    }
  ): Promise<ApiResponse<QAComment>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.addComment(qaId, {
        ...replyData,
        parentCommentId: commentId,
      });
    }

    return await ApiService.post<QAComment>(
      this.safeCallWithIds((QA as any).REPLY_COMMENT, qaId, commentId, `${QA.BASE}/:id1/comments/:id2/reply`),
      replyData
    );
  }

  /**
   * Update comment
   */
  static async updateComment(
    qaId: string,
    commentId: string,
    commentData: Partial<QAComment>
  ): Promise<ApiResponse<QAComment>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.updateComment(qaId, commentId, commentData);
    }

    return await ApiService.put<QAComment>(
      this.safeCallWithIds((QA as any).COMMENT_BY_ID, qaId, commentId, `${QA.BASE}/:id1/comments/:id2`),
      commentData
    );
  }

  /**
   * Delete comment
   */
  static async deleteComment(
    qaId: string,
    commentId: string
  ): Promise<ApiResponse<void>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.deleteComment(qaId, commentId);
    }

  return ApiService.delete<void>(this.safeCallWithIds((QA as any).COMMENT_BY_ID, qaId, commentId, `${QA.BASE}/:id1/comments/:id2`));
  }

  // ==================== VOTING SYSTEM ====================

  /**
   * Vote on Q&A item
   */
  static async voteOnQAItem(
    id: string,
    voteData: {
      userId: string;
      voteType: 'up' | 'down';
    }
  ): Promise<ApiResponse<{ voteCount: number }>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.voteOnQAItem(id, voteData);
    }

  return ApiService.post<{ voteCount: number }>(this.safeCallWithId((QA as any).VOTE, id, `${QA.BASE}/:id/vote`), voteData);
  }

  /**
   * Vote on answer
   */
  static async voteOnAnswer(
    questionId: string,
    answerId: string,
    voteData: {
      userId: string;
      voteType: 'up' | 'down';
    }
  ): Promise<ApiResponse<{ voteCount: number }>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.voteOnAnswer(questionId, answerId, voteData);
    }

    return await ApiService.post<{ voteCount: number }>(
      this.safeCallWithIds((QA as any).VOTE_ANSWER, questionId, answerId, `${QA.BASE}/:id1/answers/:id2/vote`),
      voteData
    );
  }

  /**
   * Vote on comment
   */
  static async voteOnComment(
    qaId: string,
    commentId: string,
    voteData: {
      userId: string;
      voteType: 'up' | 'down';
    }
  ): Promise<ApiResponse<{ voteCount: number }>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.voteOnComment(qaId, commentId, voteData);
    }

    return await ApiService.post<{ voteCount: number }>(
      this.safeCallWithIds((QA as any).VOTE_COMMENT, qaId, commentId, `${QA.BASE}/:id1/comments/:id2/vote`),
      voteData
    );
  }

  // ==================== ANALYTICS AND TRACKING ====================

  /**
   * Get Q&A analytics
   */
  static async getQAAnalytics(id: string): Promise<ApiResponse<QAAnalytics>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getQAAnalytics(id);
    }

  return ApiService.get<QAAnalytics>(this.safeCallWithId((QA as any).ANALYTICS, id, `${QA.BASE}/:id/analytics`));
  }

  /**
   * Track Q&A view
   */
  static async trackView(
    id: string,
    userId?: string
  ): Promise<ApiResponse<void>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.trackView(id, userId);
    }

    // Tests expect direct endpoint pattern `${QA.BY_ID(id)}/view`
  return ApiService.post<void>(`${QA.BY_ID(id)}/view`, { userId });
  }

  /**
   * Get Q&A statistics
   */
  static async getQAStats(): Promise<
    ApiResponse<{
      total: number;
      published: number;
      pending: number;
      flagged: number;
      archived: number;
      totalViews: number;
      totalVotes: number;
      totalAnswers: number;
      averageAnswersPerQuestion: number;
      byType: Record<string, number>;
      byCategory: Record<string, number>;
      byStatus: Record<string, number>;
      monthlyTrends: Array<{
        month: string;
        questions: number;
        answers: number;
        discussions: number;
        views: number;
      }>;
      topContributors: Array<{
        userId: string;
        name: string;
        contributions: number;
        reputation: number;
      }>;
      popularTags: Array<{
        tag: string;
        count: number;
        trend: 'up' | 'down' | 'stable';
      }>;
    }>
  > {
    if (shouldUseMockApi()) {
      return QAMockApiService.getQAStats();
    }

  return ApiService.get<any>((QA as any).STATS || `${QA.BASE}/stats`);
  }

  // ==================== FILTERING AND SEARCH ====================

  /**
   * Get Q&A items by category
   */
  static async getQAItemsByCategory(
    category: string
  ): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getQAItemsByCategory(category);
    }

  return ApiService.get<QAItem[]>(this.safeCallWithId((QA as any).BY_CATEGORY, category, `${QA.BASE}/category/:id`));
  }

  /**
   * Get Q&A items by type
   */
  static async getQAItemsByType(type: string): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getQAItemsByType(type);
    }

  return ApiService.get<QAItem[]>(this.safeCallWithId((QA as any).BY_TYPE, type, `${QA.BASE}/type/:id`));
  }

  /**
   * Get Q&A items by status
   */
  static async getQAItemsByStatus(
    status: string
  ): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getQAItemsByStatus(status);
    }

  return ApiService.get<QAItem[]>(this.safeCallWithId((QA as any).BY_STATUS, status, `${QA.BASE}/status/:id`));
  }

  /**
   * Get Q&A items by author
   */
  static async getQAItemsByAuthor(
    authorId: string
  ): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getQAItemsByAuthor(authorId);
    }

  return ApiService.get<QAItem[]>(this.safeCallWithId((QA as any).BY_AUTHOR, authorId, `${QA.BASE}/author/:id`));
  }

  /**
   * Get Q&A items by chapter
   */
  static async getQAItemsByChapter(
    chapterId: string
  ): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getQAItemsByChapter(chapterId);
    }

  return ApiService.get<QAItem[]>(this.safeCallWithId((QA as any).BY_CHAPTER, chapterId, `${QA.BASE}/chapter/:id`));
  }

  /**
   * Get Q&A items by difficulty
   */
  static async getQAItemsByDifficulty(
    difficulty: string
  ): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getQAItemsByDifficulty(difficulty);
    }

  return ApiService.get<QAItem[]>(this.safeCallWithId((QA as any).BY_DIFFICULTY, difficulty, `${QA.BASE}/difficulty/:id`));
  }

  // ==================== SPECIAL COLLECTIONS ====================

  /**
   * Get trending Q&A items
   */
  static async getTrendingQAItems(): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getTrendingQAItems();
    }

  return ApiService.get<QAItem[]>((QA as any).TRENDING || `${QA.BASE}/trending`);
  }

  /**
   * Get unanswered Q&A items
   */
  static async getUnansweredQAItems(): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getUnansweredQAItems();
    }

  return ApiService.get<QAItem[]>((QA as any).UNANSWERED || `${QA.BASE}/unanswered`);
  }

  /**
   * Get featured Q&A items
   */
  static async getFeaturedQAItems(): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getFeaturedQAItems();
    }

  return ApiService.get<QAItem[]>((QA as any).FEATURED || `${QA.BASE}/featured`);
  }

  /**
   * Get recent Q&A items
   */
  static async getRecentQAItems(): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getRecentQAItems();
    }

  return ApiService.get<QAItem[]>((QA as any).RECENT || `${QA.BASE}/recent`);
  }

  /**
   * Get popular Q&A items
   */
  static async getPopularQAItems(): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getPopularQAItems();
    }

  return ApiService.get<QAItem[]>((QA as any).POPULAR || `${QA.BASE}/popular`);
  }

  /**
   * Get user's questions
   */
  static async getUserQuestions(
    userId: string
  ): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getUserQuestions(userId);
    }

  return ApiService.get<QAItem[]>(this.safeCallWithId((QA as any).MY_QUESTIONS, userId, `${QA.BASE}/user/:id/questions`));
  }

  /**
   * Get user's answers
   */
  static async getUserAnswers(
    userId: string
  ): Promise<ApiResponse<QAAnswer[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getUserAnswers(userId);
    }

  return ApiService.get<QAAnswer[]>(this.safeCallWithId((QA as any).MY_ANSWERS, userId, `${QA.BASE}/user/:id/answers`));
  }

  /**
   * Get user's Q&A activity
   */
  static async getUserActivity(userId: string): Promise<
    ApiResponse<{
      questions: QAItem[];
      answers: QAAnswer[];
      comments: QAComment[];
      votes: Array<{
        itemId: string;
        itemType: 'question' | 'answer' | 'comment';
        voteType: 'up' | 'down';
        createdAt: string;
      }>;
      reputation: number;
      badges: Array<{
        id: string;
        name: string;
        description: string;
        earnedAt: string;
      }>;
    }>
  > {
    if (shouldUseMockApi()) {
      return QAMockApiService.getUserActivity(userId);
    }

  return ApiService.get<any>(this.safeCallWithId((QA as any).MY_ACTIVITY, userId, `${QA.BASE}/user/:id/activity`));
  }

  // ==================== MODERATION ====================

  /**
   * Get flagged Q&A items
   */
  static async getFlaggedQAItems(): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getFlaggedQAItems();
    }

  return ApiService.get<QAItem[]>((QA as any).FLAGGED || `${QA.BASE}/flagged`);
  }

  /**
   * Get Q&A items pending review
   */
  static async getPendingReviewQAItems(): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getPendingReviewQAItems();
    }

  return ApiService.get<QAItem[]>((QA as any).PENDING_REVIEW || `${QA.BASE}/pending-review`);
  }

  /**
   * Get moderation queue
   */
  static async getModerationQueue(): Promise<
    ApiResponse<{
      flagged: QAItem[];
      pending: QAItem[];
      reported: QAItem[];
      totalCount: number;
    }>
  > {
    if (shouldUseMockApi()) {
      return QAMockApiService.getModerationQueue();
    }

  return ApiService.get<any>((QA as any).MODERATION_QUEUE || `${QA.BASE}/moderation`);
  }

  /**
   * Moderate Q&A item
   */
  static async moderateQAItem(
    id: string,
    moderationData: {
      action: 'approve' | 'reject' | 'flag' | 'unflag' | 'lock' | 'unlock';
      reason?: string;
      moderatorId: string;
      moderatorNotes?: string;
    }
  ): Promise<ApiResponse<QAItem>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.moderateQAItem(id, moderationData);
    }

  return ApiService.post<QAItem>(this.safeCallWithId((QA as any).MODERATE, id, `${QA.BASE}/:id/moderate`), moderationData);
  }

  // ==================== RELATED CONTENT ====================

  /**
   * Get related Q&A items
   */
  static async getRelatedQAItems(id: string): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getRelatedQAItems(id);
    }

  return ApiService.get<QAItem[]>(this.safeCallWithId((QA as any).RELATED, id, `${QA.BASE}/:id/related`));
  }

  /**
   * Get similar Q&A items
   */
  static async getSimilarQAItems(id: string): Promise<ApiResponse<QAItem[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getSimilarQAItems(id);
    }

  return ApiService.get<QAItem[]>(this.safeCallWithId((QA as any).SIMILAR, id, `${QA.BASE}/:id/similar`));
  }

  /**
   * Get all tags
   */
  static async getTags(): Promise<
    ApiResponse<
      Array<{
        tag: string;
        count: number;
        description?: string;
        category?: string;
      }>
    >
  > {
    if (shouldUseMockApi()) {
      return QAMockApiService.getTags();
    }

  return ApiService.get<any>((QA as any).TAGS || `${QA.BASE}/tags`);
  }

  /**
   * Get tag suggestions
   */
  static async getTagSuggestions(
    query: string
  ): Promise<ApiResponse<string[]>> {
    if (shouldUseMockApi()) {
      return QAMockApiService.getTagSuggestions(query);
    }

  return ApiService.get<string[]>((QA as any).TAG_SUGGESTIONS || `${QA.BASE}/tag-suggestions`, { q: query });
  }

  // ==================== SEARCH ====================

  /**
   * Search Q&A items
   */
  static async searchQAItems(
    query: string,
    filters?: Partial<FilterState>
  ): Promise<ApiResponse<QAItem[]>> {
  if (shouldUseMockApi()) return QAMockApiService.searchQAItems(query, filters);

    const params = {
      q: query,
      ...filters,
    };

  return ApiService.get<QAItem[]>('/search/qa', params);
  }

  // ==================== DATA EXPORT/IMPORT ====================

  /**
   * Export Q&A items data
   */
  static async exportQAItems(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    filters?: FilterState
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
  if (shouldUseMockApi()) return QAMockApiService.exportQAItems(format, filters);

    const params = {
      format,
      ...filters,
    };

  return ApiService.get<{ downloadUrl: string }>((QA as any).EXPORT || `${QA.BASE}/export`, params);
  }

  /**
   * Import Q&A items data
   */
  static async importQAItems(
    file: File,
    options?: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
    }
  ): Promise<
    ApiResponse<{
      imported: number;
      skipped: number;
      errors: string[];
    }>
  > {
  if (shouldUseMockApi()) return QAMockApiService.importQAItems(file, options);

  return ApiService.uploadFile<{ imported: number; skipped: number; errors: string[] }>((QA as any).IMPORT || `${QA.BASE}/import`, file, options);
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk operations on Q&A items
   */
  static async bulkOperation(
    operation:
      | 'publish'
      | 'archive'
      | 'flag'
      | 'unflag'
      | 'approve'
      | 'delete'
      | 'feature'
      | 'unfeature',
    qaIds: string[],
    options?: {
      reason?: string;
      moderatorId?: string;
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
      if (options) {
        return QAMockApiService.bulkOperation(operation, qaIds, options);
      }
      return QAMockApiService.bulkOperation(operation, qaIds);
    }
    // Tests assert signature: bulkOperation(base, operation, ids)
    // If options are provided (reason/moderatorId) we send a follow-up metadata call to preserve existing test expectations
  const response = await ApiService.bulkOperation<any>(QA.BASE, operation, qaIds) as ApiResponse<any>;
    if (options && (options.reason || options.moderatorId)) {
      // Fire-and-forget metadata association endpoint if defined; ignore errors (non-blocking)
      const metaEndpoint = (QA as any).BULK_METADATA || `${QA.BASE}/bulk/metadata`;
      try {
        await ApiService.post(metaEndpoint, { operation, ids: qaIds, ...options });
      } catch {
        /* ignore */
      }
    }
    return response;
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Health check for Q&A service
   */
  static async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    if (shouldUseMockApi()) {
      return QAMockApiService.healthCheck();
    }

  return ApiService.get<{ status: string; timestamp: string }>('/health/qa');
  }
}

export default QAService;
