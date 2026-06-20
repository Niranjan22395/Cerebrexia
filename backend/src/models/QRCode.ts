import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface QRCode {
  id: string;
  user_id: string;
  event_id: string;
  qr_token: string;
  valid_date: Date;
  is_used: boolean;
  scanned_at?: Date;
  scanned_by?: string;
  scan_location?: string;
  created_at: Date;
}

export class QRCodeModel {
  static async create(qrData: {
    user_id: string;
    event_id: string;
    qr_token: string;
    valid_date: Date;
  }): Promise<QRCode> {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO qr_codes (id, user_id, event_id, qr_token, valid_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, qrData.user_id, qrData.event_id, qrData.qr_token, qrData.valid_date]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<QRCode | null> {
    const result = await query(
      'SELECT * FROM qr_codes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByToken(token: string, validDate: Date): Promise<QRCode | null> {
    const result = await query(
      'SELECT * FROM qr_codes WHERE qr_token = $1 AND valid_date = $2',
      [token, validDate]
    );
    return result.rows[0] || null;
  }

  static async findByUserAndDate(
    userId: string,
    eventId: string,
    validDate: Date
  ): Promise<QRCode | null> {
    const result = await query(
      'SELECT * FROM qr_codes WHERE user_id = $1 AND event_id = $2 AND valid_date = $3',
      [userId, eventId, validDate]
    );
    return result.rows[0] || null;
  }

  static async findByUserAndEvent(
    userId: string,
    eventId: string
  ): Promise<QRCode[]> {
    const result = await query(
      'SELECT * FROM qr_codes WHERE user_id = $1 AND event_id = $2 ORDER BY valid_date DESC',
      [userId, eventId]
    );
    return result.rows;
  }

  static async markAsUsed(
    id: string,
    scannedBy: string,
    scanLocation?: string
  ): Promise<QRCode> {
    const result = await query(
      `UPDATE qr_codes 
       SET is_used = true, scanned_at = NOW(), scanned_by = $1, scan_location = $2
       WHERE id = $3 AND is_used = false
       RETURNING *`,
      [scannedBy, scanLocation, id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('QR code already used or not found');
    }
    
    return result.rows[0];
  }

  static async isQRValid(token: string, validDate: Date): Promise<{
    valid: boolean;
    qrCode?: QRCode;
    reason?: string;
  }> {
    const qrCode = await this.findByToken(token, validDate);
    
    if (!qrCode) {
      return { valid: false, reason: 'QR code not found' };
    }
    
    if (qrCode.is_used) {
      return { valid: false, reason: 'QR code already used', qrCode };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const qrDate = new Date(qrCode.valid_date).toISOString().split('T')[0];
    
    if (qrDate !== today) {
      return { valid: false, reason: 'QR code not valid for today', qrCode };
    }
    
    return { valid: true, qrCode };
  }

  static async getTodayQRCodes(eventId?: string): Promise<QRCode[]> {
    const today = new Date().toISOString().split('T')[0];
    
    let queryText = 'SELECT * FROM qr_codes WHERE valid_date = $1';
    const values: any[] = [today];
    
    if (eventId) {
      queryText += ' AND event_id = $2';
      values.push(eventId);
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, values);
    return result.rows;
  }

  static async getScannedQRCodes(filters?: {
    event_id?: string;
    date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ qrCodes: QRCode[]; total: number }> {
    let whereClause = 'WHERE is_used = true';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.event_id) {
      whereClause += ` AND event_id = $${paramCount}`;
      values.push(filters.event_id);
      paramCount++;
    }

    if (filters?.date) {
      whereClause += ` AND valid_date = $${paramCount}`;
      values.push(filters.date);
      paramCount++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM qr_codes ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    
    const result = await query(
      `SELECT * FROM qr_codes ${whereClause} 
       ORDER BY scanned_at DESC 
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return {
      qrCodes: result.rows,
      total
    };
  }

  static async getQRStatistics(eventId?: string): Promise<{
    total_generated: number;
    total_scanned: number;
    scan_rate: number;
  }> {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    
    if (eventId) {
      whereClause += ' AND event_id = $1';
      values.push(eventId);
    }

    const result = await query(
      `SELECT 
        COUNT(*) as total_generated,
        COUNT(CASE WHEN is_used = true THEN 1 END) as total_scanned,
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(CASE WHEN is_used = true THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)
          ELSE 0
        END as scan_rate
       FROM qr_codes ${whereClause}`,
      values
    );
    return result.rows[0];
  }

  static async deleteOldQRCodes(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await query(
      'DELETE FROM qr_codes WHERE valid_date < $1',
      [cutoffDate]
    );
    return result.rowCount || 0;
  }

  static async getUserQRHistory(userId: string): Promise<QRCode[]> {
    const result = await query(
      `SELECT qr.*, e.name as event_name 
       FROM qr_codes qr
       JOIN events e ON qr.event_id = e.id
       WHERE qr.user_id = $1
       ORDER BY qr.valid_date DESC
       LIMIT 50`,
      [userId]
    );
    return result.rows;
  }
}

export default QRCodeModel;

// Made with Bob
