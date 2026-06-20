/**
 * Utility functions for validation
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indian phone number (10 digits)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (password: string): boolean => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return minLength && hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Get password strength score (0-4)
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return Math.min(strength, 4);
};

/**
 * Validate URL format
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate file type
 */
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size (in bytes)
 */
export const isValidFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * Validate image file
 */
export const isValidImage = (file: File, maxSizeMB: number = 5): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  
  return isValidFileType(file, allowedTypes) && isValidFileSize(file, maxSize);
};

/**
 * Validate document file (PDF, DOC, DOCX)
 */
export const isValidDocument = (file: File, maxSizeMB: number = 10): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const maxSize = maxSizeMB * 1024 * 1024;
  
  return isValidFileType(file, allowedTypes) && isValidFileSize(file, maxSize);
};

/**
 * Validate promo code format
 */
export const isValidPromoCode = (code: string): boolean => {
  // Alphanumeric, 4-20 characters
  const promoRegex = /^[A-Z0-9]{4,20}$/;
  return promoRegex.test(code.toUpperCase());
};

/**
 * Validate amount (positive number)
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0;
};

/**
 * Validate date is in future
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

/**
 * Validate date is in past
 */
export const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Validate maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Validate number range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate Indian PAN card format
 */
export const isValidPAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

/**
 * Validate Indian Aadhaar number
 */
export const isValidAadhaar = (aadhaar: string): boolean => {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
};

/**
 * Validate college ID format (alphanumeric, 5-20 characters)
 */
export const isValidCollegeId = (id: string): boolean => {
  const idRegex = /^[A-Z0-9]{5,20}$/;
  return idRegex.test(id.toUpperCase());
};

/**
 * Sanitize string (remove special characters)
 */
export const sanitizeString = (str: string): string => {
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
};

/**
 * Validate QR code format
 */
export const isValidQRCode = (code: string): boolean => {
  // UUID format or custom format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(code) || code.length >= 10;
};

/**
 * Validate age (must be 18+)
 */
export const isValidAge = (birthDate: string): boolean => {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
};

/**
 * Validate username (alphanumeric, underscore, 3-20 characters)
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Check if string contains only letters
 */
export const isAlpha = (str: string): boolean => {
  return /^[a-zA-Z\s]+$/.test(str);
};

/**
 * Check if string contains only numbers
 */
export const isNumeric = (str: string): boolean => {
  return /^\d+$/.test(str);
};

/**
 * Check if string is alphanumeric
 */
export const isAlphanumeric = (str: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(str);
};

/**
 * Validate credit card number (Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Made with Bob