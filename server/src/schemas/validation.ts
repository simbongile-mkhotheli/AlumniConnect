import { z } from 'zod';

/**
 * Common validation patterns and sanitizers
 */
export const commonPatterns = {
  // Prevent XSS and injection attacks
  safeString: z.string()
    .min(1)
    .max(500)
    .regex(/^[^<>'"&]*$/, 'String contains potentially dangerous characters'),
  
  safeText: (maxLength: number = 5000) => z.string()
    .min(1)
    .max(maxLength)
    .transform(str => str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')), // Remove script tags
  
  email: z.string()
    .email()
    .max(254)
    .toLowerCase()
    .transform(str => str.trim()),
  
  url: z.string()
    .url()
    .max(500)
    .regex(/^https?:\/\//, 'Only HTTP and HTTPS URLs allowed'),
  
  slug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  
  password: z.string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one uppercase, lowercase, number, and special character'),
  
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .nullable(),
};

/**
 * User Profile Validation Schema
 */
export const profileCreateSchema = z.object({
  fullName: commonPatterns.safeString.min(2).max(100),
  email: commonPatterns.email,
  password: commonPatterns.password,
  role: z.enum(['alumni', 'student', 'mentor', 'admin']).default('alumni'),
  bio: commonPatterns.safeText(1000).optional().nullable(),
  skills: z.array(commonPatterns.safeString.max(50)).max(20).default([]),
  interests: z.array(commonPatterns.safeString.max(50)).max(20).default([]),
  phoneNumber: commonPatterns.phoneNumber,
  linkedInUrl: commonPatterns.url.optional().nullable(),
  githubUrl: commonPatterns.url.optional().nullable(),
  websiteUrl: commonPatterns.url.optional().nullable(),
  isPublic: z.boolean().default(true),
});

export const profileUpdateSchema = profileCreateSchema.partial().omit({ password: true });

/**
 * Authentication Schemas
 */
export const loginSchema = z.object({
  email: commonPatterns.email,
  password: z.string().min(1).max(128), // Don't validate complexity on login
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: commonPatterns.password,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Event Validation Schema
 */
export const eventCreateSchema = z.object({
  title: commonPatterns.safeString.min(5).max(200),
  slug: commonPatterns.slug,
  description: commonPatterns.safeText(5000).optional().nullable(),
  excerpt: commonPatterns.safeText(500).optional().nullable(),
  organizer: commonPatterns.safeString.max(100).optional().nullable(),
  location: commonPatterns.safeString.max(200).optional().nullable(),
  venue: commonPatterns.safeString.max(200).optional().nullable(),
  address: commonPatterns.safeString.max(500).optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sponsor: commonPatterns.safeString.max(100).optional().nullable(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
  isFeatured: z.boolean().default(false),
  tags: z.array(commonPatterns.safeString.max(30)).max(10).default([]),
  rsvpCount: z.number().int().nonnegative().max(10000).default(0),
  attendanceCount: z.number().int().nonnegative().max(10000).default(0),
});

export const eventUpdateSchema = eventCreateSchema.partial();

/**
 * Chapter Validation Schema
 */
export const chapterCreateSchema = z.object({
  name: commonPatterns.safeString.min(3).max(100),
  slug: commonPatterns.slug,
  description: commonPatterns.safeText(2000).optional().nullable(),
  location: commonPatterns.safeString.max(200).optional().nullable(),
  type: z.enum(['regional', 'industry', 'interest']).default('regional'),
  memberCount: z.number().int().nonnegative().max(100000).default(0),
  isActive: z.boolean().default(true),
  contactEmail: commonPatterns.email.optional().nullable(),
  websiteUrl: commonPatterns.url.optional().nullable(),
});

export const chapterUpdateSchema = chapterCreateSchema.partial();

/**
 * File Upload Validation
 */
export const fileUploadSchema = z.object({
  filename: z.string()
    .min(1)
    .max(255)
    .regex(/^[^<>:"/\\|?*]+$/, 'Invalid filename characters'),
  
  mimetype: z.enum([
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv'
  ]),
  
  size: z.number()
    .int()
    .positive()
    .max(5 * 1024 * 1024), // 5MB limit
});

/**
 * Bulk Operation Schema
 */
export const bulkOperationSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  operation: z.enum(['delete', 'activate', 'deactivate', 'archive']),
  reason: commonPatterns.safeText(500).optional(),
});

/**
 * Search and Filter Schemas  
 */
export const searchQuerySchema = z.object({
  q: commonPatterns.safeString.max(100).optional(),
  page: z.coerce.number().int().positive().max(1000).default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['created', 'updated', 'name', 'date']).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.string().max(20).optional(),
  category: z.string().max(50).optional(),
});

/**
 * Admin Operation Schema
 */
export const adminOperationSchema = z.object({
  action: z.enum(['approve', 'reject', 'suspend', 'activate', 'delete']),
  targetId: z.string().uuid(),
  reason: commonPatterns.safeText(1000).optional(),
  notifyUser: z.boolean().default(false),
});

/**
 * Schema validation middleware
 */
export const validateSchema = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData; // Replace with sanitized data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
      }
      
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal validation error',
        error: 'INTERNAL_ERROR',
      });
    }
  };
};