import { appConfig } from './appConfig';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateEnvironment = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!appConfig.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required. Please set it in your .env file.');
  }

  if (!appConfig.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required. Please set it in your .env file.');
  }

  if (appConfig.supabase.url && !appConfig.supabase.url.startsWith('https://')) {
    warnings.push('VITE_SUPABASE_URL should use HTTPS protocol.');
  }

  if (appConfig.ai.enableChat || appConfig.ai.enableSemanticSearch || appConfig.ai.enableImageAnalysis) {
    warnings.push('AI features are enabled but API keys should be configured in Supabase Edge Function secrets.');
  }

  if (appConfig.monitoring.sentryDsn && !appConfig.monitoring.sentryDsn.startsWith('https://')) {
    warnings.push('VITE_SENTRY_DSN should be a valid HTTPS URL if provided.');
  }

  if (appConfig.app.environment === 'production') {
    if (appConfig.app.enableDebugMode) {
      warnings.push('Debug mode is enabled in production environment. Consider disabling it.');
    }

    if (appConfig.debug.debugAIPrompts || appConfig.debug.debugSQLQueries) {
      warnings.push('Debug flags are enabled in production. This may expose sensitive information.');
    }

    if (!appConfig.monitoring.sentryDsn) {
      warnings.push('Sentry DSN is not configured. Error tracking is recommended for production.');
    }
  }

  if (appConfig.integrations.googleMapsApiKey && appConfig.integrations.googleMapsApiKey.includes('YOUR_')) {
    warnings.push('Google Maps API key appears to be a placeholder. Update it with a real API key.');
  }

  if (appConfig.storage.maxImageSizeMB > 50) {
    warnings.push('Maximum image size is set above 50MB. This may impact performance.');
  }

  if (appConfig.rateLimit.enabled && appConfig.rateLimit.freeTierDailyRequests < 1) {
    errors.push('Free tier daily requests must be at least 1 when rate limiting is enabled.');
  }

  if (appConfig.cache.cacheTTLSeconds < 60) {
    warnings.push('Cache TTL is set below 60 seconds. This may result in excessive cache invalidation.');
  }

  if (appConfig.app.apiBaseUrl === 'http://localhost:5173' && appConfig.app.environment === 'production') {
    errors.push('API Base URL is set to localhost in production environment. Please update VITE_API_BASE_URL.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const printValidationResults = (results: ValidationResult): void => {
  if (results.errors.length > 0) {
    console.error('\n❌ Configuration Errors:\n');
    results.errors.forEach(error => {
      console.error(`  - ${error}`);
    });
  }

  if (results.warnings.length > 0) {
    console.warn('\n⚠️  Configuration Warnings:\n');
    results.warnings.forEach(warning => {
      console.warn(`  - ${warning}`);
    });
  }

  if (results.isValid && results.warnings.length === 0) {
    console.log('\n✅ Environment configuration is valid!\n');
  }
};

export const assertValidEnvironment = (): void => {
  const results = validateEnvironment();
  printValidationResults(results);

  if (!results.isValid) {
    throw new Error('Environment configuration validation failed. Please fix the errors above.');
  }
};

if (import.meta.env.DEV) {
  const results = validateEnvironment();
  printValidationResults(results);
}
