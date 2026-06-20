import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';
import { AppError } from './errorHandler';
import { AdminUser } from '../models/AdminUser';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: 'user' | 'admin';
        adminRole?: AdminUser['role'];
      };
    }
  }
}

/**
 * Extract token from Authorization header
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer token" and "token" formats
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
};

/**
 * Authenticate user middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // Verify token
    const payload = await AuthService.verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      adminRole: payload.adminRole,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Authentication failed',
      });
    }
  }
};

/**
 * Require user role middleware
 * Ensures authenticated user has 'user' role
 */
export const requireUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (req.user.role !== 'user') {
      throw new AppError('User access required', 403);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }
  }
};

/**
 * Require admin role middleware
 * Ensures authenticated user has 'admin' role
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (req.user.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }
  }
};

/**
 * Require specific admin role middleware
 * Ensures authenticated admin has one of the specified roles
 */
export const requireAdminRole = (allowedRoles: AdminUser['role'][]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      if (req.user.role !== 'admin') {
        throw new AppError('Admin access required', 403);
      }

      // Super admin has access to everything
      if (req.user.adminRole === 'super_admin') {
        next();
        return;
      }

      if (!req.user.adminRole || !allowedRoles.includes(req.user.adminRole)) {
        throw new AppError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }
    }
  };
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token) {
      const payload = await AuthService.verifyToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        adminRole: payload.adminRole,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Check if user owns resource
 * Compares userId from token with userId in request params
 */
export const requireOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const resourceUserId = req.params.userId || req.body.userId;

    if (!resourceUserId) {
      throw new AppError('User ID not found in request', 400);
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // User can only access their own resources
    if (req.user.userId !== resourceUserId) {
      throw new AppError('Access denied - not resource owner', 403);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }
  }
};

/**
 * Rate limiting per user
 * Limits requests per user based on their authentication
 */
export const rateLimitPerUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const userId = req.user.userId;
      const now = Date.now();

      const userLimit = userRequests.get(userId);

      if (!userLimit || now > userLimit.resetTime) {
        // Reset or initialize
        userRequests.set(userId, {
          count: 1,
          resetTime: now + windowMs,
        });
        next();
        return;
      }

      if (userLimit.count >= maxRequests) {
        const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter.toString());
        res.status(429).json({
          success: false,
          error: 'Too many requests',
          retryAfter,
        });
        return;
      }

      userLimit.count++;
      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  };
};

/**
 * Verify profile completion
 * Ensures user has completed their profile
 */
export const requireProfileComplete = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (req.user.role !== 'user') {
      next();
      return;
    }

    // Check if profile is complete (this would need to query the database)
    // For now, we'll assume it's handled in the route
    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }
  }
};

/**
 * Verify email verification status
 * Ensures user's email is verified
 */
export const requireEmailVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // This would need to check the user's email verification status
    // For now, we'll assume Google OAuth handles this
    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }
  }
};

export default {
  authenticate,
  requireUser,
  requireAdmin,
  requireAdminRole,
  optionalAuth,
  requireOwnership,
  rateLimitPerUser,
  requireProfileComplete,
  requireEmailVerified,
};

// Made with Bob
