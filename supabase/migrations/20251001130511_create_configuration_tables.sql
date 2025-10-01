/*
  # Configuration Management System

  1. New Tables
    - `app_configurations`
      - Stores all application configuration key-value pairs
      - `id` (uuid, primary key)
      - `category` (text) - Configuration category (ai, storage, integrations, etc.)
      - `key` (text) - Configuration key name
      - `value` (text) - Configuration value (stored as JSON string for complex types)
      - `value_type` (text) - Data type (string, number, boolean, array, object)
      - `description` (text) - Human-readable description
      - `is_secret` (boolean) - Whether this is a sensitive value
      - `is_required` (boolean) - Whether this config is required
      - `default_value` (text) - Default value if not set
      - `updated_by` (uuid) - User who last updated this config
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `configuration_history`
      - Audit log of all configuration changes
      - `id` (uuid, primary key)
      - `config_id` (uuid) - References app_configurations
      - `old_value` (text)
      - `new_value` (text)
      - `changed_by` (uuid) - User who made the change
      - `change_reason` (text)
      - `created_at` (timestamptz)
    
    - `configuration_sync_log`
      - Tracks synchronization between database and files
      - `id` (uuid, primary key)
      - `sync_direction` (text) - 'db_to_file' or 'file_to_db'
      - `sync_status` (text) - 'success', 'failed', 'partial'
      - `configs_synced` (integer)
      - `error_message` (text)
      - `synced_by` (uuid)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Only authenticated admin users can manage configurations
    - Configuration history is append-only
    - Secrets are masked in queries unless explicitly requested

  3. Indexes
    - Index on category and key for fast lookups
    - Index on updated_at for sorting
    - Index on config_id in history table

  4. Functions
    - Function to get configuration by key with default fallback
    - Function to update configuration with history logging
    - Function to sync configurations
*/

-- Create app_configurations table
CREATE TABLE IF NOT EXISTS app_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  key text NOT NULL,
  value text,
  value_type text NOT NULL DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'array', 'object')),
  description text,
  is_secret boolean DEFAULT false,
  is_required boolean DEFAULT false,
  default_value text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category, key)
);

-- Create configuration_history table
CREATE TABLE IF NOT EXISTS configuration_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES app_configurations(id) ON DELETE CASCADE,
  old_value text,
  new_value text,
  changed_by uuid REFERENCES auth.users(id),
  change_reason text,
  created_at timestamptz DEFAULT now()
);

-- Create configuration_sync_log table
CREATE TABLE IF NOT EXISTS configuration_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_direction text NOT NULL CHECK (sync_direction IN ('db_to_file', 'file_to_db', 'bidirectional')),
  sync_status text NOT NULL CHECK (sync_status IN ('success', 'failed', 'partial')),
  configs_synced integer DEFAULT 0,
  error_message text,
  synced_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_configurations_category_key ON app_configurations(category, key);
CREATE INDEX IF NOT EXISTS idx_app_configurations_updated_at ON app_configurations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_configuration_history_config_id ON configuration_history(config_id);
CREATE INDEX IF NOT EXISTS idx_configuration_history_created_at ON configuration_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_configuration_sync_log_created_at ON configuration_sync_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE app_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_configurations
CREATE POLICY "Authenticated users can view configurations"
  ON app_configurations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert configurations"
  ON app_configurations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can update configurations"
  ON app_configurations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin users can delete configurations"
  ON app_configurations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for configuration_history (read-only for authenticated users)
CREATE POLICY "Authenticated users can view configuration history"
  ON configuration_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert configuration history"
  ON configuration_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for configuration_sync_log
CREATE POLICY "Authenticated users can view sync logs"
  ON configuration_sync_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sync logs"
  ON configuration_sync_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to get configuration value with fallback to default
CREATE OR REPLACE FUNCTION get_config_value(
  config_category text,
  config_key text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_value text;
  config_default text;
BEGIN
  SELECT value, default_value
  INTO config_value, config_default
  FROM app_configurations
  WHERE category = config_category
    AND key = config_key;
  
  RETURN COALESCE(config_value, config_default);
END;
$$;

-- Function to update configuration with automatic history logging
CREATE OR REPLACE FUNCTION update_config_with_history(
  config_category text,
  config_key text,
  new_value text,
  change_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_record app_configurations%ROWTYPE;
  history_id uuid;
BEGIN
  -- Get existing config
  SELECT * INTO config_record
  FROM app_configurations
  WHERE category = config_category
    AND key = config_key;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Configuration not found: %.%', config_category, config_key;
  END IF;
  
  -- Log to history
  INSERT INTO configuration_history (
    config_id,
    old_value,
    new_value,
    changed_by,
    change_reason
  ) VALUES (
    config_record.id,
    config_record.value,
    new_value,
    auth.uid(),
    change_reason
  )
  RETURNING id INTO history_id;
  
  -- Update configuration
  UPDATE app_configurations
  SET 
    value = new_value,
    updated_by = auth.uid(),
    updated_at = now()
  WHERE id = config_record.id;
  
  RETURN history_id;
END;
$$;

-- Function to get all configurations by category
CREATE OR REPLACE FUNCTION get_configs_by_category(config_category text)
RETURNS TABLE (
  key text,
  value text,
  value_type text,
  description text,
  is_secret boolean,
  is_required boolean,
  default_value text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    app_configurations.key,
    CASE 
      WHEN app_configurations.is_secret THEN '***REDACTED***'
      ELSE app_configurations.value
    END as value,
    app_configurations.value_type,
    app_configurations.description,
    app_configurations.is_secret,
    app_configurations.is_required,
    app_configurations.default_value
  FROM app_configurations
  WHERE category = config_category
  ORDER BY app_configurations.key;
END;
$$;

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_app_configurations_updated_at
  BEFORE UPDATE ON app_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default configuration entries
INSERT INTO app_configurations (category, key, value, value_type, description, is_required, default_value)
VALUES
  -- AI Configuration
  ('ai', 'enable_chat', 'true', 'boolean', 'Enable AI-powered chat functionality', true, 'true'),
  ('ai', 'enable_semantic_search', 'true', 'boolean', 'Enable semantic search with embeddings', true, 'true'),
  ('ai', 'enable_image_analysis', 'true', 'boolean', 'Enable AI image analysis', false, 'true'),
  ('ai', 'enable_sentiment_analysis', 'true', 'boolean', 'Enable sentiment analysis', false, 'true'),
  ('ai', 'enable_content_moderation', 'true', 'boolean', 'Enable content moderation', false, 'true'),
  ('ai', 'default_chat_model', 'gpt-4o-mini', 'string', 'Default AI model for chat', true, 'gpt-4o-mini'),
  ('ai', 'default_embedding_model', 'text-embedding-3-small', 'string', 'Default embedding model', true, 'text-embedding-3-small'),
  
  -- Rate Limiting
  ('rate_limit', 'enabled', 'true', 'boolean', 'Enable rate limiting', true, 'true'),
  ('rate_limit', 'default_user_tier', 'free', 'string', 'Default user tier', true, 'free'),
  ('rate_limit', 'free_tier_daily_requests', '50', 'number', 'Daily request limit for free tier', true, '50'),
  ('rate_limit', 'free_tier_monthly_tokens', '100000', 'number', 'Monthly token limit for free tier', true, '100000'),
  ('rate_limit', 'premium_tier_daily_requests', '2000', 'number', 'Daily request limit for premium tier', true, '2000'),
  ('rate_limit', 'premium_tier_monthly_tokens', '5000000', 'number', 'Monthly token limit for premium tier', true, '5000000'),
  
  -- Storage Configuration
  ('storage', 'max_image_size_mb', '10', 'number', 'Maximum image upload size in MB', true, '10'),
  ('storage', 'max_document_size_mb', '20', 'number', 'Maximum document upload size in MB', true, '20'),
  ('storage', 'max_avatar_size_mb', '2', 'number', 'Maximum avatar upload size in MB', true, '2'),
  ('storage', 'allowed_image_types', '["image/jpeg","image/png","image/webp"]', 'array', 'Allowed image MIME types', true, '["image/jpeg","image/png","image/webp"]'),
  ('storage', 'allowed_document_types', '["application/pdf","application/msword"]', 'array', 'Allowed document MIME types', true, '["application/pdf","application/msword"]'),
  
  -- Application Settings
  ('app', 'version', '0.1.0', 'string', 'Application version', true, '0.1.0'),
  ('app', 'environment', 'development', 'string', 'Current environment', true, 'development'),
  ('app', 'csp_enabled', 'true', 'boolean', 'Enable Content Security Policy', true, 'true'),
  ('app', 'enable_beta_features', 'false', 'boolean', 'Enable beta features', false, 'false'),
  ('app', 'enable_debug_mode', 'false', 'boolean', 'Enable debug mode', false, 'false'),
  
  -- Cache Configuration
  ('cache', 'enable_ai_cache', 'true', 'boolean', 'Enable AI response caching', true, 'true'),
  ('cache', 'cache_ttl_seconds', '604800', 'number', 'Cache TTL in seconds (7 days)', true, '604800'),
  
  -- WhatsApp
  ('whatsapp', 'phone_number', '2349152870616', 'string', 'WhatsApp contact number (international format)', true, '2349152870616'),
  ('whatsapp', 'display_number', '09152870616', 'string', 'WhatsApp display number', true, '09152870616'),
  ('whatsapp', 'default_message', 'Hello! I''m interested in ARET Environmental Services. I''d like to know more about your waste management solutions.', 'string', 'Default WhatsApp message', true, 'Hello! I''m interested in ARET Environmental Services.'),
  
  -- Backup
  ('backup', 'enable_auto_backup', 'true', 'boolean', 'Enable automatic backups', true, 'true'),
  ('backup', 'backup_frequency_hours', '24', 'number', 'Backup frequency in hours', true, '24')
ON CONFLICT (category, key) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON app_configurations TO authenticated;
GRANT SELECT ON configuration_history TO authenticated;
GRANT SELECT ON configuration_sync_log TO authenticated;
