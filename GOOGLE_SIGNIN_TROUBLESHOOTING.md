# Google Sign-In Button Troubleshooting Guide

## Current Configuration
- **Client ID**: `155072524943-sadag7v8m9igbvokanftvktl8s471d3j.apps.googleusercontent.com`
- **Application URL**: http://localhost:5000
- **Login Page**: http://localhost:5000/login

## Step-by-Step Troubleshooting

### 1. Verify Google Cloud Console Configuration

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and verify:

#### ✅ OAuth 2.0 Client ID Settings:
- **Application type**: Web application
- **Authorized JavaScript origins**: 
  - `http://localhost:5000`
  - `http://localhost`
- **Authorized redirect URIs**: 
  - `http://localhost:5000`
  - `http://localhost:5000/login`

#### ✅ APIs Enabled:
- Google+ API (or Google Identity Services)
- Google People API (optional but recommended)

### 2. Check Browser Console for Errors

1. Open http://localhost:5000/login
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for any errors related to:
   - Google Sign-In script loading
   - CORS errors
   - Client ID validation errors

**Common Errors:**
```
❌ "Invalid client_id" - Client ID is incorrect or not authorized
❌ "Not a valid origin for the client" - Origin not added to authorized origins
❌ "Failed to load resource" - Google script blocked or network issue
```

### 3. Verify Environment Variable is Loaded

Open browser console on the login page and type:
```javascript
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

**Expected Output**: `155072524943-sadag7v8m9igbvokanftvktl8s471d3j.apps.googleusercontent.com`

**If undefined**: The environment variable is not being loaded correctly.

### 4. Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Reload the page
4. Look for:
   - `https://accounts.google.com/gsi/client` - Should load successfully (Status 200)
   - Check if the script is being blocked by any extension or firewall

### 5. Verify Docker Build Included .env File

Run this command to check if the .env file was included in the build:
```powershell
docker exec cerebrexia-app cat /app/public/index.html
```

Look for the VITE_GOOGLE_CLIENT_ID in the built JavaScript files.

### 6. Hard Refresh Browser

Sometimes the browser caches the old version:
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### 7. Try Incognito/Private Mode

Open http://localhost:5000/login in an incognito/private window to rule out:
- Browser extensions blocking Google scripts
- Cached files
- Cookie issues

### 8. Check if Google Sign-In Button Element Exists

In browser console, run:
```javascript
document.getElementById('googleSignInButton');
```

**Expected**: Should return a div element
**If null**: The component is not rendering the button container

### 9. Verify Component State

Add this temporarily to see what's happening:

In browser console:
```javascript
// Check if clientId is being read
console.log('Client ID from env:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

// Check if Google script loaded
console.log('Google object:', window.google);
```

### 10. Manual Test - Add Debug Logging

If still not working, we can add debug logging to the GoogleLoginButton component.

## Quick Fixes

### Fix 1: Rebuild Without Cache
```powershell
cd C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Fix 2: Verify .env File Format
Open `frontend/.env` and ensure:
- No spaces before or after the `=`
- No quotes around the value
- No extra lines or characters

Should look exactly like:
```
VITE_GOOGLE_CLIENT_ID=155072524943-sadag7v8m9igbvokanftvktl8s471d3j.apps.googleusercontent.com
```

### Fix 3: Check Google Cloud Project Status
- Ensure the project is not suspended
- Verify billing is enabled (if required)
- Check quota limits haven't been exceeded

## Alternative: Use Admin Login

While troubleshooting Google Sign-In, you can use Admin Login:
- **Email**: admin@cerebrexia.com
- **Password**: Admin@123

## What Should Happen When Working

When Google Sign-In is properly configured, you should see:
1. A blue button with Google logo
2. Text: "Continue with Google"
3. Clicking it opens Google account selection popup
4. After selecting account, redirects to complete profile or dashboard

## Still Not Working?

If after all these steps the button still doesn't appear, please provide:

1. **Browser Console Output** (any errors or warnings)
2. **Network Tab Screenshot** (showing the gsi/client request)
3. **Google Cloud Console Screenshot** (OAuth client configuration)
4. **Output of this command**:
   ```powershell
   docker exec cerebrexia-app cat /app/public/assets/index-*.js | grep -i "VITE_GOOGLE_CLIENT_ID"
   ```

## Contact Information

If you need further assistance, please share:
- Browser and version
- Operating system
- Complete error messages from console
- Screenshots of the login page

---

**Last Updated**: 2026-06-20
**Docker Image**: cerebrexia-app:latest
**Client ID**: 155072524943-sadag7v8m9igbvokanftvktl8s471d3j.apps.googleusercontent.com