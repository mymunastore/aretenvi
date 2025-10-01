import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RecommendationRequest {
  customerId: string;
}

// AI recommendation generation logic
const generateRecommendations = (analytics: any, collections: any[]) => {
  const recommendations = [];
  
  // Waste reduction recommendations
  if (analytics.total_waste_kg > 50) {
    recommendations.push({
      recommendation_type: 'waste_reduction',
      title: 'Optimize Waste Generation',
      description: `Your monthly waste generation of ${analytics.total_waste_kg}kg is above average. Consider meal planning, buying in bulk, and using reusable containers to reduce waste by 15-20%.`,
      potential_savings: analytics.total_waste_kg * 0.15 * (analytics.cost_per_kg || 100),
      environmental_benefit: `Reduce carbon footprint by ${(analytics.carbon_footprint_kg * 0.15).toFixed(2)} kg CO2 annually`,
      implementation_difficulty: 'easy',
      priority: 'medium'
    });
  }

  // Recycling improvement recommendations
  if (analytics.recycling_rate < 30) {
    recommendations.push({
      recommendation_type: 'recycling_improvement',
      title: 'Increase Recycling Rate',
      description: `Your current recycling rate is ${analytics.recycling_rate.toFixed(1)}%. Proper waste segregation could increase this to 40-50%, significantly reducing your environmental impact.`,
      environmental_benefit: `Potential to recycle additional ${(analytics.total_waste_kg * 0.25).toFixed(1)} kg monthly`,
      implementation_difficulty: 'easy',
      priority: 'high'
    });
  }

  // Cost optimization recommendations
  if (analytics.cost_per_kg > 150) {
    recommendations.push({
      recommendation_type: 'cost_optimization',
      title: 'Optimize Service Plan',
      description: 'Based on your waste patterns, switching to a different service plan could reduce your monthly costs while maintaining service quality.',
      potential_savings: analytics.total_waste_kg * (analytics.cost_per_kg - 120),
      implementation_difficulty: 'easy',
      priority: 'medium'
    });
  }

  // Collection efficiency recommendations
  const missedCollections = collections.filter(c => c.status === 'missed').length;
  if (missedCollections > 0) {
    recommendations.push({
      recommendation_type: 'service_improvement',
      title: 'Improve Collection Reliability',
      description: `You've had ${missedCollections} missed collections recently. Consider setting up collection reminders or adjusting your pickup schedule.`,
      implementation_difficulty: 'easy',
      priority: 'high'
    });
  }

  // Environmental impact recommendations
  if (analytics.carbon_footprint_kg > 100) {
    recommendations.push({
      recommendation_type: 'environmental_impact',
      title: 'Reduce Carbon Footprint',
      description: 'Your carbon footprint could be reduced through composting organic waste and increasing recycling. We can help set up a composting program.',
      environmental_benefit: `Potential to reduce carbon emissions by ${(analytics.carbon_footprint_kg * 0.25).toFixed(2)} kg CO2 annually`,
      implementation_difficulty: 'medium',
      priority: 'medium'
    });
  }

  return recommendations;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { customerId }: RecommendationRequest = await req.json();

    // Get customer analytics
    const { data: analytics, error: analyticsError } = await supabaseClient
      .from('customer_analytics')
      .select('*')
      .eq('customer_id', customerId)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single();

    if (analyticsError && analyticsError.code !== 'PGRST116') {
      throw analyticsError;
    }

    // Get recent collections
    const { data: collections, error: collectionsError } = await supabaseClient
      .from('waste_collections')
      .select('*')
      .eq('customer_id', customerId)
      .gte('scheduled_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('scheduled_date', { ascending: false });

    if (collectionsError) {
      throw collectionsError;
    }

    // Generate recommendations if we have analytics data
    let recommendations = [];
    if (analytics) {
      recommendations = generateRecommendations(analytics, collections || []);
    } else {
      // Default recommendations for new customers
      recommendations = [
        {
          recommendation_type: 'waste_reduction',
          title: 'Start Your Sustainability Journey',
          description: 'Welcome to ARET! Begin tracking your waste patterns to identify opportunities for reduction and recycling.',
          implementation_difficulty: 'easy',
          priority: 'medium'
        }
      ];
    }

    // Store recommendations in database
    const recommendationInserts = recommendations.map(rec => ({
      customer_id: customerId,
      ...rec,
      ai_confidence: 0.85,
      generated_at: new Date().toISOString()
    }));

    if (recommendationInserts.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('ai_recommendations')
        .insert(recommendationInserts);

      if (insertError) {
        console.error('Error inserting recommendations:', insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        analytics: analytics || null,
        collectionsCount: collections?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate recommendations'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});