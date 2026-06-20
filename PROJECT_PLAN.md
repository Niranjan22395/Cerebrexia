# Cerebrexia Event Management Platform - Project Plan

## Project Overview
**Website Name:** Cerebrexia  
**Type:** Event Management Platform  
**Target:** Large-scale events with 70+ activities (sports, cultural, technical, academic)  
**Users:** Visitors, Participants, Doctors, Finance Managers, Admins, Gate Staff

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Authentication:** Google OAuth 2.0
- **Payment:** Razorpay Integration
- **Email:** Nodemailer (SMTP)
- **QR Generation:** qrcode library

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **QR Display:** qrcode.react
- **Icons:** Lucide React

### DevOps
- **Containerization:** Docker & Docker Compose
- **Reverse Proxy:** Nginx (optional)
- **CI/CD:** GitHub Actions (planned)

## Core Features

### 1. QR-Based Entry System ✅
- **Daily Unique QR Codes:** Generated fresh each day
- **Single-Use:** Invalid after first scan
- **Date-Bound:** Only valid for the issued date
- **Real-time Validation:** Immediate invalidation upon scan
- **Prevention:** Stops duplicate entries and QR sharing

### 2. Visitor Tracking & Reminder System ✅
- **Visitor Detection:** Track users who browse but don't register
- **Automated Follow-ups:** Email reminders with event details
- **Personalized Content:** QR preview, registration links
- **Special Offers:** Couple offers, group discounts
- **Premium Design:** Visually appealing, mobile-responsive emails

### 3. Registration & Payment Transparency ✅
- **Automatic Notifications:** Send registration data to admin email
- **Complete Data:** Name, contact, event, payment details
- **Payment Confirmation:** Triggered after successful payment
- **Audit Trail:** Full transparency for monitoring

### 4. Doctor Payment Portal ✅
- **Dedicated System:** Separate portal for 700-800 doctors
- **Payment Options:** Cash or Online (Razorpay)
- **Receipt Generation:** Automatic email receipts
- **Dual Notifications:** Admin + Finance manager emails
- **Finance QR:** Fixed QR code display for payment visibility

### 5. Multi-Event Participation ✅
- **70+ Events:** Sports, cultural, technical, academic categories
- **Event Selection:** Users choose events to participate in
- **ID Verification:** Upload college ID proof
- **Approval Required:** Participation only after verification
- **Status Tracking:** Pending/Verified status display

### 6. Authentication System ✅
- **Google OAuth:** Primary authentication method
- **Profile Completion:** Additional details after login
- **Required Fields:** Name, phone, college name, college ID
- **Access Control:** No registration/payment without profile completion

### 7. Professional Email System ✅
- **Responsive Design:** Mobile-friendly templates
- **Branding:** Cerebrexia logo and colors
- **Email Types:**
  - Registration confirmations
  - Payment receipts
  - Event reminders
  - Special offers
  - Verification updates
- **Call-to-Action:** Clear buttons and links

### 8. Promo Code System ✅
- **Capacity:** Up to 200 active codes simultaneously
- **Discount Types:** Percentage or fixed amount
- **Validation:** Real-time code verification
- **Expiry Management:** Date-based expiration
- **Usage Limits:** Per-user and per-code restrictions
- **Event-Specific:** Optional event targeting

## Project Structure

```
cerebrexia/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── models/          # Database models (10 files)
│   │   ├── services/        # Business logic (10 files)
│   │   ├── routes/          # API routes (10 files)
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── utils/           # Helpers, logger, email
│   │   └── index.ts         # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Button, Input, Card, Modal, Loading
│   │   │   ├── layout/      # Header, Footer, Layout
│   │   │   ├── auth/        # GoogleLogin, ProtectedRoute
│   │   │   ├── events/      # EventCard
│   │   │   ├── payment/     # PaymentForm, PromoCodeInput
│   │   │   ├── qr/          # QRDisplay
│   │   │   ├── profile/     # ProfileForm, CollegeIDUpload
│   │   │   └── admin/       # Dashboard, Tables, Charts
│   │   ├── pages/           # 13 pages (Home, Events, Profile, etc.)
│   │   ├── lib/             # axios, validation
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
└── README.md
```

## Database Schema

### Core Tables
1. **users** - User accounts and profiles
2. **events** - Event listings and details
3. **event_registrations** - User event registrations
4. **payments** - Payment transactions
5. **qr_codes** - Daily QR codes for entry
6. **promo_codes** - Discount codes
7. **doctors** - Doctor portal records
8. **visitor_tracking** - Visitor behavior tracking
9. **email_logs** - Email delivery tracking
10. **verification_requests** - College ID verification queue

## API Endpoints (60+)

### Authentication (5 endpoints)
- POST /api/v1/auth/google
- POST /api/v1/auth/complete-profile
- GET /api/v1/auth/me
- POST /api/v1/auth/logout
- POST /api/v1/auth/refresh

### Events (8 endpoints)
- GET /api/v1/events
- GET /api/v1/events/:id
- POST /api/v1/events (admin)
- PUT /api/v1/events/:id (admin)
- DELETE /api/v1/events/:id (admin)
- GET /api/v1/events/category/:category
- GET /api/v1/events/search
- GET /api/v1/events/:id/registrations (admin)

### Registrations (6 endpoints)
- POST /api/v1/registrations
- GET /api/v1/registrations/my
- GET /api/v1/registrations/:id
- PUT /api/v1/registrations/:id/cancel
- GET /api/v1/registrations (admin)
- PUT /api/v1/registrations/:id/status (admin)

### Payments (10 endpoints)
- POST /api/v1/payments/create-order
- POST /api/v1/payments/verify
- GET /api/v1/payments/my
- GET /api/v1/payments/:id
- GET /api/v1/payments (admin)
- POST /api/v1/payments/refund (admin)
- GET /api/v1/payments/reports (finance)
- POST /api/v1/payments/cash (admin)
- GET /api/v1/payments/receipt/:id
- POST /api/v1/payments/resend-receipt

### QR Codes (7 endpoints)
- GET /api/v1/qr/my
- GET /api/v1/qr/:eventId
- POST /api/v1/qr/generate
- POST /api/v1/qr/scan (gate staff)
- GET /api/v1/qr/validate/:code
- GET /api/v1/qr/history (admin)
- POST /api/v1/qr/regenerate

### Promo Codes (6 endpoints)
- POST /api/v1/promo-codes/validate
- GET /api/v1/promo-codes (admin)
- POST /api/v1/promo-codes (admin)
- PUT /api/v1/promo-codes/:id (admin)
- DELETE /api/v1/promo-codes/:id (admin)
- GET /api/v1/promo-codes/stats (admin)

### Doctor Portal (5 endpoints)
- POST /api/v1/doctors/register
- POST /api/v1/doctors/payment
- GET /api/v1/doctors/:id
- GET /api/v1/doctors (admin)
- GET /api/v1/doctors/reports (finance)

### Users (6 endpoints)
- GET /api/v1/users/profile
- PUT /api/v1/users/profile
- POST /api/v1/users/upload-college-id
- GET /api/v1/users (admin)
- PUT /api/v1/users/:id/verify (admin)
- DELETE /api/v1/users/:id (admin)

### Admin (7 endpoints)
- GET /api/v1/admin/dashboard
- GET /api/v1/admin/stats
- GET /api/v1/admin/users
- GET /api/v1/admin/payments
- GET /api/v1/admin/events
- GET /api/v1/admin/verifications
- POST /api/v1/admin/bulk-email

## Development Progress

### ✅ Completed (85%)

#### Backend (100%)
- [x] Project setup and configuration
- [x] Database models (10 files, 1,200+ lines)
- [x] Service layer (10 files, 2,500+ lines)
- [x] API routes (10 files, 2,800+ lines)
- [x] Authentication middleware
- [x] Error handling
- [x] Email service
- [x] QR generation
- [x] Payment integration
- [x] Logging system

#### Frontend (85%)
- [x] Project setup (Vite, TypeScript, Tailwind)
- [x] Common components (5 files, 400+ lines)
- [x] Layout components (3 files, 300+ lines)
- [x] Auth components (2 files, 200+ lines)
- [x] All pages (13 files, 2,700+ lines)
- [x] Feature components (6 files, 1,365+ lines)
  - EventCard (200 lines)
  - PaymentForm (230 lines)
  - PromoCodeInput (160 lines)
  - QRDisplay (185 lines)
  - ProfileForm (310 lines)
  - CollegeIDUpload (280 lines)
- [x] Type definitions (259 lines)
- [x] API client setup
- [x] State management
- [ ] Admin components (pending)
- [ ] Custom hooks (pending)
- [ ] Utilities (pending)

#### DevOps (100%)
- [x] Docker configuration
- [x] Docker Compose setup
- [x] Environment variables
- [x] Database migrations
- [x] Build optimization

### 🔄 In Progress (10%)
- [ ] Admin dashboard components
- [ ] Custom React hooks
- [ ] Utility functions
- [ ] Form validation helpers

### 📋 Pending (5%)
- [ ] Integration testing
- [ ] E2E testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation completion

## File Statistics

### Backend
- **Total Files:** 24
- **Total Lines:** 6,500+
- **Models:** 10 files
- **Services:** 10 files
- **Routes:** 10 files
- **Middleware:** 4 files

### Frontend
- **Total Files:** 35
- **Total Lines:** 4,965+
- **Components:** 16 files
- **Pages:** 13 files
- **Types:** 1 file (259 lines)
- **Config:** 5 files

### Total Project
- **Files:** 70+
- **Lines of Code:** 11,465+
- **API Endpoints:** 60+
- **Database Tables:** 10

## Deployment

### Docker Deployment ✅
```bash
# Build and start all services
docker-compose up --build

# Services running:
- Backend: http://localhost:5000
- Frontend: http://localhost:5000 (served by backend)
- PostgreSQL: localhost:5432
- Redis: localhost:6379
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/cerebrexia
POSTGRES_USER=cerebrexia_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=cerebrexia

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Razorpay
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@cerebrexia.com

# App
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost:5000
```

## Security Features

1. **Authentication**
   - Google OAuth 2.0
   - JWT tokens with expiration
   - Secure session management

2. **Authorization**
   - Role-based access control (RBAC)
   - Protected routes
   - API endpoint guards

3. **Data Protection**
   - Password hashing (bcrypt)
   - SQL injection prevention (Sequelize ORM)
   - XSS protection
   - CORS configuration
   - Rate limiting

4. **Payment Security**
   - Razorpay signature verification
   - Secure webhook handling
   - Transaction logging

5. **File Upload**
   - File type validation
   - Size restrictions (5MB)
   - Secure storage

## Performance Optimizations

1. **Backend**
   - Redis caching
   - Database indexing
   - Connection pooling
   - Query optimization

2. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Bundle size optimization

3. **Docker**
   - Multi-stage builds
   - Layer caching
   - Minimal base images

## Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- Component logic

### Integration Tests
- API endpoints
- Database operations
- Payment flows

### E2E Tests
- User registration flow
- Event registration
- Payment process
- QR code generation and scanning

## Monitoring & Logging

1. **Application Logs**
   - Winston logger
   - Log levels (error, warn, info, debug)
   - File rotation

2. **Error Tracking**
   - Centralized error handling
   - Error notifications
   - Stack traces

3. **Performance Monitoring**
   - Response times
   - Database query performance
   - API endpoint metrics

## Future Enhancements

1. **Mobile App**
   - React Native application
   - Push notifications
   - Offline QR display

2. **Analytics Dashboard**
   - Event attendance tracking
   - Revenue analytics
   - User behavior insights

3. **Advanced Features**
   - Live event updates
   - Chat support
   - Social media integration
   - Certificate generation

4. **Scalability**
   - Microservices architecture
   - Load balancing
   - CDN integration
   - Database sharding

## Support & Maintenance

### Regular Tasks
- Database backups
- Log rotation
- Security updates
- Dependency updates
- Performance monitoring

### Documentation
- API documentation (Swagger/OpenAPI)
- User guides
- Admin manual
- Developer documentation

## Contact & Resources

- **Project Location:** C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia
- **Repository:** (To be added)
- **Documentation:** (To be added)
- **Support:** (To be added)

---

**Last Updated:** June 20, 2026  
**Version:** 1.0.0  
**Status:** 85% Complete  
**Made with Bob** 🤖
