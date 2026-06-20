import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number;
  current_uses: number;
  max_uses_per_user: number;
  valid_from: Date;
  valid_until: Date;
  is_active: boolean;
  applicable_events?: string[];
  minimum_amount: number;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export class PromoCodeModel {
  static async create(promoData: {
    code: string;
    description?: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_uses?: number;
    max_uses_per_user?: number;
    valid_from: Date;
    valid_until: Date;
    applicable_events?: string[];
    minimum_amount?: number;
    created_by?: string;
  }): Promise<PromoCode> {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO promo_codes (
        id, code, description, discount_type, discount_value, max_uses,
        max_uses_per_user, valid_from, valid_until, applicable_events,
        minimum_amount, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        id,
        promoData.code.toUpperCase(),
        promoData.description,
        promoData.discount_type,
        promoData.discount_value,
        promoData.max_uses || 1000,
        promoData.max_uses_per_user || 1,
        promoData.valid_from,
        promoData.valid_until,
        promoData.applicable_events,
        promoData.minimum_amount || 0,
        promoData.created_by
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<PromoCode | null> {
    const result = await query(
      'SELECT * FROM promo_codes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByCode(code: string): Promise<PromoCode | null> {
    const result = await query(
      'SELECT * FROM promo_codes WHERE code = $1',
      [code.toUpperCase()]
    );
    return result.rows[0] || null;
  }

  static async validatePromoCode(
    code: string,
    userId: string,
    amount: number,
    eventId?: string
  ): Promise<{
    valid: boolean;
    promoCode?: PromoCode;
    reason?: string;
    discountAmount?: number;
  }> {
    const promoCode = await this.findByCode(code);

    if (!promoCode) {
      return { valid: false, reason: 'Invalid promo code' };
    }

    if (!promoCode.is_active) {
      return { valid: false, reason: 'Promo code is inactive' };
    }

    const now = new Date();
    if (now < new Date(promoCode.valid_from)) {
      return { valid: false, reason: 'Promo code not yet valid' };
    }

    if (now > new Date(promoCode.valid_until)) {
      return { valid: false, reason: 'Promo code has expired' };
    }

    if (promoCode.current_uses >= promoCode.max_uses) {
      return { valid: false, reason: 'Promo code usage limit reached' };
    }

    if (amount < promoCode.minimum_amount) {
      return {
        valid: false,
        reason: `Minimum amount of ₹${promoCode.minimum_amount} required`
      };
    }

    // Check if promo is applicable to specific events
    if (eventId && promoCode.applicable_events && promoCode.applicable_events.length > 0) {
      if (!promoCode.applicable_events.includes(eventId)) {
        return { valid: false, reason: 'Promo code not applicable to this event' };
      }
    }

    // Check user-specific usage
    const userUsage = await this.getUserUsageCount(promoCode.id, userId);
    if (userUsage >= promoCode.max_uses_per_user) {
      return { valid: false, reason: 'You have already used this promo code' };
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.discount_type === 'percentage') {
      discountAmount = (amount * promoCode.discount_value) / 100;
    } else {
      discountAmount = Math.min(promoCode.discount_value, amount);
    }

    return {
      valid: true,
      promoCode,
      discountAmount
    };
  }

  static async getUserUsageCount(promoCodeId: string, userId: string): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) FROM promo_usage WHERE promo_code_id = $1 AND user_id = $2',
      [promoCodeId, userId]
    );
    return parseInt(result.rows[0].count);
  }

  static async recordUsage(
    promoCodeId: string,
    userId: string,
    eventRegistrationId: string,
    discountApplied: number
  ): Promise<void> {
    const usageId = uuidv4();
    
    // Record usage
    await query(
      `INSERT INTO promo_usage (id, promo_code_id, user_id, event_registration_id, discount_applied)
       VALUES ($1, $2, $3, $4, $5)`,
      [usageId, promoCodeId, userId, eventRegistrationId, discountApplied]
    );

    // Increment usage count
    await query(
      'UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = $1',
      [promoCodeId]
    );
  }

  static async update(id: string, updates: Partial<PromoCode>): Promise<PromoCode> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        if (key === 'code') {
          fields.push(`${key} = $${paramCount}`);
          values.push(value.toUpperCase());
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
      `UPDATE promo_codes SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async toggleActive(id: string, isActive: boolean): Promise<PromoCode> {
    const result = await query(
      'UPDATE promo_codes SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    return result.rows[0];
  }

  static async findAll(filters?: {
    is_active?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ promoCodes: PromoCode[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.is_active !== undefined) {
      whereClause += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    if (filters?.search) {
      whereClause += ` AND (code ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM promo_codes ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    
    const result = await query(
      `SELECT * FROM promo_codes ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return {
      promoCodes: result.rows,
      total
    };
  }

  static async getActivePromoCodesCount(): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) FROM promo_codes WHERE is_active = true',
      []
    );
    return parseInt(result.rows[0].count);
  }

  static async getPromoCodeStatistics(id: string): Promise<{
    total_uses: number;
    unique_users: number;
    total_discount_given: number;
    usage_rate: number;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_uses,
        COUNT(DISTINCT user_id) as unique_users,
        COALESCE(SUM(discount_applied), 0) as total_discount_given
       FROM promo_usage
       WHERE promo_code_id = $1`,
      [id]
    );

    const promoCode = await this.findById(id);
    const usageRate = promoCode 
      ? (result.rows[0].total_uses / promoCode.max_uses) * 100 
      : 0;

    return {
      ...result.rows[0],
      usage_rate: Math.round(usageRate * 100) / 100
    };
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM promo_codes WHERE id = $1', [id]);
  }

  static async bulkCreate(promoCodes: Array<{
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    valid_from: Date;
    valid_until: Date;
  }>): Promise<PromoCode[]> {
    const createdCodes: PromoCode[] = [];
    
    for (const promoData of promoCodes) {
      const code = await this.create(promoData);
      createdCodes.push(code);
    }
    
    return createdCodes;
  }
}

export default PromoCodeModel;

// Made with Bob
