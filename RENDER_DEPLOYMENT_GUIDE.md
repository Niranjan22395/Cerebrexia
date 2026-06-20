# 🚀 Cerebrexia - Render.com Deployment Guide

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Render.com Account** - Sign up at https://render.com (free tier available)
3. **PostgreSQL Database** - Will be created on Render
4. **Redis Instance** - Will be created on Render

---

## 🔧 Step 1: Prepare Your Code for Deployment

### 1.1 Push Code to GitHub

```bash
cd C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Cerebrexia Event Management Platform"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/cerebrexia.git

# Push to GitHub
git push -u origin main
```

### 1.2 Create render.yaml (Blueprint File)

This file tells Render how to deploy your application.

**Location:** `C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia/render.yaml`

```yaml
services:
  # PostgreSQL Database
  - type: pserv
    name: cerebrexia-postgres
    env: docker
    plan: free
    region: singapore
    databases:
      - name: cerebrexia
        user: cerebrexia
        
  # Redis Instance
  - type: redis
    name: cerebrexia-redis
    plan: free
    region: singapore
    maxmemoryPolicy: allkeys-lru
    
  # Web Service (Backend + Frontend)
  - type: web
    name: cerebrexia-app
    env: docker
    region: singapore
    plan: free
    dockerfilePath: ./Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: DATABASE_URL
        fromDatabase:
          name: cerebrexia-postgres
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: cerebrexia-redis
          type: redis
          property: connectionString
      - key: RAZORPAY_KEY_ID
        sync: false
      - key: RAZORPAY_KEY_SECRET
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: EMAIL_HOST
        value: smtp.gmail.com
      - key: EMAIL_PORT
        value: 587
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASSWORD
        sync: false
      - key: EMAIL_FROM
        value: noreply@cerebrexia.com
```

---

## 🌐 Step 2: Deploy on Render.com

### 2.1 Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### 2.2 Create New Blueprint

1. **Dashboard** → Click "New +" → Select "Blueprint"
2. **Connect Repository:**
   - Select your GitHub repository: `cerebrexia`
   - Branch: `main`
3. **Blueprint Name:** `cerebrexia-platform`
4. Click "Apply"

Render will automatically:
- Create PostgreSQL database
- Create Redis instance
- Build and deploy your Docker container
- Set up environment variables

### 2.3 Configure Environment Variables

After deployment starts, go to each service and add missing environment variables:

#### For `cerebrexia-app` service:

1. Go to **Dashboard** → **cerebrexia-app** → **Environment**
2. Add these variables:

```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**Note:** For Gmail, use App Password (not regular password):
- Go to Google Account → Security → 2-Step Verification → App Passwords
- Generate password for "Mail"

---

## 🗄️ Step 3: Initialize Database

### 3.1 Connect to PostgreSQL

1. Go to **Dashboard** → **cerebrexia-postgres**
2. Click **Connect** → Copy the **External Connection String**
3. Use a PostgreSQL client (like pgAdmin or DBeaver) to connect

### 3.2 Run Database Schema

Execute the SQL schema to create all tables:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    college_name VARCHAR(255),
    year INTEGER,
    department VARCHAR(255),
    date_of_birth DATE,
    college_id_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'pending',
    profile_completed BOOLEAN DEFAULT false,
    role VARCHAR(50) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    registration_fee DECIMAL(10, 2) DEFAULT 0,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    venue VARCHAR(255),
    rules TEXT,
    prizes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Event Registrations table
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_id VARCHAR(255),
    registration_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    promo_code VARCHAR(50),
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- QR Codes table
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES event_registrations(id) ON DELETE CASCADE,
    qr_token TEXT UNIQUE NOT NULL,
    qr_code_url TEXT,
    valid_date DATE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Promo Codes table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctor Payments table
CREATE TABLE doctor_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    receipt_url TEXT,
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_qr_codes_token ON qr_codes(qr_token);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
```

---

## 🔍 Step 4: Verify Deployment

### 4.1 Check Service Status

1. Go to **Dashboard**
2. Verify all services are **Live** (green):
   - ✅ cerebrexia-postgres
   - ✅ cerebrexia-redis
   - ✅ cerebrexia-app

### 4.2 Access Your Application

1. Click on **cerebrexia-app**
2. Copy the **URL** (e.g., `https://cerebrexia-app.onrender.com`)
3. Open in browser
4. You should see the Cerebrexia home page!

### 4.3 Test Features

- ✅ Home page loads
- ✅ Navigation works
- ✅ Events page accessible
- ✅ Profile page accessible
- ✅ Doctor Portal accessible
- ✅ Admin Dashboard accessible

---

## 🐛 Troubleshooting

### Issue 1: Build Fails

**Check Logs:**
1. Go to **cerebrexia-app** → **Logs**
2. Look for error messages

**Common Fixes:**
- Ensure `Dockerfile` is in root directory
- Check `package.json` files exist in both `backend/` and `frontend/`
- Verify all dependencies are listed

### Issue 2: Database Connection Error

**Fix:**
1. Go to **cerebrexia-app** → **Environment**
2. Verify `DATABASE_URL` is set correctly
3. Check **cerebrexia-postgres** is running

### Issue 3: Application Crashes

**Check:**
1. **Logs** for error messages
2. **Environment Variables** are all set
3. **Database schema** is created

### Issue 4: Slow Performance (Free Tier)

**Note:** Render free tier has limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Limited CPU and memory

**Solution:** Upgrade to paid plan for production use

---

## 💰 Pricing (as of 2024)

### Free Tier:
- ✅ PostgreSQL: 1GB storage
- ✅ Redis: 25MB
- ✅ Web Service: 750 hours/month
- ⚠️ Spins down after 15 min inactivity

### Starter Plan ($7/month):
- ✅ No spin-down
- ✅ Better performance
- ✅ Custom domains

---

## 🔒 Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Set strong `JWT_SECRET`
- [ ] Configure proper CORS settings
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set up proper email service
- [ ] Configure Razorpay production keys
- [ ] Review database permissions
- [ ] Set up monitoring and alerts

---

## 📊 Monitoring

### View Logs:
1. **Dashboard** → **cerebrexia-app** → **Logs**
2. Real-time log streaming
3. Filter by severity

### Metrics:
1. **Dashboard** → **cerebrexia-app** → **Metrics**
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## 🔄 Updates and Redeployment

### Automatic Deployment:

Render automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main
```

Render will:
1. Detect the push
2. Rebuild Docker image
3. Deploy new version
4. Zero-downtime deployment

### Manual Deployment:

1. **Dashboard** → **cerebrexia-app**
2. Click **Manual Deploy** → **Deploy latest commit**

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain:

1. **Dashboard** → **cerebrexia-app** → **Settings**
2. Scroll to **Custom Domains**
3. Click **Add Custom Domain**
4. Enter your domain: `cerebrexia.com`
5. Add DNS records as instructed:
   ```
   Type: CNAME
   Name: www
   Value: cerebrexia-app.onrender.com
   ```
6. Wait for DNS propagation (5-30 minutes)
7. SSL certificate automatically provisioned

---

## 📞 Support

### Render Support:
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### Application Issues:
- Check logs first
- Review environment variables
- Verify database connection
- Test locally with Docker

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `render.yaml` created
- [ ] Blueprint deployed on Render
- [ ] All services running (green status)
- [ ] Environment variables configured
- [ ] Database schema created
- [ ] Application accessible via URL
- [ ] All features tested
- [ ] Logs reviewed for errors
- [ ] Monitoring set up

---

## 🎉 Success!

Your Cerebrexia Event Management Platform is now live on Render.com!

**Next Steps:**
1. Share the URL with users
2. Monitor logs and metrics
3. Set up custom domain (optional)
4. Upgrade to paid plan for production
5. Configure email service properly
6. Add Razorpay production keys

---

**Deployment Date:** 2026-06-20
**Platform:** Render.com
**Status:** ✅ Ready for Production