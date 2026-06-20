# Docker Setup & Troubleshooting Guide

## Current Status
✅ `.env` file created with all required environment variables
❌ Docker build failed due to network connectivity issue

## Issue Encountered
```
failed to fetch anonymous token: Get "https://auth.docker.io/token?...": 
dial tcp 142.182.19.19:443: connectex: No connection could be made because 
the target machine actively refused it.
```

## Solutions

### Solution 1: Ensure Docker Desktop is Running (RECOMMENDED)

1. **Start Docker Desktop**
   - Open Docker Desktop application
   - Wait until it shows "Docker Desktop is running"
   - Check the system tray icon (should be green/running)

2. **Verify Docker is Working**
   ```powershell
   docker --version
   docker ps
   ```

3. **Retry the Build**
   ```powershell
   cd C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia
   docker-compose build
   ```

### Solution 2: Check Network Connectivity

1. **Test Docker Hub Access**
   - Open browser and visit: https://hub.docker.com
   - If it doesn't load, you may have network/firewall issues

2. **Check Firewall Settings**
   - Windows Defender Firewall might be blocking Docker
   - Add Docker Desktop to allowed apps

3. **Restart Docker Desktop**
   - Right-click Docker Desktop icon → Quit Docker Desktop
   - Start Docker Desktop again
   - Wait for it to fully initialize

### Solution 3: Configure Proxy (If Behind Corporate Network)

If you're behind a corporate proxy, configure Docker proxy settings:

1. **Open Docker Desktop Settings**
   - Right-click Docker icon → Settings
   - Go to Resources → Proxies

2. **Enable Manual Proxy Configuration**
   ```
   HTTP Proxy: http://your-proxy:port
   HTTPS Proxy: http://your-proxy:port
   ```

3. **Apply & Restart**

### Solution 4: Alternative - Build Without Docker (Development Mode)

If Docker issues persist, you can run the application directly:

#### Backend Setup
```powershell
# Navigate to backend
cd C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia/backend

# Install dependencies
npm install

# Set up PostgreSQL (install locally or use cloud service)
# Update DATABASE_URL in .env to point to your PostgreSQL instance

# Set up Redis (install locally or use cloud service)
# Update REDIS_URL in .env to point to your Redis instance

# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

#### Frontend Setup
```powershell
# Open new terminal
cd C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia/frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

## Environment Variables Configuration

The `.env` file has been created with placeholder values. **You MUST update these before running:**

### Critical Variables to Update:

1. **Google OAuth** (Required for authentication)
   ```env
   GOOGLE_CLIENT_ID=your-actual-google-client-id
   GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
   ```
   - Get from: https://console.cloud.google.com/apis/credentials

2. **Razorpay** (Required for payments)
   ```env
   RAZORPAY_KEY_ID=your-actual-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-actual-razorpay-key-secret
   ```
   - Get from: https://dashboard.razorpay.com/app/keys

3. **Email Service** (Required for notifications)
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-actual-sendgrid-api-key
   ```
   - Get from: https://app.sendgrid.com/settings/api_keys

4. **JWT Secret** (Change for production)
   ```env
   JWT_SECRET=generate-a-secure-random-string-min-32-chars
   ```
   - Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

5. **QR Secret** (Change for production)
   ```env
   QR_SECRET=generate-another-secure-random-string-min-32-chars
   ```

## Complete Docker Build & Run Commands

Once Docker is working and environment variables are configured:

### Build the Docker Images
```powershell
cd C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia
docker-compose build
```

### Start All Services
```powershell
docker-compose up -d
```

### Check Service Status
```powershell
docker-compose ps
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Access the Application
- **Frontend & Backend**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Stop Services
```powershell
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)
```powershell
docker-compose down -v
```

## Troubleshooting Common Issues

### Issue: Port Already in Use
```
Error: bind: address already in use
```

**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Issue: Database Connection Failed
```
Error: connect ECONNREFUSED
```

**Solution:**
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check logs: `docker-compose logs postgres`
- Verify DATABASE_URL in .env matches docker-compose.yml settings

### Issue: Redis Connection Failed
```
Error: Redis connection to redis:6379 failed
```

**Solution:**
- Ensure Redis container is running: `docker-compose ps`
- Check logs: `docker-compose logs redis`
- Verify REDIS_URL in .env matches docker-compose.yml settings

### Issue: Build Takes Too Long
```
Building... (stuck)
```

**Solution:**
- Check Docker Desktop resources (Settings → Resources)
- Increase CPU and Memory allocation
- Clear Docker cache: `docker system prune -a`

## Next Steps After Successful Build

1. **Initialize Database**
   ```powershell
   docker-compose exec app npm run migrate
   ```

2. **Create Admin User** (if needed)
   ```powershell
   docker-compose exec app npm run seed
   ```

3. **Test the Application**
   - Open browser: http://localhost:5000
   - Try Google login
   - Test registration flow

4. **Monitor Logs**
   ```powershell
   docker-compose logs -f app
   ```

## Production Deployment Checklist

Before deploying to production:

- [ ] Update all environment variables with production values
- [ ] Change JWT_SECRET and QR_SECRET to secure random strings
- [ ] Configure production database (not Docker PostgreSQL)
- [ ] Configure production Redis (not Docker Redis)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure domain and DNS
- [ ] Set up backup strategy for database
- [ ] Configure monitoring and logging
- [ ] Set up CI/CD pipeline
- [ ] Review security checklist (SECURITY_CHECKLIST.md)

## Support

If issues persist:
1. Check Docker Desktop logs
2. Review DEPLOYMENT_GUIDE.md
3. Check system requirements (Docker Desktop, WSL2 for Windows)
4. Ensure Windows is up to date
5. Try restarting your computer

## Quick Reference

```powershell
# Build
docker-compose build

# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Restart specific service
docker-compose restart app

# Execute command in container
docker-compose exec app npm run migrate

# Shell access
docker-compose exec app sh