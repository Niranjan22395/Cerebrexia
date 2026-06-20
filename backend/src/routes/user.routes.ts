import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import UserModel from '../models/User';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile - NO AUTH REQUIRED
 * @access  Public
 */
router.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.query.user_id as string;
  
  if (!userId) {
    throw new AppError('User ID is required', 400);
  }
  
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
}));

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile - NO AUTH REQUIRED
 * @access  Public
 */
router.put('/profile', asyncHandler(async (req: Request, res: Response) => {
  const { user_id, name, phone, college_name, year, department } = req.body;
  
  if (!user_id) {
    throw new AppError('User ID is required', 400);
  }

  const updates: any = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (college_name) updates.college_name = college_name;
  if (year) updates.year = year;
  if (department) updates.department = department;

  const user = await UserModel.update(user_id, updates);

  res.status(200).json({
    success: true,
    data: { user },
    message: 'Profile updated successfully',
  });
}));

/**
 * @route   POST /api/users/upload-college-id
 * @desc    Upload college ID for verification - NO AUTH REQUIRED
 * @access  Public
 */
router.post('/upload-college-id', asyncHandler(async (req: Request, res: Response) => {
  const { user_id, college_id_url } = req.body;
  
  if (!user_id) {
    throw new AppError('User ID is required', 400);
  }

  if (!college_id_url) {
    throw new AppError('College ID URL is required', 400);
  }

  const user = await UserModel.uploadCollegeId(user_id, college_id_url);

  res.status(200).json({
    success: true,
    data: { user },
    message: 'College ID uploaded successfully. Awaiting verification.',
  });
}));

/**
 * @route   GET /api/users/verification-status
 * @desc    Get user verification status - NO AUTH REQUIRED
 * @access  Public
 */
router.get('/verification-status', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.query.user_id as string;
  
  if (!userId) {
    throw new AppError('User ID is required', 400);
  }
  
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      verification_status: user.verification_status,
      college_id_uploaded: !!user.college_id_url,
      profile_completed: user.profile_completed,
    },
  });
}));

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID - NO AUTH REQUIRED
 * @access  Public
 */
router.get('/:userId', asyncHandler(async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.params.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
}));

/**
 * @route   GET /api/users
 * @desc    Get all users - NO AUTH REQUIRED
 * @access  Public
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const verification_status = req.query.verification_status as string;

  const filters: any = {
    limit,
    offset: (page - 1) * limit,
  };

  if (search) filters.search = search;
  if (verification_status) filters.verification_status = verification_status;

  const result = await UserModel.findAll(filters);

  res.status(200).json({
    success: true,
    data: {
      users: result.users,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    },
  });
}));

/**
 * @route   PUT /api/users/:userId/verify
 * @desc    Verify user's college ID - NO AUTH REQUIRED
 * @access  Public
 */
router.put('/:userId/verify', asyncHandler(async (req: Request, res: Response) => {

  const { status, rejection_reason } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    throw new AppError('Valid status (approved/rejected) is required', 400);
  }

  if (status === 'rejected' && !rejection_reason) {
    throw new AppError('Rejection reason is required', 400);
  }

  const user = await UserModel.updateVerificationStatus(
    req.params.userId,
    status,
    rejection_reason
  );

  res.status(200).json({
    success: true,
    data: { user },
    message: `User verification ${status}`,
  });
}));

/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete user - NO AUTH REQUIRED
 * @access  Public
 */
router.delete('/:userId', asyncHandler(async (req: Request, res: Response) => {

  await UserModel.delete(req.params.userId);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
}));

/**
 * @route   GET /api/users/stats/overview
 * @desc    Get user statistics - NO AUTH REQUIRED
 * @access  Public
 */
router.get('/stats/overview', asyncHandler(async (req: Request, res: Response) => {

  const stats = await UserModel.getUserStatistics();

  res.status(200).json({
    success: true,
    data: { stats },
  });
}));

export default router;

// Made with Bob
