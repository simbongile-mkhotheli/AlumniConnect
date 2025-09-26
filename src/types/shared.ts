// Shared types that are used across multiple features
// These types remain in the shared types location

/**
 * Partner interface - used by multiple domains
 */
export interface Partner {
  id: string;
  name: string;

  /**
   * Supported partner types used across the app and mocks.
   * This union contains both legacy and new values to avoid mismatches.
   */
  type:
    | 'hiring'
    | 'technology'
    | 'education'
    | 'startup'
    | 'company'
    | 'non_profit'
    | 'academic'
    | 'consulting'
    | 'other';

  /**
   * Status values used in UI and mocks
   */
  status: 'active' | 'inactive' | 'pending' | 'archived';

  // Visual / contact
  logo?: string;
  website?: string;
  contactEmail?: string;

  // Human content
  description: string;

  // Metrics & counters used in UI
  jobOpportunities: number; // number of open positions / programs
  alumniHired: number; // number of alumni hired via this partner
  hireRate: number; // percent as integer (0-100)
  // Derived / boolean convenience flags referenced in some components
  isHiring?: boolean;

  // Partnership metadata
  partnershipSince?: string;

  // Tags for filtering
  tags: string[];

  // Meta
  createdAt: string;
  // Extended partner domain optional fields
  industry?: string;
  category?: string;
  tier?: string; // bronze | silver | gold | platinum | etc
  location?: string;
  contactPhone?: string;
  isActive?: boolean; // mirrors status === 'active'
  isFeatured?: boolean;
  joinedDate?: string;
  lastContact?: string;
  updatedAt?: string; // separate from createdAt for partners domain
  benefits?: string[]; // partner tier or custom benefit list
}

/**
 * Notification interface for cross-feature notifications
 */
export interface Notification {
  id: string;
  type: 'mentorship' | 'qa' | 'session' | 'answer' | 'comment' | 'system';
  subType?: string; // e.g., 'session_scheduled', 'question_answered', 'mentorship_approved'

  // Recipients
  userId: string;
  recipientRole?: 'mentor' | 'mentee' | 'author' | 'participant';

  // Content
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;

  // Related entities
  relatedEntityId?: string; // mentorship ID, question ID, etc.
  relatedEntityType?: 'mentorship' | 'session' | 'question' | 'answer';

  // Status
  status: 'unread' | 'read' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Metadata
  createdAt: string;
  readAt?: string;
  expiresAt?: string;

  // Sender information
  senderId?: string;
  senderName?: string;
  senderType?: 'system' | 'user' | 'admin';
}

/**
 * UI State types - shared across components
 */
export interface FilterState {
  status?: string;
  type?: string;
  category?: string;
  location?: string;
  sponsor?: string;
  search?: string;
  tier?: string;
  level?: string;
  performance?: string;
  page?: number;
  limit?: number;
  // Extended optional filters referenced in modals/pages
  industry?: string;
  experienceLevel?: string;
  featured?: string; // event featured filter
}

export interface BulkActionState {
  selectedItems: Set<string>;
  isVisible: boolean;
}

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  itemId?: string;
}

/**
 * API Response types - shared across all features
 */
export interface ApiResponse<T> {
  // Permit null when an entity is not found or deleted
  data: T | null;
  success: boolean;
  message?: string;
  error?: {
    code: number;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message?: string;
  error?: {
    code: number;
    message: string;
    details?: any;
  };
}

/**
 * Helper response type when an entity may be null (e.g., not found)
 */
export interface NullableApiResponse<T> extends ApiResponse<T | null> {}

/**
 * Theme types
 */
export type Theme = 'light' | 'dark';

/**
 * Navigation types
 */
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  isActive?: boolean;
  badge?: number;
}