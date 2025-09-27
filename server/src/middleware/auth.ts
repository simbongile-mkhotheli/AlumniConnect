import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

/**
 * Authentication Middleware
 * Validates Bearer tokens and protects admin endpoints
 */
export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
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
      console.error('ADMIN_API_TOKEN not configured in environment');
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

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token validation failed',
      error: 'AUTH_ERROR'
    });
  }
};

/**
 * JWT-based authentication (for future user sessions)
 */
export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.',
        error: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET not configured in environment');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'SERVER_CONFIG_ERROR'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    req.user = {
      id: decoded.sub || decoded.id,
      role: decoded.role || 'user',
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'TOKEN_EXPIRED'
      });
    }

    console.error('JWT verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token validation failed',
      error: 'AUTH_ERROR'
    });
  }
};

/**
 * Role-based access control
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NO_AUTH'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      });
    }

    next();
  };
};

/**
 * Rate limiting middleware (basic implementation)
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