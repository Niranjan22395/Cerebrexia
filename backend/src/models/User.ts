import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  college_name?: string;
  phone?: string;
  profile_completed: boolean;
  college_id_proof_url?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  verified_by?: string;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async create(userData: {
    google_id: string;
    email: string;
    name: string;
  }): Promise<User> {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO users (id, google_id, email, name, profile_completed, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, userData.google_id, userData.email, userData.name, false, 'pending']
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findByGoogleId(googleId: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    return result.rows[0] || null;
  }

  static async update(id: string, updates: Partial<User>): Promise<User> {
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
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async completeProfile(
    id: string,
    profileData: {
      college_name: string;
      phone: string;
    }
  ): Promise<User> {
    const result = await query(
      `UPDATE users 
       SET college_name = $1, phone = $2, profile_completed = true, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [profileData.college_name, profileData.phone, id]
    );
    return result.rows[0];
  }

  static async uploadCollegeId(id: string, fileUrl: string): Promise<User> {
    const result = await query(
      `UPDATE users 
       SET college_id_proof_url = $1, verification_status = 'pending', updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [fileUrl, id]
    );
    return result.rows[0];
  }

  static async updateVerificationStatus(
    id: string,
    status: 'verified' | 'rejected',
    notes: string,
    verifiedBy: string
  ): Promise<User> {
    const result = await query(
      `UPDATE users 
       SET verification_status = $1, verification_notes = $2, 
           verified_by = $3, verified_at = NOW(), updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, notes, verifiedBy, id]
    );
    return result.rows[0];
  }

  static async findAll(filters?: {
    verification_status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ users: User[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.verification_status) {
      whereClause += ` AND verification_status = $${paramCount}`;
      values.push(filters.verification_status);
      paramCount++;
    }

    if (filters?.search) {
      whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR college_name ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    
    const result = await query(
      `SELECT * FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return {
      users: result.rows,
      total
    };
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM users WHERE id = $1', [id]);
  }
}

export default UserModel;

// Made with Bob
