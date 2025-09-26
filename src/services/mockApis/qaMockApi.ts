import type {
  QAItem,
  QAAnswer,
  QAComment,
  QAAnalytics,
  Notification,
  ApiResponse,
  PaginatedResponse,
  FilterState,
} from '../../types';
import { MockDataLoader } from '../../utils/mockDataLoader';

/**
 * Enhanced QA Mock API Service
 * Uses db.json as data source via MockDataLoader
 */

// Utilities
const delay = (ms = 250) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Filter QA items based on filters
 */
const filterQAItems = (qaItems: QAItem[], filters: FilterState): QAItem[] => {
  return MockDataLoader.filterItems(qaItems, {
    status: filters.status,
    type: filters.type,
    category: filters.category,
    title: filters.search, // Search in title
    content: filters.search, // Search in content
    authorName: filters.search, // Search in author name
  });
};

/**
 * QAMockApiService
 * All methods now use data from db.json via MockDataLoader
 */
export class QAMockApiService {
  /**
   * Get all QA items with optional filtering and pagination
   */
  static async getQAItems(
    page: number = 1,
    limit: number = 10,
    filters?: FilterState
  ): Promise<PaginatedResponse<QAItem>> {
    await delay();

    try {
      let qaItems = await MockDataLoader.getQAItems();

      // Normalize to guarantee required structural fields so UI pages don't crash
      qaItems = qaItems.map(item => ({
        // Preserve existing
        ...item,
        // Required defaults
        status: item.status || 'published',
        tags: Array.isArray(item.tags) ? item.tags : [],
        answerCount: typeof item.answerCount === 'number' ? item.answerCount : 0,
        viewCount: typeof item.viewCount === 'number' ? item.viewCount : 0,
        voteCount: typeof item.voteCount === 'number' ? item.voteCount : 0,
        commentCount: typeof item.commentCount === 'number' ? item.commentCount : 0,
        category: (item as any).category || 'general',
        type: (item as any).type || 'question',
        title: item.title || item.content?.slice(0, 60) || 'Untitled',
        content: item.content || item.title || 'No content provided',
        authorName: item.authorName || 'Anonymous',
        authorId: item.authorId || 'user-anonymous',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
      }));

      // Apply filters if provided
      if (filters) {
        qaItems = filterQAItems(qaItems, filters);
      }

      // Sort by last activity (newest first) by default
      qaItems = MockDataLoader.sortItems(qaItems, 'lastActivityAt', 'desc');

      // Apply pagination (explicit params override filter hints)
      const effectivePage = page || filters?.page || 1;
      const effectiveLimit = limit || filters?.limit || 10;
      const paginatedResult = MockDataLoader.paginateItems(
        qaItems,
        effectivePage,
        effectiveLimit
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
        message: 'QA items retrieved successfully',
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
        message: 'Failed to retrieve QA items',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get QA item by ID
   */
  static async getQAItemById(id: string): Promise<ApiResponse<QAItem>> {
    await delay();

    try {
      const qaItem = await MockDataLoader.findById<QAItem>('qa', id);

      if (!qaItem) {
        return {
          data: undefined as any,
          success: false,
          message: 'QA item not found',
          error: {
            code: 404,
            message: 'QA item not found',
          },
        };
      }

      return {
        data: qaItem,
        success: true,
        message: 'QA item retrieved successfully',
      };
    } catch (error) {
      return {
  data: undefined as any,
        success: false,
        message: 'Failed to retrieve QA item',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Alias maintained for backward compatibility with tests expecting getQAItem
   */
  static async getQAItem(id: string): Promise<ApiResponse<QAItem>> {
    return this.getQAItemById(id);
  }

  /**
   * Create new QA item
   */
  static async createQAItem(
    qaItemData: Omit<
      QAItem,
      'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'
    >
  ): Promise<ApiResponse<QAItem>> {
    await delay();

    try {
      const now = new Date().toISOString();
      const newQAItem: QAItem = {
        ...qaItemData,
        id: `qa-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
      };
      // Persist via mock server
      const persisted = await MockDataLoader.createItem<QAItem>('qa', newQAItem);

      if (!persisted) {
        return {
          data: undefined as any,
            success: false,
            message: 'Failed to create QA item (persistence error)',
            error: {
              code: 500,
              message: 'Persistence layer returned null',
            },
        };
      }

      return {
        data: persisted,
        success: true,
        message: 'QA item created successfully',
      };
    } catch (error) {
      return {
  data: undefined as any,
        success: false,
        message: 'Failed to create QA item',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Update QA item
   */
  static async updateQAItem(
    id: string,
    qaItemData: Partial<QAItem>
  ): Promise<ApiResponse<QAItem>> {
    await delay();

    try {
      const existingQAItem = await MockDataLoader.findById<QAItem>('qa', id);

      if (!existingQAItem) {
        return {
          data: undefined as any,
          success: false,
          message: 'QA item not found',
          error: {
            code: 404,
            message: 'QA item not found',
          },
        };
      }

      const patch: Partial<QAItem> = {
        ...qaItemData,
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };

      const persisted = await MockDataLoader.patchItem<QAItem>('qa', id, patch);

      if (!persisted) {
        return {
          data: undefined as any,
          success: false,
          message: 'Failed to update QA item (persistence error)',
          error: {
            code: 500,
            message: 'Persistence layer returned null',
          },
        };
      }

      return {
        data: persisted,
        success: true,
        message: 'QA item updated successfully',
      };
    } catch (error) {
      return {
  data: undefined as any,
        success: false,
        message: 'Failed to update QA item',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Delete QA item
   */
  static async deleteQAItem(id: string): Promise<ApiResponse<void>> {
    await delay();

    try {
      const existingQAItem = await MockDataLoader.findById<QAItem>('qa', id);

      if (!existingQAItem) {
        return {
          data: undefined,
          success: false,
          message: 'QA item not found',
          error: {
            code: 404,
            message: 'QA item not found',
          },
        };
      }

      const deleted = await MockDataLoader.deleteItem('qa', id);
      if (!deleted) {
        return {
          data: undefined,
          success: false,
          message: 'Failed to delete QA item (persistence error)',
          error: {
            code: 500,
            message: 'Persistence layer reported failure',
          },
        };
      }

      return {
        data: undefined,
        success: true,
        message: 'QA item deleted successfully',
      };
    } catch (error) {
      return {
  data: undefined,
        success: false,
        message: 'Failed to delete QA item',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get QA items by status
   */
  static async getQAItemsByStatus(
    status: string
  ): Promise<ApiResponse<QAItem[]>> {
    await delay();

    try {
      const qaItems = await MockDataLoader.getQAItems();
      const filteredQAItems = qaItems.filter(item => item.status === status);

      return {
        data: filteredQAItems,
        success: true,
        message: `QA items with status '${status}' retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve QA items by status',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get QA items by category
   */
  static async getQAItemsByCategory(
    category: string
  ): Promise<ApiResponse<QAItem[]>> {
    await delay();

    try {
      const qaItems = await MockDataLoader.getQAItems();
      const filteredQAItems = qaItems.filter(
        item => item.category === category
      );

      return {
        data: filteredQAItems,
        success: true,
        message: `QA items in category '${category}' retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve QA items by category',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get QA items by type
   */
  static async getQAItemsByType(
    type: string
  ): Promise<ApiResponse<QAItem[]>> {
    await delay();

    try {
      const qaItems = await MockDataLoader.getQAItems();
      const filteredQAItems = qaItems.filter(item => item.type === type);

      return {
        data: filteredQAItems,
        success: true,
        message: `QA items of type '${type}' retrieved successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve QA items by type',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get trending QA items
   */
  static async getTrendingQAItems(): Promise<ApiResponse<QAItem[]>> {
    await delay();

    try {
      const qaItems = await MockDataLoader.getQAItems();

      // Sort by engagement score and recent activity
      const trendingItems = qaItems
        .filter(item => item.status === 'published')
        .sort((a, b) => {
          const aScore =
            (a.voteCount || 0) +
            (a.viewCount || 0) * 0.1 +
            (a.answerCount || 0) * 2;
          const bScore =
            (b.voteCount || 0) +
            (b.viewCount || 0) * 0.1 +
            (b.answerCount || 0) * 2;
          return bScore - aScore;
        })
        .slice(0, 10);

      return {
        data: trendingItems,
        success: true,
        message: 'Trending QA items retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve trending QA items',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get unanswered QA items
   */
  static async getUnansweredQAItems(): Promise<ApiResponse<QAItem[]>> {
    await delay();

    try {
      const qaItems = await MockDataLoader.getQAItems();
      const unansweredItems = qaItems.filter(
        item =>
          item.type === 'question' &&
          item.status === 'published' &&
          (item.answerCount || 0) === 0
      );

      return {
        data: unansweredItems,
        success: true,
        message: 'Unanswered QA items retrieved successfully',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to retrieve unanswered QA items',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Publish QA item
   */
  static async publishQAItem(id: string): Promise<ApiResponse<QAItem>> {
    await delay();

    try {
      const qaItem = await MockDataLoader.findById<QAItem>('qa', id);

      if (!qaItem) {
        return {
          data: undefined as any,
          success: false,
          message: 'QA item not found',
          error: {
            code: 404,
            message: 'QA item not found',
          },
        };
      }

      const publishedQAItem: QAItem = {
        ...qaItem,
        status: 'published',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('qa');

      return {
        data: publishedQAItem,
        success: true,
        message: 'QA item published successfully',
      };
    } catch (error) {
      return {
  data: undefined as any,
        success: false,
        message: 'Failed to publish QA item',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Approve QA item (previously missing; added to satisfy QAService.approveQAItem tests)
   */
  static async approveQAItem(id: string): Promise<ApiResponse<QAItem>> {
    await delay();
    try {
      const qaItem = await MockDataLoader.findById<QAItem>('qa', id);
      if (!qaItem) {
        return {
          data: undefined as any,
          success: false,
          message: 'QA item not found',
          error: { code: 404, message: 'QA item not found' },
        };
      }
      const approved: QAItem = {
        ...qaItem,
        status: 'published',
        moderatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      } as any;
      MockDataLoader.clearCache('qa');
      return { data: approved, success: true, message: 'QA item approved successfully' };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to approve QA item',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Reject QA item (added to satisfy QAService.rejectQAItem tests)
   */
  static async rejectQAItem(id: string): Promise<ApiResponse<void>> {
    await delay();
    try {
      const qaItem = await MockDataLoader.findById<QAItem>('qa', id);
      if (!qaItem) {
        return {
          data: undefined,
          success: false,
          message: 'QA item not found',
          error: { code: 404, message: 'QA item not found' },
        } as any;
      }
      MockDataLoader.clearCache('qa');
      return { data: undefined, success: true, message: 'QA item rejected successfully' };
    } catch (error) {
      return {
        data: undefined,
        success: false,
        message: 'Failed to reject QA item',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      } as any;
    }
  }

  /**
   * Archive QA item
   */
  static async archiveQAItem(id: string): Promise<ApiResponse<QAItem>> {
    await delay();

    try {
      const qaItem = await MockDataLoader.findById<QAItem>('qa', id);

      if (!qaItem) {
        return {
          data: undefined as any,
          success: false,
          message: 'QA item not found',
          error: {
            code: 404,
            message: 'QA item not found',
          },
        };
      }

      const archivedQAItem: QAItem = {
        ...qaItem,
        status: 'archived',
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('qa');

      return {
        data: archivedQAItem,
        success: true,
        message: 'QA item archived successfully',
      };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to archive QA item',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Flag QA item
   */
  static async flagQAItem(id: string, _reason?: string): Promise<ApiResponse<QAItem>> {
    await delay();

    try {
      const qaItem = await MockDataLoader.findById<QAItem>('qa', id);

      if (!qaItem) {
        return {
          data: undefined as any,
          success: false,
          message: 'QA item not found',
          error: {
            code: 404,
            message: 'QA item not found',
          },
        };
      }

      const flaggedQAItem: QAItem = {
        ...qaItem,
        status: 'flagged',
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('qa');

      return {
        data: flaggedQAItem,
        success: true,
        message: 'QA item flagged successfully',
      };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to flag QA item',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Unflag QA item
   */
  static async unflagQAItem(id: string): Promise<ApiResponse<QAItem>> {
    await delay();

    try {
      const qaItem = await MockDataLoader.findById<QAItem>('qa', id);

      if (!qaItem) {
        return {
          data: undefined as any,
          success: false,
          message: 'QA item not found',
          error: {
            code: 404,
            message: 'QA item not found',
          },
        };
      }

      const unflaggedQAItem: QAItem = {
        ...qaItem,
        status: 'published',
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('qa');

      return {
        data: unflaggedQAItem,
        success: true,
        message: 'QA item unflagged successfully',
      };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to unflag QA item',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Vote on QA item
   */
  static async voteOnQAItem(
    id: string,
    voteData: { userId: string; voteType: 'up' | 'down' }
  ): Promise<ApiResponse<{ voteCount: number }>> {
    await delay();

    try {
      const qaItem = await MockDataLoader.findById<QAItem>('qa', id);

      if (!qaItem) {
        return {
          data: undefined as any,
          success: false,
          message: 'QA item not found',
          error: {
            code: 404,
            message: 'QA item not found',
          },
        };
      }

      const voteChange = voteData.voteType === 'up' ? 1 : -1;
      const newVoteCount = (qaItem.voteCount || 0) + voteChange;

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('qa');

      return {
        data: { voteCount: newVoteCount },
        success: true,
        message: `Vote ${voteData.voteType === 'up' ? 'up' : 'down'} recorded successfully`,
      };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to record vote',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get QA statistics
   */
  static async getQAStats(): Promise<ApiResponse<any>> {
    await delay();

    try {
      const qaItems = await MockDataLoader.getQAItems();

      const stats = {
        totalQAItems: qaItems.length,
        publishedItems: qaItems.filter(item => item.status === 'published')
          .length,
  // draftItems removed (status 'draft' not part of current QAItem['status'] union)
  draftItems: 0,
        archivedItems: qaItems.filter(item => item.status === 'archived')
          .length,
        flaggedItems: qaItems.filter(item => item.status === 'flagged').length,
        questions: qaItems.filter(item => item.type === 'question').length,
        discussions: qaItems.filter(item => item.type === 'discussion').length,
  // polls removed (type 'poll' not part of current QAItem['type'] union)
  polls: 0,
        answeredQuestions: qaItems.filter(
          item => item.type === 'question' && (item.answerCount || 0) > 0
        ).length,
        unansweredQuestions: qaItems.filter(
          item => item.type === 'question' && (item.answerCount || 0) === 0
        ).length,
        totalViews: qaItems.reduce(
          (sum, item) => sum + (item.viewCount || 0),
          0
        ),
        totalVotes: qaItems.reduce(
          (sum, item) => sum + (item.voteCount || 0),
          0
        ),
        totalAnswers: qaItems.reduce(
          (sum, item) => sum + (item.answerCount || 0),
          0
        ),
        totalComments: qaItems.reduce(
          (sum, item) => sum + (item.commentCount || 0),
          0
        ),
      };

      return {
        data: stats,
        success: true,
        message: 'QA statistics retrieved successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to retrieve QA statistics',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Mock methods for answers and comments (these would typically interact with separate tables)
   */
  static async getQAAnswers(
    questionId: string
  ): Promise<ApiResponse<QAAnswer[]>> {
    await delay();

    // Mock answers data
    const mockAnswers: QAAnswer[] = [
      {
        answerId: `answer-${questionId}-1`,
        questionId,
        content: 'This is a mock answer',
        authorId: 'author-1',
        authorName: 'Mock Author',
        authorEmail: 'author@example.com',
        authorProfileImage: 'https://picsum.photos/100/100?random=1',
        authorRole: 'alumni',
        status: 'published',
        isAccepted: false,
        isVerified: false,
        voteCount: 5,
        commentCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        qualityScore: 85,
        helpfulnessRating: 4.2,
      },
    ];

    return {
      data: mockAnswers,
      success: true,
      message: 'QA answers retrieved successfully',
    };
  }

  static async addAnswer(
    questionId: string,
    answerData: { content: string; authorId: string }
  ): Promise<ApiResponse<any>> {
    await delay();

    const newAnswer = {
      answerId: `answer-${Date.now()}`,
      questionId,
      content: answerData.content,
      authorId: answerData.authorId,
      createdAt: new Date().toISOString(),
    };

    return {
      data: newAnswer,
      success: true,
      message: 'Answer added successfully',
    };
  }

  static async acceptAnswer(
    questionId: string,
    answerId: string
  ): Promise<ApiResponse<any>> {
    await delay();

    try {
      // Find the question
      const question = await MockDataLoader.findById<QAItem>('qa', questionId);
      if (!question) {
        return {
          data: null,
          success: false,
          message: 'Question not found',
          error: {
            code: 404,
            message: 'Question not found',
          },
        };
      }

      // Update question to mark it has accepted answer
      const updatedQuestion: QAItem = {
        ...question,
        hasAcceptedAnswer: true,
        bestAnswerId: answerId,
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };

      const result = await MockDataLoader.patchItem('qa', questionId, updatedQuestion);
      
      if (!result) {
        return {
          data: null,
          success: false,
          message: 'Failed to accept answer',
          error: {
            code: 500,
            message: 'Database update failed',
          },
        };
      }

      MockDataLoader.clearCache('qa');

      return {
        data: { accepted: true, questionId, answerId },
        success: true,
        message: 'Answer accepted successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: 'Failed to accept answer',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  static async verifyAnswer(
    questionId: string,
    answerId: string
  ): Promise<ApiResponse<any>> {
    await delay();

    return {
      data: { verified: true },
      success: true,
      message: 'Answer verified successfully',
    };
  }

  static async getQAComments(
    qaItemId: string
  ): Promise<ApiResponse<QAComment[]>> {
    await delay();

    // Mock comments data
    const mockComments: QAComment[] = [
      {
        commentId: `comment-${qaItemId}-1`,
        qaId: qaItemId,
        content: 'This is a mock comment',
        authorId: 'author-1',
        authorName: 'Mock Commenter',
        authorProfileImage: 'https://picsum.photos/100/100?random=2',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: [],
      },
    ];

    return {
      data: mockComments,
      success: true,
      message: 'QA comments retrieved successfully',
    };
  }

  static async addComment(
    qaItemId: string,
    commentData: { content: string; authorId: string; parentCommentId?: string }
  ): Promise<ApiResponse<any>> {
    await delay();

    const newComment = {
      commentId: `comment-${Date.now()}`,
  qaItemId: qaItemId as any, // retain field for mock compatibility if QAComment omitted it in type
      content: commentData.content,
      authorId: commentData.authorId,
      parentCommentId: commentData.parentCommentId,
      createdAt: new Date().toISOString(),
    };

    return {
      data: newComment,
      success: true,
      message: 'Comment added successfully',
    };
  }

  static async exportQAItems(
    format: 'json' | 'csv' | 'xlsx',
    filters?: FilterState
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    await delay();

    return {
      data: { downloadUrl: `mock-export-${format}-${Date.now()}.${format}` },
      success: true,
      message: `QA items exported as ${format.toUpperCase()} successfully`,
    };
  }

  /**
   * Bulk operations on QA items
   */
  static async bulkUpdateQAItems(
    ids: string[],
    updates: Partial<QAItem>
  ): Promise<ApiResponse<QAItem[]>> {
    await delay();

    try {
      const qaItems = await MockDataLoader.getQAItems();
      const updatedQAItems: QAItem[] = [];

      for (const id of ids) {
        const qaItem = qaItems.find(item => item.id === id);
        if (qaItem) {
          const updatedQAItem = {
            ...qaItem,
            ...updates,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
          };
          updatedQAItems.push(updatedQAItem);
        }
      }

      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('qa');

      return {
        data: updatedQAItems,
        success: true,
        message: `${updatedQAItems.length} QA items updated successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: 'Failed to bulk update QA items',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Track view (added to satisfy QAService.trackView tests)
   */
  static async trackView(id: string, userId?: string): Promise<ApiResponse<void>> {
    await delay();
    return {
      data: undefined,
      success: true,
      message: 'View tracked successfully',
    };
  }

  /**
   * Bulk operation wrapper to align with QAService.bulkOperation expectations
   */
  static async bulkOperation(
    operation: string,
    qaIds: string[],
    options?: { reason?: string; moderatorId?: string }
  ): Promise<ApiResponse<{ processedIds: string[]; successCount: number; failureCount: number }>> {
    await delay();
    return {
      data: {
        processedIds: qaIds,
        successCount: qaIds.length,
        failureCount: 0,
      },
      success: true,
      message: `Bulk operation '${operation}' completed`,
    };
  }

  /**
   * Search QA items (added to satisfy QAService.searchQAItems tests)
   */
  static async searchQAItems(
    query: string,
    filters?: Partial<FilterState>
  ): Promise<ApiResponse<QAItem[]>> {
    await delay();
    const qaItems = await MockDataLoader.getQAItems();
    const lower = query.toLowerCase();
    const filtered = qaItems.filter(item =>
      item.title.toLowerCase().includes(lower) || item.content.toLowerCase().includes(lower)
    );
    return {
      data: filtered.slice(0, 10),
      success: true,
      message: 'Search completed',
    };
  }

  /**
   * Import QA items (added to satisfy QAService.importQAItems tests)
   */
  static async importQAItems(
    file: File,
    options?: { skipDuplicates?: boolean; updateExisting?: boolean }
  ): Promise<ApiResponse<{ imported: number; skipped: number; errors: string[] }>> {
    await delay();
    return {
      data: { imported: 5, skipped: 0, errors: [] },
      success: true,
      message: 'Import completed',
    };
  }

  /**
   * Simple health check (added to satisfy potential health check usage)
   */
  static async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    await delay();
    return {
      data: { status: 'ok', timestamp: new Date().toISOString() },
      success: true,
      message: 'Health OK',
    };
  }
  // ===== Added stub methods to satisfy QAService references =====
  static async updateAnswer(questionId: string, answerId: string, _data: Partial<QAAnswer>): Promise<ApiResponse<QAAnswer>> {
    await delay();
    return { data: { answerId, questionId } as any, success: true, message: 'Answer updated (mock)' };
  }
  static async deleteAnswer(_q: string, _a: string): Promise<ApiResponse<void>> {
    await delay();
    return { data: undefined, success: true, message: 'Answer deleted (mock)' };
  }
  static async unacceptAnswer(questionId: string, answerId: string): Promise<ApiResponse<QAAnswer>> {
    await delay();
    
    try {
      // Find the question
      const question = await MockDataLoader.findById<QAItem>('qa', questionId);
      if (!question) {
        return {
          data: undefined as any,
          success: false,
          message: 'Question not found',
          error: {
            code: 404,
            message: 'Question not found',
          },
        };
      }

      // Update question to remove accepted answer
      const updatedQuestion: QAItem = {
        ...question,
        hasAcceptedAnswer: false,
        bestAnswerId: undefined,
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };

      const result = await MockDataLoader.patchItem('qa', questionId, updatedQuestion);
      
      if (!result) {
        return {
          data: undefined as any,
          success: false,
          message: 'Failed to unaccept answer',
          error: {
            code: 500,
            message: 'Database update failed',
          },
        };
      }

      MockDataLoader.clearCache('qa');

      return {
        data: { answerId, questionId, isAccepted: false } as any,
        success: true,
        message: 'Answer unaccepted successfully',
      };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to unaccept answer',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  static async unverifyAnswer(q: string, a: string): Promise<ApiResponse<QAAnswer>> {
    await delay();
    return { data: { answerId: a, questionId: q, isVerified: false } as any, success: true, message: 'Answer unverified (mock)' };
  }
  static async updateComment(qaId: string, commentId: string, _data: Partial<QAComment>): Promise<ApiResponse<QAComment>> {
    await delay();
    return { data: { commentId, qaItemId: qaId } as any, success: true, message: 'Comment updated (mock)' };
  }
  static async deleteComment(_qa: string, _c: string): Promise<ApiResponse<void>> {
    await delay();
    return { data: undefined, success: true, message: 'Comment deleted (mock)' };
  }
  static async voteOnAnswer(_q: string, _a: string, _v: any): Promise<ApiResponse<{ voteCount: number }>> {
    await delay();
    return { data: { voteCount: 1 }, success: true, message: 'Answer vote recorded (mock)' };
  }
  static async voteOnComment(_qa: string, _c: string, _v: any): Promise<ApiResponse<{ voteCount: number }>> {
    await delay();
    return { data: { voteCount: 1 }, success: true, message: 'Comment vote recorded (mock)' };
  }
  static async getQAAnalytics(id: string): Promise<ApiResponse<QAAnalytics>> {
    await delay();
    return { data: { id, viewCount: 0, voteCount: 0, answerCount: 0, commentCount: 0, recentActivity: [] } as any, success: true, message: 'Analytics (mock)' };
  }
  static async getQAItemsByAuthor(authorId: string): Promise<ApiResponse<QAItem[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const userItems = qaItems.filter(item => item.authorId === authorId);
      return { 
        data: userItems, 
        success: true, 
        message: `Found ${userItems.length} items by author ${authorId}` 
      }; 
    } catch (error) {
      return {
        data: [] as QAItem[],
        success: false,
        message: 'Failed to fetch items by author',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  
  static async getQAItemsByChapter(chapterId: string): Promise<ApiResponse<QAItem[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const chapterItems = qaItems.filter(item => item.chapterId === chapterId);
      return { 
        data: chapterItems, 
        success: true, 
        message: `Found ${chapterItems.length} items for chapter ${chapterId}` 
      }; 
    } catch (error) {
      return {
        data: [] as QAItem[],
        success: false,
        message: 'Failed to fetch items by chapter',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  
  static async getQAItemsByDifficulty(difficulty: string): Promise<ApiResponse<QAItem[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const difficultyItems = qaItems.filter(item => item.difficulty === difficulty);
      return { 
        data: difficultyItems, 
        success: true, 
        message: `Found ${difficultyItems.length} items with difficulty ${difficulty}` 
      }; 
    } catch (error) {
      return {
        data: [] as QAItem[],
        success: false,
        message: 'Failed to fetch items by difficulty',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  
  static async getFeaturedQAItems(): Promise<ApiResponse<QAItem[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const featuredItems = qaItems.filter(item => item.isFeatured === true);
      return { 
        data: featuredItems, 
        success: true, 
        message: `Found ${featuredItems.length} featured items` 
      }; 
    } catch (error) {
      return {
        data: [] as QAItem[],
        success: false,
        message: 'Failed to fetch featured items',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  
  static async getRecentQAItems(): Promise<ApiResponse<QAItem[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const sortedItems = qaItems
        .filter(item => item.status === 'published')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20); // Get most recent 20
      return { 
        data: sortedItems, 
        success: true, 
        message: `Found ${sortedItems.length} recent items` 
      }; 
    } catch (error) {
      return {
        data: [] as QAItem[],
        success: false,
        message: 'Failed to fetch recent items',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  
  static async getPopularQAItems(): Promise<ApiResponse<QAItem[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const sortedItems = qaItems
        .filter(item => item.status === 'published')
        .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
        .slice(0, 20); // Get top 20 by votes
      return { 
        data: sortedItems, 
        success: true, 
        message: `Found ${sortedItems.length} popular items` 
      }; 
    } catch (error) {
      return {
        data: [] as QAItem[],
        success: false,
        message: 'Failed to fetch popular items',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  
  static async getUserQuestions(userId: string): Promise<ApiResponse<QAItem[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const userQuestions = qaItems.filter(item => 
        item.authorId === userId && (item.type === 'question' || item.type === 'discussion')
      );
      return { 
        data: userQuestions, 
        success: true, 
        message: `Found ${userQuestions.length} questions by user ${userId}` 
      }; 
    } catch (error) {
      return {
        data: [] as QAItem[],
        success: false,
        message: 'Failed to fetch user questions',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  
  static async getUserAnswers(userId: string): Promise<ApiResponse<QAAnswer[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const userAnswers = qaItems.filter(item => 
        item.authorId === userId && item.type === 'answer'
      );
      // Convert QAItems of type 'answer' to QAAnswer format
      const answers: QAAnswer[] = userAnswers.map(item => ({
        answerId: item.id,
        questionId: item.id.replace('qa-', 'question-'), // Derive question ID
        content: item.content,
        authorId: item.authorId,
        authorName: item.authorName,
        status: item.status,
        isAccepted: item.hasAcceptedAnswer || false,
        isVerified: false, // Would need separate verification tracking
        voteCount: item.voteCount || 0,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      return { 
        data: answers, 
        success: true, 
        message: `Found ${answers.length} answers by user ${userId}` 
      }; 
    } catch (error) {
      return {
        data: [] as QAAnswer[],
        success: false,
        message: 'Failed to fetch user answers',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  
  static async getUserActivity(userId: string): Promise<ApiResponse<any>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const userQuestions = qaItems.filter(item => 
        item.authorId === userId && (item.type === 'question' || item.type === 'discussion')
      );
      const userAnswers = qaItems.filter(item => 
        item.authorId === userId && item.type === 'answer'
      );
      
      // Calculate basic reputation (votes * 10 + answers * 5)
      const reputation = userQuestions.reduce((sum, q) => sum + (q.voteCount || 0) * 10, 0) +
                       userAnswers.reduce((sum, a) => sum + (a.voteCount || 0) * 5, 0);
      
      return { 
        data: { 
          questions: userQuestions, 
          answers: userAnswers.map(item => ({
            answerId: item.id,
            questionId: item.id.replace('qa-', 'question-'),
            content: item.content,
            authorId: item.authorId,
            authorName: item.authorName,
            status: item.status,
            isAccepted: item.hasAcceptedAnswer || false,
            isVerified: false,
            voteCount: item.voteCount || 0,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })), 
          comments: [], // Would need separate comment tracking
          votes: [], // Would need separate vote tracking
          reputation, 
          badges: [] // Would need separate badge system
        }, 
        success: true, 
        message: `Found activity for user ${userId}: ${userQuestions.length} questions, ${userAnswers.length} answers` 
      }; 
    } catch (error) {
      return {
        data: { questions: [], answers: [], comments: [], votes: [], reputation: 0, badges: [] },
        success: false,
        message: 'Failed to fetch user activity',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  static async getFlaggedQAItems(): Promise<ApiResponse<QAItem[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const flaggedItems = qaItems.filter(item => item.status === 'flagged');
      return { 
        data: flaggedItems, 
        success: true, 
        message: `Found ${flaggedItems.length} flagged items` 
      }; 
    } catch (error) {
      return {
        data: [] as QAItem[],
        success: false,
        message: 'Failed to fetch flagged items',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  
  static async getPendingReviewQAItems(): Promise<ApiResponse<QAItem[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const pendingItems = qaItems.filter(item => item.status === 'pending');
      return { 
        data: pendingItems, 
        success: true, 
        message: `Found ${pendingItems.length} pending review items` 
      }; 
    } catch (error) {
      return {
        data: [] as QAItem[],
        success: false,
        message: 'Failed to fetch pending items',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  
  static async getModerationQueue(): Promise<ApiResponse<{
    flagged: QAItem[];
    pending: QAItem[];
    reported: QAItem[];
    totalCount: number;
  }>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const flagged = qaItems.filter(item => item.status === 'flagged');
      const pending = qaItems.filter(item => item.status === 'pending');
      // For now, reported items are those flagged recently (within last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const reported = qaItems.filter(item => 
        item.status === 'flagged' && 
        item.flaggedAt && 
        new Date(item.flaggedAt) > sevenDaysAgo
      );
      
      return { 
        data: { 
          flagged, 
          pending, 
          reported, 
          totalCount: flagged.length + pending.length + reported.length 
        }, 
        success: true, 
        message: `Moderation queue loaded: ${flagged.length} flagged, ${pending.length} pending, ${reported.length} reported` 
      }; 
    } catch (error) {
      return {
        data: { flagged: [], pending: [], reported: [], totalCount: 0 },
        success: false,
        message: 'Failed to fetch moderation queue',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  static async moderateQAItem(id: string, moderationData: {
    action: 'approve' | 'reject' | 'flag' | 'unflag' | 'lock' | 'unlock';
    reason?: string;
    moderatorId: string;
    moderatorNotes?: string;
  }): Promise<ApiResponse<QAItem>> { 
    await delay(); 
    
    try {
      const qaItem = await MockDataLoader.findById<QAItem>('qa', id);

      if (!qaItem) {
        return {
          data: undefined as any,
          success: false,
          message: 'QA item not found',
          error: {
            code: 404,
            message: 'QA item not found',
          },
        };
      }

      let newStatus = qaItem.status;
      const now = new Date().toISOString();

      // Apply moderation action
      switch (moderationData.action) {
        case 'approve':
          newStatus = 'published';
          break;
        case 'reject':
          newStatus = 'archived';
          break;
        case 'flag':
          newStatus = 'flagged';
          break;
        case 'unflag':
          newStatus = 'published';
          break;
        case 'lock':
          // Keep current status but mark as locked
          break;
        case 'unlock':
          // Keep current status but remove lock
          break;
      }

      const moderatedQAItem: QAItem = {
        ...qaItem,
        status: newStatus,
        moderatedBy: moderationData.moderatorId,
        moderatedAt: now,
        moderatorNotes: moderationData.moderatorNotes || qaItem.moderatorNotes,
        flagReason: moderationData.action === 'flag' ? moderationData.reason : undefined,
        flaggedAt: moderationData.action === 'flag' ? now : undefined,
        isLocked: moderationData.action === 'lock' ? true : moderationData.action === 'unlock' ? false : qaItem.isLocked,
        updatedAt: now,
        lastActivityAt: now,
      };

      // Update the item in mock data
      const result = await MockDataLoader.patchItem('qa', id, moderatedQAItem);
      
      if (!result) {
        return {
          data: undefined as any,
          success: false,
          message: 'Failed to update QA item in database',
          error: {
            code: 500,
            message: 'Database update failed',
          },
        };
      }
      
      // Clear cache to ensure fresh data on next fetch
      MockDataLoader.clearCache('qa');

      return {
        data: moderatedQAItem,
        success: true,
        message: `QA item ${moderationData.action}ed successfully`,
      };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: `Failed to ${moderationData.action} QA item`,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  
  /**
   * Feature QA item
   */
  static async featureQAItem(id: string): Promise<ApiResponse<QAItem>> {
    await delay();
    
    try {
      const qaItem = await MockDataLoader.findById<QAItem>('qa', id);

      if (!qaItem) {
        return {
          data: undefined as any,
          success: false,
          message: 'QA item not found',
          error: {
            code: 404,
            message: 'QA item not found',
          },
        };
      }

      const featuredQAItem: QAItem = {
        ...qaItem,
        isFeatured: true,
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };

      const result = await MockDataLoader.patchItem('qa', id, featuredQAItem);
      
      if (!result) {
        return {
          data: undefined as any,
          success: false,
          message: 'Failed to feature QA item',
          error: {
            code: 500,
            message: 'Database update failed',
          },
        };
      }

      MockDataLoader.clearCache('qa');

      return {
        data: featuredQAItem,
        success: true,
        message: 'QA item featured successfully',
      };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to feature QA item',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  
  /**
   * Unfeature QA item
   */
  static async unfeatureQAItem(id: string): Promise<ApiResponse<QAItem>> {
    await delay();
    
    try {
      const qaItem = await MockDataLoader.findById<QAItem>('qa', id);

      if (!qaItem) {
        return {
          data: undefined as any,
          success: false,
          message: 'QA item not found',
          error: {
            code: 404,
            message: 'QA item not found',
          },
        };
      }

      const unfeaturedQAItem: QAItem = {
        ...qaItem,
        isFeatured: false,
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };

      const result = await MockDataLoader.patchItem('qa', id, unfeaturedQAItem);
      
      if (!result) {
        return {
          data: undefined as any,
          success: false,
          message: 'Failed to unfeature QA item',
          error: {
            code: 500,
            message: 'Database update failed',
          },
        };
      }

      MockDataLoader.clearCache('qa');

      return {
        data: unfeaturedQAItem,
        success: true,
        message: 'QA item unfeatured successfully',
      };
    } catch (error) {
      return {
        data: undefined as any,
        success: false,
        message: 'Failed to unfeature QA item',
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  
  static async getRelatedQAItems(id: string): Promise<ApiResponse<QAItem[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const currentItem = qaItems.find(item => item.id === id);
      
      if (!currentItem) {
        return { data: [], success: true, message: 'Item not found' };
      }

      // Find items with matching tags, category, or chapter
      const relatedItems = qaItems.filter(item => 
        item.id !== id && 
        item.status === 'published' && (
          // Same category
          item.category === currentItem.category ||
          // Same chapter 
          item.chapterId === currentItem.chapterId ||
          // Overlapping tags
          item.tags.some(tag => currentItem.tags.includes(tag))
        )
      ).slice(0, 10); // Limit to 10 related items
      
      return { 
        data: relatedItems, 
        success: true, 
        message: `Found ${relatedItems.length} related items` 
      }; 
    } catch (error) {
      return {
        data: [] as QAItem[],
        success: false,
        message: 'Failed to fetch related items',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  
  static async getSimilarQAItems(id: string): Promise<ApiResponse<QAItem[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const currentItem = qaItems.find(item => item.id === id);
      
      if (!currentItem) {
        return { data: [], success: true, message: 'Item not found' };
      }

      // Find items with high similarity score
      const similarItems = qaItems
        .filter(item => item.id !== id && item.status === 'published')
        .map(item => {
          let score = 0;
          // Same type bonus
          if (item.type === currentItem.type) score += 2;
          // Same category bonus
          if (item.category === currentItem.category) score += 3;
          // Same difficulty bonus
          if (item.difficulty === currentItem.difficulty) score += 1;
          // Tag overlap bonus
          const tagOverlap = item.tags.filter(tag => currentItem.tags.includes(tag)).length;
          score += tagOverlap * 2;
          // Title similarity (basic word matching)
          const currentWords = currentItem.title.toLowerCase().split(/\s+/);
          const itemWords = item.title.toLowerCase().split(/\s+/);
          const wordOverlap = itemWords.filter(word => currentWords.includes(word)).length;
          score += wordOverlap;
          
          return { item, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(({ item }) => item);
      
      return { 
        data: similarItems, 
        success: true, 
        message: `Found ${similarItems.length} similar items` 
      }; 
    } catch (error) {
      return {
        data: [] as QAItem[],
        success: false,
        message: 'Failed to fetch similar items',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  
  static async getTags(): Promise<ApiResponse<any>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const tagCounts: { [tag: string]: number } = {};
      
      // Count tag usage across all published items
      qaItems
        .filter(item => item.status === 'published')
        .forEach(item => {
          item.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
      
      // Convert to array with counts and sort by usage
      const tags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ 
          tag, 
          count,
          category: this.getTagCategory(tag), // Helper method to categorize tags
          description: `Used in ${count} Q&A items`
        }))
        .sort((a, b) => b.count - a.count);
      
      return { 
        data: tags, 
        success: true, 
        message: `Found ${tags.length} tags` 
      }; 
    } catch (error) {
      return {
        data: [] as any[],
        success: false,
        message: 'Failed to fetch tags',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
  
  static async getTagSuggestions(query: string): Promise<ApiResponse<string[]>> { 
    await delay(); 
    try {
      const qaItems = await MockDataLoader.getQAItems();
      const allTags = new Set<string>();
      
      // Collect all unique tags
      qaItems.forEach(item => {
        item.tags.forEach(tag => allTags.add(tag));
      });
      
      // Filter tags that match the query (case-insensitive)
      const matchingTags = Array.from(allTags)
        .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 20); // Limit to 20 suggestions
      
      return { 
        data: matchingTags, 
        success: true, 
        message: `Found ${matchingTags.length} tag suggestions for "${query}"` 
      }; 
    } catch (error) {
      return {
        data: [] as string[],
        success: false,
        message: 'Failed to fetch tag suggestions',
        error: { code: 500, message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  // Helper method to categorize tags
  static getTagCategory(tag: string): string {
    const techTags = ['javascript', 'react', 'python', 'node.js', 'typescript'];
    const careerTags = ['career', 'networking', 'interview', 'job', 'salary'];
    const academicTags = ['academic', 'research', 'thesis', 'study', 'course'];
    
    if (techTags.some(t => tag.toLowerCase().includes(t))) return 'technology';
    if (careerTags.some(t => tag.toLowerCase().includes(t))) return 'career';
    if (academicTags.some(t => tag.toLowerCase().includes(t))) return 'academic';
    return 'general';
  }
}
