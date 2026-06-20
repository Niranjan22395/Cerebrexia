import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Doctor {
  id: string;
  name: string;
  designation?: string;
  email?: string;
  phone?: string;
  payment_amount: number;
  payment_mode: 'cash' | 'online';
  payment_status: 'pending' | 'completed' | 'failed';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  receipt_number?: string;
  receipt_sent: boolean;
  receipt_sent_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export class DoctorModel {
  static async create(doctorData: {
    name: string;
    designation?: string;
    email?: string;
    phone?: string;
    payment_amount: number;
    payment_mode: 'cash' | 'online';
    notes?: string;
  }): Promise<Doctor> {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO doctors (
        id, name, designation, email, phone, payment_amount, payment_mode, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        id,
        doctorData.name,
        doctorData.designation,
        doctorData.email,
        doctorData.phone,
        doctorData.payment_amount,
        doctorData.payment_mode,
        doctorData.notes
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<Doctor | null> {
    const result = await query(
      'SELECT * FROM doctors WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<Doctor[]> {
    const result = await query(
      'SELECT * FROM doctors WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );
    return result.rows;
  }

  static async findByReceiptNumber(receiptNumber: string): Promise<Doctor | null> {
    const result = await query(
      'SELECT * FROM doctors WHERE receipt_number = $1',
      [receiptNumber]
    );
    return result.rows[0] || null;
  }

  static async updatePaymentStatus(
    id: string,
    paymentStatus: Doctor['payment_status'],
    razorpayOrderId?: string,
    razorpayPaymentId?: string
  ): Promise<Doctor> {
    const result = await query(
      `UPDATE doctors 
       SET payment_status = $1, razorpay_order_id = $2, razorpay_payment_id = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [paymentStatus, razorpayOrderId, razorpayPaymentId, id]
    );
    return result.rows[0];
  }

  static async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await query(
      `SELECT COUNT(*) FROM doctors WHERE EXTRACT(YEAR FROM created_at) = $1`,
      [year]
    );
    const count = parseInt(result.rows[0].count) + 1;
    return `RCP-${year}-${String(count).padStart(4, '0')}`;
  }

  static async markReceiptSent(id: string, receiptNumber: string): Promise<Doctor> {
    const result = await query(
      `UPDATE doctors 
       SET receipt_sent = true, receipt_sent_at = NOW(), receipt_number = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [receiptNumber, id]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Doctor>): Promise<Doctor> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE doctors SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async findAll(filters?: {
    payment_status?: string;
    payment_mode?: string;
    search?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ doctors: Doctor[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.payment_status) {
      whereClause += ` AND payment_status = $${paramCount}`;
      values.push(filters.payment_status);
      paramCount++;
    }

    if (filters?.payment_mode) {
      whereClause += ` AND payment_mode = $${paramCount}`;
      values.push(filters.payment_mode);
      paramCount++;
    }

    if (filters?.search) {
      whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR designation ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
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
      `SELECT COUNT(*) FROM doctors ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    
    const result = await query(
      `SELECT * FROM doctors ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return {
      doctors: result.rows,
      total
    };
  }

  static async getDoctorStatistics(filters?: {
    start_date?: Date;
    end_date?: Date;
  }): Promise<{
    total_doctors: number;
    completed_payments: number;
    pending_payments: number;
    cash_payments: number;
    online_payments: number;
    total_revenue: number;
    cash_revenue: number;
    online_revenue: number;
  }> {
    let whereClause = 'WHERE 1=1';
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
        COUNT(*) as total_doctors,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN payment_mode = 'cash' THEN 1 END) as cash_payments,
        COUNT(CASE WHEN payment_mode = 'online' THEN 1 END) as online_payments,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN payment_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN payment_mode = 'cash' AND payment_status = 'completed' THEN payment_amount ELSE 0 END), 0) as cash_revenue,
        COALESCE(SUM(CASE WHEN payment_mode = 'online' AND payment_status = 'completed' THEN payment_amount ELSE 0 END), 0) as online_revenue
       FROM doctors ${whereClause}`,
      values
    );
    return result.rows[0];
  }

  static async getPendingReceipts(): Promise<Doctor[]> {
    const result = await query(
      `SELECT * FROM doctors 
       WHERE payment_status = 'completed' AND receipt_sent = false
       ORDER BY created_at ASC`,
      []
    );
    return result.rows;
  }

  static async getTodayDoctors(): Promise<Doctor[]> {
    const result = await query(
      `SELECT * FROM doctors 
       WHERE DATE(created_at) = CURRENT_DATE
       ORDER BY created_at DESC`,
      []
    );
    return result.rows;
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM doctors WHERE id = $1', [id]);
  }
}

export default DoctorModel;

// Made with Bob
