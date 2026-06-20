import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Payment {
  id: string;
  user_id?: string;
  event_registration_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled';
  payment_method?: string;
  payment_method_details?: any;
  error_code?: string;
  error_description?: string;
  refund_amount?: number;
  refund_reason?: string;
  refunded_at?: Date;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export class PaymentModel {
  static async create(paymentData: {
    user_id?: string;
    event_registration_id?: string;
    razorpay_order_id: string;
    amount: number;
    currency?: string;
    metadata?: any;
  }): Promise<Payment> {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO payments (
        id, user_id, event_registration_id, razorpay_order_id, 
        amount, currency, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        id,
        paymentData.user_id,
        paymentData.event_registration_id,
        paymentData.razorpay_order_id,
        paymentData.amount,
        paymentData.currency || 'INR',
        'created',
        paymentData.metadata ? JSON.stringify(paymentData.metadata) : null
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<Payment | null> {
    const result = await query(
      'SELECT * FROM payments WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByOrderId(orderId: string): Promise<Payment | null> {
    const result = await query(
      'SELECT * FROM payments WHERE razorpay_order_id = $1',
      [orderId]
    );
    return result.rows[0] || null;
  }

  static async findByPaymentId(paymentId: string): Promise<Payment | null> {
    const result = await query(
      'SELECT * FROM payments WHERE razorpay_payment_id = $1',
      [paymentId]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<Payment[]> {
    const result = await query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async update(id: string, updates: Partial<Payment>): Promise<Payment> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        if (key === 'payment_method_details' || key === 'metadata') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE payments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async updateStatus(
    orderId: string,
    status: Payment['status'],
    paymentId?: string,
    signature?: string
  ): Promise<Payment> {
    const result = await query(
      `UPDATE payments 
       SET status = $1, razorpay_payment_id = $2, razorpay_signature = $3, updated_at = NOW()
       WHERE razorpay_order_id = $4
       RETURNING *`,
      [status, paymentId, signature, orderId]
    );
    return result.rows[0];
  }

  static async markAsFailed(
    orderId: string,
    errorCode: string,
    errorDescription: string
  ): Promise<Payment> {
    const result = await query(
      `UPDATE payments 
       SET status = 'failed', error_code = $1, error_description = $2, updated_at = NOW()
       WHERE razorpay_order_id = $3
       RETURNING *`,
      [errorCode, errorDescription, orderId]
    );
    return result.rows[0];
  }

  static async processRefund(
    id: string,
    refundAmount: number,
    refundReason: string
  ): Promise<Payment> {
    const result = await query(
      `UPDATE payments 
       SET status = 'refunded', refund_amount = $1, refund_reason = $2, 
           refunded_at = NOW(), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [refundAmount, refundReason, id]
    );
    return result.rows[0];
  }

  static async findAll(filters?: {
    status?: string;
    user_id?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ payments: Payment[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      whereClause += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters?.user_id) {
      whereClause += ` AND user_id = $${paramCount}`;
      values.push(filters.user_id);
      paramCount++;
    }

    if (filters?.start_date) {
      whereClause += ` AND created_at >= $${paramCount}`;
      values.push(filters.start_date);
      paramCount++;
    }

    if (filters?.end_date) {
      whereClause += ` AND created_at <= $${paramCount}`;
      values.push(filters.end_date);
      paramCount++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM payments ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    
    const result = await query(
      `SELECT * FROM payments ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return {
      payments: result.rows,
      total
    };
  }

  static async getRevenueStats(filters?: {
    start_date?: Date;
    end_date?: Date;
  }): Promise<{
    total_revenue: number;
    successful_payments: number;
    failed_payments: number;
    refunded_amount: number;
  }> {
    let whereClause = "WHERE status = 'captured'";
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.start_date) {
      whereClause += ` AND created_at >= $${paramCount}`;
      values.push(filters.start_date);
      paramCount++;
    }

    if (filters?.end_date) {
      whereClause += ` AND created_at <= $${paramCount}`;
      values.push(filters.end_date);
      paramCount++;
    }

    const result = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN status = 'captured' THEN amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN status = 'captured' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        COALESCE(SUM(CASE WHEN status = 'refunded' THEN refund_amount ELSE 0 END), 0) as refunded_amount
       FROM payments
       WHERE created_at >= COALESCE($1, '1970-01-01'::date)
       AND created_at <= COALESCE($2, NOW())`,
      [filters?.start_date, filters?.end_date]
    );
    return result.rows[0];
  }
}

export default PaymentModel;

// Made with Bob
