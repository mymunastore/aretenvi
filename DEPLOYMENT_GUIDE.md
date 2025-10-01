# Deployment Guide: React App to Vercel/Netlify with Hostinger Domain

This guide will help you deploy your React application to Vercel or Netlify while using your custom domain from Hostinger.

---

## Prerequisites

Before starting, make sure you have:
- [ ] A GitHub account (or GitLab/Bitbucket)
- [ ] Your code pushed to a Git repository
- [ ] Access to your Hostinger account
- [ ] Your Supabase project URL and API keys ready

---

## Part 1: Deploy to Vercel (Recommended - Easiest)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **Continue with GitHub** (recommended for easy integration)
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Project

1. Once logged in, click **Add New** → **Project**
2. Select **Import Git Repository**
3. Find your repository in the list and click **Import**
4. Vercel will automatically detect it's a Vite project

### Step 3: Configure Build Settings

Vercel should auto-detect these settings, but verify:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Click **Deploy** (don't worry about environment variables yet)

### Step 4: Add Environment Variables

After the first deployment:
1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables (get values from your `.env` file):

**Required Variables:**
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Optional but Recommended:**
```
VITE_API_BASE_URL=https://yourdomain.com
NODE_ENV=production
VITE_APP_VERSION=0.1.0
```

**AI Features (if you're using them):**
```
OPENAI_API_KEY=your-openai-api-key
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_SEMANTIC_SEARCH=true
VITE_DEFAULT_CHAT_MODEL=gpt-4o-mini
```

**WhatsApp Integration (if configured):**
```
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCESS_TOKEN=your-access-token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-token
```

**Payment Gateway (if using Stripe or Paystack):**
```
STRIPE_PUBLISHABLE_KEY=your-stripe-public-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
```

4. Click **Save** after adding each variable
5. Trigger a new deployment: **Deployments** → **⋯** → **Redeploy**

### Step 5: Connect Your Hostinger Domain

#### In Vercel Dashboard:

1. Go to your project **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Vercel will show you DNS records to add

Vercel will give you instructions like:
- **Type:** A
- **Name:** @ (or leave blank)
- **Value:** 76.76.21.21 (example IP)

AND

- **Type:** CNAME
- **Name:** www
- **Value:** cname.vercel-dns.com

#### In Hostinger Dashboard:

1. Log into [hostinger.com](https://hostinger.com)
2. Go to **Domains** → Select your domain
3. Click **DNS / Name Servers** or **DNS Zone Editor**
4. Click **Manage** or **Edit DNS Records**

**Add/Update the A Record:**
1. Find the A record pointing to @ or your root domain
2. Click **Edit** or **Delete** the old one
3. Add new A record:
   - **Type:** A
   - **Name:** @ (or leave blank for root)
   - **Points to:** [IP address from Vercel]
   - **TTL:** 3600 (or automatic)

**Add/Update the CNAME Record:**
1. Find or create a CNAME record for `www`
2. Set values:
   - **Type:** CNAME
   - **Name:** www
   - **Points to:** cname.vercel-dns.com
   - **TTL:** 3600 (or automatic)

5. Click **Save** or **Add Record**

### Step 6: Verify Domain Connection

1. Wait 5-30 minutes for DNS propagation (can take up to 48 hours)
2. Check status in Vercel dashboard under **Domains**
3. Once verified, Vercel will automatically provision SSL certificate
4. Your site will be live at your custom domain with HTTPS!

---

## Alternative: Deploy to Netlify

### Step 1: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Click **Sign Up** → **Continue with GitHub**
3. Authorize Netlify

### Step 2: Import Your Project

1. Click **Add new site** → **Import an existing project**
2. Choose **GitHub** (or your Git provider)
3. Select your repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy site**

### Step 3: Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable** and add all variables from the Vercel section above
3. Click **Save**
4. Go to **Deploys** and click **Trigger deploy** → **Deploy site**

### Step 4: Connect Your Hostinger Domain

#### In Netlify Dashboard:

1. Go to **Domain settings** → **Add custom domain**
2. Enter your domain: `yourdomain.com`
3. Netlify will show you DNS configuration

Netlify will provide:
- **Type:** A
- **Name:** @ or blank
- **Value:** 75.2.60.5 (example IP)

OR suggest using Netlify DNS (easier but optional)

#### In Hostinger Dashboard:

Follow the same steps as Vercel above, but use the DNS values provided by Netlify.

---

## Part 2: Update Supabase Configuration

After deploying to your custom domain, update Supabase:

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Update **Site URL:** `https://yourdomain.com`
5. Add to **Redirect URLs:**
   - `https://yourdomain.com/**`
   - `https://www.yourdomain.com/**`
6. Go to **API Settings**
7. Under **CORS**, ensure your domain is allowed (or use `*` for testing)

---

## Part 3: Update External Service Webhooks

If you're using any of these services, update their webhook URLs:

### WhatsApp Business API
1. Go to your WhatsApp Business dashboard
2. Update webhook URL to: `https://yourdomain.com/api/whatsapp-webhook`

### Stripe (if using payments)
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Go to **Developers** → **Webhooks**
3. Update endpoint URL to: `https://yourdomain.com/api/stripe-webhook`

### Paystack (if using payments)
1. Go to Paystack dashboard
2. Update webhook URL to: `https://yourdomain.com/api/paystack-webhook`

---

## Part 4: Verify Deployment

Test your deployed application:

- [ ] Visit your domain: `https://yourdomain.com`
- [ ] Check that HTTPS works (green padlock)
- [ ] Test navigation between pages
- [ ] Test user authentication (login/signup)
- [ ] Test AI chat feature (if enabled)
- [ ] Test file uploads
- [ ] Check mobile responsiveness
- [ ] Test PWA installation on mobile device

---

## Troubleshooting

### Domain not connecting?
- **Wait longer:** DNS can take up to 48 hours to propagate
- **Check DNS records:** Use [dnschecker.org](https://dnschecker.org) to verify
- **Clear cache:** Try incognito mode or different browser
- **Verify records:** Double-check A and CNAME records match exactly

### Build failing?
- **Check environment variables:** Ensure all required vars are set
- **Check build logs:** Look for specific error messages
- **Test locally:** Run `npm run build` to check for errors

### Supabase not connecting?
- **Check environment variables:** Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- **Check CORS:** Ensure your domain is allowed in Supabase settings
- **Check Site URL:** Verify it's set to your custom domain

### 404 errors on page refresh?
- **Vercel:** The `vercel.json` file should handle this automatically
- **Netlify:** The `netlify.toml` file should handle this automatically
- **Verify files exist:** Check that these config files are in your repository

---

## Next Steps After Deployment

1. **Set up monitoring:** Consider adding error tracking (Sentry)
2. **Configure analytics:** Add Google Analytics or similar
3. **Performance testing:** Use [PageSpeed Insights](https://pagespeed.web.dev)
4. **SEO optimization:** Add meta tags, sitemap, robots.txt
5. **Backup strategy:** Ensure Supabase automatic backups are enabled
6. **Set up staging:** Create a separate branch for testing before production

---

## Support Resources

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Netlify Documentation:** [docs.netlify.com](https://docs.netlify.com)
- **Hostinger DNS Guide:** [support.hostinger.com/dns](https://support.hostinger.com)
- **Supabase Documentation:** [supabase.com/docs](https://supabase.com/docs)

---

## Quick Reference: Environment Variables Checklist

Copy this checklist and fill in your values:

```
# Required
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Optional
VITE_API_BASE_URL=
NODE_ENV=production
VITE_APP_VERSION=0.1.0

# AI Features (if enabled)
OPENAI_API_KEY=
VITE_ENABLE_AI_CHAT=
VITE_DEFAULT_CHAT_MODEL=

# WhatsApp (if configured)
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# Payments (if using)
STRIPE_PUBLISHABLE_KEY=
PAYSTACK_PUBLIC_KEY=

# Maps (if using)
VITE_GOOGLE_MAPS_API_KEY=
```

---

Good luck with your deployment! 🚀
