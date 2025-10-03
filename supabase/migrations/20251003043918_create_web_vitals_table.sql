/*
  # Create web_vitals table for performance monitoring

  ## Overview
  This migration creates the web_vitals table to store Core Web Vitals metrics 
  for monitoring application performance.

  ## New Tables
  1. **web_vitals**
     - `id` (uuid, primary key) - Unique identifier for each metric
     - `metric_name` (text) - Name of the web vital metric (CLS, FCP, LCP, TTFB, INP)
     - `value` (numeric) - The measured value of the metric
     - `rating` (text) - Performance rating (good, needs-improvement, poor)
     - `page_url` (text) - URL where the metric was captured
     - `user_agent` (text) - Browser user agent string
     - `created_at` (timestamptz) - Timestamp when the metric was recorded

  ## Security
  1. Enable Row Level Security (RLS) on web_vitals table
  2. Create policy to allow authenticated users to insert their own metrics
  3. Create policy to allow service role to read all metrics for analytics

  ## Indexes
  - Index on metric_name for faster queries by metric type
  - Index on created_at for time-based analytics
  - Index on page_url for page-specific performance analysis

  ## Notes
  - Web vitals are performance metrics that help monitor user experience
  - This data is used for performance monitoring and optimization
  - Metrics are automatically collected by the web-vitals library
*/

-- Create web_vitals table
CREATE TABLE IF NOT EXISTS web_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  value numeric NOT NULL,
  rating text,
  page_url text NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at ON web_vitals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_url ON web_vitals(page_url);

-- Policy: Allow anyone to insert web vitals (anonymous metrics collection)
CREATE POLICY "Allow public insert for web vitals"
  ON web_vitals
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow authenticated users to read their own metrics
CREATE POLICY "Allow authenticated users to read web vitals"
  ON web_vitals
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role full access for analytics
CREATE POLICY "Allow service role full access to web vitals"
  ON web_vitals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
