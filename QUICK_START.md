# Cerebrexia - Quick Start Guide

## 🚀 Getting Started

This guide will help you set up and run the Cerebrexia Event Management Platform.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ and npm
- **PostgreSQL** 15+
- **Redis** 7+
- **Git**

### Additional Requirements

- Google Cloud Console account (for OAuth)
- Razorpay account (for payments)
- Email service account (SendGrid or AWS SES)

---

## 🛠️ Installation Steps

### 1. Clone the Repository

```bash
cd C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your credentials
# Use any text editor to fill in the required values
```

### 3. Configure Environment Variables

Edit `backend/.env` and fill in these critical values:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cerebrexia
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Secrets (generate strong random strings)
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay (from Razorpay Dashboard)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (SendGrid or AWS SES)
SMTP_PASSWORD=your_email_api_key
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb cerebrexia

# Run migrations (once migration files are created)
npm run migrate

# Seed initial data (optional)
npm run seed
```

### 5. Start Backend Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The backend API will be available at: `http://localhost:3000`

---

## 📁 Current Project Structure

```
Cerebrexia/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts      ✅ Created
│   │   │   └── redis.ts         ✅ Created
│   │   ├── middleware/
│   │   │   └── errorHandler.ts ✅ Created
│   │   ├── utils/
│   │   │   └── logger.ts        ✅ Created
│   │   ├── routes/              ⏳ To be created
│   │   ├── controllers/         ⏳ To be created
│   │   ├── services/            ⏳ To be created
│   │   ├── models/              ⏳ To be created
│   │   └── index.ts             ✅ Created
│   ├── package.json             ✅ Created
│   ├── tsconfig.json            ✅ Created
│   ├── .env.example             ✅ Created
│   └── .gitignore               ✅ Created
├── frontend/                    ⏳ To be created
├── docs/
│   ├── PROJECT_PLAN.md          ✅ Created
│   ├── TECHNICAL_ARCHITECTURE.md ✅ Created
│   ├── IMPLEMENTATION_ROADMAP.md ✅ Created
│   ├── DATABASE_SCHEMA.md       ✅ Created
│   ├── API_DOCUMENTATION.md     ✅ Created
│   └── SECURITY_CHECKLIST.md    ✅ Created
└── README.md                    ✅ Created
```

---

## 🔄 Next Steps

### Immediate Tasks

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/v1/auth/google/callback`
   - Copy Client ID and Secret to `.env`

3. **Set Up Razorpay**
   - Sign up at [Razorpay](https://razorpay.com/)
   - Get API keys from Dashboard
   - Copy to `.env`

4. **Set Up Email Service**
   - Sign up for [SendGrid](https://sendgrid.com/) or AWS SES
   - Get API key
   - Copy to `.env`

### Development Roadmap

#### Phase 1: Complete Backend Foundation (Week 1-2)
- [ ] Create database models
- [ ] Implement authentication routes
- [ ] Set up JWT middleware
- [ ] Create user management APIs

#### Phase 2: Core Features (Week 3-5)
- [ ] Event management system
- [ ] User registration and verification
- [ ] Admin dashboard APIs

#### Phase 3: Payment & QR (Week 6-9)
- [ ] Razorpay integration
- [ ] Promo code system
- [ ] QR code generation
- [ ] QR validation system

#### Phase 4: Email & Doctor Portal (Week 10-11)
- [ ] Email automation
- [ ] Email templates
- [ ] Doctor portal

#### Phase 5: Frontend (Week 12-14)
- [ ] React application setup
- [ ] User interface
- [ ] Admin dashboard UI

#### Phase 6: Testing & Deployment (Week 15-16)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Deployment setup

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

---

## 📚 Documentation

All comprehensive documentation is available in the project:

- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** - Complete project overview
- **[TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)** - System architecture
- **[IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)** - 16-week timeline
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Database design
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference
- **[SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)** - Security guidelines

---

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running:
```bash
# Windows
net start postgresql-x64-15

# Check status
pg_isready
```

**2. Redis Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Ensure Redis is running:
```bash
# Windows (if installed via Memurai or Redis for Windows)
redis-server

# Check connection
redis-cli ping
```

**3. TypeScript Errors**
```
Cannot find module 'express'
```
**Solution:** Install dependencies:
```bash
npm install
```

**4. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change PORT in `.env` or kill the process using port 3000

---

## 🔧 Development Commands

```bash
# Backend
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run database migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Seed database
npm run seed
```

---

## 📞 Support

If you encounter any issues:

1. Check the documentation in the `docs/` folder
2. Review the error logs in `backend/logs/`
3. Ensure all environment variables are set correctly
4. Verify all services (PostgreSQL, Redis) are running

---

## ✅ Checklist Before Starting Development

- [ ] Node.js 20+ installed
- [ ] PostgreSQL 15+ installed and running
- [ ] Redis 7+ installed and running
- [ ] Git installed
- [ ] Google OAuth credentials obtained
- [ ] Razorpay account created
- [ ] Email service account set up
- [ ] `.env` file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Database created
- [ ] All services running

---

## 🎯 Current Status

**✅ Completed:**
- Project planning and documentation
- Backend project structure
- Configuration files
- Database and Redis setup
- Error handling and logging
- Main server entry point

**⏳ In Progress:**
- Route implementations
- Controller logic
- Service layer
- Database models

**📋 Pending:**
- Authentication system
- Event management
- Payment integration
- QR code system
- Email automation
- Frontend application
- Testing
- Deployment

---

**Last Updated:** 2026-06-19  
**Version:** 1.0.0  
**Status:** Development Phase
