import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}

/**
 * Simple Authentication Middleware
 * Validates Bearer tokens for admin access
 */
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.',
        error: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const adminToken = process.env.ADMIN_API_TOKEN;

    if (!adminToken) {
      console.error('⚠️ ADMIN_API_TOKEN not configured in environment');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'SERVER_CONFIG_ERROR'
      });
    }

    // Simple token validation for admin access
    if (token !== adminToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      });
    }

    // Set user context for admin operations
    req.user = {
      id: 'admin',
      role: 'admin',
      email: 'admin@system'
    };

    console.log('✅ Admin authenticated successfully');
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token validation failed',
      error: 'AUTH_ERROR'
    });
  }
};

/**
 * Basic rate limiting (in-memory)
 */
const rateLimitStore = new Map<string, { count: number; lastRequest: number }>();

export const rateLimit = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const userLimit = rateLimitStore.get(clientId);

    if (!userLimit || now - userLimit.lastRequest > windowMs) {
      rateLimitStore.set(clientId, { count: 1, lastRequest: now });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${clientId}`);
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        error: 'RATE_LIMIT'
      });
    }

    userLimit.count++;
    userLimit.lastRequest = now;
    next();
  };
};