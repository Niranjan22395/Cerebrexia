# 🔄 Force Render to Use New Docker Image

## ❌ Problem
Render is using an **OLD Docker image** that doesn't have the Redis URL fix. The logs show it's still trying to connect to `localhost:6379` instead of using the `REDIS_URL` environment variable.

## ✅ Solution: Manual Redeploy

### Option 1: Manual Deploy (Recommended) ⭐

1. **Go to Render Dashboard**
2. **Click on cerebrexia-app**
3. **Click "Manual Deploy"** button (top right)
4. **Select "Deploy latest commit"**
5. **Click "Deploy"**

This will force Render to:
- ✅ Pull your latest code from GitHub
- ✅ Build a NEW Docker image with the Redis fix
- ✅ Use the REDIS_URL environment variable

---

### Option 2: Push a Small Change to GitHub

If Manual Deploy doesn't work, push any small change:

1. **Make a tiny change** (add a comment to any file)
2. **Commit and push to GitHub**
3. **Render will auto-deploy** the new version

---

## 🎯 What Will Happen

### Before (Current - OLD Image):
```
❌ Connecting to Redis using REDIS_HOST/PORT
❌ Redis Client Error: connect ECONNREFUSED ::1:6379
❌ Timed Out
```

### After (NEW Image with Fix):
```
✅ Connecting to Redis using REDIS_URL
✅ Redis client connected
✅ Redis client ready
✅ Redis connection established successfully
✅ Database connected successfully
✅ Server is running on port 10000
```

---

## 📋 Complete Steps

### Step 1: Verify Environment Variables Are Set
Make sure these are in **cerebrexia-app** → **Environment** tab:

```
✅ REDIS_URL = redis://red-d8r5gaegvqtc73ej58m0:6379
✅ RAZORPAY_KEY_ID = rzp_test_dummy123456789
✅ RAZORPAY_KEY_SECRET = dummy_secret_key_abcdefghijklmnop
✅ DATABASE_URL = (auto-generated)
```

### Step 2: Manual Deploy
1. Go to **cerebrexia-app** service
2. Click **"Manual Deploy"** button (top right corner)
3. Select **"Deploy latest commit"**
4. Click **"Deploy"**

### Step 3: Watch the Logs
1. Go to **Logs** tab
2. Watch for these success messages:
   ```
   ✅ Connecting to Redis using REDIS_URL
   ✅ Redis client connected
   ✅ Server is running on port 10000
   ```

### Step 4: Verify It's Live
1. Wait 3-5 minutes for deployment
2. Open your app URL: `https://cerebrexia-app.onrender.com`
3. Test the home page

---

## 🚨 Why This Happened

Render was using a **cached Docker image** from before I fixed the Redis configuration. The fix I made:

**File:** `backend/src/config/redis.ts`

**What Changed:**
```typescript
// OLD (tries localhost)
redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',  // ❌ Falls back to localhost
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
});

// NEW (uses REDIS_URL)
const redisUrl = process.env.REDIS_URL;
if (redisUrl) {
  redisClient = createClient({
    url: redisUrl,  // ✅ Uses Render's Redis URL
  });
}
```

---

## ⏱️ Timeline

- **Manual Deploy:** 1 minute to trigger
- **Build & Deploy:** 3-5 minutes
- **Total:** ~5 minutes to live

---

## 🎉 Success Checklist

After Manual Deploy, verify:

- [ ] Logs show "Connecting to Redis using REDIS_URL"
- [ ] Logs show "Redis client connected"
- [ ] Logs show "Server is running on port 10000"
- [ ] No more "ECONNREFUSED ::1:6379" errors
- [ ] App status is "Live" (green)
- [ ] App URL opens successfully

---

## 📞 If Manual Deploy Button Not Found

If you don't see "Manual Deploy" button:

1. Go to **Settings** tab
2. Scroll to **"Build & Deploy"** section
3. Click **"Trigger Deploy"**
4. Select **"Clear build cache & deploy"**

This will force a complete rebuild with the new code.

---

**Made with Bob** 🤖

*The fix is ready in the code, Render just needs to use the NEW Docker image!*