import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SentimentRequest {
  text: string;
  context?: string;
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

    const { text, context = 'customer feedback' }: SentimentRequest = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const { data: featureEnabled } = await supabase.rpc('is_feature_enabled', {
      feature_name_param: 'sentiment_analysis',
      user_id_param: user.id
    });

    if (!featureEnabled) {
      return new Response(
        JSON.stringify({ error: 'Sentiment analysis feature not enabled for your account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();

    const systemPrompt = `You are a sentiment analysis expert. Analyze the following text and provide:
1. Overall sentiment (positive, negative, or neutral)
2. Sentiment score from -1 (most negative) to 1 (most positive)
3. Key emotions detected (e.g., joy, frustration, satisfaction, anger)
4. Confidence level (0-1)
5. Brief explanation

Return ONLY a valid JSON object with this structure:
{
  "sentiment": "positive|negative|neutral",
  "score": number,
  "emotions": ["emotion1", "emotion2"],
  "confidence": number,
  "explanation": "string"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Context: ${context}\n\nText to analyze: ${text}` }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    const analysisText = data.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(analysisText);

    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;

    await supabase.rpc('track_usage', {
      user_id_param: user.id,
      feature_name_param: 'sentiment_analysis',
      request_count_param: 1,
      token_count_param: promptTokens + completionTokens,
      cost_param: ((promptTokens / 1000) * 0.00015) + ((completionTokens / 1000) * 0.0006),
      success_param: true,
      cache_hit_param: false
    });

    return new Response(
      JSON.stringify({
        success: true,
        ...analysis,
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens
        },
        latency_ms: latencyMs
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to analyze sentiment'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});