# Hostinger DNS Configuration for Vercel/Netlify

This guide provides detailed instructions for configuring your Hostinger domain's DNS to work with your deployed React application on Vercel or Netlify.

---

## Overview

You'll be updating your domain's DNS records to point to your deployed application. This involves:
1. Logging into Hostinger
2. Accessing DNS settings
3. Updating A and CNAME records
4. Waiting for DNS propagation

---

## Step-by-Step Instructions

### Step 1: Log into Hostinger

1. Go to [hostinger.com](https://hostinger.com)
2. Click **Login** in the top right
3. Enter your credentials
4. Click **Sign In**

### Step 2: Access Your Domain's DNS Settings

1. From the dashboard, click **Domains** in the left sidebar
2. Find your domain in the list and click **Manage**
3. Look for **DNS Zone** or **DNS / Name Servers** section
4. Click **DNS Zone Editor** or **Manage DNS**

You should now see a list of DNS records for your domain.

---

## For Vercel Deployment

### What DNS Records to Add

After you add your domain in Vercel, you'll get specific values. Here's what you need to configure:

#### A Record (for root domain)

**Before:**
```
Type: A
Name: @ (or blank)
Points to: [old IP address]
```

**After (using Vercel's IP):**
```
Type: A
Name: @ (or blank)
Points to: 76.76.21.21 (example - use actual IP from Vercel)
TTL: 3600
```

#### CNAME Record (for www subdomain)

**Add new or update existing:**
```
Type: CNAME
Name: www
Points to: cname.vercel-dns.com
TTL: 3600
```

### How to Update in Hostinger

1. **Delete or Edit the existing A record:**
   - Find the A record with Name: @ or blank
   - Click the **trash icon** or **Edit**
   - If editing, change the IP to Vercel's IP
   - If deleting, click **Add Record** to create new one

2. **Add/Update CNAME record:**
   - Find existing CNAME with Name: www (if any)
   - Click **Edit** or **Add Record**
   - Set Type: CNAME
   - Set Name: www
   - Set Points to: cname.vercel-dns.com
   - Click **Save**

3. **Remove conflicting records:**
   - If you see an A record for "www", delete it (CNAME should be used instead)
   - Remove any old CNAME records pointing to other services

---

## For Netlify Deployment

### What DNS Records to Add

#### Option A: Using Netlify DNS Records (Recommended)

**A Record:**
```
Type: A
Name: @ (or blank)
Points to: 75.2.60.5 (example - use actual IP from Netlify)
TTL: 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Points to: [your-site-name].netlify.app
TTL: 3600
```

#### Option B: Using Netlify DNS Hosting (Easiest)

Netlify can manage your entire DNS:

1. In Netlify, go to **Domain settings** → **DNS**
2. Choose **Use Netlify DNS**
3. Netlify will provide you with nameservers (e.g., dns1.p01.nsone.net)
4. In Hostinger:
   - Go to **Domain** → **DNS / Name Servers**
   - Click **Change Nameservers**
   - Select **Custom nameservers**
   - Enter the nameservers provided by Netlify
   - Click **Save**

**Note:** Using Netlify DNS means all DNS management moves to Netlify.

---

## Common Hostinger DNS Interface Layouts

### Layout 1: Modern Interface

If you see a table with columns like "Type", "Name", "Points to", "TTL":

1. Click **Add Record** button (usually at top)
2. Select record type from dropdown
3. Fill in Name, Value/Points to, TTL
4. Click **Add** or **Save**

### Layout 2: Classic Interface

If you see separate sections for different record types:

1. Find the **A Records** section
2. Click **Add New Record** or **Edit**
3. Fill in the required fields
4. Click **Save Changes**
5. Repeat for CNAME in the **CNAME Records** section

### Layout 3: hPanel Interface

If you're in hPanel (Hostinger's control panel):

1. From main dashboard, click domain name
2. Click **DNS Zone** or **Advanced** → **DNS Zone**
3. Use the interface to modify records
4. Click **Add Record** for new entries
5. Use pencil icon to edit existing records
6. Use trash icon to delete records

---

## Important Notes

### DNS Propagation Time

- **Typical time:** 15-30 minutes
- **Maximum time:** Up to 48 hours
- **Check progress:** Use [dnschecker.org](https://dnschecker.org)

During propagation:
- Some people may see old site, some see new
- This is normal and will resolve automatically
- Don't make additional changes while waiting

### TTL (Time To Live)

- **What it is:** How long DNS servers cache your records
- **Recommended value:** 3600 (1 hour)
- **Lower value (300):** Faster updates, more queries
- **Higher value (86400):** Slower updates, fewer queries

### Record Priority

If you have multiple A records, delete extras:
- Keep only ONE A record for @ (root domain)
- Keep only ONE CNAME for www

### Email Hosting

**IMPORTANT:** If you use Hostinger for email (e.g., contact@yourdomain.com), keep these records:

- **MX records** - For email delivery
- **TXT records** - For SPF, DKIM (email authentication)

Do NOT delete these! Only modify A and CNAME records.

---

## Visual Guide: What Records Should Look Like

### Final DNS Records (Vercel Example)

```
Type    | Name  | Points to                      | TTL
--------|-------|--------------------------------|------
A       | @     | 76.76.21.21                    | 3600
CNAME   | www   | cname.vercel-dns.com           | 3600
MX      | @     | mx1.hostinger.com (priority 10)| 3600
TXT     | @     | v=spf1 include:hostinger.com   | 3600
```

### Final DNS Records (Netlify Example)

```
Type    | Name  | Points to                      | TTL
--------|-------|--------------------------------|------
A       | @     | 75.2.60.5                      | 3600
CNAME   | www   | yoursite.netlify.app           | 3600
MX      | @     | mx1.hostinger.com (priority 10)| 3600
TXT     | @     | v=spf1 include:hostinger.com   | 3600
```

---

## Verification Steps

### 1. Check DNS Records

Use online tools to verify your changes:
- [dnschecker.org](https://dnschecker.org) - Global DNS propagation
- [mxtoolbox.com](https://mxtoolbox.com) - Detailed DNS lookup
- Command line: `nslookup yourdomain.com`

### 2. Test Your Domain

After DNS propagates:
1. Open incognito/private browser window
2. Visit `http://yourdomain.com`
3. Should redirect to `https://yourdomain.com`
4. Visit `http://www.yourdomain.com`
5. Should redirect to `https://yourdomain.com` (or www version)

### 3. Check SSL Certificate

- Look for green padlock in browser
- Click padlock → Certificate should show "Let's Encrypt" or "Vercel"
- Certificate should be valid and not expired

---

## Troubleshooting

### "DNS_PROBE_FINISHED_NXDOMAIN" Error

**Cause:** Domain not resolving
**Fix:**
1. Verify A record exists with @ for name
2. Check DNS propagation status
3. Wait longer (up to 48 hours)
4. Clear browser DNS cache

### "This site can't be reached" Error

**Cause:** Wrong IP address or records not saved
**Fix:**
1. Verify IP address matches exactly from Vercel/Netlify
2. Check records were actually saved in Hostinger
3. Try with www prefix: `www.yourdomain.com`

### WWW vs Non-WWW Issues

**Both should work**, but one should redirect to the other:

**If you prefer non-www (yourdomain.com):**
- Set this as primary in Vercel/Netlify settings
- CNAME for www will auto-redirect to non-www

**If you prefer www (www.yourdomain.com):**
- Set this as primary in Vercel/Netlify settings
- A record will redirect to www

### SSL Certificate Not Showing

**Cause:** DNS not fully propagated or cert not issued yet
**Fix:**
1. Wait 30-60 minutes after DNS propagation
2. Check domain status in Vercel/Netlify dashboard
3. Try accessing with https:// explicitly
4. Contact Vercel/Netlify support if issue persists

### Changes Not Reflecting

**Cause:** DNS caching
**Fix:**
1. Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. Try incognito mode
3. Try different browser
4. Try different device/network
5. Flush DNS cache:
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
   - Linux: `sudo systemd-resolve --flush-caches`

---

## Need Help?

### Hostinger Support
- **Live Chat:** Available 24/7 in your account dashboard
- **Email:** support@hostinger.com
- **Knowledge Base:** [support.hostinger.com](https://support.hostinger.com)

### Vercel Support
- **Documentation:** [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
- **Support:** [vercel.com/support](https://vercel.com/support)

### Netlify Support
- **Documentation:** [docs.netlify.com/domains-https/custom-domains/](https://docs.netlify.com/domains-https/custom-domains/)
- **Community:** [answers.netlify.com](https://answers.netlify.com)

---

## Quick Checklist

Before you start:
- [ ] Have Vercel/Netlify account ready
- [ ] App already deployed (get DNS values first)
- [ ] Hostinger login credentials ready
- [ ] Know your domain name

DNS Configuration:
- [ ] Logged into Hostinger
- [ ] Found DNS Zone Editor
- [ ] Updated/Added A record
- [ ] Updated/Added CNAME record
- [ ] Saved all changes
- [ ] No conflicting records

After configuration:
- [ ] Waited for DNS propagation (15-30 min minimum)
- [ ] Checked DNS with online tools
- [ ] Tested domain in browser
- [ ] Verified SSL certificate works
- [ ] Tested all site features

---

That's it! Your Hostinger domain should now be connected to your deployed React application. 🎉
