# ARET Environmental Services - Configuration Guide

This document provides comprehensive information about all configuration settings for the ARET Environmental Services application.

## Table of Contents

1. [Overview](#overview)
2. [Configuration Files](#configuration-files)
3. [Environment Variables](#environment-variables)
4. [Feature Configuration](#feature-configuration)
5. [Integration Settings](#integration-settings)
6. [Security Configuration](#security-configuration)
7. [Development vs Production](#development-vs-production)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The application uses a centralized configuration system that loads settings from environment variables and provides type-safe access throughout the codebase.

### Key Configuration Files

- `.env` - Environment-specific variables (not committed to git)
- `.env.example` - Template with all available settings
- `src/config/appConfig.ts` - Centralized configuration object
- `src/config/validateEnv.ts` - Environment validation utility

---

## Configuration Files

### appConfig.ts

Central configuration file that exports a typed configuration object:

```typescript
import { appConfig } from '@/config/appConfig';

// Access configuration values
const supabaseUrl = appConfig.supabase.url;
const enableAI = appConfig.ai.enableChat;
```

**Features:**
- Type-safe configuration access
- Default values for all settings
- Environment variable parsing (string, boolean, number, array)
- Development/production environment detection

### validateEnv.ts

Validates environment configuration on startup:

```typescript
import { validateEnvironment, assertValidEnvironment } from '@/config/validateEnv';

// Validate without throwing errors
const results = validateEnvironment();

// Validate and throw on errors
assertValidEnvironment();
```

**Features:**
- Checks required variables
- Warns about misconfigurations
- Production-specific validation
- Console output with color coding

---

## Environment Variables

### Required Variables

These variables MUST be set for the application to function:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these:**
1. Log in to your Supabase dashboard
2. Go to Project Settings → API
3. Copy the Project URL and anon/public key

### Optional Variables

All other variables are optional with sensible defaults.

---

## Feature Configuration

### AI Features

Control AI-powered functionality:

```env
# Enable/disable AI features
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_SEMANTIC_SEARCH=true
VITE_ENABLE_IMAGE_ANALYSIS=true
VITE_ENABLE_SENTIMENT_ANALYSIS=true
VITE_ENABLE_CONTENT_MODERATION=true

# AI model selection
VITE_DEFAULT_CHAT_MODEL=gpt-4o-mini
VITE_DEFAULT_EMBEDDING_MODEL=text-embedding-3-small
```

**Available Models:**
- Chat: `gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`
- Embeddings: `text-embedding-3-small`, `text-embedding-3-large`

**Access in code:**
```typescript
if (appConfig.ai.enableChat) {
  // Initialize AI chat
}
```

### Rate Limiting

Configure API rate limits per user tier:

```env
VITE_RATE_LIMIT_ENABLED=true
VITE_DEFAULT_USER_TIER=free

# Free tier limits
VITE_FREE_TIER_DAILY_REQUESTS=50
VITE_FREE_TIER_MONTHLY_TOKENS=100000

# Premium tier limits
VITE_PREMIUM_TIER_DAILY_REQUESTS=2000
VITE_PREMIUM_TIER_MONTHLY_TOKENS=5000000
```

**Access in code:**
```typescript
const limit = appConfig.rateLimit.freeTierDailyRequests;
```

### Storage Configuration

Control file upload limits and types:

```env
# File size limits (in MB)
VITE_MAX_IMAGE_SIZE_MB=10
VITE_MAX_DOCUMENT_SIZE_MB=20
VITE_MAX_AVATAR_SIZE_MB=2

# Allowed file types (comma-separated)
VITE_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
VITE_ALLOWED_DOCUMENT_TYPES=application/pdf,application/msword
```

**Access in code:**
```typescript
const maxSize = appConfig.storage.maxImageSizeMB;
const allowedTypes = appConfig.storage.allowedImageTypes;
```

### Caching

Configure response caching:

```env
VITE_ENABLE_AI_CACHE=true
VITE_CACHE_TTL_SECONDS=604800  # 7 days
VITE_CDN_URL=https://cdn.yourdomain.com
```

**Access in code:**
```typescript
if (appConfig.cache.enableAICache) {
  // Use cache
}
```

---

## Integration Settings

### WhatsApp

WhatsApp contact configuration (hardcoded, can be modified in code):

**File:** `src/config/appConfig.ts`

```typescript
whatsapp: {
  phoneNumber: '2349152870616',
  displayNumber: '09152870616',
  defaultMessage: "Hello! I'm interested in ARET Environmental Services..."
}
```

**To update:**
1. Edit `src/config/appConfig.ts`
2. Update the `whatsapp` section
3. Rebuild the application

### WhatsApp Business API (Optional)

For automated WhatsApp integration:

```env
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_BUSINESS_ACCESS_TOKEN=your-access-token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token
```

### Google Maps (Optional)

```env
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Payment Gateways (Optional)

**Stripe:**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Paystack:**
```env
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```

### Analytics (Optional)

**Google Analytics:**
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Mixpanel:**
```env
VITE_MIXPANEL_TOKEN=your-token
```

### Error Tracking (Optional)

**Sentry:**
```env
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

---

## Security Configuration

### Content Security Policy

```env
VITE_CSP_ENABLED=true
```

### CORS Configuration

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

**Access in code:**
```typescript
const origins = appConfig.security.corsAllowedOrigins;
```

### JWT Secret

```env
JWT_SECRET=your-secure-random-string
```

**Important:** Generate a strong random secret for production!

---

## Development vs Production

### Development Settings

Typical `.env` for development:

```env
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5173

# Debug flags
VITE_ENABLE_DEBUG_MODE=true
DEBUG_AI_PROMPTS=true
DEBUG_SQL_QUERIES=true
MOCK_AI_RESPONSES=false
```

### Production Settings

Typical `.env` for production:

```env
NODE_ENV=production
VITE_API_BASE_URL=https://yourdomain.com

# Debug flags (MUST be false)
VITE_ENABLE_DEBUG_MODE=false
DEBUG_AI_PROMPTS=false
DEBUG_SQL_QUERIES=false
MOCK_AI_RESPONSES=false

# Monitoring (recommended)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Environment Detection

```typescript
import { isProduction, isDevelopment, isTest } from '@/config/appConfig';

if (isProduction) {
  // Production-only code
}
```

---

## Application Settings

### Version and Metadata

```env
VITE_APP_VERSION=0.1.0
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5173
```

**Access in code:**
```typescript
const version = appConfig.app.appVersion;
const env = appConfig.app.environment;
```

### Feature Flags

```env
VITE_ENABLE_BETA_FEATURES=false
VITE_ENABLE_DEBUG_MODE=false
```

**Access in code:**
```typescript
if (appConfig.app.enableBetaFeatures) {
  // Show beta features
}
```

---

## Notification Configuration

### Email Service

```env
EMAIL_SERVICE_API_KEY=your-sendgrid-or-mailgun-key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=ARET Environmental Services
```

### SMS Service (Twilio)

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Push Notifications (Firebase)

```env
FIREBASE_SERVER_KEY=your-server-key
FIREBASE_PROJECT_ID=your-project-id
```

---

## Database Configuration

### Backup Settings

```env
ENABLE_AUTO_BACKUP=true
BACKUP_FREQUENCY_HOURS=24
```

### Supabase

Supabase configuration is handled through the required environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** Database connection details, API keys for AI providers (OpenAI, etc.) should be configured in Supabase Edge Function secrets, NOT in `.env` for security.

---

## Troubleshooting

### Configuration Not Loading

**Problem:** Configuration values are undefined or using defaults.

**Solutions:**
1. Check that `.env` file exists in project root
2. Ensure variable names start with `VITE_` for client-side access
3. Restart dev server after changing `.env`
4. Check for typos in variable names

### Validation Errors

**Problem:** Seeing validation errors in console.

**Solutions:**
1. Check the error messages in console
2. Set required variables in `.env`
3. Run `npm run dev` to see validation output
4. Use `.env.example` as a template

### Environment Variables Not Available in Browser

**Problem:** Variables show as undefined in browser.

**Solutions:**
1. Only variables prefixed with `VITE_` are available in browser
2. Server-only variables (API keys, secrets) should not use `VITE_` prefix
3. Access through `appConfig` object, not `import.meta.env` directly

### Production Build Issues

**Problem:** Build fails or configuration missing in production.

**Solutions:**
1. Ensure all required variables are set
2. Check that production `.env` file exists
3. Verify no debug flags are enabled
4. Run validation: `npm run build`

---

## Best Practices

### 1. Never Commit Secrets

- Never commit `.env` file to git
- Use `.env.example` as a template
- Rotate secrets regularly

### 2. Use Environment-Specific Files

```bash
.env                # Default (local development)
.env.local          # Local overrides (git-ignored)
.env.production     # Production settings
.env.staging        # Staging settings
```

### 3. Validate Early

Import validation in your main entry point:

```typescript
// src/main.tsx
import './config/validateEnv';
```

### 4. Type-Safe Access

Always use `appConfig` instead of direct environment access:

```typescript
// ✅ Good
import { appConfig } from '@/config/appConfig';
const url = appConfig.supabase.url;

// ❌ Bad
const url = import.meta.env.VITE_SUPABASE_URL;
```

### 5. Document Changes

When adding new configuration:
1. Add to `.env.example` with description
2. Update `appConfig.ts` interface and default
3. Add validation rules if required
4. Document in this file

---

## Quick Reference

### Getting Started

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Set required variables:
   ```env
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Common Tasks

**Enable a feature:**
```env
VITE_ENABLE_AI_CHAT=true
```

**Change rate limits:**
```env
VITE_FREE_TIER_DAILY_REQUESTS=100
```

**Update WhatsApp number:**
Edit `src/config/appConfig.ts` → `whatsapp.phoneNumber`

**Add API key:**
For server-side: Add to Supabase Edge Function secrets
For client-side: Add with `VITE_` prefix in `.env`

---

## Support

For configuration issues:
1. Check console for validation messages
2. Review this documentation
3. Check `.env.example` for correct format
4. Verify Supabase project settings

For technical support, contact the development team.

---

**Last Updated:** October 1, 2025
**Version:** 1.0.0
