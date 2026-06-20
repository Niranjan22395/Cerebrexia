# Cerebrexia - API Documentation

## 📡 API Overview

**Base URL:** `https://api.cerebrexia.com/api/v1`  
**Protocol:** HTTPS only  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`  
**API Version:** v1

---

## 🔐 Authentication

### Google OAuth Login

**Endpoint:** `GET /auth/google`  
**Description:** Initiates Google OAuth 2.0 authentication flow  
**Authentication:** None required

**Response:**
```json
{
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

---

### Google OAuth Callback

**Endpoint:** `GET /auth/google/callback`  
**Description:** Handles Google OAuth callback  
**Authentication:** None required

**Query Parameters:**
- `code` (string, required): Authorization code from Google

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "profileCompleted": false
  }
}
```

---

### Complete Profile

**Endpoint:** `POST /auth/complete-profile`  
**Description:** Complete user profile after Google login  
**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "collegeName": "ABC University",
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "collegeName": "ABC University",
    "phone": "+919876543210",
    "profileCompleted": true
  }
}
```

---

### Logout

**Endpoint:** `POST /auth/logout`  
**Description:** Logout user and invalidate session  
**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get Current User

**Endpoint:** `GET /auth/me`  
**Description:** Get current authenticated user details  
**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "collegeName": "ABC University",
    "phone": "+919876543210",
    "profileCompleted": true,
    "verificationStatus": "verified",
    "createdAt": "2026-06-19T10:30:00Z"
  }
}
```

---

## 👤 User Management

### Get User Profile

**Endpoint:** `GET /users/profile`  
**Description:** Get user profile details  
**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "collegeName": "ABC University",
    "phone": "+919876543210",
    "collegeIdProofUrl": "https://storage.cerebrexia.com/ids/uuid.jpg",
    "verificationStatus": "verified",
    "profileCompleted": true
  }
}
```

---

### Update User Profile

**Endpoint:** `PUT /users/profile`  
**Description:** Update user profile information  
**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "collegeName": "XYZ University",
  "phone": "+919876543211"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "id": "uuid",
    "name": "John Doe Updated",
    "collegeName": "XYZ University",
    "phone": "+919876543211"
  }
}
```

---

### Upload College ID

**Endpoint:** `POST /users/upload-college-id`  
**Description:** Upload college ID proof for verification  
**Authentication:** Required (JWT)  
**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file, required): College ID image (JPG, PNG, PDF, max 5MB)

**Response:**
```json
{
  "success": true,
  "message": "College ID uploaded successfully",
  "fileUrl": "https://storage.cerebrexia.com/ids/uuid.jpg",
  "verificationStatus": "pending"
}
```

---

### Get Verification Status

**Endpoint:** `GET /users/verification-status`  
**Description:** Get college ID verification status  
**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "verificationStatus": "verified",
  "verifiedAt": "2026-06-19T12:00:00Z",
  "notes": "Verification approved"
}
```

---

## 🎪 Events

### List All Events

**Endpoint:** `GET /events`  
**Description:** Get list of all active events  
**Authentication:** Optional

**Query Parameters:**
- `category` (string, optional): Filter by category (sports, cultural, academic, technical, other)
- `search` (string, optional): Search by event name
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "uuid",
      "name": "Cricket Tournament",
      "category": "sports",
      "description": "Inter-college cricket tournament",
      "startDate": "2026-07-01",
      "endDate": "2026-07-03",
      "location": "Sports Complex",
      "registrationFee": 500.00,
      "maxParticipants": 100,
      "currentParticipants": 45,
      "imageUrl": "https://storage.cerebrexia.com/events/cricket.jpg",
      "isActive": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

---

### Get Event Details

**Endpoint:** `GET /events/:id`  
**Description:** Get detailed information about a specific event  
**Authentication:** Optional

**Response:**
```json
{
  "success": true,
  "event": {
    "id": "uuid",
    "name": "Cricket Tournament",
    "category": "sports",
    "description": "Inter-college cricket tournament with exciting prizes",
    "startDate": "2026-07-01",
    "endDate": "2026-07-03",
    "location": "Sports Complex",
    "registrationFee": 500.00,
    "maxParticipants": 100,
    "currentParticipants": 45,
    "imageUrl": "https://storage.cerebrexia.com/events/cricket.jpg",
    "rules": "1. Team of 11 players\n2. Standard cricket rules apply",
    "contactInfo": "sports@cerebrexia.com",
    "isActive": true,
    "createdAt": "2026-06-01T10:00:00Z"
  }
}
```

---

### Register for Event

**Endpoint:** `POST /events/:id/register`  
**Description:** Register for an event  
**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "promoCode": "EARLY2026"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration initiated",
  "registration": {
    "id": "uuid",
    "eventId": "uuid",
    "userId": "uuid",
    "paymentStatus": "pending",
    "amount": 400.00,
    "discountApplied": 100.00,
    "promoCode": "EARLY2026"
  },
  "paymentOrder": {
    "orderId": "order_xyz123",
    "amount": 400.00,
    "currency": "INR",
    "razorpayKey": "rzp_test_..."
  }
}
```

---

### Get My Registrations

**Endpoint:** `GET /events/my-registrations`  
**Description:** Get list of user's event registrations  
**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "registrations": [
    {
      "id": "uuid",
      "event": {
        "id": "uuid",
        "name": "Cricket Tournament",
        "category": "sports",
        "startDate": "2026-07-01",
        "location": "Sports Complex"
      },
      "registrationDate": "2026-06-19T10:30:00Z",
      "paymentStatus": "completed",
      "amountPaid": 400.00,
      "participationStatus": "registered"
    }
  ]
}
```

---

## 💳 Payments

### Create Payment Order

**Endpoint:** `POST /payments/create-order`  
**Description:** Create Razorpay payment order  
**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "eventId": "uuid",
  "promoCode": "EARLY2026"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "orderId": "order_xyz123",
    "amount": 40000,
    "currency": "INR",
    "razorpayKey": "rzp_test_...",
    "notes": {
      "userId": "uuid",
      "eventId": "uuid"
    }
  }
}
```

---

### Verify Payment

**Endpoint:** `POST /payments/verify`  
**Description:** Verify Razorpay payment signature  
**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "razorpayOrderId": "order_xyz123",
  "razorpayPaymentId": "pay_abc456",
  "razorpaySignature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment": {
    "id": "uuid",
    "orderId": "order_xyz123",
    "paymentId": "pay_abc456",
    "amount": 400.00,
    "status": "captured"
  }
}
```

---

### Get Payment History

**Endpoint:** `GET /payments/history`  
**Description:** Get user's payment history  
**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": "uuid",
      "orderId": "order_xyz123",
      "paymentId": "pay_abc456",
      "amount": 400.00,
      "currency": "INR",
      "status": "captured",
      "paymentMethod": "card",
      "event": {
        "name": "Cricket Tournament"
      },
      "createdAt": "2026-06-19T10:30:00Z"
    }
  ]
}
```

---

### Apply Promo Code

**Endpoint:** `POST /payments/apply-promo`  
**Description:** Validate and apply promo code  
**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "promoCode": "EARLY2026",
  "amount": 500.00
}
```

**Response:**
```json
{
  "success": true,
  "promoCode": {
    "code": "EARLY2026",
    "discountType": "percentage",
    "discountValue": 20.00
  },
  "originalAmount": 500.00,
  "discountAmount": 100.00,
  "finalAmount": 400.00
}
```

---

## 🎫 QR Codes

### Get Daily QR Code

**Endpoint:** `GET /qr/daily`  
**Description:** Get today's QR code for entry  
**Authentication:** Required (JWT)

**Query Parameters:**
- `eventId` (string, required): Event ID

**Response:**
```json
{
  "success": true,
  "qrCode": {
    "id": "uuid",
    "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "validDate": "2026-06-19",
    "isUsed": false,
    "event": {
      "name": "Cricket Tournament",
      "location": "Sports Complex"
    }
  }
}
```

---

### Validate QR Code (Gate Staff)

**Endpoint:** `POST /qr/validate`  
**Description:** Validate QR code at entry gate  
**Authentication:** Required (Gate Staff JWT)

**Request Body:**
```json
{
  "qrData": "{\"v\":1,\"uid\":\"uuid\",\"eid\":\"uuid\",\"date\":\"2026-06-19\",\"token\":\"...\",\"sig\":\"...\"}"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "collegeName": "ABC University"
  },
  "event": {
    "name": "Cricket Tournament"
  },
  "message": "Entry granted"
}
```

**Error Response:**
```json
{
  "success": false,
  "valid": false,
  "reason": "QR already used",
  "message": "This QR code has already been scanned"
}
```

---

### Get QR Scan History

**Endpoint:** `GET /qr/history`  
**Description:** Get QR code scan history  
**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": "uuid",
      "event": {
        "name": "Cricket Tournament"
      },
      "validDate": "2026-06-19",
      "isUsed": true,
      "scannedAt": "2026-06-19T09:00:00Z",
      "scannedBy": "Gate Staff 1",
      "scanLocation": "Main Gate"
    }
  ]
}
```

---

## 🏥 Doctor Portal

### Register Doctor Payment

**Endpoint:** `POST /doctor/register`  
**Description:** Register doctor for payment  
**Authentication:** None required

**Request Body:**
```json
{
  "name": "Dr. John Smith",
  "designation": "Cardiologist",
  "email": "doctor@example.com",
  "phone": "+919876543210",
  "paymentAmount": 5000.00,
  "paymentMode": "online"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor registered successfully",
  "doctor": {
    "id": "uuid",
    "name": "Dr. John Smith",
    "designation": "Cardiologist",
    "paymentAmount": 5000.00,
    "paymentMode": "online",
    "paymentStatus": "pending"
  },
  "paymentOrder": {
    "orderId": "order_doc123",
    "amount": 500000,
    "currency": "INR",
    "razorpayKey": "rzp_test_..."
  }
}
```

---

### Process Doctor Payment

**Endpoint:** `POST /doctor/payment`  
**Description:** Process doctor payment verification  
**Authentication:** None required

**Request Body:**
```json
{
  "doctorId": "uuid",
  "razorpayOrderId": "order_doc123",
  "razorpayPaymentId": "pay_doc456",
  "razorpaySignature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "receiptNumber": "RCP-2026-001",
  "payment": {
    "id": "uuid",
    "amount": 5000.00,
    "status": "completed"
  }
}
```

---

### Get Doctor Receipt

**Endpoint:** `GET /doctor/receipt/:id`  
**Description:** Get doctor payment receipt  
**Authentication:** None required

**Response:**
```json
{
  "success": true,
  "receipt": {
    "receiptNumber": "RCP-2026-001",
    "doctorName": "Dr. John Smith",
    "designation": "Cardiologist",
    "amount": 5000.00,
    "paymentMode": "online",
    "paymentId": "pay_doc456",
    "date": "2026-06-19T10:30:00Z",
    "pdfUrl": "https://storage.cerebrexia.com/receipts/RCP-2026-001.pdf"
  }
}
```

---

### Get Finance QR

**Endpoint:** `GET /doctor/finance-qr`  
**Description:** Get finance department QR code  
**Authentication:** None required

**Response:**
```json
{
  "success": true,
  "qrCode": {
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "upiId": "finance@cerebrexia",
    "accountName": "Cerebrexia Finance"
  }
}
```

---

## 👨‍💼 Admin APIs

### Get Dashboard Statistics

**Endpoint:** `GET /admin/dashboard`  
**Description:** Get admin dashboard statistics  
**Authentication:** Required (Admin JWT)

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 1250,
    "activeEvents": 15,
    "totalRegistrations": 3450,
    "totalRevenue": 1725000.00,
    "todayEntries": 234,
    "pendingVerifications": 45,
    "activePromoCodes": 12
  }
}
```

---

### List All Users

**Endpoint:** `GET /admin/users`  
**Description:** Get list of all users  
**Authentication:** Required (Admin JWT)

**Query Parameters:**
- `search` (string, optional): Search by name or email
- `verificationStatus` (string, optional): Filter by verification status
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "collegeName": "ABC University",
      "verificationStatus": "verified",
      "profileCompleted": true,
      "createdAt": "2026-06-19T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 50,
    "totalItems": 1000
  }
}
```

---

### Verify User

**Endpoint:** `PUT /admin/users/:id/verify`  
**Description:** Approve or reject user verification  
**Authentication:** Required (Admin JWT)

**Request Body:**
```json
{
  "status": "verified",
  "notes": "College ID verified successfully"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User verification updated",
  "user": {
    "id": "uuid",
    "verificationStatus": "verified",
    "verifiedAt": "2026-06-19T12:00:00Z"
  }
}
```

---

### Create Event

**Endpoint:** `POST /admin/events`  
**Description:** Create a new event  
**Authentication:** Required (Admin JWT)

**Request Body:**
```json
{
  "name": "Football Tournament",
  "category": "sports",
  "description": "Inter-college football championship",
  "startDate": "2026-08-01",
  "endDate": "2026-08-03",
  "location": "Football Ground",
  "maxParticipants": 200,
  "registrationFee": 600.00,
  "rules": "Standard football rules apply",
  "contactInfo": "sports@cerebrexia.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "id": "uuid",
    "name": "Football Tournament",
    "category": "sports",
    "isActive": true
  }
}
```

---

### Update Event

**Endpoint:** `PUT /admin/events/:id`  
**Description:** Update event details  
**Authentication:** Required (Admin JWT)

**Request Body:**
```json
{
  "name": "Football Tournament Updated",
  "registrationFee": 650.00,
  "maxParticipants": 250
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "event": {
    "id": "uuid",
    "name": "Football Tournament Updated",
    "registrationFee": 650.00
  }
}
```

---

### Create Promo Code

**Endpoint:** `POST /admin/promo-codes`  
**Description:** Create a new promo code  
**Authentication:** Required (Admin JWT)

**Request Body:**
```json
{
  "code": "SUMMER2026",
  "description": "Summer special discount",
  "discountType": "percentage",
  "discountValue": 25.00,
  "maxUses": 100,
  "maxUsesPerUser": 1,
  "validFrom": "2026-07-01T00:00:00Z",
  "validUntil": "2026-07-31T23:59:59Z",
  "minimumAmount": 500.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Promo code created successfully",
  "promoCode": {
    "id": "uuid",
    "code": "SUMMER2026",
    "discountType": "percentage",
    "discountValue": 25.00,
    "isActive": true
  }
}
```

---

### Get Payment Reports

**Endpoint:** `GET /admin/reports/payments`  
**Description:** Get payment reports  
**Authentication:** Required (Admin JWT)

**Query Parameters:**
- `startDate` (string, optional): Start date (YYYY-MM-DD)
- `endDate` (string, optional): End date (YYYY-MM-DD)
- `status` (string, optional): Filter by payment status
- `format` (string, optional): Export format (json, csv, pdf)

**Response:**
```json
{
  "success": true,
  "report": {
    "totalPayments": 1250,
    "totalAmount": 625000.00,
    "successfulPayments": 1200,
    "failedPayments": 50,
    "averageAmount": 500.00,
    "payments": [
      {
        "id": "uuid",
        "user": "John Doe",
        "event": "Cricket Tournament",
        "amount": 400.00,
        "status": "captured",
        "date": "2026-06-19T10:30:00Z"
      }
    ]
  }
}
```

---

## 📧 Email Management

### Get Email Logs

**Endpoint:** `GET /admin/email-logs`  
**Description:** Get email sending logs  
**Authentication:** Required (Admin JWT)

**Query Parameters:**
- `type` (string, optional): Filter by email type
- `status` (string, optional): Filter by status
- `page` (number, optional): Page number

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "recipientEmail": "user@example.com",
      "emailType": "registration",
      "subject": "Registration Confirmed",
      "status": "sent",
      "sentAt": "2026-06-19T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 100
  }
}
```

---

## 🔒 Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `QR_INVALID` | 400 | Invalid QR code |
| `QR_EXPIRED` | 400 | QR code expired |
| `QR_ALREADY_USED` | 400 | QR code already scanned |
| `PROMO_INVALID` | 400 | Invalid promo code |
| `PROMO_EXPIRED` | 400 | Promo code expired |
| `EVENT_FULL` | 400 | Event registration full |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 📊 Rate Limiting

- **General APIs:** 100 requests per 15 minutes per IP
- **Authentication APIs:** 5 requests per 15 minutes per IP
- **Payment APIs:** 10 requests per minute per user
- **Admin APIs:** 200 requests per 15 minutes per admin

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1624089600
```

---

## 🔐 Authentication Headers

**For User APIs:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**For Admin APIs:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Admin-Role: super_admin
```

---

## 📝 Request/Response Examples

### Example: Complete User Registration Flow

```bash
# 1. Initiate Google OAuth
GET /api/v1/auth/google

# 2. Handle callback (automatic)
GET /api/v1/auth/google/callback?code=...

# 3. Complete profile
POST /api/v1/auth/complete-profile
Authorization: Bearer <token>
{
  "collegeName": "ABC University",
  "phone": "+919876543210"
}

# 4. Upload college ID
POST /api/v1/users/upload-college-id
Authorization: Bearer <token>
Content-Type: multipart/form-data
file: <college_id.jpg>

# 5. Browse events
GET /api/v1/events?category=sports

# 6. Register for event
POST /api/v1/events/<event-id>/register
Authorization: Bearer <token>
{
  "promoCode": "EARLY2026"
}

# 7. Complete payment (Razorpay)
POST /api/v1/payments/verify
Authorization: Bearer <token>
{
  "razorpayOrderId": "order_xyz",
  "razorpayPaymentId": "pay_abc",
  "razorpaySignature": "signature"
}

# 8. Get QR code
GET /api/v1/qr/daily?eventId=<event-id>
Authorization: Bearer <token>
```

---

**API Version:** 1.0  
**Last Updated:** 2026-06-19  
**Documentation Status:** Complete
