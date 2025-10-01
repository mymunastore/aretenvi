interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface AIConfig {
  enableChat: boolean;
  enableSemanticSearch: boolean;
  enableImageAnalysis: boolean;
  enableSentimentAnalysis: boolean;
  enableContentModeration: boolean;
  defaultChatModel: string;
  defaultEmbeddingModel: string;
}

interface RateLimitConfig {
  enabled: boolean;
  defaultUserTier: 'free' | 'premium' | 'enterprise';
  freeTierDailyRequests: number;
  freeTierMonthlyTokens: number;
  premiumTierDailyRequests: number;
  premiumTierMonthlyTokens: number;
}

interface StorageConfig {
  maxImageSizeMB: number;
  maxDocumentSizeMB: number;
  maxAvatarSizeMB: number;
  allowedImageTypes: string[];
  allowedDocumentTypes: string[];
}

interface MonitoringConfig {
  sentryDsn: string;
  sentryTracesSampleRate: number;
  gaMeasurementId: string;
  mixpanelToken: string;
}

interface IntegrationConfig {
  googleMapsApiKey: string;
  whatsappBusinessPhoneNumberId: string;
  whatsappBusinessAccessToken: string;
  whatsappWebhookVerifyToken: string;
  stripeSecretKey: string;
  stripePublishableKey: string;
  paystackSecretKey: string;
  paystackPublicKey: string;
}

interface WhatsAppConfig {
  phoneNumber: string;
  displayNumber: string;
  defaultMessage: string;
}

interface AppSettings {
  appVersion: string;
  environment: string;
  apiBaseUrl: string;
  cspEnabled: boolean;
  enableBetaFeatures: boolean;
  enableDebugMode: boolean;
}

interface CacheConfig {
  enableAICache: boolean;
  cacheTTLSeconds: number;
  cdnUrl: string;
}

interface NotificationConfig {
  emailServiceApiKey: string;
  emailFromAddress: string;
  emailFromName: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  firebaseServerKey: string;
  firebaseProjectId: string;
}

interface SecurityConfig {
  jwtSecret: string;
  corsAllowedOrigins: string[];
}

interface BackupConfig {
  enableAutoBackup: boolean;
  backupFrequencyHours: number;
}

interface DebugConfig {
  debugAIPrompts: boolean;
  debugSQLQueries: boolean;
  mockAIResponses: boolean;
}

export interface AppConfig {
  supabase: SupabaseConfig;
  ai: AIConfig;
  rateLimit: RateLimitConfig;
  storage: StorageConfig;
  monitoring: MonitoringConfig;
  integrations: IntegrationConfig;
  whatsapp: WhatsAppConfig;
  app: AppSettings;
  cache: CacheConfig;
  notifications: NotificationConfig;
  security: SecurityConfig;
  backup: BackupConfig;
  debug: DebugConfig;
}

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const parseArray = (value: string | undefined, defaultValue: string[]): string[] => {
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim()).filter(Boolean);
};

export const appConfig: AppConfig = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },

  ai: {
    enableChat: parseBoolean(import.meta.env.VITE_ENABLE_AI_CHAT, true),
    enableSemanticSearch: parseBoolean(import.meta.env.VITE_ENABLE_SEMANTIC_SEARCH, true),
    enableImageAnalysis: parseBoolean(import.meta.env.VITE_ENABLE_IMAGE_ANALYSIS, true),
    enableSentimentAnalysis: parseBoolean(import.meta.env.VITE_ENABLE_SENTIMENT_ANALYSIS, true),
    enableContentModeration: parseBoolean(import.meta.env.VITE_ENABLE_CONTENT_MODERATION, true),
    defaultChatModel: import.meta.env.VITE_DEFAULT_CHAT_MODEL || 'gpt-4o-mini',
    defaultEmbeddingModel: import.meta.env.VITE_DEFAULT_EMBEDDING_MODEL || 'text-embedding-3-small',
  },

  rateLimit: {
    enabled: parseBoolean(import.meta.env.VITE_RATE_LIMIT_ENABLED, true),
    defaultUserTier: (import.meta.env.VITE_DEFAULT_USER_TIER as 'free' | 'premium' | 'enterprise') || 'free',
    freeTierDailyRequests: parseNumber(import.meta.env.VITE_FREE_TIER_DAILY_REQUESTS, 50),
    freeTierMonthlyTokens: parseNumber(import.meta.env.VITE_FREE_TIER_MONTHLY_TOKENS, 100000),
    premiumTierDailyRequests: parseNumber(import.meta.env.VITE_PREMIUM_TIER_DAILY_REQUESTS, 2000),
    premiumTierMonthlyTokens: parseNumber(import.meta.env.VITE_PREMIUM_TIER_MONTHLY_TOKENS, 5000000),
  },

  storage: {
    maxImageSizeMB: parseNumber(import.meta.env.VITE_MAX_IMAGE_SIZE_MB, 10),
    maxDocumentSizeMB: parseNumber(import.meta.env.VITE_MAX_DOCUMENT_SIZE_MB, 20),
    maxAvatarSizeMB: parseNumber(import.meta.env.VITE_MAX_AVATAR_SIZE_MB, 2),
    allowedImageTypes: parseArray(import.meta.env.VITE_ALLOWED_IMAGE_TYPES, ['image/jpeg', 'image/png', 'image/webp']),
    allowedDocumentTypes: parseArray(import.meta.env.VITE_ALLOWED_DOCUMENT_TYPES, ['application/pdf', 'application/msword']),
  },

  monitoring: {
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
    sentryTracesSampleRate: parseNumber(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE, 0.1),
    gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
    mixpanelToken: import.meta.env.VITE_MIXPANEL_TOKEN || '',
  },

  integrations: {
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    whatsappBusinessPhoneNumberId: import.meta.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID || '',
    whatsappBusinessAccessToken: import.meta.env.WHATSAPP_BUSINESS_ACCESS_TOKEN || '',
    whatsappWebhookVerifyToken: import.meta.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
    stripeSecretKey: import.meta.env.STRIPE_SECRET_KEY || '',
    stripePublishableKey: import.meta.env.STRIPE_PUBLISHABLE_KEY || '',
    paystackSecretKey: import.meta.env.PAYSTACK_SECRET_KEY || '',
    paystackPublicKey: import.meta.env.PAYSTACK_PUBLIC_KEY || '',
  },

  whatsapp: {
    phoneNumber: '2349152870616',
    displayNumber: '09152870616',
    defaultMessage: "Hello! I'm interested in ARET Environmental Services. I'd like to know more about your waste management solutions.",
  },

  app: {
    appVersion: import.meta.env.VITE_APP_VERSION || '0.1.0',
    environment: import.meta.env.NODE_ENV || 'development',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173',
    cspEnabled: parseBoolean(import.meta.env.VITE_CSP_ENABLED, true),
    enableBetaFeatures: parseBoolean(import.meta.env.VITE_ENABLE_BETA_FEATURES, false),
    enableDebugMode: parseBoolean(import.meta.env.VITE_ENABLE_DEBUG_MODE, false),
  },

  cache: {
    enableAICache: parseBoolean(import.meta.env.VITE_ENABLE_AI_CACHE, true),
    cacheTTLSeconds: parseNumber(import.meta.env.VITE_CACHE_TTL_SECONDS, 604800),
    cdnUrl: import.meta.env.VITE_CDN_URL || '',
  },

  notifications: {
    emailServiceApiKey: import.meta.env.EMAIL_SERVICE_API_KEY || '',
    emailFromAddress: import.meta.env.EMAIL_FROM_ADDRESS || 'noreply@yourdomain.com',
    emailFromName: import.meta.env.EMAIL_FROM_NAME || 'ARET Environmental Services',
    twilioAccountSid: import.meta.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: import.meta.env.TWILIO_AUTH_TOKEN || '',
    twilioPhoneNumber: import.meta.env.TWILIO_PHONE_NUMBER || '',
    firebaseServerKey: import.meta.env.FIREBASE_SERVER_KEY || '',
    firebaseProjectId: import.meta.env.FIREBASE_PROJECT_ID || '',
  },

  security: {
    jwtSecret: import.meta.env.JWT_SECRET || '',
    corsAllowedOrigins: parseArray(import.meta.env.CORS_ALLOWED_ORIGINS, ['http://localhost:5173', 'https://yourdomain.com']),
  },

  backup: {
    enableAutoBackup: parseBoolean(import.meta.env.ENABLE_AUTO_BACKUP, true),
    backupFrequencyHours: parseNumber(import.meta.env.BACKUP_FREQUENCY_HOURS, 24),
  },

  debug: {
    debugAIPrompts: parseBoolean(import.meta.env.DEBUG_AI_PROMPTS, false),
    debugSQLQueries: parseBoolean(import.meta.env.DEBUG_SQL_QUERIES, false),
    mockAIResponses: parseBoolean(import.meta.env.MOCK_AI_RESPONSES, false),
  },
};

export const isProduction = appConfig.app.environment === 'production';
export const isDevelopment = appConfig.app.environment === 'development';
export const isTest = appConfig.app.environment === 'test';

export default appConfig;
