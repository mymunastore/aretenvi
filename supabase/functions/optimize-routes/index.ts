import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RouteOptimizationRequest {
  routeId: string;
  customerLocations: Array<{
    customerId: string;
    latitude: number;
    longitude: number;
    address: string;
  }>;
}

// Simple route optimization algorithm (Nearest Neighbor)
const optimizeRoute = (locations: any[], startPoint = { lat: 5.0378, lng: 7.9085 }) => {
  if (locations.length <= 1) return locations;

  const optimized = [];
  const unvisited = [...locations];
  let current = startPoint;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    // Find nearest unvisited location
    unvisited.forEach((location, index) => {
      const distance = calculateDistance(
        current.lat || current.latitude,
        current.lng || current.longitude,
        location.latitude,
        location.longitude
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    // Move nearest location to optimized route
    const nearest = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(nearest);
    current = nearest;
  }

  return optimized;
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate total route distance
const calculateTotalDistance = (locations: any[]): number => {
  if (locations.length <= 1) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < locations.length - 1; i++) {
    totalDistance += calculateDistance(
      locations[i].latitude,
      locations[i].longitude,
      locations[i + 1].latitude,
      locations[i + 1].longitude
    );
  }
  return totalDistance;
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

    const { routeId, customerLocations }: RouteOptimizationRequest = await req.json();

    // Get current route data
    const { data: currentRoute, error: routeError } = await supabaseClient
      .from('collection_routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (routeError) {
      throw routeError;
    }

    // Calculate original distance
    const originalDistance = currentRoute.route_distance_km || 0;
    
    // Optimize the route
    const optimizedLocations = optimizeRoute(customerLocations);
    const optimizedDistance = calculateTotalDistance(optimizedLocations);
    
    // Calculate savings
    const distanceSaved = Math.max(0, originalDistance - optimizedDistance);
    const timeSaved = distanceSaved * 2; // Assume 2 minutes saved per km
    const fuelSaved = distanceSaved * 0.3; // Assume 0.3L fuel per km
    const carbonReduced = fuelSaved * 2.31; // 2.31 kg CO2 per liter of diesel
    const costSavings = fuelSaved * 800; // ₦800 per liter

    // Store optimization results
    const { data: optimization, error: optimizationError } = await supabaseClient
      .from('route_optimizations')
      .insert({
        route_id: routeId,
        original_distance_km: originalDistance,
        optimized_distance_km: optimizedDistance,
        distance_saved_km: distanceSaved,
        original_duration: currentRoute.estimated_duration,
        optimized_duration: `${Math.max(60, (currentRoute.estimated_duration?.hours || 4) * 60 - timeSaved)} minutes`,
        time_saved: `${timeSaved} minutes`,
        fuel_saved_liters: fuelSaved,
        carbon_reduced_kg: carbonReduced,
        cost_savings: costSavings,
        optimization_algorithm: 'nearest_neighbor',
        confidence_score: 0.85
      })
      .select()
      .single();

    if (optimizationError) {
      throw optimizationError;
    }

    // Update route with optimized order
    await supabaseClient
      .from('collection_routes')
      .update({
        optimized_order: optimizedLocations,
        route_distance_km: optimizedDistance,
        updated_at: new Date().toISOString()
      })
      .eq('id', routeId);

    return new Response(
      JSON.stringify({
        success: true,
        optimization,
        optimizedRoute: optimizedLocations,
        savings: {
          distance: distanceSaved,
          time: timeSaved,
          fuel: fuelSaved,
          carbon: carbonReduced,
          cost: costSavings
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error optimizing route:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to optimize route'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});