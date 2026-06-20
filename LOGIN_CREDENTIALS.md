# Cerebrexia Login Credentials

## 🔐 Admin Access

### Super Admin Account
- **Email**: `admin@cerebrexia.com`
- **Password**: `Admin@123`
- **Role**: Super Admin
- **Access**: Full system access including user management, event management, payments, and all admin features

## 🌐 Access URLs

- **Main Application**: http://localhost:5000
- **Login Page**: http://localhost:5000/login
- **Admin Dashboard**: http://localhost:5000/admin (after login)

## 📝 How to Login

### For Admin Users:
1. Go to http://localhost:5000/login
2. Click on "Admin Login" link at the bottom
3. Enter the admin credentials above
4. Click "Sign In as Admin"
5. You will be redirected to the admin dashboard

### For Regular Users:
1. Go to http://localhost:5000/login
2. Click "Sign in with Google" button
3. Complete your profile after Google authentication
4. Access event registration and other features

## 🗄️ Database Information

- **Host**: localhost
- **Port**: 5432
- **Database**: cerebrexia
- **User**: cerebrexia_user
- **Password**: cerebrexia_password

## 📊 Database Tables Created

- users (event participants)
- admin_users (admin accounts)
- events (70+ events)
- event_registrations
- payments
- doctor_payments
- qr_codes (daily unique, single-use)
- promo_codes (up to 200 active)
- promo_code_usage
- visitor_tracking
- email_logs

## 🔧 Useful Commands

### View Logs
```bash
docker-compose logs -f app
```

### Access Database
```bash
docker exec -it cerebrexia-postgres psql -U cerebrexia_user -d cerebrexia
```

### Restart Services
```bash
docker-compose restart
```

### Stop Services
```bash
docker-compose down
```

### Rebuild and Start
```bash
docker-compose up --build -d
```

## 📧 Test Email Addresses

For testing purposes, you can use these email formats:
- Admin: admin@cerebrexia.com
- Test User: test@example.com (via Google OAuth)

## 🎯 Key Features Available

1. **QR-Based Entry System** - Daily unique, single-use QR codes
2. **Event Management** - Create and manage 70+ events
3. **Payment Integration** - Razorpay for online payments
4. **Doctor Portal** - Separate payment system for doctors
5. **Promo Codes** - Support for up to 200 active codes
6. **Admin Dashboard** - Complete management interface
7. **Email Automation** - Professional email templates
8. **Visitor Tracking** - Automated reminder system

## 🚀 Next Steps

1. Login with admin credentials
2. Create some test events
3. Test the registration flow
4. Configure payment gateway (Razorpay keys needed)
5. Set up email service (SMTP configuration needed)
6. Configure Google OAuth (Client ID needed for production)

## 📞 Support

For any issues or questions, refer to the main README.md file or check the application logs.

---
**Made with Bob** 🤖