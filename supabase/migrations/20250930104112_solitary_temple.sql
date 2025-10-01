/*
  # AI Features and Analytics Schema

  1. New Tables
    - `ai_chat_sessions` - AI-powered customer support sessions
    - `ai_chat_messages` - Messages in AI chat sessions
    - `route_optimizations` - AI-generated route optimizations
    - `waste_predictions` - AI waste generation predictions
    - `sustainability_insights` - AI-generated sustainability insights
    - `customer_analytics` - Customer behavior analytics

  2. Security
    - Enable RLS on all AI tables
    - Secure access to AI features

  3. AI Features
    - Intelligent customer support chatbot
    - Route optimization algorithms
    - Waste prediction models
    - Sustainability recommendations
    - Customer behavior analysis
*/

-- AI chat sessions table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  session_id text UNIQUE NOT NULL,
  session_type text DEFAULT 'support' CHECK (session_type IN ('support', 'consultation', 'feedback', 'emergency')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  ai_model text DEFAULT 'gpt-4',
  conversation_summary text,
  customer_satisfaction integer CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
  resolved boolean DEFAULT false,
  escalated_to_human boolean DEFAULT false,
  escalation_reason text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- AI chat messages table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  message_type text NOT NULL CHECK (message_type IN ('user', 'ai', 'system')),
  content text NOT NULL,
  intent text,
  confidence decimal(3,2),
  entities jsonb,
  response_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Route optimizations table
CREATE TABLE IF NOT EXISTS route_optimizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES collection_routes(id) ON DELETE CASCADE,
  optimization_date date DEFAULT CURRENT_DATE,
  original_distance_km decimal(8,2),
  optimized_distance_km decimal(8,2),
  distance_saved_km decimal(8,2),
  original_duration interval,
  optimized_duration interval,
  time_saved interval,
  fuel_saved_liters decimal(8,2),
  carbon_reduced_kg decimal(8,2),
  cost_savings decimal(10,2),
  optimization_algorithm text DEFAULT 'genetic_algorithm',
  confidence_score decimal(3,2) DEFAULT 0.85,
  implemented boolean DEFAULT false,
  implementation_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Waste predictions table
CREATE TABLE IF NOT EXISTS waste_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  prediction_date date NOT NULL,
  predicted_waste_kg decimal(8,2) NOT NULL,
  waste_type waste_type NOT NULL,
  confidence_level decimal(3,2) DEFAULT 0.80,
  factors_considered jsonb,
  actual_waste_kg decimal(8,2),
  accuracy_percentage decimal(5,2),
  model_version text DEFAULT 'v1.0',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sustainability insights table
CREATE TABLE IF NOT EXISTS sustainability_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('waste_reduction', 'recycling_opportunity', 'carbon_footprint', 'cost_optimization', 'behavioral_change')),
  title text NOT NULL,
  description text NOT NULL,
  current_metric decimal(10,2),
  target_metric decimal(10,2),
  potential_improvement decimal(5,2),
  implementation_steps text[],
  estimated_savings decimal(10,2),
  environmental_impact text,
  difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  priority_score integer DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
  status text DEFAULT 'active' CHECK (status IN ('active', 'implemented', 'dismissed', 'expired')),
  generated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '60 days'),
  created_at timestamptz DEFAULT now()
);

-- Customer analytics table
CREATE TABLE IF NOT EXISTS customer_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  analysis_date date DEFAULT CURRENT_DATE,
  total_waste_kg decimal(10,2) DEFAULT 0,
  recycling_rate decimal(5,2) DEFAULT 0,
  average_collection_rating decimal(3,2),
  payment_punctuality decimal(5,2) DEFAULT 100,
  service_utilization decimal(5,2) DEFAULT 100,
  carbon_footprint_kg decimal(10,4) DEFAULT 0,
  cost_per_kg decimal(8,2),
  waste_trend text DEFAULT 'stable' CHECK (waste_trend IN ('increasing', 'stable', 'decreasing')),
  engagement_score integer DEFAULT 50 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  churn_risk decimal(3,2) DEFAULT 0.10,
  lifetime_value decimal(12,2),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for AI tables
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_customer_id ON ai_chat_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_session_id ON ai_chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session_id ON ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_route_optimizations_route_id ON route_optimizations(route_id);
CREATE INDEX IF NOT EXISTS idx_waste_predictions_customer_id ON waste_predictions(customer_id);
CREATE INDEX IF NOT EXISTS idx_waste_predictions_prediction_date ON waste_predictions(prediction_date);
CREATE INDEX IF NOT EXISTS idx_sustainability_insights_customer_id ON sustainability_insights(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_customer_id ON customer_analytics(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_analysis_date ON customer_analytics(analysis_date);

-- Enable Row Level Security for AI tables
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI chat sessions
CREATE POLICY "Customers can view own AI chat sessions"
  ON ai_chat_sessions FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create AI chat sessions"
  ON ai_chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- RLS Policies for AI chat messages
CREATE POLICY "Customers can view own AI chat messages"
  ON ai_chat_messages FOR SELECT
  TO authenticated
  USING (session_id IN (SELECT id FROM ai_chat_sessions WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())));

CREATE POLICY "Customers can create AI chat messages"
  ON ai_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (session_id IN (SELECT id FROM ai_chat_sessions WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())));

-- RLS Policies for waste predictions
CREATE POLICY "Customers can view own waste predictions"
  ON waste_predictions FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- RLS Policies for sustainability insights
CREATE POLICY "Customers can view own sustainability insights"
  ON sustainability_insights FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- RLS Policies for customer analytics
CREATE POLICY "Customers can view own analytics"
  ON customer_analytics FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- Create functions for AI features
CREATE OR REPLACE FUNCTION calculate_carbon_footprint(
  waste_amount decimal,
  waste_type_param text,
  frequency_param text
) RETURNS decimal AS $$
DECLARE
  carbon_factor decimal;
  frequency_multiplier decimal;
  annual_footprint decimal;
BEGIN
  -- Carbon footprint factors (kg CO2 per kg waste)
  carbon_factor := CASE waste_type_param
    WHEN 'general' THEN 0.5
    WHEN 'organic' THEN 0.3
    WHEN 'plastic' THEN 2.1
    WHEN 'paper' THEN 0.9
    WHEN 'glass' THEN 0.2
    WHEN 'metal' THEN 1.8
    WHEN 'electronic' THEN 3.5
    WHEN 'hazardous' THEN 4.0
    ELSE 0.5
  END;

  -- Frequency multipliers (per year)
  frequency_multiplier := CASE frequency_param
    WHEN 'daily' THEN 365
    WHEN 'weekly' THEN 52
    WHEN 'biweekly' THEN 26
    WHEN 'monthly' THEN 12
    ELSE 52
  END;

  annual_footprint := waste_amount * carbon_factor * frequency_multiplier;
  
  RETURN annual_footprint;
END;
$$ LANGUAGE plpgsql;

-- Function to generate AI recommendations
CREATE OR REPLACE FUNCTION generate_ai_recommendations(customer_uuid uuid)
RETURNS void AS $$
DECLARE
  customer_record customers%ROWTYPE;
  analytics_record customer_analytics%ROWTYPE;
  avg_waste decimal;
  recycling_rate decimal;
BEGIN
  -- Get customer data
  SELECT * INTO customer_record FROM customers WHERE id = customer_uuid;
  
  -- Get latest analytics
  SELECT * INTO analytics_record 
  FROM customer_analytics 
  WHERE customer_id = customer_uuid 
  ORDER BY analysis_date DESC 
  LIMIT 1;

  -- Generate waste reduction recommendation if waste is above average
  IF analytics_record.total_waste_kg > 50 THEN
    INSERT INTO ai_recommendations (
      customer_id, recommendation_type, title, description, 
      potential_savings, environmental_benefit, priority
    ) VALUES (
      customer_uuid, 'waste_reduction', 
      'Reduce Weekly Waste Generation',
      'Based on your waste patterns, you could reduce waste by 15-20% through better planning and composting.',
      (analytics_record.total_waste_kg * 0.15 * analytics_record.cost_per_kg),
      'Reduce carbon footprint by ' || (analytics_record.carbon_footprint_kg * 0.15)::text || ' kg CO2 annually',
      'medium'
    );
  END IF;

  -- Generate recycling recommendation if recycling rate is low
  IF analytics_record.recycling_rate < 30 THEN
    INSERT INTO ai_recommendations (
      customer_id, recommendation_type, title, description,
      environmental_benefit, priority
    ) VALUES (
      customer_uuid, 'recycling_improvement',
      'Increase Recycling Rate',
      'You could improve your recycling rate by properly segregating plastic, paper, and glass waste.',
      'Potential to recycle additional ' || (analytics_record.total_waste_kg * 0.25)::text || ' kg monthly',
      'high'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer analytics
CREATE OR REPLACE FUNCTION update_customer_analytics(customer_uuid uuid)
RETURNS void AS $$
DECLARE
  total_waste decimal;
  recycled_waste decimal;
  avg_rating decimal;
  carbon_footprint decimal;
BEGIN
  -- Calculate metrics from the last 30 days
  SELECT 
    COALESCE(SUM(weight_kg), 0),
    COALESCE(AVG(customer_rating), 0)
  INTO total_waste, avg_rating
  FROM waste_collections 
  WHERE customer_id = customer_uuid 
  AND scheduled_date >= CURRENT_DATE - INTERVAL '30 days';

  -- Calculate recycled waste
  SELECT COALESCE(SUM(wi.weight_kg), 0)
  INTO recycled_waste
  FROM waste_items wi
  JOIN waste_collections wc ON wi.collection_id = wc.id
  WHERE wc.customer_id = customer_uuid 
  AND wi.recyclable = true
  AND wc.scheduled_date >= CURRENT_DATE - INTERVAL '30 days';

  -- Calculate carbon footprint
  SELECT COALESCE(SUM(wi.carbon_footprint_kg), 0)
  INTO carbon_footprint
  FROM waste_items wi
  JOIN waste_collections wc ON wi.collection_id = wc.id
  WHERE wc.customer_id = customer_uuid 
  AND wc.scheduled_date >= CURRENT_DATE - INTERVAL '30 days';

  -- Insert or update analytics
  INSERT INTO customer_analytics (
    customer_id, analysis_date, total_waste_kg, recycled_waste_kg,
    recycling_rate, average_collection_rating, carbon_footprint_kg
  ) VALUES (
    customer_uuid, CURRENT_DATE, total_waste, recycled_waste,
    CASE WHEN total_waste > 0 THEN (recycled_waste / total_waste * 100) ELSE 0 END,
    avg_rating, carbon_footprint
  )
  ON CONFLICT (customer_id, analysis_date) 
  DO UPDATE SET
    total_waste_kg = EXCLUDED.total_waste_kg,
    recycled_waste_kg = EXCLUDED.recycled_waste_kg,
    recycling_rate = EXCLUDED.recycling_rate,
    average_collection_rating = EXCLUDED.average_collection_rating,
    carbon_footprint_kg = EXCLUDED.carbon_footprint_kg,
    created_at = now();
END;
$$ LANGUAGE plpgsql;

-- Create unique constraint for customer analytics per date
ALTER TABLE customer_analytics 
ADD CONSTRAINT unique_customer_analytics_per_date 
UNIQUE (customer_id, analysis_date);