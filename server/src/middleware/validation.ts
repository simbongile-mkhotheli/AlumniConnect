import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Basic Input Validation Schemas
 */

// Safe string pattern - prevents XSS and injection
const createSafeString = (minLength = 1, maxLength = 500) => 
  z.string()
    .min(minLength)
    .max(maxLength)
    .refine(
      (str) => !/<script|javascript:|vbscript:|on\w+=/i.test(str),
      'String contains potentially dangerous content'
    );

// Event validation schema
export const eventSchema = z.object({
  title: createSafeString(3, 200),
  slug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: createSafeString(0, 5000).optional().nullable(),
  excerpt: createSafeString(0, 500).optional().nullable(),
  organizer: createSafeString(0, 100).optional().nullable(),
  location: createSafeString(0, 200).optional().nullable(),
  venue: createSafeString(0, 200).optional().nullable(),
  address: createSafeString(0, 500).optional().nullable(),
  sponsor: createSafeString(0, 100).optional().nullable(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(createSafeString(1, 30)).max(10).optional(),
  rsvpCount: z.number().int().nonnegative().max(100000).optional(),
  attendanceCount: z.number().int().nonnegative().max(100000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Validation middleware factory
 */
export const validateInput = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and sanitize input
      const validatedData = schema.parse(req.body);
      req.body = validatedData; // Replace with cleaned data
      
      console.log('✅ Input validation passed');
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.warn('⚠️ Input validation failed:', error.errors);
        return res.status(400).json({
          success: false,
          message: 'Input validation failed',
          error: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      
      console.error('❌ Validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Validation processing error',
        error: 'INTERNAL_ERROR',
      });
    }
  };
};