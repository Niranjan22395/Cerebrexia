// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  collegeName?: string;
  collegeId?: string;
  profileCompleted: boolean;
  role: 'user' | 'admin' | 'super_admin' | 'finance_manager' | 'gate_staff' | 'verification_team';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface GoogleAuthResponse {
  token: string;
  user: User;
  profileCompleted: boolean;
}

export interface CompleteProfileData {
  name: string;
  phone: string;
  collegeName: string;
  collegeId: File;
}

// Event Types
export interface Event {
  id: string;
  name: string;
  description: string;
  category: 'sports' | 'cultural' | 'technical' | 'academic' | 'workshop' | 'competition' | 'other';
  startDate: string;
  endDate: string;
  venue: string;
  maxParticipants?: number;
  registrationFee: number;
  imageUrl?: string;
  rules?: string;
  prizes?: string;
  contactInfo?: string;
  isActive: boolean;
  registrationCount?: number;
  registrationDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  qrCodeId?: string;
  registeredAt: string;
  event?: Event;
  user?: User;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  eventId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'razorpay' | 'cash';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  event?: Event;
  user?: User;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentVerification {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// QR Code Types
export interface QRCode {
  id: string;
  userId: string;
  eventId: string;
  code: string;
  validDate: string;
  isUsed: boolean;
  usedAt?: string;
  scannedBy?: string;
  createdAt: string;
  user?: User;
  event?: Event;
}

export interface QRScanResult {
  success: boolean;
  message: string;
  qrCode?: QRCode;
  user?: User;
  event?: Event;
}

// Promo Code Types
export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableEvents?: string[];
  minPurchaseAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCodeValidation {
  valid: boolean;
  message: string;
  promoCode?: PromoCode;
  discountAmount?: number;
}

// Doctor Portal Types
export interface Doctor {
  id: string;
  name: string;
  designation: string;
  email?: string;
  phone?: string;
  paymentAmount: number;
  paymentMode: 'cash' | 'online';
  paymentStatus: 'pending' | 'completed' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorPaymentData {
  name: string;
  designation: string;
  email?: string;
  phone?: string;
  paymentAmount: number;
  paymentMode: 'cash' | 'online';
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  pendingVerifications: number;
  activePromoCodes: number;
}

export interface UserManagement {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentReport {
  payments: Payment[];
  total: number;
  totalAmount: number;
  page: number;
  limit: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface EventRegistrationForm {
  eventId: string;
  promoCode?: string;
}

export interface PaymentForm {
  amount: number;
  eventId?: string;
  promoCode?: string;
}

// Filter Types
export interface EventFilters {
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface PaymentFilters {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface UserFilters {
  role?: string;
  isVerified?: boolean;
  search?: string;
}

// Error Types
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// Made with Bob
