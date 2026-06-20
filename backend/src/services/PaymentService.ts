import Razorpay from 'razorpay';
import crypto from 'crypto';
import PaymentModel, { Payment } from '../models/Payment';
import EventRegistrationModel from '../models/EventRegistration';
import DoctorModel from '../models/Doctor';
import PromoCodeModel from '../models/PromoCode';
import { AppError } from '../middleware/errorHandler';
import { redisClient } from '../config/redis';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentDetails {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export class PaymentService {
  /**
   * Create Razorpay order for event registration
   */
  static async createEventRegistrationOrder(
    userId: string,
    eventId: string,
    amount: number,
    promoCode?: string
  ): Promise<{ order: any; payment: Payment; finalAmount: number }> {
    let finalAmount = amount;
    let discount = 0;
    let promoCodeId: string | undefined;

    // Apply promo code if provided
    if (promoCode) {
      const promoResult = await PromoCodeModel.validatePromoCode(promoCode, userId);
      if (promoResult.valid && promoResult.discount) {
        discount = promoResult.discount;
        finalAmount = amount - discount;
        promoCodeId = promoResult.promo_code_id;
      }
    }

    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: finalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: `event_${eventId}_${Date.now()}`,
      notes: {
        userId,
        eventId,
        type: 'event_registration',
        originalAmount: amount,
        discount,
        promoCode: promoCode || '',
      },
    });

    // Create payment record
    const payment = await PaymentModel.create({
      user_id: userId,
      event_id: eventId,
      order_id: order.id,
      amount: finalAmount,
      currency: 'INR',
      payment_type: 'event_registration',
      promo_code_id: promoCodeId,
      discount_amount: discount,
    });

    // Cache order details
    await this.cacheOrderDetails(order.id, {
      userId,
      eventId,
      amount: finalAmount,
      paymentId: payment.id,
    });

    return { order, payment, finalAmount };
  }

  /**
   * Create Razorpay order for doctor payment
   */
  static async createDoctorPaymentOrder(
    name: string,
    designation: string,
    amount: number,
    email?: string,
    phone?: string
  ): Promise<{ order: any; doctorRecord: any }> {
    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `doctor_${Date.now()}`,
      notes: {
        name,
        designation,
        type: 'doctor_payment',
        email: email || '',
        phone: phone || '',
      },
    });

    // Create doctor payment record
    const doctorRecord = await DoctorModel.create({
      name,
      designation,
      amount,
      payment_mode: 'online',
      razorpay_order_id: order.id,
      email,
      phone,
    });

    return { order, doctorRecord };
  }

  /**
   * Verify Razorpay payment signature
   */
  static verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );
  }

  /**
   * Handle successful event registration payment
   */
  static async handleEventPaymentSuccess(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<{ payment: Payment; registration: any }> {
    // Verify signature
    const isValid = this.verifyPaymentSignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });

    if (!isValid) {
      throw new AppError('Invalid payment signature', 400);
    }

    // Get cached order details
    const orderDetails = await this.getCachedOrderDetails(orderId);
    if (!orderDetails) {
      throw new AppError('Order details not found', 404);
    }

    // Update payment status
    const payment = await PaymentModel.updateStatus(
      orderId,
      'completed',
      paymentId,
      { signature }
    );

    // Update or create event registration
    let registration = await EventRegistrationModel.findByUserAndEvent(
      orderDetails.userId,
      orderDetails.eventId
    );

    if (registration) {
      registration = await EventRegistrationModel.updatePaymentStatus(
        registration.id,
        'completed',
        payment.id
      );
    } else {
      registration = await EventRegistrationModel.create({
        user_id: orderDetails.userId,
        event_id: orderDetails.eventId,
        payment_id: payment.id,
        payment_status: 'completed',
      });
    }

    // Record promo code usage if applicable
    if (payment.promo_code_id) {
      await PromoCodeModel.recordUsage(payment.promo_code_id, orderDetails.userId);
    }

    // Clear cache
    await this.clearCachedOrderDetails(orderId);

    return { payment, registration };
  }

  /**
   * Handle successful doctor payment
   */
  static async handleDoctorPaymentSuccess(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<any> {
    // Verify signature
    const isValid = this.verifyPaymentSignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });

    if (!isValid) {
      throw new AppError('Invalid payment signature', 400);
    }

    // Update doctor payment status
    const doctor = await DoctorModel.updatePaymentStatus(
      orderId,
      'completed',
      paymentId,
      { signature }
    );

    return doctor;
  }

  /**
   * Handle payment failure
   */
  static async handlePaymentFailure(
    orderId: string,
    reason?: string
  ): Promise<Payment> {
    const payment = await PaymentModel.updateStatus(orderId, 'failed', undefined, {
      failure_reason: reason,
    });

    // Clear cache
    await this.clearCachedOrderDetails(orderId);

    return payment;
  }

  /**
   * Process refund
   */
  static async processRefund(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ payment: Payment; refund: any }> {
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== 'completed') {
      throw new AppError('Cannot refund incomplete payment', 400);
    }

    if (!payment.razorpay_payment_id) {
      throw new AppError('Razorpay payment ID not found', 400);
    }

    // Create refund in Razorpay
    const refundAmount = amount || payment.amount;
    const refund = await razorpayInstance.payments.refund(payment.razorpay_payment_id, {
      amount: refundAmount * 100, // Convert to paise
      notes: {
        reason: reason || 'Refund requested',
      },
    });

    // Update payment record
    const updatedPayment = await PaymentModel.processRefund(
      paymentId,
      refundAmount,
      refund.id,
      reason
    );

    return { payment: updatedPayment, refund };
  }

  /**
   * Get payment details
   */
  static async getPaymentDetails(orderId: string): Promise<Payment> {
    const payment = await PaymentModel.findByOrderId(orderId);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }
    return payment;
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStatistics(filters?: {
    start_date?: Date;
    end_date?: Date;
    event_id?: string;
  }): Promise<any> {
    return await PaymentModel.getRevenueStats(filters);
  }

  /**
   * Verify payment status with Razorpay
   */
  static async verifyPaymentStatus(paymentId: string): Promise<any> {
    try {
      const payment = await razorpayInstance.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      throw new AppError('Failed to fetch payment details from Razorpay', 500);
    }
  }

  /**
   * Get order details from Razorpay
   */
  static async getOrderDetails(orderId: string): Promise<any> {
    try {
      const order = await razorpayInstance.orders.fetch(orderId);
      return order;
    } catch (error) {
      throw new AppError('Failed to fetch order details from Razorpay', 500);
    }
  }

  /**
   * Cache order details in Redis
   */
  private static async cacheOrderDetails(
    orderId: string,
    details: Record<string, any>
  ): Promise<void> {
    const key = `payment:order:${orderId}`;
    await redisClient.setex(key, 3600, JSON.stringify(details)); // Cache for 1 hour
  }

  /**
   * Get cached order details
   */
  private static async getCachedOrderDetails(
    orderId: string
  ): Promise<Record<string, any> | null> {
    const key = `payment:order:${orderId}`;
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Clear cached order details
   */
  private static async clearCachedOrderDetails(orderId: string): Promise<void> {
    const key = `payment:order:${orderId}`;
    await redisClient.del(key);
  }

  /**
   * Record cash payment for doctor
   */
  static async recordCashPayment(
    name: string,
    designation: string,
    amount: number,
    email?: string,
    phone?: string,
    receivedBy?: string
  ): Promise<any> {
    const doctor = await DoctorModel.create({
      name,
      designation,
      amount,
      payment_mode: 'cash',
      payment_status: 'completed',
      email,
      phone,
    });

    // Log cash payment
    await this.logCashPayment(doctor.id, amount, receivedBy);

    return doctor;
  }

  /**
   * Log cash payment
   */
  private static async logCashPayment(
    doctorId: string,
    amount: number,
    receivedBy?: string
  ): Promise<void> {
    const logKey = `payment:cash:${doctorId}`;
    const logData = {
      doctorId,
      amount,
      receivedBy: receivedBy || 'unknown',
      timestamp: new Date().toISOString(),
    };
    await redisClient.setex(logKey, 86400 * 30, JSON.stringify(logData)); // Keep for 30 days
  }

  /**
   * Generate payment receipt number
   */
  static async generateReceiptNumber(type: 'event' | 'doctor'): Promise<string> {
    const prefix = type === 'event' ? 'EVT' : 'DOC';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get counter from Redis
    const counterKey = `receipt:counter:${type}:${year}${month}`;
    const counter = await redisClient.incr(counterKey);
    
    // Set expiry for counter (end of month)
    if (counter === 1) {
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const ttl = Math.floor((endOfMonth.getTime() - date.getTime()) / 1000);
      await redisClient.expire(counterKey, ttl);
    }

    const receiptNumber = `${prefix}${year}${month}${counter.toString().padStart(6, '0')}`;
    return receiptNumber;
  }

  /**
   * Calculate discount amount
   */
  static calculateDiscount(
    amount: number,
    discountType: 'percentage' | 'fixed',
    discountValue: number
  ): number {
    if (discountType === 'percentage') {
      return Math.floor((amount * discountValue) / 100);
    }
    return Math.min(discountValue, amount);
  }

  /**
   * Validate payment amount
   */
  static validateAmount(amount: number, minAmount: number = 1): boolean {
    return amount >= minAmount && amount <= 10000000; // Max 1 crore
  }

  /**
   * Get payment history for user
   */
  static async getUserPaymentHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ payments: Payment[]; total: number }> {
    // This would need to be implemented in PaymentModel
    // For now, returning a placeholder
    return { payments: [], total: 0 };
  }
}

export default PaymentService;

// Made with Bob
