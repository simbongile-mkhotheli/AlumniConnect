// QA domain types
// Contains all Q&A-related TypeScript interfaces and types
// Migrated from src/types/index.ts during Phase 2

/**
 * QA item type union
 */
export type QAItemType = 'question' | 'answer' | 'discussion';

/**
 * QA status union
 */
export type QAStatus = 'published' | 'pending' | 'flagged' | 'archived';

/**
 * QA category union
 */
export type QACategory = 'technical' | 'career' | 'academic' | 'general';

/**
 * QA difficulty level union
 */
export type QADifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * QA Item interface - core Q&A entity
 */
export interface QAItem {
  id: string;
  type: QAItemType;
  status: QAStatus;
  category: QACategory;

  // Content
  title: string;
  content: string;
  excerpt?: string;

  // Author information
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorProfileImage?: string;
  authorRole?: 'admin' | 'alumni' | 'mentor';

  // Engagement metrics
  tags: string[];
  answerCount: number;
  viewCount: number;
  voteCount: number;
  commentCount?: number;
  participantCount?: number;

  // Q&A specific fields
  difficulty?: QADifficulty;
  isSticky?: boolean;
  isFeatured?: boolean;
  hasAcceptedAnswer?: boolean;
  bestAnswerId?: string;

  // Moderation
  flagReason?: string;
  flaggedBy?: string;
  flaggedAt?: string;
  moderatedBy?: string;
  moderatedAt?: string;

  // Settings
  allowComments?: boolean;
  allowVoting?: boolean;
  isLocked?: boolean;

  // Relationships
  chapterId?: string;
  relatedTopics?: string[];
  relatedQuestions?: string[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  lastActivityAt?: string;

  // Analytics
  engagementScore?: number;
  qualityScore?: number;

  // Admin notes
  moderatorNotes?: string;
}

/**
 * QA Answer interface
 */
export interface QAAnswer {
  answerId: string;
  questionId?: string;

  // Content
  content?: string;

  // Author information
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  authorProfileImage?: string;
  authorRole?: 'admin' | 'alumni' | 'mentor';

  // Status and validation
  status?: QAStatus;
  isAccepted?: boolean;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;

  // Engagement
  voteCount?: number;
  commentCount?: number;

  // Metadata
  createdAt?: string;
  updatedAt?: string;

  // Moderation
  flagReason?: string;
  flaggedBy?: string;
  flaggedAt?: string;

  // Quality indicators
  qualityScore?: number;
  helpfulnessRating?: number;
}

/**
 * QA Comment interface
 */
export interface QAComment {
  commentId: string;
  qaId?: string; // Can be question or answer ID
  parentCommentId?: string;

  // Content
  content?: string;

  // Author information
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  authorProfileImage?: string;

  // Status
  status?: QAStatus;

  // Engagement
  voteCount?: number;

  // Metadata
  createdAt?: string;
  updatedAt?: string;

  // Nested comments
  replies?: QAComment[];
  replyCount?: number;

  // Moderation
  flagReason?: string;
  flaggedBy?: string;
  flaggedAt?: string;
}

/**
 * QA filters interface for UI filtering
 */
export interface QAFilters {
  status?: QAStatus;
  category?: QACategory;
  type?: QAItemType;
  difficulty?: QADifficulty;
  search?: string;
  authorId?: string;
  chapterId?: string;
  tags?: string[];
  hasAcceptedAnswer?: boolean;
  isFeatured?: boolean;
  isSticky?: boolean;
  createdSince?: string;
  page?: number;
  limit?: number;
}

/**
 * QA form data interface
 */
export interface QAFormData {
  title: string;
  content: string;
  category: QACategory;
  type?: QAItemType;
  difficulty?: QADifficulty;
  tags: string[];
  allowComments?: boolean;
  allowVoting?: boolean;
  chapterId?: string;
}

/**
 * QA summary statistics
 */
export interface QASummaryStats {
  totalQuestions: number;
  totalAnswers: number;
  totalComments: number;
  publishedQuestions: number;
  pendingQuestions: number;
  flaggedQuestions: number;
  acceptedAnswers: number;
  verifiedAnswers: number;
  totalViews: number;
  totalVotes: number;
  byCategory: {
    technical: number;
    career: number;
    academic: number;
    general: number;
  };
  byDifficulty: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

/**
 * QA Analytics interface
 */
export interface QAAnalytics {
  qaId: string;

  // Engagement metrics
  totalViews: number;
  uniqueViews: number;
  totalVotes: number;
  upvotes: number;
  downvotes: number;

  // Content metrics
  totalAnswers: number;
  acceptedAnswers: number;
  verifiedAnswers: number;
  totalComments: number;

  // Quality metrics
  averageAnswerQuality: number;
  helpfulnessRating: number;
  responseTime: number; // average time to first answer
  resolutionRate: number; // percentage of questions with accepted answers

  // User engagement
  uniqueParticipants: number;
  expertParticipation: number;
  communityEngagement: number;

  // Trends
  dailyViews: Array<{
    date: string;
    views: number;
    votes: number;
    answers: number;
  }>;

  // Metadata
  calculatedAt: string;
  periodStart: string;
  periodEnd: string;
}