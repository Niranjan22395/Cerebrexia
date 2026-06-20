import crypto from 'crypto';
import QRCodeModel, { QRCode } from '../models/QRCode';
import UserModel from '../models/User';
import EventRegistrationModel from '../models/EventRegistration';
import { AppError } from '../middleware/errorHandler';
import { redisClient } from '../config/redis';

const QR_SECRET = process.env.QR_SECRET || 'your-qr-secret-change-in-production';
const QR_ALGORITHM = 'sha256';

export interface QRCodeData {
  userId: string;
  eventId: string;
  date: string; // YYYY-MM-DD format
  registrationId: string;
}

export interface QRValidationResult {
  valid: boolean;
  reason?: string;
  qrCode?: QRCode;
  userName?: string;
  eventName?: string;
}

export class QRService {
  /**
   * Generate HMAC signature for QR code data
   */
  static generateSignature(data: QRCodeData): string {
    const payload = `${data.userId}:${data.eventId}:${data.date}:${data.registrationId}`;
    return crypto
      .createHmac(QR_ALGORITHM, QR_SECRET)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  static verifySignature(data: QRCodeData, signature: string): boolean {
    const expectedSignature = this.generateSignature(data);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Generate QR token (base64 encoded data + signature)
   */
  static generateQRToken(data: QRCodeData): string {
    const signature = this.generateSignature(data);
    const payload = {
      ...data,
      signature,
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Parse QR token
   */
  static parseQRToken(token: string): QRCodeData & { signature: string } {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      throw new AppError('Invalid QR code format', 400);
    }
  }

  /**
   * Generate daily QR code for user registration
   */
  static async generateDailyQRCode(
    userId: string,
    eventId: string,
    registrationId: string
  ): Promise<{ qrCode: QRCode; token: string }> {
    // Get current date in IST (India Standard Time)
    const today = new Date();
    const istDate = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const dateString = istDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if QR already exists for today
    const existingQR = await QRCodeModel.findByUserAndDate(userId, dateString);
    if (existingQR && !existingQR.is_used) {
      // Return existing valid QR
      const data: QRCodeData = {
        userId: existingQR.user_id,
        eventId: existingQR.event_id,
        date: existingQR.valid_date,
        registrationId: existingQR.registration_id,
      };
      const token = this.generateQRToken(data);
      return { qrCode: existingQR, token };
    }

    // Generate new QR code
    const data: QRCodeData = {
      userId,
      eventId,
      date: dateString,
      registrationId,
    };

    const token = this.generateQRToken(data);

    const qrCode = await QRCodeModel.create({
      user_id: userId,
      event_id: eventId,
      registration_id: registrationId,
      qr_token: token,
      valid_date: dateString,
    });

    // Cache QR code in Redis for fast validation
    await this.cacheQRCode(token, qrCode);

    return { qrCode, token };
  }

  /**
   * Validate QR code at entry gate
   */
  static async validateQRCode(token: string): Promise<QRValidationResult> {
    try {
      // Parse token
      const data = this.parseQRToken(token);

      // Verify signature
      if (!this.verifySignature(data, data.signature)) {
        return {
          valid: false,
          reason: 'Invalid QR code signature',
        };
      }

      // Check current date
      const today = new Date();
      const istDate = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const currentDate = istDate.toISOString().split('T')[0];

      if (data.date !== currentDate) {
        return {
          valid: false,
          reason: 'QR code is not valid for today',
        };
      }

      // Check cache first
      const cachedQR = await this.getCachedQRCode(token);
      if (cachedQR) {
        if (cachedQR.is_used) {
          return {
            valid: false,
            reason: 'QR code has already been used',
            qrCode: cachedQR,
          };
        }
      }

      // Get QR code from database
      const qrCode = await QRCodeModel.findByToken(token);
      if (!qrCode) {
        return {
          valid: false,
          reason: 'QR code not found',
        };
      }

      // Check if already used
      if (qrCode.is_used) {
        return {
          valid: false,
          reason: 'QR code has already been used',
          qrCode,
        };
      }

      // Check if valid for today
      if (qrCode.valid_date !== currentDate) {
        return {
          valid: false,
          reason: 'QR code is not valid for today',
          qrCode,
        };
      }

      // Get user and event details
      const user = await UserModel.findById(qrCode.user_id);
      const registration = await EventRegistrationModel.findById(qrCode.registration_id);

      return {
        valid: true,
        qrCode,
        userName: user?.name,
        eventName: registration?.event_id, // You might want to fetch event name
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      return {
        valid: false,
        reason: 'Failed to validate QR code',
      };
    }
  }

  /**
   * Mark QR code as used (scan at entry)
   */
  static async markQRAsUsed(token: string, scannedBy?: string): Promise<QRCode> {
    const validation = await this.validateQRCode(token);

    if (!validation.valid) {
      throw new AppError(validation.reason || 'Invalid QR code', 400);
    }

    const qrCode = await QRCodeModel.markAsUsed(token, scannedBy);

    // Update cache
    await this.cacheQRCode(token, qrCode);

    // Log scan event
    await this.logScanEvent(qrCode, scannedBy);

    return qrCode;
  }

  /**
   * Cache QR code in Redis
   */
  private static async cacheQRCode(token: string, qrCode: QRCode): Promise<void> {
    const key = `qr:${token}`;
    // Cache for 24 hours
    await redisClient.setex(key, 86400, JSON.stringify(qrCode));
  }

  /**
   * Get cached QR code from Redis
   */
  private static async getCachedQRCode(token: string): Promise<QRCode | null> {
    const key = `qr:${token}`;
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Log scan event
   */
  private static async logScanEvent(qrCode: QRCode, scannedBy?: string): Promise<void> {
    const logKey = `qr:scan:${qrCode.id}`;
    const logData = {
      qrCodeId: qrCode.id,
      userId: qrCode.user_id,
      eventId: qrCode.event_id,
      scannedAt: new Date().toISOString(),
      scannedBy: scannedBy || 'unknown',
    };
    await redisClient.setex(logKey, 86400 * 7, JSON.stringify(logData)); // Keep for 7 days
  }

  /**
   * Get QR code statistics
   */
  static async getQRStatistics(eventId?: string): Promise<{
    total_generated: number;
    total_used: number;
    usage_rate: number;
    today_generated: number;
    today_used: number;
  }> {
    return await QRCodeModel.getQRStatistics(eventId);
  }

  /**
   * Regenerate QR code (in case of issues)
   */
  static async regenerateQRCode(
    userId: string,
    eventId: string,
    registrationId: string
  ): Promise<{ qrCode: QRCode; token: string }> {
    // Invalidate old QR codes for today
    const today = new Date();
    const istDate = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const dateString = istDate.toISOString().split('T')[0];

    const existingQR = await QRCodeModel.findByUserAndDate(userId, dateString);
    if (existingQR && !existingQR.is_used) {
      // Mark old QR as used to invalidate it
      await QRCodeModel.markAsUsed(existingQR.qr_token, 'system_regenerate');
    }

    // Generate new QR code
    return await this.generateDailyQRCode(userId, eventId, registrationId);
  }

  /**
   * Bulk generate QR codes for multiple users
   */
  static async bulkGenerateQRCodes(
    registrations: Array<{ userId: string; eventId: string; registrationId: string }>
  ): Promise<Array<{ userId: string; token: string; qrCode: QRCode }>> {
    const results = [];

    for (const reg of registrations) {
      try {
        const { qrCode, token } = await this.generateDailyQRCode(
          reg.userId,
          reg.eventId,
          reg.registrationId
        );
        results.push({
          userId: reg.userId,
          token,
          qrCode,
        });
      } catch (error) {
        console.error(`Failed to generate QR for user ${reg.userId}:`, error);
      }
    }

    return results;
  }

  /**
   * Get QR code details
   */
  static async getQRCodeDetails(token: string): Promise<{
    qrCode: QRCode;
    user: any;
    event: any;
    registration: any;
  }> {
    const qrCode = await QRCodeModel.findByToken(token);
    if (!qrCode) {
      throw new AppError('QR code not found', 404);
    }

    const user = await UserModel.findById(qrCode.user_id);
    const registration = await EventRegistrationModel.findById(qrCode.registration_id);

    return {
      qrCode,
      user,
      event: null, // You'll need to fetch event details
      registration,
    };
  }

  /**
   * Check if user can enter event
   */
  static async canUserEnter(userId: string, eventId: string): Promise<{
    canEnter: boolean;
    reason?: string;
    hasValidQR: boolean;
  }> {
    // Check if user has valid registration
    const registration = await EventRegistrationModel.findByUserAndEvent(userId, eventId);
    if (!registration) {
      return {
        canEnter: false,
        reason: 'No registration found',
        hasValidQR: false,
      };
    }

    if (registration.payment_status !== 'completed') {
      return {
        canEnter: false,
        reason: 'Payment not completed',
        hasValidQR: false,
      };
    }

    // Check if user has valid QR for today
    const today = new Date();
    const istDate = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const dateString = istDate.toISOString().split('T')[0];

    const qrCode = await QRCodeModel.findByUserAndDate(userId, dateString);
    if (!qrCode) {
      return {
        canEnter: false,
        reason: 'No QR code generated for today',
        hasValidQR: false,
      };
    }

    if (qrCode.is_used) {
      return {
        canEnter: false,
        reason: 'QR code already used',
        hasValidQR: false,
      };
    }

    return {
      canEnter: true,
      hasValidQR: true,
    };
  }
}

export default QRService;

// Made with Bob
