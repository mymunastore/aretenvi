# 🚨 URGENT: Fix Your Site Access Issue

## The Problem

Your site cannot be accessed because your **Supabase ANON key has expired**. This is blocking your entire application from loading.

## ⚡ Quick Fix (5 Minutes)

### Step 1: Get New Supabase Credentials (2 minutes)

1. **Open Supabase Dashboard:**
   - Go to: https://app.supabase.com
   - Log in to your account

2. **Get Your Project Credentials:**
   - Click on your project (or create new project if needed)
   - Click **Settings** (gear icon in sidebar)
   - Click **API**
   - You'll see two values you need:

   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 2: Update Your .env File (1 minute)

**Replace the values in your `.env` file:**

```env
VITE_SUPABASE_URL=https://YOUR-NEW-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-NEW-KEY-HERE
```

**CRITICAL:** Make sure you copy the ENTIRE anon key (it's very long, starts with `eyJ` and is about 200+ characters)

### Step 3: Rebuild Your Project (2 minutes)

Run these commands in your terminal:

```bash
# Clean old build
rm -rf dist

# Rebuild with new credentials
npm run build
```

### Step 4: Deploy Based on Your Platform

#### 🔹 If you're using VERCEL:

1. Go to your Vercel dashboard
2. Click your project
3. Click **Settings** → **Environment Variables**
4. Update both values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Go to **Deployments**
6. Click the **...** menu on latest deployment
7. Click **Redeploy**
8. Wait 1-2 minutes

#### 🔹 If you're using NETLIFY:

1. Go to your Netlify dashboard
2. Click your site
3. Click **Site settings** → **Environment variables**
4. Update both values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Save**
6. Go to **Deploys** tab
7. Click **Trigger deploy** → **Deploy site**
8. Wait 1-2 minutes

#### 🔹 If you're using WORDPRESS:

```bash
# Copy new build to theme
cp -r dist/* react-wp-theme/react-app/

# Create new ZIP
zip -r react-wp-theme-fixed.zip react-wp-theme/
```

Then upload to WordPress:
1. Go to WordPress Admin → **Appearance** → **Themes**
2. **Deactivate** and **Delete** old React WP Theme
3. Click **Add New** → **Upload Theme**
4. Upload `react-wp-theme-fixed.zip`
5. Click **Activate**

### Step 5: Configure CORS (CRITICAL - 1 minute)

1. Back in Supabase Dashboard
2. Go to **Settings** → **API**
3. Scroll down to **CORS Allowed Origins**
4. Add your site URL:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```
5. Click **Save**

## ✅ Test Your Site

After completing the steps above:

1. **Clear your browser cache:**
   - Chrome/Firefox: Press `Ctrl + Shift + R` (Windows)
   - Mac: Press `Cmd + Shift + R`

2. **Visit your site:**
   - Go to: `https://yourdomain.com`
   - Your site should now load properly

3. **Check browser console:**
   - Press `F12` to open DevTools
   - Click **Console** tab
   - There should be no red errors

## 🐛 Still Not Working?

### Common Issues:

**1. Site still blank:**
- Did you update BOTH the URL and KEY?
- Did you copy the ENTIRE anon key (very long)?
- Did you save the .env file?
- Did you rebuild (`npm run build`)?

**2. CORS errors in console:**
- Check Supabase Dashboard → Settings → API → CORS
- Make sure your domain is added
- Wait 2 minutes after adding

**3. 404 on routes (WordPress):**
- Go to **Settings** → **Permalinks**
- Select **Post name**
- Click **Save Changes**

**4. CSS not loading:**
- Hard refresh: `Ctrl + Shift + R`
- Check that files uploaded correctly
- Check file permissions (644 for files, 755 for folders)

### Check Deployment Status:

**Vercel:**
- Go to dashboard → Deployments
- Latest should say "Ready"
- Click to see build logs if failed

**Netlify:**
- Go to dashboard → Deploys
- Latest should say "Published"
- Click to see deploy log if failed

**WordPress:**
- Theme should appear in Appearance → Themes
- Should be activated (not just uploaded)

## 📞 Need More Help?

If your site is still not accessible after following these steps, provide:

1. **Which platform?** (Vercel/Netlify/WordPress/Other)
2. **Your site URL**
3. **Error message** from browser console (press F12)
4. **Screenshot** of the error (if possible)

## 🔍 Verify Your Credentials Are Valid

Test your new Supabase credentials:

1. Open browser console (F12)
2. Go to your Supabase Dashboard
3. Click **SQL Editor**
4. Run: `SELECT now();`
5. If it returns a timestamp, your project is working

## 📋 Checklist

Before considering the issue "fixed", verify:

- [ ] Updated `.env` file with new Supabase credentials
- [ ] Ran `npm run build` successfully
- [ ] Deployed to hosting platform
- [ ] Added domain to Supabase CORS settings
- [ ] Site loads without blank page
- [ ] No red errors in browser console
- [ ] Navigation works
- [ ] Styles are applied

---

## 🎯 Most Common Mistake

**Not copying the ENTIRE anon key!**

The anon key is VERY long (200+ characters). Make sure you copy all of it:
- It starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`
- It has two dots (.) in it
- It's about 15-20 lines long if you paste it in a text editor
- Don't add any spaces or line breaks

---

**Your site should be accessible within 5 minutes of completing these steps!**
