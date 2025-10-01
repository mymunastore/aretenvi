# Supabase AI Backend Integration Guide

## Overview

This document provides comprehensive documentation for the AI-powered Supabase backend integration, including setup instructions, API references, and usage examples.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Edge Functions](#edge-functions)
4. [Setup Instructions](#setup-instructions)
5. [API Reference](#api-reference)
6. [Usage Examples](#usage-examples)
7. [Rate Limiting & Quotas](#rate-limiting--quotas)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Core Components

1. **PostgreSQL with pgvector** - Vector database for semantic search
2. **Edge Functions** - Serverless AI processing endpoints
3. **Supabase Storage** - File and media management
4. **RLS Policies** - Row-level security for data protection
5. **Real-time Subscriptions** - Live updates for AI processing

### Technology Stack

- **Database**: PostgreSQL 15+ with pgvector extension
- **Runtime**: Deno for edge functions
- **AI Providers**: OpenAI (primary), Anthropic (optional)
- **Vector Embeddings**: 1536-dimensional vectors
- **Authentication**: Supabase Auth with JWT

---

## Database Schema

### AI Configuration Tables

#### `ai_providers`
Manages AI service providers and their configurations.

```sql
CREATE TABLE ai_providers (
  id uuid PRIMARY KEY,
  provider_name text UNIQUE NOT NULL,
  provider_type text NOT NULL, -- 'llm', 'embedding', 'image_analysis', etc.
  base_url text NOT NULL,
  priority integer DEFAULT 50,
  active boolean DEFAULT true
);
```

#### `ai_models`
Configuration for individual AI models with pricing and capabilities.

```sql
CREATE TABLE ai_models (
  id uuid PRIMARY KEY,
  provider_id uuid REFERENCES ai_providers(id),
  model_name text NOT NULL,
  model_identifier text NOT NULL,
  cost_per_1k_input_tokens decimal(10,6),
  cost_per_1k_output_tokens decimal(10,6),
  supports_streaming boolean DEFAULT false,
  supports_vision boolean DEFAULT false
);
```

### Vector Database Tables

#### `embeddings`
Stores vector embeddings for semantic search.

```sql
CREATE TABLE embeddings (
  id uuid PRIMARY KEY,
  content_type text NOT NULL,
  content_text text NOT NULL,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}'
);
```

#### `knowledge_base`
FAQ and documentation with vector embeddings for RAG.

```sql
CREATE TABLE knowledge_base (
  id uuid PRIMARY KEY,
  category text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  embedding vector(1536),
  relevance_score decimal(3,2) DEFAULT 1.0
);
```

### Usage Tracking Tables

#### `usage_tracking`
Real-time usage metrics per user and feature.

```sql
CREATE TABLE usage_tracking (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  feature_name text NOT NULL,
  tracking_period text NOT NULL,
  request_count integer DEFAULT 0,
  token_count integer DEFAULT 0,
  cost_usd decimal(10,4) DEFAULT 0
);
```

#### `rate_limits`
Configurable rate limits per user tier.

```sql
CREATE TABLE rate_limits (
  id uuid PRIMARY KEY,
  feature_name text NOT NULL,
  user_tier text DEFAULT 'free',
  rate_limit_type text NOT NULL,
  limit_value integer NOT NULL
);
```

### Content Moderation Tables

#### `content_moderation_results`
AI-powered content moderation results.

```sql
CREATE TABLE content_moderation_results (
  id uuid PRIMARY KEY,
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  flagged boolean DEFAULT false,
  violation_categories jsonb DEFAULT '{}',
  severity_score decimal(3,2) DEFAULT 0,
  action_taken text DEFAULT 'none'
);
```

---

## Edge Functions

### 1. Text Generation (`text-generation`)

**Purpose**: Generate text using LLM models with streaming support.

**Endpoint**: `https://your-project.supabase.co/functions/v1/text-generation`

**Request**:
```typescript
interface TextGenerationRequest {
  prompt: string;
  model?: string; // default: 'gpt-4o-mini'
  temperature?: number; // default: 0.7
  max_tokens?: number; // default: 1000
  system_prompt?: string;
}
```

**Response**:
```typescript
interface TextGenerationResponse {
  success: boolean;
  text: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  latency_ms: number;
}
```

**Example**:
```typescript
const { data, error } = await supabase.functions.invoke('text-generation', {
  body: {
    prompt: 'Explain waste segregation best practices',
    temperature: 0.7,
    max_tokens: 500
  }
});
```

### 2. Semantic Search (`semantic-search`)

**Purpose**: Search content using vector similarity.

**Endpoint**: `https://your-project.supabase.co/functions/v1/semantic-search`

**Request**:
```typescript
interface SemanticSearchRequest {
  query: string;
  content_type?: string;
  match_threshold?: number; // default: 0.7
  match_count?: number; // default: 5
  search_knowledge_base?: boolean; // default: true
}
```

**Response**:
```typescript
interface SemanticSearchResponse {
  success: boolean;
  query: string;
  content_matches: Array<{
    id: string;
    content_text: string;
    similarity: number;
    metadata: object;
  }>;
  knowledge_base_matches: Array<{
    id: string;
    question: string;
    answer: string;
    similarity: number;
  }>;
  latency_ms: number;
}
```

**Example**:
```typescript
const { data, error } = await supabase.functions.invoke('semantic-search', {
  body: {
    query: 'How do I schedule a pickup?',
    match_count: 3
  }
});
```

### 3. Image Analysis (`image-analysis`)

**Purpose**: Analyze images for waste classification and damage assessment.

**Endpoint**: `https://your-project.supabase.co/functions/v1/image-analysis`

**Request**:
```typescript
interface ImageAnalysisRequest {
  image_url?: string;
  image_base64?: string;
  analysis_type?: 'waste_classification' | 'general' | 'damage_assessment';
  detail?: 'low' | 'high' | 'auto';
}
```

**Response** (for waste_classification):
```typescript
interface WasteClassificationResponse {
  success: boolean;
  analysis_type: string;
  waste_type: string;
  materials: string[];
  quantity: 'low' | 'medium' | 'high';
  disposal_method: string;
  recycling_potential: number;
  environmental_impact: string;
  special_handling: string;
  confidence: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latency_ms: number;
}
```

**Example**:
```typescript
const { data, error } = await supabase.functions.invoke('image-analysis', {
  body: {
    image_url: 'https://example.com/waste-image.jpg',
    analysis_type: 'waste_classification',
    detail: 'high'
  }
});
```

### 4. Sentiment Analysis (`sentiment-analysis`)

**Purpose**: Analyze sentiment and emotions in text.

**Endpoint**: `https://your-project.supabase.co/functions/v1/sentiment-analysis`

**Request**:
```typescript
interface SentimentRequest {
  text: string;
  context?: string;
}
```

**Response**:
```typescript
interface SentimentResponse {
  success: boolean;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  emotions: string[];
  confidence: number; // 0 to 1
  explanation: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latency_ms: number;
}
```

**Example**:
```typescript
const { data, error } = await supabase.functions.invoke('sentiment-analysis', {
  body: {
    text: 'The service was excellent and the team was very professional!',
    context: 'customer review'
  }
});
```

### 5. Content Moderation (`content-moderation`)

**Purpose**: Moderate user-generated content for policy violations.

**Endpoint**: `https://your-project.supabase.co/functions/v1/content-moderation`

**Request**:
```typescript
interface ModerationRequest {
  content: string;
  content_type: string;
  content_id: string;
}
```

**Response**:
```typescript
interface ModerationResponse {
  success: boolean;
  flagged: boolean;
  categories: {
    hate: boolean;
    harassment: boolean;
    self_harm: boolean;
    sexual: boolean;
    violence: boolean;
  };
  category_scores: {
    hate: number;
    harassment: number;
    self_harm: number;
    sexual: number;
    violence: number;
  };
  moderation_id: string;
  latency_ms: number;
}
```

**Example**:
```typescript
const { data, error } = await supabase.functions.invoke('content-moderation', {
  body: {
    content: 'User message here',
    content_type: 'message',
    content_id: 'msg-123'
  }
});
```

---

## Setup Instructions

### Prerequisites

1. Supabase project (already configured)
2. OpenAI API key
3. Node.js 18+ and npm

### Step 1: Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Initialize Database

The database migrations have already been applied. Verify with:

```bash
# Check if pgvector is enabled
# This should return tables like embeddings, knowledge_base, etc.
```

### Step 4: Seed Knowledge Base (Optional)

Default knowledge base entries are automatically inserted. To add more:

```typescript
await supabase.from('knowledge_base').insert([
  {
    category: 'faq',
    question: 'Your question',
    answer: 'Your answer',
    keywords: ['keyword1', 'keyword2']
  }
]);
```

### Step 5: Generate Embeddings

For existing knowledge base entries without embeddings:

```typescript
import { supabase } from './supabase';

async function generateEmbeddings() {
  const { data: entries } = await supabase
    .from('knowledge_base')
    .select('*')
    .is('embedding', null);

  for (const entry of entries) {
    const { data } = await supabase.functions.invoke('generate-embedding', {
      body: { text: entry.question + ' ' + entry.answer }
    });

    await supabase
      .from('knowledge_base')
      .update({ embedding: data.embedding })
      .eq('id', entry.id);
  }
}
```

### Step 6: Configure Storage Buckets

Create storage buckets via Supabase Dashboard:

1. **waste-images** - Public: false, Max: 10MB, Types: image/*
2. **documents** - Public: false, Max: 20MB, Types: application/pdf
3. **profile-avatars** - Public: true, Max: 2MB, Types: image/*
4. **environmental-reports** - Public: false, Max: 50MB, Types: application/pdf
5. **temp-uploads** - Public: false, Max: 20MB, Auto-cleanup: 24h

### Step 7: Test Edge Functions

```bash
# Test text generation
curl -X POST https://your-project.supabase.co/functions/v1/text-generation \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello world"}'

# Test semantic search
curl -X POST https://your-project.supabase.co/functions/v1/semantic-search \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "collection schedule"}'
```

---

## Rate Limiting & Quotas

### Default Rate Limits

**Free Tier**:
- 5 requests/minute per feature
- 50 requests/day total
- 100,000 tokens/month

**Premium Tier**:
- 60 requests/minute per feature
- 2,000 requests/day total
- 5,000,000 tokens/month

### Checking Rate Limits

```typescript
const { data: canProceed } = await supabase.rpc('check_rate_limit', {
  user_id_param: user.id,
  feature_name_param: 'text_generation',
  user_tier_param: 'free'
});

if (!canProceed) {
  console.log('Rate limit exceeded');
}
```

### Monitoring Usage

```typescript
const { data: usage } = await supabase
  .from('usage_tracking')
  .select('*')
  .eq('user_id', user.id)
  .eq('tracking_period', 'day')
  .single();

console.log('Requests today:', usage.request_count);
console.log('Tokens used:', usage.token_count);
console.log('Cost:', usage.cost_usd);
```

---

## Security Best Practices

### 1. API Key Management

- Store API keys in Supabase Vault (not in .env for production)
- Rotate keys regularly
- Use different keys for development and production

### 2. Content Validation

Always validate and sanitize user inputs:

```typescript
// Validate before sending to AI
if (content.length > 10000) {
  throw new Error('Content too long');
}

// Moderate content before storage
const { data: moderation } = await supabase.functions.invoke('content-moderation', {
  body: { content, content_type: 'message', content_id: messageId }
});

if (moderation.flagged) {
  // Handle flagged content
}
```

### 3. RLS Policies

Always use RLS policies for data access:

```sql
-- Users can only access their own data
CREATE POLICY "Users view own data"
  ON embeddings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

### 4. Rate Limiting

Implement client-side rate limit checking:

```typescript
async function callAI(prompt: string) {
  const canProceed = await checkRateLimit();
  if (!canProceed) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  return await supabase.functions.invoke('text-generation', {
    body: { prompt }
  });
}
```

---

## Troubleshooting

### Common Issues

#### 1. "pgvector extension not found"

**Solution**: Ensure pgvector is enabled:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### 2. "Rate limit exceeded"

**Solution**: Check your usage and upgrade tier if needed:
```typescript
const { data: stats } = await supabase.rpc('get_user_file_stats', {
  user_id_param: user.id
});
```

#### 3. "OpenAI API key not configured"

**Solution**: Set the OPENAI_API_KEY environment variable in Supabase Edge Function secrets.

#### 4. "Embedding dimension mismatch"

**Solution**: Ensure you're using the correct embedding model:
- text-embedding-ada-002: 1536 dimensions
- text-embedding-3-small: 1536 dimensions
- text-embedding-3-large: 3072 dimensions

#### 5. "Slow semantic search"

**Solution**: Ensure indexes are created:
```sql
CREATE INDEX idx_embeddings_embedding
ON embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Debug Mode

Enable debug logging:

```env
DEBUG_AI_PROMPTS=true
DEBUG_SQL_QUERIES=true
```

Then check logs in Supabase Dashboard → Edge Functions → Logs.

---

## Performance Optimization

### 1. Caching

Use semantic cache to reduce API calls:

```typescript
const { data: cached } = await supabase.rpc('check_semantic_cache', {
  query_embedding: embedding,
  similarity_threshold: 0.95
});

if (cached) {
  return cached.response_text;
}
```

### 2. Batch Processing

Process multiple items in parallel:

```typescript
const promises = items.map(item =>
  supabase.functions.invoke('sentiment-analysis', {
    body: { text: item.text }
  })
);

const results = await Promise.all(promises);
```

### 3. Model Selection

Choose appropriate models for your use case:

- **Fast & Cheap**: gpt-4o-mini ($0.15/$0.60 per 1M tokens)
- **Best Quality**: gpt-4o ($2.50/$10 per 1M tokens)
- **Embeddings**: text-embedding-3-small ($0.02 per 1M tokens)

---

## Support & Resources

- **Supabase Documentation**: https://supabase.com/docs
- **OpenAI API Reference**: https://platform.openai.com/docs
- **pgvector GitHub**: https://github.com/pgvector/pgvector
- **Project Issues**: Contact your development team

---

## Changelog

### Version 1.0.0 (2025-10-01)
- Initial release
- pgvector integration
- 5 AI edge functions deployed
- Rate limiting system
- Content moderation
- File processing pipeline
- Comprehensive documentation

---

## License

Proprietary - ARET Environmental Services
