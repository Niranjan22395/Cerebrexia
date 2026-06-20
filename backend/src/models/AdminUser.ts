import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'super_admin' | 'finance_manager' | 'gate_staff' | 'verifier' | 'event_manager';
  is_active: boolean;
  last_login?: Date;
  login_attempts: number;
  locked_until?: Date;
  phone?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export class AdminUserModel {
  static async create(adminData: {
    email: string;
    name: string;
    password: string;
    role: AdminUser['role'];
    phone?: string;
    created_by?: string;
  }): Promise<Omit<AdminUser, 'password'>> {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    const result = await query(
      `INSERT INTO admin_users (
        id, email, name, password, role, phone, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, name, role, is_active, phone, created_at, updated_at`,
      [
        id,
        adminData.email,
        adminData.name,
        hashedPassword,
        adminData.role,
        adminData.phone,
        adminData.created_by
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<AdminUser | null> {
    const result = await query(
      'SELECT * FROM admin_users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<AdminUser | null> {
    const result = await query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async verifyPassword(email: string, password: string): Promise<{
    valid: boolean;
    admin?: Omit<AdminUser, 'password'>;
    reason?: string;
  }> {
    const admin = await this.findByEmail(email);

    if (!admin) {
      return { valid: false, reason: 'Invalid credentials' };
    }

    if (!admin.is_active) {
      return { valid: false, reason: 'Account is inactive' };
    }

    // Check if account is locked
    if (admin.locked_until && new Date() < new Date(admin.locked_until)) {
      return { valid: false, reason: 'Account is temporarily locked' };
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      // Increment login attempts
      await this.incrementLoginAttempts(admin.id);
      
      // Lock account after 5 failed attempts
      if (admin.login_attempts >= 4) {
        await this.lockAccount(admin.id, 30); // Lock for 30 minutes
        return { valid: false, reason: 'Account locked due to multiple failed attempts' };
      }

      return { valid: false, reason: 'Invalid credentials' };
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts(admin.id);
    await this.updateLastLogin(admin.id);

    const { password: _, ...adminWithoutPassword } = admin;
    return { valid: true, admin: adminWithoutPassword };
  }

  static async incrementLoginAttempts(id: string): Promise<void> {
    await query(
      'UPDATE admin_users SET login_attempts = login_attempts + 1 WHERE id = $1',
      [id]
    );
  }

  static async resetLoginAttempts(id: string): Promise<void> {
    await query(
      'UPDATE admin_users SET login_attempts = 0, locked_until = NULL WHERE id = $1',
      [id]
    );
  }

  static async lockAccount(id: string, minutes: number): Promise<void> {
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + minutes);
    
    await query(
      'UPDATE admin_users SET locked_until = $1 WHERE id = $2',
      [lockedUntil, id]
    );
  }

  static async updateLastLogin(id: string): Promise<void> {
    await query(
      'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
      [id]
    );
  }

  static async updatePassword(id: string, newPassword: string): Promise<void> {
    const password_hash = await bcrypt.hash(newPassword, 10);
    await query(
      'UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [password_hash, id]
    );
  }

  static async update(
    id: string,
    updates: Partial<Omit<AdminUser, 'password_hash'>>
  ): Promise<Omit<AdminUser, 'password_hash'>> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'password_hash') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE admin_users SET ${fields.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, email, name, role, is_active, phone, last_login, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async toggleActive(id: string, isActive: boolean): Promise<void> {
    await query(
      'UPDATE admin_users SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [isActive, id]
    );
  }

  static async findAll(filters?: {
    role?: string;
    is_active?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ admins: Omit<AdminUser, 'password_hash'>[]; total: number }> {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.role) {
      whereClause += ` AND role = $${paramCount}`;
      values.push(filters.role);
      paramCount++;
    }

    if (filters?.is_active !== undefined) {
      whereClause += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    if (filters?.search) {
      whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM admin_users ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    
    const result = await query(
      `SELECT id, email, name, role, is_active, phone, last_login, created_at, updated_at
       FROM admin_users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return {
      admins: result.rows,
      total
    };
  }

  static async getAdminStatistics(): Promise<{
    total_admins: number;
    active_admins: number;
    by_role: Record<string, number>;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_admins,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_admins,
        COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
        COUNT(CASE WHEN role = 'finance_manager' THEN 1 END) as finance_managers,
        COUNT(CASE WHEN role = 'gate_staff' THEN 1 END) as gate_staff,
        COUNT(CASE WHEN role = 'verifier' THEN 1 END) as verifiers,
        COUNT(CASE WHEN role = 'event_manager' THEN 1 END) as event_managers
       FROM admin_users`,
      []
    );

    const stats = result.rows[0];
    return {
      total_admins: parseInt(stats.total_admins),
      active_admins: parseInt(stats.active_admins),
      by_role: {
        super_admin: parseInt(stats.super_admins),
        finance_manager: parseInt(stats.finance_managers),
        gate_staff: parseInt(stats.gate_staff),
        verifier: parseInt(stats.verifiers),
        event_manager: parseInt(stats.event_managers)
      }
    };
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM admin_users WHERE id = $1', [id]);
  }

  static async hasPermission(
    adminId: string,
    requiredRole: AdminUser['role'] | AdminUser['role'][]
  ): Promise<boolean> {
    const admin = await this.findById(adminId);
    if (!admin || !admin.is_active) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Super admin has all permissions
    if (admin.role === 'super_admin') return true;
    
    return roles.includes(admin.role);
  }
}

export default AdminUserModel;

// Made with Bob
