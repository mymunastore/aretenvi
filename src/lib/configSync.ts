import { supabase } from '@/lib/supabase';
import { appConfig } from '@/config/appConfig';

export interface ConfigEntry {
  id?: string;
  category: string;
  key: string;
  value: string | null;
  value_type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  is_secret?: boolean;
  is_required?: boolean;
  default_value?: string;
}

export interface SyncResult {
  success: boolean;
  configsSynced: number;
  errors: string[];
  warnings: string[];
}

export const parseConfigValue = (value: any, valueType: string): string => {
  if (value === null || value === undefined) return '';

  switch (valueType) {
    case 'boolean':
      return String(value);
    case 'number':
      return String(value);
    case 'array':
    case 'object':
      return JSON.stringify(value);
    case 'string':
    default:
      return String(value);
  }
};

export const serializeConfigValue = (value: string, valueType: string): any => {
  if (!value) return null;

  switch (valueType) {
    case 'boolean':
      return value.toLowerCase() === 'true';
    case 'number':
      return Number(value);
    case 'array':
    case 'object':
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    case 'string':
    default:
      return value;
  }
};

export const syncFileToDatabase = async (userId?: string): Promise<SyncResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let configsSynced = 0;

  try {
    const configsToSync: ConfigEntry[] = [
      // AI Configuration
      { category: 'ai', key: 'enable_chat', value: String(appConfig.ai.enableChat), value_type: 'boolean' },
      { category: 'ai', key: 'enable_semantic_search', value: String(appConfig.ai.enableSemanticSearch), value_type: 'boolean' },
      { category: 'ai', key: 'enable_image_analysis', value: String(appConfig.ai.enableImageAnalysis), value_type: 'boolean' },
      { category: 'ai', key: 'enable_sentiment_analysis', value: String(appConfig.ai.enableSentimentAnalysis), value_type: 'boolean' },
      { category: 'ai', key: 'enable_content_moderation', value: String(appConfig.ai.enableContentModeration), value_type: 'boolean' },
      { category: 'ai', key: 'default_chat_model', value: appConfig.ai.defaultChatModel, value_type: 'string' },
      { category: 'ai', key: 'default_embedding_model', value: appConfig.ai.defaultEmbeddingModel, value_type: 'string' },

      // Rate Limiting
      { category: 'rate_limit', key: 'enabled', value: String(appConfig.rateLimit.enabled), value_type: 'boolean' },
      { category: 'rate_limit', key: 'default_user_tier', value: appConfig.rateLimit.defaultUserTier, value_type: 'string' },
      { category: 'rate_limit', key: 'free_tier_daily_requests', value: String(appConfig.rateLimit.freeTierDailyRequests), value_type: 'number' },
      { category: 'rate_limit', key: 'free_tier_monthly_tokens', value: String(appConfig.rateLimit.freeTierMonthlyTokens), value_type: 'number' },
      { category: 'rate_limit', key: 'premium_tier_daily_requests', value: String(appConfig.rateLimit.premiumTierDailyRequests), value_type: 'number' },
      { category: 'rate_limit', key: 'premium_tier_monthly_tokens', value: String(appConfig.rateLimit.premiumTierMonthlyTokens), value_type: 'number' },

      // Storage
      { category: 'storage', key: 'max_image_size_mb', value: String(appConfig.storage.maxImageSizeMB), value_type: 'number' },
      { category: 'storage', key: 'max_document_size_mb', value: String(appConfig.storage.maxDocumentSizeMB), value_type: 'number' },
      { category: 'storage', key: 'max_avatar_size_mb', value: String(appConfig.storage.maxAvatarSizeMB), value_type: 'number' },
      { category: 'storage', key: 'allowed_image_types', value: JSON.stringify(appConfig.storage.allowedImageTypes), value_type: 'array' },
      { category: 'storage', key: 'allowed_document_types', value: JSON.stringify(appConfig.storage.allowedDocumentTypes), value_type: 'array' },

      // App Settings
      { category: 'app', key: 'version', value: appConfig.app.appVersion, value_type: 'string' },
      { category: 'app', key: 'environment', value: appConfig.app.environment, value_type: 'string' },
      { category: 'app', key: 'csp_enabled', value: String(appConfig.app.cspEnabled), value_type: 'boolean' },
      { category: 'app', key: 'enable_beta_features', value: String(appConfig.app.enableBetaFeatures), value_type: 'boolean' },
      { category: 'app', key: 'enable_debug_mode', value: String(appConfig.app.enableDebugMode), value_type: 'boolean' },

      // Cache
      { category: 'cache', key: 'enable_ai_cache', value: String(appConfig.cache.enableAICache), value_type: 'boolean' },
      { category: 'cache', key: 'cache_ttl_seconds', value: String(appConfig.cache.cacheTTLSeconds), value_type: 'number' },

      // WhatsApp
      { category: 'whatsapp', key: 'phone_number', value: appConfig.whatsapp.phoneNumber, value_type: 'string' },
      { category: 'whatsapp', key: 'display_number', value: appConfig.whatsapp.displayNumber, value_type: 'string' },
      { category: 'whatsapp', key: 'default_message', value: appConfig.whatsapp.defaultMessage, value_type: 'string' },

      // Backup
      { category: 'backup', key: 'enable_auto_backup', value: String(appConfig.backup.enableAutoBackup), value_type: 'boolean' },
      { category: 'backup', key: 'backup_frequency_hours', value: String(appConfig.backup.backupFrequencyHours), value_type: 'number' },
    ];

    for (const config of configsToSync) {
      try {
        const { data: existing } = await supabase
          .from('app_configurations')
          .select('id, value')
          .eq('category', config.category)
          .eq('key', config.key)
          .maybeSingle();

        if (existing) {
          if (existing.value !== config.value) {
            const { error } = await supabase
              .from('app_configurations')
              .update({
                value: config.value,
                updated_by: userId,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id);

            if (error) {
              errors.push(`Failed to update ${config.category}.${config.key}: ${error.message}`);
            } else {
              configsSynced++;
            }
          }
        } else {
          warnings.push(`Configuration ${config.category}.${config.key} not found in database`);
        }
      } catch (err) {
        errors.push(`Error syncing ${config.category}.${config.key}: ${err}`);
      }
    }

    await supabase.from('configuration_sync_log').insert({
      sync_direction: 'file_to_db',
      sync_status: errors.length > 0 ? 'partial' : 'success',
      configs_synced: configsSynced,
      error_message: errors.length > 0 ? errors.join('; ') : null,
      synced_by: userId,
    });

    return {
      success: errors.length === 0,
      configsSynced,
      errors,
      warnings,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Sync failed: ${errorMessage}`);

    await supabase.from('configuration_sync_log').insert({
      sync_direction: 'file_to_db',
      sync_status: 'failed',
      configs_synced: 0,
      error_message: errorMessage,
      synced_by: userId,
    });

    return {
      success: false,
      configsSynced: 0,
      errors,
      warnings,
    };
  }
};

export const syncDatabaseToFile = async (): Promise<SyncResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  warnings.push('Database to file sync is not supported. Please update .env manually and restart the application.');

  return {
    success: false,
    configsSynced: 0,
    errors,
    warnings,
  };
};

export const getAllConfigurations = async (): Promise<{ data: ConfigEntry[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('app_configurations')
    .select('*')
    .order('category', { ascending: true })
    .order('key', { ascending: true });

  return { data, error };
};

export const getConfigurationsByCategory = async (category: string): Promise<{ data: ConfigEntry[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('app_configurations')
    .select('*')
    .eq('category', category)
    .order('key', { ascending: true });

  return { data, error };
};

export const updateConfiguration = async (
  category: string,
  key: string,
  value: string,
  changeReason?: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('app_configurations')
      .select('id, value')
      .eq('category', category)
      .eq('key', key)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    if (!existing) {
      return { success: false, error: 'Configuration not found' };
    }

    await supabase.from('configuration_history').insert({
      config_id: existing.id,
      old_value: existing.value,
      new_value: value,
      changed_by: userId,
      change_reason: changeReason,
    });

    const { error: updateError } = await supabase
      .from('app_configurations')
      .update({
        value,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const getConfigurationHistory = async (
  category: string,
  key: string
): Promise<{ data: any[] | null; error: any }> => {
  const { data: config } = await supabase
    .from('app_configurations')
    .select('id')
    .eq('category', category)
    .eq('key', key)
    .maybeSingle();

  if (!config) {
    return { data: null, error: 'Configuration not found' };
  }

  const { data, error } = await supabase
    .from('configuration_history')
    .select('*')
    .eq('config_id', config.id)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const getSyncLogs = async (limit = 50): Promise<{ data: any[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('configuration_sync_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
};
