import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ImageAnalysisRequest {
  image_url?: string;
  image_base64?: string;
  analysis_type?: 'waste_classification' | 'general' | 'damage_assessment';
  detail?: 'low' | 'high' | 'auto';
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
      image_url, 
      image_base64, 
      analysis_type = 'general',
      detail = 'auto'
    }: ImageAnalysisRequest = await req.json();

    if (!image_url && !image_base64) {
      throw new Error('Either image_url or image_base64 is required');
    }

    const { data: featureEnabled } = await supabase.rpc('is_feature_enabled', {
      feature_name_param: 'waste_image_classification',
      user_id_param: user.id
    });

    if (!featureEnabled) {
      return new Response(
        JSON.stringify({ error: 'Image analysis feature not enabled for your account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();

    let systemPrompt = 'You are an expert in image analysis.';
    let userPrompt = 'Describe what you see in this image in detail.';

    if (analysis_type === 'waste_classification') {
      systemPrompt = 'You are an expert in waste management and recycling. Analyze images to identify waste types and provide disposal recommendations.';
      userPrompt = `Analyze this waste image and provide:
1. Waste type (general, organic, recyclable, hazardous, electronic, construction)
2. Specific materials identified (e.g., plastic bottles, cardboard, batteries)
3. Estimated quantity (low, medium, high)
4. Proper disposal method
5. Recycling potential (percentage)
6. Environmental impact
7. Special handling requirements

Return ONLY a valid JSON object with this structure:
{
  "waste_type": "string",
  "materials": ["material1", "material2"],
  "quantity": "low|medium|high",
  "disposal_method": "string",
  "recycling_potential": number,
  "environmental_impact": "string",
  "special_handling": "string",
  "confidence": number
}`;
    } else if (analysis_type === 'damage_assessment') {
      systemPrompt = 'You are an expert in damage assessment and waste management equipment inspection.';
      userPrompt = `Assess any damage or issues in this image:
1. Damage type and severity
2. Affected components
3. Safety concerns
4. Recommended actions
5. Urgency level

Return ONLY a valid JSON object.`;
    }

    const imageContent: any = {
      type: 'image_url',
      image_url: {
        url: image_url || `data:image/jpeg;base64,${image_base64}`,
        detail: detail
      }
    };

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
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              imageContent
            ]
          }
        ],
        max_tokens: 1000,
        ...(analysis_type === 'waste_classification' ? { response_format: { type: 'json_object' } } : {})
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    const analysisText = data.choices[0]?.message?.content || '{}';
    let analysis: any = {};
    
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      analysis = { description: analysisText };
    }

    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;

    await supabase.rpc('track_usage', {
      user_id_param: user.id,
      feature_name_param: 'image_analysis',
      request_count_param: 1,
      token_count_param: promptTokens + completionTokens,
      cost_param: ((promptTokens / 1000) * 0.00015) + ((completionTokens / 1000) * 0.0006),
      success_param: true,
      cache_hit_param: false
    });

    return new Response(
      JSON.stringify({
        success: true,
        analysis_type,
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
    console.error('Error in image analysis:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to analyze image'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});