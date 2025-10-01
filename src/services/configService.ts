import {
  getAllConfigurations,
  getConfigurationsByCategory,
  updateConfiguration,
  getConfigurationHistory,
  getSyncLogs,
  syncFileToDatabase,
  syncDatabaseToFile,
  serializeConfigValue,
  parseConfigValue,
  type ConfigEntry,
  type SyncResult,
} from '@/lib/configSync';

export interface ConfigServiceOptions {
  userId?: string;
}

export class ConfigurationService {
  private userId?: string;

  constructor(options?: ConfigServiceOptions) {
    this.userId = options?.userId;
  }

  async getAll(): Promise<ConfigEntry[]> {
    const { data, error } = await getAllConfigurations();
    if (error) {
      throw new Error(`Failed to fetch configurations: ${error.message}`);
    }
    return data || [];
  }

  async getByCategory(category: string): Promise<ConfigEntry[]> {
    const { data, error } = await getConfigurationsByCategory(category);
    if (error) {
      throw new Error(`Failed to fetch configurations for category ${category}: ${error.message}`);
    }
    return data || [];
  }

  async getAllByCategories(): Promise<Record<string, ConfigEntry[]>> {
    const configs = await this.getAll();
    const grouped: Record<string, ConfigEntry[]> = {};

    for (const config of configs) {
      if (!grouped[config.category]) {
        grouped[config.category] = [];
      }
      grouped[config.category].push(config);
    }

    return grouped;
  }

  async update(
    category: string,
    key: string,
    value: any,
    changeReason?: string
  ): Promise<void> {
    const configs = await this.getAll();
    const config = configs.find(c => c.category === category && c.key === key);

    if (!config) {
      throw new Error(`Configuration ${category}.${key} not found`);
    }

    const stringValue = parseConfigValue(value, config.value_type);

    const result = await updateConfiguration(
      category,
      key,
      stringValue,
      changeReason,
      this.userId
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to update configuration');
    }
  }

  async getHistory(category: string, key: string): Promise<any[]> {
    const { data, error } = await getConfigurationHistory(category, key);
    if (error) {
      throw new Error(`Failed to fetch history: ${error}`);
    }
    return data || [];
  }

  async getSyncHistory(limit = 50): Promise<any[]> {
    const { data, error } = await getSyncLogs(limit);
    if (error) {
      throw new Error(`Failed to fetch sync logs: ${error.message}`);
    }
    return data || [];
  }

  async syncFromFile(): Promise<SyncResult> {
    return await syncFileToDatabase(this.userId);
  }

  async syncToFile(): Promise<SyncResult> {
    return await syncDatabaseToFile();
  }

  getValue<T = any>(category: string, key: string, configs: ConfigEntry[]): T | null {
    const config = configs.find(c => c.category === category && c.key === key);
    if (!config) return null;

    const value = config.value || config.default_value;
    if (!value) return null;

    return serializeConfigValue(value, config.value_type) as T;
  }

  async exportAsEnv(): Promise<string> {
    const configs = await this.getAll();
    const grouped = configs.reduce((acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push(config);
      return acc;
    }, {} as Record<string, ConfigEntry[]>);

    let envContent = '# Auto-generated .env file from database configurations\n';
    envContent += `# Generated at: ${new Date().toISOString()}\n\n`;

    const categoryTitles: Record<string, string> = {
      ai: 'AI FEATURE CONFIGURATION',
      rate_limit: 'RATE LIMITING & QUOTAS',
      storage: 'STORAGE CONFIGURATION',
      app: 'APPLICATION SETTINGS',
      cache: 'CACHING & PERFORMANCE',
      whatsapp: 'WHATSAPP CONFIGURATION',
      backup: 'DATABASE BACKUPS',
      integrations: 'EXTERNAL INTEGRATIONS',
      monitoring: 'ERROR TRACKING & MONITORING',
      security: 'SECURITY SETTINGS',
    };

    for (const [category, categoryConfigs] of Object.entries(grouped)) {
      const title = categoryTitles[category] || category.toUpperCase();
      envContent += `# ${'='.repeat(44)}\n`;
      envContent += `# ${title}\n`;
      envContent += `# ${'='.repeat(44)}\n`;

      for (const config of categoryConfigs) {
        if (config.description) {
          envContent += `# ${config.description}\n`;
        }

        const envKey = `VITE_${category.toUpperCase()}_${config.key.toUpperCase()}`;
        const value = config.value || config.default_value || '';

        if (config.is_secret) {
          envContent += `${envKey}=***REDACTED***\n`;
        } else {
          envContent += `${envKey}=${value}\n`;
        }

        envContent += '\n';
      }
    }

    return envContent;
  }

  async exportAsJSON(): Promise<string> {
    const configs = await this.getAll();
    const structured: Record<string, Record<string, any>> = {};

    for (const config of configs) {
      if (!structured[config.category]) {
        structured[config.category] = {};
      }

      const value = config.value || config.default_value;
      structured[config.category][config.key] = {
        value: config.is_secret ? '***REDACTED***' : serializeConfigValue(value || '', config.value_type),
        type: config.value_type,
        description: config.description,
        isRequired: config.is_required,
        isSecret: config.is_secret,
      };
    }

    return JSON.stringify(structured, null, 2);
  }

  async validateConfigurations(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const configs = await this.getAll();
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const config of configs) {
      if (config.is_required && !config.value && !config.default_value) {
        errors.push(`Required configuration missing: ${config.category}.${config.key}`);
      }

      if (config.value_type === 'number' && config.value) {
        const num = Number(config.value);
        if (isNaN(num)) {
          errors.push(`Invalid number value for ${config.category}.${config.key}: ${config.value}`);
        }
      }

      if (config.value_type === 'boolean' && config.value) {
        if (!['true', 'false'].includes(config.value.toLowerCase())) {
          errors.push(`Invalid boolean value for ${config.category}.${config.key}: ${config.value}`);
        }
      }

      if ((config.value_type === 'array' || config.value_type === 'object') && config.value) {
        try {
          JSON.parse(config.value);
        } catch {
          errors.push(`Invalid JSON for ${config.category}.${config.key}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export const createConfigService = (userId?: string) => {
  return new ConfigurationService({ userId });
};

export default ConfigurationService;
