import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireUser, requireAdmin, requireAdminRole } from '../middleware/auth';
import QRService from '../services/QRService';
import QRCodeModel from '../models/QRCode';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/qr/generate
 * @desc    Generate QR code for user registration
 * @access  Private (User)
 */
router.post('/generate', authenticate, requireUser, asyncHandler(async (req: Request, res: Response) => {
  const { eventId, registrationId } = req.body;

  if (!eventId || !registrationId) {
    throw new AppError('Event ID and registration ID are required', 400);
  }

  const result = await QRService.generateDailyQRCode(
    req.user!.userId,
    eventId,
    registrationId
  );

  res.status(200).json({
    success: true,
    data: {
      qrCode: result.qrCode,
      token: result.token,
    },
    message: 'QR code generated successfully',
  });
}));

/**
 * @route   POST /api/qr/validate
 * @desc    Validate QR code at entry gate
 * @access  Private (Admin - Gate Staff)
 */
router.post('/validate', authenticate, requireAdminRole(['gate_staff', 'super_admin']), asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('QR token is required', 400);
  }

  const validation = await QRService.validateQRCode(token);

  res.status(200).json({
    success: true,
    data: validation,
    message: validation.valid ? 'QR code is valid' : validation.reason,
  });
}));

/**
 * @route   POST /api/qr/scan
 * @desc    Scan and mark QR code as used
 * @access  Private (Admin - Gate Staff)
 */
router.post('/scan', authenticate, requireAdminRole(['gate_staff', 'super_admin']), asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('QR token is required', 400);
  }

  const qrCode = await QRService.markQRAsUsed(token, req.user!.userId);

  res.status(200).json({
    success: true,
    data: { qrCode },
    message: 'Entry granted. QR code marked as used.',
  });
}));

/**
 * @route   GET /api/qr/my-qr
 * @desc    Get current user's QR codes
 * @access  Private (User)
 */
router.get('/my-qr', authenticate, requireUser, asyncHandler(async (req: Request, res: Response) => {
  const today = new Date();
  const istDate = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const dateString = istDate.toISOString().split('T')[0];

  // Get today's QR codes for user
  const qrCodes = await QRCodeModel.findByUserId(req.user!.userId);

  res.status(200).json({
    success: true,
    data: {
      qrCodes,
      currentDate: dateString,
    },
  });
}));

/**
 * @route   GET /api/qr/:qrId
 * @desc    Get QR code details
 * @access  Private
 */
router.get('/:qrId', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const qrCode = await QRCodeModel.findById(req.params.qrId);

  if (!qrCode) {
    throw new AppError('QR code not found', 404);
  }

  // Check ownership or admin access
  if (req.user?.role === 'user' && qrCode.user_id !== req.user.userId) {
    throw new AppError('Access denied', 403);
  }

  res.status(200).json({
    success: true,
    data: { qrCode },
  });
}));

/**
 * @route   POST /api/qr/regenerate
 * @desc    Regenerate QR code (in case of issues)
 * @access  Private (User)
 */
router.post('/regenerate', authenticate, requireUser, asyncHandler(async (req: Request, res: Response) => {
  const { eventId, registrationId } = req.body;

  if (!eventId || !registrationId) {
    throw new AppError('Event ID and registration ID are required', 400);
  }

  const result = await QRService.regenerateQRCode(
    req.user!.userId,
    eventId,
    registrationId
  );

  res.status(200).json({
    success: true,
    data: {
      qrCode: result.qrCode,
      token: result.token,
    },
    message: 'QR code regenerated successfully',
  });
}));

/**
 * @route   GET /api/qr/stats/overview
 * @desc    Get QR code statistics
 * @access  Private (Admin)
 */
router.get('/stats/overview', authenticate, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.query.event_id as string;

  const stats = await QRService.getQRStatistics(eventId);

  res.status(200).json({
    success: true,
    data: { stats },
  });
}));

/**
 * @route   POST /api/qr/check-entry
 * @desc    Check if user can enter event
 * @access  Private (User)
 */
router.post('/check-entry', authenticate, requireUser, asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.body;

  if (!eventId) {
    throw new AppError('Event ID is required', 400);
  }

  const result = await QRService.canUserEnter(req.user!.userId, eventId);

  res.status(200).json({
    success: true,
    data: result,
  });
}));

/**
 * @route   GET /api/qr/event/:eventId/scans
 * @desc    Get all scans for an event
 * @access  Private (Admin)
 */
router.get('/event/:eventId/scans', authenticate, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const filters = {
    event_id: req.params.eventId,
    limit,
    offset: (page - 1) * limit,
  };

  const result = await QRCodeModel.findAll(filters);

  res.status(200).json({
    success: true,
    data: {
      scans: result.qrCodes,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    },
  });
}));

export default router;

// Made with Bob
