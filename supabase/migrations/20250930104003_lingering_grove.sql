/*
  # Waste Management System Schema

  1. New Tables
    - `customers` - Customer information and profiles
    - `service_plans` - Available subscription plans
    - `customer_subscriptions` - Customer plan subscriptions
    - `waste_collections` - Collection schedules and records
    - `waste_items` - Individual waste items collected
    - `collection_routes` - Optimized collection routes
    - `vehicles` - Fleet management
    - `drivers` - Driver information and assignments
    - `invoices` - Billing and payment records
    - `payments` - Payment transactions
    - `feedback` - Customer feedback and ratings
    - `environmental_reports` - Carbon footprint and sustainability metrics
    - `ai_recommendations` - AI-generated optimization suggestions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and role-based access
    - Secure customer data access

  3. Features
    - Customer management and subscriptions
    - Collection scheduling and route optimization
    - Fleet and driver management
    - Billing and payment processing
    - Environmental impact tracking
    - AI-powered recommendations
*/

-- Create enum types
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'suspended', 'cancelled');
CREATE TYPE collection_status AS ENUM ('scheduled', 'in_progress', 'completed', 'missed', 'cancelled');
CREATE TYPE waste_type AS ENUM ('general', 'organic', 'recyclable', 'hazardous', 'construction', 'electronic');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'retired');
CREATE TYPE driver_status AS ENUM ('active', 'inactive', 'on_leave');

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_code text UNIQUE NOT NULL DEFAULT 'CUST-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0') || '-' || LPAD(EXTRACT(HOUR FROM NOW())::text, 2, '0') || LPAD(EXTRACT(MINUTE FROM NOW())::text, 2, '0'),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text DEFAULT 'Uyo',
  state text DEFAULT 'Akwa Ibom',
  postal_code text,
  customer_type text DEFAULT 'residential' CHECK (customer_type IN ('residential', 'commercial', 'industrial')),
  registration_date timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service plans table
CREATE TABLE IF NOT EXISTS service_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  plan_type text NOT NULL CHECK (plan_type IN ('subscription', 'premium', 'enterprise')),
  price_monthly decimal(10,2) NOT NULL,
  collection_frequency text NOT NULL CHECK (collection_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  waste_types text[] DEFAULT ARRAY['general'],
  max_bags_per_collection integer DEFAULT 5,
  includes_recycling boolean DEFAULT false,
  includes_composting boolean DEFAULT false,
  includes_hazardous boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer subscriptions table
CREATE TABLE IF NOT EXISTS customer_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  service_plan_id uuid REFERENCES service_plans(id) ON DELETE RESTRICT,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  status subscription_status DEFAULT 'active',
  monthly_rate decimal(10,2) NOT NULL,
  collection_day text DEFAULT 'saturday' CHECK (collection_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  collection_time_slot text DEFAULT '10:00-14:30',
  special_instructions text,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Collection routes table
CREATE TABLE IF NOT EXISTS collection_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name text NOT NULL,
  route_code text UNIQUE NOT NULL,
  zone text NOT NULL,
  collection_day text NOT NULL CHECK (collection_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time time DEFAULT '10:00',
  estimated_duration interval DEFAULT '4 hours 30 minutes',
  driver_id uuid,
  vehicle_id uuid,
  customer_count integer DEFAULT 0,
  route_distance_km decimal(8,2),
  optimized_order jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number text UNIQUE NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer,
  license_plate text UNIQUE NOT NULL,
  capacity_kg decimal(8,2) NOT NULL,
  fuel_type text DEFAULT 'diesel' CHECK (fuel_type IN ('diesel', 'petrol', 'electric', 'hybrid')),
  status vehicle_status DEFAULT 'active',
  last_maintenance_date date,
  next_maintenance_date date,
  insurance_expiry date,
  registration_expiry date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text UNIQUE NOT NULL,
  license_number text UNIQUE NOT NULL,
  license_expiry date NOT NULL,
  hire_date date DEFAULT CURRENT_DATE,
  status driver_status DEFAULT 'active',
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Waste collections table
CREATE TABLE IF NOT EXISTS waste_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES customer_subscriptions(id) ON DELETE SET NULL,
  route_id uuid REFERENCES collection_routes(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  scheduled_date date NOT NULL,
  scheduled_time_slot text DEFAULT '10:00-14:30',
  actual_collection_time timestamptz,
  status collection_status DEFAULT 'scheduled',
  bags_collected integer DEFAULT 0,
  weight_kg decimal(8,2),
  waste_types text[] DEFAULT ARRAY['general'],
  notes text,
  customer_rating integer CHECK (customer_rating >= 1 AND customer_rating <= 5),
  driver_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Waste items table (for detailed tracking)
CREATE TABLE IF NOT EXISTS waste_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES waste_collections(id) ON DELETE CASCADE,
  waste_type waste_type NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  weight_kg decimal(8,2),
  recyclable boolean DEFAULT false,
  hazardous boolean DEFAULT false,
  description text,
  disposal_method text,
  carbon_footprint_kg decimal(10,4),
  created_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES customer_subscriptions(id) ON DELETE SET NULL,
  invoice_number text UNIQUE NOT NULL DEFAULT 'INV-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0') || '-' || LPAD(EXTRACT(HOUR FROM NOW())::text, 2, '0') || LPAD(EXTRACT(MINUTE FROM NOW())::text, 2, '0'),
  billing_period_start date NOT NULL,
  billing_period_end date NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_terms text DEFAULT '30 days',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'mobile_money')),
  payment_reference text,
  transaction_id text,
  status payment_status DEFAULT 'pending',
  payment_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES waste_collections(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  service_aspect text CHECK (service_aspect IN ('timeliness', 'professionalism', 'cleanliness', 'communication', 'overall')),
  comments text,
  feedback_date timestamptz DEFAULT now(),
  response text,
  responded_at timestamptz,
  responded_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Environmental reports table
CREATE TABLE IF NOT EXISTS environmental_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  report_period_start date NOT NULL,
  report_period_end date NOT NULL,
  total_waste_kg decimal(10,2) NOT NULL,
  recycled_waste_kg decimal(10,2) DEFAULT 0,
  composted_waste_kg decimal(10,2) DEFAULT 0,
  landfill_waste_kg decimal(10,2) NOT NULL,
  carbon_footprint_kg decimal(10,4) NOT NULL,
  carbon_saved_kg decimal(10,4) DEFAULT 0,
  recycling_rate decimal(5,2) DEFAULT 0,
  waste_reduction_percentage decimal(5,2) DEFAULT 0,
  recommendations text[],
  created_at timestamptz DEFAULT now()
);

-- AI recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('route_optimization', 'waste_reduction', 'recycling_improvement', 'cost_savings', 'environmental_impact')),
  title text NOT NULL,
  description text NOT NULL,
  potential_savings decimal(10,2),
  environmental_benefit text,
  implementation_difficulty text DEFAULT 'medium' CHECK (implementation_difficulty IN ('easy', 'medium', 'hard')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'implemented')),
  ai_confidence decimal(3,2) DEFAULT 0.85,
  generated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints for routes
ALTER TABLE collection_routes 
ADD CONSTRAINT fk_route_driver 
FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;

ALTER TABLE collection_routes 
ADD CONSTRAINT fk_route_vehicle 
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_customer_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_customer_id ON customer_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_waste_collections_customer_id ON waste_collections(customer_id);
CREATE INDEX IF NOT EXISTS idx_waste_collections_scheduled_date ON waste_collections(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_waste_collections_status ON waste_collections(status);
CREATE INDEX IF NOT EXISTS idx_collection_routes_collection_day ON collection_routes(collection_day);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_feedback_customer_id ON feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_environmental_reports_customer_id ON environmental_reports(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_customer_id ON ai_recommendations(customer_id);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can create customer profile"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for service plans (public read)
CREATE POLICY "Service plans are publicly readable"
  ON service_plans FOR SELECT
  TO authenticated, anon
  USING (active = true);

-- RLS Policies for customer subscriptions
CREATE POLICY "Customers can view own subscriptions"
  ON customer_subscriptions FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create own subscriptions"
  ON customer_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- RLS Policies for waste collections
CREATE POLICY "Customers can view own collections"
  ON waste_collections FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- RLS Policies for invoices
CREATE POLICY "Customers can view own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- RLS Policies for payments
CREATE POLICY "Customers can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- RLS Policies for feedback
CREATE POLICY "Customers can create feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- RLS Policies for environmental reports
CREATE POLICY "Customers can view own environmental reports"
  ON environmental_reports FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- RLS Policies for AI recommendations
CREATE POLICY "Customers can view own AI recommendations"
  ON ai_recommendations FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- Insert default service plans
INSERT INTO service_plans (name, description, plan_type, price_monthly, collection_frequency, waste_types, max_bags_per_collection, includes_recycling) VALUES
('Subscription Plan', 'Perfect for regular residential and small commercial needs', 'subscription', 15000.00, 'weekly', ARRAY['general'], 5, false),
('Premium Plan', 'Enhanced service for environmentally conscious clients', 'premium', 25000.00, 'weekly', ARRAY['general', 'recyclable'], 8, true),
('Enterprise Plan', 'Comprehensive solution for large-scale operations', 'enterprise', 50000.00, 'daily', ARRAY['general', 'recyclable', 'organic', 'construction'], 20, true)
ON CONFLICT DO NOTHING;