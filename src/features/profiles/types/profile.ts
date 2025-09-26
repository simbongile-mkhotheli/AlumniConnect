// Profiles domain types
// Contains all profile-related TypeScript interfaces and types
// Migrated from src/types/index.ts during Phase 2

/**
 * Profile role union type
 */
export type ProfileRole = 'admin' | 'alumni' | 'mentor' | 'student';

/**
 * Extended profile role union type (includes additional UI states)
 */
export type ExtendedProfileRole = ProfileRole | 'mentee' | 'both' | 'none';

/**
 * Profile status union type
 */
export type ProfileStatus = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * Badge union type - allow string extension to avoid test data breakage
 */
export type Badge =
  | 'Verified'
  | 'Mentor'
  | 'Administrator'
  | 'Skilled Professional'
  | 'Engaged Member'
  // Extended mock/demo badges (keep here until consolidated badge taxonomy)
  | 'Contributor'
  | 'Innovator'
  | 'Platform Manager'
  | 'Community Leader'
  | 'Senior Mentor'
  | 'Tech Expert'
  | 'Career Guide'
  // Partner / opportunity / achievement style dynamic badges sometimes appear in tests
  | (string & {});

/**
 * User interface - basic user entity
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'alumni' | 'mentor';
  profileImage?: string;
  isActive: boolean;
  joinDate: string;
}

/**
 * Extended User interface that matches db.json structure
 */
export interface DbUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: ProfileRole;
  status: ProfileStatus;
  avatar: string;
  bio: string;
  location: string;
  company: string;
  jobTitle: string;
  graduationYear: number;
  skills: string[];
  interests: string[];
  achievements: string[];
  badges: Badge[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  joinDate: string;
  lastLoginDate?: string;
  isVerified: boolean;
  verificationDate?: string;
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    showSocialLinks: boolean;
  };
  mentorship?: {
    isMentor: boolean;
    isMentee: boolean;
    expertiseAreas: string[];
    mentorshipInterests: string[];
    availabilityStatus: 'available' | 'busy' | 'unavailable';
    timezone?: string;
  };
  chapterIds: string[];
  eventIds: string[];
  analytics?: {
    profileViews: number;
    connectionsMade: number;
    eventsAttended: number;
    mentorshipSessions: number;
  };
  moderation?: {
    isFlagged: boolean;
    flagReason?: string;
    flaggedAt?: string;
    flaggedBy?: string;
    moderatorNotes?: string;
    warnings: number;
  };
  onboarding?: {
    isComplete: boolean;
    stepsCompleted: string[];
    currentStep?: string;
  };
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  createdAt: string;
  updatedAt?: string;
}

/**
 * Profile Analytics Timeline Entry
 */
export interface ProfileAnalyticsTimelineEntry {
  id: string;
  type: 'event' | 'achievement' | 'milestone' | 'connection' | 'mentorship';
  title: string;
  description?: string;
  date: string;
  metadata?: Record<string, any>;
}

/**
 * Profile Analytics interface
 */
export interface ProfileAnalytics {
  userId: string;
  
  // Engagement metrics
  profileViews: number;
  profileViewsThisMonth: number;
  searchAppearances: number;
  connectionRequests: number;
  connectionsAccepted: number;
  
  // Activity metrics
  eventsAttended: number;
  eventsAttendedThisYear: number;
  chaptersJoined: number;
  mentorshipSessions: number;
  qaParticipation: number;
  
  // Content metrics
  spotlightsFeature: number;
  questionsAsked: number;
  answersProvided: number;
  helpfulAnswers: number;
  
  // Social metrics
  endorsements: number;
  recommendations: number;
  networkSize: number;
  
  // Performance scores
  engagementScore: number; // 0-100
  influenceScore: number; // 0-100
  helpfulness: number; // 0-100
  
  // Timeline data
  timeline: ProfileAnalyticsTimelineEntry[];
  
  // Trending data
  monthlyActivity: Array<{
    month: string;
    events: number;
    connections: number;
    engagement: number;
  }>;
  
  // Metadata
  lastCalculated: string;
  calculationPeriod: string;
}

/**
 * Profile Settings interface
 */
export interface ProfileSettings {
  userId: string;
  
  // Privacy settings
  privacy: {
    profileVisibility: 'public' | 'members_only' | 'connections_only' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    showSocialLinks: boolean;
    showEmploymentHistory: boolean;
    showEducationHistory: boolean;
    allowDirectMessages: boolean;
    allowMentorshipRequests: boolean;
    allowEventInvitations: boolean;
  };
  
  // Notification preferences
  notifications: {
    email: {
      enabled: boolean;
      frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
      types: {
        newConnections: boolean;
        mentorshipRequests: boolean;
        eventInvitations: boolean;
        qaActivity: boolean;
        spotlights: boolean;
        announcements: boolean;
        systemUpdates: boolean;
      };
    };
    push: {
      enabled: boolean;
      types: {
        directMessages: boolean;
        mentorshipReminders: boolean;
        eventReminders: boolean;
        connectionRequests: boolean;
      };
    };
    sms: {
      enabled: boolean;
      types: {
        urgentAlerts: boolean;
        eventReminders: boolean;
        securityAlerts: boolean;
      };
    };
  };
  
  // Communication preferences
  communication: {
    preferredLanguage: string;
    timezone: string;
    availabilityStatus: 'available' | 'busy' | 'do_not_disturb' | 'offline';
    workingHours?: {
      start: string; // HH:MM format
      end: string; // HH:MM format
      days: string[]; // Array of day names
    };
  };
  
  // Professional settings
  professional: {
    showJobTitle: boolean;
    showCompany: boolean;
    showSalaryExpectations: boolean;
    openToOpportunities: boolean;
    opportunityTypes: string[];
    preferredLocations: string[];
    remoteWorkPreference: 'remote_only' | 'hybrid' | 'office_only' | 'flexible';
  };
  
  // Mentorship settings
  mentorship: {
    isMentorAvailable: boolean;
    isMenteeAvailable: boolean;
    expertiseAreas: string[];
    learningInterests: string[];
    mentorshipCapacity: number; // max number of mentees
    sessionPreferences: {
      frequency: 'weekly' | 'biweekly' | 'monthly' | 'flexible';
      duration: number; // minutes
      format: 'video' | 'phone' | 'in_person' | 'flexible';
    };
  };
  
  // Data and account settings
  account: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    dataExportRequests: string[]; // Array of request IDs
    dataRetentionPreference: 'standard' | 'extended' | 'minimal';
    accountDeletionScheduled?: string; // ISO date if deletion is scheduled
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Alumni Profile interface (comprehensive profile)
 */
export interface AlumniProfile {
  // Basic Information
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName?: string;
  
  // Profile basics
  avatar: string;
  bio: string;
  headline?: string; // Professional headline
  
  // Contact Information
  location: string;
  phone?: string;
  timezone?: string;
  
  // Professional Information
  company: string;
  jobTitle: string;
  industry?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string[];
  expertise: string[];
  
  // Education
  graduationYear: number;
  degree?: string;
  major?: string;
  university?: string;
  
  // Personal
  interests: string[];
  hobbies: string[];
  languages: string[];
  
  // Achievements and Recognition
  achievements: string[];
  certifications: string[];
  awards: string[];
  badges: Badge[];
  
  // Social and Professional Links
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
    portfolio?: string;
    blog?: string;
  };
  
  // Platform-specific
  role: ProfileRole;
  status: ProfileStatus;
  joinDate: string;
  lastLoginDate?: string;
  isVerified: boolean;
  verificationDate?: string;
  
  // Verification and trust
  verificationLevel?: 'basic' | 'enhanced' | 'premium';
  trustScore?: number; // 0-100
  
  // Privacy and Moderation
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    showSocialLinks: boolean;
    profileVisibility: 'public' | 'members_only' | 'private';
  };
  
  moderation?: {
    isFlagged: boolean;
    flagReason?: string;
    flaggedAt?: string;
    flaggedBy?: string;
    moderatorNotes?: string;
    warnings: number;
  };
  
  // Mentorship Information
  mentorship?: {
    isMentor: boolean;
    isMentee: boolean;
    expertiseAreas: string[];
    mentorshipInterests: string[];
    availabilityStatus: 'available' | 'busy' | 'unavailable';
    menteeCapacity?: number;
    mentorRating?: number; // 1-5 stars
    totalMentorSessions?: number;
    successfulMentorships?: number;
  };
  
  // Relationships and Connections
  chapterIds: string[];
  eventIds: string[];
  connectionIds?: string[];
  followerIds?: string[];
  followingIds?: string[];
  
  // Analytics and Engagement
  analytics?: {
    profileViews: number;
    connectionsMade: number;
    eventsAttended: number;
    mentorshipSessions: number;
    qaParticipation: number;
    engagementScore: number;
    lastActivityDate?: string;
  };
  
  // Onboarding and User Experience
  onboarding?: {
    isComplete: boolean;
    stepsCompleted: string[];
    currentStep?: string;
    welcomeMessageSent?: boolean;
    tutorialCompleted?: boolean;
  };
  
  // Preferences and Settings
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    eventReminders: boolean;
    mentorshipReminders: boolean;
    weeklyDigest: boolean;
  };
  
  // Employment and Career
  employment?: {
    currentPosition?: {
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      description?: string;
      location?: string;
    };
    previousPositions?: Array<{
      title: string;
      company: string;
      startDate: string;
      endDate: string;
      description?: string;
      location?: string;
    }>;
    careerObjectives?: string[];
    seekingOpportunities?: boolean;
    opportunityTypes?: string[];
    salaryRange?: string;
    availabilityDate?: string;
  };
  
  // Additional metadata
  tags?: string[]; // For categorization and filtering
  customFields?: Record<string, any>; // Flexible additional data
  
  // Audit trail
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  
  // Admin/moderator fields
  adminNotes?: string;
  verifiedAt?: string;
  moderatorNotes?: string;
}

/**
 * Profile filters interface
 */
export interface ProfileFilters {
  role?: ProfileRole;
  status?: ProfileStatus;
  search?: string;
  location?: string;
  company?: string;
  industry?: string;
  skills?: string[];
  graduationYear?: number;
  isVerified?: boolean;
  availableForMentorship?: boolean;
  chapterId?: string;
  badges?: Badge[];
  experienceLevel?: string;
  page?: number;
  limit?: number;
}

/**
 * Profile form data interface
 */
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  location: string;
  company: string;
  jobTitle: string;
  graduationYear: number;
  skills: string[];
  interests: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  role: ProfileRole;
  status: ProfileStatus;
}

/**
 * Profile summary statistics
 */
export interface ProfileSummaryStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
  verified: number;
  mentors: number;
  mentees: number;
  alumni: number;
  admins: number;
  thisMonth: number;
  thisYear: number;
}