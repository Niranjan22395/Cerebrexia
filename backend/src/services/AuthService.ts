import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import UserModel, { User } from '../models/User';
import AdminUserModel, { AdminUser } from '../models/AdminUser';
import { AppError } from '../middleware/errorHandler';
import { redisClient } from '../config/redis';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  adminRole?: AdminUser['role'];
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export class AuthService {
  /**
   * Verify Google OAuth token and extract user information
   */
  static async verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AppError('Invalid Google token', 401);
      }

      return {
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        email_verified: payload.email_verified || false,
      };
    } catch (error) {
      throw new AppError('Failed to verify Google token', 401);
    }
  }

  /**
   * Authenticate user with Google OAuth
   */
  static async authenticateWithGoogle(googleToken: string): Promise<{
    user: Omit<User, 'password_hash'>;
    token: string;
    isNewUser: boolean;
    profileComplete: boolean;
  }> {
    // Verify Google token
    const googleUser = await this.verifyGoogleToken(googleToken);

    if (!googleUser.email_verified) {
      throw new AppError('Email not verified with Google', 400);
    }

    // Check if user exists
    let user = await UserModel.findByEmail(googleUser.email);
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = await UserModel.create({
        email: googleUser.email,
        name: googleUser.name,
        google_id: googleUser.email, // Using email as google_id for now
        profile_picture: googleUser.picture,
      });
      isNewUser = true;
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: 'user',
    });

    // Store token in Redis with expiration
    await this.storeToken(user.id, token);

    return {
      user,
      token,
      isNewUser,
      profileComplete: user.profile_completed,
    };
  }

  /**
   * Register new user with email and password
   */
  static async registerUser(data: {
    name: string;
    email: string;
    password: string;
    date_of_birth: string;
  }): Promise<{
    user: Omit<User, 'password_hash'>;
  }> {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create user with password
    const user = await UserModel.createWithPassword({
      email: data.email,
      name: data.name,
      password: data.password,
      date_of_birth: data.date_of_birth,
    });

    return { user };
  }

  /**
   * Login user with email and password
   */
  static async loginUser(email: string, password: string): Promise<{
    user: Omit<User, 'password_hash'>;
    token: string;
  }> {
    // Find user and verify password
    const result = await UserModel.verifyPassword(email, password);
    
    if (!result.valid || !result.user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: 'user',
    });

    // Store token in Redis
    await this.storeToken(result.user.id, token);

    return {
      user: result.user,
      token,
    };
  }

  /**
   * Authenticate admin user with email and password
   */
  static async authenticateAdmin(email: string, password: string): Promise<{
    admin: Omit<AdminUser, 'password_hash'>;
    token: string;
  }> {
    const result = await AdminUserModel.verifyPassword(email, password);

    if (!result.valid || !result.admin) {
      throw new AppError(result.reason || 'Invalid credentials', 401);
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: result.admin.id,
      email: result.admin.email,
      role: 'admin',
      adminRole: result.admin.role,
    });

    // Store token in Redis
    await this.storeToken(result.admin.id, token);

    return {
      admin: result.admin,
      token,
    };
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new AppError('Token has been revoked', 401);
      }

      // Check if token exists in Redis
      const storedToken = await this.getStoredToken(decoded.userId);
      if (!storedToken || storedToken !== token) {
        throw new AppError('Invalid or expired token', 401);
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      }
      throw error;
    }
  }

  /**
   * Store token in Redis
   */
  static async storeToken(userId: string, token: string): Promise<void> {
    const key = `auth:token:${userId}`;
    const expiresIn = this.getTokenExpirationSeconds();
    await redisClient.setex(key, expiresIn, token);
  }

  /**
   * Get stored token from Redis
   */
  static async getStoredToken(userId: string): Promise<string | null> {
    const key = `auth:token:${userId}`;
    return await redisClient.get(key);
  }

  /**
   * Blacklist token (for logout)
   */
  static async blacklistToken(token: string): Promise<void> {
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded) return;

    const key = `auth:blacklist:${token}`;
    const expiresIn = this.getTokenExpirationSeconds();
    await redisClient.setex(key, expiresIn, '1');

    // Remove from active tokens
    await redisClient.del(`auth:token:${decoded.userId}`);
  }

  /**
   * Check if token is blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `auth:blacklist:${token}`;
    const result = await redisClient.get(key);
    return result !== null;
  }

  /**
   * Logout user
   */
  static async logout(token: string): Promise<void> {
    await this.blacklistToken(token);
  }

  /**
   * Refresh token
   */
  static async refreshToken(oldToken: string): Promise<string> {
    const payload = await this.verifyToken(oldToken);

    // Generate new token
    const newToken = this.generateToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      adminRole: payload.adminRole,
    });

    // Blacklist old token
    await this.blacklistToken(oldToken);

    // Store new token
    await this.storeToken(payload.userId, newToken);

    return newToken;
  }

  /**
   * Get token expiration in seconds
   */
  private static getTokenExpirationSeconds(): number {
    const expiresIn = JWT_EXPIRES_IN;
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60;
    }
    if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60;
    }
    if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    }
    return parseInt(expiresIn);
  }

  /**
   * Validate user session
   */
  static async validateSession(userId: string, token: string): Promise<boolean> {
    const storedToken = await this.getStoredToken(userId);
    return storedToken === token;
  }

  /**
   * Get user from token
   */
  static async getUserFromToken(token: string): Promise<User | AdminUser | null> {
    const payload = await this.verifyToken(token);

    if (payload.role === 'admin') {
      return await AdminUserModel.findById(payload.userId);
    } else {
      return await UserModel.findById(payload.userId);
    }
  }

  /**
   * Check if user has required role
   */
  static async hasRole(
    token: string,
    requiredRole: 'user' | 'admin' | AdminUser['role'][]
  ): Promise<boolean> {
    const payload = await this.verifyToken(token);

    if (requiredRole === 'user') {
      return payload.role === 'user';
    }

    if (requiredRole === 'admin') {
      return payload.role === 'admin';
    }

    // Check specific admin roles
    if (Array.isArray(requiredRole) && payload.role === 'admin') {
      return requiredRole.includes(payload.adminRole!);
    }

    return false;
  }

  /**
   * Generate password reset token
   */
  static async generatePasswordResetToken(email: string): Promise<string> {
    const admin = await AdminUserModel.findByEmail(email);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    const resetToken = jwt.sign(
      { userId: admin.id, email: admin.email, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in Redis
    const key = `auth:reset:${admin.id}`;
    await redisClient.setex(key, 3600, resetToken);

    return resetToken;
  }

  /**
   * Verify password reset token
   */
  static async verifyPasswordResetToken(token: string): Promise<string> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      if (decoded.type !== 'password_reset') {
        throw new AppError('Invalid reset token', 400);
      }

      // Check if token exists in Redis
      const key = `auth:reset:${decoded.userId}`;
      const storedToken = await redisClient.get(key);

      if (!storedToken || storedToken !== token) {
        throw new AppError('Reset token expired or invalid', 400);
      }

      return decoded.userId;
    } catch (error) {
      throw new AppError('Invalid or expired reset token', 400);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const userId = await this.verifyPasswordResetToken(token);

    // Update password
    await AdminUserModel.updatePassword(userId, newPassword);

    // Delete reset token
    await redisClient.del(`auth:reset:${userId}`);

    // Invalidate all existing sessions
    await redisClient.del(`auth:token:${userId}`);
  }
}

export default AuthService;

// Made with Bob
