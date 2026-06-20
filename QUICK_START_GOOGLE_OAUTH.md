# 🚀 Quick Start: Google OAuth Setup

## ⚡ Fast Setup (5 Minutes)

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create/Select Project**:
   - Click "Select a project" → "New Project"
   - Name: `Cerebrexia`
   - Click "Create"

3. **Configure OAuth Consent Screen**:
   - Go to: **APIs & Services** → **OAuth consent screen**
   - Choose: **External**
   - Click "Create"
   - Fill in:
     - App name: `Cerebrexia`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue" (3 times)

4. **Create OAuth Client ID**:
   - Go to: **APIs & Services** → **Credentials**
   - Click "**+ CREATE CREDENTIALS**" → "**OAuth client ID**"
   - Application type: **Web application**
   - Name: `Cerebrexia Web`
   
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5000
     ```
   
   - **Authorized redirect URIs**:
     ```
     http://localhost:5000
     http://localhost:5000/login
     ```
   
   - Click "**CREATE**"
   
   - **COPY THE CLIENT ID** (looks like: `123456789-abc...xyz.apps.googleusercontent.com`)

### Step 2: Configure Cerebrexia

#### Option A: Using PowerShell Script (Easiest)

```powershell
cd C:\Users\NIRANJANKumar\Downloads\Java\Cerebrexia
.\setup-google-oauth.ps1
```

Follow the prompts and paste your Client ID when asked.

#### Option B: Manual Configuration

1. **Edit the .env file**:
   ```powershell
   notepad frontend\.env
   ```

2. **Add your Client ID**:
   ```env
   VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
   ```
   Replace `YOUR_CLIENT_ID_HERE` with the Client ID you copied

3. **Save and close**

4. **Rebuild Docker**:
   ```powershell
   docker-compose down
   docker-compose up --build -d
   ```

### Step 3: Test Google Sign-In

1. Open browser: http://localhost:5000/login
2. You should see the **Google Sign-In button**
3. Click it and sign in with your Google account
4. Complete your profile
5. Start using Cerebrexia! 🎉

## 🔍 Verification

After setup, you should see:
- ✅ Google Sign-In button on login page (not the yellow warning)
- ✅ Ability to click and authenticate with Google
- ✅ Profile completion page after first login
- ✅ Access to events and registration

## ❌ Troubleshooting

### Issue: Still seeing "Google Sign-In Not Configured"

**Solution**:
1. Check if `.env` file has the Client ID:
   ```powershell
   Get-Content frontend\.env | Select-String "VITE_GOOGLE_CLIENT_ID"
   ```
2. Make sure you rebuilt Docker after adding the Client ID
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: "redirect_uri_mismatch" error

**Solution**:
1. Go back to Google Cloud Console
2. **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Make sure these are in **Authorized redirect URIs**:
   - `http://localhost:5000`
   - `http://localhost:5000/login`
5. Click "Save"
6. Wait 5 minutes for changes to propagate

### Issue: "Access blocked: This app's request is invalid"

**Solution**:
1. Go to **OAuth consent screen**
2. Add your email to **Test users**
3. Click "Save"

### Issue: Button appears but doesn't work

**Solution**:
1. Open browser console (F12)
2. Check for errors
3. Make sure you're using the correct Client ID
4. Verify authorized origins include `http://localhost:5000`

## 📝 What You Need

- ✅ Google Account (any Gmail account)
- ✅ 5 minutes of time
- ✅ Internet connection
- ✅ Docker running

## 🎯 Expected Result

**Before Setup**:
```
┌─────────────────────────────────────┐
│  Google Sign-In Not Configured      │
│  Please use Admin Login below...    │
└─────────────────────────────────────┘
```

**After Setup**:
```
┌─────────────────────────────────────┐
│  [G] Sign in with Google            │
└─────────────────────────────────────┘
```

## 🔐 Security Notes

- ✅ Client ID is safe to expose (it's public)
- ❌ Never share Client Secret (not needed for this setup)
- ✅ Use different credentials for production
- ✅ Restrict domains in production

## 📚 Need More Help?

- **Detailed Guide**: See `GOOGLE_OAUTH_SETUP.md`
- **Google Docs**: https://developers.google.com/identity/sign-in/web
- **Video Tutorial**: Search "Google OAuth setup" on YouTube

## ⏱️ Time Estimate

- Google Cloud setup: **3 minutes**
- Cerebrexia configuration: **1 minute**
- Docker rebuild: **1 minute**
- **Total: ~5 minutes**

---

**Ready to start?** Run the setup script or follow Option B above! 🚀

**Made with Bob** 🤖