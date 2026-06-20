import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Event {
  id: string;
  name: string;
  category: 'sports' | 'cultural' | 'academic' | 'technical' | 'other';
  description?: string;
  start_date: Date;
  end_date: Date;
  location?: string;
  max_participants?: number;
  current_participants: number;
  registration_fee: number;
  is_active: boolean;
  image_url?: string;
  rules?: string;
  contact_info?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export class EventModel {
  static async create(eventData: {
    name: string;
    category: string;
    description?: string;
    start_date: Date;
    end_date: Date;
    location?: string;
    max_participants?: number;
    registration_fee: number;
    image_url?: string;
    rules?: string;
    contact_info?: string;
    created_by?: string;
  }): Promise<Event> {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO events (
        id, name, category, description, start_date, end_date, location,
        max_participants, registration_fee, image_url, rules, contact_info, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        id,
        eventData.name,
        eventData.category,
        eventData.description,
        eventData.start_date,
        eventData.end_date,
        eventData.location,
        eventData.max_participants,
        eventData.registration_fee,
        eventData.image_url,
        eventData.rules,
        eventData.contact_info,
        eventData.created_by
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<Event | null> {
    const result = await query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAll(filters?: {
    category?: string;
    search?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ events: Event[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.category) {
      whereClause += ` AND category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }

    if (filters?.is_active !== undefined) {
      whereClause += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    if (filters?.search) {
      whereClause += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM events ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    
    const result = await query(
      `SELECT * FROM events ${whereClause} 
       ORDER BY start_date ASC 
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return {
      events: result.rows,
      total
    };
  }

  static async update(id: string, updates: Partial<Event>): Promise<Event> {
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
      `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async incrementParticipants(id: string): Promise<Event> {
    const result = await query(
      `UPDATE events 
       SET current_participants = current_participants + 1, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async decrementParticipants(id: string): Promise<Event> {
    const result = await query(
      `UPDATE events 
       SET current_participants = GREATEST(current_participants - 1, 0), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async checkAvailability(id: string): Promise<boolean> {
    const result = await query(
      `SELECT 
        CASE 
          WHEN max_participants IS NULL THEN true
          WHEN current_participants < max_participants THEN true
          ELSE false
        END as available
       FROM events WHERE id = $1`,
      [id]
    );
    return result.rows[0]?.available || false;
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM events WHERE id = $1', [id]);
  }

  static async getEventStatistics(id: string): Promise<{
    total_registrations: number;
    paid_registrations: number;
    total_revenue: number;
  }> {
    const result = await query(
      `SELECT 
        COUNT(DISTINCT er.user_id) as total_registrations,
        COUNT(DISTINCT CASE WHEN er.payment_status = 'completed' THEN er.user_id END) as paid_registrations,
        COALESCE(SUM(CASE WHEN er.payment_status = 'completed' THEN er.amount_paid ELSE 0 END), 0) as total_revenue
       FROM event_registrations er
       WHERE er.event_id = $1`,
      [id]
    );
    return result.rows[0];
  }
}

export default EventModel;

// Made with Bob
