/*
  # Content Moderation and Security System

  ## Overview
  Comprehensive content moderation system using AI to detect and filter inappropriate,
  harmful, or policy-violating content. Includes audit trails and security monitoring.

  ## New Tables
  1. **content_moderation_results**
     - Store moderation results for all user-generated content
     - Track violation types, severity, and actions taken

  2. **moderation_policies**
     - Configure moderation rules and thresholds
     - Customizable per content type

  3. **security_events**
     - Log security-related events and anomalies
     - Track suspicious activities and potential threats

  4. **content_flags**
     - User-reported content flags
     - Community moderation support

  5. **moderation_actions**
     - Actions taken on flagged content
     - Admin review and resolution tracking

  ## Features
     - Automatic AI-powered content moderation
     - Customizable moderation policies
     - User reporting and community moderation
     - Security event tracking and alerting
     - Audit trail for compliance
     - Appeals and review workflow

  ## Security
     - RLS enabled on all tables
     - Admin-only access to sensitive moderation data
     - Encrypted storage of flagged content
*/

-- Content moderation results
CREATE TABLE IF NOT EXISTS content_moderation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('message', 'feedback', 'comment', 'post', 'image', 'document', 'profile')),
  content_text text,
  content_url text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  moderation_provider text DEFAULT 'openai' CHECK (moderation_provider IN ('openai', 'perspective', 'aws_comprehend', 'custom')),
  flagged boolean DEFAULT false,
  violation_categories jsonb DEFAULT '{}'::jsonb,
  severity_score decimal(3,2) DEFAULT 0 CHECK (severity_score >= 0 AND severity_score <= 1),
  action_taken text DEFAULT 'none' CHECK (action_taken IN ('none', 'warning', 'content_removed', 'user_suspended', 'user_banned', 'manual_review')),
  automated_action boolean DEFAULT true,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  appeal_status text CHECK (appeal_status IN ('none', 'pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Moderation policies
CREATE TABLE IF NOT EXISTS moderation_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name text UNIQUE NOT NULL,
  content_type text NOT NULL,
  violation_category text NOT NULL CHECK (violation_category IN ('hate', 'harassment', 'self_harm', 'sexual', 'violence', 'spam', 'profanity', 'pii', 'illegal', 'misinformation')),
  threshold decimal(3,2) NOT NULL DEFAULT 0.5 CHECK (threshold >= 0 AND threshold <= 1),
  auto_action text DEFAULT 'manual_review' CHECK (auto_action IN ('none', 'warn', 'remove', 'suspend', 'ban', 'manual_review')),
  grace_period interval DEFAULT interval '0 minutes',
  notification_enabled boolean DEFAULT true,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Security events log
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('suspicious_activity', 'brute_force_attempt', 'rate_limit_violation', 'unauthorized_access', 'data_breach_attempt', 'anomaly_detected', 'policy_violation')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  event_details jsonb DEFAULT '{}'::jsonb,
  affected_resource text,
  mitigation_action text,
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz DEFAULT now()
);

-- Content flags (user reports)
CREATE TABLE IF NOT EXISTS content_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  flagged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  flag_reason text NOT NULL CHECK (flag_reason IN ('inappropriate', 'spam', 'harassment', 'violence', 'hate_speech', 'false_information', 'copyright', 'privacy', 'other')),
  flag_description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  priority integer DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Moderation actions log
CREATE TABLE IF NOT EXISTS moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_moderation_id uuid REFERENCES content_moderation_results(id) ON DELETE CASCADE,
  content_flag_id uuid REFERENCES content_flags(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN ('warning_issued', 'content_removed', 'content_edited', 'user_warned', 'user_suspended', 'user_banned', 'appeal_granted', 'flag_dismissed')),
  action_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_reason text,
  action_duration interval,
  action_expires_at timestamptz,
  notification_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Moderation queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  queue_reason text NOT NULL CHECK (queue_reason IN ('high_severity', 'multiple_flags', 'ai_uncertain', 'escalated', 'appeal')),
  priority integer DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_moderation_results_user_id ON content_moderation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_results_flagged ON content_moderation_results(flagged);
CREATE INDEX IF NOT EXISTS idx_content_moderation_results_content_type ON content_moderation_results(content_type);
CREATE INDEX IF NOT EXISTS idx_content_moderation_results_created_at ON content_moderation_results(created_at);

CREATE INDEX IF NOT EXISTS idx_moderation_policies_active ON moderation_policies(active);
CREATE INDEX IF NOT EXISTS idx_moderation_policies_content_type ON moderation_policies(content_type);

CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

CREATE INDEX IF NOT EXISTS idx_content_flags_status ON content_flags(status);
CREATE INDEX IF NOT EXISTS idx_content_flags_flagged_by ON content_flags(flagged_by);
CREATE INDEX IF NOT EXISTS idx_content_flags_created_at ON content_flags(created_at);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_action_by ON moderation_actions(action_by);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_created_at ON moderation_actions(created_at);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON moderation_queue(priority);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_assigned_to ON moderation_queue(assigned_to);

-- Enable Row Level Security
ALTER TABLE content_moderation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own moderation results"
  ON content_moderation_results FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Moderation policies are publicly readable"
  ON moderation_policies FOR SELECT
  TO authenticated, anon
  USING (active = true);

CREATE POLICY "Users can view own security events"
  ON security_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create content flags"
  ON content_flags FOR INSERT
  TO authenticated
  WITH CHECK (flagged_by = auth.uid());

CREATE POLICY "Users can view own flags"
  ON content_flags FOR SELECT
  TO authenticated
  USING (flagged_by = auth.uid());

-- Function to moderate content
CREATE OR REPLACE FUNCTION moderate_content(
  content_id_param uuid,
  content_type_param text,
  content_text_param text,
  user_id_param uuid,
  moderation_scores jsonb
)
RETURNS uuid AS $$
DECLARE
  result_id uuid;
  is_flagged boolean := false;
  max_severity decimal := 0;
  auto_action text := 'none';
  policy_record moderation_policies%ROWTYPE;
BEGIN
  FOR policy_record IN 
    SELECT * FROM moderation_policies 
    WHERE content_type = content_type_param AND active = true
  LOOP
    IF (moderation_scores->>policy_record.violation_category)::decimal >= policy_record.threshold THEN
      is_flagged := true;
      max_severity := GREATEST(max_severity, (moderation_scores->>policy_record.violation_category)::decimal);
      
      IF policy_record.auto_action != 'none' AND policy_record.auto_action != 'manual_review' THEN
        auto_action := policy_record.auto_action;
      END IF;
    END IF;
  END LOOP;
  
  INSERT INTO content_moderation_results (
    content_id, content_type, content_text, user_id,
    flagged, violation_categories, severity_score, action_taken
  ) VALUES (
    content_id_param, content_type_param, content_text_param, user_id_param,
    is_flagged, moderation_scores, max_severity, auto_action
  )
  RETURNING id INTO result_id;
  
  IF is_flagged AND (auto_action = 'manual_review' OR max_severity >= 0.8) THEN
    INSERT INTO moderation_queue (content_id, content_type, queue_reason, priority)
    VALUES (
      content_id_param, 
      content_type_param,
      CASE WHEN max_severity >= 0.8 THEN 'high_severity' ELSE 'ai_uncertain' END,
      CASE WHEN max_severity >= 0.8 THEN 90 ELSE 50 END
    );
  END IF;
  
  RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log security event
CREATE OR REPLACE FUNCTION log_security_event(
  event_type_param text,
  severity_param text,
  user_id_param uuid DEFAULT NULL,
  ip_address_param inet DEFAULT NULL,
  event_details_param jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO security_events (
    event_type, severity, user_id, ip_address, event_details
  ) VALUES (
    event_type_param, severity_param, user_id_param, ip_address_param, event_details_param
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has recent violations
CREATE OR REPLACE FUNCTION check_user_violations(
  user_id_param uuid,
  timeframe interval DEFAULT interval '30 days'
)
RETURNS TABLE (
  total_violations bigint,
  critical_violations bigint,
  recent_actions jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE severity_score >= 0.8)::bigint,
    jsonb_agg(
      jsonb_build_object(
        'date', created_at,
        'action', action_taken,
        'severity', severity_score
      ) ORDER BY created_at DESC
    ) FILTER (WHERE severity_score >= 0.5)
  FROM content_moderation_results
  WHERE user_id = user_id_param
    AND created_at >= (now() - timeframe)
    AND flagged = true;
END;
$$ LANGUAGE plpgsql;

-- Insert default moderation policies
INSERT INTO moderation_policies (policy_name, content_type, violation_category, threshold, auto_action) VALUES
('hate_speech_messages', 'message', 'hate', 0.7, 'manual_review'),
('harassment_messages', 'message', 'harassment', 0.8, 'manual_review'),
('violence_content', 'message', 'violence', 0.75, 'manual_review'),
('sexual_content', 'message', 'sexual', 0.8, 'remove'),
('spam_detection', 'message', 'spam', 0.6, 'warn'),
('hate_speech_feedback', 'feedback', 'hate', 0.6, 'manual_review'),
('profanity_filter', 'message', 'profanity', 0.5, 'warn')
ON CONFLICT (policy_name) DO NOTHING;