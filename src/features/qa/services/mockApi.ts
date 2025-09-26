import { MockDataLoader } from '@shared/utils/mockDataLoader';
import type { QAItem, QAFilters, QACategory, QAStatus, QAItemType } from '../types/qa';
import type { PaginatedResponse } from '@shared/types';

// Local lightweight types bridging legacy expectations
interface QAQuestion {
  id: string;
  title: string;
  content: string;
  authorId?: string;
  category?: QACategory;
  tags?: string[];
  status?: QAStatus | string; // allow legacy 'open'/'resolved'
  upvotes?: number;
  downvotes?: number;
  viewCount?: number;
  answerCount?: number;
  createdAt?: string;
  updatedAt?: string;
  hasAcceptedAnswer?: boolean;
  type?: QAItemType | string;
  isAnonymous?: boolean;
  isBookmarked?: boolean;
  isFollowed?: boolean;
}

interface QAVoteRecord {
  id: string;
  targetId: string;
  targetType: 'question' | 'answer';
  userId: string;
  voteType: 'up' | 'down';
  createdAt: string;
  updatedAt: string;
}

// Extend filters at runtime to support sortBy/sortOrder used by service layer without updating core QAFilters interface
type RuntimeQAFilters = QAFilters & { sortBy?: string; sortOrder?: 'asc' | 'desc' };

/**
 * Mock API implementation for Q&A System
 * Provides realistic data simulation for development and testing
 */
export class QAMockApi {
  // In-memory vote store (since db.json currently has no qaVotes collection)
  private votes: QAVoteRecord[] = [];

  // Question Management
  async getQuestions(params?: RuntimeQAFilters): Promise<PaginatedResponse<QAQuestion>> {
    // Source collection is 'qa' in db.json (mixed QA items – we'll treat all as questions for now)
    const qaItems = await MockDataLoader.getQAItems();
    let questions: QAQuestion[] = qaItems.filter(i => (i as any).type === 'question') as QAQuestion[];

    // Apply filters
    if (params) {
      questions = this.applyFilters(questions, params);
    }

    // Apply sorting
    if (params?.sortBy) {
      questions = this.applySorting(questions, params.sortBy, params.sortOrder);
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const total = questions.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = questions.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      success: true,
      message: 'Questions retrieved'
    };
  }

  async getQuestionById(id: string): Promise<QAQuestion | null> {
    const item = await MockDataLoader.findById<QAItem>('qa', id);
    if (!item || (item as any).type !== 'question') return null;
    return item as QAQuestion;
  }

  async createQuestion(request: any): Promise<QAQuestion> {
    const newQuestion: QAQuestion = {
      id: Date.now().toString(),
      title: request.title,
      content: request.content,
      authorId: request.authorId,
      category: request.category,
      tags: request.tags || [],
      isAnonymous: request.isAnonymous || false,
      status: 'open',
      upvotes: 0,
      downvotes: 0,
      viewCount: 0,
      answerCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBookmarked: false,
      isFollowed: false,
  hasAcceptedAnswer: false,
      type: 'question'
    };
    await MockDataLoader.createItem('qa', newQuestion as any);
    return newQuestion;
  }

  async updateQuestion(id: string, request: any): Promise<QAQuestion | null> {
    const existing = await MockDataLoader.findById<QAItem>('qa', id);
    if (!existing) return null;
    const updated = { ...existing, ...request, updatedAt: new Date().toISOString() };
    await MockDataLoader.putItem('qa', id, updated as any);
    return updated as QAQuestion;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    return MockDataLoader.deleteItem('qa', id);
  }

  // Answer Management
  async getAnswersByQuestionId(questionId: string): Promise<any[]> {
    // Currently answers not separated in db.json; return empty array placeholder
    return [];
  }

  async getAnswerById(questionId: string, answerId: string): Promise<any | null> {
    return null; // Not implemented – answers collection absent
  }

  async createAnswer(): Promise<any> {
    // Placeholder until answers model is implemented in data source
    throw new Error('Answers not supported in current mock data set');
  }

  async updateAnswer(): Promise<any | null> {
    return null; // Not implemented
  }

  async deleteAnswer(): Promise<boolean> {
    return false; // Not implemented
  }

  // Search and Filtering
  async searchQuestions(query: string, filters?: RuntimeQAFilters): Promise<PaginatedResponse<QAQuestion>> {
    const qaItems = await MockDataLoader.getQAItems();
    let questions: QAQuestion[] = qaItems.filter(i => (i as any).type === 'question') as QAQuestion[];
    
    // Apply text search
    if (query) {
      questions = questions.filter(q =>
        q.title?.toLowerCase().includes(query.toLowerCase()) ||
        q.content?.toLowerCase().includes(query.toLowerCase()) ||
        (q.tags || []).some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Apply additional filters
    if (filters) {
      questions = this.applyFilters(questions, filters);
      if (filters.sortBy) {
        questions = this.applySorting(questions, filters.sortBy, filters.sortOrder);
      }
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const total = questions.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = questions.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      success: true,
      message: 'Question search results'
    };
  }

  // Voting System
  async voteOnQuestion(questionId: string, userId: string, voteType: 'up' | 'down'): Promise<QAVoteRecord | null> {
    const question = await this.getQuestionById(questionId);
    if (!question) return null;
    const existingIndex = this.votes.findIndex(v => v.targetId === questionId && v.userId === userId && v.targetType === 'question');
    let vote: QAVoteRecord;
    if (existingIndex !== -1) {
      this.votes[existingIndex].voteType = voteType;
      this.votes[existingIndex].updatedAt = new Date().toISOString();
      vote = this.votes[existingIndex];
    } else {
      vote = { id: Date.now().toString(), targetId: questionId, targetType: 'question', userId, voteType, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      this.votes.push(vote);
    }
    // Recalculate vote counts (stored as separate up/down for legacy consumers)
    const questionVotes = this.votes.filter(v => v.targetId === questionId && v.targetType === 'question');
    const up = questionVotes.filter(v => v.voteType === 'up').length;
    const down = questionVotes.filter(v => v.voteType === 'down').length;
    await MockDataLoader.patchItem('qa', questionId, { upvotes: up, downvotes: down } as any);
    return vote;
  }

  async voteOnAnswer(): Promise<any> {
    throw new Error('Answer voting not supported (answers not implemented)');
  }

  // Accept Answer
  async acceptAnswer(): Promise<any | null> {
    return null; // Not supported yet
  }

  // Categories and Tags
  async getCategories(): Promise<Array<{ id: string; name: string }>> {
    // Limited to defined QACategory union values
    return [
      { id: 'general', name: 'General' },
      { id: 'career', name: 'Career' },
      { id: 'technical', name: 'Technical' },
      { id: 'academic', name: 'Academic' }
    ];
  }

  async getPopularTags(): Promise<Array<{ tag: string; count: number }>> {
    return [
      { tag: 'career-change', count: 25 },
      { tag: 'job-search', count: 22 },
      { tag: 'interview-tips', count: 18 },
      { tag: 'networking', count: 16 },
      { tag: 'startup', count: 14 },
      { tag: 'remote-work', count: 12 },
      { tag: 'salary-negotiation', count: 10 },
      { tag: 'work-life-balance', count: 9 },
      { tag: 'leadership', count: 8 },
      { tag: 'entrepreneurship', count: 7 }
    ];
  }

  // Statistics
  // getQAStats removed (analytics model to be redefined later)

  // Helper Methods
  private applyFilters(questions: QAQuestion[], filters: RuntimeQAFilters): QAQuestion[] {
    let filtered = [...questions];

    if (filters.category) {
      filtered = filtered.filter(q => q.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(q => 
        filters.tags!.some(tag => (q.tags || []).includes(tag))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(q => q.status === filters.status);
    }

    if (filters.authorId) {
      filtered = filtered.filter(q => q.authorId === filters.authorId);
    }

    if (filters.hasAcceptedAnswer !== undefined) {
      filtered = filtered.filter(q => q.hasAcceptedAnswer === filters.hasAcceptedAnswer);
    }

    return filtered;
  }

  private applySorting(questions: QAQuestion[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): QAQuestion[] {
    return questions.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
          break;
        case 'upvotes':
          comparison = (a.upvotes || 0) - (b.upvotes || 0);
          break;
        case 'answerCount':
          comparison = (a.answerCount || 0) - (b.answerCount || 0);
          break;
        case 'viewCount':
          comparison = (a.viewCount || 0) - (b.viewCount || 0);
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}