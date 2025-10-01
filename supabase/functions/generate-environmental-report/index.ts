import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  customerId: string;
  startDate: string;
  endDate: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { customerId, startDate, endDate }: RequestBody = await req.json();

    // Get waste collections data for the period
    const { data: collections, error: collectionsError } = await supabaseClient
      .from('waste_collections')
      .select(`
        *,
        waste_items(*)
      `)
      .eq('customer_id', customerId)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .eq('status', 'completed');

    if (collectionsError) {
      throw collectionsError;
    }

    // Calculate environmental metrics
    let totalWaste = 0;
    let recycledWaste = 0;
    let compostedWaste = 0;
    let carbonFootprint = 0;

    collections?.forEach(collection => {
      totalWaste += collection.weight_kg || 0;
      
      collection.waste_items?.forEach((item: any) => {
        if (item.recyclable) {
          recycledWaste += item.weight_kg || 0;
        }
        if (item.waste_type === 'organic') {
          compostedWaste += item.weight_kg || 0;
        }
        carbonFootprint += item.carbon_footprint_kg || 0;
      });
    });

    const landfillWaste = totalWaste - recycledWaste - compostedWaste;
    const recyclingRate = totalWaste > 0 ? (recycledWaste / totalWaste) * 100 : 0;
    const carbonSaved = recycledWaste * 0.3; // Estimated carbon saved through recycling

    // Generate AI recommendations
    const recommendations = [];
    
    if (recyclingRate < 30) {
      recommendations.push('Increase recycling rate by properly segregating waste materials');
    }
    
    if (carbonFootprint > 100) {
      recommendations.push('Consider composting organic waste to reduce carbon emissions');
    }
    
    if (totalWaste > 50) {
      recommendations.push('Implement waste reduction strategies to minimize overall waste generation');
    }

    // Create environmental report
    const { data: report, error: reportError } = await supabaseClient
      .from('environmental_reports')
      .insert({
        customer_id: customerId,
        report_period_start: startDate,
        report_period_end: endDate,
        total_waste_kg: totalWaste,
        recycled_waste_kg: recycledWaste,
        composted_waste_kg: compostedWaste,
        landfill_waste_kg: landfillWaste,
        carbon_footprint_kg: carbonFootprint,
        carbon_saved_kg: carbonSaved,
        recycling_rate: recyclingRate,
        recommendations
      })
      .select()
      .single();

    if (reportError) {
      throw reportError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        report,
        metrics: {
          totalWaste,
          recycledWaste,
          compostedWaste,
          landfillWaste,
          recyclingRate,
          carbonFootprint,
          carbonSaved
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating environmental report:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate environmental report'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});