import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireUser, requireAdmin } from '../middleware/auth';
import PaymentService from '../services/PaymentService';
import PaymentModel from '../models/Payment';
import EmailService from '../services/EmailService';
import QRService from '../services/QRService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay order for event registration
 * @access  Private (User)
 */
router.post('/create-order', authenticate, requireUser, asyncHandler(async (req: Request, res: Response) => {
  const { eventId, amount, promoCode } = req.body;

  if (!eventId || !amount) {
    throw new AppError('Event ID and amount are required', 400);
  }

  if (!PaymentService.validateAmount(amount)) {
    throw new AppError('Invalid payment amount', 400);
  }

  const result = await PaymentService.createEventRegistrationOrder(
    req.user!.userId,
    eventId,
    amount,
    promoCode
  );

  res.status(200).json({
    success: true,
    data: {
      orderId: result.order.id,
      amount: result.finalAmount,
      currency: result.order.currency,
      paymentId: result.payment.id,
    },
    message: 'Order created successfully',
  });
}));

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment and complete registration
 * @access  Private (User)
 */
router.post('/verify', authenticate, requireUser, asyncHandler(async (req: Request, res: Response) => {
  const { orderId, paymentId, signature } = req.body;

  if (!orderId || !paymentId || !signature) {
    throw new AppError('Order ID, payment ID, and signature are required', 400);
  }

  const result = await PaymentService.handleEventPaymentSuccess(
    orderId,
    paymentId,
    signature
  );

  // Send confirmation email
  try {
    const user = await PaymentService.getUserFromPayment(result.payment.id);
    const event = await PaymentService.getEventFromPayment(result.payment.id);
    
    if (user && event) {
      await EmailService.sendRegistrationConfirmation(user.email, {
        userName: user.name,
        eventName: event.name,
        eventDate: event.start_date.toLocaleDateString(),
        amount: result.payment.amount,
        orderId: result.payment.razorpay_order_id,
      });

      // Send admin notification
      await EmailService.sendPaymentConfirmationToAdmin(
        user.name,
        user.email,
        event.name,
        result.payment.amount,
        result.payment.razorpay_order_id
      );
    }
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError);
    // Don't fail the payment if email fails
  }

  // Generate QR code
  try {
    await QRService.generateDailyQRCode(
      req.user!.userId,
      result.registration.event_id,
      result.registration.id
    );
  } catch (qrError) {
    console.error('Failed to generate QR code:', qrError);
  }

  res.status(200).json({
    success: true,
    data: {
      payment: result.payment,
      registration: result.registration,
    },
    message: 'Payment verified and registration completed',
  });
}));

/**
 * @route   POST /api/payments/failure
 * @desc    Handle payment failure
 * @access  Private (User)
 */
router.post('/failure', authenticate, requireUser, asyncHandler(async (req: Request, res: Response) => {
  const { orderId, reason } = req.body;

  if (!orderId) {
    throw new AppError('Order ID is required', 400);
  }

  const payment = await PaymentService.handlePaymentFailure(orderId, reason);

  res.status(200).json({
    success: true,
    data: { payment },
    message: 'Payment failure recorded',
  });
}));

/**
 * @route   GET /api/payments/:paymentId
 * @desc    Get payment details
 * @access  Private
 */
router.get('/:paymentId', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const payment = await PaymentModel.findById(req.params.paymentId);

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Check ownership or admin access
  if (req.user?.role === 'user' && payment.user_id !== req.user.userId) {
    throw new AppError('Access denied', 403);
  }

  res.status(200).json({
    success: true,
    data: { payment },
  });
}));

/**
 * @route   GET /api/payments/user/history
 * @desc    Get user's payment history
 * @access  Private (User)
 */
router.get('/user/history', authenticate, requireUser, asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await PaymentService.getUserPaymentHistory(
    req.user!.userId,
    limit,
    (page - 1) * limit
  );

  res.status(200).json({
    success: true,
    data: {
      payments: result.payments,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    },
  });
}));

/**
 * @route   POST /api/payments/:paymentId/refund
 * @desc    Process refund
 * @access  Private (Admin - Finance Manager)
 */
router.post('/:paymentId/refund', authenticate, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.adminRole !== 'super_admin' && req.user?.adminRole !== 'finance_manager') {
    throw new AppError('Finance manager access required', 403);
  }

  const { amount, reason } = req.body;

  const result = await PaymentService.processRefund(
    req.params.paymentId,
    amount,
    reason
  );

  res.status(200).json({
    success: true,
    data: {
      payment: result.payment,
      refund: result.refund,
    },
    message: 'Refund processed successfully',
  });
}));

/**
 * @route   GET /api/payments/stats/revenue
 * @desc    Get revenue statistics
 * @access  Private (Admin - Finance Manager)
 */
router.get('/stats/revenue', authenticate, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.adminRole !== 'super_admin' && req.user?.adminRole !== 'finance_manager') {
    throw new AppError('Finance manager access required', 403);
  }

  const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
  const endDate = req.query.end_date ? new Date(req.query.end_date as string) : undefined;
  const eventId = req.query.event_id as string;

  const stats = await PaymentService.getPaymentStatistics({
    start_date: startDate,
    end_date: endDate,
    event_id: eventId,
  });

  res.status(200).json({
    success: true,
    data: { stats },
  });
}));

/**
 * @route   GET /api/payments/admin/all
 * @desc    Get all payments (Admin)
 * @access  Private (Admin)
 */
router.get('/admin/all', authenticate, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const status = req.query.status as string;
  const eventId = req.query.event_id as string;

  const filters: any = {
    limit,
    offset: (page - 1) * limit,
  };

  if (status) filters.status = status;
  if (eventId) filters.event_id = eventId;

  const result = await PaymentModel.findAll(filters);

  res.status(200).json({
    success: true,
    data: {
      payments: result.payments,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    },
  });
}));

/**
 * @route   POST /api/payments/validate-promo
 * @desc    Validate promo code and get discount
 * @access  Private (User)
 */
router.post('/validate-promo', authenticate, requireUser, asyncHandler(async (req: Request, res: Response) => {
  const { promoCode, amount } = req.body;

  if (!promoCode || !amount) {
    throw new AppError('Promo code and amount are required', 400);
  }

  // This would use PromoCodeModel to validate
  // For now, return a placeholder response
  res.status(200).json({
    success: true,
    data: {
      valid: false,
      message: 'Promo code validation not yet implemented',
    },
  });
}));

export default router;

// Made with Bob
