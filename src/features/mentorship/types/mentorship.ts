// Mentorship domain types
// Contains all mentorship-related TypeScript interfaces and types
// Migrated from src/types/index.ts during Phase 2

/**
 * Mentorship type union
 */
export type MentorshipType = 'technical' | 'career' | 'leadership' | 'entrepreneurship' | 'general';

/**
 * Mentorship status union
 */
export type MentorshipStatus = 'active' | 'pending' | 'completed' | 'paused' | 'cancelled';

/**
 * Meeting frequency union
 */
export type MeetingFrequency = 'weekly' | 'biweekly' | 'monthly' | 'as_needed';

/**
 * Session status union
 */
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

/**
 * Meeting type union
 */
export type MeetingType = 'video' | 'phone' | 'in_person';

/**
 * Mentorship interface - core mentorship entity
 */
export interface Mentorship {
  id: string;
  title: string;
  type: MentorshipType;
  status: MentorshipStatus;

  // Participant information
  mentorId: string;
  mentorName: string;
  mentorEmail?: string;
  mentorProfileImage?: string;
  menteeId: string;
  menteeName: string;
  menteeEmail?: string;
  menteeProfileImage?: string;

  // Program details
  description: string;
  objectives?: string[];
  tags: string[];
  category: string;

  // Session tracking
  sessionCount: number;
  completedSessions?: number; // optional to accommodate legacy/test objects
  // Legacy / alternate schema support (db.json variations)
  totalSessions?: number; // some records use totalSessions instead of sessionCount
  sessionsCompleted?: number; // some records use sessionsCompleted instead of completedSessions
  nextSessionDate?: string;
  lastSessionDate?: string;

  // Duration and scheduling
  startDate: string;
  endDate?: string;
  expectedDuration?: number; // in weeks
  meetingFrequency?: MeetingFrequency;

  // Progress and feedback
  progress?: number; // 0-100 percentage
  mentorRating?: number; // 1-5 stars
  menteeRating?: number; // 1-5 stars
  overallRating?: number; // calculated average

  // Relationships
  chapterId?: string;
  programId?: string;

  // Metadata
  // Make timestamps optional to align with lightweight test objects
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  notes?: string;

  // Analytics
  viewCount?: number;
  engagementScore?: number;
  // Moderation / workflow
  rejectionReason?: string;
}

/**
 * Mentorship Session interface
 */
export interface MentorshipSession {
  sessionId: string;
  mentorshipId?: string;
  title?: string;
  description?: string;

  // Scheduling (optional for lightweight test objects)
  scheduledAt?: string;
  duration?: number; // in minutes
  status?: SessionStatus;

  // Meeting details
  meetingUrl?: string;
  meetingType?: MeetingType;
  location?: string;

  // Session content
  agenda?: string[];
  objectives?: string[];
  notes?: string;
  resources?: Array<{
    title: string;
    url: string;
    type: 'document' | 'video' | 'article' | 'tool';
  }>;

  // Feedback and ratings
  feedback?: {
    mentorRating?: number;
    menteeRating?: number;
    mentorNotes?: string;
    menteeNotes?: string;
    sessionQuality?: number;
    goalProgress?: number;
  };

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;

  // Follow-up
  actionItems?: Array<{
    id: string;
    description: string;
    assignedTo: 'mentor' | 'mentee';
    dueDate?: string;
    completed: boolean;
  }>;
  nextSessionPlanned?: boolean;
}

/**
 * Mentorship filters interface
 */
export interface MentorshipFilters {
  status?: MentorshipStatus;
  type?: MentorshipType;
  search?: string;
  mentorId?: string;
  menteeId?: string;
  chapterId?: string;
  programId?: string;
  category?: string;
  tags?: string[];
  meetingFrequency?: MeetingFrequency;
  startDate?: string;
  endDate?: string;
  minProgress?: number;
  maxProgress?: number;
  minRating?: number;
  page?: number;
  limit?: number;
}

/**
 * Mentorship form data interface
 */
export interface MentorshipFormData {
  title: string;
  type: MentorshipType;
  status: MentorshipStatus;
  mentorId: string;
  menteeId: string;
  description: string;
  objectives?: string[];
  tags: string[];
  category: string;
  startDate: string;
  endDate?: string;
  expectedDuration?: number;
  meetingFrequency?: MeetingFrequency;
  chapterId?: string;
  programId?: string;
}

/**
 * Mentorship summary statistics
 */
export interface MentorshipSummaryStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
  paused: number;
  cancelled: number;
  totalSessions: number;
  completedSessions: number;
  averageProgress: number;
  averageRating: number;
  byType: {
    technical: number;
    career: number;
    leadership: number;
    entrepreneurship: number;
    general: number;
  };
}

/**
 * Mentorship Analytics interface
 */
export interface MentorshipAnalytics {
  mentorshipId: string;

  // Session metrics
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageSessionDuration: number;

  // Engagement metrics
  mentorEngagement: number; // 0-100
  menteeEngagement: number; // 0-100
  overallSatisfaction: number; // 1-5

  // Progress metrics
  goalsAchieved: number;
  milestonesMet: number;
  progressRate: number; // 0-100

  // Time metrics
  totalTimeSpent: number; // in minutes
  averageResponseTime: number; // in hours

  // Outcome metrics
  completionRate: number;
  successRate: number;
  retentionRate: number;

  // Trends
  weeklyProgress: Array<{
    week: string;
    sessions: number;
    engagement: number;
    satisfaction: number;
  }>;

  // Metadata
  calculatedAt: string;
  periodStart: string;
  periodEnd: string;
}