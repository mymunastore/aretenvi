# 🚨 Deployment Issues - Complete Fix Guide

## Critical Issue Identified

Your Supabase ANON key has **expired** (expiration timestamp: 1758881574). This will cause your site to fail when connecting to Supabase.

## 🔧 Complete Fix - Step by Step

### Step 1: Get Fresh Supabase Credentials

1. **Go to Supabase Dashboard:**
   - Visit: https://app.supabase.com
   - Log in to your account

2. **Select Your Project:**
   - Click on your ARET Environmental project
   - Or create a new project if needed

3. **Get API Credentials:**
   - Go to **Settings** → **API**
   - Copy the following values:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon public key** (starts with `eyJ...`)
     - **service_role key** (for backend operations)

### Step 2: Update Environment Variables

**Update your `.env` file with the new credentials:**

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_NEW_ANON_KEY
```

### Step 3: Rebuild Your Project

Run these commands in your project directory:

```bash
# Clean old build
npm run clean

# Install dependencies
npm install

# Build with new credentials
npm run build
```

### Step 4: Update WordPress Theme (If Using WordPress)

```bash
# Copy new build to theme
cp -r dist/* react-wp-theme/react-app/

# Create new ZIP
zip -r react-wp-theme-updated.zip react-wp-theme/

# Upload to WordPress:
# 1. Go to Appearance → Themes
# 2. Delete old React WP Theme
# 3. Upload new react-wp-theme-updated.zip
# 4. Activate
```

### Step 5: Update Vercel/Netlify (If Using These Platforms)

#### For Vercel:

1. Go to your project dashboard on Vercel
2. Click **Settings** → **Environment Variables**
3. Update:
   - `VITE_SUPABASE_URL` = Your new URL
   - `VITE_SUPABASE_ANON_KEY` = Your new anon key
4. Click **Save**
5. Go to **Deployments** → Click **...** → **Redeploy**

#### For Netlify:

1. Go to your site dashboard on Netlify
2. Click **Site settings** → **Environment variables**
3. Update:
   - `VITE_SUPABASE_URL` = Your new URL
   - `VITE_SUPABASE_ANON_KEY` = Your new anon key
4. Click **Save**
5. Go to **Deploys** → **Trigger deploy** → **Deploy site**

### Step 6: Configure Supabase CORS

**CRITICAL:** Add your domain to Supabase allowed origins:

1. In Supabase Dashboard, go to **Settings** → **API**
2. Scroll to **CORS Allowed Origins**
3. Click **Add origin**
4. Add your domains (one per line):
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   http://localhost:5173
   ```
5. Click **Save**

### Step 7: Fix React Router (For All Platforms)

#### WordPress:
1. Go to **Settings** → **Permalinks**
2. Select **Post name**
3. Click **Save Changes**
4. This creates the `.htaccess` file needed for React Router

#### Vercel/Netlify:
Already configured in `vercel.json` and `netlify.toml`

### Step 8: Verify Database Tables Exist

Run this check to ensure your Supabase database has the required tables:

1. Go to Supabase Dashboard → **Table Editor**
2. Verify these tables exist:
   - `profiles`
   - `customers`
   - `service_plans`
   - `subscriptions`
   - `waste_collections`
   - `appointments`
   - `chat_messages`
   - `ai_configurations`

If tables are missing, the migrations need to be applied.

## 🐛 Common Issues & Solutions

### Issue 1: "Blank White Page"

**Cause:** Expired Supabase key or missing environment variables

**Fix:**
1. Update `.env` with fresh Supabase credentials
2. Rebuild: `npm run build`
3. Redeploy

### Issue 2: "Failed to fetch" or CORS errors

**Cause:** Domain not in Supabase CORS list

**Fix:**
1. Supabase Dashboard → Settings → API
2. Add your domain to CORS Allowed Origins
3. Wait 1-2 minutes for changes to propagate

### Issue 3: "404 on React routes"

**Cause:** Server not redirecting all routes to index.html

**Fix WordPress:**
```apache
# Add to .htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.php$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.php [L]
</IfModule>
```

**Fix Vercel/Netlify:**
Already configured in config files - just redeploy

### Issue 4: "CSS not loading / Unstyled content"

**Cause:** Asset paths incorrect or files missing

**Fix:**
1. Check browser console for 404 errors
2. Verify files exist in `dist/assets/` or `react-app/assets/`
3. Check file permissions (644 for files, 755 for folders)
4. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Issue 5: "Database connection failed"

**Cause:** RLS policies blocking access or wrong credentials

**Fix:**
1. Verify Supabase credentials are correct
2. Check RLS policies in Supabase Dashboard → Authentication → Policies
3. Test connection in browser console:
   ```javascript
   console.log(window.wpData); // Should show Supabase config
   ```

### Issue 6: "Site not found" / DNS errors

**Cause:** DNS not configured or not propagated

**Fix:**
1. Check DNS settings in your domain registrar (Hostinger)
2. For Vercel:
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com
3. For Netlify:
   - Get your Netlify DNS from site settings
   - Update A and CNAME records accordingly
4. Wait 15 minutes to 48 hours for propagation
5. Check status: https://dnschecker.org

## 🔍 Testing Checklist

After making fixes, test these:

- [ ] Site loads (no blank page)
- [ ] Homepage displays correctly
- [ ] All navigation links work
- [ ] React Router navigation works (no 404s)
- [ ] CSS/styles are applied
- [ ] Images load correctly
- [ ] Forms work (contact, quote requests)
- [ ] Supabase data loads (if you have any public data)
- [ ] Mobile view works
- [ ] Browser console shows no errors
- [ ] All pages are accessible

## 📋 Quick Diagnostic Commands

### Check if site is reachable:
```bash
curl -I https://yourdomain.com
```

### Check DNS propagation:
```bash
nslookup yourdomain.com
```

### Check SSL certificate:
```bash
curl -vI https://yourdomain.com 2>&1 | grep -i "ssl\|certificate"
```

## 🆘 Still Having Issues?

### Get Deployment Logs

**Vercel:**
1. Dashboard → Deployments → Click latest deployment
2. Check build logs for errors
3. Look for "Failed" status

**Netlify:**
1. Dashboard → Deploys → Click latest deploy
2. Check deploy log
3. Look for error messages

**WordPress:**
1. Enable debug mode in `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', false);
   ```
2. Check `wp-content/debug.log` for errors

### Browser Console Debugging

1. Open site in browser
2. Press F12 (or Cmd+Option+I on Mac)
3. Go to **Console** tab
4. Look for red errors
5. Go to **Network** tab
6. Refresh page
7. Check for failed requests (red status codes)

## 📞 Platform-Specific Support

### Hostinger Support:
- Live Chat: Available 24/7 in hPanel
- Knowledge Base: https://support.hostinger.com

### Vercel Support:
- Documentation: https://vercel.com/docs
- Help: https://vercel.com/help

### Netlify Support:
- Documentation: https://docs.netlify.com
- Support: https://www.netlify.com/support/

### Supabase Support:
- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com

## ✅ Final Verification

Once everything is working:

1. **Test from multiple devices:**
   - Desktop browser
   - Mobile phone
   - Tablet
   - Different browsers (Chrome, Firefox, Safari)

2. **Test all functionality:**
   - Navigation
   - Forms
   - Search
   - User registration (if applicable)
   - Data loading

3. **Check performance:**
   - Run Google PageSpeed Insights: https://pagespeed.web.dev
   - Aim for 90+ score

4. **Monitor for 24 hours:**
   - Check for any intermittent errors
   - Monitor error logs
   - Test during different times of day

---

## 🎯 Priority Fix Order

Do these in order for fastest resolution:

1. ✅ **Update Supabase credentials** (MOST CRITICAL)
2. ✅ **Rebuild project** (`npm run build`)
3. ✅ **Update CORS settings** in Supabase
4. ✅ **Redeploy** to your hosting platform
5. ✅ **Configure permalinks** (WordPress) or verify config files
6. ✅ **Test the site**
7. ✅ **Check browser console** for any remaining errors

**Start with Step 1 above and work through each step carefully. Your site should be accessible after completing these fixes!**
