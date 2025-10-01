import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SemanticSearchRequest {
  query: string;
  content_type?: string;
  match_threshold?: number;
  match_count?: number;
  search_knowledge_base?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { 
      query, 
      content_type = null, 
      match_threshold = 0.7, 
      match_count = 5,
      search_knowledge_base = true 
    }: SemanticSearchRequest = await req.json();

    if (!query) {
      throw new Error('Query is required');
    }

    const { data: featureEnabled } = await supabase.rpc('is_feature_enabled', {
      feature_name_param: 'semantic_search',
      user_id_param: user.id
    });

    if (!featureEnabled) {
      return new Response(
        JSON.stringify({ error: 'Semantic search feature not enabled for your account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    const results: any = {
      query,
      content_matches: [],
      knowledge_base_matches: [],
      latency_ms: 0
    };

    const { data: contentMatches, error: contentError } = await supabase.rpc('find_similar_content', {
      query_embedding: queryEmbedding,
      content_type_filter: content_type,
      match_threshold: match_threshold,
      match_count: match_count
    });

    if (contentError) {
      console.error('Error finding similar content:', contentError);
    } else {
      results.content_matches = contentMatches || [];
    }

    if (search_knowledge_base) {
      const { data: kbMatches, error: kbError } = await supabase.rpc('search_knowledge_base', {
        query_embedding: queryEmbedding,
        match_threshold: match_threshold,
        match_count: 3
      });

      if (kbError) {
        console.error('Error searching knowledge base:', kbError);
      } else {
        results.knowledge_base_matches = kbMatches || [];
      }
    }

    const latencyMs = Date.now() - startTime;
    results.latency_ms = latencyMs;

    await supabase.rpc('track_usage', {
      user_id_param: user.id,
      feature_name_param: 'semantic_search',
      request_count_param: 1,
      token_count_param: embeddingData.usage?.total_tokens || 0,
      cost_param: ((embeddingData.usage?.total_tokens || 0) / 1000) * 0.00002,
      success_param: true,
      cache_hit_param: false
    });

    return new Response(
      JSON.stringify({
        success: true,
        ...results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in semantic search:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to perform semantic search'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});