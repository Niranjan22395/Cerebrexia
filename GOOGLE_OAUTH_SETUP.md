# Google OAuth Setup Guide for Cerebrexia

## 🔐 Step-by-Step Google OAuth Configuration

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: **Cerebrexia Event Management**
4. Click "Create"

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for testing) or **Internal** (for organization only)
3. Click "Create"

4. Fill in the required information:
   - **App name**: Cerebrexia Event Management
   - **User support email**: Your email
   - **App logo**: (Optional) Upload Cerebrexia logo
   - **Application home page**: http://localhost:5000
   - **Authorized domains**: localhost (for development)
   - **Developer contact information**: Your email

5. Click "Save and Continue"

6. **Scopes**: Click "Add or Remove Scopes"
   - Select: `email`
   - Select: `profile`
   - Select: `openid`
   - Click "Update" → "Save and Continue"

7. **Test users** (if using External):
   - Add your email addresses for testing
   - Click "Save and Continue"

8. Review and click "Back to Dashboard"

### Step 4: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "OAuth client ID"
3. Select **Application type**: Web application
4. **Name**: Cerebrexia Web Client

5. **Authorized JavaScript origins**:
   ```
   http://localhost:5000
   http://localhost:5173
   ```

6. **Authorized redirect URIs**:
   ```
   http://localhost:5000
   http://localhost:5000/login
   http://localhost:5173
   ```

7. Click "Create"

8. **IMPORTANT**: Copy the **Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

### Step 5: Configure Cerebrexia Application

#### Option A: Using .env file (Recommended for Development)

1. Create/Edit `.env` file in the frontend directory:
   ```bash
   cd C:/Users/NIRANJANKumar/Downloads/Java/Cerebrexia/frontend
   ```

2. Add this line to `.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
   ```
   Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID

#### Option B: Using Docker Environment Variables

1. Edit `docker-compose.yml`:
   ```yaml
   services:
     app:
       environment:
         - VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
   ```

2. Rebuild Docker:
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

### Step 6: Test Google Sign-In

1. Go to http://localhost:5000/login
2. You should now see the Google Sign-In button
3. Click it and sign in with your Google account
4. Complete your profile after first login

## 🚀 Quick Setup (For Testing)

If you want to test immediately, I can provide a test Client ID, but **DO NOT use in production**:

### Test Configuration (Development Only)

Create `frontend/.env`:
```env
# DEVELOPMENT ONLY - Replace with your own Client ID
VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

## 🔧 Troubleshooting

### Issue: "Google Sign-In Not Configured" message
**Solution**: Make sure VITE_GOOGLE_CLIENT_ID is set in `.env` file

### Issue: "redirect_uri_mismatch" error
**Solution**: Add your URL to Authorized redirect URIs in Google Cloud Console

### Issue: "Access blocked: This app's request is invalid"
**Solution**: 
1. Check OAuth consent screen is configured
2. Add your email to test users (if using External)
3. Make sure scopes (email, profile, openid) are added

### Issue: Button not showing after configuration
**Solution**: 
1. Clear browser cache
2. Rebuild Docker: `docker-compose up --build -d`
3. Check browser console for errors

## 📝 Environment Variables Reference

### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Backend (.env)
```env
# Google OAuth (for backend verification - optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## 🔒 Security Notes

1. **Never commit** `.env` files to Git
2. **Never share** your Client Secret publicly
3. **Use different** Client IDs for development and production
4. **Restrict** authorized domains in production
5. **Enable** additional security features in Google Cloud Console

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [OAuth Consent Screen](https://support.google.com/cloud/answer/10311615)

## ✅ Verification Checklist

- [ ] Google Cloud Project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Client ID copied
- [ ] `.env` file created with VITE_GOOGLE_CLIENT_ID
- [ ] Docker rebuilt
- [ ] Google Sign-In button appears on login page
- [ ] Successfully signed in with Google account
- [ ] Profile completion works

---

**Need Help?** Check the troubleshooting section or refer to Google's official documentation.

**Made with Bob** 🤖