/*
  # AI Model Configuration and Provider Management

  ## Overview
  This migration creates infrastructure for managing multiple AI providers,
  models, and API configurations with intelligent routing and fallback support.

  ## New Tables
  1. **ai_providers**
     - Manages different AI service providers (OpenAI, Anthropic, etc.)
     - Stores API endpoints, authentication, and capabilities

  2. **ai_models**
     - Configuration for individual AI models
     - Pricing, token limits, capabilities, and performance metrics

  3. **ai_provider_keys**
     - Secure storage for API keys (encrypted)
     - Multiple keys per provider for load balancing

  4. **ai_requests_log**
     - Comprehensive logging of all AI API requests
     - Performance tracking, cost analysis, error monitoring

  5. **ai_model_performance**
     - Tracks model performance metrics over time
     - Success rates, latency, user satisfaction

  6. **ai_feature_flags**
     - Control AI feature availability per customer tier
     - A/B testing and gradual rollout support

  ## Features
     - Multi-provider support with automatic fallback
     - Cost optimization through intelligent routing
     - Performance monitoring and analytics
     - Feature flag management for controlled rollout
     - Detailed audit logging for compliance

  ## Security
     - RLS enabled on all tables
     - API keys stored with encryption references
     - Admin-only access to configuration tables
*/

-- AI providers table
CREATE TABLE IF NOT EXISTS ai_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text UNIQUE NOT NULL,
  provider_type text NOT NULL CHECK (provider_type IN ('llm', 'embedding', 'image_generation', 'image_analysis', 'speech_to_text', 'text_to_speech', 'moderation')),
  base_url text NOT NULL,
  api_version text,
  capabilities jsonb DEFAULT '{}'::jsonb,
  rate_limit_per_minute integer DEFAULT 60,
  priority integer DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  active boolean DEFAULT true,
  health_check_url text,
  last_health_check timestamptz,
  health_status text DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI models table
CREATE TABLE IF NOT EXISTS ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES ai_providers(id) ON DELETE CASCADE,
  model_name text NOT NULL,
  model_identifier text NOT NULL,
  model_type text NOT NULL CHECK (model_type IN ('chat', 'completion', 'embedding', 'image_generation', 'image_analysis', 'moderation', 'classification')),
  max_tokens integer,
  context_window integer,
  cost_per_1k_input_tokens decimal(10,6),
  cost_per_1k_output_tokens decimal(10,6),
  supports_streaming boolean DEFAULT false,
  supports_function_calling boolean DEFAULT false,
  supports_vision boolean DEFAULT false,
  capabilities jsonb DEFAULT '{}'::jsonb,
  active boolean DEFAULT true,
  priority integer DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_provider_model UNIQUE (provider_id, model_identifier)
);

-- AI provider keys (store encrypted references, not actual keys)
CREATE TABLE IF NOT EXISTS ai_provider_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES ai_providers(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  key_hash text NOT NULL,
  key_prefix text,
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  usage_count bigint DEFAULT 0,
  rate_limit_remaining integer,
  rate_limit_reset_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_provider_key_name UNIQUE (provider_id, key_name)
);

-- AI requests log
CREATE TABLE IF NOT EXISTS ai_requests_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES ai_providers(id) ON DELETE SET NULL,
  model_id uuid REFERENCES ai_models(id) ON DELETE SET NULL,
  request_type text NOT NULL CHECK (request_type IN ('chat', 'completion', 'embedding', 'image_generation', 'image_analysis', 'moderation', 'classification')),
  prompt_text text,
  prompt_tokens integer,
  response_text text,
  response_tokens integer,
  total_tokens integer,
  temperature decimal(3,2),
  max_tokens_requested integer,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error', 'timeout', 'rate_limited')),
  error_message text,
  error_code text,
  latency_ms integer,
  cost_usd decimal(10,6),
  cache_hit boolean DEFAULT false,
  request_metadata jsonb DEFAULT '{}'::jsonb,
  user_agent text,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- AI model performance tracking
CREATE TABLE IF NOT EXISTS ai_model_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES ai_models(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_requests bigint DEFAULT 0,
  successful_requests bigint DEFAULT 0,
  failed_requests bigint DEFAULT 0,
  average_latency_ms integer,
  p95_latency_ms integer,
  p99_latency_ms integer,
  total_tokens_used bigint DEFAULT 0,
  total_cost_usd decimal(12,4) DEFAULT 0,
  average_user_rating decimal(3,2),
  cache_hit_rate decimal(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_model_performance_date UNIQUE (model_id, date)
);

-- AI feature flags
CREATE TABLE IF NOT EXISTS ai_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name text UNIQUE NOT NULL,
  feature_description text,
  enabled_globally boolean DEFAULT false,
  enabled_for_tiers text[] DEFAULT ARRAY[]::text[],
  enabled_for_users uuid[],
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  feature_config jsonb DEFAULT '{}'::jsonb,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_providers_provider_type ON ai_providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON ai_providers(active);

CREATE INDEX IF NOT EXISTS idx_ai_models_provider_id ON ai_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_model_type ON ai_models(model_type);
CREATE INDEX IF NOT EXISTS idx_ai_models_active ON ai_models(active);

CREATE INDEX IF NOT EXISTS idx_ai_provider_keys_provider_id ON ai_provider_keys(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_provider_keys_is_active ON ai_provider_keys(is_active);

CREATE INDEX IF NOT EXISTS idx_ai_requests_log_user_id ON ai_requests_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_log_provider_id ON ai_requests_log(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_log_model_id ON ai_requests_log(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_log_status ON ai_requests_log(status);
CREATE INDEX IF NOT EXISTS idx_ai_requests_log_created_at ON ai_requests_log(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_model_performance_model_id ON ai_model_performance(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_performance_date ON ai_model_performance(date);

CREATE INDEX IF NOT EXISTS idx_ai_feature_flags_feature_name ON ai_feature_flags(feature_name);

-- Enable Row Level Security
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Configuration tables are readable"
  ON ai_providers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Models are publicly readable"
  ON ai_models FOR SELECT
  TO authenticated, anon
  USING (active = true);

CREATE POLICY "Users can view own request logs"
  ON ai_requests_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Feature flags are publicly readable"
  ON ai_feature_flags FOR SELECT
  TO authenticated, anon
  USING (true);

-- Function to select best AI model based on criteria
CREATE OR REPLACE FUNCTION select_best_ai_model(
  model_type_param text,
  max_cost_per_1k decimal DEFAULT NULL,
  requires_streaming boolean DEFAULT false,
  requires_vision boolean DEFAULT false
)
RETURNS TABLE (
  model_id uuid,
  provider_name text,
  model_name text,
  model_identifier text,
  cost_per_1k_input decimal,
  priority integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    p.provider_name,
    m.model_name,
    m.model_identifier,
    m.cost_per_1k_input_tokens,
    m.priority
  FROM ai_models m
  JOIN ai_providers p ON m.provider_id = p.id
  WHERE
    m.active = true
    AND p.active = true
    AND m.model_type = model_type_param
    AND (max_cost_per_1k IS NULL OR m.cost_per_1k_input_tokens <= max_cost_per_1k)
    AND (NOT requires_streaming OR m.supports_streaming = true)
    AND (NOT requires_vision OR m.supports_vision = true)
  ORDER BY m.priority DESC, m.cost_per_1k_input_tokens ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check if feature is enabled for user
CREATE OR REPLACE FUNCTION is_feature_enabled(
  feature_name_param text,
  user_id_param uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  feature_record ai_feature_flags%ROWTYPE;
BEGIN
  SELECT * INTO feature_record FROM ai_feature_flags WHERE feature_name = feature_name_param;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF feature_record.enabled_globally = true THEN
    RETURN true;
  END IF;
  
  IF user_id_param = ANY(feature_record.enabled_for_users) THEN
    RETURN true;
  END IF;
  
  IF feature_record.rollout_percentage > 0 THEN
    IF (hashtext(COALESCE(user_id_param::text, 'anonymous')) % 100) < feature_record.rollout_percentage THEN
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to log AI request
CREATE OR REPLACE FUNCTION log_ai_request(
  user_id_param uuid,
  model_id_param uuid,
  request_type_param text,
  prompt_tokens_param integer,
  response_tokens_param integer,
  latency_ms_param integer,
  status_param text,
  error_message_param text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
  total_cost decimal;
BEGIN
  SELECT 
    ((prompt_tokens_param::decimal / 1000) * cost_per_1k_input_tokens) +
    ((response_tokens_param::decimal / 1000) * cost_per_1k_output_tokens)
  INTO total_cost
  FROM ai_models
  WHERE id = model_id_param;
  
  INSERT INTO ai_requests_log (
    user_id, model_id, request_type, prompt_tokens, response_tokens,
    total_tokens, status, error_message, latency_ms, cost_usd
  ) VALUES (
    user_id_param, model_id_param, request_type_param, prompt_tokens_param,
    response_tokens_param, prompt_tokens_param + response_tokens_param,
    status_param, error_message_param, latency_ms_param, total_cost
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default AI providers
INSERT INTO ai_providers (provider_name, provider_type, base_url, api_version, priority, capabilities) VALUES
('OpenAI', 'llm', 'https://api.openai.com/v1', 'v1', 100, '{"streaming": true, "function_calling": true, "vision": true}'::jsonb),
('OpenAI Embeddings', 'embedding', 'https://api.openai.com/v1', 'v1', 100, '{"dimensions": [1536, 3072]}'::jsonb),
('OpenAI Moderation', 'moderation', 'https://api.openai.com/v1', 'v1', 100, '{"categories": ["hate", "harassment", "self-harm", "sexual", "violence"]}'::jsonb)
ON CONFLICT (provider_name) DO NOTHING;

-- Insert default AI models
INSERT INTO ai_models (provider_id, model_name, model_identifier, model_type, max_tokens, context_window, cost_per_1k_input_tokens, cost_per_1k_output_tokens, supports_streaming, supports_function_calling, supports_vision, priority) VALUES
((SELECT id FROM ai_providers WHERE provider_name = 'OpenAI'), 'GPT-4o Mini', 'gpt-4o-mini', 'chat', 16384, 128000, 0.00015, 0.0006, true, true, true, 90),
((SELECT id FROM ai_providers WHERE provider_name = 'OpenAI'), 'GPT-4o', 'gpt-4o', 'chat', 16384, 128000, 0.0025, 0.01, true, true, true, 95),
((SELECT id FROM ai_providers WHERE provider_name = 'OpenAI Embeddings'), 'Text Embedding Ada 002', 'text-embedding-ada-002', 'embedding', 8191, 8191, 0.0001, 0, false, false, false, 100),
((SELECT id FROM ai_providers WHERE provider_name = 'OpenAI Embeddings'), 'Text Embedding 3 Small', 'text-embedding-3-small', 'embedding', 8191, 8191, 0.00002, 0, false, false, false, 100),
((SELECT id FROM ai_providers WHERE provider_name = 'OpenAI Moderation'), 'Text Moderation Latest', 'text-moderation-latest', 'moderation', 32768, 32768, 0, 0, false, false, false, 100)
ON CONFLICT (provider_id, model_identifier) DO NOTHING;

-- Insert default feature flags
INSERT INTO ai_feature_flags (feature_name, feature_description, enabled_globally, rollout_percentage) VALUES
('semantic_search', 'Enable semantic search with vector embeddings', true, 100),
('ai_chat_support', 'AI-powered customer support chatbot', true, 100),
('waste_image_classification', 'Automatic waste type classification from images', false, 25),
('sentiment_analysis', 'Analyze customer feedback sentiment', true, 100),
('content_moderation', 'Automatic content moderation for user inputs', true, 100),
('voice_transcription', 'Speech-to-text for voice messages', false, 10),
('smart_recommendations', 'AI-generated personalized recommendations', true, 100)
ON CONFLICT (feature_name) DO NOTHING;