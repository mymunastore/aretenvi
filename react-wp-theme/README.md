# React WordPress Theme - Deployment Guide

This WordPress theme wraps your React application (built with Vite) and makes it work seamlessly within WordPress.

## 📁 Theme Structure

```
react-wp-theme/
├── style.css              # WordPress theme metadata
├── functions.php          # Theme functions and asset enqueuing
├── index.php              # Main template (loads React app)
├── header.php             # HTML head and opening body tag
├── footer.php             # Closing body and html tags
├── screenshot.png         # Theme thumbnail (optional)
└── react-app/             # Your React build files
    ├── assets/
    │   ├── index-CJ7NuGfj.css
    │   └── index-e_LptW6c.js
    ├── favicon.ico
    ├── manifest.webmanifest
    ├── registerSW.js
    ├── sw.js
    └── workbox-239d0d27.js
```

## 🚀 Deployment Steps

### Step 1: Create Theme ZIP File

#### Option A: Using Command Line (Mac/Linux)

```bash
cd /path/to/project
zip -r react-wp-theme.zip react-wp-theme/
```

#### Option B: Using File Explorer (Windows)

1. Navigate to your project folder
2. Right-click the `react-wp-theme` folder
3. Select "Send to" → "Compressed (zipped) folder"
4. Rename to `react-wp-theme.zip`

#### Option C: Using Finder (Mac)

1. Navigate to your project folder
2. Right-click the `react-wp-theme` folder
3. Select "Compress react-wp-theme"
4. This creates `react-wp-theme.zip`

### Step 2: Upload to WordPress

1. **Log into WordPress Admin**
   - Go to `https://yourdomain.com/wp-admin`
   - Enter your credentials

2. **Navigate to Themes**
   - Click "Appearance" → "Themes" in the left sidebar

3. **Add New Theme**
   - Click the "Add New" button at the top
   - Click "Upload Theme" button
   - Click "Choose File"
   - Select your `react-wp-theme.zip` file
   - Click "Install Now"

4. **Activate Theme**
   - Once uploaded, click "Activate"
   - Your React app is now live!

### Step 3: Verify Installation

Visit your site at `https://yourdomain.com` and you should see your React application running.

## ⚙️ Configuration

### Environment Variables

Your React app uses environment variables for Supabase and other services. Since this is a static build, these values are already compiled into your JavaScript files from when you ran `npm run build`.

**Important:** If you need to update environment variables:
1. Update your `.env` file in your local project
2. Run `npm run build` again
3. Copy the new `dist/` contents to `react-wp-theme/react-app/`
4. Re-zip and re-upload the theme

### WordPress Data Access

Your React app can access WordPress data via the `wpData` object that's automatically injected:

```javascript
// Available in your React app
window.wpData = {
  restUrl: 'https://yourdomain.com/wp-json/',
  homeUrl: 'https://yourdomain.com/',
  siteUrl: 'https://yourdomain.com',
  siteName: 'Your Site Name',
  siteDesc: 'Your Site Description',
  themeUrl: 'https://yourdomain.com/wp-content/themes/react-wp-theme',
  ajaxUrl: 'https://yourdomain.com/wp-admin/admin-ajax.php',
  nonce: 'wp_rest_nonce_value',
  isLoggedIn: false,
  currentUser: 0
}
```

Use this in your React components:

```javascript
// Example: Fetch WordPress posts
const restUrl = window.wpData?.restUrl || '';
fetch(`${restUrl}wp/v2/posts`)
  .then(res => res.json())
  .then(posts => console.log(posts));
```

## 🔧 Troubleshooting

### Theme Not Showing Correctly

**Issue:** White screen or errors after activation

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify all asset files are in `react-app/assets/` folder
3. Check that file names in `functions.php` match actual build files
4. Enable WordPress debug mode in `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

### React Router Issues

**Issue:** 404 errors when refreshing React routes

**Solution:** Add this to your `.htaccess` file:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.php$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.php [L]
</IfModule>
```

### Assets Not Loading

**Issue:** CSS or JS files returning 404

**Solutions:**
1. Verify files exist in `wp-content/themes/react-wp-theme/react-app/assets/`
2. Check file permissions (should be 644)
3. Clear WordPress cache (if using caching plugin)
4. Check asset URLs in browser DevTools Network tab

### Supabase Connection Issues

**Issue:** Supabase not connecting from WordPress site

**Solutions:**
1. Update Supabase CORS settings to allow your WordPress domain
2. In Supabase Dashboard: Settings → API → CORS Allowed Origins
3. Add your WordPress URL: `https://yourdomain.com`
4. If issues persist, rebuild with updated `.env` variables

## 🔄 Updating Your Theme

When you make changes to your React app:

1. **Update your React code locally**
2. **Rebuild the project:**
   ```bash
   npm run build
   ```
3. **Copy new build files:**
   ```bash
   cp -r dist/* react-wp-theme/react-app/
   ```
4. **Update file names in `functions.php`** (if hash changed)
5. **Re-zip and re-upload to WordPress**

### Automating Updates

For easier updates, consider using one of these approaches:

#### Option A: FTP/SFTP
- Use FileZilla or similar FTP client
- Upload only changed files in `react-app/` folder
- Navigate to `wp-content/themes/react-wp-theme/react-app/`
- Upload new files

#### Option B: WP-CLI (if available)
```bash
wp theme update react-wp-theme --version=latest
```

#### Option C: Git Deployment (Advanced)
- Use a plugin like "WP Pusher" or "Git Updater"
- Connect your GitHub repository
- Auto-deploy on push

## 📋 File Checklist

Before uploading, verify these files exist:

- [ ] `style.css` - Theme metadata
- [ ] `functions.php` - Asset enqueuing
- [ ] `index.php` - Main template
- [ ] `header.php` - Header template
- [ ] `footer.php` - Footer template
- [ ] `react-app/assets/index-[hash].css` - React styles
- [ ] `react-app/assets/index-[hash].js` - React JavaScript
- [ ] `react-app/manifest.webmanifest` - PWA manifest
- [ ] `react-app/registerSW.js` - Service worker registration
- [ ] `react-app/favicon.ico` - Site icon

## 🎨 Customization

### Adding WordPress Menus

Edit `functions.php` to add menu support:

```php
function react_wp_theme_setup() {
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'react-wp-theme'),
        'footer'  => __('Footer Menu', 'react-wp-theme'),
    ));
}
add_action('after_setup_theme', 'react_wp_theme_setup');
```

### Adding Custom REST Endpoints

Uncomment the example in `functions.php` and customize:

```php
function react_wp_theme_register_routes() {
    register_rest_route('react-wp/v1', '/custom-data', array(
        'methods'  => 'GET',
        'callback' => 'your_custom_callback',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'react_wp_theme_register_routes');
```

## 🔒 Security Notes

1. **File Permissions:** Ensure proper file permissions on your server
   - Folders: 755
   - Files: 644

2. **Environment Variables:** All sensitive keys (Supabase, API keys) are compiled into your JavaScript bundle. Never expose secret keys in frontend code.

3. **CORS:** The theme includes CORS headers for REST API access. Adjust in `functions.php` if needed.

4. **File Editor:** Theme file editor is disabled by default for security

## 📚 Additional Resources

- [WordPress Theme Handbook](https://developer.wordpress.org/themes/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 Support

### Common WordPress Hosts

#### Hostinger
- Use File Manager or FTP
- Upload to: `public_html/wp-content/themes/`
- Or use WordPress dashboard upload

#### Bluehost
- Use cPanel File Manager
- Navigate to: `public_html/wp-content/themes/`
- Upload and extract ZIP

#### SiteGround
- Use Site Tools → File Manager
- Navigate to: `www/wp-content/themes/`
- Upload ZIP file

#### HostGator
- Use cPanel File Manager
- Navigate to: `public_html/wp-content/themes/`
- Upload and extract

### Getting Help

If you encounter issues:
1. Check WordPress error logs: `wp-content/debug.log`
2. Check browser console for JavaScript errors
3. Verify all files uploaded correctly
4. Test with WordPress default theme to isolate issues
5. Contact your hosting provider for server-specific issues

## ✅ Success Checklist

After deployment, verify:

- [ ] Theme appears in WordPress admin
- [ ] Theme activates without errors
- [ ] Homepage loads and displays React app
- [ ] All React routes work correctly
- [ ] CSS styles are applied
- [ ] Images and assets load
- [ ] Supabase connection works
- [ ] PWA features work (if applicable)
- [ ] Mobile responsiveness works
- [ ] Browser console shows no errors

---

**Congratulations!** Your React app is now running as a WordPress theme! 🎉
