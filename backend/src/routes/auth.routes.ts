import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireUser, requireAdmin } from '../middleware/auth';
import AuthService from '../services/AuthService';
import UserModel from '../models/User';
import AdminUserModel from '../models/AdminUser';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Simple user registration with email and password
 * @access  Public
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, date_of_birth } = req.body;

  if (!name || !email || !password || !date_of_birth) {
    throw new AppError('All fields are required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const result = await AuthService.registerUser({
    name,
    email,
    password,
    date_of_birth,
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Registration successful',
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Simple user login with email and password
 * @access  Public
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const result = await AuthService.loginUser(email, password);

  res.status(200).json({
    success: true,
    data: result,
    message: 'Login successful',
  });
}));

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate user with Google OAuth
 * @access  Public
 */
router.post('/google', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Google token is required', 400);
  }

  const result = await AuthService.authenticateWithGoogle(token);

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
      token: result.token,
      isNewUser: result.isNewUser,
      profileComplete: result.profileComplete,
    },
    message: result.isNewUser ? 'Account created successfully' : 'Login successful',
  });
}));

/**
 * @route   POST /api/auth/complete-profile
 * @desc    Complete user profile after Google login
 * @access  Private (User)
 */
router.post('/complete-profile', authenticate, requireUser, asyncHandler(async (req, res) => {
  const { name, phone, college_name, year, department } = req.body;

  if (!name || !phone || !college_name) {
    throw new AppError('Name, phone, and college name are required', 400);
  }

  const user = await UserModel.completeProfile(req.user!.userId, {
    name,
    phone,
    college_name,
    year,
    department,
  });

  res.status(200).json({
    success: true,
    data: { user },
    message: 'Profile completed successfully',
  });
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (blacklist token)
 * @access  Private
 */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    await AuthService.logout(token);
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', authenticate, asyncHandler(async (req, res) => {
  const oldToken = req.headers.authorization?.replace('Bearer ', '');

  if (!oldToken) {
    throw new AppError('Token is required', 400);
  }

  const newToken = await AuthService.refreshToken(oldToken);

  res.status(200).json({
    success: true,
    data: { token: newToken },
    message: 'Token refreshed successfully',
  });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await AuthService.getUserFromToken(
    req.headers.authorization?.replace('Bearer ', '') || ''
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
}));

/**
 * @route   POST /api/auth/admin/login
 * @desc    Admin login with email and password
 * @access  Public
 */
router.post('/admin/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const result = await AuthService.authenticateAdmin(email, password);

  res.status(200).json({
    success: true,
    data: {
      admin: result.admin,
      token: result.token,
    },
    message: 'Admin login successful',
  });
}));

/**
 * @route   POST /api/auth/admin/create
 * @desc    Create new admin user (Super Admin only)
 * @access  Private (Super Admin)
 */
router.post('/admin/create', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  // Check if user is super admin
  if (req.user?.adminRole !== 'super_admin') {
    throw new AppError('Only super admins can create admin users', 403);
  }

  const { email, name, password, role, phone } = req.body;

  if (!email || !name || !password || !role) {
    throw new AppError('Email, name, password, and role are required', 400);
  }

  const admin = await AdminUserModel.create({
    email,
    name,
    password,
    role,
    phone,
    created_by: req.user.userId,
  });

  res.status(201).json({
    success: true,
    data: { admin },
    message: 'Admin user created successfully',
  });
}));

/**
 * @route   POST /api/auth/admin/reset-password-request
 * @desc    Request password reset for admin
 * @access  Public
 */
router.post('/admin/reset-password-request', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const resetToken = await AuthService.generatePasswordResetToken(email);

  // In production, send this via email
  // For now, return it in response (REMOVE IN PRODUCTION)
  res.status(200).json({
    success: true,
    data: { resetToken },
    message: 'Password reset token generated. Check your email.',
  });
}));

/**
 * @route   POST /api/auth/admin/reset-password
 * @desc    Reset admin password with token
 * @access  Public
 */
router.post('/admin/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError('Token and new password are required', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  await AuthService.resetPassword(token, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
}));

/**
 * @route   PUT /api/auth/admin/change-password
 * @desc    Change admin password (when logged in)
 * @access  Private (Admin)
 */
router.put('/admin/change-password', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  // Verify current password
  const admin = await AdminUserModel.findById(req.user!.userId);
  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  const result = await AdminUserModel.verifyPassword(admin.email, currentPassword);
  if (!result.valid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  await AdminUserModel.updatePassword(req.user!.userId, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
}));

/**
 * @route   GET /api/auth/verify
 * @desc    Verify if token is valid
 * @access  Private
 */
router.get('/verify', authenticate, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      valid: true,
      user: req.user,
    },
    message: 'Token is valid',
  });
}));

export default router;

// Made with Bob
