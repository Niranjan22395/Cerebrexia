# Cerebrexia - Complete Testing Guide

## 🔧 CRITICAL FIX APPLIED

### Issue Fixed: Missing User Data Fields
**Problem:** Login was redirecting to home page because user data was incomplete
**Solution:** Updated backend to return all required user fields (role, isVerified, createdAt, updatedAt)

### Changes Made:
1. ✅ Updated simple-auth login endpoint to return complete user object
2. ✅ Updated simple-auth register endpoint to set default role and isVerified
3. ✅ Updated simple-auth /me endpoint to return all fields
4. ✅ Docker container rebuilt with fixes

---

## 🧪 STEP-BY-STEP TESTING INSTRUCTIONS

### Step 1: Clear Browser Cache (IMPORTANT!)
Before testing, you MUST clear your browser cache:

**Method 1 - Hard Refresh:**
- Windows/Linux: Press `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: Press `Cmd + Shift + R`

**Method 2 - Clear Cache:**
- Chrome/Edge: Press `Ctrl + Shift + Delete` → Select "Cached images and files" → Click "Clear data"
- Firefox: Press `Ctrl + Shift + Delete` → Select "Cache" → Click "Clear Now"

**Method 3 - Incognito Mode (Recommended for Testing):**
- Open a new Incognito/Private window
- Navigate to http://localhost:5000

---

### Step 2: Test Registration Flow

1. **Navigate to Login Page**
   - URL: http://localhost:5000/login
   - Should see "Welcome Back" heading

2. **Switch to Register Mode**
   - Click "Don't have an account? Register" button
   - Heading should change to "Create Account"

3. **Fill Registration Form**
   ```
   Full Name: John Doe
   Email: john@example.com
   Date of Birth: 1990-01-01
   Password: password123
   ```

4. **Submit Registration**
   - Click "Create Account" button
   - Should see success alert: "Registration successful! Please login."
   - Form should automatically switch to Login mode

5. **Verify Registration**
   - Check that form is now in Login mode
   - Email field should be empty (ready for login)

---

### Step 3: Test Login Flow

1. **Enter Login Credentials**
   ```
   Email: john@example.com
   Password: password123
   ```

2. **Submit Login**
   - Click "Sign In" button
   - Should see success alert: "Login successful!"

3. **Verify Redirect**
   - **SHOULD REDIRECT TO:** http://localhost:5000/my-registrations
   - **SHOULD NOT:** Stay on home page or login page

4. **Verify Authentication State**
   - Check browser console (F12 → Console tab)
   - Should see logs:
     ```
     🔐 [AuthStore] setAuth called with: {userId, userEmail, userRole, tokenLength}
     ✅ [AuthStore] State updated successfully
     💾 [AuthStore] Persisted to localStorage: Yes
     ```

5. **Verify User Interface**
   - Header should show user name: "John Doe"
   - Navigation menu should show:
     - Home
     - Events
     - Doctor Portal
     - My Registrations (highlighted)
     - Profile
     - Admin Dashboard (if admin role)
     - Logout button

---

### Step 4: Test My Registrations Page

1. **Verify Page Load**
   - URL should be: http://localhost:5000/my-registrations
   - Page title: "My Registrations"

2. **Check Content**
   - If no registrations: Should see "No Registrations Yet" message
   - Should see "Browse Events" button

3. **Test Navigation**
   - Click "Browse Events" button
   - Should navigate to /events page

---

### Step 5: Test Events Page

1. **Navigate to Events**
   - Click "Events" in navigation menu
   - OR click "Browse Events" button
   - URL: http://localhost:5000/events

2. **Verify Events Display**
   - Should see event cards (if events exist in database)
   - Should see search bar
   - Should see category filters

3. **Test Event Registration**
   - Click on any event card
   - Should navigate to event details page
   - Click "Register Now" button
   - Should see payment modal or registration form

---

### Step 6: Test Profile Page

1. **Navigate to Profile**
   - Click user name in header dropdown
   - Click "Profile" option
   - URL: http://localhost:5000/profile

2. **Verify Profile Data**
   - Should see user information:
     - Name: John Doe
     - Email: john@example.com
     - Profile Completed: ✓
     - Verified: ✗ (initially)

3. **Test Profile Edit**
   - Click "Edit Profile" button
   - Should see editable form

---

### Step 7: Test Doctor Portal

1. **Navigate to Doctor Portal**
   - Click "Doctor Portal" in navigation menu
   - URL: http://localhost:5000/doctor-portal

2. **Verify Portal Access**
   - Should see "Doctor Payment Portal" heading
   - Should see payment form
   - Should see Finance QR code

3. **Test Doctor Registration**
   - Fill form:
     ```
     Full Name: Dr. Smith
     Designation: Cardiologist
     Email: dr.smith@hospital.com
     Phone: +91 1234567890
     Payment Amount: 5000
     Payment Mode: Online
     ```
   - Click "Proceed to Payment"
   - Should initiate Razorpay payment (if configured)

---

### Step 8: Test Admin Dashboard (Admin Users Only)

1. **Create Admin User**
   - Register a new user
   - Manually update database to set role='admin':
     ```sql
     UPDATE users SET role='admin' WHERE email='admin@example.com';
     ```

2. **Login as Admin**
   - Login with admin credentials
   - Should see "Admin Dashboard" in navigation

3. **Navigate to Admin Dashboard**
   - Click "Admin Dashboard"
   - URL: http://localhost:5000/admin

4. **Verify Admin Features**
   - Should see statistics cards:
     - Total Users
     - Total Events
     - Total Registrations
     - Total Revenue
     - Pending Verifications
     - Active Promo Codes
   - Should see Quick Actions buttons

5. **Test Admin Pages**
   - Click "Manage Users" → Should navigate to /admin/users
   - Click "Manage Events" → Should navigate to /admin/events
   - Click "View Payments" → Should navigate to /admin/payments
   - Click "Promo Codes" → Should navigate to /admin/promo-codes

---

### Step 9: Test Logout

1. **Logout**
   - Click user name in header
   - Click "Logout" button

2. **Verify Logout**
   - Should redirect to home page
   - Header should show "Login" button (not user name)
   - localStorage should be cleared

3. **Test Protected Route Access**
   - Try to access: http://localhost:5000/my-registrations
   - Should redirect to /login page

---

## 🔍 VERIFICATION CHECKLIST

### Authentication ✅
- [ ] Registration creates new user
- [ ] Login authenticates user
- [ ] Token stored in localStorage
- [ ] User data includes all required fields (role, isVerified, etc.)
- [ ] Logout clears authentication

### Navigation ✅
- [ ] After login, redirects to /my-registrations
- [ ] Header shows user name
- [ ] Navigation menu shows correct options
- [ ] Protected routes require authentication
- [ ] Admin routes require admin role

### Pages ✅
- [ ] Home page loads
- [ ] Events page loads and displays events
- [ ] Event details page loads
- [ ] My Registrations page loads
- [ ] Profile page loads
- [ ] Doctor Portal page loads
- [ ] Admin Dashboard loads (for admins)

### Features ✅
- [ ] Event search works
- [ ] Event filtering works
- [ ] Event registration works
- [ ] Payment integration works
- [ ] QR code generation works
- [ ] Profile editing works
- [ ] Admin user management works

---

## 🐛 TROUBLESHOOTING

### Issue: Still redirecting to home page after login

**Solution 1: Clear Browser Cache**
- Hard refresh: `Ctrl + Shift + R`
- Or use Incognito mode

**Solution 2: Check Console for Errors**
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

**Solution 3: Verify Backend Response**
- Open DevTools → Network tab
- Login and check the response from `/simple-auth/login`
- Should include:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "...",
        "email": "...",
        "name": "...",
        "role": "user",
        "isVerified": false,
        "profileCompleted": true,
        "createdAt": "...",
        "updatedAt": "..."
      },
      "token": "..."
    }
  }
  ```

### Issue: Cannot access admin dashboard

**Solution:**
- Admin dashboard requires admin role
- Update user role in database:
  ```sql
  UPDATE users SET role='admin' WHERE email='your@email.com';
  ```
- Logout and login again

### Issue: Events not showing

**Solution:**
- Events need to be created in database
- Use admin dashboard to create events
- Or insert sample events via SQL

### Issue: Payment not working

**Solution:**
- Razorpay keys must be configured in .env
- Check backend logs for payment errors
- Verify Razorpay account is active

---

## 📊 EXPECTED BEHAVIOR SUMMARY

### After Successful Login:
1. ✅ User sees success alert
2. ✅ Redirected to `/my-registrations`
3. ✅ Header shows user name
4. ✅ Navigation menu shows user options
5. ✅ Can access all user pages
6. ✅ Can browse and register for events
7. ✅ Can view profile and QR codes
8. ✅ Can logout

### Admin Users Additionally:
1. ✅ See "Admin Dashboard" in navigation
2. ✅ Can access /admin routes
3. ✅ Can manage users, events, payments
4. ✅ Can view statistics and reports

---

## 🎯 SUCCESS CRITERIA

The system is working correctly when:
- ✅ Registration creates user with complete data
- ✅ Login returns complete user object with role and isVerified
- ✅ After login, user is redirected to /my-registrations
- ✅ User can navigate to all pages
- ✅ Protected routes work correctly
- ✅ Admin routes work for admin users
- ✅ All features are accessible and functional

---

## 📝 NOTES

- **Database:** PostgreSQL running on port 5432
- **Backend:** Node.js/Express on port 5000
- **Frontend:** React served by backend on port 5000
- **Redis:** Running on port 6379
- **Docker:** All services running in containers

---

**Last Updated:** 2026-06-20  
**Status:** Ready for Testing  
**Docker:** Rebuilt with fixes ✅