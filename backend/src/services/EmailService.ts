import nodemailer from 'nodemailer';
import { AppError } from '../middleware/errorHandler';
import { redisClient } from '../config/redis';
import logger from '../utils/logger';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@cerebrexia.com';
const FROM_NAME = process.env.FROM_NAME || 'Cerebrexia Events';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cerebrexia.com';
const FINANCE_EMAIL = process.env.FINANCE_EMAIL || 'finance@cerebrexia.com';

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

export interface RegistrationEmailData {
  userName: string;
  eventName: string;
  eventDate: string;
  amount: number;
  orderId: string;
  qrCodeUrl?: string;
}

export interface ReminderEmailData {
  userName: string;
  eventName: string;
  eventDate: string;
  registrationLink: string;
  offers?: string[];
}

export interface DoctorReceiptData {
  doctorName: string;
  designation: string;
  amount: number;
  receiptNumber: string;
  paymentDate: string;
  paymentMode: string;
}

export class EmailService {
  /**
   * Send email
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);

      // Log email in Redis
      await this.logEmail(options.to, options.subject, 'sent');
    } catch (error) {
      logger.error('Failed to send email:', error);
      await this.logEmail(options.to, options.subject, 'failed');
      throw new AppError('Failed to send email', 500);
    }
  }

  /**
   * Send registration confirmation email
   */
  static async sendRegistrationConfirmation(
    email: string,
    data: RegistrationEmailData
  ): Promise<void> {
    const html = this.getRegistrationConfirmationTemplate(data);
    
    await this.sendEmail({
      to: email,
      subject: `Registration Confirmed - ${data.eventName}`,
      html,
    });

    // Send copy to admin
    await this.sendAdminNotification(
      'New Registration',
      `${data.userName} registered for ${data.eventName}. Amount: ₹${data.amount}`
    );
  }

  /**
   * Send visitor reminder email
   */
  static async sendVisitorReminder(
    email: string,
    data: ReminderEmailData
  ): Promise<void> {
    const html = this.getVisitorReminderTemplate(data);
    
    await this.sendEmail({
      to: email,
      subject: `Don't Miss Out - ${data.eventName} at Cerebrexia`,
      html,
    });
  }

  /**
   * Send doctor payment receipt
   */
  static async sendDoctorReceipt(
    email: string,
    data: DoctorReceiptData
  ): Promise<void> {
    const html = this.getDoctorReceiptTemplate(data);
    
    await this.sendEmail({
      to: email,
      subject: `Payment Receipt - ${data.receiptNumber}`,
      html,
    });

    // Send copy to admin and finance
    await this.sendEmail({
      to: [ADMIN_EMAIL, FINANCE_EMAIL],
      subject: `Doctor Payment Received - ${data.doctorName}`,
      html: this.getDoctorPaymentNotificationTemplate(data),
    });
  }

  /**
   * Send QR code email
   */
  static async sendQRCode(
    email: string,
    userName: string,
    eventName: string,
    qrCodeUrl: string,
    validDate: string
  ): Promise<void> {
    const html = this.getQRCodeTemplate(userName, eventName, qrCodeUrl, validDate);
    
    await this.sendEmail({
      to: email,
      subject: `Your Entry QR Code - ${eventName}`,
      html,
    });
  }

  /**
   * Send admin notification
   */
  static async sendAdminNotification(
    subject: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    const html = this.getAdminNotificationTemplate(subject, message, data);
    
    await this.sendEmail({
      to: ADMIN_EMAIL,
      subject: `[Admin] ${subject}`,
      html,
    });
  }

  /**
   * Send payment confirmation to admin
   */
  static async sendPaymentConfirmationToAdmin(
    userName: string,
    userEmail: string,
    eventName: string,
    amount: number,
    orderId: string
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Payment Received</h2>
        <p><strong>User:</strong> ${userName} (${userEmail})</p>
        <p><strong>Event:</strong> ${eventName}</p>
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
      </div>
    `;

    await this.sendEmail({
      to: ADMIN_EMAIL,
      subject: `Payment Received - ${userName}`,
      html,
    });
  }

  /**
   * Send verification approval email
   */
  static async sendVerificationApproval(
    email: string,
    userName: string,
    eventName: string
  ): Promise<void> {
    const html = this.getVerificationApprovalTemplate(userName, eventName);
    
    await this.sendEmail({
      to: email,
      subject: `Verification Approved - ${eventName}`,
      html,
    });
  }

  /**
   * Send verification rejection email
   */
  static async sendVerificationRejection(
    email: string,
    userName: string,
    eventName: string,
    reason: string
  ): Promise<void> {
    const html = this.getVerificationRejectionTemplate(userName, eventName, reason);
    
    await this.sendEmail({
      to: email,
      subject: `Verification Update - ${eventName}`,
      html,
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(
    email: string,
    resetToken: string,
    userName: string
  ): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = this.getPasswordResetTemplate(userName, resetLink);
    
    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request - Cerebrexia Admin',
      html,
    });
  }

  /**
   * Registration confirmation template
   */
  private static getRegistrationConfirmationTemplate(data: RegistrationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Cerebrexia</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Registration Confirmed!</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0;">Hello ${data.userName}! 🎉</h2>
                    <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                      Your registration for <strong>${data.eventName}</strong> has been confirmed!
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
                      <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Event Details</h3>
                      <p style="color: #666666; margin: 5px 0;"><strong>Event:</strong> ${data.eventName}</p>
                      <p style="color: #666666; margin: 5px 0;"><strong>Date:</strong> ${data.eventDate}</p>
                      <p style="color: #666666; margin: 5px 0;"><strong>Amount Paid:</strong> ₹${data.amount}</p>
                      <p style="color: #666666; margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
                    </div>

                    ${data.qrCodeUrl ? `
                    <div style="text-align: center; margin: 30px 0;">
                      <img src="${data.qrCodeUrl}" alt="QR Code" style="max-width: 200px; border: 2px solid #667eea; border-radius: 8px;">
                      <p style="color: #666666; margin: 10px 0 0 0; font-size: 14px;">Your Entry QR Code</p>
                    </div>
                    ` : ''}

                    <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
                      You will receive your daily QR code via email. Please present it at the entry gate.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.FRONTEND_URL}/my-registrations" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold;">View My Registrations</a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="color: #999999; margin: 0; font-size: 14px;">
                      © ${new Date().getFullYear()} Cerebrexia. All rights reserved.
                    </p>
                    <p style="color: #999999; margin: 10px 0 0 0; font-size: 12px;">
                      Need help? Contact us at <a href="mailto:support@cerebrexia.com" style="color: #667eea;">support@cerebrexia.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Visitor reminder template
   */
  private static getVisitorReminderTemplate(data: ReminderEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Don't Miss Out!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Don't Miss Out!</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Complete Your Registration</p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0;">Hi ${data.userName}! 👋</h2>
                    <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                      We noticed you were interested in <strong>${data.eventName}</strong> but didn't complete your registration.
                    </p>

                    ${data.offers && data.offers.length > 0 ? `
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
                      <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">🎁 Special Offers for You!</h3>
                      ${data.offers.map(offer => `<p style="color: #856404; margin: 5px 0;">✓ ${offer}</p>`).join('')}
                    </div>
                    ` : ''}

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${data.registrationLink}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold;">Complete Registration Now</a>
                    </div>

                    <p style="color: #666666; line-height: 1.6; margin: 20px 0; font-size: 14px; text-align: center;">
                      Event Date: ${data.eventDate}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="color: #999999; margin: 0; font-size: 14px;">
                      © ${new Date().getFullYear()} Cerebrexia. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Doctor receipt template
   */
  private static getDoctorReceiptTemplate(data: DoctorReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #dddddd;">
                <tr>
                  <td style="padding: 30px;">
                    <h1 style="color: #333333; text-align: center; margin: 0 0 30px 0;">Payment Receipt</h1>
                    
                    <table width="100%" cellpadding="10" cellspacing="0" style="border: 1px solid #dddddd;">
                      <tr>
                        <td style="background-color: #f8f9fa; font-weight: bold;">Receipt Number:</td>
                        <td>${data.receiptNumber}</td>
                      </tr>
                      <tr>
                        <td style="background-color: #f8f9fa; font-weight: bold;">Doctor Name:</td>
                        <td>${data.doctorName}</td>
                      </tr>
                      <tr>
                        <td style="background-color: #f8f9fa; font-weight: bold;">Designation:</td>
                        <td>${data.designation}</td>
                      </tr>
                      <tr>
                        <td style="background-color: #f8f9fa; font-weight: bold;">Payment Date:</td>
                        <td>${data.paymentDate}</td>
                      </tr>
                      <tr>
                        <td style="background-color: #f8f9fa; font-weight: bold;">Payment Mode:</td>
                        <td>${data.paymentMode}</td>
                      </tr>
                      <tr>
                        <td style="background-color: #f8f9fa; font-weight: bold; font-size: 18px;">Amount Paid:</td>
                        <td style="font-size: 18px; font-weight: bold; color: #28a745;">₹${data.amount}</td>
                      </tr>
                    </table>

                    <p style="margin: 30px 0 0 0; text-align: center; color: #666666; font-size: 14px;">
                      Thank you for your payment!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * QR Code template
   */
  private static getQRCodeTemplate(
    userName: string,
    eventName: string,
    qrCodeUrl: string,
    validDate: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2>Your Entry QR Code</h2>
        <p>Hello ${userName},</p>
        <p>Here is your QR code for <strong>${eventName}</strong></p>
        <p>Valid for: ${validDate}</p>
        <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 300px; margin: 20px 0;">
        <p style="color: #dc3545; font-weight: bold;">⚠️ This QR code is valid for single entry only</p>
        <p style="color: #666666; font-size: 14px;">Please present this QR code at the entry gate</p>
      </body>
      </html>
    `;
  }

  /**
   * Admin notification template
   */
  private static getAdminNotificationTemplate(
    subject: string,
    message: string,
    data?: Record<string, any>
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333333;">${subject}</h2>
        <p style="color: #666666;">${message}</p>
        ${data ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <pre style="margin: 0; white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</pre>
          </div>
        ` : ''}
        <p style="color: #999999; font-size: 12px; margin-top: 30px;">
          Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </p>
      </div>
    `;
  }

  /**
   * Doctor payment notification template
   */
  private static getDoctorPaymentNotificationTemplate(data: DoctorReceiptData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Doctor Payment Received</h2>
        <p><strong>Doctor:</strong> ${data.doctorName}</p>
        <p><strong>Designation:</strong> ${data.designation}</p>
        <p><strong>Amount:</strong> ₹${data.amount}</p>
        <p><strong>Payment Mode:</strong> ${data.paymentMode}</p>
        <p><strong>Receipt Number:</strong> ${data.receiptNumber}</p>
        <p><strong>Date:</strong> ${data.paymentDate}</p>
      </div>
    `;
  }

  /**
   * Verification approval template
   */
  private static getVerificationApprovalTemplate(userName: string, eventName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #28a745;">✓ Verification Approved</h2>
        <p>Hello ${userName},</p>
        <p>Your documents have been verified and approved for <strong>${eventName}</strong>.</p>
        <p>You can now participate in the event!</p>
      </div>
    `;
  }

  /**
   * Verification rejection template
   */
  private static getVerificationRejectionTemplate(
    userName: string,
    eventName: string,
    reason: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc3545;">Verification Update</h2>
        <p>Hello ${userName},</p>
        <p>We were unable to verify your documents for <strong>${eventName}</strong>.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please re-upload your documents or contact support for assistance.</p>
      </div>
    `;
  }

  /**
   * Password reset template
   */
  private static getPasswordResetTemplate(userName: string, resetLink: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #dc3545; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;
  }

  /**
   * Log email in Redis
   */
  private static async logEmail(
    to: string | string[],
    subject: string,
    status: 'sent' | 'failed'
  ): Promise<void> {
    const logKey = `email:log:${Date.now()}`;
    const logData = {
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      status,
      timestamp: new Date().toISOString(),
    };
    await redisClient.setex(logKey, 86400 * 7, JSON.stringify(logData)); // Keep for 7 days
  }

  /**
   * Test email configuration
   */
  static async testConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      logger.info('Email service is ready');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default EmailService;

// Made with Bob
