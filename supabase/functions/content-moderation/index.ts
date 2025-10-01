import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ModerationRequest {
  content: string;
  content_type: string;
  content_id: string;
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

    const { content, content_type, content_id }: ModerationRequest = await req.json();

    if (!content || !content_type || !content_id) {
      throw new Error('Content, content_type, and content_id are required');
    }

    const { data: featureEnabled } = await supabase.rpc('is_feature_enabled', {
      feature_name_param: 'content_moderation',
      user_id_param: user.id
    });

    if (!featureEnabled) {
      return new Response(
        JSON.stringify({ 
          success: true,
          flagged: false,
          message: 'Content moderation not enabled, content approved by default'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();

    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-moderation-latest',
        input: content,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const result = data.results[0];
    const latencyMs = Date.now() - startTime;

    const moderationScores: any = {};
    Object.keys(result.category_scores).forEach(category => {
      moderationScores[category] = result.category_scores[category];
    });

    const { data: moderationResult, error: moderationError } = await supabase.rpc('moderate_content', {
      content_id_param: content_id,
      content_type_param: content_type,
      content_text_param: content.substring(0, 1000),
      user_id_param: user.id,
      moderation_scores: moderationScores
    });

    if (moderationError) {
      console.error('Error saving moderation result:', moderationError);
    }

    await supabase.rpc('track_usage', {
      user_id_param: user.id,
      feature_name_param: 'content_moderation',
      request_count_param: 1,
      token_count_param: 0,
      cost_param: 0,
      success_param: true,
      cache_hit_param: false
    });

    return new Response(
      JSON.stringify({
        success: true,
        flagged: result.flagged,
        categories: result.categories,
        category_scores: result.category_scores,
        moderation_id: moderationResult,
        latency_ms: latencyMs
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in content moderation:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to moderate content'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});