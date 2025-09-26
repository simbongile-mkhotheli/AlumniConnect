/**
 * Events Types
 * All event-related TypeScript interfaces and types
 */

export * from './event';

// Additional types for API responses
export interface EventRSVPData {
  userId: string;
  ticketType?: string;
  specialRequests?: string;
}

export interface EventAttendee {
  userId: string;
  userName: string;
  userEmail: string;
  rsvpDate: string;
  attendanceStatus: 'registered' | 'attended' | 'no_show';
  ticketType?: string;
}

export interface EventAnalytics {
  totalRSVPs: number;
  actualAttendance: number;
  attendanceRate: number;
  registrationTrend: Array<{ date: string; count: number }>;
  demographicBreakdown: Record<string, number>;
  feedbackScore: number;
  socialEngagement: {
    shares: number;
    likes: number;
    comments: number;
  };
}

export interface EventStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  scheduledEvents: number;
  cancelledEvents: number;
  totalRSVPs: number;
  totalAttendees: number;
  averageAttendanceRate: number;
  upcomingEvents: number;
  pastEvents: number;
  monthlyTrend: Array<{
    month: string;
    events: number;
    rsvps: number;
    attendance: number;
  }>;
}

// Re-export shared types for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  BulkOperationResult,
  ExportResult,
  ImportResult,
} from '@shared/types';

// Explicitly re-export shared FilterState so feature-level imports work
export type { FilterState } from '@shared/types';