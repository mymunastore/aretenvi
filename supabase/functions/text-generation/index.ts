import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TextGenerationRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  system_prompt?: string;
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

    const { prompt, model = 'gpt-4o-mini', temperature = 0.7, max_tokens = 1000, stream = false, system_prompt }: TextGenerationRequest = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const { data: modelData } = await supabase
      .from('ai_models')
      .select('*, ai_providers(*)')
      .eq('model_identifier', model)
      .eq('active', true)
      .single();

    if (!modelData) {
      throw new Error('Model not found or inactive');
    }

    const { data: rateLimit } = await supabase.rpc('check_rate_limit', {
      user_id_param: user.id,
      feature_name_param: 'text_generation',
      user_tier_param: 'free'
    });

    if (rateLimit === false) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();

    const messages: any[] = [];
    if (system_prompt) {
      messages.push({ role: 'system', content: system_prompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelData.model_identifier,
        messages,
        temperature,
        max_tokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    const generatedText = data.choices[0]?.message?.content || '';
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;

    await supabase.rpc('log_ai_request', {
      user_id_param: user.id,
      model_id_param: modelData.id,
      request_type_param: 'completion',
      prompt_tokens_param: promptTokens,
      response_tokens_param: completionTokens,
      latency_ms_param: latencyMs,
      status_param: 'success'
    });

    await supabase.rpc('track_usage', {
      user_id_param: user.id,
      feature_name_param: 'text_generation',
      request_count_param: 1,
      token_count_param: promptTokens + completionTokens,
      cost_param: ((promptTokens / 1000) * modelData.cost_per_1k_input_tokens) + ((completionTokens / 1000) * modelData.cost_per_1k_output_tokens),
      success_param: true,
      cache_hit_param: false
    });

    return new Response(
      JSON.stringify({
        success: true,
        text: generatedText,
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens
        },
        model: modelData.model_identifier,
        latency_ms: latencyMs
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in text generation:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate text'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});