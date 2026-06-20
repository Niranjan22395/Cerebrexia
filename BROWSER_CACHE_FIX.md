# Browser Cache Fix Guide

## Issue
After login, the browser is showing the Home page instead of My Registrations page due to cached JavaScript files.

## Verification
The deployed code DOES contain the correct redirect:
```javascript
window.location.href="/my-registrations"
```

## Solution: Clear Browser Cache

### Method 1: Hard Refresh (Recommended)
1. **Windows/Linux:** Press `Ctrl + Shift + R` or `Ctrl + F5`
2. **Mac:** Press `Cmd + Shift + R`

### Method 2: Clear Cache via Browser Settings

#### Chrome/Edge:
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Time range: "Last hour" or "All time"
4. Click "Clear data"

#### Firefox:
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Click "Clear Now"

### Method 3: Incognito/Private Mode (Quick Test)
1. Open new Incognito/Private window
2. Navigate to http://localhost:5000
3. Try login - should work correctly

### Method 4: Developer Tools (For Testing)
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache" checkbox
4. Keep DevTools open while testing
5. Refresh page (F5)

## Expected Behavior After Cache Clear

### Login Flow:
1. Go to http://localhost:5000/login
2. Enter credentials:
   - Email: test@example.com
   - Password: your_password
3. Click "Sign In"
4. **Should redirect to:** http://localhost:5000/my-registrations
5. **Should see:** Your registrations page with QR codes

### What You'll See:
- ✅ My Registrations page with your event registrations
- ✅ QR codes for entry
- ✅ Event details
- ✅ Navigation menu with "My Registrations" highlighted

## Troubleshooting

### If still showing Home page:
1. Check browser console (F12 → Console tab)
2. Look for any errors
3. Verify you're logged in (check for user name in header)
4. Try Method 3 (Incognito mode) to confirm it's a cache issue

### If you see errors:
1. Check Network tab in DevTools
2. Look for failed requests
3. Verify backend is running: `docker-compose ps`
4. Check backend logs: `docker-compose logs app`

## Verification Steps

After clearing cache, verify:
1. ✅ Login redirects to /my-registrations
2. ✅ User name appears in header
3. ✅ Can see registered events
4. ✅ Can view QR codes
5. ✅ Navigation menu works

## Why This Happened

The browser cached the old JavaScript file that had:
```javascript
window.location.href="/dashboard"  // Old code
```

The new deployed code has:
```javascript
window.location.href="/my-registrations"  // New code
```

But the browser is still using the cached old file.

## Prevention for Future

To prevent this in production:
1. Use cache-busting with versioned filenames (Vite does this automatically)
2. Set proper cache headers
3. Use service workers for better cache control
4. Implement version checking

## Quick Test Command

To verify the deployed code has the fix:
```bash
docker-compose exec app cat /app/public/assets/index-*.js | grep "my-registrations"
```

Should show: `window.location.href="/my-registrations"`

## Need Help?

If the issue persists after clearing cache:
1. Share browser console errors
2. Share Network tab screenshot
3. Confirm which browser and version you're using
4. Try a different browser to isolate the issue