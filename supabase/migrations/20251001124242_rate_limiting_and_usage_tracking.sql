/*
  # Rate Limiting and Usage Tracking System

  ## Overview
  Comprehensive rate limiting, quota management, and usage analytics for AI features.
  Enables cost control, fair usage policies, and detailed usage reporting.

  ## New Tables
  1. **rate_limits**
     - Define rate limits per user tier, feature, or endpoint
     - Flexible time windows (per minute, hour, day, month)

  2. **usage_quotas**
     - Monthly/daily quotas per user or organization
     - Token limits, request counts, cost caps

  3. **usage_tracking**
     - Real-time usage tracking per user/feature
     - Granular metrics for billing and analytics

  4. **usage_alerts**
     - Configure alerts for quota thresholds
     - Notify users approaching limits

  5. **billing_periods**
     - Track billing cycles and usage periods
     - Calculate costs per period

  ## Features
     - Configurable rate limits per tier
     - Soft and hard quota limits
     - Real-time usage tracking
     - Overage alerts and notifications
     - Cost attribution and billing support
     - Usage analytics and reporting

  ## Security
     - RLS enabled on all tables
     - Users can only view own usage data
     - Admin access for configuration
*/

-- Rate limits configuration
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  limit_name text UNIQUE NOT NULL,
  feature_name text NOT NULL,
  user_tier text DEFAULT 'free' CHECK (user_tier IN ('free', 'basic', 'premium', 'enterprise')),
  rate_limit_type text NOT NULL CHECK (rate_limit_type IN ('requests_per_minute', 'requests_per_hour', 'requests_per_day', 'tokens_per_day', 'tokens_per_month', 'cost_per_month')),
  limit_value integer NOT NULL,
  burst_allowance integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Usage quotas per user
CREATE TABLE IF NOT EXISTS usage_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quota_type text NOT NULL CHECK (quota_type IN ('monthly_requests', 'monthly_tokens', 'monthly_cost', 'daily_requests', 'daily_tokens')),
  quota_limit integer NOT NULL,
  quota_used integer DEFAULT 0,
  quota_remaining integer,
  reset_date timestamptz NOT NULL,
  soft_limit_percentage integer DEFAULT 80 CHECK (soft_limit_percentage >= 0 AND soft_limit_percentage <= 100),
  overage_allowed boolean DEFAULT false,
  overage_limit integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_quota_type UNIQUE (user_id, quota_type)
);

-- Real-time usage tracking
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  tracking_period text NOT NULL CHECK (tracking_period IN ('minute', 'hour', 'day', 'month')),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  request_count integer DEFAULT 0,
  token_count integer DEFAULT 0,
  cost_usd decimal(10,4) DEFAULT 0,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  cache_hit_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_feature_period UNIQUE (user_id, feature_name, tracking_period, period_start)
);

-- Usage alerts configuration
CREATE TABLE IF NOT EXISTS usage_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('quota_warning', 'quota_exceeded', 'rate_limit_approaching', 'cost_threshold', 'anomaly_detected')),
  threshold_percentage integer CHECK (threshold_percentage >= 0 AND threshold_percentage <= 100),
  quota_type text,
  alert_channel text DEFAULT 'email' CHECK (alert_channel IN ('email', 'sms', 'in_app', 'webhook')),
  webhook_url text,
  active boolean DEFAULT true,
  last_triggered_at timestamptz,
  trigger_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Billing periods
CREATE TABLE IF NOT EXISTS billing_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_requests integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  total_cost_usd decimal(12,4) DEFAULT 0,
  base_subscription_cost decimal(10,2) DEFAULT 0,
  overage_cost decimal(10,2) DEFAULT 0,
  total_amount_due decimal(12,2),
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'invoiced', 'paid')),
  invoice_generated_at timestamptz,
  payment_due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_billing_period UNIQUE (user_id, period_start)
);

-- Rate limit violations log
CREATE TABLE IF NOT EXISTS rate_limit_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  violation_type text NOT NULL CHECK (violation_type IN ('rate_limit', 'quota_exceeded', 'cost_cap')),
  limit_value integer,
  actual_value integer,
  ip_address inet,
  user_agent text,
  violation_timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_feature_name ON rate_limits(feature_name);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_tier ON rate_limits(user_tier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_active ON rate_limits(active);

CREATE INDEX IF NOT EXISTS idx_usage_quotas_user_id ON usage_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_quotas_quota_type ON usage_quotas(quota_type);
CREATE INDEX IF NOT EXISTS idx_usage_quotas_reset_date ON usage_quotas(reset_date);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature_name ON usage_tracking(feature_name);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period_start ON usage_tracking(period_start);

CREATE INDEX IF NOT EXISTS idx_usage_alerts_user_id ON usage_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_active ON usage_alerts(active);

CREATE INDEX IF NOT EXISTS idx_billing_periods_user_id ON billing_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_periods_period_start ON billing_periods(period_start);
CREATE INDEX IF NOT EXISTS idx_billing_periods_status ON billing_periods(status);

CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_user_id ON rate_limit_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_timestamp ON rate_limit_violations(violation_timestamp);

-- Enable Row Level Security
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Rate limits are publicly readable"
  ON rate_limits FOR SELECT
  TO authenticated, anon
  USING (active = true);

CREATE POLICY "Users can view own quotas"
  ON usage_quotas FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own alerts"
  ON usage_alerts FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own billing periods"
  ON billing_periods FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own violations"
  ON rate_limit_violations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  user_id_param uuid,
  feature_name_param text,
  user_tier_param text DEFAULT 'free'
)
RETURNS boolean AS $$
DECLARE
  limit_record rate_limits%ROWTYPE;
  current_usage integer;
  time_window interval;
  period_start timestamptz;
BEGIN
  SELECT * INTO limit_record
  FROM rate_limits
  WHERE feature_name = feature_name_param
    AND user_tier = user_tier_param
    AND active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  time_window := CASE limit_record.rate_limit_type
    WHEN 'requests_per_minute' THEN interval '1 minute'
    WHEN 'requests_per_hour' THEN interval '1 hour'
    WHEN 'requests_per_day' THEN interval '1 day'
    ELSE interval '1 day'
  END;
  
  period_start := date_trunc(
    CASE limit_record.rate_limit_type
      WHEN 'requests_per_minute' THEN 'minute'
      WHEN 'requests_per_hour' THEN 'hour'
      WHEN 'requests_per_day' THEN 'day'
      ELSE 'day'
    END,
    now()
  );
  
  SELECT COALESCE(SUM(request_count), 0) INTO current_usage
  FROM usage_tracking
  WHERE user_id = user_id_param
    AND feature_name = feature_name_param
    AND period_start >= (now() - time_window);
  
  IF current_usage >= (limit_record.limit_value + limit_record.burst_allowance) THEN
    INSERT INTO rate_limit_violations (user_id, feature_name, violation_type, limit_value, actual_value)
    VALUES (user_id_param, feature_name_param, 'rate_limit', limit_record.limit_value, current_usage);
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to update usage tracking
CREATE OR REPLACE FUNCTION track_usage(
  user_id_param uuid,
  feature_name_param text,
  request_count_param integer DEFAULT 1,
  token_count_param integer DEFAULT 0,
  cost_param decimal DEFAULT 0,
  success_param boolean DEFAULT true,
  cache_hit_param boolean DEFAULT false
)
RETURNS void AS $$
DECLARE
  periods text[] := ARRAY['minute', 'hour', 'day', 'month'];
  period text;
  period_start_ts timestamptz;
  period_end_ts timestamptz;
BEGIN
  FOREACH period IN ARRAY periods LOOP
    period_start_ts := date_trunc(period, now());
    period_end_ts := period_start_ts + ('1 ' || period)::interval;
    
    INSERT INTO usage_tracking (
      user_id, feature_name, tracking_period, period_start, period_end,
      request_count, token_count, cost_usd,
      success_count, error_count, cache_hit_count
    ) VALUES (
      user_id_param, feature_name_param, period, period_start_ts, period_end_ts,
      request_count_param, token_count_param, cost_param,
      CASE WHEN success_param THEN request_count_param ELSE 0 END,
      CASE WHEN NOT success_param THEN request_count_param ELSE 0 END,
      CASE WHEN cache_hit_param THEN request_count_param ELSE 0 END
    )
    ON CONFLICT (user_id, feature_name, tracking_period, period_start)
    DO UPDATE SET
      request_count = usage_tracking.request_count + request_count_param,
      token_count = usage_tracking.token_count + token_count_param,
      cost_usd = usage_tracking.cost_usd + cost_param,
      success_count = usage_tracking.success_count + CASE WHEN success_param THEN request_count_param ELSE 0 END,
      error_count = usage_tracking.error_count + CASE WHEN NOT success_param THEN request_count_param ELSE 0 END,
      cache_hit_count = usage_tracking.cache_hit_count + CASE WHEN cache_hit_param THEN request_count_param ELSE 0 END,
      updated_at = now();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check quota
CREATE OR REPLACE FUNCTION check_quota(
  user_id_param uuid,
  quota_type_param text,
  usage_amount integer
)
RETURNS boolean AS $$
DECLARE
  quota_record usage_quotas%ROWTYPE;
BEGIN
  SELECT * INTO quota_record
  FROM usage_quotas
  WHERE user_id = user_id_param
    AND quota_type = quota_type_param;
  
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  IF (quota_record.quota_used + usage_amount) > quota_record.quota_limit THEN
    IF quota_record.overage_allowed AND 
       ((quota_record.quota_used + usage_amount) <= (quota_record.quota_limit + quota_record.overage_limit)) THEN
      RETURN true;
    END IF;
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to update quota usage
CREATE OR REPLACE FUNCTION update_quota_usage(
  user_id_param uuid,
  quota_type_param text,
  usage_amount integer
)
RETURNS void AS $$
BEGIN
  UPDATE usage_quotas
  SET 
    quota_used = quota_used + usage_amount,
    quota_remaining = quota_limit - (quota_used + usage_amount),
    updated_at = now()
  WHERE user_id = user_id_param
    AND quota_type = quota_type_param;
END;
$$ LANGUAGE plpgsql;

-- Insert default rate limits
INSERT INTO rate_limits (limit_name, feature_name, user_tier, rate_limit_type, limit_value, burst_allowance) VALUES
('free_chat_per_minute', 'ai_chat', 'free', 'requests_per_minute', 5, 2),
('free_chat_per_day', 'ai_chat', 'free', 'requests_per_day', 50, 10),
('basic_chat_per_minute', 'ai_chat', 'basic', 'requests_per_minute', 20, 5),
('basic_chat_per_day', 'ai_chat', 'basic', 'requests_per_day', 500, 50),
('premium_chat_per_minute', 'ai_chat', 'premium', 'requests_per_minute', 60, 20),
('premium_chat_per_day', 'ai_chat', 'premium', 'requests_per_day', 2000, 200),
('free_embedding_per_day', 'embeddings', 'free', 'requests_per_day', 100, 20),
('premium_embedding_per_day', 'embeddings', 'premium', 'requests_per_day', 5000, 500),
('free_image_analysis_per_day', 'image_analysis', 'free', 'requests_per_day', 10, 2),
('premium_image_analysis_per_day', 'image_analysis', 'premium', 'requests_per_day', 500, 50)
ON CONFLICT (limit_name) DO NOTHING;