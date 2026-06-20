import { Router, Request, Response, NextFunction } from 'express';
import { getPool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../middleware/errorHandler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * @route   POST /api/v1/simple-auth/register
 * @desc    Register new user with email and password
 * @access  Public
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, date_of_birth } = req.body;

  // Validate required fields
  if (!name || !email || !password || !date_of_birth) {
    throw new AppError('All fields are required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const pool = getPool();

  // Check if user already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError('Email already registered', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const result = await pool.query(
    `INSERT INTO users (email, password, full_name, date_of_birth, profile_completed, role, is_verified, created_at, updated_at)
     VALUES ($1, $2, $3, $4, true, 'user', false, NOW(), NOW())
     RETURNING id, email, full_name, date_of_birth, profile_completed, role, is_verified, created_at, updated_at`,
    [email, hashedPassword, name, date_of_birth]
  );

  const user = result.rows[0];

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        dateOfBirth: user.date_of_birth,
        profileCompleted: user.profile_completed,
        role: user.role,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    },
  });
}));

/**
 * @route   POST /api/v1/simple-auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const pool = getPool();

  // Find user
  const result = await pool.query(
    'SELECT id, email, password, full_name, date_of_birth, profile_completed, role, is_verified, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = result.rows[0];

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Return user data without password
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        dateOfBirth: user.date_of_birth,
        profileCompleted: user.profile_completed,
        role: user.role || 'user',
        isVerified: user.is_verified || false,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      token,
    },
  });
}));

/**
 * @route   GET /api/v1/simple-auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  // Get token from header
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new AppError('No token provided', 401);
  }

  // Verify token
  const decoded = jwt.verify(token, JWT_SECRET) as any;

  const pool = getPool();

  // Get user from database
  const result = await pool.query(
    'SELECT id, email, full_name, date_of_birth, profile_completed, role, is_verified, created_at, updated_at FROM users WHERE id = $1',
    [decoded.userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  const user = result.rows[0];

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        dateOfBirth: user.date_of_birth,
        profileCompleted: user.profile_completed,
        role: user.role || 'user',
        isVerified: user.is_verified || false,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    },
  });
}));

export default router;

// Made with Bob