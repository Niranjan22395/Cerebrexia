import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  registration_date: Date;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_id?: string;
  amount_paid?: number;
  promo_code_id?: string;
  discount_applied: number;
  participation_status: 'registered' | 'attended' | 'absent' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export class EventRegistrationModel {
  static async create(registrationData: {
    user_id: string;
    event_id: string;
    amount_paid?: number;
    promo_code_id?: string;
    discount_applied?: number;
  }): Promise<EventRegistration> {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO event_registrations (
        id, user_id, event_id, amount_paid, promo_code_id, discount_applied
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        id,
        registrationData.user_id,
        registrationData.event_id,
        registrationData.amount_paid,
        registrationData.promo_code_id,
        registrationData.discount_applied || 0
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<EventRegistration | null> {
    const result = await query(
      'SELECT * FROM event_registrations WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUserAndEvent(
    userId: string,
    eventId: string
  ): Promise<EventRegistration | null> {
    const result = await query(
      'SELECT * FROM event_registrations WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );
    return result.rows[0] || null;
  }

  static async isUserRegistered(userId: string, eventId: string): Promise<boolean> {
    const result = await query(
      'SELECT EXISTS(SELECT 1 FROM event_registrations WHERE user_id = $1 AND event_id = $2) as exists',
      [userId, eventId]
    );
    return result.rows[0].exists;
  }

  static async findByUserId(userId: string): Promise<EventRegistration[]> {
    const result = await query(
      `SELECT er.*, e.name as event_name, e.start_date, e.end_date, e.location
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE er.user_id = $1
       ORDER BY er.registration_date DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findByEventId(eventId: string): Promise<EventRegistration[]> {
    const result = await query(
      `SELECT er.*, u.name as user_name, u.email, u.college_name
       FROM event_registrations er
       JOIN users u ON er.user_id = u.id
       WHERE er.event_id = $1
       ORDER BY er.registration_date DESC`,
      [eventId]
    );
    return result.rows;
  }

  static async updatePaymentStatus(
    id: string,
    paymentStatus: EventRegistration['payment_status'],
    paymentId?: string
  ): Promise<EventRegistration> {
    const result = await query(
      `UPDATE event_registrations 
       SET payment_status = $1, payment_id = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [paymentStatus, paymentId, id]
    );
    return result.rows[0];
  }

  static async updateParticipationStatus(
    id: string,
    participationStatus: EventRegistration['participation_status']
  ): Promise<EventRegistration> {
    const result = await query(
      `UPDATE event_registrations 
       SET participation_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [participationStatus, id]
    );
    return result.rows[0];
  }

  static async cancelRegistration(id: string): Promise<EventRegistration> {
    const result = await query(
      `UPDATE event_registrations 
       SET participation_status = 'cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async findAll(filters?: {
    payment_status?: string;
    participation_status?: string;
    event_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ registrations: EventRegistration[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.payment_status) {
      whereClause += ` AND payment_status = $${paramCount}`;
      values.push(filters.payment_status);
      paramCount++;
    }

    if (filters?.participation_status) {
      whereClause += ` AND participation_status = $${paramCount}`;
      values.push(filters.participation_status);
      paramCount++;
    }

    if (filters?.event_id) {
      whereClause += ` AND event_id = $${paramCount}`;
      values.push(filters.event_id);
      paramCount++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM event_registrations ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    
    const result = await query(
      `SELECT er.*, u.name as user_name, u.email, e.name as event_name
       FROM event_registrations er
       JOIN users u ON er.user_id = u.id
       JOIN events e ON er.event_id = e.id
       ${whereClause} 
       ORDER BY er.registration_date DESC 
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return {
      registrations: result.rows,
      total
    };
  }

  static async getRegistrationStatistics(eventId?: string): Promise<{
    total_registrations: number;
    paid_registrations: number;
    pending_payments: number;
    attended: number;
    total_revenue: number;
  }> {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    
    if (eventId) {
      whereClause += ' AND event_id = $1';
      values.push(eventId);
    }

    const result = await query(
      `SELECT 
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as paid_registrations,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN participation_status = 'attended' THEN 1 END) as attended,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount_paid ELSE 0 END), 0) as total_revenue
       FROM event_registrations ${whereClause}`,
      values
    );
    return result.rows[0];
  }

  static async getUserRegistrationCount(userId: string): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) FROM event_registrations WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  static async getUpcomingRegistrations(userId: string): Promise<EventRegistration[]> {
    const result = await query(
      `SELECT er.*, e.name as event_name, e.start_date, e.end_date, e.location
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE er.user_id = $1 
       AND e.start_date >= CURRENT_DATE
       AND er.participation_status != 'cancelled'
       ORDER BY e.start_date ASC`,
      [userId]
    );
    return result.rows;
  }

  static async getPastRegistrations(userId: string): Promise<EventRegistration[]> {
    const result = await query(
      `SELECT er.*, e.name as event_name, e.start_date, e.end_date, e.location
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE er.user_id = $1 
       AND e.end_date < CURRENT_DATE
       ORDER BY e.end_date DESC`,
      [userId]
    );
    return result.rows;
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM event_registrations WHERE id = $1', [id]);
  }
}

export default EventRegistrationModel;

// Made with Bob
