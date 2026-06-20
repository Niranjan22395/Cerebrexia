# 🔑 Add Dummy Razorpay Keys - Step by Step

## 📋 Dummy Values to Use

Copy these exact values:

```
RAZORPAY_KEY_ID=rzp_test_dummy123456789
RAZORPAY_KEY_SECRET=dummy_secret_key_abcdefghijklmnop
```

---

## 🎯 Step-by-Step Instructions

### Step 1: Open Render Dashboard

1. Go to: https://dashboard.render.com
2. Login with your account
3. You should see your services listed

### Step 2: Select Your App Service

1. Find **cerebrexia-app** in the list
2. Click on it to open the service details

### Step 3: Go to Environment Tab

1. Look for tabs at the top: **Events**, **Logs**, **Shell**, **Metrics**, **Environment**, **Settings**
2. Click on **Environment** tab

### Step 4: Add First Variable (RAZORPAY_KEY_ID)

1. Click the **"Add Environment Variable"** button
2. You'll see two input fields:
   - **Key:** (left field)
   - **Value:** (right field)

3. In the **Key** field, type exactly:
   ```
   RAZORPAY_KEY_ID
   ```

4. In the **Value** field, type exactly:
   ```
   rzp_test_dummy123456789
   ```

5. Click **"Save Changes"** button at the bottom

### Step 5: Add Second Variable (RAZORPAY_KEY_SECRET)

1. Click **"Add Environment Variable"** button again
2. In the **Key** field, type exactly:
   ```
   RAZORPAY_KEY_SECRET
   ```

3. In the **Value** field, type exactly:
   ```
   dummy_secret_key_abcdefghijklmnop
   ```

4. Click **"Save Changes"** button at the bottom

### Step 6: Wait for Automatic Redeployment

1. After saving, Render will show a message: **"Deploying..."**
2. Wait 2-3 minutes for the deployment to complete
3. The status will change from **"Deploying"** to **"Live"** (green)

### Step 7: Verify Deployment

1. Click on **"Logs"** tab
2. Scroll to the bottom
3. Look for these success messages:
   ```
   ✅ Server running on port 5000
   ✅ Connected to PostgreSQL
   ✅ Connected to Redis
   ```

4. If you see these, your app is working!

### Step 8: Access Your Application

1. Go back to the service overview
2. At the top, you'll see your app URL (something like):
   ```
   https://cerebrexia-app.onrender.com
   ```
3. Click on it or copy and paste in browser
4. Your Cerebrexia app should load!

---

## 📸 Visual Guide

### What You'll See:

**Environment Tab:**
```
┌─────────────────────────────────────────────────┐
│ Environment Variables                            │
├─────────────────────────────────────────────────┤
│ Key                    │ Value                   │
├────────────────────────┼─────────────────────────┤
│ NODE_ENV              │ production              │
│ PORT                  │ 5000                    │
│ DATABASE_URL          │ postgres://...          │
│ REDIS_URL             │ redis://...             │
│ JWT_SECRET            │ auto-generated          │
│ RAZORPAY_KEY_ID       │ rzp_test_dummy123...    │ ← ADD THIS
│ RAZORPAY_KEY_SECRET   │ dummy_secret_key...     │ ← ADD THIS
│ EMAIL_HOST            │ smtp.gmail.com          │
│ EMAIL_PORT            │ 587                     │
│ EMAIL_FROM            │ noreply@cerebrexia.com  │
└────────────────────────┴─────────────────────────┘

[Add Environment Variable] button
[Save Changes] button
```

---

## ⚠️ Important Notes

### About Dummy Keys:

1. **App Will Start:** ✅ Your application will run without errors
2. **Payment Won't Work:** ❌ Razorpay payment features will fail
3. **Other Features Work:** ✅ All other features (Events, Profile, Admin) will work fine
4. **For Testing Only:** These are dummy keys for testing the deployment

### When to Use Real Keys:

- When you want payment functionality to work
- When going to production
- Get real keys from: https://dashboard.razorpay.com

---

## 🐛 Troubleshooting

### Issue: Can't Find "Add Environment Variable" Button

**Solution:**
- Make sure you're on the **Environment** tab
- Scroll down if needed
- The button is usually at the bottom of the variables list

### Issue: Changes Not Saving

**Solution:**
- Make sure you clicked **"Save Changes"** button
- Wait for the confirmation message
- Refresh the page if needed

### Issue: App Still Not Working After Adding Keys

**Solution:**
1. Check **Logs** tab for errors
2. Make sure both variables are added (not just one)
3. Verify the variable names are EXACTLY as shown (case-sensitive)
4. Wait 3-5 minutes for deployment to complete

### Issue: Deployment Failed

**Solution:**
1. Go to **Logs** tab
2. Look for error messages
3. Common fixes:
   - Check all environment variables are set
   - Verify database is running
   - Verify Redis is running

---

## ✅ Success Checklist

After adding the dummy keys, verify:

- [ ] Both variables added (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)
- [ ] Clicked "Save Changes"
- [ ] Deployment status shows "Live" (green)
- [ ] Logs show "Server running on port 5000"
- [ ] App URL opens in browser
- [ ] Home page loads correctly
- [ ] Navigation works (can click on Events, Profile, etc.)

---

## 🎉 You're Done!

Your Cerebrexia app is now live on Render.com!

**Your App URL:**
```
https://cerebrexia-app.onrender.com
```

**What Works:**
- ✅ Home page
- ✅ Events browsing
- ✅ Profile management
- ✅ My Registrations
- ✅ Doctor Portal (UI only)
- ✅ Admin Dashboard
- ❌ Payment processing (needs real Razorpay keys)

**Next Steps:**
1. Test all pages
2. Share the URL with users
3. Get real Razorpay keys when ready for payments
4. Configure email settings (optional)

---

## 📞 Need Help?

If you're stuck:
1. Check the **Logs** tab in Render
2. Look for error messages
3. Verify all environment variables are set
4. Make sure database and Redis are running (green status)

---

**Created:** 2026-06-20
**Status:** ✅ Ready to use
**Dummy Keys:** Provided above
**Time to Complete:** 5 minutes