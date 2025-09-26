import { ApiService, shouldUseMockApi } from '@shared/services';
import { QAMockApi } from './mockApi';
import { QA_ENDPOINTS, buildQAEndpoint } from './endpoints';
import type { QAItem, QAFilters, QACategory } from '../types/qa';
import type { PaginatedResponse } from '@shared/types';

// Local narrow interfaces for service expectations
interface QAQuestion {
  id: string;
  title?: string;
  content?: string;
  authorId?: string;
  category?: string;
  tags?: string[];
  status?: string;
  upvotes?: number;
  downvotes?: number;
  viewCount?: number;
  answerCount?: number;
  createdAt?: string;
  updatedAt?: string;
  hasAcceptedAnswer?: boolean;
  type?: string;
  isAnonymous?: boolean;
  isBookmarked?: boolean;
  isFollowed?: boolean;
}
interface QAAnswer { id?: string; answerId?: string; questionId?: string; content?: string; authorId?: string; isAccepted?: boolean; createdAt?: string; updatedAt?: string; }
interface QAVote { id: string; targetId: string; targetType: 'question' | 'answer'; userId: string; voteType: 'up' | 'down'; createdAt: string; updatedAt: string; }

// Basic request payload shapes (mock + future API parity)
interface CreateQuestionRequest { title: string; content: string; authorId: string; category?: string; tags?: string[]; isAnonymous?: boolean; }
interface UpdateQuestionRequest { title?: string; content?: string; category?: string; tags?: string[]; }
interface CreateAnswerRequest { content: string; authorId: string; isAnonymous?: boolean; }
interface UpdateAnswerRequest { content?: string; }

/**
 * Q&A Service
 * Handles all Q&A operations including questions, answers, voting,
 * categories, and community moderation features
 */
export class QAService {
  private apiService: typeof ApiService;
  private mockApi: QAMockApi;
  private useMock: boolean;

  constructor() {
    this.apiService = ApiService;
    this.mockApi = new QAMockApi();
    this.useMock = shouldUseMockApi();
  }

  // Question Management
  async getQuestions(params?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return this.mockApi.getQuestions(params as any) as unknown as PaginatedResponse<QAQuestion>;
    }
    
    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      QA_ENDPOINTS.QUESTIONS,
      { params }
    );
    return response.data;
  }

  async getQuestionById(id: string): Promise<QAQuestion | null> {
    if (this.useMock) {
      return this.mockApi.getQuestionById(id) as unknown as QAQuestion | null;
    }

    try {
      const response = await this.apiService.get<QAQuestion>(
        buildQAEndpoint('QUESTION_BY_ID', { id })
      );
      return response.data;
    } catch (error) {
      // Swallow not-found semantics generically (service lacks isNotFoundError)
      return null;
    }
  }

  async createQuestion(request: CreateQuestionRequest): Promise<QAQuestion> {
    if (this.useMock) {
      return this.mockApi.createQuestion(request) as unknown as QAQuestion;
    }

    const response = await this.apiService.post<QAQuestion>(
      QA_ENDPOINTS.QUESTIONS,
      request
    );
    return response.data;
  }

  async updateQuestion(id: string, request: UpdateQuestionRequest): Promise<QAQuestion | null> {
    if (this.useMock) {
      return this.mockApi.updateQuestion(id, request) as unknown as QAQuestion | null;
    }

    try {
      const response = await this.apiService.put<QAQuestion>(
        buildQAEndpoint('QUESTION_BY_ID', { id }),
        request
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async deleteQuestion(id: string): Promise<boolean> {
    if (this.useMock) {
      return this.mockApi.deleteQuestion(id);
    }

    try {
      await this.apiService.delete(buildQAEndpoint('QUESTION_BY_ID', { id }));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Answer Management
  async getAnswersByQuestionId(questionId: string): Promise<QAAnswer[]> {
    if (this.useMock) {
      // Answers collection not implemented in mock yet
      return [];
    }
    const response = await this.apiService.get<QAAnswer[]>(buildQAEndpoint('ANSWERS', { questionId }));
    return response.data;
  }

  async getAnswerById(questionId: string, answerId: string): Promise<QAAnswer | null> {
    if (this.useMock) {
      return null; // not supported in mock yet
    }
    try {
      const response = await this.apiService.get<QAAnswer>(buildQAEndpoint('ANSWER_BY_ID', { questionId, answerId }));
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async createAnswer(questionId: string, request: CreateAnswerRequest): Promise<QAAnswer> {
    if (this.useMock) {
      // Answer creation not supported in mock yet
      return { questionId, content: request.content, authorId: request.authorId };
    }
    const response = await this.apiService.post<QAAnswer>(buildQAEndpoint('ANSWERS', { questionId }), request);
    return response.data;
  }

  async updateAnswer(questionId: string, answerId: string, request: UpdateAnswerRequest): Promise<QAAnswer | null> {
    if (this.useMock) {
      return null; // not implemented
    }
    try {
      const response = await this.apiService.put<QAAnswer>(buildQAEndpoint('ANSWER_BY_ID', { questionId, answerId }), request);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async deleteAnswer(questionId: string, answerId: string): Promise<boolean> {
    if (this.useMock) {
      return false; // not implemented
    }
    try {
      await this.apiService.delete(buildQAEndpoint('ANSWER_BY_ID', { questionId, answerId }));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Search and Filtering
  async searchQuestions(query: string, filters?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return this.mockApi.searchQuestions(query, filters as any) as unknown as PaginatedResponse<QAQuestion>;
    }

    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      QA_ENDPOINTS.SEARCH,
      { 
        params: { 
          q: query,
          ...filters
        }
      }
    );
    return response.data;
  }

  async getQuestionsByCategory(category: string, params?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return this.mockApi.getQuestions({ ...(params as any), category } as any) as unknown as PaginatedResponse<QAQuestion>;
    }

    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      buildQAEndpoint('BY_CATEGORY', { category }),
      { params }
    );
    return response.data;
  }

  async getQuestionsByTag(tag: string, params?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return this.mockApi.getQuestions({ ...(params as any), tags: [tag] } as any) as unknown as PaginatedResponse<QAQuestion>;
    }

    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      buildQAEndpoint('BY_TAG', { tag }),
      { params }
    );
    return response.data;
  }

  async getQuestionsByUser(userId: string, params?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return this.mockApi.getQuestions({ ...(params as any), authorId: userId } as any) as unknown as PaginatedResponse<QAQuestion>;
    }

    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      buildQAEndpoint('BY_USER', { userId }),
      { params }
    );
    return response.data;
  }

  // Popular and Trending
  async getPopularQuestions(params?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return this.mockApi.getQuestions({ ...(params as any), sortBy: 'upvotes' } as any) as unknown as PaginatedResponse<QAQuestion>;
    }

    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      QA_ENDPOINTS.POPULAR,
      { params }
    );
    return response.data;
  }

  async getTrendingQuestions(params?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return this.mockApi.getQuestions({ ...(params as any), sortBy: 'viewCount' } as any) as unknown as PaginatedResponse<QAQuestion>;
    }

    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      QA_ENDPOINTS.TRENDING,
      { params }
    );
    return response.data;
  }

  async getRecentQuestions(params?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return this.mockApi.getQuestions({ ...(params as any), sortBy: 'createdAt' } as any) as unknown as PaginatedResponse<QAQuestion>;
    }

    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      QA_ENDPOINTS.RECENT,
      { params }
    );
    return response.data;
  }

  async getUnansweredQuestions(params?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return this.mockApi.getQuestions({ ...(params as any), hasAcceptedAnswer: false } as any) as unknown as PaginatedResponse<QAQuestion>;
    }

    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      QA_ENDPOINTS.UNANSWERED,
      { params }
    );
    return response.data;
  }

  // Voting System
  async voteOnQuestion(questionId: string, userId: string, voteType: 'up' | 'down'): Promise<QAVote> {
    if (this.useMock) {
      return this.mockApi.voteOnQuestion(questionId, userId, voteType) as unknown as QAVote;
    }

    const response = await this.apiService.post<QAVote>(
      buildQAEndpoint('VOTE_QUESTION', { id: questionId }),
      { userId, voteType }
    );
    return response.data;
  }

  async voteOnAnswer(questionId: string, answerId: string, userId: string, voteType: 'up' | 'down'): Promise<QAVote> {
    if (this.useMock) {
      // not implemented for answers
      return { id: 'temp', targetId: answerId, targetType: 'answer', userId, voteType, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    }
    const response = await this.apiService.post<QAVote>(buildQAEndpoint('VOTE_ANSWER', { questionId, answerId }), { userId, voteType });
    return response.data;
  }

  async getUserVotes(userId: string): Promise<QAVote[]> {
    if (this.useMock) {
      // Mock implementation would filter votes by user
      return [];
    }

    const response = await this.apiService.get<QAVote[]>(
      QA_ENDPOINTS.MY_VOTES,
      { params: { userId } }
    );
    return response.data;
  }

  // Accept Answer
  async acceptAnswer(questionId: string, answerId: string): Promise<QAAnswer | null> {
    if (this.useMock) {
      // Not supported in mock; return null
      return null;
    }

    try {
      const response = await this.apiService.post<QAAnswer>(
        buildQAEndpoint('ACCEPT_ANSWER', { questionId, answerId })
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async getBestAnswers(params?: QAFilters): Promise<PaginatedResponse<QAAnswer>> {
    if (this.useMock) {
      return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }, success: true, message: 'No best answers (mock)' } as PaginatedResponse<QAAnswer>;
    }
    const response = await this.apiService.get<PaginatedResponse<QAAnswer>>(QA_ENDPOINTS.BEST_ANSWERS, { params });
    return response.data;
  }

  // Categories and Tags
  async getCategories(): Promise<QACategory[]> {
    if (this.useMock) {
      return this.mockApi.getCategories() as unknown as QACategory[];
    }

    const response = await this.apiService.get<QACategory[]>(
      QA_ENDPOINTS.CATEGORIES
    );
    return response.data;
  }

  async getTags(): Promise<Array<{ tag: string; count: number }>> {
    if (this.useMock) {
      return this.mockApi.getPopularTags();
    }

    const response = await this.apiService.get<Array<{ tag: string; count: number }>>(
      QA_ENDPOINTS.TAGS
    );
    return response.data;
  }

  async getTagSuggestions(query: string): Promise<string[]> {
    if (this.useMock) {
      const popularTags = await this.mockApi.getPopularTags();
      return popularTags
        .filter(t => t.tag.toLowerCase().includes(query.toLowerCase()))
        .map(t => t.tag)
        .slice(0, 10);
    }

    const response = await this.apiService.get<string[]>(
      QA_ENDPOINTS.TAG_SUGGESTIONS,
      { params: { q: query } }
    );
    return response.data;
  }

  // User Interactions
  async bookmarkQuestion(questionId: string, userId: string): Promise<boolean> {
    if (this.useMock) {
      // Mock implementation
      return true;
    }

    try {
      await this.apiService.post(
        buildQAEndpoint('BOOKMARK_QUESTION', { id: questionId }),
        { userId }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async followQuestion(questionId: string, userId: string): Promise<boolean> {
    if (this.useMock) {
      // Mock implementation
      return true;
    }

    try {
      await this.apiService.post(
        buildQAEndpoint('FOLLOW_QUESTION', { id: questionId }),
        { userId }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async getUserBookmarks(userId: string, params?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }, success: true, message: 'No bookmarks (mock)' };
    }

    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      QA_ENDPOINTS.MY_BOOKMARKS,
      { params: { userId, ...params } }
    );
    return response.data;
  }

  async getUserFollowedQuestions(userId: string, params?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }, success: true, message: 'No followed questions (mock)' };
    }

    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      QA_ENDPOINTS.MY_FOLLOWED,
      { params: { userId, ...params } }
    );
    return response.data;
  }

  // Analytics and Statistics
  // Stats removed pending new analytics model migration

  async getQuestionAnalytics(questionId: string): Promise<any> {
    if (this.useMock) {
      // Mock analytics data
      return {
        views: Math.floor(Math.random() * 100),
        uniqueViews: Math.floor(Math.random() * 80),
        answers: Math.floor(Math.random() * 10),
        votes: Math.floor(Math.random() * 20),
        engagement: Math.random()
      };
    }

    const response = await this.apiService.get(
      buildQAEndpoint('QUESTION_ANALYTICS', { id: questionId })
    );
    return response.data;
  }

  // Bulk Operations
  async bulkCreateQuestions(questions: CreateQuestionRequest[]): Promise<QAQuestion[]> {
    if (this.useMock) {
      const createdQuestions: QAQuestion[] = [];
      for (const questionRequest of questions) {
        const question = await this.mockApi.createQuestion(questionRequest);
        createdQuestions.push(question);
      }
      return createdQuestions;
    }

    const response = await this.apiService.post<QAQuestion[]>(
      QA_ENDPOINTS.BULK_CREATE_QUESTIONS,
      { questions }
    );
    return response.data;
  }

  async bulkUpdateQuestions(updates: Array<{ id: string; data: UpdateQuestionRequest }>): Promise<QAQuestion[]> {
    if (this.useMock) {
      const updatedQuestions: QAQuestion[] = [];
      for (const update of updates) {
        const question = await this.mockApi.updateQuestion(update.id, update.data);
        if (question) {
          updatedQuestions.push(question);
        }
      }
      return updatedQuestions;
    }

    const response = await this.apiService.patch<QAQuestion[]>(
      QA_ENDPOINTS.BULK_UPDATE_QUESTIONS,
      { updates }
    );
    return response.data;
  }

  async bulkDeleteQuestions(ids: string[]): Promise<{ deletedCount: number; errors: string[] }> {
    if (this.useMock) {
      let deletedCount = 0;
      const errors: string[] = [];
      
      for (const id of ids) {
        const success = await this.mockApi.deleteQuestion(id);
        if (success) {
          deletedCount++;
        } else {
          errors.push(`Question ${id} not found`);
        }
      }
      
      return { deletedCount, errors };
    }

    const response = await this.apiService.bulkOperation<{ deletedCount: number; errors: string[] }>(
      QA_ENDPOINTS.QUESTIONS,
      'delete',
      ids
    );
    return response.data;
  }

  // Export functionality
  async exportQA(format: 'csv' | 'json' = 'csv', filters?: QAFilters): Promise<Blob> {
    if (this.useMock) {
      const questions = await this.mockApi.getQuestions(filters);
      const data = format === 'json' 
        ? JSON.stringify(questions.data, null, 2)
        : this.convertToCSV(questions.data);
      
      return new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
    }

    const response = await this.apiService.get<Blob>(
      QA_ENDPOINTS.EXPORT,
      { 
        params: { format, ...filters },
        responseType: 'blob'
      }
    );
    return response.data;
  }

  // My Questions and Answers
  async getMyQuestions(userId: string, params?: QAFilters): Promise<PaginatedResponse<QAQuestion>> {
    if (this.useMock) {
      return this.mockApi.getQuestions({ ...(params as any), authorId: userId } as any) as unknown as PaginatedResponse<QAQuestion>;
    }

    const response = await this.apiService.get<PaginatedResponse<QAQuestion>>(
      QA_ENDPOINTS.MY_QUESTIONS,
      { params: { userId, ...params } }
    );
    return response.data;
  }

  async getMyAnswers(userId: string, params?: QAFilters): Promise<PaginatedResponse<QAAnswer>> {
    if (this.useMock) {
      // Mock implementation - would filter answers by user
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        },
        success: true,
        message: 'No answers (mock)'
      } as PaginatedResponse<QAAnswer>;
    }

    const response = await this.apiService.get<PaginatedResponse<QAAnswer>>(
      QA_ENDPOINTS.MY_ANSWERS,
      { params: { userId, ...params } }
    );
    return response.data;
  }

  // Moderation
  async reportQuestion(questionId: string, userId: string, reason: string): Promise<boolean> {
    if (this.useMock) {
      // Mock implementation
      return true;
    }

    try {
      await this.apiService.post(
        buildQAEndpoint('REPORT_QUESTION', { id: questionId }),
        { userId, reason }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async reportAnswer(questionId: string, answerId: string, userId: string, reason: string): Promise<boolean> {
    if (this.useMock) {
      // Mock implementation
      return true;
    }

    try {
      await this.apiService.post(
        buildQAEndpoint('REPORT_ANSWER', { questionId, answerId }),
        { userId, reason }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper Methods
  private convertToCSV(questions: QAQuestion[]): string {
    if (questions.length === 0) return '';
    
    const headers = Object.keys(questions[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = questions.map(question => 
      headers.map(header => {
        const value = question[header as keyof QAQuestion];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }
}