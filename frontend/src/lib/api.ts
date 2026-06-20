import axios from './axios';
import {
  User,
  GoogleAuthResponse,
  Event,
  EventRegistration,
  Payment,
  RazorpayOrderResponse,
  PaymentVerification,
  QRCode,
  QRScanResult,
  PromoCode,
  PromoCodeValidation,
  Doctor,
  DoctorPaymentData,
  AdminStats,
  PaginatedResponse,
  EventFilters,
  PaymentFilters,
  UserFilters,
} from '../types';

// ============================================
// Authentication API
// ============================================

export const authApi = {
  // Google OAuth login
  googleLogin: async (credential: string): Promise<GoogleAuthResponse> => {
    const { data } = await axios.post('/auth/google', { credential });
    return data;
  },

  // Complete profile after Google login
  completeProfile: async (profileData: FormData): Promise<User> => {
    const { data } = await axios.post('/auth/complete-profile', profileData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const { data } = await axios.get('/auth/me');
    return data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await axios.post('/auth/logout');
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await axios.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await axios.post('/auth/reset-password', { token, newPassword });
  },
};

// ============================================
// User API
// ============================================

export const userApi = {
  // Get user profile
  getProfile: async (): Promise<User> => {
    const { data } = await axios.get('/users/profile');
    return data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const { data } = await axios.put('/users/profile', userData);
    return data;
  },

  // Upload college ID
  uploadCollegeId: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('collegeId', file);
    const { data } = await axios.post('/users/upload-college-id', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Get user registrations
  getMyRegistrations: async (): Promise<EventRegistration[]> => {
    const { data } = await axios.get('/users/registrations');
    return data;
  },

  // Get user payments
  getMyPayments: async (): Promise<Payment[]> => {
    const { data } = await axios.get('/users/payments');
    return data;
  },

  // Get user QR codes
  getMyQRCodes: async (): Promise<QRCode[]> => {
    const { data } = await axios.get('/users/qr-codes');
    return data;
  },
};

// ============================================
// Event API
// ============================================

export const eventApi = {
  // Get all events
  getEvents: async (filters?: EventFilters): Promise<Event[]> => {
    const { data } = await axios.get('/events', { params: filters });
    return data;
  },

  // Get event by ID
  getEventById: async (id: string): Promise<Event> => {
    const { data } = await axios.get(`/events/${id}`);
    return data;
  },

  // Register for event
  registerForEvent: async (eventId: string, promoCode?: string): Promise<EventRegistration> => {
    const { data } = await axios.post('/events/register', { eventId, promoCode });
    return data;
  },

  // Cancel event registration
  cancelRegistration: async (registrationId: string): Promise<void> => {
    await axios.delete(`/events/registrations/${registrationId}`);
  },

  // Get event registrations
  getEventRegistrations: async (eventId: string): Promise<EventRegistration[]> => {
    const { data } = await axios.get(`/events/${eventId}/registrations`);
    return data;
  },

  // Get event statistics
  getEventStats: async (eventId: string): Promise<any> => {
    const { data } = await axios.get(`/events/${eventId}/stats`);
    return data;
  },
};

// ============================================
// Payment API
// ============================================

export const paymentApi = {
  // Create Razorpay order
  createOrder: async (amount: number, eventId?: string, promoCode?: string): Promise<RazorpayOrderResponse> => {
    const { data } = await axios.post('/payments/create-order', {
      amount,
      eventId,
      promoCode,
    });
    return data;
  },

  // Verify payment
  verifyPayment: async (verification: PaymentVerification): Promise<Payment> => {
    const { data } = await axios.post('/payments/verify', verification);
    return data;
  },

  // Get payment by ID
  getPaymentById: async (id: string): Promise<Payment> => {
    const { data } = await axios.get(`/payments/${id}`);
    return data;
  },

  // Request refund
  requestRefund: async (paymentId: string, reason: string): Promise<Payment> => {
    const { data } = await axios.post(`/payments/${paymentId}/refund`, { reason });
    return data;
  },

  // Download receipt
  downloadReceipt: async (paymentId: string): Promise<Blob> => {
    const { data } = await axios.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });
    return data;
  },
};

// ============================================
// QR Code API
// ============================================

export const qrApi = {
  // Generate QR code
  generateQR: async (eventId: string): Promise<QRCode> => {
    const { data } = await axios.post('/qr/generate', { eventId });
    return data;
  },

  // Get QR code
  getQRCode: async (id: string): Promise<QRCode> => {
    const { data } = await axios.get(`/qr/${id}`);
    return data;
  },

  // Scan QR code (for gate staff)
  scanQR: async (code: string): Promise<QRScanResult> => {
    const { data } = await axios.post('/qr/scan', { code });
    return data;
  },

  // Validate QR code
  validateQR: async (code: string): Promise<QRScanResult> => {
    const { data } = await axios.post('/qr/validate', { code });
    return data;
  },

  // Get today's QR code
  getTodayQR: async (eventId: string): Promise<QRCode> => {
    const { data } = await axios.get(`/qr/today/${eventId}`);
    return data;
  },
};

// ============================================
// Promo Code API
// ============================================

export const promoCodeApi = {
  // Validate promo code
  validatePromoCode: async (code: string, amount: number, eventId?: string): Promise<PromoCodeValidation> => {
    const { data } = await axios.post('/promo-codes/validate', {
      code,
      amount,
      eventId,
    });
    return data;
  },

  // Apply promo code
  applyPromoCode: async (code: string, paymentId: string): Promise<Payment> => {
    const { data } = await axios.post('/promo-codes/apply', {
      code,
      paymentId,
    });
    return data;
  },

  // Get active promo codes (admin)
  getActivePromoCodes: async (): Promise<PromoCode[]> => {
    const { data } = await axios.get('/promo-codes/active');
    return data;
  },
};

// ============================================
// Doctor Portal API
// ============================================

export const doctorApi = {
  // Submit doctor payment
  submitPayment: async (paymentData: DoctorPaymentData): Promise<Doctor> => {
    const { data } = await axios.post('/doctors/payment', paymentData);
    return data;
  },

  // Create doctor Razorpay order
  createDoctorOrder: async (amount: number, doctorData: Partial<DoctorPaymentData>): Promise<RazorpayOrderResponse> => {
    const { data } = await axios.post('/doctors/create-order', {
      amount,
      ...doctorData,
    });
    return data;
  },

  // Verify doctor payment
  verifyDoctorPayment: async (verification: PaymentVerification, doctorId: string): Promise<Doctor> => {
    const { data } = await axios.post('/doctors/verify-payment', {
      ...verification,
      doctorId,
    });
    return data;
  },

  // Get doctor payment receipt
  getDoctorReceipt: async (doctorId: string): Promise<Blob> => {
    const { data } = await axios.get(`/doctors/${doctorId}/receipt`, {
      responseType: 'blob',
    });
    return data;
  },
};

// ============================================
// Admin API
// ============================================

export const adminApi = {
  // Get dashboard statistics
  getStats: async (): Promise<AdminStats> => {
    const { data } = await axios.get('/admin/stats');
    return data;
  },

  // User Management
  getUsers: async (filters?: UserFilters, page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const { data } = await axios.get('/admin/users', {
      params: { ...filters, page, limit },
    });
    return data;
  },

  getUserById: async (id: string): Promise<User> => {
    const { data } = await axios.get(`/admin/users/${id}`);
    return data;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const { data } = await axios.put(`/admin/users/${id}`, userData);
    return data;
  },

  verifyUser: async (id: string): Promise<User> => {
    const { data } = await axios.post(`/admin/users/${id}/verify`);
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axios.delete(`/admin/users/${id}`);
  },

  // Event Management
  createEvent: async (eventData: Partial<Event>): Promise<Event> => {
    const { data } = await axios.post('/admin/events', eventData);
    return data;
  },

  updateEvent: async (id: string, eventData: Partial<Event>): Promise<Event> => {
    const { data } = await axios.put(`/admin/events/${id}`, eventData);
    return data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await axios.delete(`/admin/events/${id}`);
  },

  // Payment Management
  getPayments: async (filters?: PaymentFilters, page = 1, limit = 20): Promise<PaginatedResponse<Payment>> => {
    const { data } = await axios.get('/admin/payments', {
      params: { ...filters, page, limit },
    });
    return data;
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const { data } = await axios.get(`/admin/payments/${id}`);
    return data;
  },

  processRefund: async (paymentId: string): Promise<Payment> => {
    const { data } = await axios.post(`/admin/payments/${paymentId}/refund`);
    return data;
  },

  // Promo Code Management
  getAllPromoCodes: async (): Promise<PromoCode[]> => {
    const { data } = await axios.get('/admin/promo-codes');
    return data;
  },

  createPromoCode: async (promoData: Partial<PromoCode>): Promise<PromoCode> => {
    const { data } = await axios.post('/admin/promo-codes', promoData);
    return data;
  },

  updatePromoCode: async (id: string, promoData: Partial<PromoCode>): Promise<PromoCode> => {
    const { data } = await axios.put(`/admin/promo-codes/${id}`, promoData);
    return data;
  },

  deletePromoCode: async (id: string): Promise<void> => {
    await axios.delete(`/admin/promo-codes/${id}`);
  },

  // Reports
  getRevenueReport: async (startDate?: string, endDate?: string): Promise<any> => {
    const { data } = await axios.get('/admin/reports/revenue', {
      params: { startDate, endDate },
    });
    return data;
  },

  getEventReport: async (eventId: string): Promise<any> => {
    const { data } = await axios.get(`/admin/reports/events/${eventId}`);
    return data;
  },

  exportPayments: async (format: 'csv' | 'excel'): Promise<Blob> => {
    const { data } = await axios.get('/admin/reports/payments/export', {
      params: { format },
      responseType: 'blob',
    });
    return data;
  },
};

// Export all APIs
export default {
  auth: authApi,
  user: userApi,
  event: eventApi,
  payment: paymentApi,
  qr: qrApi,
  promoCode: promoCodeApi,
  doctor: doctorApi,
  admin: adminApi,
};

// Made with Bob
