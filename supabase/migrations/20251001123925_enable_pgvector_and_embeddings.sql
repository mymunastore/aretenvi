/*
  # Enable pgvector and Create Vector Embeddings Infrastructure

  ## Overview
  This migration enables advanced AI capabilities through vector embeddings for semantic search,
  similarity matching, and retrieval-augmented generation (RAG).

  ## New Features
  1. **pgvector Extension**
     - Enables vector similarity search in PostgreSQL
     - Supports storing and querying high-dimensional embeddings

  2. **New Tables**
     - `embeddings` - Stores vector embeddings for various content types
     - `knowledge_base` - FAQ and documentation with embeddings for RAG
     - `semantic_cache` - Caches AI responses to reduce API calls
     - `document_chunks` - Stores chunked documents with embeddings

  3. **Indexes**
     - IVFFlat indexes for fast approximate nearest neighbor search
     - Optimized for large-scale vector similarity queries

  4. **Security**
     - Enable RLS on all vector tables
     - Policies for authenticated access
     - Secure embedding generation and retrieval

  ## Use Cases
     - Semantic search across waste management documentation
     - Similar customer inquiry matching
     - Intelligent content recommendations
     - Context-aware AI responses using RAG
     - Duplicate detection and content clustering
*/

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table for storing vector representations
CREATE TABLE IF NOT EXISTS embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('customer_query', 'document', 'feedback', 'chat_message', 'knowledge_base', 'product', 'service')),
  content_id uuid,
  content_text text NOT NULL,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}'::jsonb,
  model_name text DEFAULT 'text-embedding-ada-002',
  token_count integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Knowledge base table with vector embeddings for RAG
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('faq', 'service_info', 'pricing', 'sustainability', 'procedures', 'policies', 'troubleshooting')),
  question text NOT NULL,
  answer text NOT NULL,
  keywords text[],
  embedding vector(1536),
  relevance_score decimal(3,2) DEFAULT 1.0,
  view_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  not_helpful_count integer DEFAULT 0,
  active boolean DEFAULT true,
  priority integer DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Semantic cache for storing AI responses
CREATE TABLE IF NOT EXISTS semantic_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text text NOT NULL,
  query_embedding vector(1536),
  response_text text NOT NULL,
  model_name text NOT NULL,
  temperature decimal(3,2),
  hit_count integer DEFAULT 0,
  last_hit_at timestamptz,
  cache_key text UNIQUE NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- Document chunks for large document processing
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('manual', 'policy', 'report', 'contract', 'guide', 'article')),
  chunk_index integer NOT NULL,
  chunk_text text NOT NULL,
  chunk_tokens integer,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Similar queries tracking for analytics
CREATE TABLE IF NOT EXISTS similar_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_query_id uuid NOT NULL,
  similar_query_id uuid NOT NULL,
  similarity_score decimal(5,4) NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_query_pair UNIQUE (original_query_id, similar_query_id)
);

-- Create indexes for vector similarity search
CREATE INDEX IF NOT EXISTS idx_embeddings_embedding ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_embeddings_content_type ON embeddings(content_type);
CREATE INDEX IF NOT EXISTS idx_embeddings_content_id ON embeddings(content_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(active);

CREATE INDEX IF NOT EXISTS idx_semantic_cache_embedding ON semantic_cache USING ivfflat (query_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_semantic_cache_cache_key ON semantic_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_semantic_cache_expires_at ON semantic_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);

-- Enable Row Level Security
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE similar_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for embeddings
CREATE POLICY "Authenticated users can view embeddings"
  ON embeddings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create embeddings"
  ON embeddings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for knowledge base (public read)
CREATE POLICY "Knowledge base is publicly readable"
  ON knowledge_base FOR SELECT
  TO authenticated, anon
  USING (active = true);

-- RLS Policies for semantic cache
CREATE POLICY "Authenticated users can read cache"
  ON semantic_cache FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "Authenticated users can write cache"
  ON semantic_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for document chunks
CREATE POLICY "Authenticated users can view document chunks"
  ON document_chunks FOR SELECT
  TO authenticated
  USING (true);

-- Function to find similar content using vector similarity
CREATE OR REPLACE FUNCTION find_similar_content(
  query_embedding vector(1536),
  content_type_filter text DEFAULT NULL,
  match_threshold decimal DEFAULT 0.8,
  match_count integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content_text text,
  content_type text,
  similarity decimal,
  metadata jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.content_text,
    e.content_type,
    (1 - (e.embedding <=> query_embedding))::decimal AS similarity,
    e.metadata
  FROM embeddings e
  WHERE 
    (content_type_filter IS NULL OR e.content_type = content_type_filter)
    AND (1 - (e.embedding <=> query_embedding)) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search knowledge base
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  match_threshold decimal DEFAULT 0.7,
  match_count integer DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  question text,
  answer text,
  category text,
  similarity decimal,
  relevance_score decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.question,
    kb.answer,
    kb.category,
    (1 - (kb.embedding <=> query_embedding))::decimal AS similarity,
    kb.relevance_score
  FROM knowledge_base kb
  WHERE 
    kb.active = true
    AND (1 - (kb.embedding <=> query_embedding)) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check semantic cache
CREATE OR REPLACE FUNCTION check_semantic_cache(
  query_embedding vector(1536),
  similarity_threshold decimal DEFAULT 0.95
)
RETURNS TABLE (
  response_text text,
  similarity decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.response_text,
    (1 - (sc.query_embedding <=> query_embedding))::decimal AS similarity
  FROM semantic_cache sc
  WHERE 
    sc.expires_at > now()
    AND (1 - (sc.query_embedding <=> query_embedding)) > similarity_threshold
  ORDER BY sc.query_embedding <=> query_embedding
  LIMIT 1;
  
  -- Update hit count if found
  UPDATE semantic_cache
  SET hit_count = hit_count + 1, last_hit_at = now()
  WHERE id = (
    SELECT sc.id
    FROM semantic_cache sc
    WHERE sc.expires_at > now()
    ORDER BY sc.query_embedding <=> query_embedding
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Insert sample knowledge base entries
INSERT INTO knowledge_base (category, question, answer, keywords, priority) VALUES
('faq', 'What are your collection days?', 'We offer waste collection every Saturday from 10:00 AM to 2:30 PM. Specific pickup times may vary based on your route and location. You can check your exact time in the customer portal.', ARRAY['schedule', 'pickup', 'collection', 'time'], 100),
('faq', 'What types of waste do you collect?', 'We collect general waste, organic waste, recyclables (plastic, paper, glass, metal), hazardous waste, construction debris, and electronic waste. Different service plans include different waste types.', ARRAY['waste types', 'recycling', 'services'], 95),
('faq', 'How much does the service cost?', 'We offer three plans: Subscription Plan (₦15,000/month), Premium Plan (₦25,000/month), and Enterprise Plan (₦50,000/month). Each includes different collection frequencies and waste types.', ARRAY['pricing', 'cost', 'plans', 'subscription'], 90),
('service_info', 'What is included in the Premium Plan?', 'The Premium Plan includes weekly collection, up to 8 bags per collection, recycling services, environmental reports, and priority support. It costs ₦25,000 per month.', ARRAY['premium', 'plan', 'features'], 85),
('sustainability', 'How do you help reduce carbon footprint?', 'We help reduce your carbon footprint by properly segregating recyclable materials, composting organic waste, and optimizing collection routes. Our Premium and Enterprise plans include detailed environmental impact reports.', ARRAY['carbon', 'environment', 'sustainability', 'green'], 80),
('procedures', 'How do I schedule a special pickup?', 'For special pickups outside your regular schedule, call our operations line at 09152870617 or use the customer portal to request an additional collection. Emergency services are available 24/7.', ARRAY['special', 'emergency', 'extra', 'pickup'], 75)
ON CONFLICT DO NOTHING;

-- Cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM semantic_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;