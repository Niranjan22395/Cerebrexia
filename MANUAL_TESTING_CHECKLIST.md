# Cerebrexia Platform - Manual Testing Checklist

## 📋 How to Use This Checklist

1. Open the application in your browser: http://localhost:5000
2. Follow each test step-by-step
3. Mark ✅ for Pass, ❌ for Fail
4. Note any issues in the "Notes" column
5. Take screenshots of any errors

---

## 🧪 Test Suite

### Section 1: Basic Functionality ⭐ HIGH PRIORITY

#### Test 1.1: Application Loads
- [ ] Navigate to http://localhost:5000
- [ ] Page loads without errors
- [ ] No console errors (F12 → Console)
- [ ] Home page displays correctly

**Expected**: Beautiful gradient homepage with stats

**Notes**: _______________________

---

#### Test 1.2: Navigation Menu
- [ ] Click "Home" → Goes to /
- [ ] Click "Events" → Goes to /events
- [ ] Click "Doctor Portal" → Goes to /doctor-portal
- [ ] Click "Login" → Goes to /login

**Expected**: All navigation links work

**Notes**: _______________________

---

#### Test 1.3: Home Page Buttons
- [ ] Click "Browse Events" button
- [ ] Should navigate to /events
- [ ] Click "Get Started" button
- [ ] Should navigate to /login

**Expected**: Buttons navigate correctly

**Notes**: _______________________

---

### Section 2: Admin Authentication ⭐ HIGH PRIORITY

#### Test 2.1: Admin Login Page
- [ ] Navigate to http://localhost:5000/login
- [ ] See yellow notice about Google Sign-In
- [ ] See "Continue to Admin Login" button
- [ ] Click the button

**Expected**: Admin login form appears

**Notes**: _______________________

---

#### Test 2.2: Admin Login - Valid Credentials
- [ ] Enter email: admin@cerebrexia.com
- [ ] Enter password: Admin@123
- [ ] Click "Sign In as Admin"
- [ ] Open Console (F12) and watch logs
- [ ] Check if redirects to /admin

**Expected**: 
- Success toast message
- Console shows login logs
- Redirects to /admin dashboard

**Console Logs to Look For**:
```
📝 [Admin Login] Starting login...
🌐 [Admin Login] Sending POST request...
✅ [Admin Login] Response received...
💾 [Admin Login] Calling setAuth...
🔐 [AuthStore] setAuth called...
✅ [AuthStore] State updated successfully
🔍 [Login useEffect] Triggered with...
🚀 [Login useEffect] Redirecting to /admin...
```

**Notes**: _______________________

---

#### Test 2.3: Admin Login - Invalid Credentials
- [ ] Enter email: wrong@email.com
- [ ] Enter password: wrongpass
- [ ] Click "Sign In as Admin"

**Expected**: 
- Error toast message
- Stays on login page
- No redirect

**Notes**: _______________________

---

#### Test 2.4: Check localStorage
- [ ] After successful login, press F12
- [ ] Go to Application tab
- [ ] Expand Local Storage
- [ ] Click http://localhost:5000
- [ ] Look for "auth-storage" key

**Expected**: 
- Key exists
- Contains: user, token, isAuthenticated: true

**Notes**: _______________________

---

### Section 3: Admin Dashboard ⭐ HIGH PRIORITY

#### Test 3.1: Admin Dashboard Access
- [ ] After login, verify URL is /admin
- [ ] Dashboard loads without errors
- [ ] See admin navigation/sidebar
- [ ] See dashboard stats/widgets

**Expected**: Admin dashboard displays

**Notes**: _______________________

---

#### Test 3.2: Admin Dashboard Stats
- [ ] Check if stats are displayed:
  - [ ] Total Users
  - [ ] Total Events
  - [ ] Total Registrations
  - [ ] Total Revenue

**Expected**: Stats cards visible

**Notes**: _______________________

---

### Section 4: Events Page

#### Test 4.1: Events List
- [ ] Navigate to /events
- [ ] Page loads without errors
- [ ] Events are displayed (if any)
- [ ] Can see event cards/list

**Expected**: Events page loads

**Notes**: _______________________

---

#### Test 4.2: Event Details
- [ ] Click on an event (if available)
- [ ] Event details page opens
- [ ] See event information
- [ ] See registration button

**Expected**: Event details display

**Notes**: _______________________

---

### Section 5: Doctor Portal

#### Test 5.1: Doctor Portal Page
- [ ] Navigate to /doctor-portal
- [ ] Page loads without errors
- [ ] See doctor registration form
- [ ] Form fields visible:
  - [ ] Name
  - [ ] Designation
  - [ ] Amount
  - [ ] Payment Mode (Cash/Online)

**Expected**: Doctor portal form displays

**Notes**: _______________________

---

#### Test 5.2: Doctor Registration Form
- [ ] Fill in Name: "Dr. Test"
- [ ] Fill in Designation: "Specialist"
- [ ] Fill in Amount: 5000
- [ ] Select Payment Mode: Cash
- [ ] Click Submit

**Expected**: Form submits successfully

**Notes**: _______________________

---

### Section 6: User Profile & Registration

#### Test 6.1: Profile Page (If Logged In)
- [ ] Navigate to /profile or /dashboard
- [ ] Page loads
- [ ] See user information
- [ ] Can edit profile

**Expected**: Profile page accessible

**Notes**: _______________________

---

#### Test 6.2: Complete Profile
- [ ] Fill in required fields
- [ ] Upload college ID (if required)
- [ ] Submit form

**Expected**: Profile updated successfully

**Notes**: _______________________

---

### Section 7: QR Code System

#### Test 7.1: My QR Codes Page
- [ ] Navigate to /my-qr
- [ ] Page loads
- [ ] See list of QR codes (if any)
- [ ] Each QR shows event details

**Expected**: QR codes page displays

**Notes**: _______________________

---

### Section 8: Payment Flow (If Razorpay Configured)

#### Test 8.1: Payment Modal
- [ ] Try to register for an event
- [ ] Payment modal opens
- [ ] Razorpay interface loads
- [ ] Can see amount

**Expected**: Payment modal works

**Notes**: _______________________

---

### Section 9: Responsive Design

#### Test 9.1: Mobile View
- [ ] Press F12
- [ ] Click device toolbar icon
- [ ] Select mobile device
- [ ] Check if layout adapts
- [ ] Navigation menu works
- [ ] Forms are usable

**Expected**: Mobile responsive

**Notes**: _______________________

---

### Section 10: Error Handling

#### Test 10.1: 404 Page
- [ ] Navigate to /nonexistent-page
- [ ] See 404 error page
- [ ] Can navigate back

**Expected**: 404 page displays

**Notes**: _______________________

---

#### Test 10.2: Network Errors
- [ ] Stop Docker containers
- [ ] Try to login
- [ ] See appropriate error message

**Expected**: Error handled gracefully

**Notes**: _______________________

---

## 📊 Test Results Summary

### Overall Status
- Total Tests: 25
- Passed: ___
- Failed: ___
- Skipped: ___

### Critical Issues Found
1. _______________________
2. _______________________
3. _______________________

### Minor Issues Found
1. _______________________
2. _______________________
3. _______________________

### Recommendations
1. _______________________
2. _______________________
3. _______________________

---

## 🎯 Priority Fixes Needed

### Must Fix (Blocking):
- [ ] _______________________
- [ ] _______________________

### Should Fix (Important):
- [ ] _______________________
- [ ] _______________________

### Nice to Fix (Enhancement):
- [ ] _______________________
- [ ] _______________________

---

## 📸 Screenshots

Attach screenshots of:
1. Successful admin login
2. Admin dashboard
3. Events page
4. Doctor portal
5. Any errors encountered

---

## ✅ Sign-Off

**Tested By**: _______________________
**Date**: _______________________
**Time**: _______________________
**Browser**: _______________________
**OS**: _______________________

**Overall Assessment**: 
⬜ Ready for Production
⬜ Needs Minor Fixes
⬜ Needs Major Fixes
⬜ Not Ready

**Comments**: 
_______________________
_______________________
_______________________

---

## 🚀 Next Steps After Testing

1. **If All Tests Pass**:
   - Document any minor issues
   - Prepare for deployment
   - Create user documentation

2. **If Tests Fail**:
   - Document exact failure points
   - Provide console logs
   - Provide screenshots
   - Report to development team

3. **Performance Testing**:
   - Test with multiple users
   - Test with large data sets
   - Monitor response times

4. **Security Testing**:
   - Test authentication
   - Test authorization
   - Test input validation

---

## 📞 Support

If you encounter issues:
1. Check console logs (F12 → Console)
2. Check network tab (F12 → Network)
3. Check localStorage (F12 → Application)
4. Review TESTING_GUIDE.md for detailed debugging
5. Review FIXES_APPLIED.md for known issues

---

**Happy Testing! 🎉**