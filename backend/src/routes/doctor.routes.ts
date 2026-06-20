import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireAdmin } from '../middleware/auth';
import PaymentService from '../services/PaymentService';
import DoctorModel from '../models/Doctor';
import EmailService from '../services/EmailService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/doctors/create-order
 * @desc    Create payment order for doctor
 * @access  Public
 */
router.post('/create-order', asyncHandler(async (req: Request, res: Response) => {
  const { name, designation, amount, email, phone } = req.body;

  if (!name || !designation || !amount) {
    throw new AppError('Name, designation, and amount are required', 400);
  }

  if (!PaymentService.validateAmount(amount)) {
    throw new AppError('Invalid payment amount', 400);
  }

  const result = await PaymentService.createDoctorPaymentOrder(
    name,
    designation,
    amount,
    email,
    phone
  );

  res.status(200).json({
    success: true,
    data: {
      orderId: result.order.id,
      amount: result.order.amount / 100, // Convert from paise
      currency: result.order.currency,
      doctorId: result.doctorRecord.id,
    },
    message: 'Payment order created successfully',
  });
}));

/**
 * @route   POST /api/doctors/verify-payment
 * @desc    Verify doctor payment
 * @access  Public
 */
router.post('/verify-payment', asyncHandler(async (req: Request, res: Response) => {
  const { orderId, paymentId, signature } = req.body;

  if (!orderId || !paymentId || !signature) {
    throw new AppError('Order ID, payment ID, and signature are required', 400);
  }

  const doctor = await PaymentService.handleDoctorPaymentSuccess(
    orderId,
    paymentId,
    signature
  );

  // Send receipt email
  try {
    if (doctor.email) {
      const receiptNumber = await PaymentService.generateReceiptNumber('doctor');
      
      await EmailService.sendDoctorReceipt(doctor.email, {
        doctorName: doctor.name,
        designation: doctor.designation || '',
        amount: doctor.payment_amount,
        receiptNumber,
        paymentDate: new Date().toLocaleDateString('en-IN'),
        paymentMode: 'Online',
      });
    }
  } catch (emailError) {
    console.error('Failed to send receipt email:', emailError);
  }

  res.status(200).json({
    success: true,
    data: { doctor },
    message: 'Payment verified successfully. Receipt sent to email.',
  });
}));

/**
 * @route   POST /api/doctors/cash-payment
 * @desc    Record cash payment from doctor
 * @access  Private (Admin - Finance Manager)
 */
router.post('/cash-payment', authenticate, asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.role !== 'admin') {
    throw new AppError('Admin access required', 403);
  }

  if (req.user.adminRole !== 'super_admin' && req.user.adminRole !== 'finance_manager') {
    throw new AppError('Finance manager access required', 403);
  }

  const { name, designation, amount, email, phone } = req.body;

  if (!name || !designation || !amount) {
    throw new AppError('Name, designation, and amount are required', 400);
  }

  const doctor = await PaymentService.recordCashPayment(
    name,
    designation,
    amount,
    email,
    phone,
    req.user.userId
  );

  // Send receipt email if email provided
  try {
    if (email) {
      const receiptNumber = await PaymentService.generateReceiptNumber('doctor');
      
      await EmailService.sendDoctorReceipt(email, {
        doctorName: name,
        designation: designation || '',
        amount,
        receiptNumber,
        paymentDate: new Date().toLocaleDateString('en-IN'),
        paymentMode: 'Cash',
      });
    }
  } catch (emailError) {
    console.error('Failed to send receipt email:', emailError);
  }

  res.status(201).json({
    success: true,
    data: { doctor },
    message: 'Cash payment recorded successfully',
  });
}));

/**
 * @route   GET /api/doctors
 * @desc    Get all doctor payments
 * @access  Private (Admin - Finance Manager)
 */
router.get('/', authenticate, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.adminRole !== 'super_admin' && req.user?.adminRole !== 'finance_manager') {
    throw new AppError('Finance manager access required', 403);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const payment_mode = req.query.payment_mode as string;
  const payment_status = req.query.payment_status as string;
  const search = req.query.search as string;

  const filters: any = {
    limit,
    offset: (page - 1) * limit,
  };

  if (payment_mode) filters.payment_mode = payment_mode;
  if (payment_status) filters.payment_status = payment_status;
  if (search) filters.search = search;

  const result = await DoctorModel.findAll(filters);

  res.status(200).json({
    success: true,
    data: {
      doctors: result.doctors,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    },
  });
}));

/**
 * @route   GET /api/doctors/:doctorId
 * @desc    Get doctor payment details
 * @access  Private (Admin - Finance Manager)
 */
router.get('/:doctorId', authenticate, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.adminRole !== 'super_admin' && req.user?.adminRole !== 'finance_manager') {
    throw new AppError('Finance manager access required', 403);
  }

  const doctor = await DoctorModel.findById(req.params.doctorId);

  if (!doctor) {
    throw new AppError('Doctor payment record not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { doctor },
  });
}));

/**
 * @route   GET /api/doctors/stats/overview
 * @desc    Get doctor payment statistics
 * @access  Private (Admin - Finance Manager)
 */
router.get('/stats/overview', authenticate, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.adminRole !== 'super_admin' && req.user?.adminRole !== 'finance_manager') {
    throw new AppError('Finance manager access required', 403);
  }

  const stats = await DoctorModel.getDoctorStatistics();

  res.status(200).json({
    success: true,
    data: { stats },
  });
}));

/**
 * @route   PUT /api/doctors/:doctorId
 * @desc    Update doctor payment record
 * @access  Private (Admin - Finance Manager)
 */
router.put('/:doctorId', authenticate, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.adminRole !== 'super_admin' && req.user?.adminRole !== 'finance_manager') {
    throw new AppError('Finance manager access required', 403);
  }

  const updates: any = {};
  const allowedFields = ['name', 'designation', 'email', 'phone', 'notes'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const doctor = await DoctorModel.update(req.params.doctorId, updates);

  res.status(200).json({
    success: true,
    data: { doctor },
    message: 'Doctor record updated successfully',
  });
}));

/**
 * @route   GET /api/doctors/finance/qr
 * @desc    Get finance QR code (static QR for payments)
 * @access  Public
 */
router.get('/finance/qr', asyncHandler(async (req: Request, res: Response) => {
  // This would return a static QR code for finance payments
  // For now, return placeholder
  res.status(200).json({
    success: true,
    data: {
      qrCodeUrl: process.env.FINANCE_QR_URL || 'https://example.com/finance-qr.png',
      upiId: process.env.FINANCE_UPI_ID || 'cerebrexia@upi',
    },
    message: 'Finance QR code retrieved',
  });
}));

export default router;

// Made with Bob
